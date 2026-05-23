import React from 'react';
import { 
  Sparkles, 
  Bed, 
  Wrench, 
  AlertTriangle, 
  Calendar, 
  Users,
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
  Car
} from 'lucide-react';
import { ROOM_STATUS } from '../constants/roomStatus';
import '../styles/rooms.css';

// Amenity to Lucide Icon mapping
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

const RoomCard = ({ room, onClick }) => {
  
  const getStatusBadge = () => {
    switch (room.status) {
      case ROOM_STATUS.AVAILABLE:
        return (
          <span className="status-badge status-badge-available">
            <Sparkles size={9} />
            <span>Available</span>
          </span>
        );
      case ROOM_STATUS.OCCUPIED:
        return (
          <span className="status-badge status-badge-occupied">
            <Bed size={9} />
            <span>Occupied</span>
          </span>
        );
      case ROOM_STATUS.RESERVED:
        return (
          <span className="status-badge status-badge-reserved">
            <Calendar size={9} />
            <span>Reserved</span>
          </span>
        );
      case ROOM_STATUS.CLEANING:
        return (
          <span className="status-badge status-badge-dirty">
            <AlertTriangle size={9} />
            <span>Needs Cleaning</span>
          </span>
        );
      case ROOM_STATUS.MAINTENANCE:
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
    <div
      onClick={() => onClick && onClick(room)}
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
            {room.floor.replace('Floor', '')}F
          </span>
          {getStatusBadge()}
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
  );
};

export default RoomCard;
