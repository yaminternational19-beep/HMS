import React, { useState, useEffect } from 'react';
import { getStaff, getStaffLogs } from '../../api/staff';
import { 
  History, 
  User, 
  Calendar, 
  Activity, 
  LogOut as LogOutIcon, 
  LogIn as LogInIcon, 
  RotateCcw,
  BarChart2
} from 'lucide-react';
import './styles/staff.css';

const StaffLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chronological'); // chronological | dailySummary

  // Filter States
  const [selectedStaff, setSelectedStaff] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Load staff list for dropdown filter
  useEffect(() => {
    const fetchStaffList = async () => {
      try {
        const res = await getStaff();
        if (res && res.success) {
          setStaffList(res.data.staff || []);
        }
      } catch (err) {
        console.error('Failed to load staff list for filter', err);
      }
    };
    fetchStaffList();
  }, []);

  // Fetch logs based on active filters
  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (selectedStaff !== 'all') params.staffId = selectedStaff;
      if (selectedMonth !== 'all') params.month = selectedMonth;
      if (selectedYear !== 'all') params.year = selectedYear;

      const res = await getStaffLogs(params);
      if (res && res.success) {
        setLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load staff logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedStaff, selectedMonth, selectedYear]);

  const handleResetFilters = () => {
    setSelectedStaff('all');
    setSelectedMonth('all');
    setSelectedYear('2026');
  };

  // Group logs for the "Daily Summary" aggregation view
  // Groups by: YYYY-MM-DD + staffId
  const getDailySummary = () => {
    const summaryMap = {};

    logs.forEach(log => {
      const key = `${log.date}_${log.staffId}`;
      if (!summaryMap[key]) {
        summaryMap[key] = {
          date: log.date,
          staffId: log.staffId,
          staffName: log.staffName,
          role: log.role,
          logins: 0,
          logouts: 0
        };
      }

      if (log.action === 'login') {
        summaryMap[key].logins += 1;
      } else if (log.action === 'logout') {
        summaryMap[key].logouts += 1;
      }
    });

    // Sort by Date descending, then Staff ID
    return Object.values(summaryMap).sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return a.staffId.localeCompare(b.staffId, undefined, { numeric: true });
    });
  };

  const dailySummaryData = getDailySummary();

  // Calculate high-level stats from logs
  const totalLogins = logs.filter(l => l.action === 'login').length;
  const totalLogouts = logs.filter(l => l.action === 'logout').length;

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const years = ['2026', '2027', '2028', '2025'];

  return (
    <div className="rooms-page-container">
      {/* Filters Toolbar */}
      <div className="staff-filters-container !rounded-2xl shadow-sm border border-slate-200 mb-6 p-5">
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Staff Selector */}
          <div className="flex flex-col gap-1 min-w-[200px]">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Staff Member</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400">
                <User size={16} />
              </span>
              <select
                value={selectedStaff}
                onChange={e => setSelectedStaff(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none bg-white hover:border-slate-350 transition-all cursor-pointer shadow-sm"
              >
                <option value="all">All Staff Members</option>
                {staffList.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Month Selector */}
          <div className="flex flex-col gap-1 min-w-[150px]">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Month</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400">
                <Calendar size={16} />
              </span>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none bg-white hover:border-slate-350 transition-all cursor-pointer shadow-sm"
              >
                <option value="all">All Months</option>
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Year Selector */}
          <div className="flex flex-col gap-1 min-w-[120px]">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Year</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400">
                <Calendar size={16} />
              </span>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none bg-white hover:border-slate-350 transition-all cursor-pointer shadow-sm"
              >
                <option value="all">All Years</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-end h-full pt-5 ml-auto">
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 cursor-pointer transition-all active:scale-[0.98] shadow-sm"
              title="Reset Filters"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>

        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Total Logins */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Total Logins</p>
            <h3 className="text-3xl font-extrabold text-slate-800">{totalLogins}</h3>
            <p className="text-[10px] text-slate-400 font-semibold">recorded sessions</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-inner">
            <LogInIcon size={24} />
          </div>
        </div>

        {/* Card 2: Total Logouts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Total Logouts</p>
            <h3 className="text-3xl font-extrabold text-slate-800">{totalLogouts}</h3>
            <p className="text-[10px] text-slate-400 font-semibold">recorded exits</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-inner">
            <LogOutIcon size={24} />
          </div>
        </div>

        {/* Card 3: Total Logs Count */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Total Activities</p>
            <h3 className="text-3xl font-extrabold text-slate-800">{logs.length}</h3>
            <p className="text-[10px] text-slate-400 font-semibold">total events tracked</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-inner">
            <Activity size={24} />
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('chronological')}
          className={`pb-3.5 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'chronological' 
              ? 'border-primary text-primary font-extrabold' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <History size={16} />
          <span>Chronological Log List</span>
        </button>

        <button
          onClick={() => setActiveTab('dailySummary')}
          className={`pb-3.5 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'dailySummary' 
              ? 'border-primary text-primary font-extrabold' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <BarChart2 size={16} />
          <span>Daily Summary Grouping</span>
        </button>
      </div>

      {/* Data Workspace */}
      <div className="booking-workspace-container !p-0 border border-slate-200 rounded-2xl shadow-sm overflow-hidden bg-white">
        {isLoading ? (
          <div className="text-center py-20 text-slate-400 font-medium italic">
            Fetching employee logs from database...
          </div>
        ) : activeTab === 'chronological' ? (
          /* CHRONOLOGICAL LOGS TABLE */
          <div className="table-container !shadow-none !border-none !rounded-none">
            <table className="table-element">
              <thead>
                <tr>
                  <th>Staff ID</th>
                  <th>Staff Member</th>
                  <th>Role / Department</th>
                  <th>Activity / Event</th>
                  <th>Date</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 font-medium italic">
                      No staff logs found for the selected period.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      {/* ID Badge */}
                      <td>
                        <span className="inline-block px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                          {log.staffId}
                        </span>
                      </td>

                      {/* Staff Name */}
                      <td className="font-bold text-slate-800 text-xs">
                        {log.staffName}
                      </td>

                      {/* Role */}
                      <td className="text-xs text-slate-600 font-semibold">
                        {log.role}
                      </td>

                      {/* Event badge */}
                      <td>
                        {log.action === 'login' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 font-mono">
                            <LogInIcon size={10} />
                            <span>LOGIN</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-rose-50 text-rose-600 border border-rose-100 font-mono">
                            <LogOutIcon size={10} />
                            <span>LOGOUT</span>
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="text-xs text-slate-500 font-semibold">
                        {new Date(log.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>

                      {/* Time */}
                      <td className="text-xs text-slate-500 font-mono font-semibold">
                        {log.time}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* DAILY SUMMARY GROUPING TABLE */
          <div className="table-container !shadow-none !border-none !rounded-none">
            <table className="table-element">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Staff ID</th>
                  <th>Staff Member</th>
                  <th>Role / Department</th>
                  <th className="text-center">Logins Count</th>
                  <th className="text-center">Logouts Count</th>
                </tr>
              </thead>
              <tbody>
                {dailySummaryData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 font-medium italic">
                      No aggregate daily summaries found.
                    </td>
                  </tr>
                ) : (
                  dailySummaryData.map((sum, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      {/* Date */}
                      <td className="text-xs text-slate-800 font-bold">
                        {new Date(sum.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>

                      {/* Staff ID */}
                      <td>
                        <span className="inline-block px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                          {sum.staffId}
                        </span>
                      </td>

                      {/* Staff Name */}
                      <td className="font-bold text-slate-800 text-xs">
                        {sum.staffName}
                      </td>

                      {/* Role */}
                      <td className="text-xs text-slate-600 font-semibold">
                        {sum.role}
                      </td>

                      {/* Logins count */}
                      <td className="text-center">
                        <span className="inline-block px-3 py-1 font-bold font-mono text-xs rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {sum.logins}
                        </span>
                      </td>

                      {/* Logouts count */}
                      <td className="text-center">
                        <span className="inline-block px-3 py-1 font-bold font-mono text-xs rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
                          {sum.logouts}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffLogsPage;
