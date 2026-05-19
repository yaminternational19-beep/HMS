import React from 'react';
import { MdOutlineSearch, MdRestartAlt } from 'react-icons/md';
import { ROOM_TYPES, ROOM_STATUS, FLOOR_NUMBERS } from '../constants/roomStatus';
import ActionButton from '../../../components/ActionButton';
import '../styles/rooms.css';

const RoomFilters = ({ filters, onFilterChange, onReset }) => {
  return (
    <div className="room-filters-container">
      <div className="room-filters-wrapper">
        {/* Search */}
        <div className="room-search-container">
          <span className="room-search-icon">
            <MdOutlineSearch size={18} />
          </span>
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search room number..."
            className="room-search-input"
          />
        </div>

        {/* Room Type select */}
        <div className="room-filter-select-container">
          <select
            value={filters.type}
            onChange={(e) => onFilterChange('type', e.target.value)}
            className="room-filter-select"
          >
            <option value="All">All Room Types</option>
            {ROOM_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Room Status select */}
        <div className="room-filter-select-container">
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="room-filter-select"
          >
            <option value="All">All Statuses</option>
            {Object.values(ROOM_STATUS).map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Floor select */}
        <div className="room-filter-select-container-small">
          <select
            value={filters.floor}
            onChange={(e) => onFilterChange('floor', e.target.value)}
            className="room-filter-select"
          >
            <option value="All">All Floors</option>
            {FLOOR_NUMBERS.map((floor) => (
              <option key={floor} value={floor}>{floor}</option>
            ))}
          </select>
        </div>

        {/* Action buttons */}
        <div className="room-filter-actions">
          {/* Reset */}
          <ActionButton
            onClick={onReset}
            variant="secondary"
            icon={MdRestartAlt}
          >
            <span>Reset</span>
          </ActionButton>
        </div>
      </div>
    </div>
  );
};

export default RoomFilters;
