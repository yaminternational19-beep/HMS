import React from 'react';
import { Routes, Route } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import NoRoute from '../pages/NoRoute';
import Login from '../pages/Login';
import MainLayout from '../layout/MainLayout';

// Modules
import Dashboard from '../modules/dashboard';
import BookingPage from '../modules/bookings';
import RoomsPage from '../modules/rooms';
import { CheckInOutPage } from '../modules/checkinout';
import { InvoicesPage } from '../modules/invoices';

/**
 * AppRoutes — Central route configuration.
 *
 * Public routes   : /login  (no auth needed)
 * Protected routes: /dashboard, /bookings, /rooms, etc. (auth required — wrapped in MainLayout)
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* === Public Routes === */}
      <Route path="/login" element={<Login />} />

      {/* === Protected Routes (with Sidebar + Footer layout) === */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bookings" element={<BookingPage />} />
          <Route path="/checkinout" element={<CheckInOutPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
        </Route>
      </Route>

      {/* === 404 Fallback === */}
      <Route path="*" element={<NoRoute />} />
    </Routes>
  );
};

export default AppRoutes;
