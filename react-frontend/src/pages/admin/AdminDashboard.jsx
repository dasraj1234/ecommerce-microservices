import Sidebar from "../../components/Sidebar";

export default function () {
  return (
    <div className="layout">
      <Sidebar type="admin" />
      <div className="main-content">
        <div className="page-title">Admin Dashboard</div>

        <div className="kpi-grid">
          {['Products', 'Orders', 'Payments', 'Wallet Users'].map((x) => (
            <div className="kpi-card" key={x}>
              <div className="kpi-title">{x}</div>
              <div className="kpi-value">--</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
