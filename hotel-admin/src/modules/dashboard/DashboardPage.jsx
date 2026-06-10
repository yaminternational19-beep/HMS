import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Bed, 
  DollarSign, 
  Users, 
  ArrowUpRight, 
  Clock, 
  Percent, 
  Award,
  BellRing
} from 'lucide-react';
import { getSuperadminDashboard } from '../../api/dashboard';

const getIconForType = (type) => {
  switch(type) {
    case 'revenue': return <DollarSign size={20} className="text-emerald-600" />;
    case 'occupancy': return <Percent size={20} className="text-blue-600" />;
    case 'bookings': return <Bed size={20} className="text-amber-600" />;
    case 'staff': return <Users size={20} className="text-purple-600" />;
    default: return <Award size={20} className="text-slate-600" />;
  }
};

const getBgForType = (type) => {
  switch(type) {
    case 'revenue': return 'bg-emerald-50 border-emerald-100';
    case 'occupancy': return 'bg-blue-50 border-blue-100';
    case 'bookings': return 'bg-amber-50 border-amber-100';
    case 'staff': return 'bg-purple-50 border-purple-100';
    default: return 'bg-slate-50 border-slate-100';
  }
};

const DashboardPage = () => {
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [urgentAlerts, setUrgentAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const res = await getSuperadminDashboard();
        if (res && res.status === 'success') {
          setStats(res.data.stats);
          setRecentActivity(res.data.recentActivity);
          setUrgentAlerts(res.data.urgentAlerts);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading Dashboard Core...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Banner section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 p-8 shadow-xl border border-slate-800">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl"></div>
        <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-xs font-semibold text-accent uppercase tracking-wider">
              <Award size={12} />
              <span>Operations Active</span>
            </div>
            <h2 className="text-2xl tablet:text-3xl font-extrabold text-white tracking-tight">
              Welcome back to Admin Core, Praveen
            </h2>
            <p className="text-sm text-slate-400 max-w-xl">
              Systems are running optimally. You have {urgentAlerts.length} urgent alerts scheduled for today.
            </p>
          </div>
          
          <button className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-amber-700 active:scale-95 transition-all shadow-lg shadow-accent/20 cursor-pointer w-fit">
            <span>View Shift Roster</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* Grid Statistics Row */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
              <div className={`p-2.5 rounded-xl border ${getBgForType(stat.type)}`}>
                {getIconForType(stat.type)}
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-extrabold text-slate-800 tracking-tight">{stat.value}</span>
              <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-slate-500">
                {stat.trend === 'up' && <TrendingUp size={12} className="text-emerald-500 shrink-0" />}
                <span className={stat.trend === 'up' ? "text-emerald-600" : "text-slate-500"}>
                  {stat.change.split(' ')[0]}
                </span>
                <span className="text-slate-400 font-medium">{stat.change.substring(stat.change.indexOf(' '))}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Core Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Recent Transactions Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">High-Value Transactions</h3>
              <p className="text-xs text-slate-400">Monitoring real-time payments across administrative outlets.</p>
            </div>
            <button className="text-xs font-bold text-accent hover:underline hover:text-amber-700 transition-colors">
              View All Invoices
            </button>
          </div>

          <div className="table-container">
            <table className="table-element">
              <thead>
                <tr>
                  <th>Guest / Payer</th>
                  <th>Room Assigned</th>
                  <th>Transaction ID</th>
                  <th>Amount</th>
                  <th>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-slate-500 py-4">No recent transactions.</td>
                  </tr>
                ) : (
                  recentActivity.map((act) => (
                    <tr key={act.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {act.guest ? act.guest.split(' ').map(n=>n[0]).join('').substring(0,2) : '?'}
                          </div>
                          <span className="font-semibold text-slate-800 text-sm">{act.guest || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="text-slate-500 text-sm">{act.room}</td>
                      <td className="text-slate-400 text-xs font-mono font-medium">{act.id}</td>
                      <td className="font-bold text-slate-800 text-sm">{act.amount}</td>
                      <td>
                        <span className={`status-tag status-tag-${act.status}`}>
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Maintenance Alerts & Task Panel */}
        <div className="space-y-6">
          
          {/* Real-time Alerts Shell */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing size={18} className="text-accent" />
                <h3 className="text-base font-bold text-slate-800">Critical Notifications</h3>
              </div>
              <span className="h-5 px-2 rounded-full bg-red-100 text-red-700 text-[10px] font-bold flex items-center justify-center">
                {urgentAlerts.length} Pending
              </span>
            </div>

            <div className="space-y-4">
              {urgentAlerts.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-2">No urgent alerts.</div>
              ) : (
                urgentAlerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div className="mt-0.5 shrink-0">
                      <span className={`h-2.5 w-2.5 rounded-full block ${
                        alert.type === 'critical' ? 'bg-red-500' : alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}></span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800 leading-tight">{alert.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">{alert.desc}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 font-semibold">
                        <Clock size={10} />
                        <span>{alert.time}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800">Enterprise Resources</h3>
            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>HK Task Completion</span>
                  <span>92%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>Room Allocation Capacity</span>
                  <span>78%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DashboardPage;
