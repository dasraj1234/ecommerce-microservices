import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import { searchProducts } from "../../api/products";
import { getAllOrders } from "../../api/orders";
import { getPaymentsCount } from "../../api/payments";

// Admin KPI dashboard.
//
// Products (GET /products/search), Orders (GET /orders/all) and Payments
// (GET /payments/count) have live counts. Wallet Users stays "—":
// payment-wallet-service has no wallet-count endpoint yet.
const KPIS = [
  { key: "products", label: "Products", hint: "in catalog" },
  { key: "orders", label: "Orders", hint: "all time" },
  { key: "payments", label: "Payments", hint: "processed" },
  { key: "wallets", label: "Wallet Users", hint: "with balance" },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    products: null,
    orders: null,
    payments: null,
    wallets: undefined, // no endpoint yet — render as "—"
  });
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [products, orders, payments] = await Promise.allSettled([
        searchProducts(),
        getAllOrders(),
        getPaymentsCount(),
      ]);
      if (cancelled) return;

      setCounts((c) => ({
        ...c,
        products:
          products.status === "fulfilled" ? (products.value || []).length : "—",
        orders:
          orders.status === "fulfilled" ? (orders.value || []).length : "—",
        payments:
          payments.status === "fulfilled" ? (payments.value ?? 0) : "—",
      }));

      const failed = [products, orders, payments].find((r) => r.status === "rejected");
      if (failed) setError(failed.reason?.message || "Some metrics could not be loaded.");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const display = (v) => (v === null ? "…" : v === undefined ? "—" : v);

  return (
    <PageShell type="admin" eyebrow="Ops Console" title="Dashboard">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((kpi) => (
          <Card key={kpi.key} className="!p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-600/60">
              {kpi.label}
            </p>
            <p className="mt-2 font-display text-3xl font-semibold text-ink-900">
              {display(counts[kpi.key])}
            </p>
            <p className="mt-1 text-xs text-ink-600/50">{kpi.hint}</p>
          </Card>
        ))}
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600">
          {error}
        </div>
      )}
    </PageShell>
  );
}
