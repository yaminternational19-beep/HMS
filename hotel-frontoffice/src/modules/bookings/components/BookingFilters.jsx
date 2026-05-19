import React from 'react';
import { MdOutlineSearch, MdRestartAlt } from 'react-icons/md';
import { ROOM_TYPES, BOOKING_STATUS } from '../constants/bookingStatus';
import ActionButton from '../../../components/ActionButton';
import ExportButtons from '../../../components/ExportButtons';
import '../styles/bookings.css';

const BookingFilters = ({ filters, onFilterChange, onReset, onExportPDF, onExportExcel }) => {
  return (
    <div className="booking-filters-container">
      <div className="booking-filters-wrapper">
        {/* Search */}
        <div className="booking-search-container">
          <span className="booking-search-icon">
            <MdOutlineSearch size={18} />
          </span>
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search booking or guest..."
            className="booking-search-input"
          />
        </div>

        {/* Room Type select */}
        <div className="booking-filter-select-container">
          <select
            value={filters.roomType}
            onChange={(e) => onFilterChange('roomType', e.target.value)}
            className="booking-filter-select"
          >
            <option value="All">All Room Types</option>
            {ROOM_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Booking Status select */}
        <div className="booking-filter-select-container">
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="booking-filter-select"
          >
            <option value="All">All Statuses</option>
            {Object.values(BOOKING_STATUS).map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Action buttons */}
        <div className="booking-filter-actions">
          {/* Reset */}
          <ActionButton
            onClick={onReset}
            variant="secondary"
            icon={MdRestartAlt}
          >
            <span>Reset</span>
          </ActionButton>

          {/* Export Actions */}
          <ExportButtons onExportPDF={onExportPDF} onExportExcel={onExportExcel} />
        </div>
      </div>
    </div>
  );
};

export default BookingFilters;
