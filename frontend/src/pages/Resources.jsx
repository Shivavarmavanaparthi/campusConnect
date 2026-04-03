import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FileText, Search } from "lucide-react";
import { useStore } from "../state/useStore";

const CATEGORIES = [
  "all",
  "notes",
  "assignments",
  "study materials",
  "past papers",
  "books",
  "other",
];

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

export default function Resources() {
  const {
    resources,
    loadResources,
    resourceCategory,
    setResourceCategory,
    resourceQuery,
    setResourceQuery,
  } = useStore();

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const filtered = useMemo(() => {
    let list = resources || [];
    if (resourceCategory !== "all") {
      list = list.filter(
        (r) => (r.category || "").toLowerCase() === resourceCategory.toLowerCase()
      );
    }
    const q = resourceQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          (r.title || "").toLowerCase().includes(q) ||
          (r.description || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [resources, resourceCategory, resourceQuery]);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Study Resources
        </h1>
        <p className="mt-2 text-gray-600">
          Find notes, past papers, and study materials shared by peers.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <Search className="h-4 w-4" />
          </span>
          <div className="flex min-w-0 flex-1 flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = resourceCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setResourceCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${
                    active
                      ? "bg-violet-600 text-white shadow-sm"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
        <input
          type="search"
          placeholder="Search resources…"
          value={resourceQuery}
          onChange={(e) => setResourceQuery(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm outline-none ring-violet-500/30 focus:ring-2 lg:w-72"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <FileText className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">No resources found</h2>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            Be the first one to share a helpful resource with the campus!
          </p>
          <Link
            to="/upload-resource"
            className="mt-8 inline-flex rounded-full bg-violet-600 px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-violet-700"
          >
            Upload Resource
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <a
              key={r._id}
              href={r.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-violet-700">
                  {r.category || "notes"}
                </span>
                <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
              </div>
              <h3 className="mb-2 line-clamp-2 text-base font-bold text-gray-900 group-hover:text-violet-700">
                {r.title}
              </h3>
              <p className="mb-4 line-clamp-2 flex-1 text-sm text-gray-600">
                {r.description || "No description provided."}
              </p>
              <span className="text-xs font-medium text-violet-600">Open file →</span>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
