import { useState } from "react";
import {
  processWalletPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../api/payments";
import { openRazorpayCheckout } from "../payments/razorpay";
import { getUsername } from "../auth/session";

// Reusable payment panel — the seam between order creation and payment.
// Given an existing orderId + amount (+ the payer's userId), it lets the user
// pay by Wallet or Razorpay and reports the result via onSuccess/onError.
//
// props:
//   userId    business id (USER-1001) of the payer
//   orderId   order to pay for
//   amount    amount in RUPEES
//   onSuccess (result) => void   called with { paymentId, status, message }
//   onError   (message) => void  optional
export default function PaymentPanel({ userId, orderId, amount, onSuccess, onError }) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const canPay = userId && orderId && amount > 0;

  const fail = (msg) => {
    setError(msg);
    onError?.(msg);
  };

  const payWithWallet = async () => {
    setError("");
    setBusy("wallet");
    try {
      const result = await processWalletPayment({
        userId,
        orderId,
        amount,
        idempotencyKey: crypto.randomUUID(), // per-attempt: retries don't double-charge
      });
      onSuccess?.(result);
    } catch (err) {
      fail(err.message || "Wallet payment failed.");
    } finally {
      setBusy("");
    }
  };

  const payWithRazorpay = async () => {
    setError("");
    setBusy("razorpay");
    const idempotencyKey = crypto.randomUUID();
    try {
      const order = await createRazorpayOrder({ userId, orderId, amount });
      const callback = await openRazorpayCheckout(order, { name: getUsername() });
      const result = await verifyRazorpayPayment({
        ...callback,
        userId,
        orderId,
        idempotencyKey,
        amount,
      });
      if (result.status !== "SUCCESS") {
        throw new Error(result.message || "Signature verification failed.");
      }
      onSuccess?.(result);
    } catch (err) {
      fail(err.message || "Razorpay payment failed.");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="card">
      <h3>Pay ₹{amount} for {orderId}</h3>
      {!canPay && (
        <p style={{ color: "#b45309" }}>
          Missing userId, orderId, or amount — cannot start payment.
        </p>
      )}
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={payWithWallet} disabled={!canPay || !!busy}>
          {busy === "wallet" ? "Processing..." : "Pay with Wallet"}
        </button>
        <button onClick={payWithRazorpay} disabled={!canPay || !!busy}>
          {busy === "razorpay" ? "Opening Razorpay..." : "Pay with Razorpay"}
        </button>
      </div>
      {error && <p style={{ color: "#dc2626", marginTop: 12 }}>{error}</p>}
    </div>
  );
}
