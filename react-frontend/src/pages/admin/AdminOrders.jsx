import { useState } from "react";
import Sidebar from "../../components/Sidebar";
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
  const [status, setStatus] = useState("[INFO] Orders Console Ready");
  const [busy, setBusy] = useState("");

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

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
      // Refresh history if we're viewing the same user's orders.
      if (historyUserId.trim()) loadHistory();
    } catch (err) {
      setStatus(`[ERROR] ${err.message || "Could not cancel order."}`);
    } finally {
      setBusy("");
    }
  };

  const loadHistory = async () => {
    if (!historyUserId.trim()) {
      setStatus("[ERROR] Enter a user id to load history.");
      return;
    }
    setBusy("history");
    setStatus("");
    try {
      const data = await getOrderHistory(historyUserId.trim());
      setOrders(data || []);
      setStatus(`[SUCCESS] History loaded (${data ? data.length : 0} orders)`);
    } catch (err) {
      setStatus(`[ERROR] ${err.message || "Could not load history."}`);
      setOrders([]);
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="layout">
      <Sidebar type="admin" />
      <div className="main-content">
        <div className="page-title">Orders Management</div>

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
          <h3>Order History</h3>
          <input
            placeholder="User ID"
            value={historyUserId}
            onChange={(e) => setHistoryUserId(e.target.value)}
          />
          <button onClick={loadHistory} disabled={busy === "history"}>
            {busy === "history" ? "Loading..." : "Load History"}
          </button>

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
              {orders.length === 0 ? (
                <tr>
                  <td style={{ padding: 8 }} colSpan={6}>
                    No orders loaded.
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

        <div className="console" style={{ marginTop: 20 }}>
          {status}
        </div>
      </div>
    </div>
  );
}
