import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev proxy: components call RELATIVE paths (e.g. /auth/login, /orders/create)
// and Vite forwards them to the API gateway (:8080), which authenticates the
// JWT and routes to the right backend service. Everything goes through the
// single gateway origin — the per-service ports (8081/8082/8083) are no longer
// referenced here.
const GATEWAY = "http://localhost:8080";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth": GATEWAY,
      "/users": GATEWAY,
      "/products": GATEWAY,
      "/orders": GATEWAY,
      "/categories": GATEWAY,
      "/payments": GATEWAY,
      "/wallet": GATEWAY,
    },
  },
});
