import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="landing-wrap">
      <div className="container">
        <div className="topbar">
          <h1>E-Commerce Microservices Platform</h1>
          <p>Product • Order • Payment • Wallet</p>
        </div>

        <div className="console">Loading Services...</div>

        <div className="portal-grid">
          <div className="portal-card">
            <h2>Admin Portal</h2>
            <p>Manage Products, Orders, Payments</p>
            <Link to="/admin/dashboard">Enter</Link>
          </div>

          <div className="portal-card">
            <h2>Customer Portal</h2>
            <p>Browse Products, Place Orders, Wallet</p>
            <Link to="/customer/home">Enter</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
