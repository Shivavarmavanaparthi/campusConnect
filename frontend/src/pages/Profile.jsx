import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { useStore } from "../state/useStore";
import BlogCard from "../components/BlogCard";
import { deleteBlog, deleteResource } from "../lib/api";
import EmailAvatar from "../components/EmailAvatar";

export default function Profile() {
  const { user, loadMyBlogs, loadMyResources, myBlogs, myResources, logout } =
    useStore();
  const [tab, setTab] = useState("blogs");
  const navigate = useNavigate();

  useEffect(() => {
    loadMyBlogs();
    loadMyResources();
  }, [loadMyBlogs, loadMyResources]);

  const handleDeleteBlog = async (blog) => {
    if (!window.confirm("Delete this blog permanently?")) return;
    try {
      await deleteBlog(blog._id);
      loadMyBlogs();
    } catch {
      alert("Could not delete blog.");
    }
  };

  const handleDeleteResource = async (r) => {
    if (!window.confirm("Delete this resource?")) return;
    try {
      await deleteResource(r._id);
      loadMyResources();
    } catch {
      alert("Could not delete resource.");
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full ring-4 ring-violet-100">
          <EmailAvatar
            email={user?.email}
            name={user?.name}
            size={96}
            className="h-full w-full"
          />
        </div>
        <div className="flex-1 text-left">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {user?.name || "Student"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{user?.email}</p>
          <div className="mt-6 flex flex-wrap items-end gap-10">
            <div>
              <p className="text-2xl font-bold text-gray-900">{myBlogs.length}</p>
              <p className="text-xs font-medium text-gray-500">Blogs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{myResources.length}</p>
              <p className="text-xs font-medium text-gray-500">Resources</p>
            </div>
           <button
  type="button"
  onClick={() => logout().then(() => navigate("/"))}
  className="ml-auto cursor-pointer rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 
             shadow-sm transition-all duration-200 ease-out
             hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md hover:text-gray-900
             active:translate-y-0 active:shadow-sm"
>
  Log out
</button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-md justify-center rounded-full bg-gray-100 p-1 ring-1 ring-gray-200/80">
        <button
          type="button"
          onClick={() => setTab("blogs")}
          className={`flex-1 rounded-full px-6 py-2.5 text-sm font-semibold transition ${
            tab === "blogs"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          My Blogs
        </button>
        <button
          type="button"
          onClick={() => setTab("resources")}
          className={`flex-1 rounded-full px-6 py-2.5 text-sm font-semibold transition ${
            tab === "resources"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          My Resources
        </button>
      </div>

      <div className="mt-10">
        {tab === "blogs" ? (
          myBlogs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
              <p className="font-semibold text-gray-900">No blogs yet</p>
              <p className="mt-2 text-sm text-gray-500">
                Share your first story with the campus.
              </p>
              <Link
                to="/write-blog"
                className="mt-6 inline-flex rounded-full bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white"
              >
                Write Blog
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1">
              {myBlogs.map((blog) => (
                <BlogCard
                  key={blog._id}
                  blog={blog}
                  authorLabel={user?.name}
                  showActions
                  onEdit={() => navigate(`/blogs/${blog._id}/edit`)}
                  onDelete={handleDeleteBlog}
                />
              ))}
            </div>
          )
        ) : myResources.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
              <FileText className="h-7 w-7" />
            </div>
            <p className="font-semibold text-gray-900">No resources yet</p>
            <p className="mt-2 max-w-sm text-sm text-gray-500">
              You haven&apos;t uploaded any study materials. Help out your peers!
            </p>
            <Link
              to="/upload-resource"
              className="mt-6 inline-flex rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white"
            >
              Upload Resource
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myResources.map((r) => (
              <div
                key={r._id}
                className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-md ring-1 ring-gray-100 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs font-semibold uppercase text-violet-600">
                    {r.category || "notes"}
                  </p>
                  <h3 className="mt-1 font-bold text-gray-900">{r.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                    {r.description || "—"}
                  </p>
                  <a
                    href={r.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm font-medium text-violet-600 hover:underline"
                  >
                    Open file
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteResource(r)}
                  className="self-end rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 sm:self-center"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
