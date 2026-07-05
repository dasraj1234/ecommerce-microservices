import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { createProduct, searchProducts } from "../../api/products";

// Admin product management.
// Backend: POST /products/create, GET /products/search (product-order @ :8082)
const EMPTY_FORM = { productName: "", category: "", price: "", stock: "" };

export default function AdminProducts() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("Admin Product Console");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await searchProducts();
      setProducts(data || []);
    } catch (err) {
      setStatus(`[ERROR] ${err.message || "Could not load products."}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    if (!form.productName.trim()) {
      setStatus("[ERROR] Product name is required.");
      return;
    }
    setSaving(true);
    setStatus("");
    try {
      await createProduct({
        productName: form.productName.trim(),
        category: form.category.trim(),
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
      });
      setStatus("[SUCCESS] Product created successfully");
      setForm(EMPTY_FORM);
      await loadProducts();
    } catch (err) {
      setStatus(`[ERROR] ${err.message || "Could not create product."}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="layout">
      <Sidebar type="admin" />
      <div className="main-content">
        <div className="page-title">Product Management</div>

        <div className="card">
          <h3>Create Product</h3>
          <input
            name="productName"
            placeholder="Product Name"
            value={form.productName}
            onChange={onChange}
          />
          <input
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={onChange}
          />
          <input
            name="price"
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={onChange}
          />
          <input
            name="stock"
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={onChange}
          />
          <button onClick={submit} disabled={saving}>
            {saving ? "Creating..." : "Create Product"}
          </button>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <h3>Product Catalog</h3>
          <button onClick={loadProducts} disabled={loading}>
            {loading ? "Loading..." : "Refresh Products"}
          </button>

          <table
            className="admin-table"
            style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}
          >
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                <th style={{ padding: 8 }}>ID</th>
                <th style={{ padding: 8 }}>Name</th>
                <th style={{ padding: 8 }}>Category</th>
                <th style={{ padding: 8 }}>Price</th>
                <th style={{ padding: 8 }}>Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td style={{ padding: 8 }} colSpan={5}>
                    No products yet.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.productId}
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                  >
                    <td style={{ padding: 8 }}>{p.productId}</td>
                    <td style={{ padding: 8 }}>{p.productName}</td>
                    <td style={{ padding: 8 }}>{p.category}</td>
                    <td style={{ padding: 8 }}>₹{p.price}</td>
                    <td style={{ padding: 8 }}>{p.stock}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="console" style={{ marginTop: 20 }}>
          {status}
        </div>
      </div>
    </div>
  );
}
