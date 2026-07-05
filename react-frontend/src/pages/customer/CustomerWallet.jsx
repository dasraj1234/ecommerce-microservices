import Sidebar from "../../components/Sidebar";

// Wallet balance view — BLOCKED on the backend.
// payment-wallet-service currently has only a WalletService.debit() stub and
// NO controller/endpoint to read a balance (TASK raise R5). Until an endpoint
// like GET /wallet/{userId} exists, this stays a placeholder rather than a
// button that calls nothing.
export default function CustomerWallet() {
  return (
    <div className="layout">
      <Sidebar type="customer" />
      <div className="main-content">
        <h1>Wallet</h1>

        <div className="card">
          <h3>Current Balance</h3>
          <div className="balance">₹—</div>
          <p style={{ color: "#b45309" }}>
            Wallet balance isn&apos;t available yet — the payment service has no
            balance endpoint (pending backend R5). Wallet <em>payments</em> work
            via the Pay with Wallet option at checkout.
          </p>
        </div>
      </div>
    </div>
  );
}
