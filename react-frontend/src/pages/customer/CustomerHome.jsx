import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Button from "../../components/Button";
import IdTag from "../../components/IdTag";
import { searchProducts } from "../../api/products";

// Customer product browsing. "Order now" hands the product off to the checkout
// form (CustomerOrders), which owns quantity, payment method and payment —
// same handoff as the JSP frontend's home -> orders?productId=…&amount=…
// Backend: GET /products/search (product-order-service @ :8082, via the gateway)
export default function CustomerHome() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const orderNow = (p) =>
    navigate(
      `/customer/orders?productId=${encodeURIComponent(p.productId)}` +
        `&name=${encodeURIComponent(p.productName)}` +
        `&price=${p.price}`
    );

  return (
    <PageShell type="customer" eyebrow="Storefront" title="Browse products">
      {loading ? (
        <Card className="text-sm text-ink-600">Loading products…</Card>
      ) : error ? (
        <Card className="text-sm text-red-600">{error}</Card>
      ) : products.length === 0 ? (
        <Card className="text-sm text-ink-600">No products available yet.</Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => {
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

                <Button
                  variant="brand"
                  onClick={() => orderNow(p)}
                  disabled={p.stock === 0}
                  className="mt-4 w-full"
                >
                  {p.stock === 0 ? "Out of stock" : "Order now"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
