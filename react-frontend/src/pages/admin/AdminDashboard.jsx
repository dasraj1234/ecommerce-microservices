import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import { searchProducts } from "../../api/products";
import { getAllOrders } from "../../api/orders";
import { getPaymentsCount } from "../../api/payments";
import {
  getTopProducts,
  getStatsByCategory,
  getStatsByPriceRange,
  getMonthlyStats,
  getMISReport,
} from "../../api/orders";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
} from "recharts";

const KPIS = [
  { key: "products", label: "Products", hint: "in catalog" },
  { key: "orders", label: "Orders", hint: "confirmed" },
  { key: "payments", label: "Payments", hint: "processed" },
  { key: "wallets", label: "Wallet Users", hint: "with wallets" },
];

const PIE_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
];

const fmt = (n) => (n === null ? "…" : n === undefined ? "—" : n);
const currency = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

function SectionTitle({ children }) {
  return (
    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-600/70">
      {children}
    </h2>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex items-center justify-center py-10 text-sm text-ink-600/50">
      {text}
    </div>
  );
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    products: null, orders: null, payments: null, wallets: undefined,
  });
  const [topProducts, setTopProducts] = useState(null);
  const [categories, setCategories] = useState(null);
  const [priceRanges, setPriceRanges] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [mis, setMis] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // KPI counts
      const [products, orders, payments] = await Promise.allSettled([
        searchProducts(),
        getAllOrders(),
        getPaymentsCount(),
      ]);
      if (cancelled) return;

      setCounts({
        products: products.status === "fulfilled" ? (products.value || []).length : "—",
        orders:   orders.status   === "fulfilled" ? (orders.value   || []).length : "—",
        payments: payments.status === "fulfilled" ? (payments.value ?? 0)         : "—",
        wallets:  undefined,
      });

      // Chart data (parallel)
      const [tp, cat, pr, mo, misData] = await Promise.allSettled([
        getTopProducts(10),
        getStatsByCategory(),
        getStatsByPriceRange(),
        getMonthlyStats(),
        getMISReport(),
      ]);
      if (cancelled) return;

      if (tp.status === "fulfilled")      setTopProducts(tp.value     || []);
      if (cat.status === "fulfilled")     setCategories(cat.value     || []);
      if (pr.status === "fulfilled")      setPriceRanges(pr.value     || []);
      if (mo.status === "fulfilled")      setMonthly(mo.value         || []);
      if (misData.status === "fulfilled") setMis(misData.value        || []);

      const failed = [tp, cat, pr, mo, misData].find((r) => r.status === "rejected");
      if (failed) setError("Some chart data could not be loaded.");
    })();

    return () => { cancelled = true; };
  }, []);

  return (
    <PageShell type="admin" eyebrow="Ops Console" title="Dashboard">

      {/* ── KPI Cards ── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((kpi) => (
          <Card key={kpi.key} className="!p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-600/60">
              {kpi.label}
            </p>
            <p className="mt-2 font-display text-3xl font-semibold text-ink-900">
              {fmt(counts[kpi.key])}
            </p>
            <p className="mt-1 text-xs text-ink-600/50">{kpi.hint}</p>
          </Card>
        ))}
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-700">
          {error}
        </div>
      )}

      {/* ── Row 1: Top Products + Category Breakdown ── */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">

        {/* Top Products bar chart */}
        <Card className="!p-5">
          <SectionTitle>Top Products by Orders</SectionTitle>
          {!topProducts ? (
            <EmptyState text="Loading…" />
          ) : topProducts.length === 0 ? (
            <EmptyState text="No confirmed orders yet" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topProducts} margin={{ top: 4, right: 8, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="product_name"
                  tick={{ fontSize: 11 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  formatter={(v, name) =>
                    name === "revenue" ? [currency(v), "Revenue"] : [v, "Orders"]
                  }
                />
                <Legend />
                <Bar dataKey="order_count" name="Orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Category breakdown pie chart */}
        <Card className="!p-5">
          <SectionTitle>Sales by Category</SectionTitle>
          {!categories ? (
            <EmptyState text="Loading…" />
          ) : categories.length === 0 ? (
            <EmptyState text="No category data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="order_count"
                  nameKey="category_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ category_name, percent }) =>
                    `${category_name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
                >
                  {categories.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, name, props) => [
                    `${v} orders · ${currency(props.payload.revenue)}`,
                    props.payload.category_name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* ── Row 2: Price Range + Monthly Trend ── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">

        {/* Orders by price range */}
        <Card className="!p-5">
          <SectionTitle>Orders by Price Range</SectionTitle>
          {!priceRanges ? (
            <EmptyState text="Loading…" />
          ) : priceRanges.length === 0 ? (
            <EmptyState text="No order data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={priceRanges} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="price_range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="order_count" name="Orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Monthly revenue + order trend */}
        <Card className="!p-5">
          <SectionTitle>Monthly Revenue &amp; Orders</SectionTitle>
          {!monthly ? (
            <EmptyState text="Loading…" />
          ) : monthly.length === 0 ? (
            <EmptyState text="No monthly data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthly} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left"  tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v, name) =>
                    name === "Revenue" ? [currency(v), "Revenue"] : [v, "Orders"]
                  }
                />
                <Legend />
                <Line yAxisId="left"  type="monotone" dataKey="order_count" name="Orders"  stroke="#6366f1" strokeWidth={2} dot />
                <Line yAxisId="right" type="monotone" dataKey="revenue"     name="Revenue" stroke="#10b981" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* ── MIS Report Table ── */}
      <div className="mt-6">
        <Card className="!p-5">
          <SectionTitle>MIS Report — Product Sales Summary</SectionTitle>
          {!mis ? (
            <EmptyState text="Loading…" />
          ) : mis.length === 0 ? (
            <EmptyState text="No confirmed orders yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-900/10 text-left text-xs uppercase tracking-wide text-ink-600/60">
                    <th className="pb-2 pr-4">Product</th>
                    <th className="pb-2 pr-4 text-right">Orders</th>
                    <th className="pb-2 pr-4 text-right">Qty Sold</th>
                    <th className="pb-2 pr-4 text-right">Revenue</th>
                    <th className="pb-2 text-right">Avg Order Value</th>
                  </tr>
                </thead>
                <tbody>
                  {mis.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-ink-900/5 last:border-0 hover:bg-ink-900/[0.02]"
                    >
                      <td className="py-2 pr-4 font-medium text-ink-900">
                        {row.product_name}
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums text-ink-700">
                        {row.total_orders}
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums text-ink-700">
                        {row.total_quantity}
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums font-medium text-emerald-700">
                        {currency(row.total_revenue)}
                      </td>
                      <td className="py-2 text-right tabular-nums text-ink-700">
                        {currency(row.avg_order_value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

    </PageShell>
  );
}
