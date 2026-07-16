import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Field from "../../components/Field";
import Button from "../../components/Button";
import IdTag from "../../components/IdTag";
import { searchProducts } from "../../api/products";
import { createOrder } from "../../api/orders";
import { getUserId, setUserId } from "../../auth/session";

// Customer product browsing + ordering.
// Backend: GET /products/search, POST /orders/create (product-order-service @ :8082, via Vite proxy)
export default function CustomerHome() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userId, setUserIdInput] = useState(getUserId() || "");
  const [quantities, setQuantities] = useState({});
  const [ordering, setOrdering] = useState(null);
  const [orderStatus, setOrderStatus] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await searchProducts();
        if (!cancelled) setProducts(data || []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load products.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const quantityFor = (productId) => quantities[productId] ?? 1;
  const setQuantityFor = (productId, value) =>
    setQuantities((q) => ({ ...q, [productId]: value }));

  const placeOrder = async (product) => {
    setOrderStatus((s) => ({ ...s, [product.productId]: null }));

    if (!userId.trim()) {
      setOrderStatus((s) => ({
        ...s,
        [product.productId]: { ok: false, message: "Enter your user id above first." },
      }));
      return;
    }
    const quantity = parseInt(quantityFor(product.productId), 10);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setOrderStatus((s) => ({
        ...s,
        [product.productId]: { ok: false, message: "Quantity must be a positive number." },
      }));
      return;
    }

    setOrdering(product.productId);
    try {
      setUserId(userId.trim());
      const data = await createOrder({
        userId: userId.trim(),
        productId: product.productId,
        quantity,
        totalAmount: product.price * quantity,
      });
      setOrderStatus((s) => ({
        ...s,
        [product.productId]: { ok: true, message: `Order ${data.orderId} ${data.status}` },
      }));
    } catch (err) {
      setOrderStatus((s) => ({
        ...s,
        [product.productId]: { ok: false, message: err.message || "Could not place order." },
      }));
    } finally {
      setOrdering(null);
    }
  };

  return (
    <PageShell type="customer" eyebrow="Storefront" title="Browse products">
      <Card className="mb-6 !p-4">
        <div className="flex flex-wrap items-end gap-3">
          <Field
            label="Your user ID"
            placeholder="USER-1001"
            value={userId}
            onChange={(e) => setUserIdInput(e.target.value)}
            className="max-w-xs flex-1"
          />
          <p className="pb-2.5 text-xs text-ink-600/60">
            Used to place orders and look up your history.
          </p>
        </div>
      </Card>

      {loading ? (
        <Card className="text-sm text-ink-600">Loading products…</Card>
      ) : error ? (
        <Card className="text-sm text-red-600">{error}</Card>
      ) : products.length === 0 ? (
        <Card className="text-sm text-ink-600">No products available yet.</Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => {
            const status = orderStatus[p.productId];
            const lowStock = typeof p.stock === "number" && p.stock <= 5;
            return (
              <div
                key={p.productId}
                className="flex flex-col justify-between rounded-2xl border border-ink-900/[0.06] bg-white p-5 shadow-card"
              >
                <div>
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <IdTag>{p.productId}</IdTag>
                    {lowStock && (
                      <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand-dark">
                        Low stock
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-base font-semibold leading-tight text-ink-900">
                    {p.productName}
                  </h3>
                  <p className="mt-1 text-sm text-ink-600">{p.category}</p>
                  <p className="mt-3 font-mono text-xl font-semibold text-ink-900">₹{p.price}</p>
                  <p className="mt-0.5 text-xs text-ink-600/60">{p.stock} in stock</p>
                </div>

                <div className="mt-4 space-y-2.5">
                  <input
                    type="number"
                    min="1"
                    value={quantityFor(p.productId)}
                    onChange={(e) => setQuantityFor(p.productId, e.target.value)}
                    className="w-full rounded-lg border border-ink-900/10 bg-paper px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                  <Button
                    variant="brand"
                    onClick={() => placeOrder(p)}
                    disabled={ordering === p.productId}
                    className="w-full"
                  >
                    {ordering === p.productId ? "Ordering…" : "Order now"}
                  </Button>
                  {status && (
                    <p className={`text-xs ${status.ok ? "text-teal-dark" : "text-red-600"}`}>
                      {status.message}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
