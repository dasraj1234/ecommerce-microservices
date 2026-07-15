import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { createOrder, checkStock, getOrderHistory } from "../../api/orders";
import {
  processWalletPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../../api/payments";
import { openRazorpayCheckout } from "../../payments/razorpay";
import { getUserId, getUsername } from "../../auth/session";

// My Orders page. Two modes:
//   - default: the user's order history (GET /orders/history/{userId})
//   - checkout: when reached via Shop's Buy Now (?productId&name&price),
//     shows the Place Order form instead.
//
// The checkout flow mirrors the JSP frontend exactly: payment happens FIRST,
// then the order is created with the paymentId attached.
//   RAZORPAY: POST /payments/razorpay/create-order -> Checkout modal
//             -> POST /payments/razorpay/verify -> POST /orders/create
//   WALLET  : 6-digit PIN dialog -> POST /payments/process (verifies PIN,
//             debits wallet) -> POST /orders/create
// Both are preceded by GET /orders/stock/check. userId comes from the JWT
// claim (see session.js) — never entered manually.
export default function CustomerOrders() {
  const [params] = useSearchParams();
  const checkout = params.get("productId")
    ? {
        productId: params.get("productId"),
        productName: params.get("name") || params.get("productId"),
        price: parseFloat(params.get("price")) || 0,
      }
    : null;

  return (
    <div className="layout">
      <Sidebar type="customer" />
      <div className="main-content">
        {checkout ? <PlaceOrder product={checkout} /> : <OrderHistory />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Order history (default view of the My Orders tab)
// ---------------------------------------------------------------------------
function OrderHistory() {
  const userId = getUserId();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      setError("Could not determine your account id. Please log out and log back in.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await getOrderHistory(userId);
        if (!cancelled) setOrders(data || []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load your orders.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const statusColor = (status) =>
    status === "CONFIRMED" || status === "DELIVERED"
      ? "#16a34a"
      : status === "CANCELLED"
        ? "#dc2626"
        : "#b45309";

  return (
    <>
      <h1>My Orders</h1>

      {error && (
        <div className="card" style={{ marginTop: 20 }}>
          <p style={{ color: "#dc2626", margin: 0 }}>{error}</p>
        </div>
      )}

      {!error && orders === null && (
        <div className="card" style={{ marginTop: 20 }}>Loading orders...</div>
      )}

      {orders && orders.length === 0 && (
        <div className="card" style={{ marginTop: 20, textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>
            No orders have been placed yet.
          </p>
          <p style={{ color: "#6b7280", marginTop: 8 }}>
            Find something you like in the shop and it will show up here.
          </p>
          <Link to="/customer/home">
            <button style={{ marginTop: 16 }}>Go to Shop</button>
          </Link>
        </div>
      )}

      {orders && orders.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                <th style={{ padding: 8 }}>Order ID</th>
                <th style={{ padding: 8 }}>Amount</th>
                <th style={{ padding: 8 }}>Status</th>
                <th style={{ padding: 8 }}>Payment ID</th>
                <th style={{ padding: 8 }}>Placed On</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.orderId} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: 8 }}>{o.orderId}</td>
                  <td style={{ padding: 8 }}>₹{o.totalAmount}</td>
                  <td style={{ padding: 8, color: statusColor(o.status), fontWeight: 600 }}>
                    {o.status}
                  </td>
                  <td style={{ padding: 8 }}>{o.paymentId || "—"}</td>
                  <td style={{ padding: 8 }}>{o.createdDate || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Place Order (checkout view, reached from Shop's Buy Now)
// ---------------------------------------------------------------------------
function PlaceOrder({ product }) {
  const userId = getUserId();
  const [method, setMethod] = useState("RAZORPAY");
  const [quantity, setQuantity] = useState(1);

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [showPinDialog, setShowPinDialog] = useState(false);

  const totalAmount = useMemo(() => {
    const qty = parseInt(quantity, 10);
    return Number.isInteger(qty) && qty > 0 ? product.price * qty : 0;
  }, [product.price, quantity]);

  const validate = () => {
    if (!userId) {
      setError("Could not determine your account id. Please log out and log back in.");
      return false;
    }
    const qty = parseInt(quantity, 10);
    if (!Number.isInteger(qty) || qty <= 0) {
      setError("Quantity must be a positive number.");
      return false;
    }
    return true;
  };

  // Step 1: shared preflight (validation + stock), then branch per method.
  const placeOrder = async () => {
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
        setShowPinDialog(true); // continues in payWithWallet(pin)
        return;
      }
      await payWithRazorpay();
    } catch (err) {
      setError(err.message || "Could not place order.");
    } finally {
      if (method !== "WALLET") setPlacing(false);
    }
  };

  // Confirm the paid order — common tail of both payment flows.
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
      amount: totalAmount,
      method: method === "WALLET" ? "Wallet" : "Razorpay",
    });
  };

  const payWithRazorpay = async () => {
    const rzpOrder = await createRazorpayOrder({
      userId,
      orderId: "ORD-" + Date.now(), // provisional id; real one is minted by /orders/create
      amount: totalAmount,
    });
    const callback = await openRazorpayCheckout(rzpOrder, { name: getUsername() });
    const verified = await verifyRazorpayPayment({
      ...callback,
      userId,
      orderId: rzpOrder.razorpayOrderId,
      amount: totalAmount,
      idempotencyKey: "IDEMP-" + crypto.randomUUID(),
    });
    if (verified.status !== "SUCCESS") {
      throw new Error(verified.message || "Payment verification failed.");
    }
    await confirmOrder(verified.paymentId);
  };

  const payWithWallet = async (pin) => {
    setShowPinDialog(false);
    try {
      const payment = await processWalletPayment({
        orderId: "ORD-" + Date.now(), // provisional id; real one is minted by /orders/create
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
      setError(err.message || "Wallet payment failed.");
    } finally {
      setPlacing(false);
    }
  };

  const cancelPin = () => {
    setShowPinDialog(false);
    setPlacing(false);
  };

  return (
    <>
      <h1>Place Order</h1>

      <div className="card" style={{ maxWidth: 480, marginTop: 20 }}>
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
          Ordering as <strong style={{ color: "#374151" }}>{getUsername()}</strong>{" "}
          ({userId || "unknown id"})
        </p>

        <div
          style={{
            marginTop: 16,
            padding: "12px 16px",
            background: "#f9fafb",
            borderRadius: 10,
          }}
        >
          <div style={{ fontWeight: 600 }}>{product.productName}</div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            Unit price: ₹{product.price}
          </div>
        </div>

        {/* Payment method */}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {[
            { value: "RAZORPAY", label: "Razorpay" },
            { value: "WALLET", label: "Wallet" },
          ].map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMethod(m.value)}
              style={{
                flex: 1,
                marginTop: 0,
                padding: "10px 0",
                borderRadius: 10,
                border:
                  method === m.value ? "2px solid #ff8c32" : "1px solid #ddd",
                background: method === m.value ? "#fff7ed" : "#fff",
                color: method === m.value ? "#c2570b" : "#6b7280",
                fontWeight: method === m.value ? 600 : 400,
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Quantity + total */}
        <input
          type="number"
          min="1"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <div
          style={{
            marginTop: 12,
            padding: "12px 16px",
            background: "#f9fafb",
            borderRadius: 10,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ color: "#6b7280" }}>Total</span>
          <strong>₹{totalAmount}</strong>
        </div>

        <button onClick={placeOrder} disabled={placing} style={{ width: "100%" }}>
          {placing ? "Processing..." : "Place Order"}
        </button>

        {error && <p style={{ color: "#dc2626", marginTop: 12 }}>{error}</p>}
      </div>

      {success && (
        <div
          className="card"
          style={{
            maxWidth: 480,
            marginTop: 20,
            borderLeft: "4px solid #16a34a",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#16a34a" }}>
            ✅ Order placed successfully
          </h3>
          <p style={{ margin: "6px 0" }}>
            <strong>Order ID:</strong> {success.orderId}
          </p>
          <p style={{ margin: "6px 0" }}>
            <strong>Amount:</strong> ₹{success.amount}
          </p>
          <p style={{ margin: "6px 0" }}>
            <strong>Payment:</strong> {success.method}
          </p>
          <Link to="/customer/orders">
            <button style={{ marginTop: 8 }}>View My Orders</button>
          </Link>
        </div>
      )}

      {showPinDialog && (
        <WalletPinDialog
          userId={userId}
          amount={totalAmount}
          onConfirm={payWithWallet}
          onCancel={cancelPin}
        />
      )}
    </>
  );
}

// 6-digit wallet PIN prompt — React equivalent of the JSP SweetAlert dialog.
function WalletPinDialog({ userId, amount, onConfirm, onCancel }) {
  const [pin, setPin] = useState("");
  const [show, setShow] = useState(false);
  const [warn, setWarn] = useState("");

  const submit = () => {
    if (!/^\d{6}$/.test(pin)) {
      setWarn("Please enter your 6 digit PIN.");
      return;
    }
    onConfirm(pin);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(17, 24, 39, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div className="card" style={{ width: 360 }}>
        <h3 style={{ marginTop: 0 }}>Wallet Payment</h3>
        <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0" }}>
          Paying <strong style={{ color: "#374151" }}>₹{amount}</strong> as{" "}
          {userId}
        </p>
        <div style={{ position: "relative" }}>
          <input
            type={show ? "text" : "password"}
            inputMode="numeric"
            maxLength={6}
            placeholder="6-digit wallet PIN"
            value={pin}
            autoFocus
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ""));
              setWarn("");
            }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            style={{ paddingRight: 44, letterSpacing: 4 }}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide PIN" : "Show PIN"}
            style={{
              position: "absolute",
              right: 6,
              top: 18,
              margin: 0,
              padding: "6px 10px",
              background: "transparent",
              color: "#6b7280",
              fontSize: 13,
            }}
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
        {warn && <p style={{ color: "#dc2626", marginTop: 10 }}>{warn}</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ flex: 1, background: "#e5e7eb", color: "#374151" }}
          >
            Cancel
          </button>
          <button type="button" onClick={submit} style={{ flex: 1 }}>
            Pay ₹{amount}
          </button>
        </div>
      </div>
    </div>
  );
}
