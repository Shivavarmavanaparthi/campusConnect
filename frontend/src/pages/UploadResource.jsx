import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link as LinkIcon } from "lucide-react";
import { uploadResource } from "../lib/api";

const CATEGORIES = [
  "notes",
  "assignments",
  "study materials",
  "past papers",
  "books",
  "other",
];

export default function UploadResource() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("notes");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !fileUrl.trim()) {
      setError("Title and a Drive link are required.");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("description", description.trim());
      fd.append("category", category);
      fd.append("fileUrl", fileUrl.trim());
      await uploadResource(fd);
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-6">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600">
          <LinkIcon className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Share a Resource</h1>
        <p className="mt-2 text-gray-600">
          Add a shareable Drive link so your peers can download resources.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-100 sm:p-10"
      >
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-gray-700">Resource Title</span>
          <input
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none ring-violet-500/30 focus:ring-2"
            placeholder="e.g. CS101 Midterm Notes"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-bold text-gray-700">Category</span>
          <select
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none ring-violet-500/30 focus:ring-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-bold text-gray-700">Description</span>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none ring-violet-500/30 focus:ring-2"
            placeholder="What is this resource about? Who is it for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <p className="mb-3 text-sm font-bold text-gray-700">Drive link</p>
          <p className="mb-3 text-xs text-gray-500">
            Paste a shareable Google Drive URL. Make sure it&apos;s publicly accessible for
            students to download.
          </p>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-gray-700">
              File URL
            </span>
            <input
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none ring-violet-500/30 focus:ring-2"
              placeholder="https://drive.google.com/file/d/<id>/view?usp=sharing"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />
          </label>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-pink-500 px-10 py-3 text-sm font-bold text-white shadow-md transition hover:bg-pink-600 disabled:opacity-60"
          >
            {loading ? "Sharing…" : "Share Resource"}
          </button>
        </div>
      </form>
    </main>
  );
}
