import { NavLink, useNavigate } from "react-router-dom";
import { getUsername, getRole, logout } from "../auth/session";

const ICONS = {
  dashboard: (
    <path d="M3 13h8V3H3v10Zm10 8h8V3h-8v18ZM3 21h8v-6H3v6Z" />
  ),
  products: (
    <path d="M21 8 12 3 3 8l9 5 9-5Zm-18 4 9 5 9-5M3 16l9 5 9-5" />
  ),
  orders: (
    <path d="M6 2h9l3 3v17H6V2Zm9 0v3h3M9 11h6M9 15h6M9 7h3" />
  ),
  payments: (
    <path d="M3 7h18v10H3V7Zm0 4h18M7 15h3" />
  ),
  wallet: (
    <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2M3 7v10a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-4M3 7h16M17 13h2" />
  ),
  home: (
    <path d="M3 11 12 4l9 7M5 10v10h14V10" />
  ),
  logout: (
    <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M16 17l5-5-5-5M21 12H9" />
  ),
};

function Icon({ name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </svg>
  );
}

const NAV = {
  admin: [
    { to: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
    { to: "/admin/products", label: "Products", icon: "products" },
    { to: "/admin/orders", label: "Orders", icon: "orders" },
    { to: "/admin/payments", label: "Payments", icon: "payments" },
  ],
  customer: [
    { to: "/customer/home", label: "Store", icon: "home" },
    { to: "/customer/orders", label: "Orders", icon: "orders" },
    { to: "/customer/payments", label: "Payments", icon: "payments" },
    { to: "/customer/wallet", label: "Wallet", icon: "wallet" },
  ],
};

export default function Sidebar({ type = "customer" }) {
  const navigate = useNavigate();
  const items = NAV[type] || NAV.customer;
  const username = getUsername();
  const role = getRole();

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-ink-900 text-white/90">
      <div className="flex items-center gap-2 px-6 py-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand font-display text-sm font-bold text-ink-900">
          E
        </span>
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold text-white">EcomVerse</p>
          <p className="text-[11px] uppercase tracking-wider text-white/40">
            {type === "admin" ? "Ops Console" : "Storefront"}
          </p>
        </div>
      </div>

      <nav className="sidebar-scroll flex-1 space-y-1 overflow-y-auto px-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/55 hover:bg-white/5 hover:text-white/90"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-1.5 w-1.5 shrink-0 rounded-full transition ${
                    isActive ? "bg-brand" : "bg-transparent"
                  }`}
                />
                <span className={isActive ? "text-brand" : "text-white/40 group-hover:text-white/70"}>
                  <Icon name={item.icon} />
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 font-mono text-xs font-medium text-white/80">
            {(username || "?").slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium text-white">
              {username || "Guest"}
            </p>
            <p className="text-[11px] uppercase tracking-wider text-white/40">
              {role || "—"}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/55 transition hover:bg-white/5 hover:text-white"
        >
          <Icon name="logout" />
          Log out
        </button>
      </div>
    </aside>
  );
}
