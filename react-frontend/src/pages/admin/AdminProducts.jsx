import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import {
  createProduct,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../../api/products";

// Admin product management.
// Backend: POST /products/create, GET /products/search,
//          PUT /products/{id}, DELETE /products/{id}  (product-order @ :8082)
const EMPTY_FORM = { productName: "", category: "", price: "", stock: "" };

export default function AdminProducts() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null); // product being edited in the dialog
  const [busyId, setBusyId] = useState(""); // productId with an in-flight update/delete
  const [searchId, setSearchId] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");

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

  const searchById = async () => {
    if (!searchId.trim()) {
      setSearchError("Enter a product id (e.g. PRD111000001).");
      setSearchResult(null);
      return;
    }
    setSearching(true);
    setSearchError("");
    setSearchResult(null);
    try {
      const product = await getProductById(searchId.trim());
      setSearchResult(product);
    } catch (err) {
      setSearchError(err.message || "Product not found.");
    } finally {
      setSearching(false);
    }
  };

  const removeProduct = async (product) => {
    if (
      !window.confirm(
        `Delete "${product.productName}" (${product.productId})? This cannot be undone.`
      )
    ) {
      return;
    }
    setBusyId(product.productId);
    setStatus("");
    try {
      const message = await deleteProduct(product.productId);
      setStatus(`[SUCCESS] ${product.productName}: ${message}`);
      await loadProducts();
    } catch (err) {
      setStatus(`[ERROR] ${err.message || "Could not delete product."}`);
    } finally {
      setBusyId("");
    }
  };

  const saveEdit = async (values) => {
    setBusyId(editing.productId);
    setStatus("");
    try {
      await updateProduct(editing.productId, {
        productName: values.productName.trim(),
        price: parseFloat(values.price),
        stock: parseInt(values.stock, 10),
      });
      setStatus(`[SUCCESS] ${values.productName.trim()} updated`);
      setEditing(null);
      await loadProducts();
    } catch (err) {
      setStatus(`[ERROR] ${err.message || "Could not update product."}`);
    } finally {
      setBusyId("");
    }
  };

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

        {status && (
          <p
            style={{
              marginBottom: 16,
              fontWeight: 600,
              color: status.startsWith("[ERROR]") ? "#dc2626" : "#16a34a",
            }}
          >
            {status.replace(/^\[(ERROR|SUCCESS|INFO)\]\s*/, "")}
          </p>
        )}

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
          <h3>Search Product</h3>
          <input
            placeholder="Product ID"
            value={searchId}
            onChange={(e) => {
              setSearchId(e.target.value);
              setSearchError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && searchById()}
          />
          <button onClick={searchById} disabled={searching}>
            {searching ? "Searching..." : "Search Product"}
          </button>

          {searchError && (
            <p style={{ color: "#dc2626", marginTop: 12 }}>{searchError}</p>
          )}

          {searchResult && (
            <table
              style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}
            >
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                  <th style={{ padding: 8 }}>ID</th>
                  <th style={{ padding: 8 }}>Name</th>
                  <th style={{ padding: 8 }}>Category</th>
                  <th style={{ padding: 8 }}>Price</th>
                  <th style={{ padding: 8 }}>Stock</th>
                  <th style={{ padding: 8 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: 8 }}>{searchResult.productId}</td>
                  <td style={{ padding: 8 }}>{searchResult.productName}</td>
                  <td style={{ padding: 8 }}>{searchResult.category}</td>
                  <td style={{ padding: 8 }}>₹{searchResult.price}</td>
                  <td style={{ padding: 8 }}>{searchResult.stock}</td>
                  <td style={{ padding: 8 }}>{searchResult.status}</td>
                </tr>
              </tbody>
            </table>
          )}
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
                <th style={{ padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td style={{ padding: 8 }} colSpan={6}>
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
                    <td style={{ padding: 8, whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => setEditing(p)}
                        disabled={busyId === p.productId}
                        style={{
                          marginTop: 0,
                          padding: "6px 14px",
                          fontSize: 13,
                        }}
                      >
                        Update
                      </button>
                      <button
                        onClick={() => removeProduct(p)}
                        disabled={busyId === p.productId}
                        style={{
                          marginTop: 0,
                          marginLeft: 8,
                          padding: "6px 14px",
                          fontSize: 13,
                          background: "#fee2e2",
                          color: "#dc2626",
                        }}
                      >
                        {busyId === p.productId ? "..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {editing && (
          <EditProductDialog
            product={editing}
            busy={busyId === editing.productId}
            onSave={saveEdit}
            onCancel={() => setEditing(null)}
          />
        )}
      </div>
    </div>
  );
}

// Small modal for editing name/price/stock. Category is not editable — the
// product id encodes it (PRD<code><seq>); delete + recreate to recategorize.
function EditProductDialog({ product, busy, onSave, onCancel }) {
  const [values, setValues] = useState({
    productName: product.productName,
    price: product.price,
    stock: product.stock,
  });
  const [warn, setWarn] = useState("");

  const onChange = (e) =>
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const submit = () => {
    if (!String(values.productName).trim()) {
      setWarn("Product name is required.");
      return;
    }
    if (!(parseFloat(values.price) > 0)) {
      setWarn("Price must be greater than 0.");
      return;
    }
    const stock = parseInt(values.stock, 10);
    if (!Number.isInteger(stock) || stock < 0) {
      setWarn("Stock must be 0 or more.");
      return;
    }
    onSave(values);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(17, 24, 39, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div className="card" style={{ width: 400 }}>
        <h3 style={{ marginTop: 0 }}>Update Product</h3>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0" }}>
          {product.productId} — {product.category}
        </p>
        <input
          name="productName"
          placeholder="Product Name"
          value={values.productName}
          onChange={onChange}
        />
        <input
          name="price"
          type="number"
          placeholder="Price"
          value={values.price}
          onChange={onChange}
        />
        <input
          name="stock"
          type="number"
          placeholder="Stock"
          value={values.stock}
          onChange={onChange}
        />
        {warn && <p style={{ color: "#dc2626", marginTop: 10 }}>{warn}</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            style={{ flex: 1, background: "#e5e7eb", color: "#374151" }}
          >
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={busy} style={{ flex: 1 }}>
            {busy ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
