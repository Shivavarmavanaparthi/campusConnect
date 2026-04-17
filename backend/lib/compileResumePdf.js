import { copyFile, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { tmpdir } from "os";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STYLE_SRC = join(__dirname, "../templates/resume/mteck.sty");

/**
 * Paths to try when `pdflatex` is not on PATH (typical Windows installs).
 */
function getPdflatexCandidates() {
  const list = [];
  const explicit = process.env.PDFLATEX_PATH?.trim();
  if (explicit) list.push(explicit);

  // Resolve `pdflatex` from PATH (helps when MiKTeX is installed but Node was started without that PATH).
  if (process.platform === "win32") {
    const w = spawnSync("where.exe", ["pdflatex"], {
      encoding: "utf8",
      windowsHide: true,
      shell: false,
    });
    if (w.status === 0 && w.stdout) {
      const first = w.stdout
        .split(/\r?\n/)
        .map((s) => s.trim())
        .find((line) => line && !line.startsWith("INFO:"));
      if (first && existsSync(first)) list.push(first);
    }
  }

  if (process.platform === "win32") {
    const local = process.env.LOCALAPPDATA;
    const pf = process.env.ProgramFiles;
    const pf86 = process.env["ProgramFiles(x86)"];
    const appData = process.env.APPDATA;

    const miktexPaths = [];
    if (local) {
      miktexPaths.push(
        join(local, "Programs", "MiKTeX", "miktex", "bin", "x64", "pdflatex.exe"),
        join(local, "Programs", "MiKTeX", "miktex", "bin", "pdflatex.exe")
      );
    }
    if (appData) {
      miktexPaths.push(
        join(appData, "MiKTeX", "miktex", "bin", "x64", "pdflatex.exe"),
        join(appData, "MiKTeX", "miktex", "bin", "pdflatex.exe")
      );
    }
    if (pf) {
      miktexPaths.push(
        join(pf, "MiKTeX", "miktex", "bin", "x64", "pdflatex.exe"),
        join(pf, "MiKTeX", "miktex", "bin", "pdflatex.exe")
      );
    }
    if (pf86) {
      miktexPaths.push(join(pf86, "MiKTeX", "miktex", "bin", "x64", "pdflatex.exe"));
    }

    list.push(...miktexPaths);

    // TeX Live (year varies)
    for (const year of ["2025", "2024", "2023"]) {
      list.push(join(`C:\\texlive\\${year}\\bin\\windows\\pdflatex.exe`));
    }
    const tlRoot = process.env.TEXLIVE_ROOT;
    if (tlRoot) {
      list.push(join(tlRoot, "bin", "windows", "pdflatex.exe"));
    }
  }

  list.push("pdflatex");

  const seen = new Set();
  return list.filter((p) => {
    if (!p || seen.has(p)) return false;
    seen.add(p);
    return true;
  });
}

function shouldTryCandidate(bin) {
  if (bin === "pdflatex" || bin === "pdflatex.exe") return true;
  return existsSync(bin);
}

function runPdflatex(cwd) {
  const args = ["-interaction=nonstopmode", "-halt-on-error", "resume.tex"];
  const candidates = getPdflatexCandidates();
  let lastENOENT = null;

  for (const bin of candidates) {
    if (!shouldTryCandidate(bin)) continue;

    const r1 = spawnSync(bin, args, {
      cwd,
      encoding: "utf8",
      shell: false,
      windowsHide: true,
    });

    if (r1.error) {
      if (r1.error.code === "ENOENT") {
        lastENOENT = r1.error;
        continue;
      }
      return { ok: false, error: r1.error, log: r1.stderr || String(r1.error), tried: bin };
    }

    if (r1.status !== 0) {
      return {
        ok: false,
        log: (r1.stdout || "") + (r1.stderr || ""),
        tried: bin,
      };
    }

    const r2 = spawnSync(bin, args, {
      cwd,
      encoding: "utf8",
      shell: false,
      windowsHide: true,
    });

    if (r2.error) {
      return { ok: false, error: r2.error, log: r2.stderr || String(r2.error), tried: bin };
    }
    if (r2.status !== 0) {
      return {
        ok: false,
        log: (r2.stdout || "") + (r2.stderr || ""),
        tried: bin,
      };
    }

    return { ok: true, tried: bin };
  }

  const err = new Error("pdflatex not found");
  err.code = "ENOENT";
  err.cause = lastENOENT;
  return { ok: false, error: err, log: "", tried: null };
}

/**
 * @param {string} tex — full LaTeX source
 * @returns {Promise<Buffer>}
 */
export async function compileResumePdf(tex) {
  const dir = await mkdtemp(join(tmpdir(), "resume-pdf-"));
  try {
    await copyFile(STYLE_SRC, join(dir, "mteck.sty"));
    await writeFile(join(dir, "resume.tex"), tex, "utf8");

    const result = runPdflatex(dir);
    const pdfPath = join(dir, "resume.pdf");
    if (!result.ok || !existsSync(pdfPath)) {
      let hint;
      if (result.error?.code === "ENOENT" || result.error?.message === "pdflatex not found") {
        hint =
          "No LaTeX engine found. Install MiKTeX (https://miktex.org/download) for Windows, open MiKTeX Console once so packages can install, then restart the backend. Optional: set PDFLATEX_PATH in backend/.env to the full path of pdflatex.exe (e.g. C:\\Users\\You\\AppData\\Local\\Programs\\MiKTeX\\miktex\\bin\\x64\\pdflatex.exe).";
      } else {
        hint =
          "LaTeX reported an error (missing package or syntax). See detail below. If packages are missing, open MiKTeX and install on-the-fly packages, or use MiKTeX Console → Packages.";
      }
      const logPath = join(dir, "resume.log");
      let logTail = "";
      try {
        const log = await readFile(logPath, "utf8");
        logTail = log.slice(-4000);
      } catch {
        logTail = result.log || "";
      }
      const err = new Error(`PDF build failed. ${hint}`);
      err.code = "LATEX_FAILED";
      err.logTail = logTail;
      err.usedBinary = result.tried;
      throw err;
    }

    const buf = await readFile(pdfPath);
    return buf;
  } finally {
    try {
      await rm(dir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}