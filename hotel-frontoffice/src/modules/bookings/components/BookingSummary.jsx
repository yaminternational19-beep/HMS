import React from 'react';
import { MdTrendingUp } from 'react-icons/md';

const BookingSummary = ({ data = [], stats = {} }) => {
  // Compute counts dynamically or use backend pre-calculated stats
  const arrivals = stats.arrivals !== undefined ? stats.arrivals : data.filter(b => b.checkIn === '2026-05-18' && b.status !== 'Cancelled').length;
  const departures = stats.departures !== undefined ? stats.departures : data.filter(b => b.checkOut === '2026-05-18' && b.status !== 'Cancelled').length;
  const reserved = stats.reserved !== undefined ? stats.reserved : data.filter(b => b.status === 'Confirmed').length;

  const cards = [
    { title: "Arrivals", count: arrivals, unit: 'guests expected', badge: 'Active', note: 'Direct bookings', trend: '90% check-in rate' },
    { title: "Departures", count: departures, unit: 'rooms leaving', badge: 'Active', note: 'Scheduled checkouts', trend: 'Smooth transition' },
    { title: "Reserved Rooms", count: reserved, unit: 'rooms booked', badge: 'Active', note: 'Future occupancy', trend: '+12% this week' }
  ];

  return (
    <div className="grid grid-cols-1 tablet:grid-cols-3 gap-6 w-full">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-text-main">{card.title}</h4>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-accent/10 text-accent uppercase">
              {card.badge}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-text-main">{card.count}</span>
            <span className="text-xs text-text-muted">{card.unit}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-text-muted border-t border-slate-100 pt-2.5 mt-1 border-dashed">
            <span>{card.note}</span>
            <span className="flex items-center gap-0.5 text-emerald-600 font-semibold">
              <MdTrendingUp size={14} />
              {card.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookingSummary;
