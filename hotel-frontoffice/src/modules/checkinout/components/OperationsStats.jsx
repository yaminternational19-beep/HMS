import React from 'react';
import { MdLogin, MdLogout, MdMeetingRoom, MdPayments } from 'react-icons/md';
import StatsCard from '../../../components/global/stats/StatsCard';
import StatsGrid from '../../../components/global/stats/StatsGrid';

const OperationsStats = ({ arrivals, departures }) => {
  const pendingArrivals = arrivals.filter(a => a.status === 'Pending').length;
  const checkedIn = arrivals.filter(a => a.status === 'Checked-In').length;
  const pendingDepartures = departures.filter(d => d.status === 'Pending').length;
  const pendingCollections = departures
    .filter(d => d.status === 'Pending' && d.balance > 0)
    .reduce((sum, d) => sum + d.balance, 0);

  return (
    <StatsGrid>
      <StatsCard
        title="Arrivals Today"
        value={pendingArrivals}
        icon={<MdLogin size={20} />}
        theme="blue"
        subtitle={`${checkedIn} checked in`}
      />
      <StatsCard
        title="Departures Today"
        value={pendingDepartures}
        icon={<MdLogout size={20} />}
        theme="amber"
        subtitle={`${departures.filter(d => d.status === 'Checked-Out').length} checked out`}
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
        subtitle={`${departures.filter(d => d.balance > 0).length} guest(s) with balance`}
      />
    </StatsGrid>
  );
};

export default OperationsStats;
