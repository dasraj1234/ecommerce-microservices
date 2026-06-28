import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev proxy: components call RELATIVE paths (e.g. /auth/login, /orders/create)
// and Vite forwards each prefix to the right backend service. This keeps ports
// out of component code — once the API gateway exists, only these targets
// change (point them all at the gateway origin), not the frontend code.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth": "http://localhost:8081",
      "/users": "http://localhost:8081",
      "/products": "http://localhost:8082",
      "/orders": "http://localhost:8082",
      "/payments": "http://localhost:8083",
      "/wallets": "http://localhost:8083",
    },
  },
});
