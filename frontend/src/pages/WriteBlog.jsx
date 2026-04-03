import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PenLine } from "lucide-react";
import { createBlog } from "../lib/api";
import { buildBlogContent } from "../lib/blogFormat";

const CATEGORIES = [
  "general",
  "placements",
  "academics",
  "campus life",
  "tech",
  "other",
];

export default function WriteBlog() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !body.trim()) {
      setError("Title and content are required.");
      return;
    }
    setLoading(true);
    try {
      const content = buildBlogContent({
        coverUrl,
        excerpt,
        body,
        tags,
      });
      await createBlog({
        title: title.trim(),
        category,
        content,
      });
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Could not publish.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-10 sm:px-6">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600">
          <PenLine className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Share Your Knowledge</h1>
        <p className="mt-2 text-gray-600">Write a blog to help your peers and juniors.</p>
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
          <span className="mb-2 block text-sm font-bold text-gray-700">Blog Title</span>
          <input
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none ring-violet-500/30 focus:ring-2"
            placeholder="Enter an engaging title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <label className="block">
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
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-gray-700">Tags</span>
            <input
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none ring-violet-500/30 focus:ring-2"
              placeholder="react, placements, tips..."
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </label>
        </div>

        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-bold text-gray-700">
            Cover Image URL (optional)
          </span>
          <input
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none ring-violet-500/30 focus:ring-2"
            placeholder="https://example.com/image.jpg"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
          />
        </label>

        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-bold text-gray-700">
            Excerpt (Short summary)
          </span>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none ring-violet-500/30 focus:ring-2"
            placeholder="A brief summary of your blog post..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </label>

        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-bold text-gray-700">Content</span>
          <textarea
            rows={14}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm leading-relaxed outline-none ring-violet-500/30 focus:ring-2"
            placeholder="Write your amazing content here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </label>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-violet-600 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {loading ? "Publishing…" : "Publish Blog"}
          </button>
        </div>
      </form>
    </main>
  );
}
