import React, { useState } from 'react';
import { Clock, X, Sparkles, User, Calendar, Shield } from 'lucide-react';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const YEARS = ['2025', '2026', '2027', '2028'];

// Helper to convert AM/PM string to minutes of the day
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  try {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  } catch (e) {
    return 0;
  }
};

// Calculate check-in punctuality compliance (tracked strictly for Front Office & Maintenance)
const getCheckInCompliance = (actualCheckInStr, shiftTimeStr, isTracked) => {
  if (!isTracked) {
    return { label: 'Standard Check-In', color: 'bg-slate-50 text-slate-500 border-slate-100' };
  }
  if (!actualCheckInStr || !shiftTimeStr) {
    return { label: 'On Time', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
  }
  try {
    const [startStr] = shiftTimeStr.split(' - ');
    const expectedStart = parseTimeToMinutes(startStr);
    const actualStart = parseTimeToMinutes(actualCheckInStr);
    
    const diff = actualStart - expectedStart;
    if (diff > 15) {
      return { 
        label: `Late by ${Math.round(diff)}m`, 
        color: 'bg-amber-50 text-amber-700 border-amber-100' 
      };
    }
    return { label: 'On Time', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
  } catch (e) {
    return { label: 'On Time', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
  }
};

// Calculate duration coverage compliance (tracked strictly for Front Office & Maintenance)
const getDurationCompliance = (actualDurationStr, shiftTimeStr, isTracked) => {
  if (!isTracked) {
    return { label: 'Shift Completed', color: 'bg-slate-50 text-slate-500 border-slate-100' };
  }
  if (!actualDurationStr || !shiftTimeStr) {
    return { label: 'Full Shift', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
  }
  try {
    let actualMins = 0;
    const hrsMatch = actualDurationStr.match(/(\d+)h/);
    const minsMatch = actualDurationStr.match(/(\d+)m/);
    if (hrsMatch) actualMins += parseInt(hrsMatch[1]) * 60;
    if (minsMatch) actualMins += parseInt(minsMatch[1]);

    const [startStr, endStr] = shiftTimeStr.split(' - ');
    const start = parseTimeToMinutes(startStr);
    const end = parseTimeToMinutes(endStr);
    let expectedDuration = end - start;
    if (expectedDuration < 0) expectedDuration += 24 * 60;
    
    const diff = actualMins - expectedDuration;
    if (diff < -15) {
      return { label: 'Short Hours', color: 'bg-rose-50 text-rose-700 border-rose-100' };
    } else if (diff > 15) {
      return { label: 'Overtime', color: 'bg-blue-50 text-blue-700 border-blue-100' };
    }
    return { label: 'Full Shift', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
  } catch (e) {
    return { label: 'Full Shift', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
  }
};

const StaffLogModal = ({ viewingLogsMember, shifts = [], onClose }) => {
  const [selectedMonth, setSelectedMonth] = useState('May');
  const [selectedYear, setSelectedYear] = useState('2026');

  if (!viewingLogsMember) return null;

  // Determine if check-in/out and shift compliance should be calculated dynamically for this role
  // Calculate STRICTLY for Front Office & Maintenance employees, ignore for others
  const isComplianceTracked = 
    viewingLogsMember.dept?.toLowerCase() === 'front office' || 
    viewingLogsMember.dept?.toLowerCase() === 'maintenance';

  // Find dynamic shift timing configuration
  const assignedShift = shifts.find(s => s.id === viewingLogsMember.shiftId) || {
    name: 'Morning Shift',
    time: '07:00 AM - 03:00 PM',
    id: 'SHF-01',
    color: 'blue'
  };

  // Filter logs dynamically based on selected Month and Year
  const filteredLogs = (viewingLogsMember.logs || []).filter((log) => {
    if (!log.date) return false;
    const parts = log.date.split(' ');
    if (parts.length < 3) return false;
    const logMonth = parts[0];
    const logYear = parts[2];
    return logMonth === selectedMonth && logYear === selectedYear;
  });

  const totalDaysWorked = filteredLogs.length;
  
  // Calculate compliance rate (ignore/show 100% or N/A if not tracked)
  const shiftComplianceRate = totalDaysWorked > 0 
    ? isComplianceTracked
      ? Math.round(
          (filteredLogs.filter(
            log => !getCheckInCompliance(log.checkIn, assignedShift.time, true).label.startsWith('Late')
          ).length / totalDaysWorked) * 100
        )
      : 100
    : 100;

  return (
    <div className="rooms-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="rooms-modal-container !max-w-[650px] animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="rooms-modal-header border-b border-slate-100 pb-3">
          <div className="rooms-modal-header-left">
            <span className="rooms-modal-header-icon-wrapper bg-slate-100 text-slate-800">
              <Clock size={18} />
            </span>
            <div>
              <h3 className="rooms-modal-header-title">
                Roster Compliance Board
              </h3>
              <p className="rooms-modal-header-subtitle font-mono">
                Employee: {viewingLogsMember.name} | Staff ID: {viewingLogsMember.id}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="rooms-modal-close-btn"
            title="Dismiss"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="rooms-modal-body space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
          
          {/* Employee Header Info */}
          <div className="flex gap-4 items-center bg-slate-50/50 border border-slate-100 p-4 rounded-2xl">
            <div className="relative h-14 w-14 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shadow-inner flex items-center justify-center shrink-0">
              {viewingLogsMember.profileFileUrl ? (
                <img 
                  src={viewingLogsMember.profileFileUrl} 
                  alt={viewingLogsMember.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={24} className="text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-850 text-sm leading-tight">{viewingLogsMember.name}</h4>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Code: {viewingLogsMember.uniqueCode || '29384756'} • Role: {viewingLogsMember.dept}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase bg-${assignedShift.color || 'purple'}-50 text-${assignedShift.color || 'purple'}-700 border border-${assignedShift.color || 'purple'}-100`}>
                  {assignedShift.name} ({assignedShift.id})
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  {assignedShift.time}
                </span>
              </div>
            </div>
          </div>

          {/* Month/Year selectors & Statistics Grid */}
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl">
              <span className="text-xs font-bold text-slate-700">Filter Attendance Period:</span>
              <div className="flex gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="form-select !w-[100px] !py-1 text-xs cursor-pointer"
                >
                  {MONTHS.map(m => (
                    <option key={m} value={m}>{m} Month</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="form-select !w-[90px] !py-1 text-xs cursor-pointer"
                >
                  {YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Coverage Statistics Overview */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-slate-150 p-3 rounded-xl shadow-sm text-center">
                <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Days Worked</span>
                <span className="block font-extrabold text-slate-800 text-lg mt-1">{totalDaysWorked} Days</span>
              </div>
              <div className="bg-white border border-slate-150 p-3 rounded-xl shadow-sm text-center">
                <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Punctuality Rate</span>
                <span className={`block font-extrabold text-lg mt-1 ${
                  !isComplianceTracked 
                    ? 'text-slate-500' 
                    : shiftComplianceRate >= 90 
                      ? 'text-emerald-600' 
                      : 'text-amber-600'
                }`}>
                  {isComplianceTracked ? `${shiftComplianceRate}%` : 'N/A'}
                </span>
              </div>
              <div className="bg-white border border-slate-150 p-3 rounded-xl shadow-sm text-center">
                <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Roster Compliance</span>
                <span className="block font-extrabold text-slate-800 text-lg mt-1">
                  {isComplianceTracked ? 'Tracked' : 'Excluded'}
                </span>
              </div>
            </div>
          </div>

          {/* Roster Timeline Records */}
          <div>
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-2">
              <span>Roster Attendance Timeline ({filteredLogs.length})</span>
              {viewingLogsMember.isCheckedIn && (
                <span className="inline-flex items-center gap-1 text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <Sparkles size={8} className="animate-spin" />
                  <span>On Duty Today</span>
                </span>
              )}
            </div>

            {/* Attendance Logs List Table */}
            <div className="border border-slate-100 rounded-xl overflow-hidden max-h-[220px] overflow-y-auto scrollbar-thin">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Checked In</th>
                    <th className="px-4 py-2.5">Checked Out</th>
                    <th className="px-4 py-2.5">Hours worked</th>
                    <th className="px-4 py-2.5 text-center">Punctuality</th>
                    <th className="px-4 py-2.5 text-center">Roster compliance</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Today active session if active */}
                  {viewingLogsMember.isCheckedIn && selectedMonth === MONTHS[new Date().getMonth()] && selectedYear === new Date().getFullYear().toString() && (
                    <tr className="border-b border-emerald-100 bg-emerald-50/20 last:border-0 hover:bg-emerald-50/30 transition-colors">
                      <td className="px-4 py-2.5 font-semibold text-slate-700">Today</td>
                      <td className="px-4 py-2.5 font-medium text-slate-600">
                        {viewingLogsMember.lastCheckIn 
                          ? new Date(viewingLogsMember.lastCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '09:00 AM'
                        }
                      </td>
                      <td className="px-4 py-2.5 italic text-emerald-600 font-bold uppercase tracking-wider">Active Shift</td>
                      <td className="px-4 py-2.5 font-bold text-emerald-600 font-mono">
                        {(() => {
                          const last = viewingLogsMember.lastCheckIn ? new Date(viewingLogsMember.lastCheckIn) : new Date(Date.now() - 3.5 * 60 * 60 * 1000);
                          const current = new Date();
                          const diffMins = Math.round((current - last) / 60000);
                          const h = Math.floor(diffMins / 60);
                          const m = diffMins % 60;
                          return `${h}h ${String(m).padStart(2, '0')}m`;
                        })()}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {(() => {
                          const inStr = viewingLogsMember.lastCheckIn 
                            ? new Date(viewingLogsMember.lastCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '09:00 AM';
                          const check = getCheckInCompliance(inStr, assignedShift.time, isComplianceTracked);
                          return (
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-wider ${check.color}`}>
                              {check.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">
                          Active
                        </span>
                      </td>
                    </tr>
                  )}

                  {/* Pre-recorded past logs */}
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => {
                      const check = getCheckInCompliance(log.checkIn, assignedShift.time, isComplianceTracked);
                      const dur = getDurationCompliance(log.duration, assignedShift.time, isComplianceTracked);
                      
                      return (
                        <tr key={log.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-2.5 font-semibold text-slate-800">{log.date}</td>
                          <td className="px-4 py-2.5 font-medium text-slate-500">{log.checkIn}</td>
                          <td className="px-4 py-2.5 font-medium text-slate-500">{log.checkOut}</td>
                          <td className="px-4 py-2.5 font-semibold text-slate-600 font-mono">{log.duration}</td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-wider ${check.color}`}>
                              {check.label}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-wider ${dur.color}`}>
                              {dur.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    (!viewingLogsMember.isCheckedIn || selectedMonth !== MONTHS[new Date().getMonth()] || selectedYear !== new Date().getFullYear().toString()) && (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-xs text-slate-400 font-semibold italic">
                          No roster logs recorded for this period.
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Registered Identity Proof */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Identity scan verification</span>
            <span className="text-slate-600 bg-slate-100 border border-slate-200 rounded px-2.5 py-0.5">
              {viewingLogsMember.govtProofType || 'Passport'}: {viewingLogsMember.govtProofId || 'Pending'}
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="rooms-modal-footer border-t border-slate-100 pt-3">
          <button 
            onClick={onClose}
            className="modal-footer-close-btn bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-md"
          >
            Dismiss View
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffLogModal;
