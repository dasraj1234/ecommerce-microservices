import { useEffect, useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Field from "../../components/Field";
import IdTag from "../../components/IdTag";
import StatusBadge from "../../components/StatusBadge";
import { getWallet, getWalletHistory, topupWallet, setWalletPin } from "../../api/wallet";
import { getUserId } from "../../auth/session";

export default function CustomerWallet() {
  const userId = getUserId();
  const [wallet, setWallet] = useState(null);
  const [txns, setTxns] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    if (!userId) {
      setError("Could not determine your account id. Please log out and log back in.");
      setWallet(false);
      setTxns([]);
      return;
    }
    setLoading(true);
    setError("");
    const [w, h] = await Promise.allSettled([
      getWallet(userId),
      getWalletHistory(userId),
    ]);
    setWallet(w.status === "fulfilled" ? w.value : false);
    setTxns(h.status === "fulfilled" ? h.value || [] : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

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

      {/* ── Balance card ── */}
      <BalanceCard wallet={wallet} />

      {/* ── Top-up + Set PIN ── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <TopupCard userId={userId} wallet={wallet} onSuccess={load} />
        <SetPinCard userId={userId} wallet={wallet} />
      </div>

      {/* ── Spending chart ── */}
      <SpendingChart txns={txns} />

      {/* ── Transaction history ── */}
      <TransactionTable txns={txns} />
    </PageShell>
  );
}

// ── Balance ────────────────────────────────────────────────────────────────────
function BalanceCard({ wallet }) {
  if (wallet === null) {
    return (
      <Card title="Wallet details" className="max-w-2xl">
        <p className="py-6 text-sm text-ink-600/60">Loading wallet…</p>
      </Card>
    );
  }
  if (wallet === false) {
    return (
      <Card title="Wallet details" className="max-w-2xl">
        <div className="py-8 text-center">
          <p className="text-sm font-medium text-ink-900">No wallet yet.</p>
          <p className="mt-1 text-sm text-ink-600/60">
            Ask an admin to provision a wallet for your account, then use the Top-up section below to add funds.
          </p>
        </div>
      </Card>
    );
  }

  const isBlocked = wallet.status === "BLOCKED";

  return (
    <Card title="Wallet details" className="max-w-2xl">
      {isBlocked && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-2.5 text-sm text-red-700">
          ⚠️ Your wallet is blocked. Contact support to unblock it.
        </div>
      )}
      <p className="font-mono text-4xl font-semibold text-teal-dark">
        ₹{Number(wallet.balance).toFixed(2)}
      </p>
      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-600/60">User</dt>
          <dd className="mt-1"><IdTag>{wallet.userId}</IdTag></dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-600/60">Wallet</dt>
          <dd className="mt-1"><IdTag>{wallet.walletId}</IdTag></dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-600/60">Status</dt>
          <dd className="mt-1"><StatusBadge status={wallet.status} /></dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-600/60">Last transaction</dt>
          <dd className="mt-1 text-ink-900">{wallet.lastTransactionDate || "—"}</dd>
        </div>
      </dl>
    </Card>
  );
}

// ── Top-up ─────────────────────────────────────────────────────────────────────
function TopupCard({ userId, wallet, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); // { type: "success"|"error", text }

  const submit = async () => {
    setMsg(null);
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      setMsg({ type: "error", text: "Enter a valid amount greater than 0." });
      return;
    }
    if (!userId) {
      setMsg({ type: "error", text: "Session expired. Please log out and log back in." });
      return;
    }
    setBusy(true);
    try {
      await topupWallet({ userId, amount: val });
      setMsg({ type: "success", text: `₹${val} added to your wallet successfully.` });
      setAmount("");
      onSuccess();
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Top-up failed. Try again." });
    } finally {
      setBusy(false);
    }
  };

  const PRESETS = [100, 500, 1000, 2000];

  return (
    <Card title="Recharge wallet" subtitle="Add money to your wallet balance">
      <div className="space-y-4">
        {/* Quick-select preset amounts */}
        <div>
          <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-ink-600">
            Quick add
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(String(p))}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                  amount === String(p)
                    ? "border-brand bg-brand/10 text-brand-dark"
                    : "border-ink-900/10 text-ink-600 hover:bg-ink-900/[0.03]"
                }`}
              >
                ₹{p}
              </button>
            ))}
          </div>
        </div>

        <Field
          type="number"
          min="1"
          label="Custom amount (₹)"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <Button
          variant="brand"
          onClick={submit}
          disabled={busy || wallet === false}
          className="w-full"
        >
          {busy ? "Processing…" : `Add ₹${amount || "0"} to wallet`}
        </Button>

        {wallet === false && (
          <p className="text-xs text-ink-600/60">You need a wallet to top up. Ask an admin to create one.</p>
        )}

        {msg && (
          <p className={`rounded-lg border px-3.5 py-2.5 text-sm ${
            msg.type === "success"
              ? "border-teal-500/20 bg-teal-500/5 text-teal-700"
              : "border-red-500/20 bg-red-500/5 text-red-600"
          }`}>
            {msg.text}
          </p>
        )}
      </div>
    </Card>
  );
}

// ── Set PIN ────────────────────────────────────────────────────────────────────
function SetPinCard({ userId, wallet }) {
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const submit = async () => {
    setMsg(null);
    if (!/^\d{4,6}$/.test(pin)) {
      setMsg({ type: "error", text: "PIN must be 4 to 6 digits." });
      return;
    }
    if (pin !== confirm) {
      setMsg({ type: "error", text: "PINs do not match." });
      return;
    }
    setBusy(true);
    try {
      const { setWalletPin } = await import("../../api/wallet");
      await setWalletPin({ userId, pin });
      setMsg({ type: "success", text: "Wallet PIN set successfully." });
      setPin("");
      setConfirm("");
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Failed to set PIN. Try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Set / Reset PIN" subtitle="Used to authorise wallet payments">
      <div className="space-y-4">
        <Field
          type="password"
          inputMode="numeric"
          maxLength={6}
          label="New PIN (4–6 digits)"
          placeholder="••••••"
          value={pin}
          onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setMsg(null); }}
        />
        <Field
          type="password"
          inputMode="numeric"
          maxLength={6}
          label="Confirm PIN"
          placeholder="••••••"
          value={confirm}
          onChange={(e) => { setConfirm(e.target.value.replace(/\D/g, "")); setMsg(null); }}
        />

        <Button
          variant="outline"
          onClick={submit}
          disabled={busy || wallet === false}
          className="w-full"
        >
          {busy ? "Saving…" : "Set PIN"}
        </Button>

        {msg && (
          <p className={`rounded-lg border px-3.5 py-2.5 text-sm ${
            msg.type === "success"
              ? "border-teal-500/20 bg-teal-500/5 text-teal-700"
              : "border-red-500/20 bg-red-500/5 text-red-600"
          }`}>
            {msg.text}
          </p>
        )}
      </div>
    </Card>
  );
}

// ── Spending chart ─────────────────────────────────────────────────────────────
function SpendingChart({ txns }) {
  // Group DEBIT transactions by month → sum amounts
  const chartData = useMemo(() => {
    if (!txns || txns.length === 0) return [];

    const byMonth = {};
    txns.forEach((t) => {
      // Only show DEBIT (purchases) and CREDIT (top-ups) separately
      if (!t.transactionDate) return;
      const date = new Date(t.transactionDate);
      if (isNaN(date)) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleString("default", { month: "short", year: "2-digit" });
      if (!byMonth[key]) byMonth[key] = { month: label, spent: 0, topup: 0 };

      const amt = parseFloat(t.amount) || 0;
      if (t.transactionType === "DEBIT") byMonth[key].spent += amt;
      if (t.transactionType === "CREDIT") byMonth[key].topup += amt;
    });

    return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));
  }, [txns]);

  if (!txns) return null;
  if (chartData.length === 0) {
    return (
      <Card title="Spending overview" className="mt-6">
        <p className="py-10 text-center text-sm text-ink-600/60">
          No transaction data to chart yet.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Spending overview" subtitle="Monthly debits vs top-ups" className="mt-6">
      <div className="mt-2 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
            <Tooltip
              formatter={(value, name) => [
                `₹${Number(value).toFixed(2)}`,
                name === "spent" ? "Spent" : "Top-up",
              ]}
              contentStyle={{ fontSize: 13, borderRadius: 8 }}
            />
            <Bar dataKey="spent" name="spent" radius={[4, 4, 0, 0]} fill="#ef4444" />
            <Bar dataKey="topup" name="topup" radius={[4, 4, 0, 0]} fill="#14b8a6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center gap-6 text-xs text-ink-600/60">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-500" /> Spent (purchases)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-teal-500" /> Top-up (recharge)
        </span>
      </div>
    </Card>
  );
}

// ── Transaction table ──────────────────────────────────────────────────────────
function TransactionTable({ txns }) {
  return (
    <Card
      title="Transaction history"
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
                  <td className={`py-3 pr-4 font-semibold ${
                    t.transactionType === "DEBIT" ? "text-red-500" : "text-teal-600"
                  }`}>
                    {t.transactionType === "DEBIT" ? "↓ " : "↑ "}
                    {t.transactionType}
                  </td>
                  <td className="py-3 pr-4 font-mono text-ink-900">₹{t.amount}</td>
                  <td className="py-3 pr-4"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
