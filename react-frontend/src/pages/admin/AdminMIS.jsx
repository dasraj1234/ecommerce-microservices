import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Field from "../../components/Field";
import Button from "../../components/Button";
import IdTag from "../../components/IdTag";
import StatusBadge from "../../components/StatusBadge";
import { getPaymentMIS, downloadPaymentMIS } from "../../api/mis";

// Admin Payment MIS — native React port of the old JSP report
// (product-order-service /admin/payment-mis). Data comes from
// GET /admin/payments/mis (payment-wallet-service @ :8083, via the gateway).

const STATUS_OPTIONS = ["ALL", "SUCCESS", "FAILED", "PENDING"];
const METHOD_OPTIONS = ["ALL", "WALLET", "RAZORPAY"];

// Default range: first day of the current month -> today (same as the JSP).
function defaultRange() {
  const today = new Date();
  const first = new Date();
  first.setDate(1);
  const iso = (d) => d.toISOString().split("T")[0];
  return { fromDate: iso(first), toDate: iso(today) };
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
        {label}
      </span>
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-ink-900/10 bg-paper px-3.5 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o === "ALL" ? "All" : o.charAt(0) + o.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
    </label>
  );
}

function SummaryCard({ label, value, tone = "default" }) {
  const tones = {
    default: "text-ink-900",
    success: "text-emerald-600",
    failed: "text-red-600",
  };
  return (
    <div className="rounded-xl border border-ink-900/10 bg-white px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-600/60">{label}</p>
      <p className={`mt-1 font-display text-2xl font-semibold ${tones[tone]}`}>{value}</p>
    </div>
  );
}

export default function AdminMIS() {
  const [filters, setFilters] = useState({
    ...defaultRange(),
    status: "ALL",
    paymentMethod: "ALL",
  });
  const [rows, setRows] = useState(null); // null = not loaded yet
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const setField = (key) => (e) =>
    setFilters((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    if (!filters.fromDate) return "Please select From Date";
    if (!filters.toDate) return "Please select To Date";
    if (filters.fromDate > filters.toDate)
      return "From Date cannot be greater than To Date";
    return "";
  };

  const search = async () => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await getPaymentMIS(filters);
      setRows(data || []);
    } catch (err) {
      setError(err.message || "Could not load the MIS report.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const download = async () => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError("");
    setDownloading(true);
    try {
      await downloadPaymentMIS(filters);
    } catch (err) {
      setError(err.message || "Could not download the Excel file.");
    } finally {
      setDownloading(false);
    }
  };

  // Auto-load on first render, like the JSP's window.onload.
  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = rows || [];
  const totalAmount = list.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const successCount = list.filter((p) => p.status === "SUCCESS").length;
  const failedCount = list.filter((p) => p.status === "FAILED").length;

  return (
    <PageShell type="admin" eyebrow="Ops Console" title="Payment MIS">
      <Card title="Filters">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            label="From Date"
            type="date"
            value={filters.fromDate}
            onChange={setField("fromDate")}
          />
          <Field
            label="To Date"
            type="date"
            value={filters.toDate}
            onChange={setField("toDate")}
          />
          <Select
            label="Status"
            value={filters.status}
            onChange={setField("status")}
            options={STATUS_OPTIONS}
          />
          <Select
            label="Payment Method"
            value={filters.paymentMethod}
            onChange={setField("paymentMethod")}
            options={METHOD_OPTIONS}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="brand" onClick={search} disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </Button>
          <Button variant="outline" onClick={download} disabled={downloading || loading}>
            {downloading ? "Preparing…" : "Download Excel"}
          </Button>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-2.5 text-sm text-red-600">
            {error}
          </p>
        )}
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Total Payments" value={list.length} />
        <SummaryCard
          label="Total Amount"
          value={`₹${totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <SummaryCard label="Success" value={successCount} tone="success" />
        <SummaryCard label="Failed" value={failedCount} tone="failed" />
      </div>

      <Card
        title="Transactions"
        subtitle={
          rows === null
            ? "Loading…"
            : `${list.length} payment${list.length === 1 ? "" : "s"} in range`
        }
        className="mt-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink-900/10 text-left text-xs uppercase tracking-wide text-ink-600/60">
                <th className="py-2.5 pr-4 font-medium">Payment ID</th>
                <th className="py-2.5 pr-4 font-medium">Order ID</th>
                <th className="py-2.5 pr-4 font-medium">User ID</th>
                <th className="py-2.5 pr-4 font-medium">Amount</th>
                <th className="py-2.5 pr-4 font-medium">Method</th>
                <th className="py-2.5 pr-4 font-medium">Status</th>
                <th className="py-2.5 pr-4 font-medium">Payment Date</th>
              </tr>
            </thead>
            <tbody>
              {rows === null ? (
                <tr>
                  <td className="py-6 text-ink-600/60" colSpan={7}>Loading report…</td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td className="py-6 text-ink-600/60" colSpan={7}>No payments found.</td>
                </tr>
              ) : (
                list.map((p) => (
                  <tr key={p.paymentId} className="border-b border-ink-900/5 last:border-0">
                    <td className="py-3 pr-4"><IdTag>{p.paymentId}</IdTag></td>
                    <td className="py-3 pr-4"><IdTag>{p.orderId}</IdTag></td>
                    <td className="py-3 pr-4"><IdTag>{p.userId || "—"}</IdTag></td>
                    <td className="py-3 pr-4 font-mono font-medium text-ink-900">
                      ₹{Number(p.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 pr-4 text-ink-700">{p.paymentMethod || "—"}</td>
                    <td className="py-3 pr-4"><StatusBadge status={p.status} /></td>
                    <td className="py-3 pr-4 text-ink-600">{p.paymentDate || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageShell>
  );
}
