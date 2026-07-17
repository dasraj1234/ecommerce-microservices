const TONES = {
  CONFIRMED: "bg-teal/10 text-teal-dark border-teal/20",
  SUCCESS: "bg-teal/10 text-teal-dark border-teal/20",
  COMPLETED: "bg-teal/10 text-teal-dark border-teal/20",
  PAID: "bg-teal/10 text-teal-dark border-teal/20",
  PENDING: "bg-brand/10 text-brand-dark border-brand/20",
  CANCELLED: "bg-red-500/10 text-red-600 border-red-500/20",
  FAILED: "bg-red-500/10 text-red-600 border-red-500/20",
};

const DEFAULT_TONE = "bg-ink-900/5 text-ink-700 border-ink-900/10";

export default function StatusBadge({ status }) {
  if (!status) return <span className="text-ink-600/50">—</span>;
  const tone = TONES[String(status).toUpperCase()] || DEFAULT_TONE;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium tracking-tight ${tone}`}
    >
      {status}
    </span>
  );
}
