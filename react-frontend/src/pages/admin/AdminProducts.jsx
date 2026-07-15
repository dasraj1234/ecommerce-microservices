import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Field from "../../components/Field";
import Button from "../../components/Button";
import IdTag from "../../components/IdTag";
import { createProduct, searchProducts } from "../../api/products";

// Admin product management.
// Backend: POST /products/create, GET /products/search (product-order @ :8082)
const EMPTY_FORM = { productName: "", category: "", price: "", stock: "" };

export default function AdminProducts() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState(null);
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
      setStatus({ ok: false, message: err.message || "Could not load products." });
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
      setStatus({ ok: false, message: "Product name is required." });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      await createProduct({
        productName: form.productName.trim(),
        category: form.category.trim(),
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
      });
      setStatus({ ok: true, message: "Product created successfully." });
      setForm(EMPTY_FORM);
      await loadProducts();
    } catch (err) {
      setStatus({ ok: false, message: err.message || "Could not create product." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell type="admin" eyebrow="Ops Console" title="Product Management">
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card title="Create product" subtitle="Adds a new item to the catalog">
          <div className="space-y-4">
            <Field
              name="productName"
              label="Product name"
              placeholder="e.g. Wireless Mouse"
              value={form.productName}
              onChange={onChange}
            />
            <Field
              name="category"
              label="Category"
              placeholder="e.g. Electronics"
              value={form.category}
              onChange={onChange}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                name="price"
                type="number"
                label="Price"
                placeholder="0.00"
                value={form.price}
                onChange={onChange}
              />
              <Field
                name="stock"
                type="number"
                label="Stock"
                placeholder="0"
                value={form.stock}
                onChange={onChange}
              />
            </div>
            <Button variant="brand" onClick={submit} disabled={saving} className="w-full">
              {saving ? "Creating…" : "Create product"}
            </Button>
            {status && (
              <p
                className={`rounded-lg px-3.5 py-2.5 text-sm ${
                  status.ok
                    ? "border border-teal/20 bg-teal/10 text-teal-dark"
                    : "border border-red-500/20 bg-red-500/5 text-red-600"
                }`}
              >
                {status.message}
              </p>
            )}
          </div>
        </Card>

        <Card
          title="Catalog"
          subtitle={`${products.length} product${products.length === 1 ? "" : "s"} listed`}
        >
          <div className="mb-4 flex justify-end">
            <Button variant="outline" onClick={loadProducts} disabled={loading}>
              {loading ? "Refreshing…" : "Refresh"}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink-900/10 text-left text-xs uppercase tracking-wide text-ink-600/60">
                  <th className="py-2.5 pr-4 font-medium">ID</th>
                  <th className="py-2.5 pr-4 font-medium">Name</th>
                  <th className="py-2.5 pr-4 font-medium">Category</th>
                  <th className="py-2.5 pr-4 font-medium">Price</th>
                  <th className="py-2.5 pr-4 font-medium">Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td className="py-6 text-ink-600/60" colSpan={5}>
                      No products yet — create the first one on the left.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.productId} className="border-b border-ink-900/5 last:border-0">
                      <td className="py-3 pr-4">
                        <IdTag>{p.productId}</IdTag>
                      </td>
                      <td className="py-3 pr-4 font-medium text-ink-900">{p.productName}</td>
                      <td className="py-3 pr-4 text-ink-600">{p.category}</td>
                      <td className="py-3 pr-4 font-mono text-ink-900">₹{p.price}</td>
                      <td className="py-3 pr-4 font-mono text-ink-600">{p.stock}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
