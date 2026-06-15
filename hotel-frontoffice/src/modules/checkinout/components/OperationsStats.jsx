import React from 'react';
import { MdLogin, MdLogout, MdMeetingRoom, MdPayments } from 'react-icons/md';
import StatsCard from '../../../components/global/stats/StatsCard';
import StatsGrid from '../../../components/global/stats/StatsGrid';

const OperationsStats = ({ stats = {} }) => {
  const arrivals = stats.arrivals !== undefined ? stats.arrivals : 0;
  const pendingArrivals = stats.pendingArrivals !== undefined ? stats.pendingArrivals : 0;
  
  const departures = stats.departures !== undefined ? stats.departures : 0;
  const pendingDepartures = stats.pendingDepartures !== undefined ? stats.pendingDepartures : 0;

  const pendingCollections = stats.pendingCollections || 0;
  const guestsWithBalance = stats.guestsWithBalance || 0;

  return (
    <StatsGrid>
      <StatsCard
        title="Arrivals"
        value={arrivals}
        icon={<MdLogin size={20} />}
        theme="blue"
        subtitle={`${pendingArrivals} pending`}
      />
      <StatsCard
        title="Departures"
        value={departures}
        icon={<MdLogout size={20} />}
        theme="amber"
        subtitle={`${pendingDepartures} pending`}
      />
      <StatsCard
        title="Available Rooms"
        value={stats.availableRooms !== undefined ? stats.availableRooms : 0}
        icon={<MdMeetingRoom size={20} />}
        theme="emerald"
        subtitle={`of ${stats.totalRooms !== undefined ? stats.totalRooms : 0} total rooms`}
      />
      <StatsCard
        title="Pending Collections"
        value={pendingCollections > 0 ? `₹${pendingCollections.toLocaleString()}` : '₹0'}
        icon={<MdPayments size={20} />}
        theme={pendingCollections > 0 ? 'red' : 'emerald'}
        subtitle={`${guestsWithBalance} guest(s) with balance`}
      />
    </StatsGrid>
  );
};

export default OperationsStats;
