import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="px-4 pb-10 pt-8 text-center sm:px-6 lg:px-8">
      <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-1.5 text-xs font-medium text-violet-700 ring-1 ring-violet-100">
        <Sparkles className="h-3.5 w-3.5" />
        The Digital Campus Hub
      </div>
      <h1 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
        Knowledge shared is{" "}
        <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
          wisdom multiplied.
        </span>
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base">
        Discover blogs, study resources, and AI tools built for your campus — share
        what you learn and lift everyone with you.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex min-w-[140px] items-center justify-center rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-violet-700"
        >
          Explore Blogs
        </Link>
        <Link
          to="/resources"
          className="inline-flex min-w-[140px] items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
        >
          Find Resources
        </Link>
      </div>
    </section>
  );
}
