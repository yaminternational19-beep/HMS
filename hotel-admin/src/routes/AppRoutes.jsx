import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import DashboardPage from '../modules/dashboard';
import BookingsPage from '../modules/bookings';
import RoomsPage from '../modules/rooms';
import StaffPage from '../modules/staff';
import ShiftsPage from '../modules/shifts';
import ReportsPage from '../modules/reports';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/shifts" element={<ShiftsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
