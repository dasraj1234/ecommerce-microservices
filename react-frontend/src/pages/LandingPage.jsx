import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="surface-ink min-h-screen px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        {/* Masthead */}
        <div className="mb-14 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand font-display text-lg font-bold text-ink-900">
            E
          </span>
          <div>
            <p className="font-display text-lg font-semibold tracking-tight">EcomVerse</p>
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              E-Commerce Microservices Platform
            </p>
          </div>
        </div>

        {/* Hero */}
        <h1 className="max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          One manifest for the whole
          <span className="text-brand"> supply chain</span> — products,
          orders, payments, wallet.
        </h1>
        <p className="mt-5 max-w-xl text-white/50">
          A single portal in front of four independent services. Pick a lane
          below to open the console built for it.
        </p>

        {/* Portal picker */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Link
            to="/admin/dashboard"
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition hover:border-brand/40 hover:bg-white/[0.06]"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-white/30">01 · Operations</p>
            <h2 className="mt-2 font-display text-xl font-semibold">Admin Console</h2>
            <p className="mt-2 text-sm text-white/50">
              Manage the catalog, review orders, and look up payments.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
              Enter console
              <span className="transition group-hover:translate-x-0.5">→</span>
            </span>
          </Link>

          <Link
            to="/customer/home"
            className="group rounded-2xl border-2 border-brand/30 bg-gradient-to-br from-brand/15 to-transparent p-7 transition hover:border-brand/60"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-white/30">02 · Storefront</p>
            <h2 className="mt-2 font-display text-xl font-semibold">Customer Store</h2>
            <p className="mt-2 text-sm text-white/50">
              Browse products, place orders, and check your wallet.
            </p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand">
              Start shopping
              <span className="transition group-hover:translate-x-0.5">→</span>
            </span>
          </Link>
        </div>

        <p className="mt-10 text-center text-xs text-white/25">
          New here?{" "}
          <Link to="/signup" className="text-white/50 underline hover:text-white">
            Create an account
          </Link>{" "}
          ·{" "}
          <Link to="/login" className="text-white/50 underline hover:text-white">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
