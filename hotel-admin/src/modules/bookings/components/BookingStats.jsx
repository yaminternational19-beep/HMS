import React from 'react';
import { MdBookOnline, MdMeetingRoom, MdPeople, MdLogout } from 'react-icons/md';
import StatsCard from '../../../components/global/stats/StatsCard';
import StatsGrid from '../../../components/global/stats/StatsGrid';

const BookingStats = ({ stats = {} }) => {
  // Use pre-calculated stats from server
  const {
    totalBookings = 0,
    activeBookings = 0,
    checkedInGuests = 0,
    pendingCheckouts = 0
  } = stats;

  return (
    <StatsGrid>
      <StatsCard
        title="Total Bookings"
        value={totalBookings}
        icon={<MdBookOnline size={20} />}
        theme="blue"
        subtitle="Registered reservations"
      />
      <StatsCard
        title="Active Bookings"
        value={activeBookings}
        icon={<MdMeetingRoom size={20} />}
        theme="emerald"
        subtitle="Confirmed & In-house"
      />
      <StatsCard
        title="Checked-In Guests"
        value={checkedInGuests}
        icon={<MdPeople size={20} />}
        theme="yellow"
        subtitle="Currently in house"
      />
      <StatsCard
        title="Pending Checkouts"
        value={pendingCheckouts}
        icon={<MdLogout size={20} />}
        theme="red"
        subtitle="Departures outstanding"
      />
    </StatsGrid>
  );
};

export default BookingStats;
