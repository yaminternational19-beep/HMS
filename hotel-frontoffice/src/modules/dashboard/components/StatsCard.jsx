import React from 'react';
import StatsCardGlobal from '../../../components/global/stats/StatsCard';

const StatsCard = ({ title, value, icon, description, trend, trendColor }) => {
  const trendDir = trendColor?.includes('red') ? 'down' : trendColor?.includes('green') ? 'up' : 'neutral';
  return (
    <StatsCardGlobal
      title={title}
      value={value}
      icon={icon}
      subtitle={description}
      trend={trend}
      trendDirection={trendDir}
      theme="indigo"
    />
  );
};

export default StatsCard;

