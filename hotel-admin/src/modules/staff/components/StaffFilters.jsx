import React from 'react';
import { Search } from 'lucide-react';

const StaffFilters = ({ searchTerm, onSearchChange, deptFilter, onDeptFilterChange }) => {
  const departments = ['all', 'Administration', 'Front Office', 'Housekeeping', 'Maintenance', 'Food & Beverage'];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      {/* Search Input */}
      <div className="room-filters-search-wrapper">
        <span className="room-filters-search-icon">
          <Search size={14} />
        </span>
        <input
          type="text"
          placeholder="Search employee ID, name or role..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="room-filters-search-input"
        />
      </div>

      {/* Department Filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
        {departments.map((deptName) => (
          <button
            key={deptName}
            onClick={() => onDeptFilterChange(deptName)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer border transition-all shrink-0 ${
              deptFilter === deptName 
                ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
            }`}
          >
            {deptName}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StaffFilters;
