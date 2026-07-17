import Sidebar from "./Sidebar";

export default function PageShell({ type, title, eyebrow, actions, children }) {
  const bg = type === "admin" ? "bg-paper" : "bg-paper-warm";
  return (
    <div className="flex min-h-screen">
      <Sidebar type={type} />
      <div className={`flex-1 ${bg}`}>
        <div className="mx-auto max-w-6xl px-8 py-10">
          {(title || actions) && (
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                {eyebrow && (
                  <p className="mb-1 text-xs font-medium uppercase tracking-[0.15em] text-ink-600/60">
                    {eyebrow}
                  </p>
                )}
                <h1 className="font-display text-2xl font-semibold text-ink-900">{title}</h1>
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
