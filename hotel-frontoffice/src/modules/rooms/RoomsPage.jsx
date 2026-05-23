import React, { useState, useMemo } from 'react';
import { MOCK_ROOMS } from './services/room.service';
import RoomFilters from './components/RoomFilters';
import RoomGrid from './components/RoomGrid';
import { ROOM_STATUS } from './constants/roomStatus';
import { useToastStore } from '../../store/useToastStore';
import { 
  Wifi, 
  Wind, 
  Tv, 
  Coffee, 
  Compass, 
  ShieldCheck, 
  UtensilsCrossed, 
  Bath,
  Waves,
  ChefHat,
  Flower2,
  Car,
  Info
} from 'lucide-react';
import './styles/rooms.css';

// Amenity to Lucide Icon mapping for status modal
const AMENITY_ICONS = {
  'WiFi': Wifi,
  'AC': Wind,
  'TV': Tv,
  'Mini Bar': Coffee,
  'Balcony': Compass,
  'Safe': ShieldCheck,
  'Room Service': UtensilsCrossed,
  'Jacuzzi': Bath,
  'Infinity Pool': Waves,
  'Private Chef': ChefHat,
  'Spa Lounge': Flower2,
  'Valet Parking': Car
};

const RoomsPage = () => {
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const addToast = useToastStore((state) => state.addToast);

  // States for updating status
  const [updatingRoom, setUpdatingRoom] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const [filters, setFilters] = useState({
    search: '',
    type: 'All',
    status: 'All',
    floor: 'All'
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      search: '',
      type: 'All',
      status: 'All',
      floor: 'All'
    });
    addToast('Filters reset to default.', 'info');
  };

  const handleRoomClick = (room) => {
    setUpdatingRoom(room);
    setNewStatus(room.status);
  };

  const handleSaveStatus = () => {
    if (!updatingRoom) return;

    setRooms(prevRooms => 
      prevRooms.map(r => 
        r.id === updatingRoom.id 
          ? { 
              ...r, 
              status: newStatus,
              guestName: newStatus === ROOM_STATUS.OCCUPIED ? (r.guestName || 'In-House Guest') : null,
              cleaningStaff: newStatus === ROOM_STATUS.CLEANING ? (r.cleaningStaff || 'Maria S.') : null
            } 
          : r
      )
    );

    addToast(`Room ${updatingRoom.roomNumber} status successfully updated to ${newStatus}.`, 'success');
    setUpdatingRoom(null);
  };

  // Filter Logic
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      // Search by room number or guest name
      const matchesSearch = 
        room.roomNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        (room.guestName && room.guestName.toLowerCase().includes(filters.search.toLowerCase()));

      const matchesType = filters.type === 'All' || room.type === filters.type;
      const matchesStatus = filters.status === 'All' || room.status === filters.status;
      const matchesFloor = filters.floor === 'All' || room.floor.includes(filters.floor.replace('st','').replace('nd','').replace('rd','').replace('th',''));

      return matchesSearch && matchesType && matchesStatus && matchesFloor;
    });
  }, [rooms, filters]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = rooms.length;
    const available = rooms.filter(r => r.status === 'Available').length;
    const occupied = rooms.filter(r => r.status === 'Occupied').length;
    const maintenance = rooms.filter(r => r.status === 'Under Maintenance').length;
    
    return { total, available, occupied, maintenance };
  }, [rooms]);

  return (
    <div className="rooms-page-container animate-fade-in">
      {/* 1. Header Section */}
      <div className="rooms-header-wrapper">
        <div>
          <h1 className="rooms-header-title">Room Inventory</h1>
          <p className="rooms-header-subtitle">Real-time status and allocation dashboard</p>
        </div>

        {/* Quick Stats Summary */}
        <div className="rooms-stats-container">
          <div className="rooms-stats-item">
            <span className="rooms-stats-label-total">Total</span>
            <span className="rooms-stats-value-total">{stats.total}</span>
          </div>
          <div className="rooms-stats-item">
            <span className="rooms-stats-label-available">Available</span>
            <span className="rooms-stats-value-available">{stats.available}</span>
          </div>
          <div className="rooms-stats-item">
            <span className="rooms-stats-label-occupied">Occupied</span>
            <span className="rooms-stats-value-occupied">{stats.occupied}</span>
          </div>
          <div className="rooms-stats-item-last">
            <span className="rooms-stats-label-maintenance">Maintenance</span>
            <span className="rooms-stats-value-maintenance">{stats.maintenance}</span>
          </div>
        </div>
      </div>

      {/* 2. Workspace / Grid Area */}
      <div className="rooms-workspace-container">
        <RoomFilters 
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />
        
        <div className="rooms-workspace-grid-area">
          <RoomGrid 
            rooms={filteredRooms}
            onRoomClick={handleRoomClick}
          />
        </div>
      </div>

      {/* Status Update Modal */}
      {updatingRoom && (
        <div className="status-modal-overlay" onClick={() => setUpdatingRoom(null)}>
          <div className="status-modal-container !max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
            
            {/* Rich cover thumbnail header area */}
            <div 
              className="room-card-thumbnail-large"
              style={{ 
                backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.3), rgba(15, 23, 42, 0.9)), url(${updatingRoom.images && updatingRoom.images[0]})` 
              }}
            >
              <div className="room-card-badge-row">
                <span className="room-card-floor-large">
                  {updatingRoom.floor.replace('Floor', '')}F
                </span>
                <button 
                  onClick={() => setUpdatingRoom(null)} 
                  className="status-modal-close"
                  title="Close Modal"
                >
                  ×
                </button>
              </div>
              <div>
                <h3 className="room-card-title-large">Room {updatingRoom.roomNumber}</h3>
                <p className="booking-modal-header-type">{updatingRoom.type}</p>
              </div>
            </div>
            
            {/* Modal Body with rich specifications and dynamic updater dropdown */}
            <div className="booking-modal-body-scrollable">
              
              {/* Promotional Description */}
              <div className="booking-modal-section">
                <label className="booking-modal-section-label">
                  <Info size={11} className="booking-modal-label-icon" />
                  <span>Promotional Description</span>
                </label>
                <p className="booking-modal-section-text">{updatingRoom.description}</p>
              </div>

              {/* Specifications detailed grid */}
              <div className="spec-details-grid">
                <div>
                  <span className="spec-details-label">Configuration</span>
                  <span className="spec-details-value">{updatingRoom.bedType} Bed</span>
                </div>
                <div>
                  <span className="spec-details-label">Capacity Limit</span>
                  <span className="spec-details-value">{updatingRoom.capacity} Adults / Guests</span>
                </div>
                <div>
                  <span className="spec-details-label">Housekeeping Status</span>
                  <span className="spec-details-value spec-details-value-muted">Cleaned {updatingRoom.lastCleaned}</span>
                </div>
                <div>
                  <span className="spec-details-label">Base Rate</span>
                  <span className="spec-details-value">₹{updatingRoom.price.toLocaleString('en-IN')}/night</span>
                </div>
              </div>

              {/* Lodging Utilities & Amenities badged grid */}
              <div className="booking-modal-section-spaced">
                <label className="booking-modal-section-title">Lodging Utilities & Amenities</label>
                <div className="booking-modal-amenities-list">
                  {updatingRoom.amenities && updatingRoom.amenities.map((amenity, idx) => {
                    const Icon = AMENITY_ICONS[amenity];
                    return (
                      <span key={idx} className="booking-modal-amenity-badge">
                        {Icon && <Icon size={12} className="booking-modal-amenity-icon" />}
                        <span>{amenity}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Lodging Status dropdown editor */}
              <div className="border-t border-slate-100 pt-3.5 mt-2">
                <label className="status-select-label" htmlFor="modalStatus">Update Lodging Status</label>
                <select
                  id="modalStatus"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="status-select-dropdown"
                >
                  {Object.values(ROOM_STATUS).map((statusVal) => (
                    <option key={statusVal} value={statusVal}>
                      {statusVal.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Save/Cancel Footer */}
            <div className="status-modal-footer">
              <button
                onClick={() => setUpdatingRoom(null)}
                className="status-btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatus}
                className="status-btn-save"
              >
                Save Status Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsPage;
