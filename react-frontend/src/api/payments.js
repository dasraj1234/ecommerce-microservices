import { apiRequest } from "./client";

// payment-wallet-service @ :8083, via Vite proxy.

// GET /payments/{paymentId}
export function getPayment(paymentId) {
  return apiRequest(`/payments/${paymentId}`);
}

// GET /payments/user/{userId}
export function getUserPayments(userId) {
  return apiRequest(`/payments/user/${userId}`);
}
