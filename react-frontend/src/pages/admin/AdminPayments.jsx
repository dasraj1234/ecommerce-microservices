import Sidebar from "../../components/Sidebar";

export default function () {
  return (
    <div className="layout">
      <Sidebar type="admin" />
      <div className="main-content">
        <div className="page-title">Payments Management</div>

        <div className="card">
          <h3>Search Payment</h3>
          <input placeholder="Payment ID" />
          <button>Search Payment</button>
        </div>
      </div>
    </div>
  );
}
