import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { getBlogById } from "../lib/api";
import { parseBlogContent } from "../lib/blogFormat";

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getBlogById(id);
        if (!cancelled) setBlog(res.data.blog);
      } catch {
        if (!cancelled) setError("Blog not found.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-gray-600">{error}</p>
        <Link to="/" className="mt-4 inline-block text-violet-600 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  const parsed = parseBlogContent(blog.content);
  const authorName =
    typeof blog.author === "object" && blog.author?.name
      ? blog.author.name
      : "Author";
  const category = (blog.category || "general").toLowerCase();
  const img =
    parsed.cover ||
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80";

  return (
    <article className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to feed
      </Link>

      <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-100">
        <div className="aspect-[21/9] w-full overflow-hidden bg-gray-100">
          <img
            src={img}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80";
            }}
          />
        </div>
        <div className="p-6 sm:p-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-medium capitalize text-blue-600">{category}</span>
            <span className="text-gray-400">{formatDate(blog.createdAt)}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {blog.title}
          </h1>
          {parsed.excerpt && (
            <p className="mt-4 text-lg text-gray-600">{parsed.excerpt}</p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-4 border-b border-gray-100 pb-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-800">
                {authorName.slice(0, 1).toUpperCase()}
              </div>
              <span className="font-medium text-gray-900">{authorName}</span>
            </div>
            <span className="flex items-center gap-1 text-gray-400">
              <Clock className="h-4 w-4" />
              {parsed.readMinutes} min read
            </span>
          </div>
          <div className="prose prose-lg mt-8 max-w-none">
            <div className="whitespace-pre-wrap text-base leading-relaxed text-gray-800">
              {parsed.body}
            </div>
          </div>
          {parsed.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {parsed.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
