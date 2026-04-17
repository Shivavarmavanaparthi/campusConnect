import { useState } from "react";
import { Download, FileUser, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { API } from "../lib/api";

const ACCENT_PRESETS = [
  { label: "Forest", value: "#0e6e55" },
  { label: "Blue", value: "#1d4ed8" },
  { label: "Purple", value: "#7c3aed" },
  { label: "Rose", value: "#be185d" },
  { label: "Amber", value: "#b45309" },
  { label: "Slate", value: "#374151" },
];

const defaultState = {
  fullName: "John Doe",
  phone: "123-456-7890",
  phoneTel: "1234567890",
  email: "user@domain.tld",
  linkedinUrl: "https://linkedin.com/in/USER/",
  linkedinDisplay: "linkedin.com/in/USER",
  githubUrl: "https://github.com/USER",
  githubDisplay: "github.com/USER",
  summary:
    "Concise summary of your strengths, years of experience, and what you are looking for next.",
  skills: [
    { category: "Automation", items: "SaltStack, Ansible, Chef, Puppet" },
    { category: "Cloud", items: "AWS, GCP, Linode" },
    { category: "Languages", items: "Python, Bash, JavaScript" },
    { category: "OS", items: "Debian, Ubuntu, Windows" },
  ],
  experience: [
    {
      company: "Example Corp",
      dateRange: "Jan 2020 -- Present",
      role: "Senior Engineer",
      sections: [
        {
          heading: "Client: Notable Project",
          bullets: [
            "Delivered key features that improved reliability and performance.",
            "Collaborated with cross-functional teams in an agile environment.",
          ],
        },
      ],
    },
  ],
  education: {
    school: "State University",
    degree: "Bachelor of Science in Computer Science",
    minors: "Mathematics",
  },
  certifications: [{ line: "Example — Professional Certification" }],
  projects: [
    {
      title: "Open Source / Side Project",
      dateRange: "2023 -- Present",
      bullets: [
        "Built and maintained a project used by others.",
        "Documented usage and contributed improvements.",
      ],
    },
  ],
};

// ─── Live Preview Component ───────────────────────────────────────────────────

function ResumePreview({ form, accentColor }) {
  const accent = accentColor || "#0e6e55";
  const accentLine = "#a16f0b"; // Matching LaTeX template's accentLine color

  const sectionStyle = {
    color: accent,
    fontSize: "14px",
    fontWeight: "700",
    marginTop: "14px",
    marginBottom: "4px",
  };

  const sectionRuleStyle = {
    height: "1px",
    backgroundColor: accentLine,
    marginTop: "2px",
    marginBottom: "8px",
  };

  const headingStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  };

  const companyNameStyle = {
    fontWeight: "700",
    fontSize: "11px",
  };

  const dateStyle = {
    fontSize: "10px",
    color: "#555",
  };

  const roleStyle = {
    fontStyle: "italic",
    fontSize: "10px",
    color: "#555",
    marginBottom: "4px",
  };

  const bulletStyle = {
    fontSize: "10px",
    color: "#333",
    paddingLeft: "14px",
    position: "relative",
  };

  return (
    <div
      style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "10px",
        lineHeight: "1.5",
        color: "#1a1a1a",
        padding: "48px 56px",
        background: "#fff",
        minHeight: "700px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div
          style={{
            color: accent,
            fontSize: "28px",
            fontWeight: "800",
            letterSpacing: "-0.01em",
            marginBottom: "10px",
          }}
        >
          {form.fullName || "Your Name"}
        </div>
        <div style={{ height: "1px", background: accentLine, marginBottom: "4px" }} />
        <div
          style={{
            fontSize: "9px",
            color: "#444",
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "4px",
          }}
        >
          {form.phone && <span>{form.phone}</span>}
          {form.email && <span>{form.email}</span>}
          {form.linkedinDisplay && <span>{form.linkedinDisplay}</span>}
          {form.githubDisplay && <span>{form.githubDisplay}</span>}
        </div>
        <div style={{ height: "1px", background: accentLine, marginTop: "4px" }} />
      </div>

      {/* ── Summary ── */}
      {form.summary && (
        <div style={{ marginBottom: "10px" }}>
          <span style={{ fontWeight: "700", color: accent, fontSize: "13px" }}>
            {form.summary}
          </span>
          <span style={{ color: accentLine, margin: "0 4px" }}>|</span>
        </div>
      )}

      {/* ── Skills ── */}
      {form.skills?.filter((s) => s.category || s.items).length > 0 && (
        <div>
          <div style={sectionStyle}>Skills</div>
          <div style={sectionRuleStyle} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2px 16px",
            }}
          >
            {form.skills
              .filter((s) => s.category || s.items)
              .map((s, i) => (
                <div key={i} style={{ fontSize: "10px" }}>
                  <span style={{ fontWeight: "700" }}>{s.category}: </span>
                  <span style={{ color: "#444" }}>{s.items}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── Experience ── */}
      {form.experience?.filter((j) => j.company || j.role).length > 0 && (
        <div>
          <div style={sectionStyle}>Experience</div>
          <div style={sectionRuleStyle} />
          {form.experience
            .filter((j) => j.company || j.role)
            .map((job, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                <div style={headingStyle}>
                  <span style={companyNameStyle}>{job.company}</span>
                  <span style={dateStyle}>{job.dateRange}</span>
                </div>
                {job.role && <div style={roleStyle}>{job.role}</div>}
                {job.sections?.map((sec, si) => (
                  <div key={si} style={{ marginBottom: "4px" }}>
                    {sec.heading && (
                      <div
                        style={{
                          textDecoration: "underline",
                          fontSize: "10px",
                          fontWeight: "600",
                          margin: "4px 0 2px",
                        }}
                      >
                        {sec.heading}
                      </div>
                    )}
                    {sec.bullets
                      ?.filter((b) => b.trim())
                      .map((b, bi) => (
                        <div key={bi} style={bulletStyle}>
                          – {b}
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            ))}
        </div>
      )}

      {/* ── Education ── */}
      {(form.education?.school || form.education?.degree) && (
        <div>
          <div style={sectionStyle}>Education</div>
          <div style={sectionRuleStyle} />
          {form.education.school && (
            <div style={{ fontWeight: "700", fontSize: "11px" }}>
              {form.education.school}
            </div>
          )}
          {form.education.degree && (
            <div style={{ fontStyle: "italic", fontSize: "10px", color: "#555" }}>
              {form.education.degree}
            </div>
          )}
          {form.education.minors && (
            <div style={{ fontStyle: "italic", fontSize: "10px", color: "#555" }}>
              {form.education.minors}
            </div>
          )}
          {form.certifications?.filter((c) => c.line).length > 0 && (
            <div style={{ marginTop: "6px" }}>
              <div
                style={{
                  fontWeight: "700",
                  fontSize: "10px",
                  marginBottom: "4px",
                  textDecoration: "underline",
                }}
              >
                Certifications
              </div>
              {form.certifications
                .filter((c) => c.line)
                .map((c, i) => (
                  <div
                    key={i}
                    style={{ fontSize: "10px", paddingLeft: "14px", color: "#333" }}
                  >
                    – {c.line}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ── Projects ── */}
      {form.projects?.filter((p) => p.title || p.bullets?.length).length > 0 && (
        <div>
          <div style={sectionStyle}>Projects</div>
          <div style={sectionRuleStyle} />
          {form.projects
            .filter((p) => p.title || p.bullets?.length)
            .map((p, i) => (
              <div key={i} style={{ marginBottom: "8px" }}>
                <div style={headingStyle}>
                  <span style={{ fontWeight: "700", fontSize: "11px" }}>{p.title}</span>
                  <span style={{ fontSize: "10px", color: "#555" }}>{p.dateRange}</span>
                </div>
                {p.bullets
                  ?.filter((b) => b.trim())
                  .map((b, bi) => (
                    <div key={bi} style={bulletStyle}>
                      – {b}
                    </div>
                  ))}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ResumeBuilder() {
  const [form, setForm] = useState(defaultState);
  const [accentColor, setAccentColor] = useState("#0e6e55");
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadNote, setDownloadNote] = useState("");

  const update = (path, value) => {
    setForm((prev) => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const addSkill = () =>
    setForm((p) => ({ ...p, skills: [...p.skills, { category: "", items: "" }] }));

  const removeSkill = (index) =>
    setForm((p) => ({ ...p, skills: p.skills.filter((_, i) => i !== index) }));

  const addJob = () =>
    setForm((p) => ({
      ...p,
      experience: [
        ...p.experience,
        { company: "", dateRange: "", role: "", sections: [{ heading: "", bullets: [""] }] },
      ],
    }));

  const removeJob = (index) =>
    setForm((p) => ({ ...p, experience: p.experience.filter((_, i) => i !== index) }));

  const addSection = (jobIndex) =>
    setForm((p) => {
      const next = structuredClone(p);
      next.experience[jobIndex].sections.push({ heading: "", bullets: [""] });
      return next;
    });

  const removeSection = (jobIndex, secIndex) =>
    setForm((p) => {
      const next = structuredClone(p);
      next.experience[jobIndex].sections = next.experience[jobIndex].sections.filter(
        (_, i) => i !== secIndex
      );
      return next;
    });

  const addBullet = (jobIndex, secIndex) =>
    setForm((p) => {
      const next = structuredClone(p);
      next.experience[jobIndex].sections[secIndex].bullets.push("");
      return next;
    });

  const removeBullet = (jobIndex, secIndex, bulletIndex) =>
    setForm((p) => {
      const next = structuredClone(p);
      next.experience[jobIndex].sections[secIndex].bullets = next.experience[
        jobIndex
      ].sections[secIndex].bullets.filter((_, i) => i !== bulletIndex);
      return next;
    });

  const addCert = () =>
    setForm((p) => ({ ...p, certifications: [...p.certifications, { line: "" }] }));

  const removeCert = (index) =>
    setForm((p) => ({ ...p, certifications: p.certifications.filter((_, i) => i !== index) }));

  const addProject = () =>
    setForm((p) => ({
      ...p,
      projects: [...p.projects, { title: "", dateRange: "", bullets: [""] }],
    }));

  const removeProject = (index) =>
    setForm((p) => ({ ...p, projects: p.projects.filter((_, i) => i !== index) }));

  const addProjectBullet = (pIndex) =>
    setForm((p) => {
      const next = structuredClone(p);
      next.projects[pIndex].bullets.push("");
      return next;
    });

  const removeProjectBullet = (pIndex, bIndex) =>
    setForm((p) => {
      const next = structuredClone(p);
      next.projects[pIndex].bullets = next.projects[pIndex].bullets.filter(
        (_, i) => i !== bIndex
      );
      return next;
    });

  const onDownload = async () => {
    setError("");
    setDownloadNote("");
    if (!form.fullName?.trim()) {
      setError("Please enter your full name.");
      return;
    }
    setLoading(true);
    try {
      const res = await API.post("/ai/resume/pdf", 
  { ...form, accentColor },
  {
    responseType: "blob",
    withCredentials: true, 
  }
);
      const blob = res.data;
      const ctype = res.headers["content-type"] || "";
      if (ctype.includes("application/json") || blob.type === "application/json") {
        const text = await blob.text();
        const j = JSON.parse(text);
        throw new Error(j.message || "Could not generate PDF.");
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${
        form.fullName.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-") || "resume"
      }.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      const src =
        res.headers["x-resume-pdf-source"] ||
        res.headers["X-Resume-Pdf-Source"] ||
        "";
      if (src === "pdf-lib") {
        setDownloadNote(
          "Downloaded a simplified PDF (no LaTeX on this server). Install MiKTeX or TeX Live and restart the backend for the full LaTeX template."
        );
      } else if (src === "latex") {
        setDownloadNote("Downloaded using the full LaTeX template.");
      }
    } catch (err) {
      let msg = err.response?.data?.message || err.message || "Something went wrong.";
      const data = err.response?.data;
      if (data instanceof Blob) {
        try {
          const text = await data.text();
          const j = JSON.parse(text);
          msg = j.message || j.detail || text.slice(0, 500);
        } catch {
          msg = "Could not generate PDF.";
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none ring-violet-500/20 focus:ring-2";

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6">
      {/* ── Page Header ── */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600">
          <FileUser className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Resume Builder
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600 sm:text-base">
          Fill in your details and download a professional PDF resume.
          If <code className="text-violet-700">pdflatex</code> is available on the server
          you get a polished LaTeX output — otherwise a clean fallback PDF is generated.
        </p>
      </div>

      {/* ── Color + Preview Toggle Bar ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-gray-600">Accent color</span>
          <div className="flex flex-wrap gap-2">
            {ACCENT_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                title={preset.label}
                onClick={() => setAccentColor(preset.value)}
                style={{ background: preset.value }}
                className={`h-6 w-6 rounded-full transition-transform hover:scale-110 ${
                  accentColor === preset.value
                    ? "scale-110 ring-2 ring-gray-400 ring-offset-2"
                    : ""
                }`}
              />
            ))}
            {/* custom color picker */}
            <label
              title="Custom color"
              className="relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-gray-300 hover:border-gray-400"
              style={
                !ACCENT_PRESETS.some((p) => p.value === accentColor)
                  ? { background: accentColor, borderColor: accentColor }
                  : {}
              }
            >
              <span className="text-[9px] text-gray-400 select-none">+</span>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </label>
          </div>
          {/* color swatch preview */}
          <div
            className="h-5 w-16 rounded-full"
            style={{ background: accentColor }}
            title={accentColor}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          {showPreview ? (
            <>
              <EyeOff className="h-3.5 w-3.5" /> Hide Preview
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" /> Live Preview
            </>
          )}
        </button>
      </div>

      {/* ── Side-by-Side Layout ── */}
      <div className={`gap-6 ${showPreview ? "grid lg:grid-cols-2" : ""}`}>
        {/* ── Form Column ── */}
        <div className={`rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-100 ${showPreview ? "" : "mx-auto max-w-3xl"} sm:p-8`}>

          {/* Contact & Summary */}
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Contact & summary</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-gray-600">Full name *</span>
              <input
                className={inputCls}
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-600">Phone (display)</span>
              <input
                className={inputCls}
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-600">
                Phone (tel: link, digits only)
              </span>
              <input
                className={inputCls}
                value={form.phoneTel}
                onChange={(e) => update("phoneTel", e.target.value)}
                placeholder="1234567890"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-gray-600">Email</span>
              <input
                type="email"
                className={inputCls}
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-gray-600">LinkedIn URL</span>
              <input
                className={inputCls}
                value={form.linkedinUrl}
                onChange={(e) => update("linkedinUrl", e.target.value)}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-gray-600">
                LinkedIn (short display label)
              </span>
              <input
                className={inputCls}
                value={form.linkedinDisplay}
                onChange={(e) => update("linkedinDisplay", e.target.value)}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-gray-600">GitHub URL</span>
              <input
                className={inputCls}
                value={form.githubUrl}
                onChange={(e) => update("githubUrl", e.target.value)}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-gray-600">
                GitHub (short display label)
              </span>
              <input
                className={inputCls}
                value={form.githubDisplay}
                onChange={(e) => update("githubDisplay", e.target.value)}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-medium text-gray-600">Summary</span>
              <textarea
                rows={4}
                className={inputCls}
                value={form.summary}
                onChange={(e) => update("summary", e.target.value)}
              />
            </label>
          </div>

          {/* Skills */}
          <h2 className="mb-4 mt-10 text-lg font-semibold text-gray-900">Skills</h2>
          <div className="space-y-3">
            {form.skills.map((s, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-xl border border-gray-100 p-3 sm:flex-row sm:items-end"
              >
                <label className="min-w-0 flex-1">
                  <span className="mb-1 block text-xs font-medium text-gray-600">Category</span>
                  <input
                    className={inputCls}
                    value={s.category}
                    onChange={(e) => {
                      const next = [...form.skills];
                      next[i] = { ...next[i], category: e.target.value };
                      setForm({ ...form, skills: next });
                    }}
                  />
                </label>
                <label className="min-w-0 flex-2">
                  <span className="mb-1 block text-xs font-medium text-gray-600">
                    Items (comma-separated)
                  </span>
                  <input
                    className={inputCls}
                    value={s.items}
                    onChange={(e) => {
                      const next = [...form.skills];
                      next[i] = { ...next[i], items: e.target.value };
                      setForm({ ...form, skills: next });
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeSkill(i)}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
                  aria-label="Remove skill row"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSkill}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" /> Add skill row
            </button>
          </div>

          {/* Experience */}
          <h2 className="mb-4 mt-10 text-lg font-semibold text-gray-900">Experience</h2>
          <div className="space-y-8">
            {form.experience.map((job, ji) => (
              <div
                key={ji}
                className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4"
              >
                <div className="mb-4 grid gap-3 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs font-medium text-gray-600">Company</span>
                    <input
                      className={inputCls}
                      value={job.company}
                      onChange={(e) => {
                        const next = structuredClone(form.experience);
                        next[ji].company = e.target.value;
                        setForm({ ...form, experience: next });
                      }}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">Dates</span>
                    <input
                      className={inputCls}
                      value={job.dateRange}
                      onChange={(e) => {
                        const next = structuredClone(form.experience);
                        next[ji].dateRange = e.target.value;
                        setForm({ ...form, experience: next });
                      }}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs font-medium text-gray-600">
                      Role / title
                    </span>
                    <input
                      className={inputCls}
                      value={job.role}
                      onChange={(e) => {
                        const next = structuredClone(form.experience);
                        next[ji].role = e.target.value;
                        setForm({ ...form, experience: next });
                      }}
                    />
                  </label>
                </div>
                <p className="mb-2 text-xs font-medium text-gray-600">
                  Sections (optional heading + bullets)
                </p>
                {job.sections.map((sec, si) => (
                  <div
                    key={`${ji}-${si}`}
                    className="mb-4 rounded-xl border border-white bg-white p-3 shadow-sm"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <label className="min-w-0 flex-1">
                        <span className="mb-1 block text-xs font-medium text-gray-600">
                          Section heading (e.g. Client: Name)
                        </span>
                        <input
                          className={inputCls}
                          value={sec.heading}
                          onChange={(e) => {
                            const next = structuredClone(form.experience);
                            next[ji].sections[si].heading = e.target.value;
                            setForm({ ...form, experience: next });
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeSection(ji, si)}
                        className="mt-6 rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
                        aria-label="Remove section"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {sec.bullets.map((b, bi) => (
                      <div key={bi} className="mb-2 flex gap-2">
                        <input
                          className={inputCls}
                          placeholder="Bullet point"
                          value={b}
                          onChange={(e) => {
                            const next = structuredClone(form.experience);
                            next[ji].sections[si].bullets[bi] = e.target.value;
                            setForm({ ...form, experience: next });
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeBullet(ji, si, bi)}
                          className="shrink-0 rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addBullet(ji, si)}
                      className="mt-1 text-xs font-medium text-violet-600 hover:text-violet-800"
                    >
                      + Add bullet
                    </button>
                  </div>
                ))}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => addSection(ji)}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-800 hover:bg-gray-50"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add section
                  </button>
                  <button
                    type="button"
                    onClick={() => removeJob(ji)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove job
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addJob}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" /> Add experience
            </button>
          </div>

          {/* Education */}
          <h2 className="mb-4 mt-10 text-lg font-semibold text-gray-900">Education</h2>
          <div className="grid gap-4">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-600">School</span>
              <input
                className={inputCls}
                value={form.education.school}
                onChange={(e) => update("education.school", e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-600">Degree</span>
              <input
                className={inputCls}
                value={form.education.degree}
                onChange={(e) => update("education.degree", e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-600">
                Minors / extra lines
              </span>
              <input
                className={inputCls}
                value={form.education.minors}
                onChange={(e) => update("education.minors", e.target.value)}
              />
            </label>
          </div>

          {/* Certifications */}
          <h2 className="mb-4 mt-10 text-lg font-semibold text-gray-900">Certifications</h2>
          <div className="space-y-2">
            {form.certifications.map((c, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={inputCls}
                  placeholder="Certification line"
                  value={c.line}
                  onChange={(e) => {
                    const next = [...form.certifications];
                    next[i] = { line: e.target.value };
                    setForm({ ...form, certifications: next });
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeCert(i)}
                  className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addCert}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" /> Add certification
            </button>
          </div>

          {/* Projects */}
          <h2 className="mb-4 mt-10 text-lg font-semibold text-gray-900">Projects</h2>
          <div className="space-y-6">
            {form.projects.map((proj, pi) => (
              <div key={pi} className="rounded-2xl border border-gray-100 p-4">
                <div className="mb-3 grid gap-3 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs font-medium text-gray-600">Title</span>
                    <input
                      className={inputCls}
                      value={proj.title}
                      onChange={(e) => {
                        const next = structuredClone(form.projects);
                        next[pi].title = e.target.value;
                        setForm({ ...form, projects: next });
                      }}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs font-medium text-gray-600">Dates</span>
                    <input
                      className={inputCls}
                      value={proj.dateRange}
                      onChange={(e) => {
                        const next = structuredClone(form.projects);
                        next[pi].dateRange = e.target.value;
                        setForm({ ...form, projects: next });
                      }}
                    />
                  </label>
                </div>
                {proj.bullets.map((b, bi) => (
                  <div key={bi} className="mb-2 flex gap-2">
                    <input
                      className={inputCls}
                      value={b}
                      onChange={(e) => {
                        const next = structuredClone(form.projects);
                        next[pi].bullets[bi] = e.target.value;
                        setForm({ ...form, projects: next });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeProjectBullet(pi, bi)}
                      className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => addProjectBullet(pi)}
                    className="text-xs font-medium text-violet-600 hover:text-violet-800"
                  >
                    + Add bullet
                  </button>
                  <button
                    type="button"
                    onClick={() => removeProject(pi)}
                    className="text-xs font-medium text-red-600 hover:text-red-800"
                  >
                    Remove project
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addProject}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" /> Add project
            </button>
          </div>

          {/* Error / note */}
          {error && (
            <p className="mt-6 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          {downloadNote && !error && (
            <p className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/80 px-3 py-2 text-sm text-emerald-900">
              {downloadNote}
            </p>
          )}

          {/* Download button */}
          <button
            type="button"
            onClick={onDownload}
            disabled={loading}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-violet-700 disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {loading ? "Building PDF…" : "Download PDF"}
          </button>
        </div>

        {/* ── Preview Column (conditional) ── */}
        {showPreview && (
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-gray-200">
              <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
                <span className="text-xs font-medium text-gray-300">Live Preview</span>
                <span className="text-xs text-gray-500">Updates as you type</span>
              </div>
              <div className="overflow-auto bg-white" style={{ maxHeight: "calc(100vh - 140px)" }}>
                <ResumePreview form={form} accentColor={accentColor} />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}