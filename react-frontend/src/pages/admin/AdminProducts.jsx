import Sidebar from "../../components/Sidebar";

export default function () {
  return (
    <div className="layout">
      <Sidebar type="admin" />
      <div className="main-content">
        <div className="page-title">Product Management</div>

        <div className="card">
          <h3>Create Product</h3>
          <input placeholder="Product Name" />
          <input placeholder="Category" />
          <input placeholder="Price" />
          <input placeholder="Stock" />
          <button>Create Product</button>
        </div>
      </div>
    </div>
  );
}
