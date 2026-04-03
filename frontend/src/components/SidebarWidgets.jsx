import { Link } from "react-router-dom";
import { FileText, Search, Sparkles, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { useStore } from "../state/useStore";

export function TrendingTopics() {
  // Important: compute derived values in a memo so we don't return a new array
  // from the Zustand selector on every render (which can cause render loops).
  const blogs = useStore((s) => s.blogs);
  const topics = useMemo(() => {
    const map = new Map();
    for (const b of blogs || []) {
      const cat = (b.category || "general").toLowerCase();
      map.set(cat, (map.get(cat) || 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
  }, [blogs]);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-violet-600" />
        <h3 className="font-bold text-gray-900">Trending Topics</h3>
      </div>
      <ul className="space-y-0 divide-y divide-gray-100">
        {topics.length === 0 ? (
          <li className="py-3 text-sm text-gray-500">No topics yet.</li>
        ) : (
          topics.map(({ name, count }) => (
            <li
              key={name}
              className="flex items-center justify-between gap-2 py-3 first:pt-0"
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-800">
                <span className="text-violet-500">#</span>
                <span className="capitalize">{name}</span>
              </span>
              <span className="text-xs text-gray-400">{count} posts</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export function WorkSmarter() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-violet-50/80 p-5 shadow-sm ring-1 ring-violet-100">
      <Sparkles className="pointer-events-none absolute -bottom-2 -right-2 h-24 w-24 text-violet-200/60" />
      <h3 className="relative font-bold text-violet-800">Work Smarter</h3>
      <p className="relative mt-1 text-xs leading-relaxed text-gray-600">
        AI tools tuned for study sessions — summarize PDFs and discover what to read
        next.
      </p>
      <div className="relative mt-4 space-y-2">
        <Link
          to="/summarizer"
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-xs font-medium text-gray-800 shadow-sm transition hover:bg-gray-50"
        >
          <FileText className="h-4 w-4 text-violet-600" />
          PDF Summarizer
        </Link>
        <Link
          to="/resources"
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-xs font-medium text-gray-800 shadow-sm transition hover:bg-gray-50"
        >
          <Search className="h-4 w-4 text-violet-600" />
          Smart Recommendations
        </Link>
      </div>
    </div>
  );
}
