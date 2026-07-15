import { apiRequest } from "./client";

// product-order-service @ :8082, via Vite proxy.

// GET /products/search
export function searchProducts() {
  return apiRequest("/products/search");
}

// POST /products/create
//   request: { productName, category, price, stock }
export function createProduct(payload) {
  return apiRequest("/products/create", { method: "POST", body: payload });
}
