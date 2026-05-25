import React from 'react';
import { Search, Tag, UserCheck2, ArrowUpDown, RotateCcw, Shield } from 'lucide-react';

const StaffFilters = ({ 
  searchTerm, 
  onSearchChange, 
  deptFilter, 
  onDeptFilterChange,
  statusFilter,
  onStatusFilterChange,
  dutyFilter,
  onDutyFilterChange,
  sortBy,
  onSortByChange,
  onClearFilters
}) => {
  const departments = ['all', 'Administration', 'Front Office', 'Housekeeping', 'Maintenance', 'Food & Beverage'];

  return (
    <div className="p-4 w-full bg-white border-b border-slate-200/80">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        
        {/* Unified Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search booking, guest or staff..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-12 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-800 font-medium focus:border-accent outline-none bg-white hover:border-slate-300 transition-colors shadow-sm"
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

        {/* Dropdown Filters & Sorting Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Department Clearance Dropdown Selector */}
          <div className="min-w-[150px] flex-1 lg:flex-none">
            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-slate-400 pointer-events-none">
                <Shield size={13} />
              </span>
              <select
                value={deptFilter}
                onChange={(e) => onDeptFilterChange(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:border-accent outline-none bg-white hover:border-slate-300 transition-colors cursor-pointer shadow-sm"
              >
                <option value="all">All Departments</option>
                {departments.filter(d => d !== 'all').map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Roster Clearance Status Dropdown */}
          <div className="min-w-[130px] flex-1 lg:flex-none">
            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-slate-400 pointer-events-none">
                <Tag size={13} />
              </span>
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:border-accent outline-none bg-white hover:border-slate-300 transition-colors cursor-pointer shadow-sm"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>
          </div>

          {/* Shift / Attendance Status Dropdown */}
          <div className="min-w-[135px] flex-1 lg:flex-none">
            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-slate-400 pointer-events-none">
                <UserCheck2 size={13} />
              </span>
              <select
                value={dutyFilter}
                onChange={(e) => onDutyFilterChange(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:border-accent outline-none bg-white hover:border-slate-300 transition-colors cursor-pointer shadow-sm"
              >
                <option value="all">All Attendance</option>
                <option value="on-duty">On Duty</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          {/* Sort Controller Dropdown */}
          <div className="min-w-[160px] flex-1 lg:flex-none">
            <div className="relative flex items-center">
           {/* Reset Button (Always visible like booking reset) */}
              <button
                onClick={onClearFilters}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 border border-slate-200 hover:border-slate-300 rounded-lg text-sm text-slate-600 font-bold bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                title="Reset All Filters"
              >
                <RotateCcw size={14} className="text-slate-500" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffFilters;
