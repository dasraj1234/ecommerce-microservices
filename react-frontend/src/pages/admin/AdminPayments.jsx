import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { getPayment, getAllPayments } from "../../api/payments";

// Admin payments: auto-loaded table of all payments + lookup by id.
// Backend: GET /payments/all, GET /payments/{paymentId}  (payment-wallet @ :8083)
export default function AdminPayments() {
  const [payments, setPayments] = useState(null); // null = loading
  const [loadError, setLoadError] = useState("");

  const [paymentId, setPaymentId] = useState("");
  const [match, setMatch] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [searching, setSearching] = useState(false);

  const loadAll = async () => {
    setLoadError("");
    try {
      const data = await getAllPayments();
      setPayments(data || []);
    } catch (err) {
      setLoadError(err.message || "Could not load payments.");
      setPayments([]);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const search = async () => {
    if (!paymentId.trim()) {
      setSearchError("Enter a payment id.");
      setMatch(null);
      return;
    }
    setSearching(true);
    setSearchError("");
    setMatch(null);
    try {
      const data = await getPayment(paymentId.trim());
      setMatch(data);
    } catch (err) {
      setSearchError(err.message || "Payment not found.");
    } finally {
      setSearching(false);
    }
  };

  const statusColor = (s) =>
    s === "SUCCESS" ? "#16a34a" : s === "FAILED" ? "#dc2626" : "#b45309";

  const row = (p, key) => (
    <tr key={key} style={{ borderBottom: "1px solid #f3f4f6" }}>
      <td style={{ padding: 8 }}>{p.paymentId}</td>
      <td style={{ padding: 8 }}>{p.orderId}</td>
      <td style={{ padding: 8 }}>{p.userId}</td>
      <td style={{ padding: 8 }}>₹{p.amount}</td>
      <td style={{ padding: 8, color: statusColor(p.status), fontWeight: 600 }}>
        {p.status}
      </td>
      <td style={{ padding: 8 }}>{p.createdDate || "—"}</td>
    </tr>
  );

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
            onChange={(e) => {
              setPaymentId(e.target.value);
              setSearchError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <button onClick={search} disabled={searching}>
            {searching ? "Searching..." : "Search Payment"}
          </button>
          {searchError && (
            <p style={{ color: "#dc2626", marginTop: 12 }}>{searchError}</p>
          )}

          {match && (
            <table
              style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}
            >
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                  <th style={{ padding: 8 }}>Payment ID</th>
                  <th style={{ padding: 8 }}>Order ID</th>
                  <th style={{ padding: 8 }}>User ID</th>
                  <th style={{ padding: 8 }}>Amount</th>
                  <th style={{ padding: 8 }}>Status</th>
                  <th style={{ padding: 8 }}>Created</th>
                </tr>
              </thead>
              <tbody>{row(match, "match")}</tbody>
            </table>
          )}
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <h3>
            All Payments
            {payments && (
              <span style={{ fontWeight: 400, color: "#6b7280", fontSize: 14 }}>
                {" "}
                ({payments.length})
              </span>
            )}
          </h3>

          <button onClick={loadAll}>Refresh</button>

          {loadError && (
            <p style={{ color: "#dc2626", marginTop: 12 }}>{loadError}</p>
          )}

          <table
            style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}
          >
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                <th style={{ padding: 8 }}>Payment ID</th>
                <th style={{ padding: 8 }}>Order ID</th>
                <th style={{ padding: 8 }}>User ID</th>
                <th style={{ padding: 8 }}>Amount</th>
                <th style={{ padding: 8 }}>Status</th>
                <th style={{ padding: 8 }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {payments === null ? (
                <tr>
                  <td style={{ padding: 8 }} colSpan={6}>
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td style={{ padding: 8 }} colSpan={6}>
                    No payments found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => row(p, p.paymentId))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
