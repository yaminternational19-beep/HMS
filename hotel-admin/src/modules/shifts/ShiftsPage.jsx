import React, { useState, useEffect } from 'react';
import { CalendarRange } from 'lucide-react';
import ShiftTimings from './components/ShiftTimings';
import ShiftStats from './components/ShiftStats';
import { getShifts, createShift, updateShift, deleteShift } from '../../api/shifts';
import { getStaff } from '../../api/staff';

const ShiftsPage = () => {
  // Dynamic Shift and Stats state loaded from backend database API
  const [shifts, setShifts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Slide-in toast alerts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Helper to fetch all shifts and dynamically aggregated stats from backend
  const fetchShifts = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const res = await getShifts();
      if (res && res.success) {
        setShifts(res.data.shifts || []);
        setStats(res.data.stats || {});
      } else {
        addToast(res.message || 'Failed to load shifts list.', 'error');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error connecting to server. Failed to fetch shifts.';
      addToast(errMsg, 'error');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Fetch staff list to show assigned staff counts
  const fetchStaff = async () => {
    try {
      const res = await getStaff();
      if (res && res.success) {
        setStaff(res.data.staff || []);
      }
    } catch (err) {
      console.error('Failed to load staff list for shift display', err);
    }
  };

  // Load shifts on component mounting
  useEffect(() => {
    fetchShifts();
    fetchStaff();
  }, []);

  // Callback to create new custom shifts in backend MySQL database
  const handleCreateShift = async (newShift) => {
    try {
      const res = await createShift(newShift);
      if (res && res.success) {
        addToast(`Custom shift "${res.data.name}" successfully created!`, 'success');
        fetchShifts(true); // Refresh from backend silently
      } else {
        addToast(res.message || 'Failed to create custom shift.', 'error');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error registering custom shift.';
      addToast(errMsg, 'error');
    }
  };

  // Callback to update an existing shift in backend database
  const handleUpdateShift = async (updatedShift) => {
    try {
      const res = await updateShift(updatedShift.id, updatedShift);
      if (res && res.success) {
        addToast(`Shift "${res.data.name}" successfully updated.`, 'success');
        fetchShifts(true); // Refresh from backend silently
      } else {
        addToast(res.message || 'Failed to update shift.', 'error');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error modifying shift specifications.';
      addToast(errMsg, 'error');
    }
  };

  // Callback to delete/retire a shift timing in backend database
  const handleDeleteShift = async (shiftId) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return;

    if (window.confirm(`Are you sure you want to retire and delete "${shift.name}"? This cannot be undone.`)) {
      try {
        const res = await deleteShift(shiftId);
        if (res && res.success) {
          addToast(`Shift "${shift.name}" has been retired and deleted successfully.`, 'warning');
          fetchShifts(true); // Refresh from backend silently
        } else {
          addToast(res.message || 'Failed to retire shift.', 'error');
        }
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Error deleting shift from inventory.';
        addToast(errMsg, 'error');
      }
    }
  };

  return (
    <div className="rooms-page-container">
      
      {/* 1. Header (identical to rooms style) */}
      <div className="rooms-header-wrapper">
        <div className="rooms-header-info">
          <h2 className="rooms-header-title">Shift Timings & Scheduling</h2>
          <p className="rooms-header-subtitle">Configure operational shifts, track rosters, and assign duty timeframes to employee accounts.</p>
        </div>

        <div className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold select-none shadow-sm flex items-center gap-1.5">
          <CalendarRange size={14} className="text-slate-400" />
          <span>Active Timetables</span>
        </div>
      </div>

      {/* 2. Loading State / Stats & Shift Timings */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/50 border border-slate-200 rounded-2xl shadow-sm">
          <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Loading operational shifts...</p>
        </div>
      ) : (
        <>
          {/* Unified Stats Summary Grid */}
          <ShiftStats stats={stats} />

          {/* Unified Shifts Component */}
          <ShiftTimings 
            staff={staff}
            shifts={shifts}
            onCreateShift={handleCreateShift}
            onUpdateShift={handleUpdateShift}
            onDeleteShift={handleDeleteShift}
          />
        </>
      )}

      {/* 3. Visual Toast Notification Overlay */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-alert ${
              toast.type === 'success' ? 'toast-alert-success' :
              toast.type === 'warning' ? 'toast-alert-warning' :
              toast.type === 'error' ? 'toast-alert-error' :
              'toast-alert-info'
            }`}
          >
            <span className="toast-message">{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="toast-close"
            >
              ×
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ShiftsPage;
