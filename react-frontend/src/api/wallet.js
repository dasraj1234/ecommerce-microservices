import { apiRequest } from "./client";
import { getToken } from "../auth/session";

// Wallet endpoints (payment-wallet-service @ :8083, /wallet — via the gateway).
//
// Responses come back RAW (no ApiResponse envelope). The gateway enforces
// ownership on these: the {userId} must match the caller's JWT claim unless
// the caller is ADMIN.

/**
 * GET /wallet/{userId} — wallet details for a user.
 * NOTE: a user with no wallet yet returns HTTP 404, which apiRequest throws on.
 * Callers should treat that as "no wallet" rather than a hard error.
 * @returns {Promise<{walletId, userId, balance, status, lastTransactionDate}>}
 */
export async function getWallet(userId) {
  return apiRequest(`/wallet/${encodeURIComponent(userId)}`, {
    token: getToken(),
  });
}

/**
 * GET /wallet/history/{userId} — wallet transactions, newest first.
 * Returns [] for a user with no wallet/transactions.
 * @returns {Promise<Array<{transactionId, paymentId, orderId, amount, transactionType, status, transactionDate}>>}
 */
export async function getWalletHistory(userId) {
  return apiRequest(`/wallet/history/${encodeURIComponent(userId)}`, {
    token: getToken(),
  });
}

/**
 * POST /wallet/topup — add funds to a wallet.
 * @param {{userId, amount}} payload
 * @returns {Promise<{walletId, userId, balance, status}>}
 */
export async function topupWallet(payload) {
  return apiRequest("/wallet/topup", {
    method: "POST",
    body: payload,
    token: getToken(),
  });
}

/**
 * POST /wallet/set-pin — create or reset the wallet PIN.
 * @param {{userId, pin}} payload
 * @returns {Promise<string>}  "Wallet PIN set successfully"
 */
export async function setWalletPin(payload) {
  return apiRequest("/wallet/set-pin", {
    method: "POST",
    body: payload,
    token: getToken(),
  });
}
