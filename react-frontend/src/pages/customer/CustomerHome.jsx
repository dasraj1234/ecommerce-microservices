import Sidebar from "../../components/Sidebar";

export default function () {
  return (
    <div className="layout">
      <Sidebar type="customer" />
      <div className="main-content">
        <h1>Product Store</h1>
        <div className="card">Loading Products...</div>
      </div>
    </div>
  );
}
