import { useEffect } from "react";
import { useStore } from "../state/useStore";
import Hero from "../components/Hero";
import StatsCards from "../components/StatsCards";
import CampusFeed from "../components/CampusFeed";
import { TrendingTopics, WorkSmarter } from "../components/SidebarWidgets";

export default function Home() {
  const loadBlogs = useStore((s) => s.loadBlogs);
  const loadResources = useStore((s) => s.loadResources);
  const getStats = useStore((s) => s.getStats);

  

  useEffect(() => {
    loadBlogs();
    loadResources();
  }, [loadBlogs, loadResources]);

  const stats = getStats();

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
          <TrendingTopics />
          <WorkSmarter />
        </aside>
      </div>
    </main>
  );
}
