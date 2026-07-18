import { apiRequest } from "./client";
import { getToken } from "../auth/session";

// Admin Payment MIS endpoints (payment-wallet-service @ :8083, routed via the
// gateway under /admin/payments — admin-only). Replaces the standalone JSP MIS
// page; consumed by the native React page at /admin/mis.

function buildQuery({ fromDate, toDate, status = "ALL", paymentMethod = "ALL" }) {
  const params = new URLSearchParams({ fromDate, toDate, status, paymentMethod });
  return params.toString();
}

/**
 * GET /admin/payments/mis — transaction report rows for the given filters.
 * @returns {Promise<Array<{paymentId, orderId, userId, amount, paymentMethod, status, paymentDate}>>}
 */
export function getPaymentMIS(filters) {
  return apiRequest(`/admin/payments/mis?${buildQuery(filters)}`, {
    token: getToken(),
  });
}

/**
 * GET /admin/payments/mis/download — Excel export of the same filtered report.
 *
 * The gateway enforces JWT on this route, so we can't just point the browser at
 * the URL (window.location sends no Authorization header). Instead we fetch the
 * file as a blob with the bearer token and trigger a client-side download.
 */
export async function downloadPaymentMIS(filters) {
  const res = await fetch(`/admin/payments/mis/download?${buildQuery(filters)}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) {
    throw new Error(`Download failed (${res.status})`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Payment_MIS.xlsx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
