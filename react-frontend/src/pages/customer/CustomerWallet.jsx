import PageShell from "../../components/PageShell";
import Card from "../../components/Card";

// Wallet balance view — BLOCKED on the backend.
// payment-wallet-service currently has only a WalletService.debit() stub and
// NO controller/endpoint to read a balance (TASK raise R5). Until an endpoint
// like GET /wallet/{userId} exists, this stays a placeholder rather than a
// button that calls nothing.
export default function CustomerWallet() {
  return (
    <PageShell type="customer" eyebrow="Storefront" title="Wallet">
      <Card title="Current balance" className="max-w-md">
        <p className="font-mono text-4xl font-semibold text-ink-900">₹—</p>
        <div className="mt-4 rounded-lg border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand-dark">
          Balance isn&apos;t available yet — the payment service has no
          balance endpoint (pending backend work). Wallet{" "}
          <span className="font-medium">payments</span> still work via the
          "Pay with wallet" option at checkout.
        </div>
      </Card>
    </PageShell>
  );
}
