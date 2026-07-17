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
 * POST /wallet/create — provision a new wallet for the user.
 * No-op if a wallet already exists; returns the wallet either way.
 * @param {{userId}} payload
 * @returns {Promise<{walletId, userId, balance, status, hasPinSet}>}
 */
export async function createWallet(payload) {
  return apiRequest("/wallet/create", {
    method: "POST",
    body: payload,
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
 * POST /wallet/set-pin — set PIN for the first time (no old PIN required).
 * Backend also emails the PIN to the user's registered email.
 * @param {{userId, pin}} payload
 * @returns {Promise<string>}
 */
export async function setWalletPin(payload) {
  return apiRequest("/wallet/set-pin", {
    method: "POST",
    body: payload,
    token: getToken(),
  });
}

/**
 * POST /wallet/change-pin — change existing PIN (requires old PIN verification).
 * Backend emails the new PIN on success.
 * @param {{userId, oldPin, newPin}} payload
 * @returns {Promise<string>}
 */
export async function changeWalletPin(payload) {
  return apiRequest("/wallet/change-pin", {
    method: "POST",
    body: payload,
    token: getToken(),
  });
}
