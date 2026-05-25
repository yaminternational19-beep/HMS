import React, { useState } from 'react';
import { CalendarRange } from 'lucide-react';
import ShiftTimings from './components/ShiftTimings';
import ShiftStats from './components/ShiftStats';

// Rich Mock data for Staff (matching StaffPage.jsx)
const initialStaff = [
  { 
    id: 'STF-02', 
    name: 'Sarah Connor', 
    role: 'Front Desk Manager', 
    dept: 'Front Office', 
    email: 'sarah.c@hms.com', 
    phone: '+971 50 234 5678', 
    status: 'active', 
    joined: 'Jan 2022',
    isCheckedIn: false,
    lastCheckIn: null,
    details: 'Expert front-office liaison supervisor specialized in guest satisfaction and VIP check-in pipelines.',
    address: 'Apt 204, Downtown Boulevard, Dubai, UAE',
    govtProofType: 'National ID',
    govtProofId: '784-1995-1234567-1',
    govtProofFileName: 'emirates_id_front_sarah.jpg',
    govtProofFileUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop',
    shiftId: 'SHF-01',
    logs: []
  },
  { 
    id: 'STF-04', 
    name: 'Maria Gonzalez', 
    role: 'Executive Housekeeper', 
    dept: 'Housekeeping', 
    email: 'maria.g@hms.com', 
    phone: '+971 50 456 7890', 
    status: 'active', 
    joined: 'Mar 2022',
    isCheckedIn: true,
    lastCheckIn: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    details: 'Executive housekeeping professional leading room staging and standards compliance.',
    address: 'Flat 10, Jumeirah Village Circle, Dubai, UAE',
    govtProofType: 'National ID',
    govtProofId: '784-1988-7654321-2',
    govtProofFileName: 'emirates_id_front_maria.png',
    govtProofFileUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop',
    shiftId: 'SHF-01',
    logs: []
  }
];

const ShiftsPage = () => {
  // Local staff database state
  const [staff, setStaff] = useState(initialStaff);

  // Shift list state
  const [shifts, setShifts] = useState([
    { id: 'SHF-01', name: 'Morning Shift', time: '07:00 AM - 03:00 PM', icon: 'sun', color: 'blue' },
    { id: 'SHF-02', name: 'Afternoon Shift', time: '03:00 PM - 11:00 PM', icon: 'sunset', color: 'orange' },
    { id: 'SHF-03', name: 'Night Shift', time: '11:00 PM - 07:00 AM', icon: 'moon', color: 'indigo' },
    { id: 'SHF-04', name: 'Executive Shift', time: '09:00 AM - 06:00 PM', icon: 'briefcase', color: 'purple' }
  ]);

  // Slide-in toast alerts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Callback to assign employee shifts
  const handleAssignShift = (memberId, shiftId) => {
    setStaff((prevStaff) => 
      prevStaff.map((m) => {
        if (m.id === memberId) {
          const shift = shifts.find(s => s.id === shiftId);
          addToast(`Shift timing for ${m.name} updated to ${shift ? shift.name : 'None'}.`, 'success');
          return { ...m, shiftId };
        }
        return m;
      })
    );
  };

  // Callback to create new custom shifts
  const handleCreateShift = (newShift) => {
    const nextId = `SHF-0${shifts.length + 1}`;
    const createdShift = { ...newShift, id: nextId };
    setShifts((prevShifts) => [...prevShifts, createdShift]);
    addToast(`Custom shift "${newShift.name}" successfully created!`, 'success');
  };

  // Callback to update an existing shift
  const handleUpdateShift = (updatedShift) => {
    setShifts((prevShifts) => 
      prevShifts.map((s) => s.id === updatedShift.id ? { ...s, ...updatedShift } : s)
    );
    addToast(`Shift "${updatedShift.name}" successfully updated.`, 'success');
  };

  // Callback to delete/retire a shift timing
  const handleDeleteShift = (shiftId) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return;

    if (window.confirm(`Are you sure you want to retire and delete "${shift.name}"? This cannot be undone.`)) {
      setShifts((prevShifts) => prevShifts.filter((s) => s.id !== shiftId));
      
      let count = 0;
      setStaff((prevStaff) => 
        prevStaff.map((member) => {
          if (member.shiftId === shiftId) {
            count++;
            return { ...member, shiftId: 'SHF-01' }; // default morning
          }
          return member;
        })
      );

      addToast(`Shift "${shift.name}" has been retired. ${count} assigned employees reset to Morning Shift.`, 'warning');
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

      {/* 2. Unified Stats Summary Grid */}
      <ShiftStats staff={staff} shifts={shifts} />

      {/* 3. Unified Shifts Component */}
      <ShiftTimings 
        staff={staff}
        shifts={shifts}
        onAssignShift={handleAssignShift}
        onCreateShift={handleCreateShift}
        onUpdateShift={handleUpdateShift}
        onDeleteShift={handleDeleteShift}
      />

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
