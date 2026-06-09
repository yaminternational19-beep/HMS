import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../../api/booking';
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
  if (status === 'Checked In' || status === 'Checked-In') return 'status-badge-checkedin';
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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getDashboardStats();
        if (isMounted) {
          if (response && response.success && response.data) {
            setData(response.data);
          } else {
            setError(response?.message || 'Failed to fetch dashboard data.');
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        if (isMounted) {
          setError(err.message || 'An error occurred while loading dashboard statistics.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 animate-ping absolute"></div>
          <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-primary animate-spin absolute"></div>
        </div>
        <p className="mt-6 text-sm font-semibold text-slate-600 animate-pulse">
          Loading dashboard metrics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-red-50/50 rounded-2xl border border-red-100 max-w-lg mx-auto my-12 animate-fade-in">
        <MdErrorOutline className="text-red-500 mb-4 animate-bounce" size={48} />
        <h3 className="text-lg font-bold text-red-900 mb-2">Failed to load Dashboard</h3>
        <p className="text-sm text-red-600 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentBookings = data?.recentBookings || [];
  const roomStatusOverview = data?.roomStatusOverview || {};
  const liveAlerts = data?.liveAlerts || [];
  const weeklyOccupancy = data?.weeklyOccupancy || [];

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
          value={stats.totalBookings ?? 0}
          icon={<MdBookOnline size={20} />}
          trend="+12%"
          subtitle="from last week"
          theme="indigo"
        />
        <StatsCard
          title="Available Rooms"
          value={stats.availableRooms ?? 0}
          icon={<MdMeetingRoom size={20} />}
          subtitle="out of 170 total"
          theme="emerald"
        />
        <StatsCard
          title="Occupancy Rate"
          value={`${stats.occupancyRate ?? 0}%`}
          icon={<MdTrendingUp size={20} />}
          trend="+5%"
          subtitle="vs. average occupancy"
          theme="blue"
        />
        <StatsCard
          title="Total Revenue"
          value={`₹${(stats.revenue ?? 0).toLocaleString()}`}
          icon={<MdAttachMoney size={20} />}
          trend="+8%"
          subtitle="since yesterday"
          theme="amber"
        />
        <StatsCard
          title="Today's Check-ins"
          value={stats.checkInsToday ?? 0}
          icon={<MdLogin size={20} />}
          subtitle="guests arriving today"
          theme="emerald"
        />
        <StatsCard
          title="Today's Check-outs"
          value={stats.checkOutsToday ?? 0}
          icon={<MdLogout size={20} />}
          subtitle="guests departing today"
          theme="red"
        />
        <StatsCard
          title="Active Guests"
          value={stats.activeGuests ?? 0}
          icon={<MdPeople size={20} />}
          subtitle="currently in-house"
          theme="blue"
        />
        <StatsCard
          title="Avg. Room Rate"
          value={`₹${stats.avgRoomRate ?? 0}`}
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
              {weeklyOccupancy.map((dataItem, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 group">
                  {/* Tooltip */}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white text-xs px-2 py-1 rounded mb-2 absolute -translate-y-12 font-semibold">
                    {dataItem.rate}%
                  </span>
                  {/* Bar */}
                  <div 
                    className="w-8 tablet:w-12 chart-bar"
                    style={{ height: `${dataItem.rate}%` }}
                  />
                  <span className="text-xs text-text-muted mt-3 font-medium">{dataItem.day}</span>
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
                  {recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-sm text-text-muted font-medium">
                        No recent bookings found.
                      </td>
                    </tr>
                  ) : (
                    recentBookings.map((booking) => (
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
                    ))
                  )}
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
                  {roomStatusOverview.occupied ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <span className="font-semibold text-slate-700">Available</span>
                <span className="font-bold text-green-600 px-3 py-1 bg-green-50 rounded-lg text-sm">
                  {roomStatusOverview.available ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <span className="font-semibold text-slate-700">Maintenance</span>
                <span className="font-bold text-red-600 px-3 py-1 bg-red-50 rounded-lg text-sm">
                  {roomStatusOverview.maintenance ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <span className="font-semibold text-slate-700">Cleaning</span>
                <span className="font-bold text-blue-600 px-3 py-1 bg-blue-50 rounded-lg text-sm">
                  {roomStatusOverview.cleaning ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Live Alerts Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-text-main mb-6">Live Alerts</h2>
            <div className="space-y-4">
              {liveAlerts.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-sm text-text-muted font-medium">
                  No active alerts at this time.
                </div>
              ) : (
                liveAlerts.map((alert) => (
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
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
