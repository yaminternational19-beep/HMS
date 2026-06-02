import React from 'react';
import { Search, Tag, UserCheck2, RotateCcw, Shield, Clock } from 'lucide-react';
import ExportButtons from '../../../components/ExportButtons';

const StaffFilters = ({ 
  searchTerm, 
  onSearchChange, 
  deptFilter, 
  onDeptFilterChange,
  statusFilter,
  onStatusFilterChange,
  dutyFilter,
  onDutyFilterChange,
  shiftFilter,
  onShiftFilterChange,
  shifts = [],
  departments = ['all', 'Administration', 'Front Office', 'Housekeeping', 'Maintenance', 'Food & Beverage'],
  onClearFilters,
  onExportPDF,
  onExportExcel
}) => {

  return (
    <div className="staff-filters-container">
      <div className="staff-filters-wrapper">
        
        {/* Unified Search Input */}
        <div className="staff-search-container">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by code, id or name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="staff-search-input"
          />
          {searchTerm && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-3 flex items-center text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider"
            >
              Clear
            </button>
          )}
        </div>

        {/* Department Clearance Dropdown Selector */}
        <div className="staff-filter-select-container">
          <div className="relative flex items-center">
            <span className="absolute left-2.5 text-slate-400 pointer-events-none">
              <Shield size={13} />
            </span>
            <select
              value={deptFilter}
              onChange={(e) => onDeptFilterChange(e.target.value)}
              className="staff-filter-select"
            >
              <option value="all">All Roles / Depts</option>
              {departments.filter(d => d !== 'all').map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Roster Clearance Status Dropdown */}
        <div className="staff-filter-select-container">
          <div className="relative flex items-center">
            <span className="absolute left-2.5 text-slate-400 pointer-events-none">
              <Tag size={13} />
            </span>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="staff-filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>
        </div>

        {/* Assigned Shift Timing Dropdown Filter */}
        <div className="staff-filter-select-container">
          <div className="relative flex items-center">
            <span className="absolute left-2.5 text-slate-400 pointer-events-none">
              <Clock size={13} />
            </span>
            <select
              value={shiftFilter}
              onChange={(e) => onShiftFilterChange(e.target.value)}
              className="staff-filter-select"
            >
              <option value="all">All Roster Shifts</option>
              {shifts.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Shift / Attendance Status Dropdown */}
        <div className="staff-filter-select-container">
          <div className="relative flex items-center">
            <span className="absolute left-2.5 text-slate-400 pointer-events-none">
              <UserCheck2 size={13} />
            </span>
            <select
              value={dutyFilter}
              onChange={(e) => onDutyFilterChange(e.target.value)}
              className="staff-filter-select"
            >
              <option value="all">All Attendance</option>
              <option value="on-duty">On Duty</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={onClearFilters}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 border border-slate-200 hover:border-slate-300 rounded-lg text-sm text-slate-650 font-bold bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-sm active:scale-[0.98] shrink-0"
          title="Reset All Filters"
        >
          <RotateCcw size={14} className="text-slate-500" />
          <span>Reset</span>
        </button>

        {/* Global Export Action Buttons */}
        <ExportButtons 
          onExportPDF={onExportPDF} 
          onExportExcel={onExportExcel} 
          className="staff-filter-actions"
        />

      </div>
    </div>
  );
};

export default StaffFilters;
