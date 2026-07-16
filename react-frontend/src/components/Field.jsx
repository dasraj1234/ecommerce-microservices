export default function Field({ label, className = "", ...props }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
          {label}
        </span>
      )}
      <input
        {...props}
        className="w-full rounded-lg border border-ink-900/10 bg-paper px-3.5 py-2.5 text-sm text-ink-900 placeholder-ink-600/40 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </label>
  );
}
