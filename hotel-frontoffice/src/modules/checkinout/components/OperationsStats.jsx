import React from 'react';
import { MdLogin, MdLogout, MdMeetingRoom, MdPayments } from 'react-icons/md';
import StatsCard from '../../../components/global/stats/StatsCard';
import StatsGrid from '../../../components/global/stats/StatsGrid';

const OperationsStats = ({ stats = {} }) => {
  const pendingArrivals = stats.pendingArrivals || 0;
  const checkedIn = stats.pendingDepartures || 0; // Number of in-house guests
  const pendingDepartures = stats.pendingDepartures || 0;
  const checkedOut = stats.checkedOut || 0;
  const pendingCollections = stats.pendingCollections || 0;
  const guestsWithBalance = stats.guestsWithBalance || 0;

  return (
    <StatsGrid>
      <StatsCard
        title="Arrivals"
        value={pendingArrivals}
        icon={<MdLogin size={20} />}
        theme="blue"
        subtitle={`${checkedIn} in-house`}
      />
      <StatsCard
        title="Departures"
        value={pendingDepartures}
        icon={<MdLogout size={20} />}
        theme="amber"
        subtitle={`${checkedOut} checked out`}
      />
      <StatsCard
        title="Available Rooms"
        value={12}
        icon={<MdMeetingRoom size={20} />}
        theme="emerald"
        subtitle="of 48 total rooms"
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
