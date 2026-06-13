# TASK — Anirban · Product-Order Frontend

**Owner:** Anirban · **Scope:** React frontend for the **Product Order Service (:8082, `/products` + `/orders`)**
**Derived from:** [TASK_DOCUMENT.md](TASK_DOCUMENT.md) (shared master — current state, full mismatch list). Pair file: [TASK_UJJAL.md](TASK_UJJAL.md) (Payment-Wallet + Auth + infra).

> The teammate's real product-order code is on a **separate branch not yet in this repo**; treat the spec as the contract. Product endpoints below were verified against the local (stale) shell — confirm they survive in the merged branch (R1).

---

## 1. What you own vs depend on

**You own (build these):**
- API modules: `src/api/products.js`, `src/api/orders.js`
- Pages: `CustomerHome` (product grid), `AdminProducts`, `CustomerOrders`, `AdminOrders`
- The **order-creation half** of the checkout flow (stock check → create order → produce `orderId`)

**You depend on Ujjal for (don't build these — consume them):**
- HTTP layer: `src/api/client.js` `apiRequest()` + the Vite dev proxy (routes `/products`,`/orders` → :8082)
- `session.getUserId()` → the logged-in user's `USER-1001` id (blocked on R3 — stub with a manual input until ready)
- `unwrap(res)` helper → pulls `.data` out of the `ApiResponse { success, message, data }` envelope
- `<PaymentPanel … />` component → the pay step your checkout hands off to (see §5)

---

## 2. Current state (your pages)

| Page | State | File |
|---|---|---|
| CustomerHome | static "Loading Products…" — no grid | [CustomerHome.jsx](react-frontend/src/pages/customer/CustomerHome.jsx) |
| AdminProducts | static create-product form, no submit | [AdminProducts.jsx](react-frontend/src/pages/admin/AdminProducts.jsx) |
| CustomerOrders | static, hardcoded `USER-1001` input, no list | [CustomerOrders.jsx](react-frontend/src/pages/customer/CustomerOrders.jsx) |
| AdminOrders | static create-order form, no submit/list | [AdminOrders.jsx](react-frontend/src/pages/admin/AdminOrders.jsx) |

No `api/products.js` / `api/orders.js` exist yet. Routing, sidebar, and route-guards already work.

**Envelope:** every product/order endpoint returns `ApiResponse { success, message, data }` → always read through `unwrap()`.

---

## 3. API modules to build

### `src/api/products.js` (verified locally — confirm via R1)
| Endpoint | Response | Function |
|---|---|---|
| `GET /products/search?name=&category=&maxPrice=` | `ApiResponse<List<ProductResponse>>` | `searchProducts({name, category, maxPrice})` |
| `POST /products/create` (body `ProductRequest`) | `ApiResponse<String>` | `createProduct(payload)` |

`ProductResponse` = `{ productId, productName, category, price, stock, status }`.

### `src/api/orders.js` (from spec)
| Endpoint | Request / params | Response | Function |
|---|---|---|---|
| `POST /orders/create` | `{ userId, productId, quantity, totalAmount, paymentMethod }` | `ApiResponse<OrderResponse>` | `createOrder(payload)` |
| `GET /orders/history/{userId}` | — | `ApiResponse<List<OrderHistoryResponse>>` | `getOrderHistory(userId)` |
| `PATCH /orders/{orderId}/cancel` | — | `ApiResponse<OrderResponse>` | `cancelOrder(orderId)` |
| `PATCH /orders/{orderId}/status` | `?status=` (confirm query vs body — R7) | `ApiResponse<OrderResponse>` | `updateOrderStatus(orderId, status)` |
| `GET /orders/stock/check` | `?productId=&quantity=` | stock availability | `checkStock(productId, quantity)` |

`OrderResponse` = `{ orderId, status, message }`.

---

## 4. Page tasks

- [ ] **CustomerHome** — product grid via `searchProducts()`; name/category/maxPrice filter inputs; each card shows `productName/price/stock/status`; "Buy" → opens checkout (§5).
- [ ] **AdminProducts** — wire create form → `createProduct()`; add a product-list table via `searchProducts()`.
- [ ] **CustomerOrders** — replace the `USER-1001` input with `session.getUserId()`; render `getOrderHistory()` table; per-row "Cancel" → `cancelOrder()`; refresh on success.
- [ ] **AdminOrders** — wire create form → `createOrder()`; add an order-list table; status dropdown → `updateOrderStatus()`; "Cancel" → `cancelOrder()`.

---

## 5. Checkout — your half + the seam

You build the **order** steps; Ujjal's `<PaymentPanel>` does the **pay** step.

```
CustomerHome "Buy"
  → (you)  checkStock(productId, quantity)            [optional pre-check]
  → (you)  createOrder({ userId, productId, quantity, totalAmount, paymentMethod })  → orderId
  → (Ujjal) <PaymentPanel userId orderId amount paymentMethod
              onSuccess onFailure />                   [renders wallet OR razorpay UI]
  → (you)  onSuccess → refresh CustomerOrders / show confirmation
```

### Seam contract (identical in both task files — do not change unilaterally)
`PaymentPanel` (owned by Ujjal, `src/components/PaymentPanel.jsx`):
- **Props in:** `userId` (`USER-xxxx`), `orderId` (from your `createOrder`), `amount` (number), `paymentMethod` (`"WALLET"` | `"RAZORPAY"`).
- **Callbacks out:** `onSuccess(result)` after payment confirmed/verified; `onFailure(error)` on failure/cancel.
- **You provide** the order summary + payment-method selector, then mount `<PaymentPanel>`; you do **not** call any `/payments/*` endpoint yourself.

⚠️ **Blocking question R4:** if `POST /orders/create` with `paymentMethod=WALLET` already processes the wallet payment **server-side** (inter-service call), then for wallet you skip `PaymentPanel` and just confirm; `PaymentPanel` is then Razorpay-only. Confirm with arka before wiring checkout.

---

## 6. Raise with teammate (your items)

| # | Question | Blocks |
|---|---|---|
| **R1** | Do `GET /products/search` and `POST /products/create` survive unchanged in your branch? Same fields/filters? | `CustomerHome`, `AdminProducts` |
| **R4** | Does `POST /orders/create` with `WALLET` pay internally, or must the FE call payment separately? | Checkout wiring (§5) |
| **R7** | `PATCH /orders/{orderId}/status`: query `?status=` or body? Allowed `status` values? Exact `paymentMethod` strings (`WALLET`/`RAZORPAY` casing)? | `AdminOrders`, `createOrder` |
| **R2** | Will product/order keep the `ApiResponse` envelope (so `unwrap()` stays valid)? | all your pages |

Shared blockers you inherit (Ujjal/arka owned): **R3** `USER-1001` mapping (until then, stub `getUserId()` with a manual input); the **Vite proxy + client.js** must land before any call routes correctly.

---

## 7. Order of work

1. Wait for / confirm Ujjal's **proxy + `client.js` + `unwrap()`** are in (HTTP layer). If not yet, build against them anyway — paths are relative.
2. `api/products.js` → **AdminProducts** + **CustomerHome grid** (no `userId` needed — unblocked now).
3. `api/orders.js` → **CustomerOrders** / **AdminOrders** (uses `getUserId()` — stub until R3).
4. Checkout order steps + integrate `<PaymentPanel>` once Ujjal ships it and R4 is answered.
