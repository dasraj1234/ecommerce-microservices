import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import {
  createOrder,
  cancelOrder,
  getOrderHistory,
  getAllOrders,
} from "../../api/orders";

// Admin order management.
// Backend: POST /orders/create, PATCH /orders/{id}/cancel,
//          GET /orders/all, GET /orders/history/{userId}  (product-order @ :8082)
const EMPTY_ORDER = { userId: "", productId: "", quantity: "", totalAmount: "" };

export default function AdminOrders() {
  const [form, setForm] = useState(EMPTY_ORDER);
  const [cancelId, setCancelId] = useState("");
  const [historyUserId, setHistoryUserId] = useState("");
  const [orders, setOrders] = useState(null); // null = not yet loaded
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState("");

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Load orders: all users when the filter is blank, else that user's history.
  const loadOrders = async () => {
    setBusy("orders");
    setStatus("");
    try {
      const data = historyUserId.trim()
        ? await getOrderHistory(historyUserId.trim())
        : await getAllOrders();
      setOrders(data || []);
    } catch (err) {
      setStatus(`[ERROR] ${err.message || "Could not load orders."}`);
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
      setStatus("[ERROR] User ID and Product ID are required.");
      return;
    }
    setBusy("create");
    setStatus("");
    try {
      const result = await createOrder({
        userId: form.userId.trim(),
        productId: form.productId.trim(),
        quantity: parseInt(form.quantity, 10),
        totalAmount: parseFloat(form.totalAmount),
      });
      setStatus(`[SUCCESS] Order placed — ${result.orderId} (${result.status})`);
      setForm(EMPTY_ORDER);
      loadOrders();
    } catch (err) {
      setStatus(`[ERROR] ${err.message || "Could not create order."}`);
    } finally {
      setBusy("");
    }
  };

  const cancel = async () => {
    if (!cancelId.trim()) {
      setStatus("[ERROR] Enter an order id to cancel.");
      return;
    }
    setBusy("cancel");
    setStatus("");
    try {
      const result = await cancelOrder(cancelId.trim());
      setStatus(`[SUCCESS] Order ${result.orderId} — ${result.status}`);
      setCancelId("");
      loadOrders(); // reflect the new status in the table
    } catch (err) {
      setStatus(`[ERROR] ${err.message || "Could not cancel order."}`);
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="layout">
      <Sidebar type="admin" />
      <div className="main-content">
        <div className="page-title">Orders Management</div>

        {status && (
          <p
            style={{
              marginBottom: 16,
              fontWeight: 600,
              color: status.startsWith("[ERROR]") ? "#dc2626" : "#16a34a",
            }}
          >
            {status.replace(/^\[(ERROR|SUCCESS|INFO)\]\s*/, "")}
          </p>
        )}

        <div className="card">
          <h3>Create Order</h3>
          <input
            name="userId"
            placeholder="User ID"
            value={form.userId}
            onChange={onChange}
          />
          <input
            name="productId"
            placeholder="Product ID"
            value={form.productId}
            onChange={onChange}
          />
          <input
            name="quantity"
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={onChange}
          />
          <input
            name="totalAmount"
            type="number"
            placeholder="Total Amount"
            value={form.totalAmount}
            onChange={onChange}
          />
          <button onClick={create} disabled={busy === "create"}>
            {busy === "create" ? "Creating..." : "Create Order"}
          </button>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <h3>Cancel Order</h3>
          <input
            placeholder="Order ID"
            value={cancelId}
            onChange={(e) => setCancelId(e.target.value)}
          />
          <button onClick={cancel} disabled={busy === "cancel"}>
            {busy === "cancel" ? "Cancelling..." : "Cancel Order"}
          </button>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <h3>
            All Orders
            {orders && (
              <span style={{ fontWeight: 400, color: "#6b7280", fontSize: 14 }}>
                {" "}
                ({orders.length})
              </span>
            )}
          </h3>

          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <input
              placeholder="Filter by User ID (blank = all)"
              value={historyUserId}
              onChange={(e) => setHistoryUserId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadOrders()}
              style={{ flex: 1 }}
            />
            <button
              onClick={loadOrders}
              disabled={busy === "orders"}
              style={{ marginTop: 12 }}
            >
              {busy === "orders" ? "Loading..." : historyUserId.trim() ? "Filter" : "Refresh"}
            </button>
            {historyUserId.trim() && (
              <button
                onClick={() => {
                  setHistoryUserId("");
                  // load all after clearing (state update is async, so pass through)
                  setTimeout(loadOrders, 0);
                }}
                disabled={busy === "orders"}
                style={{ marginTop: 12, background: "#e5e7eb", color: "#374151" }}
              >
                Clear
              </button>
            )}
          </div>

          <table
            style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}
          >
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                <th style={{ padding: 8 }}>Order ID</th>
                <th style={{ padding: 8 }}>User ID</th>
                <th style={{ padding: 8 }}>Amount</th>
                <th style={{ padding: 8 }}>Status</th>
                <th style={{ padding: 8 }}>Payment ID</th>
                <th style={{ padding: 8 }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {orders === null ? (
                <tr>
                  <td style={{ padding: 8 }} colSpan={6}>
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td style={{ padding: 8 }} colSpan={6}>
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr
                    key={o.orderId}
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                  >
                    <td style={{ padding: 8 }}>{o.orderId}</td>
                    <td style={{ padding: 8 }}>{o.userId}</td>
                    <td style={{ padding: 8 }}>₹{o.totalAmount}</td>
                    <td style={{ padding: 8 }}>{o.status}</td>
                    <td style={{ padding: 8 }}>{o.paymentId || "-"}</td>
                    <td style={{ padding: 8 }}>{o.createdDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
