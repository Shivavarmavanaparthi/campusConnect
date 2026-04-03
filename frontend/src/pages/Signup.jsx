import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { signup as signupApi } from "../lib/api";
import { useStore } from "../state/useStore";

export default function Signup() {
  const navigate = useNavigate();
  const checkAuth = useStore((s) => s.checkAuth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await signupApi({ name, email, password });
      await checkAuth();
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed.");
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
        <h1 className="text-center text-2xl font-bold text-gray-900">Join CampusConnect</h1>
        <p className="mt-2 text-center text-sm text-gray-500">
          Create an account to share blogs and resources.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-gray-700">Name</span>
            <input
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none ring-violet-500/30 focus:ring-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
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
              autoComplete="new-password"
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
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-violet-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
