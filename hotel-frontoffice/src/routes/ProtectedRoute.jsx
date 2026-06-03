import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getCookie } from '../api/cookieHelper';

/**
 * ProtectedRoute — wraps routes that require employee authentication.
 */
const ProtectedRoute = () => {
  const isAuthenticated = !!getCookie('employeeToken');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
