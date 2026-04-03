import { NavLink } from "react-router-dom";
import { FileText, FileUser } from "lucide-react";

const linkCls = ({ isActive }) =>
  `flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition ${
    isActive ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
  }`;

export default function AiToolsNav() {
  return (
    <div className="mb-8 flex rounded-xl bg-gray-100 p-1">
      <NavLink to="/summarizer" className={linkCls} end>
        <FileText className="h-4 w-4 shrink-0" />
        PDF Summarizer
      </NavLink>
      <NavLink to="/resume-builder" className={linkCls}>
        <FileUser className="h-4 w-4 shrink-0" />
        Resume Builder
      </NavLink>
    </div>
  );
}
