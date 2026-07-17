import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Field from "../../components/Field";
import Button from "../../components/Button";
import IdTag from "../../components/IdTag";
import StatusBadge from "../../components/StatusBadge";
import { createOrder, checkStock, getOrderHistory } from "../../api/orders";
import {
  processWalletPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../../api/payments";
import { openRazorpayCheckout } from "../../payments/razorpay";
import { getWallet } from "../../api/wallet";
import { getUserId, getUsername } from "../../auth/session";

// Two modes:
//   ?productId=… (from the Store's "Order now")  -> Place Order form / checkout
//   no params                                     -> the customer's order history
//
// Checkout mirrors the JSP flow: payment happens FIRST, then the order is
// created with the resulting paymentId attached.
//   RAZORPAY: /payments/razorpay/create-order -> modal -> verify -> /orders/create
//   WALLET  : 6-digit PIN -> /payments/process -> /orders/create
// Both preceded by /orders/stock/check. userId comes from the signed JWT.
export default function CustomerOrders() {
  const [params] = useSearchParams();
  const productId = params.get("productId");

  const checkout = productId
    ? {
        productId,
        productName: params.get("name") || productId,
        price: parseFloat(params.get("price")) || 0,
      }
    : null;

  return (
    <PageShell
      type="customer"
      eyebrow="Storefront"
      title={checkout ? "Place an order" : "My orders"}
    >
      {checkout ? <PlaceOrder product={checkout} /> : <OrderHistory />}
    </PageShell>
  );
}

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------
function PlaceOrder({ product }) {
  const userId = getUserId();
  const [method, setMethod] = useState("RAZORPAY");
  const [quantity, setQuantity] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [showPin, setShowPin] = useState(false);
  // null = still checking, false = user has no wallet, object = wallet details.
  const [wallet, setWallet] = useState(null);

  // Only offer Wallet if this user actually has one — otherwise the payment
  // service rejects it with a raw "Incorrect result size" error.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!userId) {
        if (!cancelled) setWallet(false);
        return;
      }
      try {
        const w = await getWallet(userId);
        if (!cancelled) setWallet(w);
      } catch {
        if (!cancelled) setWallet(false); // 404 = no wallet provisioned
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const walletUnavailable = wallet === false;

  const totalAmount = useMemo(() => {
    const q = parseInt(quantity, 10);
    return Number.isInteger(q) && q > 0 ? product.price * q : 0;
  }, [product.price, quantity]);

  const validate = () => {
    if (!userId) {
      setError("Could not determine your account id. Please log out and log back in.");
      return false;
    }
    const q = parseInt(quantity, 10);
    if (!Number.isInteger(q) || q <= 0) {
      setError("Quantity must be a positive number.");
      return false;
    }
    if (method === "WALLET" && walletUnavailable) {
      setError("Wallet unavailable — there's no wallet on your account. Pay by Razorpay instead.");
      return false;
    }
    return true;
  };

  const start = async () => {
    setError("");
    setSuccess(null);
    if (!validate()) return;

    setPlacing(true);
    try {
      const inStock = await checkStock(product.productId, parseInt(quantity, 10));
      if (!inStock) {
        setError("Insufficient stock for the requested quantity.");
        return;
      }
      if (method === "WALLET") {
        setShowPin(true); // continues in payWithWallet(pin)
        return;
      }
      await payWithRazorpay();
    } catch (err) {
      setError(err.message || "Could not place order.");
    } finally {
      if (method !== "WALLET") setPlacing(false);
    }
  };

  // Common tail of both payment paths.
  const confirmOrder = async (paymentId) => {
    const order = await createOrder({
      userId,
      productId: product.productId,
      quantity: parseInt(quantity, 10),
      totalAmount,
      paymentMethod: method,
      paymentId,
    });
    setSuccess({
      orderId: order.orderId,
      status: order.status,
      amount: totalAmount,
      method: method === "WALLET" ? "Wallet" : "Razorpay",
    });
  };

  const payWithRazorpay = async () => {
    const rzp = await createRazorpayOrder({
      userId,
      orderId: "ORD-" + Date.now(), // provisional; the real id is minted by /orders/create
      amount: totalAmount,
    });
    const callback = await openRazorpayCheckout(rzp, { name: getUsername() });
    const verified = await verifyRazorpayPayment({
      ...callback,
      userId,
      orderId: rzp.razorpayOrderId,
      amount: totalAmount,
      idempotencyKey: "IDEMP-" + crypto.randomUUID(),
    });
    if (verified.status !== "SUCCESS") {
      throw new Error(verified.message || "Payment verification failed.");
    }
    await confirmOrder(verified.paymentId);
  };

  const payWithWallet = async (pin) => {
    setShowPin(false);
    try {
      const payment = await processWalletPayment({
        orderId: "ORD-" + Date.now(), // provisional; real id minted by /orders/create
        userId,
        amount: totalAmount,
        paymentMethod: "WALLET",
        walletPin: pin,
        idempotencyKey: "IDEMP-" + crypto.randomUUID(),
      });
      if (payment.status !== "SUCCESS") {
        throw new Error(payment.message || "Wallet payment failed.");
      }
      await confirmOrder(payment.paymentId);
    } catch (err) {
      // The service leaks a raw JDBC message when the user has no wallet row —
      // don't show that to a customer.
      const raw = err.message || "";
      setError(
        /Incorrect result size|No wallet|not found/i.test(raw)
          ? "Wallet unavailable — there's no wallet on your account. Pay by Razorpay instead."
          : raw || "Wallet payment failed."
      );
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <Card title="Order details" subtitle={userId ? `Ordering as ${userId}` : undefined}>
        <div className="space-y-4">
          <div className="rounded-xl bg-paper p-4">
            <IdTag>{product.productId}</IdTag>
            <p className="mt-2 font-display text-base font-semibold text-ink-900">
              {product.productName}
            </p>
            <p className="mt-0.5 text-sm text-ink-600">
              Unit price <span className="font-mono text-ink-900">₹{product.price}</span>
            </p>
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
              Payment method
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "RAZORPAY", label: "Razorpay", disabled: false },
                { value: "WALLET", label: "Wallet", disabled: walletUnavailable },
              ].map((m) => (
                <button
                  key={m.value}
                  type="button"
                  disabled={m.disabled}
                  title={m.disabled ? "No wallet on your account" : undefined}
                  onClick={() => setMethod(m.value)}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                    method === m.value && !m.disabled
                      ? "border-brand bg-brand/10 text-brand-dark"
                      : "border-ink-900/10 text-ink-600 hover:bg-ink-900/[0.03]"
                  } ${m.disabled ? "cursor-not-allowed opacity-40 hover:bg-transparent" : ""}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            {wallet === null ? null : walletUnavailable ? (
              <p className="mt-2 text-xs text-ink-600/60">
                Wallet unavailable — no wallet on your account.
              </p>
            ) : (
              <p className="mt-2 text-xs text-ink-600/60">
                Wallet balance:{" "}
                <span className="font-mono text-ink-900">₹{wallet.balance}</span>
              </p>
            )}
          </div>

          <Field
            type="number"
            min="1"
            label="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <div className="flex items-center justify-between rounded-xl bg-paper px-4 py-3">
            <span className="text-sm text-ink-600">Total</span>
            <span className="font-mono text-lg font-semibold text-ink-900">₹{totalAmount}</span>
          </div>

          <Button variant="brand" onClick={start} disabled={placing} className="w-full">
            {placing ? "Processing…" : `Pay ₹${totalAmount} & place order`}
          </Button>

          <Link to="/customer/home" className="block text-center text-sm text-ink-600 hover:text-ink-900">
            ← Back to store
          </Link>

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </Card>

      {success ? (
        <Card title="Order placed">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-600/60">Order</dt>
              <dd className="mt-1"><IdTag>{success.orderId}</IdTag></dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-600/60">Status</dt>
              <dd className="mt-1"><StatusBadge status={success.status} /></dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-600/60">Amount</dt>
              <dd className="mt-1 font-mono text-base font-medium text-ink-900">₹{success.amount}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-600/60">Paid with</dt>
              <dd className="mt-1 text-ink-900">{success.method}</dd>
            </div>
          </dl>
          <Link to="/customer/orders">
            <Button variant="outline" className="mt-5">View my orders</Button>
          </Link>
        </Card>
      ) : (
        <Card className="flex items-center justify-center border-dashed text-sm text-ink-600/60">
          Your order confirmation will appear here.
        </Card>
      )}

      {showPin && (
        <WalletPinDialog
          userId={userId}
          amount={totalAmount}
          onConfirm={payWithWallet}
          onCancel={() => {
            setShowPin(false);
            setPlacing(false);
          }}
        />
      )}
    </div>
  );
}

// 6-digit wallet PIN prompt.
function WalletPinDialog({ userId, amount, onConfirm, onCancel }) {
  const [pin, setPin] = useState("");
  const [warn, setWarn] = useState("");

  const submit = () => {
    if (!/^\d{4,6}$/.test(pin)) {
      setWarn("Please enter your 4 to 6 digit PIN.");
      return;
    }
    onConfirm(pin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4">
      <Card title="Wallet payment" subtitle={`Paying ₹${amount} as ${userId}`} className="w-full max-w-sm">
        <div className="space-y-4">
          <Field
            type="password"
            inputMode="numeric"
            maxLength={6}
            label="Wallet PIN (4–6 digits)"
            placeholder="••••••"
            value={pin}
            autoFocus
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ""));
              setWarn("");
            }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          {warn && <p className="text-sm text-red-600">{warn}</p>}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button variant="brand" onClick={submit}>Pay ₹{amount}</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------
function OrderHistory() {
  const userId = getUserId();
  const [orders, setOrders] = useState(null); // null = loading
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!userId) {
        setError("Could not determine your account id. Please log out and log back in.");
        setOrders([]);
        return;
      }
      try {
        const data = await getOrderHistory(userId);
        if (!cancelled) setOrders(data || []);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Could not load your orders.");
        setOrders([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <Card title="Order history" subtitle={userId ? `Orders placed under ${userId}` : undefined}>
      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-2.5 text-sm text-red-600">
          {error}
        </p>
      )}

      {orders === null ? (
        <p className="py-6 text-sm text-ink-600/60">Loading orders…</p>
      ) : orders.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm font-medium text-ink-900">No orders yet.</p>
          <p className="mt-1 text-sm text-ink-600/60">
            Browse the store and place an order — it will show up here.
          </p>
          <Link to="/customer/home">
            <Button variant="brand" className="mt-4">Go to store</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink-900/10 text-left text-xs uppercase tracking-wide text-ink-600/60">
                <th className="py-2.5 pr-4 font-medium">Order</th>
                <th className="py-2.5 pr-4 font-medium">Amount</th>
                <th className="py-2.5 pr-4 font-medium">Status</th>
                <th className="py-2.5 pr-4 font-medium">Payment</th>
                <th className="py-2.5 pr-4 font-medium">Placed</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.orderId} className="border-b border-ink-900/5 last:border-0">
                  <td className="py-3 pr-4"><IdTag>{o.orderId}</IdTag></td>
                  <td className="py-3 pr-4 font-mono text-ink-900">₹{o.totalAmount}</td>
                  <td className="py-3 pr-4"><StatusBadge status={o.status} /></td>
                  <td className="py-3 pr-4">{o.paymentId ? <IdTag>{o.paymentId}</IdTag> : "—"}</td>
                  <td className="py-3 pr-4 text-ink-600">{o.createdDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
