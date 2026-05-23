import React from 'react';
import { Clock, X, Sparkles } from 'lucide-react';

const StaffLogModal = ({ viewingLogsMember, onClose }) => {
  if (!viewingLogsMember) return null;

  return (
    <div className="rooms-modal-overlay" onClick={onClose}>
      <div className="rooms-modal-container !max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="rooms-modal-header">
          <div className="rooms-modal-header-left">
            <span className="rooms-modal-header-icon-wrapper">
              <Clock size={18} />
            </span>
            <div>
              <h3 className="rooms-modal-header-title">
                Logs - {viewingLogsMember.name}
              </h3>
              <p className="rooms-modal-header-subtitle font-mono">
                ID Tag: {viewingLogsMember.id} | Department: {viewingLogsMember.dept}
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
        <div className="rooms-modal-body">
          
          {/* Employee Bio & Background Verification Details */}
          <div className="mb-4 bg-slate-50 border border-slate-100 p-4 rounded-xl text-[11px] space-y-2.5 text-slate-600 shadow-sm">
            <div className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-200/60 pb-2 flex justify-between items-center">
              <span>Roster Profile & Verification</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                {viewingLogsMember.govtProofType || 'Passport'}: {viewingLogsMember.govtProofId || 'Pending'}
              </span>
            </div>
            
            {viewingLogsMember.details && (
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wide text-[8px] block">Professional Description</span>
                <p className="text-slate-700 mt-1 leading-relaxed text-xs italic font-medium">
                  "{viewingLogsMember.details}"
                </p>
              </div>
            )}
            
            {viewingLogsMember.address && (
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wide text-[8px] block">Registered Physical Address</span>
                <p className="text-slate-800 mt-0.5 text-xs font-semibold">
                  {viewingLogsMember.address}
                </p>
              </div>
            )}
            
            {viewingLogsMember.govtProofFileName && (
              <div className="pt-2 border-t border-slate-200/60">
                <span className="font-bold text-slate-500 uppercase tracking-wide text-[8px] block mb-1">Attached Verification scan</span>
                <div className="flex items-center gap-3 bg-white border border-slate-150 p-2 rounded-lg">
                  {viewingLogsMember.govtProofFileUrl ? (
                    <img 
                      src={viewingLogsMember.govtProofFileUrl} 
                      alt="Govt ID Document scan" 
                      className="h-10 w-14 object-cover rounded border border-slate-200 hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(viewingLogsMember.govtProofFileUrl, '_blank')}
                      title="Click to view full image in a new tab"
                    />
                  ) : (
                    <div className="h-10 w-14 bg-slate-100 rounded border border-slate-200 text-slate-400 flex items-center justify-center font-bold text-[10px]">
                      DOC
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-slate-800 truncate" title={viewingLogsMember.govtProofFileName}>
                      {viewingLogsMember.govtProofFileName}
                    </p>
                    <a 
                      href={viewingLogsMember.govtProofFileUrl || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[9px] text-accent font-extrabold uppercase hover:underline inline-flex items-center gap-0.5 mt-0.5 cursor-pointer"
                    >
                      View Attached Doc →
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-1.5">
            <span>Recent Shift Logs ({viewingLogsMember.logs.length})</span>
            {viewingLogsMember.isCheckedIn && (
              <span className="inline-flex items-center gap-1 text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <Sparkles size={8} className="animate-spin" />
                <span>Active Session</span>
              </span>
            )}
          </div>

          {/* Logs list table */}
          <div className="staff-logs-table-wrapper">
            <table className="staff-logs-table">
              <thead>
                <tr>
                  <th className="staff-log-header">Date</th>
                  <th className="staff-log-header">Check In</th>
                  <th className="staff-log-header">Check Out</th>
                  <th className="staff-log-header">Hours</th>
                </tr>
              </thead>
              <tbody>
                {/* Active shift row if currently checked in */}
                {viewingLogsMember.isCheckedIn && (
                  <tr className="staff-log-row staff-log-session-active">
                    <td className="staff-log-cell">Today</td>
                    <td className="staff-log-cell">
                      {viewingLogsMember.lastCheckIn 
                        ? new Date(viewingLogsMember.lastCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '09:00 AM'
                      }
                    </td>
                    <td className="staff-log-cell italic text-emerald-500">Active Shift</td>
                    <td className="staff-log-cell staff-log-cell-duration text-emerald-600 font-bold">
                      {/* Approximate live duration */}
                      {(() => {
                        const last = viewingLogsMember.lastCheckIn ? new Date(viewingLogsMember.lastCheckIn) : new Date(Date.now() - 3.5 * 60 * 60 * 1000);
                        const current = new Date();
                        const diffMins = Math.round((current - last) / 60000);
                        const h = Math.floor(diffMins / 60);
                        const m = diffMins % 60;
                        return `${h}h ${String(m).padStart(2, '0')}m`;
                      })()}
                    </td>
                  </tr>
                )}

                {/* Pre-recorded past logs */}
                {viewingLogsMember.logs && viewingLogsMember.logs.length > 0 ? (
                  viewingLogsMember.logs.map((log) => (
                    <tr key={log.id} className="staff-log-row">
                      <td className="staff-log-cell text-slate-800">{log.date}</td>
                      <td className="staff-log-cell">{log.checkIn}</td>
                      <td className="staff-log-cell">{log.checkOut}</td>
                      <td className="staff-log-cell staff-log-cell-duration">{log.duration}</td>
                    </tr>
                  ))
                ) : (
                  !viewingLogsMember.isCheckedIn && (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-xs text-slate-400 font-semibold italic">
                        No shift logs recorded for this agent.
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* Footer */}
        <div className="rooms-modal-footer">
          <button 
            onClick={onClose}
            className="modal-footer-close-btn"
          >
            Close Logs Viewer
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffLogModal;
