import { useEffect, useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Field from "../../components/Field";
import IdTag from "../../components/IdTag";
import StatusBadge from "../../components/StatusBadge";
import {
  getWallet, getWalletHistory,
  createWallet, topupWallet,
  setWalletPin, changeWalletPin,
} from "../../api/wallet";
import { getUserId } from "../../auth/session";

// ── Step constants for the guided first-time setup flow ───────────────────────
const STEP_LOADING   = "loading";
const STEP_NO_WALLET = "no_wallet";   // no wallet yet — show Create button
const STEP_SET_PIN   = "set_pin";     // wallet exists but no PIN — show Set PIN form
const STEP_READY     = "ready";       // wallet + PIN exist — show full dashboard

export default function CustomerWallet() {
  const userId = getUserId();
  const [step, setStep]   = useState(STEP_LOADING);
  const [wallet, setWallet] = useState(null);
  const [txns, setTxns]   = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!userId) {
      setError("Session expired. Please log out and log back in.");
      setStep(STEP_NO_WALLET);
      return;
    }
    setLoading(true);
    setError("");

    const [w, h] = await Promise.allSettled([
      getWallet(userId),
      getWalletHistory(userId),
    ]);

    if (w.status === "fulfilled") {
      const wal = w.value;
      setWallet(wal);
      setStep(wal.hasPinSet ? STEP_READY : STEP_SET_PIN);
    } else {
      setWallet(null);
      setStep(STEP_NO_WALLET);
    }

    setTxns(h.status === "fulfilled" ? h.value || [] : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // ── No wallet yet ─────────────────────────────────────────────────────────
  if (step === STEP_LOADING) {
    return (
      <PageShell type="customer" eyebrow="Storefront" title="Wallet">
        <p className="py-10 text-center text-sm text-ink-600/60">Loading wallet…</p>
      </PageShell>
    );
  }

  if (step === STEP_NO_WALLET) {
    return (
      <PageShell type="customer" eyebrow="Storefront" title="Wallet">
        <CreateWalletStep userId={userId} onCreated={(wal) => { setWallet(wal); setStep(STEP_SET_PIN); }} />
      </PageShell>
    );
  }

  // ── Wallet exists but no PIN set yet ──────────────────────────────────────
  if (step === STEP_SET_PIN) {
    return (
      <PageShell type="customer" eyebrow="Storefront" title="Wallet — Set Your PIN">
        <SetPinStep
          userId={userId}
          wallet={wallet}
          onDone={() => {
            // PIN confirmed set by the API — go straight to dashboard
            // without re-fetching (avoids race with hasPinSet propagation).
            setStep(STEP_READY);
            load(); // refresh balance/txns in background
          }}
        />
      </PageShell>
    );
  }

  // ── Full dashboard ────────────────────────────────────────────────────────
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

      <BalanceCard wallet={wallet} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <TopupCard userId={userId} wallet={wallet} onSuccess={load} />
        <ChangePinCard userId={userId} />
      </div>

      <SpendingChart txns={txns} />
      <TransactionTable txns={txns} />
    </PageShell>
  );
}

// ── Step 1: Create Wallet ─────────────────────────────────────────────────────
function CreateWalletStep({ userId, onCreated }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const create = async () => {
    setError("");
    setBusy(true);
    try {
      const wal = await createWallet({ userId });
      onCreated(wal);
    } catch (err) {
      setError(err.message || "Could not create wallet. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card title="Create your wallet" className="w-full max-w-md text-center">
        <div className="space-y-5 py-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-brand-dark">
              <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2M3 7v10a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-4M3 7h16M17 13h2" />
            </svg>
          </div>
          <div>
            <p className="text-base font-semibold text-ink-900">No wallet yet</p>
            <p className="mt-1 text-sm text-ink-600/70">
              Create a wallet to pay for orders without Razorpay. You&apos;ll set a
              secure PIN right after — the PIN will be sent to your registered email.
            </p>
          </div>
          <Button variant="brand" onClick={create} disabled={busy} className="w-full">
            {busy ? "Creating…" : "Create my wallet"}
          </Button>
          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

// ── Step 2: Set PIN (first time) ──────────────────────────────────────────────
function SetPinStep({ userId, wallet, onDone }) {
  const [pin, setPin]         = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy]       = useState(false);
  const [msg, setMsg]         = useState(null);

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
      await setWalletPin({ userId, pin });
      setMsg({
        type: "success",
        text: "PIN set! Check your registered email for confirmation. Redirecting to your wallet…",
      });
      setTimeout(onDone, 2000);
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Failed to set PIN. Try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card
        title="Set your wallet PIN"
        subtitle={`Wallet ${wallet?.walletId} created successfully`}
        className="w-full max-w-md"
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-ink-600/70">
            Choose a 4–6 digit PIN to authorise payments. Your PIN will be
            emailed to your registered address.
          </p>
          <Field
            type="password"
            inputMode="numeric"
            maxLength={6}
            label="New PIN (4–6 digits)"
            placeholder="••••••"
            value={pin}
            autoFocus
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
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <Button variant="brand" onClick={submit} disabled={busy} className="w-full">
            {busy ? "Setting PIN…" : "Set PIN & open wallet"}
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
    </div>
  );
}

// ── Balance card ──────────────────────────────────────────────────────────────
function BalanceCard({ wallet }) {
  if (!wallet) return null;
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

// ── Top-up card ───────────────────────────────────────────────────────────────
function TopupCard({ userId, wallet, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [busy, setBusy]     = useState(false);
  const [msg, setMsg]       = useState(null);
  const PRESETS = [100, 500, 1000, 2000];

  const submit = async () => {
    setMsg(null);
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      setMsg({ type: "error", text: "Enter a valid amount greater than 0." });
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

  return (
    <Card title="Recharge wallet" subtitle="Add money to your wallet balance">
      <div className="space-y-4">
        <div>
          <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-ink-600">Quick add</span>
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
          disabled={busy || wallet?.status === "BLOCKED"}
          className="w-full"
        >
          {busy ? "Processing…" : `Add ₹${amount || "0"} to wallet`}
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

// ── Change PIN card (customer only) ──────────────────────────────────────────
function ChangePinCard({ userId }) {
  const [oldPin, setOldPin]   = useState("");
  const [newPin, setNewPin]   = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy]       = useState(false);
  const [msg, setMsg]         = useState(null);

  const submit = async () => {
    setMsg(null);
    if (!oldPin) {
      setMsg({ type: "error", text: "Enter your current PIN." });
      return;
    }
    if (!/^\d{4,6}$/.test(newPin)) {
      setMsg({ type: "error", text: "New PIN must be 4 to 6 digits." });
      return;
    }
    if (newPin !== confirm) {
      setMsg({ type: "error", text: "New PINs do not match." });
      return;
    }
    if (oldPin === newPin) {
      setMsg({ type: "error", text: "New PIN must be different from current PIN." });
      return;
    }
    setBusy(true);
    try {
      await changeWalletPin({ userId, oldPin, newPin });
      setMsg({ type: "success", text: "PIN changed successfully. Your new PIN has been emailed to you." });
      setOldPin(""); setNewPin(""); setConfirm("");
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Failed to change PIN. Check your current PIN and try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Change PIN" subtitle="Verify your current PIN to set a new one">
      <div className="space-y-4">
        <Field
          type="password"
          inputMode="numeric"
          maxLength={6}
          label="Current PIN"
          placeholder="••••••"
          value={oldPin}
          onChange={(e) => { setOldPin(e.target.value.replace(/\D/g, "")); setMsg(null); }}
        />
        <Field
          type="password"
          inputMode="numeric"
          maxLength={6}
          label="New PIN (4–6 digits)"
          placeholder="••••••"
          value={newPin}
          onChange={(e) => { setNewPin(e.target.value.replace(/\D/g, "")); setMsg(null); }}
        />
        <Field
          type="password"
          inputMode="numeric"
          maxLength={6}
          label="Confirm new PIN"
          placeholder="••••••"
          value={confirm}
          onChange={(e) => { setConfirm(e.target.value.replace(/\D/g, "")); setMsg(null); }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <Button variant="outline" onClick={submit} disabled={busy} className="w-full">
          {busy ? "Changing…" : "Change PIN"}
        </Button>
        <p className="text-xs text-ink-600/50">
          Your new PIN will be sent to your registered email address.
        </p>
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

// ── Spending chart ────────────────────────────────────────────────────────────
function SpendingChart({ txns }) {
  const chartData = useMemo(() => {
    if (!txns || txns.length === 0) return [];
    const byMonth = {};
    txns.forEach((t) => {
      if (!t.transactionDate) return;
      const date = new Date(t.transactionDate);
      if (isNaN(date)) return;
      const key   = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleString("default", { month: "short", year: "2-digit" });
      if (!byMonth[key]) byMonth[key] = { month: label, spent: 0, topup: 0 };
      const amt = parseFloat(t.amount) || 0;
      if (t.transactionType === "DEBIT")  byMonth[key].spent += amt;
      if (t.transactionType === "CREDIT") byMonth[key].topup += amt;
    });
    return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));
  }, [txns]);

  if (chartData.length === 0) {
    return (
      <Card title="Spending overview" className="mt-6">
        <p className="py-10 text-center text-sm text-ink-600/60">
          No transaction data to chart yet. Top up or make a purchase to see your spending graph.
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

// ── Transaction table ─────────────────────────────────────────────────────────
function TransactionTable({ txns }) {
  return (
    <Card
      title="Transaction history"
      subtitle={txns.length ? `${txns.length} transaction${txns.length === 1 ? "" : "s"}` : undefined}
      className="mt-6"
    >
      {txns.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-600/60">No wallet transactions yet.</p>
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
                    {t.transactionType === "DEBIT" ? "↓ " : "↑ "}{t.transactionType}
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
