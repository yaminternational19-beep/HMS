import React, { useState } from 'react';
import { 
  Sun, 
  Sunset, 
  Moon, 
  Briefcase, 
  Clock, 
  Plus, 
  Users, 
  UserCheck, 
  CalendarRange, 
  CheckCircle2 
} from 'lucide-react';

const ShiftTimings = ({ 
  staff = [], 
  shifts = [], 
  onAssignShift, 
  onCreateShift 
}) => {
  // Local state for the "Define New Shift" form
  const [shiftName, setShiftName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [shiftIcon, setShiftIcon] = useState('clock');
  const [shiftColor, setShiftColor] = useState('purple');
  const [error, setError] = useState('');

  // Icon mapping helper
  const renderShiftIcon = (iconName, colorClass) => {
    const size = 18;
    switch (iconName) {
      case 'sun':
        return <Sun size={size} className={colorClass} />;
      case 'sunset':
        return <Sunset size={size} className={colorClass} />;
      case 'moon':
        return <Moon size={size} className={colorClass} />;
      case 'briefcase':
        return <Briefcase size={size} className={colorClass} />;
      case 'clock':
      default:
        return <Clock size={size} className={colorClass} />;
    }
  };

  // Color theme mapping helper
  const getThemeClasses = (color) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50/70 border-blue-100',
          text: 'text-blue-700',
          icon: 'text-blue-500 bg-blue-100/50',
          tag: 'bg-blue-500',
          pulse: 'bg-blue-400'
        };
      case 'orange':
        return {
          bg: 'bg-amber-50/70 border-amber-100',
          text: 'text-amber-700',
          icon: 'text-amber-500 bg-amber-100/50',
          tag: 'bg-amber-500',
          pulse: 'bg-amber-400'
        };
      case 'indigo':
        return {
          bg: 'bg-indigo-50/70 border-indigo-100',
          text: 'text-indigo-700',
          icon: 'text-indigo-500 bg-indigo-100/50',
          tag: 'bg-indigo-500',
          pulse: 'bg-indigo-400'
        };
      case 'purple':
        return {
          bg: 'bg-violet-50/70 border-violet-100',
          text: 'text-violet-700',
          icon: 'text-violet-500 bg-violet-100/50',
          tag: 'bg-violet-500',
          pulse: 'bg-violet-400'
        };
      case 'rose':
        return {
          bg: 'bg-rose-50/70 border-rose-100',
          text: 'text-rose-700',
          icon: 'text-rose-500 bg-rose-100/50',
          tag: 'bg-rose-500',
          pulse: 'bg-rose-400'
        };
      case 'emerald':
        return {
          bg: 'bg-emerald-50/70 border-emerald-100',
          text: 'text-emerald-700',
          icon: 'text-emerald-500 bg-emerald-100/50',
          tag: 'bg-emerald-500',
          pulse: 'bg-emerald-400'
        };
      default:
        return {
          bg: 'bg-slate-50/70 border-slate-100',
          text: 'text-slate-700',
          icon: 'text-slate-500 bg-slate-100/50',
          tag: 'bg-slate-500',
          pulse: 'bg-slate-400'
        };
    }
  };

  // Time conversion: converts 24h format ('09:00') into 12h AM/PM ('09:00 AM')
  const formatTimeTo12h = (timeStr) => {
    try {
      const [hours, minutes] = timeStr.split(':');
      let hr = parseInt(hours, 10);
      const ampm = hr >= 12 ? 'PM' : 'AM';
      hr = hr % 12;
      hr = hr ? hr : 12; // 0 translates to 12
      return `${String(hr).padStart(2, '0')}:${minutes} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  const handleDefineShift = (e) => {
    e.preventDefault();
    if (!shiftName.trim()) {
      setError('Shift Name is required.');
      return;
    }
    setError('');

    const formattedTime = `${formatTimeTo12h(startTime)} - ${formatTimeTo12h(endTime)}`;
    
    onCreateShift({
      name: shiftName.trim(),
      time: formattedTime,
      icon: shiftIcon,
      color: shiftColor
    });

    // Reset Form
    setShiftName('');
    setStartTime('09:00');
    setEndTime('17:00');
    setShiftIcon('clock');
    setShiftColor('purple');
  };

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: Active Shifts Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {shifts.map((shift) => {
          const themes = getThemeClasses(shift.color);
          const assignedStaff = staff.filter((member) => member.shiftId === shift.id);

          return (
            <div 
              key={shift.id} 
              className={`p-5 rounded-2xl border bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between min-h-[160px] relative overflow-hidden`}
            >
              {/* Colored top-accent tag strip */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${themes.tag}`} />
              
              <div className="flex justify-between items-start pt-1">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm leading-none">{shift.name}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mt-2.5">
                    <Clock size={11} />
                    <span>{shift.time}</span>
                  </div>
                </div>
                
                <div className={`p-2 rounded-xl shrink-0 flex items-center justify-center ${themes.icon}`}>
                  {renderShiftIcon(shift.icon, themes.text)}
                </div>
              </div>

              {/* Roster profiles assigned to this shift */}
              <div className="border-t border-slate-100 pt-3.5 mt-4 flex items-center justify-between">
                <div className="flex -space-x-2.5 overflow-hidden">
                  {assignedStaff.length === 0 ? (
                    <span className="text-[10px] text-slate-400 font-medium italic">Unassigned shift</span>
                  ) : (
                    assignedStaff.map((member) => (
                      <div 
                        key={member.id} 
                        className="relative h-7 w-7 rounded-lg overflow-hidden border border-white bg-slate-100 shadow-sm flex items-center justify-center font-bold text-slate-600 text-[9px] uppercase select-none shrink-0"
                        title={`${member.name} (${member.role})`}
                      >
                        {member.govtProofFileUrl ? (
                          <img 
                            src={member.govtProofFileUrl} 
                            alt={member.name} 
                            className="absolute inset-0 h-full w-full object-cover z-10"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : null}
                        <span className="relative z-0">{member.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                    ))
                  )}
                </div>

                {assignedStaff.length > 0 && (
                  <span className="text-[10px] text-slate-500 font-bold bg-slate-50 border border-slate-100 rounded-lg px-2 py-0.5 shadow-sm">
                    {assignedStaff.length} {assignedStaff.length === 1 ? 'Agent' : 'Agents'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SECTION 2: Define New Shift & Shift Assignment Board Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Creator Block */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="p-1.5 bg-amber-50 text-accent rounded-lg">
              <CalendarRange size={16} />
            </span>
            <div>
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider leading-none">Define Custom Shift</h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Configure duty schedules</p>
            </div>
          </div>

          <form onSubmit={handleDefineShift} className="space-y-3">
            <div>
              <label className="form-label !mb-1 text-[11px]">Shift Label</label>
              <input
                type="text"
                value={shiftName}
                onChange={(e) => setShiftName(e.target.value)}
                placeholder="e.g. Weekend Guard, Late Evening"
                className="form-input"
              />
              {error && <p className="text-[10px] text-red-500 font-semibold mt-1">{error}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label !mb-1 text-[11px]">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="form-input cursor-pointer"
                />
              </div>
              <div>
                <label className="form-label !mb-1 text-[11px]">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="form-input cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label !mb-1 text-[11px]">Visual Theme</label>
                <select
                  value={shiftColor}
                  onChange={(e) => setShiftColor(e.target.value)}
                  className="form-select cursor-pointer text-xs"
                >
                  <option value="purple">Purple Theme</option>
                  <option value="blue">Blue Theme</option>
                  <option value="orange">Amber Theme</option>
                  <option value="indigo">Indigo Theme</option>
                  <option value="rose">Rose Theme</option>
                  <option value="emerald">Emerald Theme</option>
                </select>
              </div>
              <div>
                <label className="form-label !mb-1 text-[11px]">Icon Accent</label>
                <select
                  value={shiftIcon}
                  onChange={(e) => setShiftIcon(e.target.value)}
                  className="form-select cursor-pointer text-xs"
                >
                  <option value="clock">Clock Icon</option>
                  <option value="sun">Sun Icon</option>
                  <option value="sunset">Sunset Icon</option>
                  <option value="moon">Moon Icon</option>
                  <option value="briefcase">Briefcase Icon</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-md cursor-pointer active:scale-[0.98] pt-3.5 mt-2"
            >
              <Plus size={14} className="stroke-[3]" />
              <span>Create Shift Timing</span>
            </button>
          </form>
        </div>

        {/* Database Allocator Block */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Users size={16} />
              </span>
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider leading-none">Shift Allocation Board</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Assign shift timetables to personnel</p>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-bold bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-0.5 shadow-inner">
              Roster database
            </span>
          </div>

          <div className="overflow-x-auto max-h-[300px] border border-slate-100 rounded-xl overflow-y-auto scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-wider sticky top-0 z-10 border-b border-slate-100">
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Clearance Clearance</th>
                  <th className="px-4 py-3">Current Assignment</th>
                  <th className="px-4 py-3 text-center">Change Shift</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => {
                  const allocatedShift = shifts.find(s => s.id === member.shiftId) || { name: 'Unassigned', color: 'slate' };
                  const allocatedTheme = getThemeClasses(allocatedShift.color);

                  return (
                    <tr key={member.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      {/* Name Details */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="relative h-7 w-7 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-inner flex items-center justify-center font-bold text-slate-700 text-[10px] uppercase select-none shrink-0">
                            {member.govtProofFileUrl ? (
                              <img 
                                src={member.govtProofFileUrl} 
                                alt={member.name} 
                                className="absolute inset-0 h-full w-full object-cover z-10"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : null}
                            <span className="relative z-0">{member.name.split(' ').map(n => n[0]).join('')}</span>
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-xs">{member.name}</div>
                            <div className="text-[9px] text-slate-400 font-semibold">{member.role}</div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3 font-semibold text-slate-500 uppercase tracking-wide text-[9px]">
                        {member.dept}
                      </td>

                      {/* Assigned Shift Badge */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[9px] font-bold border ${allocatedTheme.bg}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${allocatedTheme.pulse} animate-pulse`}></span>
                          <span>{allocatedShift.name}</span>
                        </span>
                      </td>

                      {/* Allocator Dropdown selector */}
                      <td className="px-4 py-3 text-center">
                        <select
                          value={member.shiftId || ''}
                          onChange={(e) => onAssignShift(member.id, e.target.value)}
                          className="px-2 py-1.5 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-600 focus:border-accent outline-none bg-white hover:border-slate-300 transition-colors cursor-pointer shadow-sm min-w-[140px]"
                        >
                          {shifts.map((shift) => (
                            <option key={shift.id} value={shift.id}>
                              {shift.name} ({shift.time.split(' - ')[0]})
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ShiftTimings;
