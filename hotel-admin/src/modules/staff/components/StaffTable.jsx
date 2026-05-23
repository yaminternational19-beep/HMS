import React from 'react';
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
import { ROOM_STATUS } from '../../rooms/constants/roomStatus'; // Wait, let's use standard statuses or text directly

const StaffTable = ({ 
  data = [], 
  onCheckIn, 
  onCheckOut, 
  onViewLogs, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="table-container">
      <table className="table-element">
        <thead>
          <tr>
            <th>Staff ID</th>
            <th>Employee</th>
            <th>Clearance Role</th>
            <th>Contact Details</th>
            <th>Joined</th>
            <th className="text-center">Status</th>
            <th className="text-center">Shift Session</th>
            <th className="text-center">Shift Control</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center py-8 text-slate-400 font-medium italic">
                No matching employee roster profiles found.
              </td>
            </tr>
          ) : (
            data.map((member) => (
              <tr key={member.id} className="align-middle">
                {/* ID Column */}
                <td className="font-semibold text-slate-400 font-mono text-[10px] tracking-wider">{member.id}</td>
                
                {/* Employee Details Column */}
                <td>
                  <div className="flex items-center gap-3">
                    {/* Visual Initials Avatar */}
                    <div className="staff-card-avatar h-9 w-9 text-xs">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-xs">{member.name}</div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">{member.dept}</div>
                    </div>
                  </div>
                </td>
                
                {/* Role Column */}
                <td>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                    <Shield size={10} className="text-slate-400 shrink-0" />
                    <span>{member.role}</span>
                  </div>
                </td>
                
                {/* Contact Column */}
                <td>
                  <div className="space-y-1 text-[10px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Mail size={10} className="text-slate-400 shrink-0" />
                      <a href={`mailto:${member.email}`} className="hover:text-accent truncate max-w-[120px] inline-block">{member.email}</a>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={10} className="text-slate-400 shrink-0" />
                      <a href={`tel:${member.phone}`} className="hover:text-accent">{member.phone}</a>
                    </div>
                  </div>
                </td>
                
                {/* Joined Column */}
                <td className="text-[10px] text-slate-500 font-semibold">{member.joined}</td>
                
                {/* active status Column */}
                <td className="text-center">
                  <span className={`staff-status-badge ${
                    member.status === 'active' 
                      ? 'staff-status-active'
                      : 'staff-status-leave'
                  }`}>
                    <span className="text-[8px] font-bold tracking-wider">{member.status.toUpperCase()}</span>
                  </span>
                </td>
                
                {/* Shift status Column */}
                <td className="text-center">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest ${
                    member.isCheckedIn
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-slate-50 text-slate-400 border border-slate-100'
                  }`}>
                    <span className={`h-1 w-1 rounded-full ${member.isCheckedIn ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                    <span>{member.isCheckedIn ? 'ON DUTY' : 'OFFLINE'}</span>
                  </span>
                </td>
                
                {/* Shift Control Action Column */}
                <td>
                  <div className="flex items-center justify-center gap-1.5">
                    {member.isCheckedIn ? (
                      <button
                        onClick={() => onCheckOut(member.id)}
                        className="staff-btn-session staff-btn-checkout !py-1 !px-2.5 !text-[8px]"
                        title="Clock Out Session"
                      >
                        <UserMinus size={10} />
                        <span>OUT</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onCheckIn(member.id)}
                        className="staff-btn-session staff-btn-checkin !py-1 !px-2.5 !text-[8px]"
                        disabled={member.status !== 'active'}
                        title={member.status !== 'active' ? 'On Leave: Cannot Check In' : 'Clock In Session'}
                        style={{ 
                          opacity: member.status !== 'active' ? 0.5 : 1, 
                          cursor: member.status !== 'active' ? 'not-allowed' : 'pointer' 
                        }}
                      >
                        <UserCheck size={10} />
                        <span>IN</span>
                      </button>
                    )}

                    <button
                      onClick={() => onViewLogs(member)}
                      className="staff-btn-logs !py-1 !px-2"
                      title="View Attendance Logs"
                    >
                      <FileText size={10} />
                    </button>
                  </div>
                </td>
                
                {/* Roster Admin Actions Column */}
                <td>
                  <div className="flex items-center justify-center gap-1">
                    <button 
                      onClick={() => onEdit(member)}
                      className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-white transition-all cursor-pointer shadow-sm"
                      title="Edit Clearance Profile"
                    >
                      <Edit size={12} />
                    </button>
                    <button 
                      onClick={() => onDelete(member.id, member.name)}
                      className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white transition-all cursor-pointer shadow-sm"
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
  );
};

export default StaffTable;
