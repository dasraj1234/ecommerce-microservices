import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Field from "../../components/Field";
import Button from "../../components/Button";
import IdTag from "../../components/IdTag";
import StatusBadge from "../../components/StatusBadge";
import { getPayment, getAllPayments } from "../../api/payments";

// Admin payments: every payment (auto-loaded) + lookup by id.
// Backend: GET /payments/all (admin), GET /payments/{paymentId}
//          (payment-wallet-service @ :8083, via the gateway)
export default function AdminPayments() {
  const [payments, setPayments] = useState(null); // null = loading
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(false);

  const [paymentId, setPaymentId] = useState("");
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await getAllPayments();
      setPayments(data || []);
    } catch (err) {
      setLoadError(err.message || "Could not load payments.");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const search = async () => {
    if (!paymentId.trim()) {
      setError("Enter a payment id.");
      return;
    }
    setError("");
    setSearching(true);
    setPayment(null);
    try {
      const data = await getPayment(paymentId.trim());
      setPayment(data);
    } catch (err) {
      setError(err.message || "Payment not found.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <PageShell type="admin" eyebrow="Ops Console" title="Payments Management">
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card title="Search payment">
          <div className="space-y-4">
            <Field
              label="Payment ID"
              placeholder="PAY-1001"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
            />
            <Button variant="brand" onClick={search} disabled={searching} className="w-full">
              {searching ? "Searching…" : "Search payment"}
            </Button>
            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-2.5 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
        </Card>

        {payment ? (
          <Card title={`Payment ${payment.paymentId}`}>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-600/60">Order</dt>
                <dd className="mt-1"><IdTag>{payment.orderId}</IdTag></dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-600/60">User</dt>
                <dd className="mt-1"><IdTag>{payment.userId}</IdTag></dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-600/60">Amount</dt>
                <dd className="mt-1 font-mono text-base font-medium text-ink-900">₹{payment.amount}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-600/60">Status</dt>
                <dd className="mt-1"><StatusBadge status={payment.status} /></dd>
              </div>
            </dl>
          </Card>
        ) : (
          <Card className="flex items-center justify-center border-dashed text-sm text-ink-600/60">
            Search a payment ID to see its details here.
          </Card>
        )}
      </div>

      <Card
        title="All payments"
        subtitle={
          payments
            ? `${payments.length} payment${payments.length === 1 ? "" : "s"} across all users`
            : "Loading…"
        }
        className="mt-6"
      >
        <div className="mb-4 flex justify-end">
          <Button variant="outline" onClick={loadAll} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        </div>

        {loadError && (
          <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-2.5 text-sm text-red-600">
            {loadError}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink-900/10 text-left text-xs uppercase tracking-wide text-ink-600/60">
                <th className="py-2.5 pr-4 font-medium">Payment</th>
                <th className="py-2.5 pr-4 font-medium">Order</th>
                <th className="py-2.5 pr-4 font-medium">User</th>
                <th className="py-2.5 pr-4 font-medium">Amount</th>
                <th className="py-2.5 pr-4 font-medium">Status</th>
                <th className="py-2.5 pr-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {payments === null ? (
                <tr>
                  <td className="py-6 text-ink-600/60" colSpan={6}>Loading payments…</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td className="py-6 text-ink-600/60" colSpan={6}>No payments found.</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.paymentId} className="border-b border-ink-900/5 last:border-0">
                    <td className="py-3 pr-4"><IdTag>{p.paymentId}</IdTag></td>
                    <td className="py-3 pr-4"><IdTag>{p.orderId}</IdTag></td>
                    <td className="py-3 pr-4"><IdTag>{p.userId}</IdTag></td>
                    <td className="py-3 pr-4 font-mono text-ink-900">₹{p.amount}</td>
                    <td className="py-3 pr-4"><StatusBadge status={p.status} /></td>
                    <td className="py-3 pr-4 text-ink-600">{p.createdDate || "—"}</td>
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
