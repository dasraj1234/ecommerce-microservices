import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import Card from "../../components/Card";
import Field from "../../components/Field";
import Button from "../../components/Button";
import IdTag from "../../components/IdTag";
import {
  createProduct,
  searchProducts,
  getMainCategories,
  getChildCategories,
  updateProduct,
  deleteProduct,
} from "../../api/products";

// Admin product management.
// Backend: POST /products/create, GET /products/search,
//          GET /categories/level1, GET /categories/children/{parentCode}
//          (product-order @ :8082, via the gateway)
//
// Category is a 3-level tree (Electronics 1 > Mobile Phones 11 > Smartphones 111).
// The backend keys off the LEAF code and also stores the denormalized paths,
// so the form sends: categoryCode = leaf, categoryPath = "1>11>111",
// categoryNamePath = "Electronics > Mobile Phones > Smartphones".
const EMPTY_FORM = { productName: "", price: "", stock: "" };
const EMPTY_CATS = { main: "", sub: "", leaf: "" };

// Small styled <select> matching the Field look.
function SelectField({ label, value, onChange, disabled, options, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-600">
        {label}
      </span>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full rounded-lg border border-ink-900/10 bg-paper px-3.5 py-2.5 text-sm text-ink-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">{placeholder}</option>
        {options.map((c) => (
          <option key={c.categoryCode} value={c.categoryCode}>
            {c.categoryName}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function AdminProducts() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [cats, setCats] = useState(EMPTY_CATS);
  const [options, setOptions] = useState({ main: [], sub: [], leaf: [] });
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null); // product open in the edit dialog
  const [busyId, setBusyId] = useState(""); // productId with an in-flight update/delete

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

  // Top-level categories on mount.
  useEffect(() => {
    (async () => {
      try {
        const main = await getMainCategories();
        setOptions((o) => ({ ...o, main: main || [] }));
      } catch (err) {
        setStatus({ ok: false, message: err.message || "Could not load categories." });
      }
    })();
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Picking a level loads the next one and clears everything below it.
  const pickMain = async (code) => {
    setCats({ main: code, sub: "", leaf: "" });
    setOptions((o) => ({ ...o, sub: [], leaf: [] }));
    if (!code) return;
    try {
      const sub = await getChildCategories(code);
      setOptions((o) => ({ ...o, sub: sub || [] }));
    } catch (err) {
      setStatus({ ok: false, message: err.message || "Could not load categories." });
    }
  };

  const pickSub = async (code) => {
    setCats((c) => ({ ...c, sub: code, leaf: "" }));
    setOptions((o) => ({ ...o, leaf: [] }));
    if (!code) return;
    try {
      const leaf = await getChildCategories(code);
      setOptions((o) => ({ ...o, leaf: leaf || [] }));
    } catch (err) {
      setStatus({ ok: false, message: err.message || "Could not load categories." });
    }
  };

  const nameOf = (list, code) =>
    list.find((c) => c.categoryCode === code)?.categoryName || "";

  const removeProduct = async (p) => {
    if (
      !window.confirm(`Delete "${p.productName}" (${p.productId})? This cannot be undone.`)
    ) {
      return;
    }
    setBusyId(p.productId);
    setStatus(null);
    try {
      const message = await deleteProduct(p.productId);
      setStatus({ ok: true, message: `${p.productName}: ${message}` });
      await loadProducts();
    } catch (err) {
      // A product that's been ordered can't be hard-deleted (order_items FK).
      // The backend masks that as a generic 500 "Something went wrong", so we
      // can't identify it exactly — surface the likely cause without claiming
      // certainty.
      const raw = err.message || "";
      const likelyFk = /constraint|foreign key|integrity|something went wrong/i.test(raw);
      setStatus({
        ok: false,
        message: likelyFk
          ? `Could not delete ${p.productName} — this usually means it has order history.`
          : raw || "Could not delete product.",
      });
    } finally {
      setBusyId("");
    }
  };

  const saveEdit = async (values) => {
    setBusyId(editing.productId);
    setStatus(null);
    try {
      await updateProduct(editing.productId, {
        productName: values.productName.trim(),
        price: parseFloat(values.price),
        stock: parseInt(values.stock, 10),
      });
      setStatus({ ok: true, message: `${values.productName.trim()} updated.` });
      setEditing(null);
      await loadProducts();
    } catch (err) {
      setStatus({ ok: false, message: err.message || "Could not update product." });
    } finally {
      setBusyId("");
    }
  };

  const submit = async () => {
    if (!form.productName.trim()) {
      setStatus({ ok: false, message: "Product name is required." });
      return;
    }
    // All three levels are required: the backend keys off the leaf code and
    // rejects anything that isn't a real one.
    if (!cats.main || !cats.sub || !cats.leaf) {
      setStatus({ ok: false, message: "Select main category, category and sub category." });
      return;
    }
    if (!(parseFloat(form.price) > 0)) {
      setStatus({ ok: false, message: "Price must be greater than 0." });
      return;
    }
    const stock = parseInt(form.stock, 10);
    if (!Number.isInteger(stock) || stock < 0) {
      setStatus({ ok: false, message: "Stock must be 0 or more." });
      return;
    }

    setSaving(true);
    setStatus(null);
    try {
      const productId = await createProduct({
        productName: form.productName.trim(),
        categoryCode: cats.leaf,
        categoryPath: `${cats.main}>${cats.sub}>${cats.leaf}`,
        categoryNamePath:
          `${nameOf(options.main, cats.main)} > ` +
          `${nameOf(options.sub, cats.sub)} > ` +
          `${nameOf(options.leaf, cats.leaf)}`,
        price: parseFloat(form.price),
        stock,
      });
      setStatus({ ok: true, message: `Product created — ${productId}` });
      setForm(EMPTY_FORM);
      setCats(EMPTY_CATS);
      setOptions((o) => ({ ...o, sub: [], leaf: [] }));
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

            <SelectField
              label="Main category"
              value={cats.main}
              onChange={(e) => pickMain(e.target.value)}
              options={options.main}
              placeholder="Select main category"
            />
            <SelectField
              label="Category"
              value={cats.sub}
              onChange={(e) => pickSub(e.target.value)}
              options={options.sub}
              disabled={!cats.main}
              placeholder={cats.main ? "Select category" : "Pick a main category first"}
            />
            <SelectField
              label="Sub category"
              value={cats.leaf}
              onChange={(e) => setCats((c) => ({ ...c, leaf: e.target.value }))}
              options={options.leaf}
              disabled={!cats.sub}
              placeholder={cats.sub ? "Select sub category" : "Pick a category first"}
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
                  <th className="py-2.5 pr-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td className="py-6 text-ink-600/60" colSpan={6}>
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
                      <td className="py-3 pr-4 text-ink-600">
                        {p.categoryNamePath || p.category}
                      </td>
                      <td className="py-3 pr-4 font-mono text-ink-900">₹{p.price}</td>
                      <td className="py-3 pr-4 font-mono text-ink-600">{p.stock}</td>
                      <td className="py-3 pr-4">
                        <div className="flex gap-2 whitespace-nowrap">
                          <Button
                            variant="outline"
                            onClick={() => setEditing(p)}
                            disabled={busyId === p.productId}
                            className="!px-3 !py-1.5 !text-xs"
                          >
                            Update
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => removeProduct(p)}
                            disabled={busyId === p.productId}
                            className="!px-3 !py-1.5 !text-xs"
                          >
                            {busyId === p.productId ? "…" : "Delete"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {editing && (
        <EditProductDialog
          product={editing}
          busy={busyId === editing.productId}
          onSave={saveEdit}
          onCancel={() => setEditing(null)}
        />
      )}
    </PageShell>
  );
}

// Edit name/price/stock. Category is deliberately not editable: the product id
// encodes the leaf category (PRD111000001), so recategorizing would orphan the
// id — delete and recreate instead.
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4">
      <Card
        title="Update product"
        subtitle={`${product.productId} — ${product.categoryNamePath || product.category}`}
        className="w-full max-w-md"
      >
        <div className="space-y-4">
          <Field
            name="productName"
            label="Product name"
            value={values.productName}
            onChange={onChange}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              name="price"
              type="number"
              label="Price"
              value={values.price}
              onChange={onChange}
            />
            <Field
              name="stock"
              type="number"
              label="Stock"
              value={values.stock}
              onChange={onChange}
            />
          </div>
          {warn && <p className="text-sm text-red-600">{warn}</p>}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={onCancel} disabled={busy}>
              Cancel
            </Button>
            <Button variant="brand" onClick={submit} disabled={busy}>
              {busy ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
