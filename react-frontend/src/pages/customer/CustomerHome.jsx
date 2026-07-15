import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { searchProducts } from "../../api/products";

// Customer product browsing. Buy Now hands the product off to the Place Order
// page (CustomerOrders), which owns quantity, payment method, and checkout —
// same handoff as the JSP frontend's home -> orders?productId=...&amount=...
// Backend: GET /products/search (product-order-service @ :8082, via Vite proxy)
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

  const buyNow = (product) =>
    navigate(
      `/customer/orders?productId=${encodeURIComponent(product.productId)}` +
        `&name=${encodeURIComponent(product.productName)}` +
        `&price=${product.price}`
    );

  return (
    <div className="layout">
      <Sidebar type="customer" />
      <div className="main-content">
        <h1>Product Store</h1>

        {loading ? (
          <div className="card">Loading Products...</div>
        ) : error ? (
          <div className="card">{`[ERROR] ${error}`}</div>
        ) : products.length === 0 ? (
          <div className="card">No products available.</div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
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

                <button onClick={() => buyNow(p)} style={{ width: "100%" }}>
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
