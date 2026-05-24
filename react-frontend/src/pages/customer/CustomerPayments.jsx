import Sidebar from "../../components/Sidebar";

export default function () {
  return (
    <div className="layout">
      <Sidebar type="customer" />
      <div className="main-content">
        <h1>Payment History</h1>

        <div className="card">
          <input placeholder="USER-1001" />
          <button>Load Payments</button>
        </div>
      </div>
    </div>
  );
}
