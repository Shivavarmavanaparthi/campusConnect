import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 48;
const MAX_W = PAGE_W - MARGIN * 2;
const ACCENT = rgb(0.055, 0.431, 0.333); // ~ #0e6e55

function wrapLine(font, text, size, maxW) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) <= maxW) {
      cur = next;
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

function drawParagraph(page, font, text, size, x, y, maxW, lineGap) {
  const lines = wrapLine(font, text, size, maxW);
  let cy = y;
  for (const line of lines) {
    page.drawText(line, { x, y: cy, size, font, color: rgb(0.15, 0.15, 0.15) });
    cy -= lineGap;
  }
  return cy;
}

function drawBullets(page, font, bullets, size, x, y, maxW, lineGap) {
  let cy = y;
  for (const b of bullets) {
    const lines = wrapLine(font, `– ${b}`, size, maxW - 12);
    let first = true;
    for (const line of lines) {
      page.drawText(line, {
        x: first ? x : x + 10,
        y: cy,
        size,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      cy -= lineGap;
      first = false;
    }
    cy -= 2;
  }
  return cy;
}

/**
 * Plain PDF resume (no LaTeX). Same fields as buildResumeTex input.
 * @param {object} data — sanitized resume payload
 * @returns {Promise<Uint8Array>}
 */
export async function buildResumePdfLib(data) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const titleSize = 22;
  const name = data.fullName || "Resume";
  const tw = fontBold.widthOfTextAtSize(name, titleSize);
  page.drawText(name, {
    x: (PAGE_W - tw) / 2,
    y,
    size: titleSize,
    font: fontBold,
    color: ACCENT,
  });
  y -= titleSize + 8;

  const contactBits = [];
  if (data.phone) contactBits.push(data.phone);
  if (data.email) contactBits.push(data.email);
  if (data.linkedinDisplay || data.linkedinUrl) {
    contactBits.push(data.linkedinDisplay || data.linkedinUrl);
  }
  if (data.githubDisplay || data.githubUrl) {
    contactBits.push(data.githubDisplay || data.githubUrl);
  }
  const contact = contactBits.join("  |  ");
  if (contact) {
    y = drawParagraph(page, font, contact, 9, MARGIN, y, MAX_W, 11);
    y -= 6;
  }

  y -= 4;
  page.drawText("Summary", { x: MARGIN, y, size: 12, font: fontBold, color: ACCENT });
  y -= 16;
  y = drawParagraph(page, font, data.summary || "", 10, MARGIN, y, MAX_W, 13);
  y -= 10;

  const ensureSpace = (need) => {
    if (y < MARGIN + need) {
      page = doc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }
  };

  ensureSpace(80);
  page.drawText("Skills", { x: MARGIN, y, size: 12, font: fontBold, color: ACCENT });
  y -= 16;
  for (const s of data.skills || []) {
    const line = `${s.category ? `${s.category}: ` : ""}${s.items || ""}`.trim();
    if (!line) continue;
    ensureSpace(40);
    y = drawParagraph(page, font, line, 10, MARGIN, y, MAX_W, 13);
    y -= 4;
  }
  y -= 8;

  ensureSpace(80);
  page.drawText("Experience", { x: MARGIN, y, size: 12, font: fontBold, color: ACCENT });
  y -= 16;

  for (const job of data.experience || []) {
    const head = [job.company, job.dateRange].filter(Boolean).join("  —  ");
    const role = job.role || "";
    if (head) {
      ensureSpace(24);
      page.drawText(head, { x: MARGIN, y, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      y -= 14;
    }
    if (role) {
      ensureSpace(20);
      page.drawText(role, { x: MARGIN, y, size: 10, font: font, color: rgb(0.25, 0.25, 0.25) });
      y -= 13;
    }
    for (const sec of job.sections || []) {
      if (sec.heading) {
        ensureSpace(20);
        y = drawParagraph(page, fontBold, sec.heading, 10, MARGIN, y, MAX_W, 13);
        y -= 2;
      }
      const bullets = sec.bullets || [];
      if (bullets.length) {
        ensureSpace(20 + bullets.length * 14);
        y = drawBullets(page, font, bullets, 10, MARGIN, y, MAX_W, 13);
      }
    }
    if ((!job.sections || !job.sections.length) && job.bullets?.length) {
      ensureSpace(20 + job.bullets.length * 14);
      y = drawBullets(page, font, job.bullets, 10, MARGIN, y, MAX_W, 13);
    }
    y -= 8;
  }

  ensureSpace(80);
  page.drawText("Education", { x: MARGIN, y, size: 12, font: fontBold, color: ACCENT });
  y -= 16;
  const edu = data.education || {};
  if (edu.school) {
    y = drawParagraph(page, fontBold, edu.school, 11, MARGIN, y, MAX_W, 14);
  }
  if (edu.degree) {
    y = drawParagraph(page, font, edu.degree, 10, MARGIN, y, MAX_W, 13);
  }
  if (edu.minors) {
    y = drawParagraph(page, font, edu.minors, 10, MARGIN, y, MAX_W, 13);
  }
  y -= 6;

  if ((data.certifications || []).length) {
    ensureSpace(60);
    page.drawText("Certifications", { x: MARGIN, y, size: 12, font: fontBold, color: ACCENT });
    y -= 16;
    for (const c of data.certifications) {
      const line = typeof c === "string" ? c : c?.line;
      if (!line) continue;
      ensureSpace(30);
      y = drawParagraph(page, font, `• ${line}`, 10, MARGIN, y, MAX_W, 13);
    }
    y -= 6;
  }

  if ((data.projects || []).length) {
    ensureSpace(80);
    page.drawText("Projects", { x: MARGIN, y, size: 12, font: fontBold, color: ACCENT });
    y -= 16;
    for (const p of data.projects) {
      const h = [p.title, p.dateRange].filter(Boolean).join("  —  ");
      if (h) {
        ensureSpace(24);
        page.drawText(h, { x: MARGIN, y, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
        y -= 14;
      }
      if (p.bullets?.length) {
        ensureSpace(20 + p.bullets.length * 14);
        y = drawBullets(page, font, p.bullets, 10, MARGIN, y, MAX_W, 13);
      }
      y -= 6;
    }
  }

  const bytes = await doc.save();
  return bytes;
}
