import React from 'react';
import { MdKingBed, MdPerson, MdCleaningServices, MdBuild } from 'react-icons/md';
import { ROOM_STATUS } from '../constants/roomStatus';
import '../styles/rooms.css';

const RoomCard = ({ room, onClick }) => {
  // Determine styles based on status
  const getStatusStyles = () => {
    switch (room.status) {
      case ROOM_STATUS.AVAILABLE:
        return 'room-card-available';
      case ROOM_STATUS.OCCUPIED:
        return 'room-card-occupied';
      case ROOM_STATUS.RESERVED:
        return 'room-card-reserved';
      case ROOM_STATUS.CLEANING:
        return 'room-card-cleaning';
      case ROOM_STATUS.MAINTENANCE:
        return 'room-card-maintenance';
      default:
        return 'room-card-default';
    }
  };

  const getStatusIcon = () => {
    switch (room.status) {
      case ROOM_STATUS.OCCUPIED: return <MdPerson size={16} />;
      case ROOM_STATUS.CLEANING: return <MdCleaningServices size={16} />;
      case ROOM_STATUS.MAINTENANCE: return <MdBuild size={16} />;
      default: return <MdKingBed size={16} />;
    }
  };

  return (
    <div
      onClick={() => onClick && onClick(room)}
      className={`room-card ${getStatusStyles()}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold tracking-tight opacity-90">{room.roomNumber}</h3>
          <p className="text-xs font-semibold opacity-70 mt-0.5 uppercase tracking-wider">{room.type}</p>
        </div>
        <div className="room-icon-wrapper">
          {getStatusIcon()}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center text-sm font-semibold opacity-90">
          <span>{room.status}</span>
          <span>₹{room.price}</span>
        </div>

        {/* Conditional Info based on status */}
        {room.status === ROOM_STATUS.OCCUPIED && (
          <p className="text-xs opacity-75 truncate pt-1">Guest: {room.guestName}</p>
        )}
        {room.status === ROOM_STATUS.CLEANING && (
          <p className="text-xs opacity-75 truncate pt-1">Staff: {room.cleaningStaff}</p>
        )}
      </div>

      {/* Decorative Floor Tag */}
      <span className="room-floor-tag">
        {room.floor.replace('Floor', '')}F
      </span>
    </div>
  );
};
export default RoomCard;
