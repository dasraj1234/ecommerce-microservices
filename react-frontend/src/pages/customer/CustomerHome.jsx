import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
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
        [product.productId]: { ok: false, message: "Enter your user id (e.g. USER-1001) above first." },
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
    <div className="layout">
      <Sidebar type="customer" />
      <div className="main-content">
        <h1>Product Store</h1>

        <div className="card" style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 600 }}>Your User ID</label>
          <input
            placeholder="USER-1001"
            value={userId}
            onChange={(e) => setUserIdInput(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="card">Loading Products...</div>
        ) : error ? (
          <div className="card">{`[ERROR] ${error}`}</div>
        ) : products.length === 0 ? (
          <div className="card">No products available.</div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => {
              const status = orderStatus[p.productId];
              return (
                <div
                  key={p.productId}
                  className="card flex aspect-square flex-col justify-between"
                >
                  <div>
                    <h3 className="text-base font-semibold leading-tight">{p.productName}</h3>
                    <p className="mt-1 text-sm text-gray-500">{p.category}</p>
                    <p className="mt-3 text-lg font-bold">₹{p.price}</p>
                    <p className="text-xs text-gray-500">Stock: {p.stock}</p>
                  </div>

                  <div>
                    <input
                      type="number"
                      min="1"
                      value={quantityFor(p.productId)}
                      onChange={(e) => setQuantityFor(p.productId, e.target.value)}
                      style={{ marginTop: 8 }}
                    />
                    <button
                      onClick={() => placeOrder(p)}
                      disabled={ordering === p.productId}
                      style={{ width: "100%" }}
                    >
                      {ordering === p.productId ? "Ordering..." : "Order"}
                    </button>
                    {status && (
                      <p
                        style={{
                          marginTop: 8,
                          fontSize: 12,
                          color: status.ok ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {status.message}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
