import React from 'react';
import './stats.css';

const StatsGrid = ({ children, className = '' }) => {
  return (
    <div className={`g-stats-grid ${className}`}>
      {children}
    </div>
  );
};

export default StatsGrid;
