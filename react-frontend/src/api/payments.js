import { apiRequest, unwrap } from "./client";
import { getToken } from "../auth/session";
import { securePost } from "../payments/cryptoClient";

// Payment Wallet Service endpoints (:8083, /payments — via Vite proxy).
//
// Payment responses come back RAW (no { success, message, data } envelope),
// so unwrap() is a pass-through here — used anyway so callers stay uniform if
// the backend standardizes on the envelope later. DTO shapes verified against
// payment-wallet-service on 2026-07-05.

/**
 * GET /payments/user/{userId} — payment history for a user.
 * @returns {Promise<Array<{paymentId, orderId, userId, amount, status}>>}
 */
export async function getUserPayments(userId) {
  const res = await apiRequest(`/payments/user/${encodeURIComponent(userId)}`, {
    token: getToken(),
  });
  return unwrap(res);
}

/**
 * GET /payments/count — total number of payments (admin dashboard KPI).
 * Returns a raw number (no envelope).
 * @returns {Promise<number>}
 */
export async function getPaymentsCount() {
  return apiRequest("/payments/count", { token: getToken() });
}

/**
 * GET /payments/all — every payment across all users (admin). Newest first.
 * @returns {Promise<Array<{paymentId, orderId, userId, amount, status, createdDate}>>}
 */
export async function getAllPayments() {
  return apiRequest("/payments/all", { token: getToken() });
}

/**
 * GET /payments/{paymentId} — single payment details.
 * @returns {Promise<{paymentId, orderId, userId, amount, status}>}
 */
export async function getPayment(paymentId) {
  const res = await apiRequest(`/payments/${encodeURIComponent(paymentId)}`, {
    token: getToken(),
  });
  return unwrap(res);
}

/**
 * POST /payments/process — wallet/mock payment for an order.
 * For real wallet debits pass paymentMethod: "WALLET" and the user's 6-digit
 * walletPin — the service verifies the PIN (and wallet block status) before
 * debiting. An incorrect PIN comes back as { status: "FAILED", message }.
 * @param {{userId, orderId, amount, idempotencyKey, paymentMethod?, walletPin?}} payload
 * @returns {Promise<{paymentId, status, message}>}
 */
export async function processWalletPayment(payload) {
  const res = await apiRequest("/payments/process", {
    method: "POST",
    body: payload,
    token: getToken(),
  });
  return unwrap(res);
}

/**
 * POST /payments/razorpay/create-order — create a Razorpay order.
 * @param {{userId, orderId, amount}} payload  amount in RUPEES
 * @returns {Promise<{razorpayOrderId, key, amount, currency}>}
 *   NOTE: `amount` comes back in RUPEES; the Razorpay modal wants PAISE.
 */
export async function createRazorpayOrder(payload) {
  const res = await apiRequest("/payments/razorpay/create-order", {
    method: "POST",
    body: payload,
    token: getToken(),
  });
  return unwrap(res);
}

/**
 * POST /payments/razorpay/verify — verify a completed Razorpay payment.
 * Backend also sends the success email on verify.
 * @param {{razorpayOrderId, razorpayPaymentId, razorpaySignature, userId, orderId, idempotencyKey, amount}} payload
 * @returns {Promise<{paymentId, status, message}>}  status: "SUCCESS" | "FAILED"
 */
export async function verifyRazorpayPayment(payload) {
  const res = await apiRequest("/payments/razorpay/verify", {
    method: "POST",
    body: payload,
    token: getToken(),
  });
  return unwrap(res);
}

// ── Encrypted variants (/secure endpoints) ────────────────────────────────────
// These call the same business logic server-side but encrypt the request body
// with RSA-2048/OAEP + AES-256-GCM and decrypt the response automatically.
// Drop-in replacements — return the same shape as the plaintext functions above.

/**
 * POST /payments/process/secure — wallet payment with encrypted payload.
 * @param {{userId, orderId, amount, idempotencyKey, paymentMethod, walletPin}} payload
 */
export async function processWalletPaymentSecure(payload) {
  return securePost("/payments/process/secure", payload, getToken());
}

/**
 * POST /payments/razorpay/create-order/secure — create Razorpay order (encrypted).
 * @param {{userId, orderId, amount}} payload  amount in RUPEES
 * @returns {Promise<{razorpayOrderId, key, amount, currency}>}
 */
export async function createRazorpayOrderSecure(payload) {
  return securePost("/payments/razorpay/create-order/secure", payload, getToken());
}

/**
 * POST /payments/razorpay/verify/secure — verify Razorpay payment (encrypted).
 * @param {{razorpayOrderId, razorpayPaymentId, razorpaySignature, userId, orderId, idempotencyKey, amount}} payload
 * @returns {Promise<{paymentId, status, message}>}
 */
export async function verifyRazorpayPaymentSecure(payload) {
  return securePost("/payments/razorpay/verify/secure", payload, getToken());
}
