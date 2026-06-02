import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../api/auth";

// Signup form.
// Backend: POST /users/register  (auth-user-service @ :8083)
//   request : { username, email, password }
//   response: created User { id, username, email, role, createdAt }
export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/30 bg-white/15 p-8 shadow-2xl backdrop-blur-xl">
        <h1 className="mb-6 text-3xl font-bold text-white">Create account</h1>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/90">
              Username
            </label>
            <input
              name="username"
              type="text"
              value={form.username}
              onChange={onChange}
              placeholder="Choose a username"
              required
              className="w-full rounded-lg border border-white/40 bg-white/90 px-4 py-3 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/90">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-white/40 bg-white/90 px-4 py-3 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/90">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={onChange}
                placeholder="Create a password"
                required
                className="w-full rounded-lg border border-white/40 bg-white/90 px-4 py-3 pr-12 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-white">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white py-3 text-base font-semibold text-orange-600 transition hover:bg-orange-50 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/90">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-white underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
