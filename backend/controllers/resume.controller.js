import { buildResumeTex } from "../lib/buildResumeTex.js";
import { compileResumePdf } from "../lib/compileResumePdf.js";
import { buildResumePdfLib } from "../lib/buildResumePdfLib.js";

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function sanitizePayload(body) {
  if (!body || typeof body !== "object") return null;

  const fullName = isNonEmptyString(body.fullName) ? body.fullName.trim() : "";
  if (!fullName) return { error: "fullName is required." };

  // Allow custom styling to pass through
  const accentColor = isNonEmptyString(body.accentColor) ? body.accentColor.trim() : "#0e6e55";
  const lineStyle = isNonEmptyString(body.lineStyle) ? body.lineStyle.trim() : "solid";

  const skills = Array.isArray(body.skills)
    ? body.skills
        .filter((s) => s && typeof s === "object")
        .map((s) => ({
          category: String(s.category || "").trim(),
          items: String(s.items || "").trim(),
        }))
        .filter((s) => s.category || s.items)
    : [];

  const experience = Array.isArray(body.experience)
    ? body.experience
        .filter((j) => j && typeof j === "object")
        .map((j) => {
          const sections = Array.isArray(j.sections)
            ? j.sections
                .filter((sec) => sec && typeof sec === "object")
                .map((sec) => ({
                  heading: String(sec.heading || "").trim(),
                  bullets: Array.isArray(sec.bullets)
                    ? sec.bullets.map((b) => String(b || "").trim()).filter(Boolean)
                    : [],
                }))
                .filter((sec) => sec.heading || sec.bullets.length)
            : [];
          const flatBullets = Array.isArray(j.bullets)
            ? j.bullets.map((b) => String(b || "").trim()).filter(Boolean)
            : [];
          return {
            company: String(j.company || "").trim(),
            dateRange: String(j.dateRange || "").trim(),
            role: String(j.role || "").trim(),
            sections,
            bullets: flatBullets,
          };
        })
        .filter((j) => j.company || j.role || j.sections.length || j.bullets.length)
    : [];

  const education = body.education && typeof body.education === "object"
    ? {
        school: String(body.education.school || "").trim(),
        degree: String(body.education.degree || "").trim(),
        minors: String(body.education.minors || "").trim(),
      }
    : { school: "", degree: "", minors: "" };

  const certifications = Array.isArray(body.certifications)
    ? body.certifications
        .map((c) =>
          typeof c === "string"
            ? { line: c.trim() }
            : { line: String(c?.line || "").trim() }
        )
        .filter((c) => c.line)
    : [];

  const projects = Array.isArray(body.projects)
    ? body.projects
        .filter((p) => p && typeof p === "object")
        .map((p) => ({
          title: String(p.title || "").trim(),
          dateRange: String(p.dateRange || "").trim(),
          bullets: Array.isArray(p.bullets)
            ? p.bullets.map((b) => String(b || "").trim()).filter(Boolean)
            : [],
        }))
        .filter((p) => p.title || p.bullets.length)
    : [];

  return {
    data: {
      fullName,
      accentColor,
      lineStyle,
      phone: String(body.phone || "").trim(),
      phoneTel: String(body.phoneTel || "").trim(),
      email: String(body.email || "").trim(),
      linkedinUrl: String(body.linkedinUrl || "").trim(),
      linkedinDisplay: String(body.linkedinDisplay || "").trim(),
      githubUrl: String(body.githubUrl || "").trim(),
      githubDisplay: String(body.githubDisplay || "").trim(),
      summary: String(body.summary || "").trim(),
      skills,
      experience,
      education,
      certifications,
      projects,
    },
  };
}

export const generateResumePdf = async (req, res) => {
  try {
    const parsed = sanitizePayload(req.body);
    if (parsed?.error) {
      return res.status(400).json({ message: parsed.error });
    }

    // Now uses accentColor and lineStyle within buildResumeTex
    const tex = buildResumeTex(parsed.data);
    
    const safeName = String(parsed.data.fullName || "resume")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80) || "resume";

    let pdf;
    try {
      // Main LaTeX compilation
      pdf = await compileResumePdf(tex);
      res.setHeader("X-Resume-Pdf-Source", "latex");
    } catch (err) {
      if (err.code !== "LATEX_FAILED") throw err;
      
      const allowFallback = process.env.RESUME_PDFLIB_FALLBACK !== "false";
      if (!allowFallback) {
        console.error("[resume] LaTeX failed (fallback disabled)\n", err.logTail);
        return res.status(503).json({
          message:
            err.message ||
            "Could not compile PDF. LaTeX engine not found.",
          detail: err.logTail?.slice?.(-1500) || "",
        });
      }

      console.warn("[resume] LaTeX unavailable; falling back to pdf-lib.");
      try {
        // Fallback now correctly receives accentColor and lineStyle in parsed.data
        const bytes = await buildResumePdfLib(parsed.data);
        pdf = Buffer.from(bytes);
        res.setHeader("X-Resume-Pdf-Source", "pdf-lib");
      } catch (fallbackErr) {
        console.error("[resume] pdf-lib fallback failed", fallbackErr);
        return res.status(503).json({
          message: "Could not generate PDF with fallback library.",
          detail: String(fallbackErr?.message || fallbackErr),
        });
      }
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}.pdf"`);
    return res.status(200).send(pdf);
  } catch (err) {
    console.error("[resume]", err);
    return res.status(500).json({ message: "Failed to generate resume PDF." });
  }
};