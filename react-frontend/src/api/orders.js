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
 * @param {{userId, productId, quantity, totalAmount}} payload
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
