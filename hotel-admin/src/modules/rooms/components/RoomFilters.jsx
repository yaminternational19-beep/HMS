import React from 'react';
import { Search, Filter } from 'lucide-react';

const RoomFilters = ({ searchTerm, onSearchChange, filter, onFilterChange }) => {
  return (
    <div className="room-filters-container">
      
      {/* Search Room */}
      <div className="room-filters-search-wrapper">
        <span className="room-filters-search-icon">
          <Search size={14} />
        </span>
        <input
          type="text"
          placeholder="Search room number or classification..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="room-filters-search-input"
        />
      </div>

      {/* Filter Dropdown */}
      <div className="room-filters-select-wrapper">
        <span className="room-filters-select-label">
          <Filter size={12} />
          <span>Status:</span>
        </span>
        <div className="room-filters-select-inner">
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="room-filters-select"
          >
            <option value="all">ALL ROOMS & SUITES</option>
            <option value="available">AVAILABLE (CLEAN)</option>
            <option value="occupied">OCCUPIED</option>
            <option value="dirty">HOUSEKEEPING NEEDED</option>
            <option value="maintenance">UNDER MAINTENANCE</option>
          </select>
        </div>
      </div>

    </div>
  );
};

export default RoomFilters;
