import React from 'react';
import { Clock, Users, Sun, Moon } from 'lucide-react';
import StatsCard from '../../../components/global/stats/StatsCard';
import StatsGrid from '../../../components/global/stats/StatsGrid';

const ShiftStats = ({ stats = {} }) => {
  // Read dynamic stats aggregated by the backend Django app
  const totalShifts = stats.totalShifts || 0;
  const totalScheduled = stats.totalScheduled || 0;
  const morningCoverage = stats.morningCoverage || 0;
  const nightCoverage = stats.nightCoverage || 0;

  return (
    <StatsGrid>
      <StatsCard
        title="Active Shift Schedules"
        value={totalShifts}
        icon={<Clock size={20} />}
        theme="blue"
        subtitle="Configured duty timetables"
      />
      <StatsCard
        title="Scheduled Employees"
        value={totalScheduled}
        icon={<Users size={20} />}
        theme="emerald"
        subtitle="Staff assigned to shifts"
      />
      <StatsCard
        title="Morning Shift Coverage"
        value={morningCoverage}
        icon={<Sun size={20} />}
        theme="yellow"
        subtitle="Staff on early duty"
      />
      <StatsCard
        title="Night Shift Coverage"
        value={nightCoverage}
        icon={<Moon size={20} />}
        theme="purple"
        subtitle="Staff on overnight duty"
      />
    </StatsGrid>
  );
};

export default ShiftStats;
