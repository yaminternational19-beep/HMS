import React, { useState, useEffect } from 'react';
import { getRoomsAndStats, updateRoomStatus } from '../../api/rooms';
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
  Info,
  Loader2
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
  const addToast = useToastStore((state) => state.addToast);

  // Dynamic state populated from APIs
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState({ total: 0, available: 0, occupied: 0, maintenance: 0 });
  const [loading, setLoading] = useState(true);

  // States for updating status modal
  const [updatingRoom, setUpdatingRoom] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    type: 'All',
    status: 'All',
    floor: 'All'
  });

  // Fetch rooms list and stats from backend
  const fetchRooms = async (showSilently = false) => {
    if (!showSilently) setLoading(true);
    try {
      const response = await getRoomsAndStats(filters);
      if (response && response.success) {
        setRooms(response.data.rooms || []);
        setStats(response.data.stats || { total: 0, available: 0, occupied: 0, maintenance: 0 });
      }
    } catch (error) {
      console.error('Failed to load room inventory:', error);
      const errorMsg = error?.response?.data?.message || 'Failed to connect to backend room inventory services.';
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch whenever filters change
  useEffect(() => {
    fetchRooms();
  }, [filters]);

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

  const handleSaveStatus = async () => {
    if (!updatingRoom) return;
    setSaving(true);

    try {
      const response = await updateRoomStatus(updatingRoom.roomNumber, newStatus);
      if (response && response.success) {
        addToast(`Room ${updatingRoom.roomNumber} status successfully updated to ${newStatus}.`, 'success');
        setUpdatingRoom(null);
        // Silently reload the rooms and stats list to avoid layout flashing
        fetchRooms(true);
      }
    } catch (error) {
      console.error('Failed to update room status:', error);
      const errorMsg = error?.response?.data?.message || `Failed to update status of Room ${updatingRoom.roomNumber}.`;
      addToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

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
        
        <div className="rooms-workspace-grid-area relative min-h-[300px]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 rounded-xl">
              <Loader2 size={36} className="text-indigo-600 animate-spin mb-2" />
              <p className="text-slate-500 font-medium text-sm">Fetching room inventory...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/30 rounded-xl border border-dashed border-slate-200 p-8">
              <p className="text-slate-400 font-medium text-base">No rooms match the current search filters.</p>
              <button 
                onClick={handleReset} 
                className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <RoomGrid 
              rooms={rooms}
              onRoomClick={handleRoomClick}
            />
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {updatingRoom && (
        <div className="status-modal-overlay" onClick={() => !saving && setUpdatingRoom(null)}>
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
                  onClick={() => !saving && setUpdatingRoom(null)} 
                  className="status-modal-close"
                  title="Close Modal"
                  disabled={saving}
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
                <p className="booking-modal-section-text">{updatingRoom.description || 'No description provided.'}</p>
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

              {/* Occupied Guest and Cleaning Staff Details (Dynamic) */}
              {updatingRoom.guestName && (
                <div className="booking-modal-section border-t border-slate-100 pt-3 mt-1">
                  <label className="spec-details-label">In-House Guest</label>
                  <span className="text-slate-900 font-semibold text-sm">{updatingRoom.guestName}</span>
                </div>
              )}

              {updatingRoom.cleaningStaff && (
                <div className="booking-modal-section border-t border-slate-100 pt-3 mt-1">
                  <label className="spec-details-label">Housekeeper Assigned</label>
                  <span className="text-slate-900 font-semibold text-sm">{updatingRoom.cleaningStaff}</span>
                </div>
              )}

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
                  disabled={saving}
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
                onClick={() => !saving && setUpdatingRoom(null)}
                className="status-btn-cancel"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatus}
                className="status-btn-save flex items-center justify-center"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 size={12} className="animate-spin mr-1.5" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Status Changes</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsPage;
