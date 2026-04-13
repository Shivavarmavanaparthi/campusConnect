
import { useMemo } from "react";
import { useStore } from "../state/useStore";
import BlogCard from "./BlogCard";

export default function CampusFeed() {
  const feedFilter = useStore((s) => s.feedFilter);
  const setFeedFilter = useStore((s) => s.setFeedFilter);
  const blogs = useStore((s) => s.blogs);

  // ✅ Proper filtering + trending logic
  const filteredBlogs = useMemo(() => {
    const list = [...blogs];

    if (feedFilter === "trending") {
      const getTrendingScore = (blog) => {
        const views = blog.views || 0;
        const ageHours =
          (Date.now() - new Date(blog.createdAt)) / (1000 * 60 * 60);

        return views / (ageHours + 2); // 🔥 smart trending
      };

      return list
        .sort((a, b) => getTrendingScore(b) - getTrendingScore(a))
        .slice(0, 3); // ✅ ONLY TOP 3
    }

    return list.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [blogs, feedFilter]);

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-900">Campus Feed</h2>

        <div className="inline-flex rounded-full bg-gray-100 p-1 ring-1 ring-gray-200/80">
          <button
            type="button"
            onClick={() => setFeedFilter("latest")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              feedFilter === "latest"
                ? "bg-white text-violet-700 shadow-sm ring-1 ring-gray-200"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Latest
          </button>

          <button
            type="button"
            onClick={() => setFeedFilter("trending")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              feedFilter === "trending"
                ? "bg-white text-gray-900 shadow-sm ring-2 ring-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Trending
          </button>
        </div>
      </div>

      {filteredBlogs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center text-gray-500">
          No blog posts yet. Be the first to share on the feed.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {filteredBlogs.map((blog, index) => (
            <div key={blog._id} className="relative">
              
              

              <BlogCard blog={blog} />
            </div>
          ))}
        </div>
      )}

      {filteredBlogs.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            className="rounded-full border border-gray-200 bg-white px-8 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}

