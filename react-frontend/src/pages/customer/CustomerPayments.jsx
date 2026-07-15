import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { getUserPayments } from "../../api/payments";
import { getUserId } from "../../auth/session";

// Payment history for the logged-in customer.
// Backend: GET /payments/user/{userId}  (payment-wallet-service @ :8083)
//
// userId is the business id (USER-1001), decoded from the signed JWT claim.
export default function CustomerPayments() {
  const userId = getUserId();
  const [payments, setPayments] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!userId) {
      setError("Could not determine your account id. Please log out and log back in.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await getUserPayments(userId);
      setPayments(data || []);
    } catch (err) {
      setError(err.message || "Could not load payments.");
      setPayments(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="layout">
      <Sidebar type="customer" />
      <div className="main-content">
        <h1>Payment History</h1>

        {(loading || error) && (
          <div className="card">
            {loading && <p>Loading payments...</p>}
            {error && <p style={{ color: "#dc2626" }}>{error}</p>}
          </div>
        )}

        {payments && (
          <div className="card" style={{ marginTop: 20 }}>
            {payments.length === 0 ? (
              <p>No payments found for {userId}.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                    <th style={{ padding: 8 }}>Payment ID</th>
                    <th style={{ padding: 8 }}>Order ID</th>
                    <th style={{ padding: 8 }}>Amount</th>
                    <th style={{ padding: 8 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.paymentId} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: 8 }}>{p.paymentId}</td>
                      <td style={{ padding: 8 }}>{p.orderId}</td>
                      <td style={{ padding: 8 }}>₹{p.amount}</td>
                      <td style={{ padding: 8 }}>{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
