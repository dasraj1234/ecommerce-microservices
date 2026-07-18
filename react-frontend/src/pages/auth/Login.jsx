import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { login } from "../../api/auth";
import { setSession, homeForRole, roleAreaPrefix } from "../../auth/session";

// Login form.
// Backend: POST /auth/login  (auth-user-service @ :8081, via Vite proxy)
//   request : { username, password }
//   response: { token, username, role }
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
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
      const data = await login(form);

      // Which portal did they come through? The guard remembers the intended
      // path in location.state.from (e.g. /customer/home or /admin/dashboard).
      const from = location.state?.from?.pathname;
      const requiredRole = from
        ? from.startsWith("/admin")
          ? "ADMIN"
          : from.startsWith("/customer")
            ? "USER"
            : null
        : null;

      // If they used a portal-specific login (e.g. Customer) but the account is
      // for the other role (e.g. ADMIN), reject with the same message as a wrong
      // password — don't sign them in as the other role, and don't reveal that
      // the account exists.
      if (requiredRole && data.role !== requiredRole) {
        setError("Invalid username or password");
        return;
      }

      setSession(data);
      // Return to the page the guard redirected from — but only if it belongs to
      // this user's role area; otherwise fall back to the role's own home.
      const roleHome = homeForRole(data.role);
      const dest = from && from.startsWith(roleAreaPrefix(data.role)) ? from : roleHome;
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="surface-ink hidden w-1/2 flex-col justify-between p-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand font-display text-sm font-bold text-ink-900">
            E
          </span>
          <span className="font-display text-sm font-semibold">EcomVerse</span>
        </div>
        <div>
          <p className="font-display text-3xl font-semibold leading-tight">
            Welcome to the Smart E-Commerce Platform.
          </p>
          <p className="mt-3 max-w-sm text-white/45">
            Track products, orders, and payments across every service from one
            sign-in.
          </p>
        </div>
        <p className="text-xs text-white/25">© {new Date().getFullYear()} EcomVerse Platform</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center bg-paper p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Home
          </Link>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Log in</h1>
          <p className="mt-1.5 text-sm text-ink-600">
            Enter your credentials to reach your console.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
                Username
              </label>
              <input
                name="username"
                type="text"
                value={form.username}
                onChange={onChange}
                placeholder="Enter your username"
                required
                className="w-full rounded-lg border border-ink-900/10 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder-ink-600/40 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={onChange}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-lg border border-ink-900/10 bg-white px-3.5 py-2.5 pr-11 text-sm text-ink-900 placeholder-ink-600/40 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-ink-600/60 hover:text-ink-900"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link to="#" className="text-xs font-medium text-ink-600 hover:text-ink-900">
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-2.5 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-ink-900 py-3 text-sm font-semibold text-white transition hover:bg-ink-800 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-ink-600">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="font-semibold text-ink-900 underline underline-offset-2">
              Register for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
