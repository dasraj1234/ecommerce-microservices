import { useState } from "react";
import Sidebar from "../../components/Sidebar";
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
      setUserId(userId.trim()); // remember for other pages
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
    <div className="layout">
      <Sidebar type="customer" />
      <div className="main-content">
        <h1>Place Order</h1>

        <div className="card">
          <input
            placeholder="USER-1001"
            value={userId}
            onChange={(e) => setUserIdInput(e.target.value)}
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
            name="amount"
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={onChange}
          />
          <button onClick={submit} disabled={placing}>
            {placing ? "Placing..." : "Place Order"}
          </button>
          {error && <p style={{ color: "#dc2626", marginTop: 12 }}>{error}</p>}
        </div>

        {result && (
          <div className="card" style={{ marginTop: 20 }}>
            <h3>Order {result.status === "CONFIRMED" ? "Confirmed" : "Result"}</h3>
            <p>
              <strong>Order ID:</strong> {result.orderId}
            </p>
            <p>
              <strong>Status:</strong> {result.status}
            </p>
            {result.message && (
              <p>
                <strong>Message:</strong> {result.message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
