import PageShell from "../../components/PageShell";
import Card from "../../components/Card";

const KPIS = [
  { label: "Products", hint: "in catalog" },
  { label: "Orders", hint: "all time" },
  { label: "Payments", hint: "processed" },
  { label: "Wallet Users", hint: "with balance" },
];

export default function AdminDashboard() {
  return (
    <PageShell type="admin" eyebrow="Ops Console" title="Dashboard">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((kpi) => (
          <Card key={kpi.label} className="!p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-600/60">
              {kpi.label}
            </p>
            <p className="mt-2 font-display text-3xl font-semibold text-ink-900">—</p>
            <p className="mt-1 text-xs text-ink-600/50">{kpi.hint}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-ink-900/15 bg-white/60 p-6 text-sm text-ink-600">
        Aggregate metrics endpoint isn&apos;t wired up yet — figures will
        populate here once the reporting API is available. Use{" "}
        <span className="font-medium text-ink-900">Products</span>,{" "}
        <span className="font-medium text-ink-900">Orders</span>, and{" "}
        <span className="font-medium text-ink-900">Payments</span> in the
        sidebar to work with live data.
      </div>
    </PageShell>
  );
}
