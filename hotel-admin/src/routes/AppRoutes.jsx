import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/Login';
import AdminLayout from '../layout/AdminLayout';
import DashboardPage from '../modules/dashboard';
import BookingsPage from '../modules/bookings';
import RoomsPage from '../modules/rooms';
import StaffPage from '../modules/staff';
import StaffLogsPage from '../modules/staff/StaffLogsPage';
import ShiftsPage from '../modules/shifts';
import ReportsPage from '../modules/reports';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Administrative Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/staff-logs" element={<StaffLogsPage />} />
          <Route path="/shifts" element={<ShiftsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
