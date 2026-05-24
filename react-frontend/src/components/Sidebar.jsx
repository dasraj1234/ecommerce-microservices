import { Link } from "react-router-dom";

export default function Sidebar({ type }) {
  const admin = type === "admin";
  const items = admin
    ? [
        ["/admin/dashboard", "📊 Dashboard"],
        ["/admin/products", "📦 Products"],
        ["/admin/orders", "📑 Orders"],
        ["/admin/payments", "💳 Payments"],
      ]
    : [
        ["/customer/home", "🛍 Shop"],
        ["/customer/orders", "📦 My Orders"],
        ["/customer/payments", "💳 My Payments"],
        ["/customer/wallet", "👛 Wallet"],
      ];

  return (
    <div className="sidebar">
      <div className="logo">{admin ? "ADMIN" : "CUSTOMER"}</div>
      <div className="menu-title">{admin ? "Dashboard" : "Shopping"}</div>
      {items.map(([to, label]) => (
        <Link key={to} to={to}>
          {label}
        </Link>
      ))}
      <hr />
      <Link to="/">🚪 Exit Portal</Link>
    </div>
  );
}
