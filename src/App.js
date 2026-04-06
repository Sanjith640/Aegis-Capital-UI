import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import { Login, Register } from './pages/auth/AuthPages';
import { CustomerDashboard, AccountsPage } from './pages/customer/CustomerPages';
import { DepositPage, WithdrawPage, TransferPage, HistoryPage } from './pages/customer/TransactionPages';
import AuditPage from './pages/customer/AuditPage';
import ProfilePage from './pages/customer/ProfilePage';
import { AdminLogin, AdminDashboard, OfficersPage, AdminUsersPage, AdminAuditPage } from './pages/admin/AdminPages';
import { ComplianceRegister, ComplianceLogin, ComplianceDashboard, ComplianceUsersPage, ComplianceAuditPage } from './pages/compliance/CompliancePages';

// ── Protected Route ───────────────────────────────────────────────
function ProtectedRoute({ children, requiredRole }) {
  const { user, role } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer */}
      <Route path="/dashboard" element={<ProtectedRoute requiredRole="CUSTOMER"><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/accounts" element={<ProtectedRoute requiredRole="CUSTOMER"><AccountsPage /></ProtectedRoute>} />
      <Route path="/deposit" element={<ProtectedRoute requiredRole="CUSTOMER"><DepositPage /></ProtectedRoute>} />
      <Route path="/withdraw" element={<ProtectedRoute requiredRole="CUSTOMER"><WithdrawPage /></ProtectedRoute>} />
      <Route path="/transfer" element={<ProtectedRoute requiredRole="CUSTOMER"><TransferPage /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute requiredRole="CUSTOMER"><HistoryPage /></ProtectedRoute>} />
      <Route path="/audit" element={<ProtectedRoute requiredRole="CUSTOMER"><AuditPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute requiredRole="CUSTOMER"><ProfilePage /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/officers" element={<ProtectedRoute requiredRole="ADMIN"><OfficersPage /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute requiredRole="ADMIN"><AdminUsersPage /></ProtectedRoute>} />
      <Route path="/admin/audit" element={<ProtectedRoute requiredRole="ADMIN"><AdminAuditPage /></ProtectedRoute>} />

      {/* Compliance */}
      <Route path="/compliance/register" element={<ComplianceRegister />} />
      <Route path="/compliance/login" element={<ComplianceLogin />} />
      <Route path="/compliance/dashboard" element={<ProtectedRoute requiredRole="COMPLIANCE"><ComplianceDashboard /></ProtectedRoute>} />
      <Route path="/compliance/users" element={<ProtectedRoute requiredRole="COMPLIANCE"><ComplianceUsersPage /></ProtectedRoute>} />
      <Route path="/compliance/audit" element={<ProtectedRoute requiredRole="COMPLIANCE"><ComplianceAuditPage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontFamily: 'DM Sans, sans-serif', fontSize: 14, borderRadius: 10 },
            success: { iconTheme: { primary: '#00b894', secondary: 'white' } },
            error: { iconTheme: { primary: '#e85d75', secondary: 'white' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
