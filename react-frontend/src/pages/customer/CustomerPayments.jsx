import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Field from "../../components/Field";
import Button from "../../components/Button";
import IdTag from "../../components/IdTag";
import StatusBadge from "../../components/StatusBadge";
import { getUserPayments } from "../../api/payments";
import { getUserId, setUserId } from "../../auth/session";

// Payment history for the logged-in customer.
// Backend: GET /payments/user/{userId}  (payment-wallet-service @ :8083)
//
// userId is the business id (USER-1001). Until the username -> USER-xxxx mapping
// endpoint exists (TASK R3), it's entered manually and cached in the session.
export default function CustomerPayments() {
  const [userId, setUserIdInput] = useState(getUserId() || "");
  const [payments, setPayments] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async (id) => {
    if (!id) {
      setError("Enter your user id (e.g. USER-1001).");
      return;
    }
    setError("");
    setLoading(true);
    try {
      setUserId(id);
      const data = await getUserPayments(id);
      setPayments(data || []);
    } catch (err) {
      setError(err.message || "Could not load payments.");
      setPayments(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) load(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageShell type="customer" eyebrow="Storefront" title="Payment history">
      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <Field
            label="User ID"
            placeholder="USER-1001"
            value={userId}
            onChange={(e) => setUserIdInput(e.target.value)}
            className="max-w-xs flex-1"
          />
          <Button variant="brand" onClick={() => load(userId)} disabled={loading}>
            {loading ? "Loading…" : "Load payments"}
          </Button>
        </div>
        {error && (
          <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-2.5 text-sm text-red-600">
            {error}
          </p>
        )}
      </Card>

      {payments && (
        <Card title="Results">
          {payments.length === 0 ? (
            <p className="text-sm text-ink-600">No payments found for {userId}.</p>
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
      )}
    </PageShell>
  );
}
