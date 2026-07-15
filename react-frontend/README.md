# Manifest — E-Commerce Microservices Portal

Redesigned frontend for the products/orders/payments/wallet microservices
platform. Functionality and API contracts are unchanged from the original —
only the UI layer (styling, layout, shared components) was rebuilt.

## Design system

- **Palette**: `ink` (near-black navy, used for the app shell/sidebar and the
  admin console background), `paper` / `paper-warm` (light backgrounds for
  admin vs. customer areas), `brand` (amber, kept from the original config),
  `teal` (success/confirmed states).
- **Type**: Space Grotesk for display/headings, Inter for body text, IBM Plex
  Mono for IDs, prices, and console output.
- **Signature element**: every system ID (order, product, payment, user)
  renders as a small dashed-edge "manifest tag" (`<IdTag />` /
  `.id-tag` in `src/styles/global.css`) — a nod to shipping-manifest tickets
  that ties the app's many generated IDs back to the logistics domain.
- Shared primitives live in `src/components`: `Card`, `Field`, `Button`,
  `IdTag`, `StatusBadge`, `Sidebar`, `PageShell`.

## What changed vs. the original

- Replaced the plain-CSS `.layout` / `.card` / `.kpi-grid` classes with a
  full Tailwind-based system (`preflight` re-enabled).
- Rebuilt `Sidebar`, `LandingPage`, and every admin/customer page visually.
- Reconstructed `auth/session.js`, `auth/ProtectedRoute.jsx`, and the four
  `src/api/*.js` modules — these weren't included in the files you shared,
  so they were rebuilt from the endpoint contracts documented in comments
  in the page components (e.g. `POST /auth/login`, `GET /products/search`).
  Check these against your actual backend before relying on them.
- Nothing about routing, business logic, or request/response shapes was
  changed.

## Running it

```bash
npm install
npm run dev
```

The Vite dev server proxies `/auth`, `/users`, `/products`, `/orders`,
`/payments`, and `/wallet` to the backend ports defined in
`vite.config.js`. Leave `VITE_API_URL` unset in `.env` unless you're
bypassing the proxy for a single gateway origin.
