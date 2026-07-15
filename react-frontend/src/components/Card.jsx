export default function Card({ title, subtitle, className = "", children }) {
  return (
    <div className={`rounded-2xl border border-ink-900/[0.06] bg-white p-6 shadow-card ${className}`}>
      {title && (
        <div className="mb-5">
          <h3 className="font-display text-base font-semibold text-ink-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-ink-600">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
