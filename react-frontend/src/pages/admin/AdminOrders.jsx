import Sidebar from "../../components/Sidebar";

export default function () {
  return (
    <div className="layout">
      <Sidebar type="admin" />
      <div className="main-content">
        <div className="page-title">Orders Management</div>

        <div className="card">
          <h3>Create Order</h3>
          <input placeholder="User ID" />
          <input placeholder="Product ID" />
          <input placeholder="Quantity" />
          <button>Create Order</button>
        </div>
      </div>
    </div>
  );
}
