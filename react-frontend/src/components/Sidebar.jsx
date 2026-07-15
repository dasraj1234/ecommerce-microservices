import { NavLink, useNavigate } from "react-router-dom";
import { clearSession } from "../auth/session";

export default function Sidebar({ type }) {
  const navigate = useNavigate();
  const admin = type === "admin";

  const handleLogout = () => {
    clearSession();
    navigate("/", { replace: true });
  };
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
        <NavLink key={to} to={to}>
          {label}
        </NavLink>
      ))}
      <hr />
      <a href="/" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
        🚪 Logout
      </a>
    </div>
  );
}
