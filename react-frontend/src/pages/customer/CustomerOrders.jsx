import Sidebar from "../../components/Sidebar";

export default function () {
  return (
    <div className="layout">
      <Sidebar type="customer" />
      <div className="main-content">
        <h1>Place Order</h1>

        <div className="card">
          <input placeholder="USER-1001" />
          <input placeholder="Product ID" />
          <input placeholder="Quantity" />
          <input placeholder="Amount" />
          <button>Place Order</button>
        </div>
      </div>
    </div>
  );
}
