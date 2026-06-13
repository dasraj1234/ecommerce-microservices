# TASK_DOCUMENT — React Frontend Integration (Master)

**Owners:** Ujjal + Anirban (frontend) · **Date:** 2026-06-13
**Scope:** Build the React frontend that consumes the teammate's documented **Product Order Service (:8082)** and **Payment Wallet Service (:8083)**, on top of the existing **auth-user-service (:8081)**.

> **This is the shared master** (current state, full mismatch + raise list). The build work is split into two per-owner working files:
> - [TASK_ANIRBAN.md](TASK_ANIRBAN.md) — **Product-Order frontend** (`/products` + `/orders`): products & orders pages, order-creation half of checkout.
> - [TASK_UJJAL.md](TASK_UJJAL.md) — **Payment-Wallet + Auth + shared infra**: payments/wallet pages, `<PaymentPanel>`, Vite proxy, `client.js`, `session.getUserId()`, `unwrap()`.
>
> The checkout flow is the seam between them: Anirban creates the order → hands `orderId` to Ujjal's `<PaymentPanel>` → pays. The seam contract is duplicated verbatim in both files.

> The teammate's Product/Order + Payment/Wallet code (with Razorpay, stock check, dual-pay) lives on a **separate branch not yet in this repo**. Their documentation is treated as the **contract/spec**. This document plans the frontend against that spec and flags everything that must be agreed before merge.
>
> This is the **single, self-contained** planning doc for the frontend work. All cross-service facts below were verified against the code currently in this repo (auth-user-service + react-frontend + the local, partial product/payment service shells); anything not verifiable here is marked "confirm with teammate" in §6.

---

## 1. My current state (what already exists)

### 1.1 auth-user-service (port **8081**) — mine, do-not-break

| Item | Reality in code |
|---|---|
| Login | `POST /auth/login` → returns **raw** `LoginResponse { token, username, role }` (no envelope) — [AuthController.java](auth-user-service/src/main/java/com/MCA/authN_Z/controller/AuthController.java) |
| Register | `POST /users/register` → returns **raw** `User` entity — [UserController.java](auth-user-service/src/main/java/com/MCA/authN_Z/controller/UserController.java) |
| User lookups | `GET /users/all` (ADMIN), `GET /users/{id}` (UUID), `GET /users/username/{username}`, `GET /users/test` |
| JWT | HS256, claims = **`sub` (username)`, `role`, `iat`, `exp`** — **NO `userId` claim** — [JwtUtil.java](auth-user-service/src/main/java/com/MCA/authN_Z/utill/JwtUtil.java) |
| User PK | `UUID id` (camelCase Java field, stored as 36-char **varchar**) — **not** `user_id`, **not** `USER-1001` — [User.java](auth-user-service/src/main/java/com/MCA/authN_Z/entity/User.java) |
| Security | `/auth/**`, `/users/register`, `/users/test` public; `/users/all` = ADMIN; everything else authenticated — [SecurityConfig.java](auth-user-service/src/main/java/com/MCA/authN_Z/config/SecurityConfig.java) |
| CORS | Allows `http://localhost:5173`, `http://localhost:5174`; credentials enabled |
| DB | MySQL `ecommerce_db`, `ddl-auto: update` — [application.yml](auth-user-service/src/main/resources/application.yml) |

### 1.2 react-frontend (Vite + React 18 + react-router 6 + Tailwind 3)

**Infrastructure (working):**
| File | What it does | State |
|---|---|---|
| [src/api/client.js](react-frontend/src/api/client.js) | `apiRequest(path, {method, body, token})` — fetch wrapper, throws backend `message` | ⚠️ Base URL falls back to **`:8083`** (wrong — that's the payment port) |
| [src/api/auth.js](react-frontend/src/api/auth.js) | `login()`, `register()` | ✅ |
| [src/auth/session.js](react-frontend/src/auth/session.js) | localStorage token/role/username, decodes JWT `exp`/`role`, `isAuthenticated()`, `homeForRole()` | ✅ |
| [src/auth/ProtectedRoute.jsx](react-frontend/src/auth/ProtectedRoute.jsx) | Route guard (auth + role) | ✅ |
| [src/App.jsx](react-frontend/src/App.jsx) | Routes for admin + customer | ✅ |
| [src/components/Sidebar.jsx](react-frontend/src/components/Sidebar.jsx) | Nav + logout | ✅ |
| [vite.config.js](react-frontend/vite.config.js) | Bare — **no dev proxy** | ❌ must add |

**Pages:**
| Page | Wired to backend? | Notes |
|---|---|---|
| [Login.jsx](react-frontend/src/pages/auth/Login.jsx) | ✅ calls `login()` | Comment wrongly says auth is `:8083` |
| [Signup.jsx](react-frontend/src/pages/auth/Signup.jsx) | ✅ calls `register()` | Comment wrongly says `:8083` |
| [LandingPage.jsx](react-frontend/src/pages/LandingPage.jsx) | — static | "Loading Services..." placeholder |
| [CustomerHome.jsx](react-frontend/src/pages/customer/CustomerHome.jsx) | ❌ static shell | "Loading Products..." — no product grid |
| [CustomerOrders.jsx](react-frontend/src/pages/customer/CustomerOrders.jsx) | ❌ static shell | Hardcoded `USER-1001` input |
| [CustomerPayments.jsx](react-frontend/src/pages/customer/CustomerPayments.jsx) | ❌ static shell | Hardcoded `USER-1001` input |
| [CustomerWallet.jsx](react-frontend/src/pages/customer/CustomerWallet.jsx) | ❌ static shell | "Check Balance" — **no backend endpoint exists for this** |
| [AdminDashboard.jsx](react-frontend/src/pages/admin/AdminDashboard.jsx) | ❌ static shell | KPI cards show `--` |
| [AdminProducts.jsx](react-frontend/src/pages/admin/AdminProducts.jsx) | ❌ static shell | Create-product form, no submit |
| [AdminOrders.jsx](react-frontend/src/pages/admin/AdminOrders.jsx) | ❌ static shell | Create-order form, no submit |
| [AdminPayments.jsx](react-frontend/src/pages/admin/AdminPayments.jsx) | ❌ static shell | Search-payment form, no submit |

**Summary:** Auth (login/signup) + routing + role-guarding are done. **Every order/product/payment/wallet page is a static placeholder** with no API call. There is **no** `api/orders.js`, `api/payments.js`, or `api/products.js` yet. No Razorpay script integration. No `userId` resolution (pages fake it with a manual `USER-1001` text field).

**Two styling systems coexist:** auth pages use Tailwind utility classes; dashboard/customer pages use hand-written CSS classes (`.layout`, `.card`, `.sidebar`, `.kpi-grid`) from [global.css](react-frontend/src/styles/global.css). Pick one convention as pages get built out (recommend Tailwind for new work).

---

## 2. React integration plan — per documented endpoint

Create three new API modules mirroring `api/auth.js`. All call `apiRequest` from `client.js` using **relative paths** (proxy resolves the port — see §5).

> **Envelope note:** Product/Order responses are wrapped as `ApiResponse { success, message, data }` → callers read `.data`. Payment responses are currently **raw**. Add an `unwrap(res)` helper so components don't special-case this. (See mismatch M3.)

### 2.1 `api/orders.js` — Product Order Service (:8082, `/orders`)

| Spec endpoint | New API function | Request | Used by component |
|---|---|---|---|
| `POST /orders/create` | `createOrder(payload)` | `{ userId, productId, quantity, totalAmount, paymentMethod }` | Checkout flow from `CustomerHome`; `AdminOrders` create form |
| `GET /orders/history/{userId}` | `getOrderHistory(userId)` | — | **`CustomerOrders`** (list + cancel buttons); `AdminOrders` |
| `PATCH /orders/{orderId}/cancel` | `cancelOrder(orderId)` | — | `CustomerOrders` / `AdminOrders` per-row "Cancel" |
| `PATCH /orders/{orderId}/status` | `updateOrderStatus(orderId, status)` | `?status=` (confirm body vs query) | `AdminOrders` status dropdown |
| `GET /orders/stock/check` | `checkStock(productId, quantity)` | `?productId=&quantity=` | Checkout, **before** create/pay |

### 2.2 `api/payments.js` — Payment Wallet Service (:8083, `/payments`)

| Spec endpoint | New API function | Request | Used by component |
|---|---|---|---|
| `POST /payments/process` | `processWalletPayment(payload)` | `{ userId, orderId, amount, idempotencyKey }` | Checkout when `paymentMethod = WALLET` |
| `GET /payments/{paymentId}` | `getPayment(paymentId)` | — | **`AdminPayments`** search; order detail |
| `GET /payments/user/{userId}` | `getUserPayments(userId)` | — | **`CustomerPayments`** history; `AdminPayments` |
| `POST /payments/razorpay/create-order` | `createRazorpayOrder(payload)` | `{ userId, orderId, amount }` | Checkout when `paymentMethod = RAZORPAY` |
| `POST /payments/razorpay/verify` | `verifyRazorpayPayment(payload)` | `{ razorpayOrderId, razorpayPaymentId, razorpaySignature, userId, orderId }` | Razorpay modal success handler |

### 2.3 `api/products.js` — **gap: not in the teammate's spec**

`CustomerHome` ("Product Store") and `AdminProducts` ("Create Product") need product listing/creation, but the spec **lists no product endpoints**. Two were found and verified in the local `product-order-service` code ([ProductController.java](product-order-service/src/main/java/com/ecommerce/productorder/product/controller/ProductController.java)): `GET /products/search` and `POST /products/create`. Since this is the local (stale) shell, **confirm they survive in the teammate's branch unchanged** (see Raise list R1), then:

| Endpoint (verified locally) | Response | API function | Used by |
|---|---|---|---|
| `GET /products/search?name=&category=&maxPrice=` | `ApiResponse<List<ProductResponse>>` | `searchProducts(filters)` | `CustomerHome` grid, `AdminProducts` list |
| `POST /products/create` (body = `ProductRequest`) | `ApiResponse<String>` | `createProduct(payload)` | `AdminProducts` create form |

`ProductResponse` fields (for rendering the grid): `{ productId, productName, category, price, stock, status }`.

### 2.4 `userId` resolution helper — **the central blocker**

Every order/payment call needs a `userId` in **`USER-1001`** form. Login/JWT only provide **`username`**; the `User` PK is a UUID, not `USER-1001`. **There is no way for the frontend to obtain `USER-1001` today.** All current pages fake it with a manual text input.

Plan once the mapping endpoint exists (see R3):
- Add `getMyBusinessId()` in `api/auth.js` calling the agreed lookup (e.g. `GET /users/me/id`).
- After login, store the returned `USER-xxxx` in session (`session.js` → `getUserId()`).
- Replace every hardcoded `USER-1001` `<input>` with the session value.

---

## 3. Payment flow mapping (what the React side needs)

### 3.1 Wallet payment
```
CustomerHome (pick product/qty)
  → checkStock(productId, quantity)            GET /orders/stock/check   [optional pre-check]
  → createOrder({..., paymentMethod:"WALLET"}) POST /orders/create        → orderId
  → processWalletPayment({userId, orderId,     POST /payments/process     → PaymentResponse
       amount, idempotencyKey})
  → show success → refresh CustomerOrders / CustomerPayments
```
**React needs:**
- An `idempotencyKey` generated client-side per attempt: `crypto.randomUUID()` (so retries don't double-charge).
- Decision: does `POST /orders/create` with `WALLET` **trigger payment server-side** (inter-service call per spec §6), or must the FE call `/payments/process` itself? → **R4**.
- Wallet balance display in `CustomerWallet` currently has **no endpoint** → **R5**.

### 3.2 Razorpay payment
```
createOrder({..., paymentMethod:"RAZORPAY"})    POST /orders/create               → orderId (PENDING)
  → createRazorpayOrder({userId, orderId,        POST /payments/razorpay/create-order
       amount})                                  → { razorpayOrderId, key, amount, currency }
  → open Razorpay Checkout modal with key + razorpayOrderId + amount + currency
  → user pays → Razorpay handler returns { razorpay_order_id, razorpay_payment_id, razorpay_signature }
  → verifyRazorpayPayment({razorpayOrderId,      POST /payments/razorpay/verify
       razorpayPaymentId, razorpaySignature,     → success/fail
       userId, orderId})
  → on success → order confirmation + refresh history
```
**React needs:**
1. Load Razorpay Checkout JS dynamically: `https://checkout.razorpay.com/v1/checkout.js` (inject `<script>` once; resolve a promise on load).
2. The **public `key`** comes back **inside the create-order response** (`RazorpayOrderResponse.key`) — so no separate config call is strictly required, but confirm (R6).
3. Map response → `new Razorpay({ key, order_id: razorpayOrderId, amount, currency, handler })`.
4. In `handler`, call `verifyRazorpayPayment(...)`; map Razorpay's snake_case callback fields (`razorpay_order_id` etc.) to the spec's camelCase verify DTO (`razorpayOrderId` etc.).
5. Handle modal **dismiss/cancel** (`modal.ondismiss`) → mark attempt abandoned, leave order PENDING.
6. Amount unit: confirm rupees vs paise — Razorpay expects **paise** in the modal; check whether the backend already converts (R6).

---

## 4. Convention mismatches — raise BEFORE merge

| # | Area | My auth-service | Teammate spec | Risk for frontend |
|---|---|---|---|---|
| **M1** | **`userId` identity** | JWT has `username` only; `User` PK is a **UUID** | Order/Payment DTOs need `userId` = **`USER-1001`** | FE has **no source** for `USER-1001`. Hard blocker — needs mapping endpoint (R3). |
| **M2** | **Primary-key naming** | `id` (camelCase field / varchar col) | `product_id`, `order_id`, `payment_id`, `wallet_id`, `transaction_id` (snake_case `xxx_id`) | DTO JSON keys must be camelCase (`orderId`, `paymentId`) on the wire — confirm services serialize camelCase, not snake_case. |
| **M3** | **Response envelope** | **raw** objects (`LoginResponse`, `User`) | spec shows `{ success, message, data }` for all | Today: Product/Order = enveloped, Payment = raw, Auth = raw → **3 shapes**. FE parser must special-case or services must standardize. Pick one (R2). |
| **M4** | **Base-path style** | `/auth`, `/users` (plural resource + verb sub-path) | `/orders`, `/payments` (same style) | Mostly consistent. Just confirm gateway preserves prefixes verbatim (no rewrites). |
| **M5** | **`paymentMethod` values** | n/a | "Wallet and Razorpay" | Confirm exact strings the API expects: `WALLET`/`RAZORPAY` vs `Wallet`/`Razorpay`. FE must send the exact casing. |
| **M6** | **`status` transport** | n/a | `PATCH /orders/{orderId}/status` | Spec doesn't say query vs body; contract shows `?status=`. Confirm. |

---

## 5. React conversion tasks (per page / infra)

### Infra (do first — unblocks everything)
- [ ] **Fix base URL / add Vite proxy.** Three services on 3 ports can't share one `VITE_API_URL`. Switch components to **relative paths** and add a dev proxy in [vite.config.js](react-frontend/vite.config.js):
  ```js
  server: { proxy: {
    "/auth": "http://localhost:8081", "/users": "http://localhost:8081",
    "/products": "http://localhost:8082", "/orders": "http://localhost:8082",
    "/payments": "http://localhost:8083", "/wallets": "http://localhost:8083",
  }}
  ```
- [ ] Set `BASE_URL = import.meta.env.VITE_API_URL || ""` (relative) in [client.js](react-frontend/src/api/client.js); fix `.env`/`.env.example` (currently wrongly `:8083`).
- [ ] Fix the wrong `:8083` comments in [Login.jsx](react-frontend/src/pages/auth/Login.jsx) / [Signup.jsx](react-frontend/src/pages/auth/Signup.jsx) (auth is `:8081`).
- [ ] Add `api/orders.js`, `api/payments.js`, `api/products.js` (§2) + an `unwrap()` helper for the envelope.
- [ ] Add `getUserId()` to `session.js`; store business id after login (blocked on R3 — stub with manual input until then).

### Per page
- [ ] **CustomerHome** — product grid via `searchProducts()`; "Buy" → checkout (stock check → create order → pay).
- [ ] **CustomerOrders** — replace `USER-1001` input with session id; `getOrderHistory()` table; per-row `cancelOrder()`.
- [ ] **CustomerPayments** — `getUserPayments(userId)` table (auto-load from session, not manual input).
- [ ] **CustomerWallet** — balance display **blocked** on a wallet endpoint (R5); keep stub until confirmed.
- [ ] **AdminProducts** — wire create form → `createProduct()`; add product list.
- [ ] **AdminOrders** — wire create form → `createOrder()`; add order list + `updateOrderStatus()` + `cancelOrder()`.
- [ ] **AdminPayments** — wire search → `getPayment(paymentId)`; optionally list via `getUserPayments`.
- [ ] **AdminDashboard** — KPI counts (depends on list endpoints; may need count endpoints — confirm).

### Payment integration tasks
- [ ] Wallet checkout path (§3.1) incl. client-side `idempotencyKey`.
- [ ] Razorpay: dynamic script loader util; checkout modal launcher; verify handler; cancel handling; camelCase mapping (§3.2).
- [ ] Shared `Checkout` component used by both Customer and Admin order flows.

---

## 6. Raise with teammate BEFORE merge

| # | Question | Why it blocks me |
|---|---|---|
| **R1** | Confirm product endpoints (`GET /products/search`, `POST /products/create`) — they're **not in your spec** but the UI needs them. Exact paths + filters + response shape? | `CustomerHome` grid + `AdminProducts` can't be built without them. |
| **R2** | **Response envelope:** standardize all services on `{ success, message, data }`, or do I adapt per-service? Payment currently returns raw. | Determines whether the FE parser is uniform or special-cased (M3). |
| **R3** | **`userId` mapping:** what endpoint returns `USER-1001` for a logged-in username? (`GET /users/me/id`?) Who owns it, who seeds existing users? | **Hard blocker** — no order/payment call works without it (M1). |
| **R4** | Does `POST /orders/create` with `WALLET` **process the wallet payment internally**, or must the FE separately call `POST /payments/process`? | Decides whether wallet checkout is 1 call or 2 (§3.1). |
| **R5** | Is there a **wallet balance** endpoint (e.g. `GET /wallets/{userId}`)? `CustomerWallet` references it but the spec has none. | `CustomerWallet` "Check Balance" can't work otherwise (§5). |
| **R6** | **Razorpay specifics:** is `key` always returned in `create-order`? Is `amount` in **paise or rupees**? Does the backend convert? Where does the public key come from if not in the response? | Drives the Razorpay modal config + amount math (§3.2). |
| **R7** | Exact **`paymentMethod`** string values (`WALLET`/`RAZORPAY` casing) and **`status`** values for `PATCH /status`; is status sent as `?status=` query or in the body? | FE must send exact values (M5/M6). |
| **R8** | **Gateway & JWT:** final gateway origin/port; will prefixes stay identical (no rewrites)? Will the gateway enforce JWT on `/orders` & `/payments`, and from when? | If JWT enforcement turns on, every FE call needs the `Bearer` header or it 401s (M4). |
| **R9** | **CORS:** payment-service currently allows only `:8082`, blocking `:5173`. Add `:5173` or rely on the Vite proxy? | Direct (non-proxy) calls to payment will be CORS-blocked otherwise. |

---

## 7. Bottom line

- **~80–90% of the UI can be built now** against this spec using the new `api/*.js` modules + Vite proxy, stubbing `userId` with a manual input.
- **Three hard blockers** before real end-to-end testing: **R3** (`USER-1001` mapping), **R1** (product endpoints), and the **payment-service build/merge** — the Razorpay/stock/dual-pay code isn't in this repo (it's on a separate branch), and the local `payment-wallet-service` has no main application class (its `wallet` package is also absent), so it won't build as-is. Both are arka's to resolve before payment screens can be tested end-to-end.
- **Do first:** the proxy + base-URL fix (§5 infra) — nothing routes correctly until that lands.
