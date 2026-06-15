import React from 'react';
import { MdBookOnline, MdMeetingRoom, MdPeople, MdLogout } from 'react-icons/md';
import StatsCard from '../../../components/global/stats/StatsCard';
import StatsGrid from '../../../components/global/stats/StatsGrid';

const BookingStats = ({ data = [], stats = {} }) => {
  // Compute booking stats dynamically or use backend pre-calculated stats
  const total = stats.total !== undefined ? stats.total : data.length;
  const active = stats.active !== undefined ? stats.active : data.filter(b => b.status === 'Confirmed' || b.status === 'Checked-In').length;
  const checkedIn = stats.checkedIn !== undefined ? stats.checkedIn : data.filter(b => b.status === 'Checked-In').reduce((sum, b) => sum + b.totalGuests, 0);
  const pendingCheckout = stats.pendingCheckout !== undefined ? stats.pendingCheckout : data.filter(b => b.status === 'Checked-In' && b.checkOut === '2026-05-18').length;

  return (
    <StatsGrid>
      <StatsCard
        title="Total Bookings"
        value={total}
        icon={<MdBookOnline size={20} />}
        theme="blue"
        subtitle="Registered reservations"
      />
      <StatsCard
        title="Active Bookings"
        value={active}
        icon={<MdMeetingRoom size={20} />}
        theme="emerald"
        subtitle="Confirmed & In-house"
      />
      <StatsCard
        title="Checked-In Guests"
        value={checkedIn}
        icon={<MdPeople size={20} />}
        theme="yellow"
        subtitle="Currently in house"
      />
      <StatsCard
        title="Pending Checkouts"
        value={pendingCheckout}
        icon={<MdLogout size={20} />}
        theme="red"
        subtitle="Departures outstanding"
      />
    </StatsGrid>
  );
};

export default BookingStats;
