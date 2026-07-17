import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Button from "../../components/Button";
import IdTag from "../../components/IdTag";
import StatusBadge from "../../components/StatusBadge";
import { getUserPayments } from "../../api/payments";
import { getUserId } from "../../auth/session";

// Payment history for the logged-in customer.
// Backend: GET /payments/user/{userId}  (payment-wallet-service @ :8083)
// userId comes from the signed JWT claim (see session.js) — never entered.
export default function CustomerPayments() {
  const userId = getUserId();
  const [payments, setPayments] = useState(null); // null = loading
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!userId) {
      setError("Could not determine your account id. Please log out and log back in.");
      setPayments([]);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await getUserPayments(userId);
      setPayments(data || []);
    } catch (err) {
      setError(err.message || "Could not load payments.");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageShell type="customer" eyebrow="Storefront" title="Payment history">
      <Card
        title="Your payments"
        subtitle={userId ? `Payments made under ${userId}` : undefined}
      >
        <div className="mb-4 flex justify-end">
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-2.5 text-sm text-red-600">
            {error}
          </p>
        )}

        {payments === null ? (
          <p className="py-6 text-sm text-ink-600/60">Loading payments…</p>
        ) : payments.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-600/60">
            No payments yet — they'll appear here once you place an order.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink-900/10 text-left text-xs uppercase tracking-wide text-ink-600/60">
                  <th className="py-2.5 pr-4 font-medium">Payment</th>
                  <th className="py-2.5 pr-4 font-medium">Order</th>
                  <th className="py-2.5 pr-4 font-medium">Amount</th>
                  <th className="py-2.5 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.paymentId} className="border-b border-ink-900/5 last:border-0">
                    <td className="py-3 pr-4"><IdTag>{p.paymentId}</IdTag></td>
                    <td className="py-3 pr-4"><IdTag>{p.orderId}</IdTag></td>
                    <td className="py-3 pr-4 font-mono text-ink-900">₹{p.amount}</td>
                    <td className="py-3 pr-4"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageShell>
  );
}
