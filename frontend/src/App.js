import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Public pages
import Homepage from './pages/public/Homepage';
import Login from './pages/public/Login';
import LoginAdmin from './pages/public/LoginAdmin';
import LoginStaff from './pages/public/LoginStaff';
import LoginClient from './pages/public/LoginClient';
import RegisterClient from './pages/public/RegisterClient';
// Additive: forced first-login password change pages
import ChangePassword, { ChangePasswordSuccess } from './pages/public/ChangePassword';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AccountManagement from './pages/admin/AccountManagement';
import ClientApprovals from './pages/admin/ClientApprovals';
import StaffApprovals from './pages/admin/StaffApprovals';
import SubmissionApprovals from './pages/admin/SubmissionApprovals';
import Reports from './pages/admin/Reports';
// Additive: admin product monitoring page
import ProductMonitor from './pages/admin/ProductMonitor';

// Staff pages
import StaffDashboard from './pages/staff/Dashboard';
import ProductManagement from './pages/staff/ProductManagement';
import ReceiptManagement from './pages/staff/ReceiptManagement';
import PromoManagement from './pages/staff/PromoManagement';
import UserManagement from './pages/staff/UserManagement';
import StaffSubmissions from './pages/staff/Submissions';

// User pages
import UserDashboard from './pages/user/Dashboard';
import OrderHistory from './pages/user/OrderHistory';
import Profile from './pages/user/Profile';
import Favorites from './pages/user/Favorites';
import Checkout from './pages/user/Checkout';

function App() {
  const location = useLocation();
  const isDashboardRoute = /^(\/admin|\/staff|\/client)\//.test(location.pathname);

  const dashboardPage = (page, roles) => (
    <ProtectedRoute allowedRoles={roles}>
      <DashboardLayout>{page}</DashboardLayout>
    </ProtectedRoute>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isDashboardRoute && <Navbar />}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/admin" element={<LoginAdmin />} />
          <Route path="/login/staff" element={<LoginStaff />} />
          <Route path="/login/client" element={<LoginClient />} />
          <Route path="/register/client" element={<RegisterClient />} />

          {/* Additive: first-login password change (any authenticated role) */}
          <Route path="/change-password" element={<ProtectedRoute allowedRoles={['admin', 'staff', 'client']}><ChangePassword /></ProtectedRoute>} />
          <Route path="/change-password/success" element={<ProtectedRoute allowedRoles={['admin', 'staff', 'client']}><ChangePasswordSuccess /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            dashboardPage(<AdminDashboard />, ['admin'])
          } />
          <Route path="/admin/accounts" element={
            dashboardPage(<AccountManagement />, ['admin'])
          } />
          <Route path="/admin/approvals/staff" element={
            dashboardPage(<StaffApprovals />, ['admin'])
          } />
          <Route path="/admin/approvals/clients" element={
            dashboardPage(<ClientApprovals />, ['admin'])
          } />
          <Route path="/admin/approvals/submissions" element={
            dashboardPage(<SubmissionApprovals />, ['admin'])
          } />
          <Route path="/admin/reports" element={
            dashboardPage(<Reports />, ['admin'])
          } />
          {/* Additive: admin product monitor */}
          <Route path="/admin/product-monitor" element={
            dashboardPage(<ProductMonitor />, ['admin'])
          } />

          {/* Staff Routes */}
          <Route path="/staff/dashboard" element={
            dashboardPage(<StaffDashboard />, ['staff'])
          } />
          <Route path="/staff/products" element={
            dashboardPage(<ProductManagement />, ['staff'])
          } />
          <Route path="/staff/receipts" element={
            dashboardPage(<ReceiptManagement />, ['staff'])
          } />
          <Route path="/staff/promos" element={
            dashboardPage(<PromoManagement />, ['staff'])
          } />
          <Route path="/staff/users" element={
            dashboardPage(<UserManagement />, ['staff'])
          } />
          <Route path="/staff/submissions" element={
            dashboardPage(<StaffSubmissions />, ['staff'])
          } />

          {/* Client Routes */}
          <Route path="/client/dashboard" element={
            dashboardPage(<UserDashboard />, ['client'])
          } />
          <Route path="/client/history" element={
            dashboardPage(<OrderHistory />, ['client'])
          } />
          <Route path="/client/favorites" element={
            dashboardPage(<Favorites />, ['client'])
          } />
          <Route path="/client/checkout" element={
            dashboardPage(<Checkout />, ['client'])
          } />
          <Route path="/client/profile" element={
            dashboardPage(<Profile />, ['client'])
          } />
        </Routes>
      </Box>
      {!isDashboardRoute && <Footer />}
    </Box>
  );
}

export default App;