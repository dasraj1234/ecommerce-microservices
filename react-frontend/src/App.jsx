import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminMIS from "./pages/admin/AdminMIS";
import CustomerHome from "./pages/customer/CustomerHome";
import CustomerOrders from "./pages/customer/CustomerOrders";
import CustomerPayments from "./pages/customer/CustomerPayments";
import CustomerWallet from "./pages/customer/CustomerWallet";

// Helpers to keep the route list readable.
const admin = (el) => <ProtectedRoute role="ADMIN">{el}</ProtectedRoute>;
const customer = (el) => <ProtectedRoute role="USER">{el}</ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Admin-only */}
      <Route path="/admin/dashboard" element={admin(<AdminDashboard />)} />
      <Route path="/admin/products" element={admin(<AdminProducts />)} />
      <Route path="/admin/orders" element={admin(<AdminOrders />)} />
      <Route path="/admin/payments" element={admin(<AdminPayments />)} />
      <Route path="/admin/mis" element={admin(<AdminMIS />)} />

      {/* Customer-only */}
      <Route path="/customer/home" element={customer(<CustomerHome />)} />
      <Route path="/customer/orders" element={customer(<CustomerOrders />)} />
      <Route path="/customer/payments" element={customer(<CustomerPayments />)} />
      <Route path="/customer/wallet" element={customer(<CustomerWallet />)} />
    </Routes>
  );
}
