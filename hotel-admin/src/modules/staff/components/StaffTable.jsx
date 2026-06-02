import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Mail, 
  Phone, 
  Calendar, 
  Edit, 
  Trash2, 
  Clock, 
  Eye 
} from 'lucide-react';
import ActionButton from '../../../components/ActionButton';

const StaffTable = ({ 
  data = [], 
  shifts = [],
  onViewLogs, 
  onEdit, 
  onDelete,
  selectedIds = [],
  setSelectedIds,
  className = ""
}) => {
  // Encapsulated local pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
              <th className="w-10 text-center">
                <input 
                  type="checkbox"
                  checked={data.length > 0 && data.every(m => selectedIds.includes(m.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const allIds = data.map(m => m.id);
                      setSelectedIds(allIds);
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                  className="rounded border-slate-350 text-accent focus:ring-accent cursor-pointer h-4 w-4"
                  title="Select All Employees (Irrespective of Pagination)"
                />
              </th>
              <th>Staff Code</th>
              <th>Employee Profile</th>
              <th>Roster Role</th>
              <th>Contact Details</th>
              <th>Roster Shift</th>
              <th className="text-center">Status</th>
              <th className="text-center">Current Duty (Today)</th>
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
              paginatedData.map((member) => {
                // Find dynamic shift timing configuration
                const assignedShift = shifts.find(s => s.id === member.shiftId) || {
                  name: 'Morning Shift',
                  time: '07:00 AM - 03:00 PM',
                  color: 'blue'
                };

                return (
                  <tr 
                    key={member.id} 
                    className={`align-middle transition-colors duration-150 ${
                      member.isCheckedIn ? 'bg-emerald-50/20 hover:bg-emerald-50/30' : 'hover:bg-slate-50'
                    }`}
                    style={{
                      borderLeft: member.isCheckedIn ? '3px solid #10b981' : '3px solid transparent'
                    }}
                  >
                    {/* Checkbox Column */}
                    <td className="text-center w-10">
                      <input 
                        type="checkbox"
                        checked={selectedIds.includes(member.id)}
                        onChange={() => {
                          setSelectedIds(prev => 
                            prev.includes(member.id) 
                              ? prev.filter(id => id !== member.id) 
                              : [...prev, member.id]
                          );
                        }}
                        className="rounded border-slate-350 text-accent focus:ring-accent cursor-pointer h-4 w-4"
                      />
                    </td>

                    {/* Staff Code Column */}
                    <td>
                      <span className="font-semibold text-slate-500 font-mono text-[11px] tracking-wider bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">
                        {member.uniqueCode || '29384756'}
                      </span>
                    </td>
                    
                    {/* Employee Details Column */}
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="relative h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 shadow-inner flex items-center justify-center font-extrabold text-slate-700 shrink-0 text-xs uppercase select-none">
                          {member.profileFileUrl ? (
                            <img 
                              src={member.profileFileUrl} 
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
                          <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                            {member.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Roster Role Column (Redundant icons removed as requested) */}
                    <td>
                      <span className="text-xs text-slate-600 font-semibold">
                        {member.role}
                      </span>
                    </td>
                    
                    {/* Contact Column */}
                    <td>
                      <div className="space-y-1 text-[10px] text-slate-500">
                        {member.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail size={11} className="text-slate-400 shrink-0" />
                            <a href={`mailto:${member.email}`} className="hover:text-amber-700 truncate max-w-[125px] inline-block transition-colors font-medium">
                              {member.email}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Phone size={11} className="text-slate-400 shrink-0" />
                          <a href={`tel:${member.phone}`} className="hover:text-amber-700 transition-colors font-medium">
                            {member.phone}
                          </a>
                        </div>
                      </div>
                    </td>
                    
                    {/* Assigned Shift Column */}
                    <td>
                      <div className="space-y-0.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-${assignedShift.color}-50 text-${assignedShift.color}-700 border border-${assignedShift.color}-100`}>
                          {assignedShift.name}
                        </span>
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">{assignedShift.time}</p>
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
                    
                    {/* Dynamic Current Duty Column */}
                    <td className="text-center">
                      {member.isCheckedIn ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>ON DUTY</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-slate-50 text-slate-400 border border-slate-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                          <span>OFFLINE</span>
                        </span>
                      )}
                    </td>
                    
                    {/* Roster Action Column (Leveraging global ActionButtons) */}
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <ActionButton
                          variant="table-view"
                          onClick={() => onViewLogs(member)}
                          icon={Eye}
                          iconSize={18}
                          title="View Attendance & Complete State"
                        />
                        <ActionButton 
                          variant="table-edit"
                          onClick={() => onEdit(member)}
                          icon={Edit}
                          iconSize={18}
                          title="Edit Clearance Profile"
                        />
                        <ActionButton 
                          variant="table-delete"
                          onClick={() => onDelete(member.id, member.name)}
                          icon={Trash2}
                          iconSize={18}
                          title="Offboard Staff Agent"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 2. Unified client-side pagination */}
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
