import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Button from "../../components/Button";
import IdTag from "../../components/IdTag";
import StatusBadge from "../../components/StatusBadge";
import { getWallet, getWalletHistory } from "../../api/wallet";
import { getUserId } from "../../auth/session";

// Wallet balance + transactions for the logged-in customer.
// Backend: GET /wallet/{userId}, GET /wallet/history/{userId}
//          (payment-wallet-service @ :8083, via the gateway)
// userId comes from the signed JWT claim — never entered.
export default function CustomerWallet() {
  const userId = getUserId();
  const [wallet, setWallet] = useState(null); // null = loading, false = none yet
  const [txns, setTxns] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!userId) {
      setError("Could not determine your account id. Please log out and log back in.");
      setWallet(false);
      setTxns([]);
      return;
    }
    setLoading(true);
    setError("");

    // A user with no wallet yet 404s on the details call, but history still
    // returns [] — so fetch them independently and treat 404 as "no wallet".
    const [w, h] = await Promise.allSettled([
      getWallet(userId),
      getWalletHistory(userId),
    ]);

    if (w.status === "fulfilled") {
      setWallet(w.value);
    } else {
      setWallet(false); // no wallet provisioned yet
    }
    setTxns(h.status === "fulfilled" ? h.value || [] : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const detail = (label, value) => (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-600/60">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );

  return (
    <PageShell type="customer" eyebrow="Storefront" title="Wallet">
      <div className="mb-4 flex justify-end">
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-2.5 text-sm text-red-600">
          {error}
        </p>
      )}

      <Card title="Wallet details" className="max-w-2xl">
        {wallet === null ? (
          <p className="py-6 text-sm text-ink-600/60">Loading wallet…</p>
        ) : wallet === false ? (
          <div className="py-8 text-center">
            <p className="text-sm font-medium text-ink-900">No wallet yet.</p>
            <p className="mt-1 text-sm text-ink-600/60">
              You don&apos;t have a wallet set up{userId ? ` for ${userId}` : ""}. Pay
              by Razorpay at checkout, or ask an admin to provision a wallet.
            </p>
          </div>
        ) : (
          <>
            <p className="font-mono text-4xl font-semibold text-teal-dark">
              ₹{wallet.balance}
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-4">
              {detail("User", <IdTag>{wallet.userId}</IdTag>)}
              {detail("Wallet", <IdTag>{wallet.walletId}</IdTag>)}
              {detail("Status", <StatusBadge status={wallet.status} />)}
              {detail(
                "Last transaction",
                <span className="text-ink-900">{wallet.lastTransactionDate || "—"}</span>
              )}
            </dl>
          </>
        )}
      </Card>

      <Card
        title="Wallet transactions"
        subtitle={txns && txns.length ? `${txns.length} transaction${txns.length === 1 ? "" : "s"}` : undefined}
        className="mt-6"
      >
        {txns === null ? (
          <p className="py-6 text-sm text-ink-600/60">Loading transactions…</p>
        ) : txns.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-600/60">
            No wallet transactions yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink-900/10 text-left text-xs uppercase tracking-wide text-ink-600/60">
                  <th className="py-2.5 pr-4 font-medium">Date</th>
                  <th className="py-2.5 pr-4 font-medium">Payment</th>
                  <th className="py-2.5 pr-4 font-medium">Order</th>
                  <th className="py-2.5 pr-4 font-medium">Type</th>
                  <th className="py-2.5 pr-4 font-medium">Amount</th>
                  <th className="py-2.5 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {txns.map((t) => (
                  <tr key={t.transactionId} className="border-b border-ink-900/5 last:border-0">
                    <td className="py-3 pr-4 text-ink-600">{t.transactionDate}</td>
                    <td className="py-3 pr-4">{t.paymentId ? <IdTag>{t.paymentId}</IdTag> : "—"}</td>
                    <td className="py-3 pr-4">{t.orderId ? <IdTag>{t.orderId}</IdTag> : "—"}</td>
                    <td className="py-3 pr-4 font-medium text-ink-900">{t.transactionType}</td>
                    <td className="py-3 pr-4 font-mono text-ink-900">₹{t.amount}</td>
                    <td className="py-3 pr-4"><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageShell>
  );
}
