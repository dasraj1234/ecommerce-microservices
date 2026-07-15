import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { searchProducts } from "../../api/products";
import { getAllOrders } from "../../api/orders";
import { getPaymentsCount } from "../../api/payments";

// Admin KPI dashboard.
//
// Products (GET /products/search), Orders (GET /orders/all) and Payments
// (GET /payments/count) have live counts. Wallet Users stays "--":
// payment-wallet-service has no wallet-count endpoint yet.
export default function AdminDashboard() {
  const [productCount, setProductCount] = useState(null);
  const [orderCount, setOrderCount] = useState(null);
  const [paymentCount, setPaymentCount] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Fetch counts in parallel; a failure on one card doesn't block the rest.
      const [products, orders, payments] = await Promise.allSettled([
        searchProducts(),
        getAllOrders(),
        getPaymentsCount(),
      ]);
      if (cancelled) return;

      if (products.status === "fulfilled") {
        setProductCount((products.value || []).length);
      } else {
        setError((e) => e || products.reason?.message || "Could not load product count.");
      }
      if (orders.status === "fulfilled") {
        setOrderCount((orders.value || []).length);
      } else {
        setError((e) => e || orders.reason?.message || "Could not load order count.");
      }
      if (payments.status === "fulfilled") {
        setPaymentCount(payments.value ?? 0);
      } else {
        setError((e) => e || payments.reason?.message || "Could not load payment count.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const count = (value) => (value === null ? "…" : value);

  const cards = [
    { title: "Products", value: count(productCount) },
    { title: "Orders", value: count(orderCount) },
    { title: "Payments", value: count(paymentCount) },
    { title: "Wallet Users", value: "--" },
  ];

  return (
    <div className="layout">
      <Sidebar type="admin" />
      <div className="main-content">
        <div className="page-title">Admin Dashboard</div>

        <div className="kpi-grid">
          {cards.map((c) => (
            <div className="kpi-card" key={c.title}>
              <div className="kpi-title">{c.title}</div>
              <div className="kpi-value" style={{ fontSize: 28, fontWeight: 700 }}>
                {c.value}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="card" style={{ marginTop: 20 }}>
            <p style={{ color: "#dc2626", margin: 0 }}>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
