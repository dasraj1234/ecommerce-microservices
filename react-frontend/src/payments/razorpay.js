// Razorpay Checkout integration helper.
//
// Encapsulates the two things the UI must get right:
//   1. Loading the Checkout SDK (injected once, on demand — not in index.html).
//   2. The amount unit: backend returns RUPEES in the create-order response, but
//      the Checkout modal expects PAISE, so we multiply by 100 here.
//   3. Mapping Razorpay's snake_case success callback to our camelCase verify DTO.

const SDK_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let sdkPromise = null;

/** Inject the Razorpay Checkout script once; resolve when it's ready. */
export function loadRazorpaySdk() {
  if (window.Razorpay) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SDK_SRC;
    script.onload = () => resolve();
    script.onerror = () => {
      sdkPromise = null; // allow a retry on next attempt
      reject(new Error("Failed to load Razorpay Checkout. Check your connection."));
    };
    document.body.appendChild(script);
  });
  return sdkPromise;
}

/**
 * Open the Razorpay Checkout modal for an already-created order.
 *
 * @param {object} order  create-order response { razorpayOrderId, key, amount, currency }
 * @param {object} [prefill]  { name, email, contact }
 * @returns {Promise<{razorpayOrderId, razorpayPaymentId, razorpaySignature}>}
 *   Resolves with the (camelCased) success payload; rejects if the user dismisses.
 */
export async function openRazorpayCheckout(order, prefill = {}) {
  await loadRazorpaySdk();

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.key,
      order_id: order.razorpayOrderId,
      amount: Math.round(order.amount * 100), // rupees -> paise
      currency: order.currency || "INR",
      name: "EcomVerse",
      description: "Order payment",
      prefill,
      handler: (resp) =>
        // Map Razorpay's snake_case callback to our verify DTO's camelCase.
        resolve({
          razorpayOrderId: resp.razorpay_order_id,
          razorpayPaymentId: resp.razorpay_payment_id,
          razorpaySignature: resp.razorpay_signature,
        }),
      modal: {
        ondismiss: () =>
          reject(new Error("Payment cancelled. Your order is still pending.")),
      },
    });
    rzp.on("payment.failed", (resp) =>
      reject(new Error(resp?.error?.description || "Payment failed at Razorpay.")),
    );
    rzp.open();
  });
}
