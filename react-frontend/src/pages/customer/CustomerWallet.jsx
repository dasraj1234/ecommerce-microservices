import Sidebar from "../../components/Sidebar";

export default function () {
  return (
    <div className="layout">
      <Sidebar type="customer" />
      <div className="main-content">
        <h1>Wallet</h1>

        <div className="card">
          <h3>Current Balance</h3>
          <div className="balance">₹0</div>
          <input placeholder="USER-1001" />
          <button>Check Balance</button>
        </div>
      </div>
    </div>
  );
}
