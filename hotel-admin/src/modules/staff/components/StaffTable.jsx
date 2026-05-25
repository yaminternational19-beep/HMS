import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Mail, 
  Phone, 
  Calendar, 
  Edit, 
  Trash2, 
  Clock, 
  UserCheck, 
  UserMinus, 
  FileText 
} from 'lucide-react';

const StaffTable = ({ 
  data = [], 
  onCheckIn, 
  onCheckOut, 
  onViewLogs, 
  onEdit, 
  onDelete,
  className = ""
}) => {
  // encapsulated local pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset to page 1 automatically when filtered list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  // Department themed color styling maps
  const getDeptBadgeClass = (dept) => {
    switch (dept) {
      case 'Administration':
        return 'bg-violet-50 text-violet-600 border border-violet-100';
      case 'Front Office':
        return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'Housekeeping':
        return 'bg-teal-50 text-teal-600 border border-teal-100';
      case 'Maintenance':
        return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'Food & Beverage':
        return 'bg-rose-50 text-rose-600 border border-rose-100';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-100';
    }
  };

  return (
    <div className={`space-y-0 ${className || 'shadow-sm border border-slate-200 rounded-2xl overflow-hidden'}`}>
      {/* 1. Main Directory Table */}
      <div className="table-container !shadow-none !border-none !rounded-none">
        <table className="table-element">
          <thead>
            <tr>
              <th className="w-20">Staff ID</th>
              <th>Employee Profile</th>
              <th>Clearance Clearance</th>
              <th>Contact Details</th>
              <th>Engagement</th>
              <th className="text-center">Roster Status</th>
              <th className="text-center">Current Duty</th>
              <th className="text-center">Shift Control</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-slate-400 font-medium italic">
                  No matching employee roster profiles found. Try adjusting your filter settings.
                </td>
              </tr>
            ) : (
              paginatedData.map((member) => (
                <tr 
                  key={member.id} 
                  className={`align-middle transition-colors duration-150 ${
                    member.isCheckedIn ? 'bg-emerald-50/20 hover:bg-emerald-50/30' : 'hover:bg-slate-50'
                  }`}
                  style={{
                    borderLeft: member.isCheckedIn ? '3px solid #10b981' : '3px solid transparent'
                  }}
                >
                  {/* ID Column */}
                  <td className="font-semibold text-slate-400 font-mono text-[11px] tracking-wider py-4">
                    {member.id}
                  </td>
                  
                  {/* Employee Details Column with absolute overlay image-fallback */}
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-9 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 shadow-inner flex items-center justify-center font-extrabold text-slate-700 shrink-0 text-xs uppercase select-none">
                        {member.govtProofFileUrl ? (
                          <img 
                            src={member.govtProofFileUrl} 
                            alt={member.name} 
                            className="absolute inset-0 h-full w-full object-cover z-10"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : null}
                        <span className="relative z-0">{member.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-xs leading-none">{member.name}</div>
                        <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider ${getDeptBadgeClass(member.dept)}`}>
                          {member.dept}
                        </span>
                      </div>
                    </div>
                  </td>
                  
                  {/* Role Column */}
                  <td>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                      <Shield size={11} className="text-slate-400 shrink-0" />
                      <span>{member.role}</span>
                    </div>
                  </td>
                  
                  {/* Contact Column */}
                  <td>
                    <div className="space-y-1 text-[10px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Mail size={11} className="text-slate-400 shrink-0" />
                        <a href={`mailto:${member.email}`} className="hover:text-amber-700 truncate max-w-[125px] inline-block transition-colors font-medium">
                          {member.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone size={11} className="text-slate-400 shrink-0" />
                        <a href={`tel:${member.phone}`} className="hover:text-amber-700 transition-colors font-medium">
                          {member.phone}
                        </a>
                      </div>
                    </div>
                  </td>
                  
                  {/* Joined Column */}
                  <td>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                      <Calendar size={11} className="text-slate-400 shrink-0" />
                      <span>{member.joined}</span>
                    </div>
                  </td>

                  
                  {/* Active Status Column */}
                  <td className="text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      member.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        member.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                      }`}></span>
                      <span>{member.status}</span>
                    </span>
                  </td>
                  
                  {/* Shift Attendance Column */}
                  <td className="text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
                      member.isCheckedIn
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-slate-50 text-slate-400 border border-slate-100'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${member.isCheckedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                      <span>{member.isCheckedIn ? 'ON DUTY' : 'OFFLINE'}</span>
                    </span>
                  </td>
                  
                  {/* Shift Control Action Column */}
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {member.isCheckedIn ? (
                        <button
                          onClick={() => onCheckOut(member.id)}
                          className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-[9px] font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/10 cursor-pointer transition-all active:scale-[0.98]"
                          title="Clock Out Shift Session"
                        >
                          <UserMinus size={10} />
                          <span>OUT</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onCheckIn(member.id)}
                          className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-[9px] font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none shadow-sm shadow-emerald-600/10 cursor-pointer disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                          disabled={member.status !== 'active'}
                          title={member.status !== 'active' ? 'On Leave: Cannot Check In' : 'Clock In Shift Session'}
                        >
                          <UserCheck size={10} />
                          <span>IN</span>
                        </button>
                      )}

                      <button
                        onClick={() => onViewLogs(member)}
                        className="py-1.5 px-2 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 rounded-lg text-[9px] font-bold cursor-pointer transition-all active:scale-[0.98]"
                        title="Inspect Attendance Logs"
                      >
                        <FileText size={10} />
                      </button>
                    </div>
                  </td>
                  
                  {/* Roster Admin Actions Column */}
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => onEdit(member)}
                        className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-white hover:border-blue-200 transition-all cursor-pointer shadow-sm active:scale-95"
                        title="Edit Clearance Profile"
                      >
                        <Edit size={12} />
                      </button>
                      <button 
                        onClick={() => onDelete(member.id, member.name)}
                        className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-white hover:border-rose-200 transition-all cursor-pointer shadow-sm active:scale-95"
                        title="Offboard Staff Agent"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 2. Unified client-side pagination matching standard global-table.css definitions */}
      {totalItems > 0 && (
        <div className="table-pagination !border-t border-slate-200 !rounded-none">
          <div className="pagination-text text-xs">
            Showing <span>{startIndex + 1}</span> to <span>{Math.min(endIndex, totalItems)}</span> of <span>{totalItems}</span> active roster profiles
          </div>
          <div className="pagination-btn-group">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pg-btn text-[10px] font-bold py-1 px-2 cursor-pointer select-none"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`pg-btn text-[10px] font-bold py-1 px-2 cursor-pointer select-none ${currentPage === page ? 'pg-active' : ''}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="pg-btn text-[10px] font-bold py-1 px-2 cursor-pointer select-none"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffTable;
