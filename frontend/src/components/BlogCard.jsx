import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
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

export default function BlogCard({
  blog,
  showActions = false,
  onEdit,
  onDelete,
  authorLabel,
}) {
  const parsed = parseBlogContent(blog.content);
  const authorName =
    authorLabel ||
    (typeof blog.author === "object" && blog.author?.name
      ? blog.author.name
      : null) ||
    "Author";
  const category = (blog.category || "general").toLowerCase();
  const img =
    parsed.cover ||
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80";

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-gray-100 transition hover:shadow-lg">
      <Link to={`/blogs/${blog._id}`} className="block shrink-0">
        <div className="aspect-[16/10] w-full overflow-hidden bg-gray-100">
          <img
            src={img}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80";
            }}
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2 flex items-center justify-between gap-2 text-xs">
          <span className="font-medium capitalize text-blue-600">{category}</span>
          <span className="text-gray-400">{formatDate(blog.createdAt)}</span>
        </div>
        <Link to={`/blogs/${blog._id}`}>
          <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-gray-900 hover:text-violet-700">
            {blog.title}
          </h3>
        </Link>
        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-600">
          {parsed.displaySnippet}
        </p>
        {parsed.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {parsed.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-50 pt-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-violet-100 text-[10px] font-bold text-violet-800">
              {authorName.slice(0, 1).toUpperCase()}
            </div>
            <span className="font-medium text-gray-800">{authorName}</span>
          </div>
          {showActions ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                <Clock className="h-3.5 w-3.5" />
                {parsed.readMinutes} min read
              </span>
            </div>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Clock className="h-3.5 w-3.5" />
              {parsed.readMinutes} min read
            </span>
          )}
        </div>
        {showActions && (
          <div className="mt-4 flex justify-end gap-2 border-t border-gray-50 pt-4">
            <button
              type="button"
              onClick={() => onEdit?.(blog)}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(blog)}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50/50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
