import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { login as loginApi } from "../lib/api";
import { useStore } from "../state/useStore";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const checkAuth = useStore((s) => s.checkAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginApi({ email, password });
      await checkAuth();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh bg-gradient-to-b from-violet-50/80 to-gray-50 px-4 py-10">
      <div className="mx-auto mb-10 flex max-w-md justify-center">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600 text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold text-gray-900">CampusConnect</span>
        </Link>
      </div>

      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
        <h1 className="text-center text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-2 text-center text-sm text-gray-500">
          Sign in to write, upload, and use AI tools.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-gray-700">Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none ring-violet-500/30 focus:ring-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-gray-700">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none ring-violet-500/30 focus:ring-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-violet-700 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          No account?{" "}
          <Link to="/signup" className="font-semibold text-violet-600 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
