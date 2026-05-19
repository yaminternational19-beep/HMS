import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute — wraps routes that require authentication.
 * Replace the `isAuthenticated` logic with your actual auth check (context, zustand, etc).
 */
const ProtectedRoute = () => {
  // Enforce auth check via localStorage. Default to true if null so the user is logged in by default.
  const authState = localStorage.getItem('isAuthenticated');
  const isAuthenticated = authState !== 'false';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
