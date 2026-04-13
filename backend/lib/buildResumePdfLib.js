import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 56;
const MAX_W = PAGE_W - MARGIN * 2;
const ACCENT_COLOR = rgb(0.055, 0.431, 0.333);

// Spacing Constants
const BODY_SIZE = 10;
const LINE_HEIGHT = 1.45; 
const SECTION_GAP = 18;   
const ENTRY_GAP = 12;     
const BULLET_GAP = 3;     

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : null;
}

/**
 * Enhanced drawLink with strict URI formatting
 */
function drawLink(page, text, x, y, size, font, color, url) {
  page.drawText(text, { x, y, size, font, color });
  const width = font.widthOfTextAtSize(text, size);
  
  let finalUrl = String(url || "").trim();
  
  // Logic to ensure the protocol is correct
  if (finalUrl.includes('@') && !finalUrl.toLowerCase().startsWith('mailto:')) {
    finalUrl = `mailto:${finalUrl}`;
  } else if (!finalUrl.toLowerCase().startsWith('http') && !finalUrl.toLowerCase().startsWith('mailto:')) {
    finalUrl = `https://${finalUrl}`;
  }

  const rect = [x - 1, y - 2, x + width + 1, y + size + 1];

  const linkAnnotation = page.doc.context.register(
    page.doc.context.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: rect,
      Border: [0, 0, 0],
      A: {
        Type: 'Action',
        S: 'URI',
        URI: finalUrl,
      },
    })
  );

  const annots = page.node.get(page.doc.context.obj('Annots')) || page.doc.context.obj([]);
  annots.push(linkAnnotation);
  page.node.set(page.doc.context.obj('Annots'), annots);
}

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

function drawText(page, text, x, y, size, font, color, maxWidth) {
  const lineGap = size * LINE_HEIGHT;
  if (maxWidth) {
    const lines = wrapLine(font, text, size, maxWidth);
    let cy = y;
    for (const line of lines) {
      page.drawText(line, { x, y: cy, size, font, color });
      cy -= lineGap;
    }
    return cy;
  }
  page.drawText(text, { x, y, size, font, color });
  return y - lineGap;
}

function drawHorizontalLine(page, y, startX, endX, thickness, color) {
  page.drawLine({
    start: { x: startX, y: y - thickness / 2 },
    end: { x: endX, y: y - thickness / 2 },
    thickness,
    color,
  });
}

export async function buildResumePdfLib(data) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await doc.embedFont(StandardFonts.HelveticaOblique);

  let accentColor = ACCENT_COLOR;
  if (data.accentColor) {
    const parsed = hexToRgb(data.accentColor);
    if (parsed) accentColor = rgb(parsed.r, parsed.g, parsed.b);
  }

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const ensureSpace = (need) => {
    if (y - need < MARGIN) {
      page = doc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }
  };

  const drawSectionHeader = (title) => {
    ensureSpace(50);
    const sectionSize = 13;
    page.drawText(title, { x: MARGIN, y, size: sectionSize, font: fontBold, color: accentColor });
    y -= 4;
    drawHorizontalLine(page, y, MARGIN, PAGE_W - MARGIN, 0.5, accentColor);
    y -= 12;
  };

  // ── Header ──
  const titleSize = 24;
  const name = data.fullName || "Resume";
  const nameWidth = fontBold.widthOfTextAtSize(name, titleSize);
  page.drawText(name, { x: (PAGE_W - nameWidth) / 2, y, size: titleSize, font: fontBold, color: accentColor });
  y -= (titleSize + 8);
  drawHorizontalLine(page, y, MARGIN, PAGE_W - MARGIN, 0.5, accentColor);
  y -= 10;

  // ── Contact Info ──
  const bits = [];
  if (data.phone) bits.push({ text: data.phone });
  if (data.email) bits.push({ text: data.email, url: data.email }); 
  if (data.linkedinDisplay || data.linkedinUrl) {
    bits.push({ text: data.linkedinDisplay || data.linkedinUrl, url: data.linkedinUrl || data.linkedinDisplay });
  }
  if (data.githubDisplay || data.githubUrl) {
    bits.push({ text: data.githubDisplay || data.githubUrl, url: data.githubUrl || data.githubDisplay });
  }

  if (bits.length > 0) {
    const contactSize = 9;
    const pipeWidth = font.widthOfTextAtSize("  |  ", contactSize);
    let totalW = 0;
    bits.forEach((b, i) => {
      totalW += font.widthOfTextAtSize(b.text, contactSize);
      if (i < bits.length - 1) totalW += pipeWidth;
    });

    let curX = (PAGE_W - totalW) / 2;
    bits.forEach((bit, i) => {
      if (bit.url) {
        drawLink(page, bit.text, curX, y, contactSize, font, rgb(0.2, 0.2, 0.2), bit.url);
      } else {
        page.drawText(bit.text, { x: curX, y, size: contactSize, font, color: rgb(0.2, 0.2, 0.2) });
      }
      curX += font.widthOfTextAtSize(bit.text, contactSize);
      if (i < bits.length - 1) {
        page.drawText("  |  ", { x: curX, y, size: contactSize, font, color: rgb(0.2, 0.2, 0.2) });
        curX += pipeWidth;
      }
    });
    y -= contactSize * LINE_HEIGHT;
  }

  y -= 4;
  drawHorizontalLine(page, y, MARGIN, PAGE_W - MARGIN, 0.5, accentColor);
  y -= SECTION_GAP;

  // ── Summary ──
  if (data.summary?.trim()) {
    drawSectionHeader("Summary");
    y = drawText(page, data.summary.trim(), MARGIN, y, BODY_SIZE, font, rgb(0.1, 0.1, 0.1), MAX_W);
    y -= SECTION_GAP;
  }

  // ── Experience ──
  if (data.experience?.length > 0) {
    drawSectionHeader("Experience");
    for (const job of data.experience) {
      if (!job.company && !job.role) continue;
      ensureSpace(60);
      page.drawText(job.company || "", { x: MARGIN, y, size: BODY_SIZE, font: fontBold });
      if (job.dateRange) {
        const dWidth = font.widthOfTextAtSize(job.dateRange, BODY_SIZE - 1);
        page.drawText(job.dateRange, { x: PAGE_W - MARGIN - dWidth, y, size: BODY_SIZE - 1, font });
      }
      y -= (BODY_SIZE * LINE_HEIGHT);
      if (job.role) {
        page.drawText(job.role, { x: MARGIN, y, size: BODY_SIZE, font: fontItalic, color: rgb(0.35, 0.35, 0.35) });
        y -= (BODY_SIZE * LINE_HEIGHT);
      }
      if (job.sections?.length > 0) {
        for (const sec of job.sections) {
          if (sec.heading) {
            ensureSpace(20);
            page.drawText(sec.heading, { x: MARGIN, y, size: BODY_SIZE, font: fontBold });
            const hWidth = fontBold.widthOfTextAtSize(sec.heading, BODY_SIZE);
            y -= 2;
            drawHorizontalLine(page, y, MARGIN, MARGIN + hWidth, 0.3, rgb(0.5, 0.5, 0.5));
            y -= (BODY_SIZE * LINE_HEIGHT);
          }
          if (sec.bullets) {
            for (const b of sec.bullets) {
              ensureSpace(15);
              y = drawText(page, `– ${b}`, MARGIN + 12, y, BODY_SIZE, font, rgb(0.2, 0.2, 0.2), MAX_W - 12);
              y -= BULLET_GAP;
            }
          }
        }
      } else if (job.bullets) {
        for (const b of job.bullets) {
          ensureSpace(15);
          y = drawText(page, `– ${b}`, MARGIN + 12, y, BODY_SIZE, font, rgb(0.2, 0.2, 0.2), MAX_W - 12);
          y -= BULLET_GAP;
        }
      }
      y -= ENTRY_GAP;
    }
  }

  // ── Education ──
  if (data.education?.school || data.education?.degree) {
    drawSectionHeader("Education");
    ensureSpace(50);
    if (data.education.school) {
      page.drawText(data.education.school, { x: MARGIN, y, size: BODY_SIZE + 1, font: fontBold });
      y -= (BODY_SIZE * LINE_HEIGHT);
    }
    if (data.education.degree) {
      page.drawText(data.education.degree, { x: MARGIN, y, size: BODY_SIZE, font: fontItalic });
      y -= (BODY_SIZE * LINE_HEIGHT);
    }
    if (data.education.minors) {
      page.drawText(data.education.minors, { x: MARGIN, y, size: BODY_SIZE, font: fontItalic });
      y -= (BODY_SIZE * LINE_HEIGHT);
    }
    y -= SECTION_GAP;
  }

  // ── Certifications ──
  if (data.certifications?.length > 0) {
    drawSectionHeader("Certifications");
    for (const c of data.certifications) {
      const line = typeof c === "string" ? c : c?.line;
      if (!line) continue;
      ensureSpace(15);
      page.drawText(`– ${line}`, { x: MARGIN + 12, y, size: BODY_SIZE, font, color: rgb(0.2, 0.2, 0.2) });
      y -= (BODY_SIZE * LINE_HEIGHT);
    }
    y -= SECTION_GAP;
  }

  // ── Projects ──
  if (data.projects?.length > 0) {
    drawSectionHeader("Projects");
    for (const p of data.projects) {
      ensureSpace(40);
      page.drawText(p.title || "", { x: MARGIN, y, size: BODY_SIZE, font: fontBold });
      if (p.dateRange) {
        const dWidth = font.widthOfTextAtSize(p.dateRange, BODY_SIZE - 1);
        page.drawText(p.dateRange, { x: PAGE_W - MARGIN - dWidth, y, size: BODY_SIZE - 1, font });
      }
      y -= (BODY_SIZE * LINE_HEIGHT);
      if (p.bullets) {
        for (const b of p.bullets) {
          ensureSpace(15);
          y = drawText(page, `– ${b}`, MARGIN + 12, y, BODY_SIZE, font, rgb(0.2, 0.2, 0.2), MAX_W - 12);
          y -= BULLET_GAP;
        }
      }
      y -= ENTRY_GAP;
    }
  }

  // ── Skills ──
  if (data.skills?.length > 0) {
    drawSectionHeader("Skills");
    for (const s of data.skills) {
      if (!s.category && !s.items) continue;
      ensureSpace(15);
      const skillLine = `${s.category ? `${s.category}: ` : ""}${s.items || ""}`;
      y = drawText(page, skillLine, MARGIN, y, BODY_SIZE, font, rgb(0.2, 0.2, 0.2), MAX_W);
      y -= BULLET_GAP;
    }
  }

  const bytes = await doc.save();
  return bytes;
}