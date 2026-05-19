import React, { useState, useMemo } from 'react';
import { MOCK_ROOMS } from './services/room.service';
import RoomFilters from './components/RoomFilters';
import RoomGrid from './components/RoomGrid';
import { useToastStore } from '../../store/useToastStore';
import './styles/rooms.css';

const RoomsPage = () => {
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const addToast = useToastStore((state) => state.addToast);

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
    addToast(`Selected ${room.roomNumber} (${room.status})`, 'info');
    // We will hook this up to a side-panel or action menu in the future
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
    </div>
  );
};

export default RoomsPage;
