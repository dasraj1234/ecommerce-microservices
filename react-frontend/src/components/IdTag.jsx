// Renders any system ID (order, product, payment, user) as a small
// "manifest tag" — see .id-tag in global.css. Keeping this as one shared
// component means every table/card in the app renders IDs identically.
export default function IdTag({ children }) {
  if (children === undefined || children === null || children === "") {
    return <span className="text-ink-600/50">—</span>;
  }
  return <span className="id-tag">{children}</span>;
}
