import React, { useState, useEffect } from 'react';
import { getRooms, createRoom, updateRoom, deleteRoom } from '../../api/rooms';
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
  // State loaded from backend API
  const [rooms, setRooms] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals / Drawer active state
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [viewingRoom, setViewingRoom] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Toast notification state
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Fetch Rooms from Backend exactly once on component mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await getRooms();
        if (res && res.success) {
          setRooms(res.data);
        } else {
          addToast(res.message || 'Failed to load rooms inventory.', 'error');
        }
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Error loading rooms inventory.';
        addToast(errMsg, 'error');
      }
    };
    fetchRooms();
  }, []);

  // Slideshow effect for the detailed room modal
  useEffect(() => {
    if (!viewingRoom || !viewingRoom.images || viewingRoom.images.length <= 1) {
      setActiveImageIndex(0);
      return;
    }

    setActiveImageIndex(0); // Reset index on open

    const interval = setInterval(() => {
      setActiveImageIndex((prevIndex) => (prevIndex + 1) % viewingRoom.images.length);
    }, 2000); // Cycle every 2 seconds

    return () => clearInterval(interval);
  }, [viewingRoom]);

  // Filter and Search Logic
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = 
      room.roomNumber.toString().includes(searchTerm) || 
      room.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || room.status === filter;
    return matchesSearch && matchesFilter;
  });

  // Add Room callback
  const handleAddRoom = async (newRoom) => {
    try {
      const res = await createRoom(newRoom);
      if (res && res.success) {
        setRooms((prev) => [res.data, ...prev]);
        setIsAddFormOpen(false);
        addToast(`Room ${res.data.roomNumber} (${res.data.type}) registered successfully!`, 'success');
      } else {
        addToast(res.message || 'Failed to register room.', 'error');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error registering room.';
      addToast(errMsg, 'error');
    }
  };

  // Edit Room callback
  const handleEditClick = (room, e) => {
    e.stopPropagation();
    setEditingRoom(room);
    setIsAddFormOpen(true);
  };

  const handleEditRoom = async (updatedRoom) => {
    try {
      const res = await updateRoom(updatedRoom.roomNumber, updatedRoom);
      if (res && res.success) {
        setRooms((prev) => prev.map((r) => r.roomNumber === updatedRoom.roomNumber ? res.data : r));
        setIsAddFormOpen(false);
        setEditingRoom(null);
        addToast(`Room ${res.data.roomNumber} updated successfully!`, 'success');
      } else {
        addToast(res.message || 'Failed to update room.', 'error');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error updating room.';
      addToast(errMsg, 'error');
    }
  };

  // Retire / Delete Asset callback
  const handleDeleteRoom = async (roomId, e) => {
    e.stopPropagation(); // Avoid triggering details modal
    if (window.confirm(`Are you sure you want to retire Room ${roomId} from the active lodging inventory?`)) {
      try {
        const res = await deleteRoom(roomId);
        if (res && res.success) {
          setRooms((prev) => prev.filter((r) => r.roomNumber !== roomId));
          addToast(`Room ${roomId} retired from active asset inventory.`, 'warning');
          if (viewingRoom && viewingRoom.roomNumber === roomId) {
            setViewingRoom(null);
          }
        } else {
          addToast(res.message || 'Failed to delete room.', 'error');
        }
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Error retiring room.';
        addToast(errMsg, 'error');
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
                    ₹{room.price.toLocaleString('en-IN')}/night
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
            
            {/* Cover header area with active image slideshow */}
            <div 
              className="room-card-thumbnail room-card-thumbnail-large transition-all duration-500"
              style={{ 
                backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.3), rgba(15, 23, 42, 0.9)), url(${viewingRoom.images && viewingRoom.images[activeImageIndex]})` 
              }}
            >
              {/* Carousel Navigation Arrows */}
              {viewingRoom.images && viewingRoom.images.length > 1 && (
                <>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev === 0 ? viewingRoom.images.length - 1 : prev - 1));
                    }}
                    className="carousel-btn carousel-btn-left"
                    title="Previous Image"
                  >
                    ‹
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev + 1) % viewingRoom.images.length);
                    }}
                    className="carousel-btn carousel-btn-right"
                    title="Next Image"
                  >
                    ›
                  </button>
                </>
              )}

              {/* Dot Indicators */}
              {viewingRoom.images && viewingRoom.images.length > 1 && (
                <div className="carousel-dots">
                  {viewingRoom.images.map((_, idx) => (
                    <span 
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex(idx);
                      }}
                      className={`carousel-dot ${idx === activeImageIndex ? 'carousel-dot-active' : ''}`}
                    />
                  ))}
                </div>
              )}

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
                      ₹{viewingRoom.price.toLocaleString('en-IN')}
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
