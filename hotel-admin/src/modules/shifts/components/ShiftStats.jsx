import React from 'react';
import { Clock, Users, Sun, Moon } from 'lucide-react';
import StatsCard from '../../../components/global/stats/StatsCard';
import StatsGrid from '../../../components/global/stats/StatsGrid';

const ShiftStats = ({ staff = [], shifts = [] }) => {
  // Calculate dynamic stats
  const totalShifts = shifts.length;
  const totalScheduled = staff.filter(m => m.shiftId).length;
  
  // Count morning shift employees (SHF-01)
  const morningCoverage = staff.filter(m => m.shiftId === 'SHF-01').length;
  
  // Count night shift employees (SHF-03)
  const nightCoverage = staff.filter(m => m.shiftId === 'SHF-03').length;

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
