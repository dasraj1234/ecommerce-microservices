import { useState } from "react";
import Sidebar from "../../components/Sidebar";
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
    <div className="layout">
      <Sidebar type="admin" />
      <div className="main-content">
        <div className="page-title">Payments Management</div>

        <div className="card">
          <h3>Search Payment</h3>
          <input
            placeholder="Payment ID"
            value={paymentId}
            onChange={(e) => setPaymentId(e.target.value)}
          />
          <button onClick={search} disabled={loading}>
            {loading ? "Searching..." : "Search Payment"}
          </button>
          {error && <p style={{ color: "#dc2626", marginTop: 12 }}>{error}</p>}
        </div>

        {payment && (
          <div className="card" style={{ marginTop: 20 }}>
            <h3>Payment {payment.paymentId}</h3>
            <p><strong>Order ID:</strong> {payment.orderId}</p>
            <p><strong>User ID:</strong> {payment.userId}</p>
            <p><strong>Amount:</strong> ₹{payment.amount}</p>
            <p><strong>Status:</strong> {payment.status}</p>
          </div>
        )}
      </div>
    </div>
  );
}
