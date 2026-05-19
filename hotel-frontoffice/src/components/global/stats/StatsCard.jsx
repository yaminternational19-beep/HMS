import React from 'react';
import './stats.css';

const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendDirection = 'up', // 'up' | 'down' | 'neutral'
  theme = 'indigo', // 'indigo' | 'emerald' | 'amber' | 'red' | 'blue' | 'yellow' | 'purple' | 'slate'
}) => {
  const getThemeClass = (t) => {
    switch (t) {
      case 'emerald': return 'g-stat-theme-emerald';
      case 'amber': return 'g-stat-theme-amber';
      case 'red': return 'g-stat-theme-red';
      case 'blue': return 'g-stat-theme-blue';
      case 'yellow': return 'g-stat-theme-yellow';
      case 'purple': return 'g-stat-theme-purple';
      case 'slate': return 'g-stat-theme-slate';
      case 'indigo':
      default:
        return 'g-stat-theme-indigo';
    }
  };

  const getTrendColorClass = () => {
    if (trendDirection === 'up') return 'g-stat-trend-up';
    if (trendDirection === 'down') return 'g-stat-trend-down';
    return 'g-stat-trend-neutral';
  };

  return (
    <div className="g-stat-card">
      <div className="g-stat-card-main">
        <div className="g-stat-card-details">
          <h3 className="g-stat-title">{title}</h3>
          <p className="g-stat-value">{value}</p>
        </div>
        {icon && (
          <div className={`g-stat-icon-wrapper ${getThemeClass(theme)}`}>
            {icon}
          </div>
        )}
      </div>
      {(trend || subtitle) && (
        <div className="g-stat-footer">
          {trend && (
            <span className={`g-stat-trend ${getTrendColorClass()}`}>
              {trend}
            </span>
          )}
          {subtitle && <span className="g-stat-subtitle">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
