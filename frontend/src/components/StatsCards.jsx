import { createElement } from "react";
import { BookOpen, FileText, Users } from "lucide-react";

export default function StatsCards({ totalStudents, publishedBlogs, sharedResources }) {
  const items = [
    {
      icon: Users,
      label: "Total Students",
      value: totalStudents,
    },
    {
      icon: BookOpen,
      label: "Published Blogs",
      value: publishedBlogs,
    },
    {
      icon: FileText,
      label: "Shared Resources",
      value: sharedResources,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map(({ icon, label, value }) => (
        <div
          key={label}
          className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            {createElement(icon, { className: "h-6 w-6", strokeWidth: 1.75 })}
          </span>
          <div className="text-left">
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className="text-2xl font-bold tabular-nums text-gray-900">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
