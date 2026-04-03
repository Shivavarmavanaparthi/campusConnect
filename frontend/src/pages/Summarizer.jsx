import { useCallback, useState } from "react";
import { CloudUpload, FileText, Sparkles } from "lucide-react";
import { summarizePDF } from "../lib/api";

export default function Summarizer() {
  const [tab, setTab] = useState("pdf");
  const [file, setFile] = useState(null);
  const [pasteText, setPasteText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f && f.type === "application/pdf") setFile(f);
  }, []);

  const onGenerate = async () => {
    setError("");
    setSummary("");
    if (tab === "paste") {
      setError(
        "Text summarization is not available on the server yet. Please upload a PDF — your backend analyzes PDF files only."
      );
      return;
    }
    if (!file) {
      setError("Please choose a PDF file (up to 20 MB).");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await summarizePDF(fd);
      setSummary(res.data.summary || "");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          AI Document Summarizer
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600 sm:text-base">
          Upload a PDF or paste your text and our AI will extract key points and
          generate a concise summary.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-100 sm:p-8">
        <div className="mb-6 flex rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setTab("pdf")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition ${
              tab === "pdf"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <CloudUpload className="h-4 w-4" />
            Upload PDF
          </button>
          <button
            type="button"
            onClick={() => setTab("paste")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition ${
              tab === "paste"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <FileText className="h-4 w-4" />
            Paste Text
          </button>
        </div>

        {tab === "pdf" ? (
          <label
            htmlFor="pdf-upload"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-14 transition hover:border-violet-300 hover:bg-violet-50/30"
          >
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600">
              <CloudUpload className="h-7 w-7" />
            </div>
            <p className="text-base font-bold text-gray-900">Drop your PDF here</p>
            <p className="mt-1 text-sm text-gray-500">or click to browse files</p>
            <p className="mt-1 text-xs text-gray-400">PDF files up to 20 MB</p>
            <input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file && (
              <p className="mt-4 text-sm font-medium text-violet-700">{file.name}</p>
            )}
          </label>
        ) : (
          <div>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste your notes or article text here…"
              rows={10}
              className="w-full max-w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-violet-500/20 focus:ring-2"
            />
            <p className="mt-2 text-xs text-gray-500">
              Server-side summarization currently accepts PDF uploads only. Paste mode
              is here for UI parity with your deployed app.
            </p>
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-violet-700 disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4" />
          {loading ? "Generating…" : "Generate Summary"}
        </button>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 sm:p-8">
        <div className="mb-4 flex items-center gap-2 text-violet-700">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-lg font-semibold">AI Summary</h2>
        </div>
        <div className="min-h-[200px] rounded-xl bg-gray-50 p-6">
          {summary ? (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700">
              {summary}
            </div>
          ) : (
            <div className="flex h-full min-h-[160px] flex-col items-center justify-center text-center text-gray-400">
              <Sparkles className="mb-2 h-10 w-10 opacity-40" />
              <p>Your summary will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
