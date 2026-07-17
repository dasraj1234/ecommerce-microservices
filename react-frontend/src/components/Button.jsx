export default function Button({ variant = "primary", className = "", children, ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    primary: "bg-ink-900 text-white hover:bg-ink-800",
    brand: "bg-brand text-white hover:bg-brand-dark",
    outline: "border border-ink-900/15 text-ink-800 hover:bg-ink-900/[0.03]",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  return (
    <button {...props} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
