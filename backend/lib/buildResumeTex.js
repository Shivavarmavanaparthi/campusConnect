import { escapeHrefUrl, escapeLatex } from "./latexEscape.js";

function joinContactParts(parts) {
  const filtered = parts.filter(Boolean);
  if (filtered.length === 0) return "";
  return filtered.join(" ~ | ~ ");
}

function buildContactLine(data) {
  const e = escapeLatex;
  const h = escapeHrefUrl;
  const parts = [];

  const phone = (data.phone || "").trim();
  const telHref = (data.phoneTel || phone).replace(/\s+/g, "");
  if (phone) {
    parts.push(
      `\\href{tel:${h(telHref)}}{\\raisebox{-0.05\\height} \\faPhone\\ ${e(phone)}}`
    );
  }

  const email = (data.email || "").trim();
  if (email) {
    parts.push(
      `\\href{mailto:${h(email)}}{\\raisebox{-0.15\\height} \\faEnvelope\\ ${e(email)}}`
    );
  }

  const linkedin = (data.linkedinUrl || "").trim();
  if (linkedin) {
    const display = (data.linkedinDisplay || linkedin.replace(/^https?:\/\//i, "")).trim();
    parts.push(
      `\\href{${h(linkedin)}}{\\raisebox{-0.15\\height} \\faLinkedin\\ ${e(display)}}`
    );
  }

  const github = (data.githubUrl || "").trim();
  if (github) {
    const display = (data.githubDisplay || github.replace(/^https?:\/\//i, "")).trim();
    parts.push(
      `\\href{${h(github)}}{\\raisebox{-0.15\\height} \\faGithub\\ ${e(display)}}`
    );
  }

  return joinContactParts(parts);
}

function skillsBlock(skills) {
  if (!Array.isArray(skills) || skills.length === 0) {
    return "\\begin{multicols}{2}\\begin{itemize}[itemsep=-2px, parsep=1pt, leftmargin=75pt]\n\\item Add skills in the form.\n\\end{itemize}\\end{multicols}";
  }
  const rows = skills
    .filter((s) => s && (s.category || s.items))
    .map((s) => {
      const cat = escapeLatex(s.category || "Skills");
      const items = escapeLatex(s.items || "");
      return `      \\item[\\textbf{${cat}}] ${items}`;
    });
  if (rows.length === 0) {
    return "\\begin{multicols}{2}\\begin{itemize}[itemsep=-2px, parsep=1pt, leftmargin=75pt]\n\\item Add skills in the form.\n\\end{itemize}\\end{multicols}";
  }
  return `\\begin{multicols}{2}
    \\begin{itemize}[itemsep=-2px, parsep=1pt, leftmargin=75pt]
${rows.join("\n")}
    \\end{itemize}
  \\end{multicols}`;
}

function experienceBlock(experience) {
  if (!Array.isArray(experience) || experience.length === 0) {
    return "% (no experience)";
  }
  const chunks = [];
  for (const job of experience) {
    if (!job) continue;
    const company = escapeLatex(job.company || "");
    const dates = escapeLatex(job.dateRange || "");
    const role = escapeLatex(job.role || "");
    chunks.push(`  \\headingBf{${company}}{${dates}}`);
    chunks.push(`  \\headingIt{${role}}{}`);
    chunks.push(`  \\begin{resume_list}`);
    const sections = Array.isArray(job.sections) ? job.sections : [];
    if (sections.length === 0 && Array.isArray(job.bullets) && job.bullets.length) {
      for (const b of job.bullets) {
        if (b && String(b).trim()) chunks.push(`    \\item ${escapeLatex(String(b).trim())}`);
      }
    } else {
      const secList = sections.filter(Boolean);
      secList.forEach((sec, idx) => {
        const title = (sec.heading || "").trim();
        const bullets = Array.isArray(sec.bullets) ? sec.bullets : [];
        if (title) {
          chunks.push(`    \\itemTitle{${escapeLatex(title)}}`);
        }
        for (const b of bullets) {
          if (b && String(b).trim()) {
            chunks.push(`    \\item ${escapeLatex(String(b).trim())}`);
          }
        }
        const isLast = idx === secList.length - 1;
        if (!isLast && (title || bullets.length)) chunks.push(`    \\vspace{3pt}`);
      });
    }
    chunks.push(`  \\end{resume_list}`);
    chunks.push("");
  }
  return chunks.join("\n");
}

function educationBlock(edu, certs) {
  const school = escapeLatex(edu?.school || "");
  const degree = escapeLatex(edu?.degree || "");
  const minors = escapeLatex(edu?.minors || "");
  const certItems = Array.isArray(certs)
    ? certs
        .map((c) => (typeof c === "string" ? c : c?.line))
        .filter(Boolean)
        .map((line) => `    \\item ${escapeLatex(String(line).trim())}`)
        .join("\n")
    : "";
  const certSection =
    certItems.length > 0
      ? `
  \\vspace{5pt}
  \\headingBf{Certifications}{}
  \\begin{resume_list}
${certItems}
  \\end{resume_list}`
      : "";
  return `  \\headingBf{${school}}{}
  \\headingIt{${degree}}{}
  \\headingIt{${minors}}{}
${certSection}`;
}

function projectsBlock(projects) {
  if (!Array.isArray(projects) || projects.length === 0) {
    return "% (no projects)";
  }
  const out = [];
  for (const p of projects) {
    if (!p) continue;
    const title = escapeLatex(p.title || "");
    const dr = escapeLatex(p.dateRange || "");
    out.push(`  \\headingBf{${title}}{${dr}}`);
    out.push(`  \\begin{resume_list}`);
    const bullets = Array.isArray(p.bullets) ? p.bullets : [];
    for (const b of bullets) {
      if (b && String(b).trim()) out.push(`    \\item ${escapeLatex(String(b).trim())}`);
    }
    out.push(`  \\end{resume_list}`);
    out.push("");
  }
  return out.join("\n");
}

/**
 * @param {object} data — validated resume payload
 * @returns {string} full .tex document
 */
export function buildResumeTex(data) {
  const name = escapeLatex(data.fullName || "Your Name");
  const contact = buildContactLine(data);
  const summary = escapeLatex((data.summary || "").trim() || "Professional summary.");

  const body = `\\documentclass[letterpaper,10pt]{article}
\\usepackage{mteck}

\\begin{document}

  \\documentTitle{${name}}{
    ${contact}
  }

  \\tinysection{Summary}
  ${summary}

  \\section{Skills}

${skillsBlock(data.skills)}

  \\section{Experience}

${experienceBlock(data.experience)}

  \\section{Education}

${educationBlock(data.education, data.certifications)}

  \\section{Projects}

${projectsBlock(data.projects)}

\\end{document}
`;

  return body;
}
