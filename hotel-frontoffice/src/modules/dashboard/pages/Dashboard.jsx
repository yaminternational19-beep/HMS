import React from 'react';
import {
  dashboardStats,
  recentBookings,
  roomStatusOverview,
  liveAlerts,
  weeklyOccupancy
} from '../../../mockdata/dashboard.mock';
import StatsCard from '../../../components/global/stats/StatsCard';
import StatsGrid from '../../../components/global/stats/StatsGrid';
import {
  MdBookOnline,
  MdMeetingRoom,
  MdTrendingUp,
  MdAttachMoney,
  MdLogin,
  MdLogout,
  MdPeople,
  MdWarning,
  MdInfo,
  MdErrorOutline
} from 'react-icons/md';
import '../styles/dashboard.css';

const getStatusClass = (status) => {
  if (status === 'Checked In') return 'status-badge-checkedin';
  if (status === 'Pending') return 'status-badge-pending';
  return 'status-badge-confirmed';
};

const getAlertIcon = (type) => {
  switch (type) {
    case 'warning':
      return <MdWarning size={18} className="text-yellow-600 animate-pulse" />;
    case 'danger':
      return <MdErrorOutline size={18} className="text-red-600 animate-bounce" />;
    case 'info':
    default:
      return <MdInfo size={18} className="text-blue-600" />;
  }
};

const getAlertBgClass = (type) => {
  switch (type) {
    case 'warning':
      return 'alert-card-warning';
    case 'danger':
      return 'alert-card-danger';
    case 'info':
    default:
      return 'alert-card-info';
  }
};

const Dashboard = () => {
  return (
    <div className="dashboard-page-container animate-fade-in">
      
      {/* Header */}
      <div className="flex justify-between items-center w-full px-1 py-2">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Dashboard Overview</h1>
          <p className="text-sm text-text-muted mt-1">Welcome back! Here is what's happening at SNOWLINE BLOOM today.</p>
        </div>
      </div>

        {/* Stats Cards Section - Reusable Global Stats Components */}
        <StatsGrid className="mb-8">
          <StatsCard
            title="Total Bookings"
            value={dashboardStats.totalBookings}
            icon={<MdBookOnline size={20} />}
            trend="+12%"
            subtitle="from last week"
            theme="indigo"
          />
          <StatsCard
            title="Available Rooms"
            value={dashboardStats.availableRooms}
            icon={<MdMeetingRoom size={20} />}
            subtitle="out of 170 total"
            theme="emerald"
          />
          <StatsCard
            title="Occupancy Rate"
            value={`${dashboardStats.occupancyRate}%`}
            icon={<MdTrendingUp size={20} />}
            trend="+5%"
            subtitle="vs. average occupancy"
            theme="blue"
          />
          <StatsCard
            title="Today's Revenue"
            value={`₹${dashboardStats.revenue.toLocaleString()}`}
            icon={<MdAttachMoney size={20} />}
            trend="+8%"
            subtitle="since yesterday"
            theme="amber"
          />
          <StatsCard
            title="Today's Check-ins"
            value={dashboardStats.checkInsToday}
            icon={<MdLogin size={20} />}
            subtitle="guests arriving today"
            theme="emerald"
          />
          <StatsCard
            title="Today's Check-outs"
            value={dashboardStats.checkOutsToday}
            icon={<MdLogout size={20} />}
            subtitle="guests departing today"
            theme="red"
          />
          <StatsCard
            title="Active Guests"
            value={dashboardStats.activeGuests}
            icon={<MdPeople size={20} />}
            subtitle="currently in-house"
            theme="blue"
          />
          <StatsCard
            title="Avg. Room Rate"
            value={`₹${dashboardStats.avgRoomRate}`}
            icon={<MdAttachMoney size={20} />}
            trend="+3%"
            subtitle="vs. average rate"
            theme="purple"
          />
        </StatsGrid>

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 laptop:grid-cols-3 gap-8">
          
          {/* Column 1 & 2: Recent Bookings & Weekly Occupancy */}
          <div className="laptop:col-span-2 space-y-8">
            
            {/* Weekly Occupancy CSS Bar Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-text-main mb-6">Weekly Occupancy Rate</h2>
              <div className="flex items-end justify-between h-48 pt-4 px-2">
                {weeklyOccupancy.map((data, idx) => (
                  <div key={idx} className="flex flex-col items-center flex-1 group">
                    {/* Tooltip */}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white text-xs px-2 py-1 rounded mb-2 absolute -translate-y-12 font-semibold">
                      {data.rate}%
                    </span>
                    {/* Bar */}
                    <div 
                      className="w-8 tablet:w-12 chart-bar"
                      style={{ height: `${data.rate}%` }}
                    />
                    <span className="text-xs text-text-muted mt-3 font-medium">{data.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Bookings Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-text-main mb-6">Recent Bookings</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-text-muted">
                      <th className="pb-3 font-semibold">Booking ID</th>
                      <th className="pb-3 font-semibold">Guest Name</th>
                      <th className="pb-3 font-semibold">Room Type</th>
                      <th className="pb-3 font-semibold">Check In</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="py-4 text-primary font-medium">{booking.id}</td>
                        <td className="py-4 font-semibold text-text-main">{booking.guestName}</td>
                        <td className="py-4 text-text-muted">{booking.roomType}</td>
                        <td className="py-4 text-text-muted">{booking.checkIn}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Column 3: Room Status & Live Alerts */}
          <div className="space-y-8">
            
            {/* Room Status Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-text-main mb-6">Room Status Overview</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <span className="font-semibold text-slate-700">Occupied</span>
                  <span className="font-bold text-primary px-3 py-1 bg-primary/10 rounded-lg text-sm">
                    {roomStatusOverview.occupied}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <span className="font-semibold text-slate-700">Available</span>
                  <span className="font-bold text-green-600 px-3 py-1 bg-green-50 rounded-lg text-sm">
                    {roomStatusOverview.available}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <span className="font-semibold text-slate-700">Maintenance</span>
                  <span className="font-bold text-red-600 px-3 py-1 bg-red-50 rounded-lg text-sm">
                    {roomStatusOverview.maintenance}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <span className="font-semibold text-slate-700">Cleaning</span>
                  <span className="font-bold text-blue-600 px-3 py-1 bg-blue-50 rounded-lg text-sm">
                    {roomStatusOverview.cleaning}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Alerts Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-text-main mb-6">Live Alerts</h2>
              <div className="space-y-4">
                {liveAlerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`flex gap-3 p-4 border rounded-xl items-start alert-card ${getAlertBgClass(alert.type)}`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-text-main leading-tight">{alert.message}</p>
                      <span className="text-xs text-text-muted block font-medium">{alert.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

    </div>
  );
};

export default Dashboard;
