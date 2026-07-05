import { apiRequest, unwrap } from "./client";
import { getToken } from "../auth/session";

// Product endpoints (product-order-service @ :8082, /products — via Vite proxy).
//
// These wrap their payload in the ApiResponse envelope ({ success, message,
// data }), so unwrap() pulls out the inner value. DTO shapes verified against
// product-order-service ProductRequest/ProductResponse on 2026-07-05.

/**
 * POST /products/create — create a product.
 * @param {{productName, category, price, stock}} payload
 * @returns {Promise<string>} the new product id (envelope `data`)
 */
export async function createProduct(payload) {
  const res = await apiRequest("/products/create", {
    method: "POST",
    body: payload,
    token: getToken(),
  });
  return unwrap(res);
}

/**
 * GET /products/search — list products (optionally filtered).
 * @param {{name?, category?, maxPrice?}} [filters]
 * @returns {Promise<Array<{productId, productName, category, price, stock, status}>>}
 */
export async function searchProducts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.name) params.set("name", filters.name);
  if (filters.category) params.set("category", filters.category);
  if (filters.maxPrice != null) params.set("maxPrice", filters.maxPrice);
  const qs = params.toString();
  const res = await apiRequest(`/products/search${qs ? `?${qs}` : ""}`, {
    token: getToken(),
  });
  return unwrap(res);
}
