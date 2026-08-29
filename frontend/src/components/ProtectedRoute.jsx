import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = user?.role === 'user' ? 'client' : user?.role;

  if (allowedRoles && !allowedRoles.includes(normalizedRole)) {
    // Redirect to appropriate dashboard
    const redirectMap = {
      admin: '/admin/dashboard',
      staff: '/staff/dashboard',
      client: '/client/dashboard'
    };
    return <Navigate to={redirectMap[normalizedRole] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;