import { useState } from "react";
import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Field from "../../components/Field";
import Button from "../../components/Button";
import IdTag from "../../components/IdTag";
import StatusBadge from "../../components/StatusBadge";
import { createOrder, cancelOrder, getOrderHistory } from "../../api/orders";

// Admin order management.
// Backend: POST /orders/create, PATCH /orders/{id}/cancel,
//          GET /orders/history/{userId}  (product-order @ :8082)
const EMPTY_ORDER = { userId: "", productId: "", quantity: "", totalAmount: "" };

export default function AdminOrders() {
  const [form, setForm] = useState(EMPTY_ORDER);
  const [cancelId, setCancelId] = useState("");
  const [historyUserId, setHistoryUserId] = useState("");
  const [orders, setOrders] = useState([]);
  const [log, setLog] = useState([{ level: "info", text: "Orders console ready." }]);
  const [busy, setBusy] = useState("");

  const pushLog = (level, text) => setLog((l) => [{ level, text }, ...l].slice(0, 6));

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const create = async () => {
    if (!form.userId.trim() || !form.productId.trim()) {
      pushLog("error", "User ID and Product ID are required.");
      return;
    }
    setBusy("create");
    try {
      const result = await createOrder({
        userId: form.userId.trim(),
        productId: form.productId.trim(),
        quantity: parseInt(form.quantity, 10),
        totalAmount: parseFloat(form.totalAmount),
      });
      pushLog("success", `Order placed — ${result.orderId} (${result.status})`);
      setForm(EMPTY_ORDER);
    } catch (err) {
      pushLog("error", err.message || "Could not create order.");
    } finally {
      setBusy("");
    }
  };

  const cancel = async () => {
    if (!cancelId.trim()) {
      pushLog("error", "Enter an order id to cancel.");
      return;
    }
    setBusy("cancel");
    try {
      const result = await cancelOrder(cancelId.trim());
      pushLog("success", `Order ${result.orderId} — ${result.status}`);
      setCancelId("");
      if (historyUserId.trim()) loadHistory();
    } catch (err) {
      pushLog("error", err.message || "Could not cancel order.");
    } finally {
      setBusy("");
    }
  };

  const loadHistory = async () => {
    if (!historyUserId.trim()) {
      pushLog("error", "Enter a user id to load history.");
      return;
    }
    setBusy("history");
    try {
      const data = await getOrderHistory(historyUserId.trim());
      setOrders(data || []);
      pushLog("success", `History loaded (${data ? data.length : 0} orders).`);
    } catch (err) {
      pushLog("error", err.message || "Could not load history.");
      setOrders([]);
    } finally {
      setBusy("");
    }
  };

  return (
    <PageShell type="admin" eyebrow="Ops Console" title="Orders Management">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Create order">
          <div className="space-y-4">
            <Field name="userId" label="User ID" placeholder="USER-1001" value={form.userId} onChange={onChange} />
            <Field name="productId" label="Product ID" placeholder="PROD-1001" value={form.productId} onChange={onChange} />
            <div className="grid grid-cols-2 gap-3">
              <Field name="quantity" type="number" label="Quantity" placeholder="1" value={form.quantity} onChange={onChange} />
              <Field name="totalAmount" type="number" label="Total amount" placeholder="0.00" value={form.totalAmount} onChange={onChange} />
            </div>
            <Button variant="brand" onClick={create} disabled={busy === "create"} className="w-full">
              {busy === "create" ? "Creating…" : "Create order"}
            </Button>
          </div>
        </Card>

        <Card title="Cancel order">
          <div className="space-y-4">
            <Field label="Order ID" placeholder="ORD-1001" value={cancelId} onChange={(e) => setCancelId(e.target.value)} />
            <Button variant="danger" onClick={cancel} disabled={busy === "cancel"} className="w-full">
              {busy === "cancel" ? "Cancelling…" : "Cancel order"}
            </Button>
          </div>
        </Card>
      </div>

      <Card title="Order history" subtitle="Look up all orders for a given user" className="mt-6">
        <div className="mb-5 flex flex-wrap items-end gap-3">
          <Field
            label="User ID"
            placeholder="USER-1001"
            value={historyUserId}
            onChange={(e) => setHistoryUserId(e.target.value)}
            className="max-w-xs flex-1"
          />
          <Button variant="outline" onClick={loadHistory} disabled={busy === "history"}>
            {busy === "history" ? "Loading…" : "Load history"}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink-900/10 text-left text-xs uppercase tracking-wide text-ink-600/60">
                <th className="py-2.5 pr-4 font-medium">Order</th>
                <th className="py-2.5 pr-4 font-medium">User</th>
                <th className="py-2.5 pr-4 font-medium">Amount</th>
                <th className="py-2.5 pr-4 font-medium">Status</th>
                <th className="py-2.5 pr-4 font-medium">Payment</th>
                <th className="py-2.5 pr-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td className="py-6 text-ink-600/60" colSpan={6}>
                    No orders loaded.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.orderId} className="border-b border-ink-900/5 last:border-0">
                    <td className="py-3 pr-4"><IdTag>{o.orderId}</IdTag></td>
                    <td className="py-3 pr-4"><IdTag>{o.userId}</IdTag></td>
                    <td className="py-3 pr-4 font-mono text-ink-900">₹{o.totalAmount}</td>
                    <td className="py-3 pr-4"><StatusBadge status={o.status} /></td>
                    <td className="py-3 pr-4">{o.paymentId ? <IdTag>{o.paymentId}</IdTag> : "—"}</td>
                    <td className="py-3 pr-4 text-ink-600">{o.createdDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-6 rounded-2xl bg-ink-900 p-5 font-mono text-xs">
        <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-white/30">Console</p>
        <div className="space-y-1.5">
          {log.map((entry, i) => (
            <p
              key={i}
              className={
                entry.level === "error"
                  ? "text-red-400"
                  : entry.level === "success"
                  ? "text-emerald-400"
                  : "text-white/50"
              }
            >
              {entry.level === "error" ? "✕" : entry.level === "success" ? "✓" : "›"} {entry.text}
            </p>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
