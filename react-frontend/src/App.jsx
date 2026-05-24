import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPayments from "./pages/admin/AdminPayments";
import CustomerHome from "./pages/customer/CustomerHome";
import CustomerOrders from "./pages/customer/CustomerOrders";
import CustomerPayments from "./pages/customer/CustomerPayments";
import CustomerWallet from "./pages/customer/CustomerWallet";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/products" element={<AdminProducts />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
      <Route path="/admin/payments" element={<AdminPayments />} />
      <Route path="/customer/home" element={<CustomerHome />} />
      <Route path="/customer/orders" element={<CustomerOrders />} />
      <Route path="/customer/payments" element={<CustomerPayments />} />
      <Route path="/customer/wallet" element={<CustomerWallet />} />
    </Routes>
  );
}
