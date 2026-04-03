import { useState } from "react";
import { Download, FileUser, Plus, Trash2 } from "lucide-react";
import AiToolsNav from "../components/AiToolsNav";
import { buildResumePDF } from "../lib/api";

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

export default function ResumeBuilder() {
  const [form, setForm] = useState(defaultState);
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

  const addSkill = () => {
    setForm((p) => ({
      ...p,
      skills: [...p.skills, { category: "", items: "" }],
    }));
  };

  const removeSkill = (index) => {
    setForm((p) => ({
      ...p,
      skills: p.skills.filter((_, i) => i !== index),
    }));
  };

  const addJob = () => {
    setForm((p) => ({
      ...p,
      experience: [
        ...p.experience,
        {
          company: "",
          dateRange: "",
          role: "",
          sections: [{ heading: "", bullets: [""] }],
        },
      ],
    }));
  };

  const removeJob = (index) => {
    setForm((p) => ({
      ...p,
      experience: p.experience.filter((_, i) => i !== index),
    }));
  };

  const addSection = (jobIndex) => {
    setForm((p) => {
      const next = structuredClone(p);
      next.experience[jobIndex].sections.push({ heading: "", bullets: [""] });
      return next;
    });
  };

  const removeSection = (jobIndex, secIndex) => {
    setForm((p) => {
      const next = structuredClone(p);
      next.experience[jobIndex].sections = next.experience[jobIndex].sections.filter(
        (_, i) => i !== secIndex
      );
      return next;
    });
  };

  const addBullet = (jobIndex, secIndex) => {
    setForm((p) => {
      const next = structuredClone(p);
      next.experience[jobIndex].sections[secIndex].bullets.push("");
      return next;
    });
  };

  const removeBullet = (jobIndex, secIndex, bulletIndex) => {
    setForm((p) => {
      const next = structuredClone(p);
      next.experience[jobIndex].sections[secIndex].bullets = next.experience[
        jobIndex
      ].sections[secIndex].bullets.filter((_, i) => i !== bulletIndex);
      return next;
    });
  };

  const addCert = () => {
    setForm((p) => ({
      ...p,
      certifications: [...p.certifications, { line: "" }],
    }));
  };

  const removeCert = (index) => {
    setForm((p) => ({
      ...p,
      certifications: p.certifications.filter((_, i) => i !== index),
    }));
  };

  const addProject = () => {
    setForm((p) => ({
      ...p,
      projects: [...p.projects, { title: "", dateRange: "", bullets: [""] }],
    }));
  };

  const removeProject = (index) => {
    setForm((p) => ({
      ...p,
      projects: p.projects.filter((_, i) => i !== index),
    }));
  };

  const addProjectBullet = (pIndex) => {
    setForm((p) => {
      const next = structuredClone(p);
      next.projects[pIndex].bullets.push("");
      return next;
    });
  };

  const removeProjectBullet = (pIndex, bIndex) => {
    setForm((p) => {
      const next = structuredClone(p);
      next.projects[pIndex].bullets = next.projects[pIndex].bullets.filter(
        (_, i) => i !== bIndex
      );
      return next;
    });
  };

  const onDownload = async () => {
    setError("");
    setDownloadNote("");
    if (!form.fullName?.trim()) {
      setError("Please enter your full name.");
      return;
    }
    setLoading(true);
    try {
      const res = await buildResumePDF(form);
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
      a.download = `${form.fullName.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-") || "resume"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      const src =
        res.headers["x-resume-pdf-source"] || res.headers["X-Resume-Pdf-Source"] || "";
      if (src === "pdf-lib") {
        setDownloadNote(
          "Downloaded a simplified PDF (no LaTeX on this machine). Install MiKTeX and restart the backend to use the full LaTeX template."
        );
      } else if (src === "latex") {
        setDownloadNote("Downloaded using your LaTeX template.");
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
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600">
          <FileUser className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Resume Builder
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600 sm:text-base">
          Fill in your details. If <code className="text-violet-700">pdflatex</code> (MiKTeX / TeX Live)
          is available on the server, you get the full LaTeX template. Otherwise the app downloads a
          clean simplified PDF with the same content.
        </p>
      </div>

      <AiToolsNav />

      <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-100 sm:p-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Contact &amp; summary</h2>
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
            <input className={inputCls} value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-600">Phone (tel: link, digits)</span>
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
            <input className={inputCls} value={form.linkedinUrl} onChange={(e) => update("linkedinUrl", e.target.value)} />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-gray-600">LinkedIn (short label)</span>
            <input
              className={inputCls}
              value={form.linkedinDisplay}
              onChange={(e) => update("linkedinDisplay", e.target.value)}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-gray-600">GitHub URL</span>
            <input className={inputCls} value={form.githubUrl} onChange={(e) => update("githubUrl", e.target.value)} />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-gray-600">GitHub (short label)</span>
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

        <h2 className="mb-4 mt-10 text-lg font-semibold text-gray-900">Skills</h2>
        <div className="space-y-3">
          {form.skills.map((s, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-xl border border-gray-100 p-3 sm:flex-row sm:items-end">
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
              <label className="min-w-0 flex-[2]">
                <span className="mb-1 block text-xs font-medium text-gray-600">Items (comma-separated)</span>
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

        <h2 className="mb-4 mt-10 text-lg font-semibold text-gray-900">Experience</h2>
        <div className="space-y-8">
          {form.experience.map((job, ji) => (
            <div key={ji} className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
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
                  <span className="mb-1 block text-xs font-medium text-gray-600">Role / title</span>
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
              <p className="mb-2 text-xs font-medium text-gray-600">Placement / section blocks (optional heading + bullets)</p>
              {job.sections.map((sec, si) => (
                <div key={`${ji}-${si}`} className="mb-4 rounded-xl border border-white bg-white p-3 shadow-sm">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <label className="min-w-0 flex-1">
                      <span className="mb-1 block text-xs font-medium text-gray-600">Section heading (e.g. Client: Name)</span>
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
            <span className="mb-1 block text-xs font-medium text-gray-600">Minors / extra lines</span>
            <input
              className={inputCls}
              value={form.education.minors}
              onChange={(e) => update("education.minors", e.target.value)}
            />
          </label>
        </div>

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
    </main>
  );
}
