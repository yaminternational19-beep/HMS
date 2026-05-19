import React from 'react';
import RoomCard from './RoomCard';
import '../styles/rooms.css';

const RoomGrid = ({ rooms, onRoomClick }) => {
  if (!rooms || rooms.length === 0) {
    return (
      <div className="room-grid-empty">
        <div className="room-grid-empty-icon-wrapper">
          <svg className="room-grid-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="room-grid-empty-title">No Rooms Found</h3>
        <p className="room-grid-empty-text">Try adjusting your filters or search query to find available rooms.</p>
      </div>
    );
  }

  return (
    <div className="room-grid-container">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} onClick={onRoomClick} />
      ))}
    </div>
  );
};

export default RoomGrid;
