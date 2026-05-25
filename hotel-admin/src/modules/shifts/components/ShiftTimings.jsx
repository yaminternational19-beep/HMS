import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Sunset, 
  Moon, 
  Briefcase, 
  Clock, 
  Plus, 
  Users, 
  CalendarRange, 
  Edit, 
  Trash2, 
  X
} from 'lucide-react';

const calculateShiftHours = (timeRangeStr) => {
  try {
    const [startStr, endStr] = timeRangeStr.split(' - ');
    
    const parseTime = (str) => {
      const [time, modifier] = str.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    let startMins = parseTime(startStr);
    let endMins = parseTime(endStr);
    
    let diffMins = endMins - startMins;
    if (diffMins < 0) {
      diffMins += 24 * 60; // Wrap around midnight
    }
    
    const hours = diffMins / 60;
    return `${hours} hrs`;
  } catch (e) {
    return '8 hrs'; // fallback default
  }
};

const ShiftTimings = ({ 
  staff = [], 
  shifts = [], 
  onAssignShift,  
  onCreateShift,
  onUpdateShift,
  onDeleteShift 
}) => {
  // Local state for the "Define New Shift" or "Edit Shift" form
  const [shiftName, setShiftName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [shiftIcon, setShiftIcon] = useState('clock');
  const [shiftColor, setShiftColor] = useState('purple');
  const [error, setError] = useState('');
  
  // Track shift being edited
  const [editingShift, setEditingShift] = useState(null);

  // Icon mapping helper
  const renderShiftIcon = (iconName, colorClass) => {
    const size = 16;
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

  // Pre-fill form when editing shift changes
  useEffect(() => {
    if (editingShift) {
      setShiftName(editingShift.name);
      setShiftIcon(editingShift.icon);
      setShiftColor(editingShift.color);
      setError('');
      
      // Parse 12h time back to 24h for time input fields
      try {
        const [start12, end12] = editingShift.time.split(' - ');
        
        const convert12to24 = (time12) => {
          const [time, modifier] = time12.split(' ');
          let [hours, minutes] = time.split(':');
          let hrs = parseInt(hours, 10);
          if (modifier === 'PM' && hrs < 12) hrs = hrs + 12;
          if (modifier === 'AM' && hrs === 12) hrs = 0;
          return `${String(hrs).padStart(2, '0')}:${minutes}`;
        };
        
        setStartTime(convert12to24(start12));
        setEndTime(convert12to24(end12));
      } catch (e) {
        setStartTime('09:00');
        setEndTime('17:00');
      }
    } else {
      setShiftName('');
      setStartTime('09:00');
      setEndTime('17:00');
      setShiftIcon('clock');
      setShiftColor('purple');
      setError('');
    }
  }, [editingShift]);

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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!shiftName.trim()) {
      setError('Shift Label is required.');
      return;
    }
    setError('');

    const formattedTime = `${formatTimeTo12h(startTime)} - ${formatTimeTo12h(endTime)}`;
    const shiftData = {
      name: shiftName.trim(),
      time: formattedTime,
      icon: shiftIcon,
      color: shiftColor
    };

    if (editingShift) {
      onUpdateShift({ ...shiftData, id: editingShift.id });
      setEditingShift(null);
    } else {
      onCreateShift(shiftData);
    }

    // Reset Form
    setShiftName('');
    setStartTime('09:00');
    setEndTime('17:00');
    setShiftIcon('clock');
    setShiftColor('purple');
  };

  const handleCancelEdit = () => {
    setEditingShift(null);
  };

  return (
    <div className="space-y-6">
      
      {/* SECTION 2: Dynamic Shift Editor & Defined Shift directory list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Creator / Editor Form Block (Left 1/3) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="p-1.5 bg-amber-50 text-accent rounded-lg">
              <CalendarRange size={16} />
            </span>
            <div>
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider leading-none">
                {editingShift ? `Edit Shift Details` : 'Define Custom Shift'}
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                {editingShift ? `Modify timetable settings` : 'Configure duty schedules'}
              </p>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-3">
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

            <div className="flex gap-2 pt-2">
              {editingShift && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <X size={12} />
                  <span>Cancel</span>
                </button>
              )}
              <button
                type="submit"
                className="flex-[2] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-md cursor-pointer active:scale-[0.98]"
              >
                {editingShift ? <Clock size={13} /> : <Plus size={13} className="stroke-[3]" />}
                <span>{editingShift ? 'Save Changes' : 'Create Shift'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Defined Shift directory list / Table (Right 2/3) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Clock size={16} />
              </span>
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider leading-none">Defined Shifts Directory</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">Operational timetables database</p>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-bold bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-0.5 shadow-inner">
              {shifts.length} Active Shifts
            </span>
          </div>

          <div className="overflow-x-auto max-h-[300px] border border-slate-100 rounded-xl overflow-y-auto scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="shift-table-header">
                  <th className="shift-table-th">Shift ID</th>
                  <th className="shift-table-th">Shift timing</th>
                  <th className="shift-table-th">Operational Hours</th>
                  <th className="shift-table-th">Assigned Staff</th>
                  <th className="shift-table-th text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => {
                  const themes = getThemeClasses(shift.color);
                  const assignedStaff = staff.filter((member) => member.shiftId === shift.id);

                  return (
                    <tr key={shift.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      {/* ID */}
                      <td className="px-4 py-3 font-semibold text-slate-400 font-mono text-[10px] tracking-wider">
                        {shift.id}
                      </td>

                      {/* Name Details */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg shrink-0 flex items-center justify-center ${themes.icon}`}>
                            {renderShiftIcon(shift.icon, themes.text)}
                          </div>
                          <span className="font-bold text-slate-800 text-xs">{shift.name}</span>
                        </div>
                      </td>

                      {/* Operational Hours */}
                      <td className="px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{shift.time}</span>
                          <span className="text-[10px] bg-slate-800 text-slate-100 font-extrabold px-2 py-0.5 rounded-lg shadow-sm shrink-0">
                            {calculateShiftHours(shift.time)}
                          </span>
                        </div>
                      </td>

                      {/* Assigned Staff Count */}
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 inline-block shadow-sm">
                          {assignedStaff.length} {assignedStaff.length === 1 ? 'employee' : 'employees'}
                        </span>
                      </td>

                      {/* Action buttons (Edit & Delete) */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => setEditingShift(shift)}
                            className={`p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-white hover:border-blue-200 transition-all cursor-pointer shadow-sm active:scale-95 ${editingShift && editingShift.id === shift.id ? 'opacity-50' : 'opacity-100'}`}
                            title={`Edit "${shift.name}"`}
                            disabled={editingShift && editingShift.id === shift.id}
                          >
                            <Edit size={11} />
                          </button>
                          <button 
                            onClick={() => onDeleteShift(shift.id)}
                            className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-white hover:border-rose-200 transition-all cursor-pointer shadow-sm active:scale-95"
                            title={`Retire "${shift.name}"`}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
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
