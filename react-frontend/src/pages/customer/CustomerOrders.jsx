import { useState } from "react";
import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Field from "../../components/Field";
import Button from "../../components/Button";
import IdTag from "../../components/IdTag";
import StatusBadge from "../../components/StatusBadge";
import { createOrder } from "../../api/orders";
import { getUserId, setUserId } from "../../auth/session";

// Place an order.
// Backend: POST /orders/create  (product-order-service @ :8082, via Vite proxy)
//   request : { userId, productId, quantity, totalAmount }
//   response: { orderId, status, message } — status CONFIRMED on success.
//
// userId is the business id (USER-1001). Until the username -> USER-xxxx mapping
// endpoint exists (TASK R3), it's entered manually and cached in the session.
const EMPTY_FORM = { productId: "", quantity: "", amount: "" };

export default function CustomerOrders() {
  const [userId, setUserIdInput] = useState(getUserId() || "");
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    setError("");
    setResult(null);

    if (!userId.trim()) {
      setError("Enter your user id (e.g. USER-1001).");
      return;
    }
    if (!form.productId.trim()) {
      setError("Product ID is required.");
      return;
    }
    const quantity = parseInt(form.quantity, 10);
    const totalAmount = parseFloat(form.amount);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError("Quantity must be a positive number.");
      return;
    }
    if (!(totalAmount > 0)) {
      setError("Amount must be greater than 0.");
      return;
    }

    setPlacing(true);
    try {
      setUserId(userId.trim());
      const data = await createOrder({
        userId: userId.trim(),
        productId: form.productId.trim(),
        quantity,
        totalAmount,
      });
      setResult(data);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message || "Could not place order.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <PageShell type="customer" eyebrow="Storefront" title="Place an order">
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card title="Order details">
          <div className="space-y-4">
            <Field label="User ID" placeholder="USER-1001" value={userId} onChange={(e) => setUserIdInput(e.target.value)} />
            <Field name="productId" label="Product ID" placeholder="PROD-1001" value={form.productId} onChange={onChange} />
            <div className="grid grid-cols-2 gap-3">
              <Field name="quantity" type="number" label="Quantity" placeholder="1" value={form.quantity} onChange={onChange} />
              <Field name="amount" type="number" label="Amount" placeholder="0.00" value={form.amount} onChange={onChange} />
            </div>
            <Button variant="brand" onClick={submit} disabled={placing} className="w-full">
              {placing ? "Placing…" : "Place order"}
            </Button>
            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-2.5 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
        </Card>

        {result ? (
          <Card title="Order placed">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-600/60">Order</dt>
                <dd className="mt-1"><IdTag>{result.orderId}</IdTag></dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-600/60">Status</dt>
                <dd className="mt-1"><StatusBadge status={result.status} /></dd>
              </div>
              {result.message && (
                <div className="col-span-2">
                  <dt className="text-xs uppercase tracking-wide text-ink-600/60">Message</dt>
                  <dd className="mt-1 text-ink-900">{result.message}</dd>
                </div>
              )}
            </dl>
          </Card>
        ) : (
          <Card className="flex items-center justify-center border-dashed text-sm text-ink-600/60">
            Your order confirmation will appear here.
          </Card>
        )}
      </div>
    </PageShell>
  );
}
