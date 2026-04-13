
import { useEffect, useMemo } from "react";
import { useStore } from "../state/useStore";
import Hero from "../components/Hero";
import StatsCards from "../components/StatsCards";
import CampusFeed from "../components/CampusFeed";
import { TrendingTopics, WorkSmarter } from "../components/SidebarWidgets";

export default function Home() {
  const loadBlogs = useStore((s) => s.loadBlogs);
  const loadResources = useStore((s) => s.loadResources);


  const blogs = useStore((s) => s.blogs);
  const resources = useStore((s) => s.resources);


  const trendingBlogs = useMemo(() => {
  return [...blogs]
    .filter((b) => (b.views || 0) > 16)   
    .sort((a, b) => (b.views || 0) - (a.views || 0)); 
}, [blogs]);
  useEffect(() => {
    if (!blogs.length) loadBlogs();
    if (!resources.length) loadResources();
  }, [loadBlogs, loadResources, blogs.length, resources.length]);

  
  const stats = useMemo(() => {
    const authorIds = new Set();

    for (const b of blogs) {
      const id = b.author?._id || b.author;
      if (id) authorIds.add(String(id));
    }

    return {
      totalStudents: authorIds.size,
      publishedBlogs: blogs.length,
      sharedResources: resources.length,
    };
  }, [blogs, resources]);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-2 sm:px-6 lg:px-8">
      <Hero />

      <div className="mb-12">
        <StatsCards
          totalStudents={stats.totalStudents}
          publishedBlogs={stats.publishedBlogs}
          sharedResources={stats.sharedResources}
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start lg:gap-12">
        <CampusFeed />

        <aside className="flex flex-col gap-6">
          <TrendingTopics blogs={trendingBlogs} />

          <WorkSmarter />
        </aside>
      </div>
    </main>
  );
}
