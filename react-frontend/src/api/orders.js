import { apiRequest, unwrap } from "./client";
import { getToken } from "../auth/session";

// Order endpoints (product-order-service @ :8082, /orders — via Vite proxy).
//
// Responses use the ApiResponse envelope ({ success, message, data }); unwrap()
// returns the inner value. DTO shapes verified against product-order-service
// OrderRequest/OrderResponse/OrderHistoryResponse on 2026-07-05.

/**
 * POST /orders/create — create an order.
 * A non-CONFIRMED order returns ApiResponse.failure(...) — note that comes back
 * as HTTP 200 with { success: false, data: null }, so apiRequest does NOT throw.
 * We detect the failed envelope here and throw its message instead of returning
 * a null order.
 *
 * Payment happens BEFORE order creation (see CustomerOrders): pass the
 * paymentMethod ("RAZORPAY" | "WALLET") and the paymentId returned by the
 * payment service so the backend can attach it to the confirmed order.
 * @param {{userId, productId, quantity, totalAmount, paymentMethod, paymentId}} payload
 * @returns {Promise<{orderId, status, message}>}
 */
export async function createOrder(payload) {
  const res = await apiRequest("/orders/create", {
    method: "POST",
    body: payload,
    token: getToken(),
  });
  if (res && res.success === false) {
    throw new Error(res.message || "Order could not be placed.");
  }
  return unwrap(res);
}

/**
 * PATCH /orders/{orderId}/cancel — cancel an order.
 * @returns {Promise<{orderId, status, message}>}
 */
export async function cancelOrder(orderId) {
  const res = await apiRequest(
    `/orders/${encodeURIComponent(orderId)}/cancel`,
    { method: "PATCH", token: getToken() }
  );
  return unwrap(res);
}

/**
 * GET /orders/stock/check — true if the product has at least `quantity` units.
 * Returns a raw boolean (no ApiResponse envelope).
 * @returns {Promise<boolean>}
 */
export async function checkStock(productId, quantity) {
  return apiRequest(
    `/orders/stock/check?productId=${encodeURIComponent(productId)}&quantity=${quantity}`,
    { token: getToken() }
  );
}

/**
 * GET /orders/history/{userId} — order history for a user.
 * @returns {Promise<Array<{orderId, userId, totalAmount, status, createdDate, updatedDate, paymentId}>>}
 */
export async function getOrderHistory(userId) {
  const res = await apiRequest(
    `/orders/history/${encodeURIComponent(userId)}`,
    { token: getToken() }
  );
  return unwrap(res);
}

/**
 * GET /orders/all — every order across all users (admin). Newest first.
 * @returns {Promise<Array<{orderId, userId, totalAmount, status, createdDate, updatedDate, paymentId}>>}
 */
export async function getAllOrders() {
  const res = await apiRequest("/orders/all", { token: getToken() });
  return unwrap(res);
}

// ─── Admin Stats ────────────────────────────────────────────────────────────

/** GET /orders/stats/top-products?limit=N */
export async function getTopProducts(limit = 10) {
  return apiRequest(`/orders/stats/top-products?limit=${limit}`, { token: getToken() });
}

/** GET /orders/stats/categories */
export async function getStatsByCategory() {
  return apiRequest("/orders/stats/categories", { token: getToken() });
}

/** GET /orders/stats/price-ranges */
export async function getStatsByPriceRange() {
  return apiRequest("/orders/stats/price-ranges", { token: getToken() });
}

/** GET /orders/stats/monthly */
export async function getMonthlyStats() {
  return apiRequest("/orders/stats/monthly", { token: getToken() });
}

/** GET /orders/stats/mis */
export async function getMISReport() {
  return apiRequest("/orders/stats/mis", { token: getToken() });
}
