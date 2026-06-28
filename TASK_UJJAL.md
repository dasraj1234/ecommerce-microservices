# TASK — Ujjal · Payment-Wallet + Auth + Shared Infra

**Owner:** Ujjal · **Scope:** React frontend for the **Payment Wallet Service (:8083, `/payments`)**, **auth** (done), and the **shared frontend infrastructure** both owners build on.
**Derived from:** [TASK_DOCUMENT.md](TASK_DOCUMENT.md) (shared master). Pair file: [TASK_ANIRBAN.md](TASK_ANIRBAN.md) (Product-Order frontend).

---

## 1. What you own

**Shared infra (do FIRST — unblocks Anirban too):**
- `vite.config.js` dev proxy + relative base URL in `src/api/client.js`
- `src/api/client.js` `apiRequest()` (exists) + an `unwrap(res)` helper for the `ApiResponse` envelope
- `src/auth/session.js` → add `getUserId()` (stores `USER-1001` after login)

**Payment-Wallet:**
- `src/api/payments.js`
- Pages: `CustomerPayments`, `CustomerWallet`, `AdminPayments`
- `src/components/PaymentPanel.jsx` (the pay step Anirban's checkout hands off to — §5)
- Razorpay script loader + checkout modal + verify + cancel handling

**Auth (already working — maintain):** `Login`, `Signup`, `ProtectedRoute`, `session.js`, `api/auth.js`.

**Anirban depends on you for:** the proxy + `client.js`, `unwrap()`, `session.getUserId()`, and `<PaymentPanel>`. Ship these early.

---

## 2. Current state (your area)

| Item | State | File |
|---|---|---|
| client.js | ⚠️ base URL falls back to **`:8083`** (wrong); no proxy exists | [client.js](react-frontend/src/api/client.js) |
| .env / .env.example | ⚠️ point to `:8083` (should be relative / proxy) | [.env](react-frontend/.env) |
| Login / Signup | ✅ wired; comments wrongly say auth is `:8083` (it's `:8081`) | [Login.jsx](react-frontend/src/pages/auth/Login.jsx) |
| session.js | ✅ token/role/JWT decode; **no `getUserId()`** | [session.js](react-frontend/src/auth/session.js) |
| CustomerPayments | ❌ static, manual `USER-1001` input | [CustomerPayments.jsx](react-frontend/src/pages/customer/CustomerPayments.jsx) |
| CustomerWallet | ❌ static "Check Balance" — **no backend endpoint exists** | [CustomerWallet.jsx](react-frontend/src/pages/customer/CustomerWallet.jsx) |
| AdminPayments | ❌ static search-payment form | [AdminPayments.jsx](react-frontend/src/pages/admin/AdminPayments.jsx) |

**Envelope:** payment endpoints currently return **raw** objects (no `{success,message,data}`). Auth is also raw. `unwrap()` should pass raw bodies through unchanged and only strip `.data` when the envelope is present.

---

## 3. Infra tasks (do first)

- [ ] Add dev proxy to [vite.config.js](react-frontend/vite.config.js):
  ```js
  server: { proxy: {
    "/auth": "http://localhost:8081", "/users": "http://localhost:8081",
    "/products": "http://localhost:8082", "/orders": "http://localhost:8082",
    "/payments": "http://localhost:8083", "/wallets": "http://localhost:8083",
  }}
  ```
- [ ] `client.js`: `BASE_URL = import.meta.env.VITE_API_URL || ""` (relative); fix `.env`/`.env.example` (currently `:8083`).
- [ ] Fix the wrong `:8083` comments in `Login.jsx` / `Signup.jsx` (auth = `:8081`).
- [ ] Add `unwrap(res)` to `client.js` (or a small `src/api/envelope.js`) — used by both owners.
- [ ] `session.js`: add `getUserId()` + store `USER-xxxx` after login (blocked on R3 — stub from a manual input until the mapping endpoint exists).

---

## 4. `src/api/payments.js` (Payment Wallet Service)

| Endpoint | Request | Response (raw) | Function |
|---|---|---|---|
| `POST /payments/process` | `{ userId, orderId, amount, idempotencyKey }` | `PaymentResponse { paymentId, status, message }` | `processWalletPayment(payload)` |
| `GET /payments/{paymentId}` | — | `PaymentDetailsResponse { paymentId, orderId, userId, amount, status }` | `getPayment(paymentId)` |
| `GET /payments/user/{userId}` | — | `List<PaymentDetailsResponse>` | `getUserPayments(userId)` |
| `POST /payments/razorpay/create-order` | `{ userId, orderId, amount }` | `RazorpayOrderResponse { razorpayOrderId, key, amount, currency }` | `createRazorpayOrder(payload)` |
| `POST /payments/razorpay/verify` | `{ razorpayOrderId, razorpayPaymentId, razorpaySignature, userId, orderId }` | success/fail | `verifyRazorpayPayment(payload)` |

Generate `idempotencyKey` per attempt with `crypto.randomUUID()` so retries don't double-charge.

---

## 5. Page & component tasks

- [ ] **CustomerPayments** — auto-load `getUserPayments(getUserId())` into a table (drop the manual input).
- [ ] **AdminPayments** — wire search → `getPayment(paymentId)`; optionally list via `getUserPayments`.
- [ ] **CustomerWallet** — balance display is **blocked**: the spec has no wallet-balance endpoint (R5). Keep the stub until confirmed.
- [ ] **`<PaymentPanel>`** — the shared pay component (the seam, §6):
  - `WALLET` → `processWalletPayment({ userId, orderId, amount, idempotencyKey })`.
  - `RAZORPAY` → `createRazorpayOrder()` → load `https://checkout.razorpay.com/v1/checkout.js` → open modal with `{ key, order_id: razorpayOrderId, amount, currency, handler }` → in handler map Razorpay's snake_case callback (`razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`) to the camelCase verify DTO → `verifyRazorpayPayment()`.
  - Handle modal **dismiss/cancel** (`modal.ondismiss`) → `onFailure`, leave order PENDING.

---

## 6. The seam (identical in both task files — do not change unilaterally)

Anirban creates the order; your `<PaymentPanel>` does the pay step.
```
(Anirban) createOrder(...) → orderId
  → (you) <PaymentPanel userId orderId amount paymentMethod onSuccess onFailure />
  → (Anirban) onSuccess → refresh order history
```
`PaymentPanel` (`src/components/PaymentPanel.jsx`):
- **Props in:** `userId` (`USER-xxxx`), `orderId`, `amount` (number), `paymentMethod` (`"WALLET"` | `"RAZORPAY"`).
- **Callbacks out:** `onSuccess(result)`, `onFailure(error)`.
- Anirban never calls `/payments/*` directly; you never call `/orders/*`.

⚠️ **R4:** if `POST /orders/create` with `WALLET` pays server-side, `PaymentPanel` becomes Razorpay-only. Confirm with arka.

---

## 7. Raise with teammate (your items)

| # | Question | Blocks |
|---|---|---|
| **R3** | What endpoint returns `USER-1001` for a logged-in username (`GET /users/me/id`?)? Owner? Who seeds existing users? | `getUserId()` → **every** order/payment call (both owners) |
| **R5** | Is there a wallet-balance endpoint (e.g. `GET /wallets/{userId}`)? | `CustomerWallet` |
| **R6** | Razorpay: is `key` always returned by `create-order`? Is `amount` in **paise or rupees**? Does the backend convert? | `PaymentPanel` Razorpay path |
| **R9** | Payment-service CORS allows only `:8082`, blocking `:5173`. Add `:5173` or rely on the proxy? | direct payment calls |
| **R2** | Standardize all services on `{success,message,data}`, or keep payment raw (so `unwrap()` must handle both)? | `unwrap()` design |
| **R8** | Final gateway origin/port; prefixes unchanged? Will it enforce JWT on `/orders`/`/payments`, from when? | header injection, all calls |
| **R4 / R7** | Wallet auto-pay on order create? Exact `paymentMethod` casing? | `PaymentPanel` |

---

## 8. Order of work

1. **Infra first** (§3) — proxy + base URL + `unwrap()` + `getUserId()`. This unblocks Anirban; ship it early.
2. `api/payments.js` → **CustomerPayments** + **AdminPayments** (uses `getUserId()` — stub until R3).
3. **`<PaymentPanel>`** (wallet path first, then Razorpay once R6 answered) → hand the component to Anirban for checkout.
4. **CustomerWallet** last (blocked on R5).
