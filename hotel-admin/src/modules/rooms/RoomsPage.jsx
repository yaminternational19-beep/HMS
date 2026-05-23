import React, { useState } from 'react';
import { 
  Plus, 
  Bed, 
  PenSquare, 
  Trash2, 
  Wrench, 
  Sparkles, 
  AlertTriangle,
  Users,
  Compass,
  Wifi,
  Wind,
  Tv,
  Coffee,
  ShieldCheck,
  UtensilsCrossed,
  Bath,
  Info,
  Maximize2,
  Waves,
  ChefHat,
  Flower2,
  Car
} from 'lucide-react';
import { MOCK_ROOMS } from './mockdata/rooms.mock';
import AddRoomForm from './components/AddRoomForm';
import RoomFilters from './components/RoomFilters';
import './styles/rooms.css';

// Amenity to Lucide Icon mapping for card/modal icons
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
  // State loaded from unified mock database
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals / Drawer active state
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [viewingRoom, setViewingRoom] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);

  // Toast notification state
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Filter and Search Logic
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.roomNumber.toString().includes(searchTerm) || 
      room.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || room.status === filter;
    return matchesSearch && matchesFilter;
  });

  // Add Room callback
  const handleAddRoom = (newRoom) => {
    setRooms((prev) => [newRoom, ...prev]);
    setIsAddFormOpen(false);
    addToast(`Room ${newRoom.roomNumber} (${newRoom.type}) registered successfully!`, 'success');
  };

  // Edit Room callback
  const handleEditClick = (room, e) => {
    e.stopPropagation();
    setEditingRoom(room);
    setIsAddFormOpen(true);
  };

  const handleEditRoom = (updatedRoom) => {
    setRooms((prev) => prev.map((r) => r.id === updatedRoom.id ? updatedRoom : r));
    setIsAddFormOpen(false);
    setEditingRoom(null);
    addToast(`Room ${updatedRoom.roomNumber} updated successfully!`, 'success');
  };

  // Retire / Delete Asset callback
  const handleDeleteRoom = (roomId, e) => {
    e.stopPropagation(); // Avoid triggering details modal
    if (window.confirm(`Are you sure you want to retire Room ${roomId} from the active lodging inventory?`)) {
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      addToast(`Room ${roomId} retired from active asset inventory.`, 'warning');
      if (viewingRoom && viewingRoom.id === roomId) {
        setViewingRoom(null);
      }
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return (
          <span className="status-badge status-badge-available">
            <Sparkles size={9} />
            <span>Available</span>
          </span>
        );
      case 'occupied':
        return (
          <span className="status-badge status-badge-occupied">
            <Bed size={9} />
            <span>Occupied</span>
          </span>
        );
      case 'dirty':
        return (
          <span className="status-badge status-badge-dirty">
            <AlertTriangle size={9} />
            <span>HK Needed</span>
          </span>
        );
      case 'maintenance':
        return (
          <span className="status-badge status-badge-maintenance">
            <Wrench size={9} />
            <span>Maintenance</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rooms-page-container">
      
      {/* 1. Page Header */}
      <div className="rooms-header-wrapper">
        <div className="rooms-header-info">
          <h2 className="rooms-header-title">Rooms & Suite Inventory</h2>
          <p className="rooms-header-subtitle">Add, edit, inspect, and configure lodging assets and real-time maintenance statuses.</p>
        </div>

        <button 
          onClick={() => {
            setEditingRoom(null);
            setIsAddFormOpen(true);
          }}
          className="rooms-btn-register"
        >
          <Plus size={14} className="stroke-[3]" />
          <span>Register New Room</span>
        </button>
      </div>

      {/* 2. Control Filters and Search */}
      <RoomFilters 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filter={filter}
        onFilterChange={setFilter}
      />

      {/* 3. Rooms Inventory Cards Grid */}
      {filteredRooms.length > 0 ? (
        <div className="rooms-grid">
          {filteredRooms.map((room) => (
            <div 
              key={room.id}
              onClick={() => setViewingRoom(room)}
              className="room-card group"
            >
              {/* Cover Header dynamic image area */}
              <div 
                className="room-card-thumbnail"
                style={{ 
                  backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.25), rgba(15, 23, 42, 0.85)), url(${room.images && room.images[0]})` 
                }}
              >
                {/* Visual Floor & Status badges */}
                <div className="room-card-badge-row">
                  <span className="room-card-floor">
                    {room.floor}
                  </span>
                  {getStatusBadge(room.status)}
                </div>

                <div className="room-card-title-row">
                  <h3 className="room-card-title">Room {room.roomNumber}</h3>
                </div>
              </div>

              {/* Card Specs Body */}
              <div className="room-card-body">
                <div className="room-card-details-wrapper">
                  <p className="room-card-type">{room.type}</p>
                  
                  {/* Capacity & Bed specs */}
                  <div className="room-card-specs">
                    <span className="room-card-spec-badge">
                      <Bed size={10} className="room-card-spec-icon" />
                      <span>{room.bedType} Bed</span>
                    </span>
                    <span className="room-card-spec-badge">
                      <Users size={10} className="room-card-spec-icon" />
                      <span>Max {room.capacity} Guests</span>
                    </span>
                  </div>

                  {/* Amenities Quick list */}
                  {room.amenities && room.amenities.length > 0 && (
                    <div className="room-card-amenities">
                      {room.amenities.slice(0, 3).map((amenity, idx) => {
                        const Icon = AMENITY_ICONS[amenity];
                        return (
                          <span 
                            key={idx} 
                            className="room-card-amenity-btn" 
                            title={amenity}
                          >
                            {Icon ? <Icon size={11} /> : <span className="text-[8px] font-bold px-1">{amenity[0]}</span>}
                          </span>
                        );
                      })}
                      {room.amenities.length > 3 && (
                        <span className="room-card-amenity-more">
                          +{room.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="room-card-cleaned">Last Cleaned: {room.lastCleaned}</p>
                </div>

                {/* Nightly rate footer */}
                <div className="room-card-footer">
                  <p className="room-card-price-label">Nightly Rate</p>
                  <p className="room-card-price-value">
                    {typeof room.price === 'number' ? `₹${room.price.toLocaleString('en-IN')}/night` : room.price}
                  </p>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="empty-inventory-state">
          <AlertTriangle size={36} className="empty-state-icon" />
          <h4 className="empty-state-title">No Lodging Assets Found</h4>
          <p className="empty-state-text">No rooms match your filter or search classification. Modify your search query or add a new lodging asset above.</p>
        </div>
      )}

      {/* 4. Add Room Drawer Modal Component */}
      <AddRoomForm 
        isOpen={isAddFormOpen}
        onClose={() => {
          setIsAddFormOpen(false);
          setEditingRoom(null);
        }}
        onAdd={handleAddRoom}
        onEdit={handleEditRoom}
        editingRoom={editingRoom}
        existingRooms={rooms}
      />

      {/* 5. Detailed Room View modal */}
      {viewingRoom && (
        <div className="booking-modal-overlay animate-fade-in" onClick={() => setViewingRoom(null)}>
          <div className="booking-modal-container animate-slide-up" onClick={(e) => e.stopPropagation()}>
            
            {/* Cover header area */}
            <div 
              className="room-card-thumbnail room-card-thumbnail-large"
              style={{ 
                backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.3), rgba(15, 23, 42, 0.9)), url(${viewingRoom.images && viewingRoom.images[0]})` 
              }}
            >
              <div className="room-card-badge-row">
                <span className="room-card-floor">
                  {viewingRoom.floor}
                </span>
                <button 
                  onClick={() => setViewingRoom(null)} 
                  className="booking-modal-close-btn"
                >
                  ×
                </button>
              </div>
              <div className="booking-modal-header-info">
                <h3 className="room-card-title room-card-title-large">Room {viewingRoom.roomNumber}</h3>
                <p className="booking-modal-header-type">{viewingRoom.type}</p>
              </div>
            </div>

            {/* Room Details Body */}
            <div className="booking-modal-body booking-modal-body-scrollable">
              
              {/* Description */}
              <div className="booking-modal-section">
                <label className="booking-modal-section-label">
                  <Info size={11} className="booking-modal-label-icon" />
                  <span>Promotional Description</span>
                </label>
                <p className="booking-modal-section-text">{viewingRoom.description}</p>
              </div>

              {/* Details grid */}
              <div className="spec-details-grid">
                <div>
                  <span className="spec-details-label">Configuration</span>
                  <span className="spec-details-value">{viewingRoom.bedType} Bed</span>
                </div>
                <div>
                  <span className="spec-details-label">Capacity limit</span>
                  <span className="spec-details-value">{viewingRoom.capacity} Adults / Guests</span>
                </div>
                <div>
                  <span className="spec-details-label">Availability State</span>
                  <span className="booking-modal-inline-span">{getStatusBadge(viewingRoom.status)}</span>
                </div>
                <div>
                  <span className="spec-details-label">Housekeeping Status</span>
                  <span className="spec-details-value spec-details-value-muted">{viewingRoom.lastCleaned}</span>
                </div>
              </div>

              {/* Amenities list */}
              <div className="booking-modal-section-spaced">
                <label className="booking-modal-section-title">Lodging Utilities & Amenities</label>
                <div className="booking-modal-amenities-list">
                  {viewingRoom.amenities && viewingRoom.amenities.length > 0 ? (
                    viewingRoom.amenities.map((amenity, index) => {
                      const Icon = AMENITY_ICONS[amenity];
                      return (
                        <span 
                          key={index} 
                          className="booking-modal-amenity-badge"
                        >
                          {Icon && <Icon size={12} className="booking-modal-amenity-icon" />}
                          <span>{amenity}</span>
                        </span>
                      );
                    })
                  ) : (
                    <span className="booking-modal-empty-text">No amenities registered for this room.</span>
                  )}
                </div>
              </div>

              {/* Multiple images gallery */}
              {viewingRoom.images && viewingRoom.images.length > 1 && (
                <div className="booking-modal-section-spaced">
                  <label className="booking-modal-section-title">Additional Photos ({viewingRoom.images.length})</label>
                  <div className="booking-modal-gallery-grid">
                    {viewingRoom.images.map((img, idx) => (
                      <div key={idx} className="booking-modal-gallery-item">
                        <img src={img} alt="" className="booking-modal-gallery-img" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer action */}
              <div className="modal-footer-tworow">
                {/* Main Row: Rate & Close */}
                <div className="modal-footer-primary-row">
                  <div>
                    <span className="modal-footer-price-label">Nightly Rate</span>
                    <span className="modal-footer-price-val">
                      {typeof viewingRoom.price === 'number' ? `₹${viewingRoom.price.toLocaleString('en-IN')}` : viewingRoom.price}
                    </span>
                  </div>
                  <button
                    onClick={() => setViewingRoom(null)}
                    className="modal-footer-close-btn"
                  >
                    Close Viewer
                  </button>
                </div>

                {/* Secondary Row: Administrative Actions */}
                <div className="modal-footer-admin-grid">
                  <button
                    onClick={(e) => {
                      setViewingRoom(null);
                      handleEditClick(viewingRoom, e);
                    }}
                    className="modal-footer-btn-edit"
                  >
                    <PenSquare size={12} />
                    <span>Edit Specifications</span>
                  </button>
                  <button
                    onClick={(e) => handleDeleteRoom(viewingRoom.id, e)}
                    className="modal-footer-btn-retire"
                  >
                    <Trash2 size={12} />
                    <span>Retire Lodging Asset</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 6. Visual Toast Alerts */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-alert ${
              toast.type === 'success' ? 'toast-alert-success' :
              toast.type === 'warning' ? 'toast-alert-warning' :
              toast.type === 'error' ? 'toast-alert-error' :
              'toast-alert-info'
            }`}
          >
            <span className="toast-message">{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="toast-close"
            >
              ×
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default RoomsPage;
