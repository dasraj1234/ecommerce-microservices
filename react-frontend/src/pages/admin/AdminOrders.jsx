import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Field from "../../components/Field";
import Button from "../../components/Button";
import IdTag from "../../components/IdTag";
import StatusBadge from "../../components/StatusBadge";
import {
  createOrder,
  cancelOrder,
  getOrderHistory,
  getAllOrders,
} from "../../api/orders";

// Admin order management.
// Backend: POST /orders/create, PATCH /orders/{id}/cancel,
//          GET /orders/all (admin), GET /orders/history/{userId}
//          (product-order @ :8082, via the gateway)
const EMPTY_ORDER = { userId: "", productId: "", quantity: "", totalAmount: "" };

export default function AdminOrders() {
  const [form, setForm] = useState(EMPTY_ORDER);
  const [cancelId, setCancelId] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [orders, setOrders] = useState(null); // null = loading
  const [log, setLog] = useState([{ level: "info", text: "Orders console ready." }]);
  const [busy, setBusy] = useState("");

  const pushLog = (level, text) => setLog((l) => [{ level, text }, ...l].slice(0, 6));

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Blank filter = every order across all users; otherwise that user's history.
  const loadOrders = async () => {
    setBusy("orders");
    try {
      const data = filterUserId.trim()
        ? await getOrderHistory(filterUserId.trim())
        : await getAllOrders();
      setOrders(data || []);
      pushLog("success", `Loaded ${data ? data.length : 0} order(s).`);
    } catch (err) {
      pushLog("error", err.message || "Could not load orders.");
      setOrders([]);
    } finally {
      setBusy("");
    }
  };

  // Auto-load all orders when the page opens.
  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      loadOrders();
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
      loadOrders();
    } catch (err) {
      pushLog("error", err.message || "Could not cancel order.");
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

      <Card
        title="All orders"
        subtitle={
          orders
            ? `${orders.length} order${orders.length === 1 ? "" : "s"}${
                filterUserId.trim() ? ` for ${filterUserId.trim()}` : " across all users"
              }`
            : "Loading…"
        }
        className="mt-6"
      >
        <div className="mb-5 flex flex-wrap items-end gap-3">
          <Field
            label="Filter by user ID (blank = all)"
            placeholder="USER-1001"
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadOrders()}
            className="max-w-xs flex-1"
          />
          <Button variant="outline" onClick={loadOrders} disabled={busy === "orders"}>
            {busy === "orders" ? "Loading…" : filterUserId.trim() ? "Filter" : "Refresh"}
          </Button>
          {filterUserId.trim() && (
            <Button
              variant="outline"
              onClick={() => {
                setFilterUserId("");
                setTimeout(loadOrders, 0);
              }}
              disabled={busy === "orders"}
            >
              Clear
            </Button>
          )}
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
              {orders === null ? (
                <tr>
                  <td className="py-6 text-ink-600/60" colSpan={6}>Loading orders…</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td className="py-6 text-ink-600/60" colSpan={6}>No orders found.</td>
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

      <div className="surface-ink-panel mt-6 rounded-2xl p-5 font-mono text-xs">
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
