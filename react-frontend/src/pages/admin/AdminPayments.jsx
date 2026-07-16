import { useState } from "react";
import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Field from "../../components/Field";
import Button from "../../components/Button";
import IdTag from "../../components/IdTag";
import StatusBadge from "../../components/StatusBadge";
import { getPayment } from "../../api/payments";

// Admin: look up a single payment by id.
// Backend: GET /payments/{paymentId}  (payment-wallet-service @ :8083)
export default function AdminPayments() {
  const [paymentId, setPaymentId] = useState("");
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!paymentId.trim()) {
      setError("Enter a payment id.");
      return;
    }
    setError("");
    setLoading(true);
    setPayment(null);
    try {
      const data = await getPayment(paymentId.trim());
      setPayment(data);
    } catch (err) {
      setError(err.message || "Payment not found.");
    } finally {
      setLoading(false);
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
            />
            <Button variant="brand" onClick={search} disabled={loading} className="w-full">
              {loading ? "Searching…" : "Search payment"}
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
    </PageShell>
  );
}
