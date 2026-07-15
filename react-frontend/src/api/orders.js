import { apiRequest } from "./client";

// product-order-service @ :8082, via Vite proxy.

// POST /orders/create
//   request : { userId, productId, quantity, totalAmount }
//   response: { orderId, status, message }
export function createOrder(payload) {
  return apiRequest("/orders/create", { method: "POST", body: payload });
}

// PATCH /orders/{id}/cancel
export function cancelOrder(orderId) {
  return apiRequest(`/orders/${orderId}/cancel`, { method: "PATCH" });
}

// GET /orders/history/{userId}
export function getOrderHistory(userId) {
  return apiRequest(`/orders/history/${userId}`);
}
