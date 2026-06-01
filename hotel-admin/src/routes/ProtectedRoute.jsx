import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { getCookie } from '../api/cookieHelper';

/**
 * ProtectedRoute — wraps admin routes that require authentication.
 */
const ProtectedRoute = () => {
  const token = getCookie('adminToken');
  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
