import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PenLine } from "lucide-react";
import { getBlogById, updateBlog } from "../lib/api";
import { buildBlogContent, parseBlogContent } from "../lib/blogFormat";

const CATEGORIES = [
  "general",
  "placements",
  "academics",
  "campus life",
  "tech",
  "other",
];

export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getBlogById(id);
        const blog = res.data.blog;
        if (cancelled || !blog) return;
        setTitle(blog.title || "");
        setCategory(blog.category || "general");
        const p = parseBlogContent(blog.content);
        setCoverUrl(p.cover || "");
        setExcerpt(p.excerpt || "");
        setBody(p.body || blog.content || "");
        setTags(p.tags.join(", "));
      } catch {
        setError("Could not load blog.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !body.trim()) {
      setError("Title and content are required.");
      return;
    }
    setSaving(true);
    try {
      const content = buildBlogContent({
        coverUrl,
        excerpt,
        body,
        tags,
      });
      await updateBlog(id, {
        title: title.trim(),
        content,
      });
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-10 sm:px-6">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600">
          <PenLine className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Blog</h1>
        <p className="mt-2 text-gray-600">Update your post and keep the feed fresh.</p>
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-gray-700">Category</span>
            <select
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-400 outline-none ring-violet-500/30 focus:ring-2"
              value={category}
              disabled
              title="Category is stored on create. Backend update route does not change category."
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-gray-400">
              Category can’t be changed (API limitation).
            </span>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-gray-700">Tags</span>
            <input
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none ring-violet-500/30 focus:ring-2"
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
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
          />
        </label>

        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-bold text-gray-700">Excerpt</span>
          <textarea
            rows={4}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none ring-violet-500/30 focus:ring-2"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </label>

        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-bold text-gray-700">Content</span>
          <textarea
            rows={14}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm leading-relaxed outline-none ring-violet-500/30 focus:ring-2"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </label>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-violet-600 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}
