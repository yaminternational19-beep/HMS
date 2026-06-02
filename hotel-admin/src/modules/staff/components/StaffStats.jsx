import React from 'react';
import { Users, UserCheck, UserMinus, Shield } from 'lucide-react';
import StatsCard from '../../../components/global/stats/StatsCard';
import StatsGrid from '../../../components/global/stats/StatsGrid';

const StaffStats = ({ stats, data = [] }) => {
  // Calculate dynamic statistics (fallback to robust case-insensitive matching if backend stats not present yet)
  const total = stats ? stats.total : data.length;
  const activeDuty = stats ? stats.activeDuty : data.filter(m => m.isCheckedIn).length;
  const onLeave = stats ? stats.onLeave : data.filter(m => m.status === 'on-leave').length;
  const frontOffice = stats ? stats.frontOffice : data.filter(m => 
    m.dept && (
      m.dept.toLowerCase().includes('front') || 
      m.dept.toLowerCase().includes('concierge') || 
      m.dept.toLowerCase().includes('office')
    )
  ).length;

  return (
    <StatsGrid>
      <StatsCard
        title="Total Roster"
        value={total}
        icon={<Users size={20} />}
        theme="blue"
        subtitle="Onboarded employee profiles"
      />
      <StatsCard
        title="Active On-Duty"
        value={activeDuty}
        icon={<UserCheck size={20} />}
        theme="emerald"
        subtitle="Currently checked-in"
      />
      <StatsCard
        title="On Leave"
        value={onLeave}
        icon={<UserMinus size={20} />}
        theme="red"
        subtitle="Vacations outstanding"
      />
      <StatsCard
        title="Front-Office Clearance"
        value={frontOffice}
        icon={<Shield size={20} />}
        theme="yellow"
        subtitle="Active front desk agents"
      />
    </StatsGrid>
  );
};

export default StaffStats;
