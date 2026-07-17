import { apiRequest, unwrap } from "./client";
import { getToken } from "../auth/session";

// Product endpoints (product-order-service @ :8082, /products — via Vite proxy).
//
// These wrap their payload in the ApiResponse envelope ({ success, message,
// data }), so unwrap() pulls out the inner value. DTO shapes verified against
// product-order-service ProductRequest/ProductResponse on 2026-07-05.

/**
 * GET /categories/level1 — the 8 top-level categories (admin only).
 * Returns a raw array (no ApiResponse envelope).
 * @returns {Promise<Array<{categoryCode, categoryName}>>}
 */
export async function getMainCategories() {
  return apiRequest("/categories/level1", { token: getToken() });
}

/**
 * GET /categories/children/{parentCode} — direct children of a category
 * (admin only). Used to cascade Main -> Category -> Sub.
 * @returns {Promise<Array<{categoryCode, categoryName}>>}
 */
export async function getChildCategories(parentCode) {
  return apiRequest(`/categories/children/${encodeURIComponent(parentCode)}`, {
    token: getToken(),
  });
}

/**
 * POST /products/create — create a product.
 * The backend keys off the LEAF category code (product ids encode it, e.g.
 * PRD111000001), and stores the denormalized paths for display.
 * @param {{productName, categoryCode, categoryPath, categoryNamePath, price, stock}} payload
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
 * GET /products/{productId} — fetch a single product by id.
 * A missing product comes back as HTTP 200 with { success: false, data: null }
 * (not a 404), so we detect the failed envelope and throw its message.
 * @returns {Promise<{productId, productName, category, categoryPath, categoryNamePath, price, stock, status}>}
 */
export async function getProductById(productId) {
  const res = await apiRequest(`/products/${encodeURIComponent(productId)}`, {
    token: getToken(),
  });
  if (res && res.success === false) {
    throw new Error(res.message || "Product not found.");
  }
  return unwrap(res);
}

/**
 * PUT /products/{productId} — update a product's name, price and stock.
 * @param {string} productId
 * @param {{productName, price, stock}} payload
 * @returns {Promise<string>} the product id (envelope `data`)
 */
export async function updateProduct(productId, payload) {
  const res = await apiRequest(`/products/${encodeURIComponent(productId)}`, {
    method: "PUT",
    body: payload,
    token: getToken(),
  });
  return unwrap(res);
}

/**
 * DELETE /products/{productId} — delete a product.
 * Products with order history can't be hard-deleted (FK from order_items);
 * the backend soft-deletes those (status=INACTIVE) and says so in `message`.
 * @returns {Promise<string>} the backend's outcome message
 */
export async function deleteProduct(productId) {
  const res = await apiRequest(`/products/${encodeURIComponent(productId)}`, {
    method: "DELETE",
    token: getToken(),
  });
  return (res && res.message) || "Product deleted successfully";
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
