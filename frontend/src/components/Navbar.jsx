import { Link, NavLink } from "react-router-dom";
import { BookOpen, FileUp, Sparkles } from "lucide-react";
import { useStore } from "../state/useStore";
import EmailAvatar from "./EmailAvatar";

const navCls = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? "text-violet-600" : "text-gray-500 hover:text-gray-800"
  }`;

export default function Navbar() {
  const { user } = useStore();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" strokeWidth={2} />
          </span>
          <span className="text-lg font-bold tracking-tight text-gray-900">
            CampusConnect
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
          <NavLink to="/" className={navCls} end>
            Blogs
          </NavLink>
          <NavLink to="/resources" className={navCls}>
            Resources
          </NavLink>
          <NavLink to="/resume-builder" className={navCls}>
            AI Tools
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            to="/write-blog"
            className="hidden items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 sm:inline-flex"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Write Blog
          </Link>
          <Link
            to="/upload-resource"
            className="hidden items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 sm:inline-flex"
          >
            <FileUp className="h-3.5 w-3.5" />
            Upload Resource
          </Link>
          <Link
            to={user ? "/profile" : "/login"}
            className="flex h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-gray-100"
          >
            <EmailAvatar
              email={user?.email}
              name={user?.name}
              size={36}
              className="h-full w-full"
            />
          </Link>
        </div>
      </div>

      <div className="flex border-t border-gray-50 px-4 py-2 md:hidden">
        <nav className="flex min-w-0 flex-1 justify-around gap-2">
          <NavLink to="/" className={navCls} end>
            Blogs
          </NavLink>
          <NavLink to="/resources" className={navCls}>
            Resources
          </NavLink>
         <NavLink to="/resume-builder" className={navCls}>
  Resume Builder
</NavLink>
        </nav>
      </div>
    </header>
  );
}
