import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './contexts/AuthContext';
import Login from './components/auth/Login';
import AdminLogin from './components/auth/AdminLogin';
import Register from './components/auth/Register';
import UserDashboard from './components/user/UserDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import RiwayatPengajuan from './components/user/RiwayatPengajuan';
import VerifikasiPengajuan from './components/admin/VerifikasiTable';
import Toast from './components/common/Toast';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isAdmin, isUser, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect ke login yang sesuai
    if (requiredRole === 'admin') {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole === 'user' && !isUser) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

const App = () => {
  const { loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner mx-auto mb-4 w-12 h-12 border-4"></div>
          <p className="text-gray-500 font-medium">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app min-h-screen flex flex-col bg-gray-50">
      <Routes>
        {/* Login Routes - Admin login HARUS di atas! */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* User Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="user">
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/riwayat" element={
          <ProtectedRoute requiredRole="user">
            <RiwayatPengajuan />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/verifikasi" element={
          <ProtectedRoute requiredRole="admin">
            <VerifikasiPengajuan />
          </ProtectedRoute>
        } />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toast />
    </div>
  );
};

export default App;