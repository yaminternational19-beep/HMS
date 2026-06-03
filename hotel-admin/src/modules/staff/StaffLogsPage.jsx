import React, { useState, useEffect } from 'react';
import { getStaff, getStaffLogs } from '../../api/staff';
import Pagination from '../../components/Pagination';
import { 
  History, 
  User, 
  Calendar, 
  Activity, 
  LogOut as LogOutIcon, 
  LogIn as LogInIcon, 
  RotateCcw,
  BarChart2,
  CalendarRange
} from 'lucide-react';
import './styles/staff.css';

const StaffLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [dailySummaryData, setDailySummaryData] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chronological'); // chronological | dailySummary

  // Filter States
  const [selectedStaff, setSelectedStaff] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedPeriod, setSelectedPeriod] = useState('today'); // Defaults to 'today'

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState({ totalLogins: 0, totalLogouts: 0, totalActivities: 0 });
  const itemsPerPage = 10;

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

  // Fetch logs based on active filters, tab, and page from backend
  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = {
        tab: activeTab,
        page: currentPage,
        period: selectedPeriod,
        staffId: selectedStaff
      };
      
      // If selectedPeriod is 'all', query month/year filters from backend.
      if (selectedPeriod === 'all') {
        if (selectedMonth !== 'all') params.month = selectedMonth;
        if (selectedYear !== 'all') params.year = selectedYear;
      }

      const res = await getStaffLogs(params);
      if (res && res.success) {
        if (activeTab === 'chronological') {
          setLogs(res.data.logs || []);
        } else {
          setDailySummaryData(res.data.dailySummaries || []);
        }
        
        const pagination = res.data.pagination || {};
        setTotalItems(pagination.totalItems || 0);
        
        setStats(res.data.stats || { totalLogins: 0, totalLogouts: 0, totalActivities: 0 });
      }
    } catch (err) {
      console.error('Failed to load staff logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedStaff, selectedMonth, selectedYear, selectedPeriod, activeTab, currentPage]);

  // Reset page number on tab or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedPeriod, selectedStaff, selectedMonth, selectedYear]);

  const handleResetFilters = () => {
    setSelectedStaff('all');
    setSelectedMonth('all');
    setSelectedYear('2026');
    setSelectedPeriod('today');
    setCurrentPage(1);
  };

  const periods = [
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Next Day' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'Complete Data' }
  ];

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
      {/* 1. Header Section */}
      <div className="rooms-header-wrapper">
        <div className="rooms-header-info">
          <h2 className="rooms-header-title">Staff Activity Logs</h2>
          <p className="rooms-header-subtitle">Inspect login and logout sessions, track rosters, and review historical shifts for employees.</p>
        </div>

        <div className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold select-none shadow-sm flex items-center gap-1.5">
          <History size={14} className="text-slate-400" />
          <span>Active Logs</span>
        </div>
      </div>

      {/* 2. Stats Section (on top) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Card 1: Total Logins */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Total Logins</p>
            <h3 className="text-3xl font-extrabold text-slate-800">{stats.totalLogins}</h3>
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
            <h3 className="text-3xl font-extrabold text-slate-800">{stats.totalLogouts}</h3>
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
            <h3 className="text-3xl font-extrabold text-slate-800">{stats.totalActivities}</h3>
            <p className="text-[10px] text-slate-400 font-semibold">total events tracked</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-inner">
            <Activity size={24} />
          </div>
        </div>
      </div>

      {/* 3. Unified Workspace (Filters + Table + Pagination) */}
      <div className="booking-workspace-container border border-slate-200 rounded-2xl shadow-sm overflow-hidden bg-white">
        
        {/* Filters Toolbar */}
        <div className="staff-filters-container p-5 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Period Selector Dropdown */}
            <div className="flex flex-col gap-1 min-w-[180px]">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Timeframe / Period</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400">
                  <CalendarRange size={16} />
                </span>
                <select
                  value={selectedPeriod}
                  onChange={e => setSelectedPeriod(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none bg-white hover:border-slate-350 transition-all cursor-pointer shadow-sm"
                >
                  {periods.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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
            <div className={`flex flex-col gap-1 min-w-[150px] transition-opacity ${selectedPeriod !== 'all' ? 'opacity-40' : ''}`}>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Month</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400">
                  <Calendar size={16} />
                </span>
                <select
                  value={selectedPeriod === 'all' ? selectedMonth : 'all'}
                  disabled={selectedPeriod !== 'all'}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none bg-white hover:border-slate-350 transition-all cursor-pointer shadow-sm disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="all">All Months</option>
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Year Selector */}
            <div className={`flex flex-col gap-1 min-w-[120px] transition-opacity ${selectedPeriod !== 'all' ? 'opacity-40' : ''}`}>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Year</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400">
                  <Calendar size={16} />
                </span>
                <select
                  value={selectedPeriod === 'all' ? selectedYear : 'all'}
                  disabled={selectedPeriod !== 'all'}
                  onChange={e => setSelectedYear(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none bg-white hover:border-slate-350 transition-all cursor-pointer shadow-sm disabled:cursor-not-allowed disabled:bg-slate-50"
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

        {/* Tabs Menu inside the Workspace */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 px-5 gap-2">
          <button
            onClick={() => setActiveTab('chronological')}
            className={`py-3.5 px-4 text-xs font-extrabold border-b-2 uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'chronological' 
                ? 'border-slate-900 text-slate-900' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <History size={14} />
            <span>Chronological Log List</span>
          </button>

          <button
            onClick={() => setActiveTab('dailySummary')}
            className={`py-3.5 px-4 text-xs font-extrabold border-b-2 uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'dailySummary' 
                ? 'border-slate-900 text-slate-900' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <BarChart2 size={14} />
            <span>Daily Summary Grouping</span>
          </button>
        </div>

        {/* Data Display Table Area */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 font-medium italic">
            <div className="w-8 h-8 border-4 border-slate-350 border-t-transparent rounded-full animate-spin mb-4"></div>
            <span>Fetching employee logs from database...</span>
          </div>
        ) : activeTab === 'chronological' ? (
          /* CHRONOLOGICAL LOGS TABLE */
          <>
            <div className="table-container !shadow-none !border-none !rounded-none">
              <table className="table-element">
                <thead>
                  <tr>
                    <th>Staff ID</th>
                    <th>Staff Code</th>
                    <th>Staff Member</th>
                    <th>Role / Department</th>
                    <th>Shift Timings</th>
                    <th>Activity / Event</th>
                    <th>Date</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400 font-medium italic">
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

                        {/* Staff Code */}
                        <td className="text-xs font-semibold text-slate-600 font-mono">
                          {log.staffCode || 'N/A'}
                        </td>

                        {/* Staff Name */}
                        <td className="font-bold text-slate-800 text-xs">
                          {log.staffName}
                        </td>

                        {/* Role */}
                        <td className="text-xs text-slate-600 font-semibold">
                          {log.role}
                        </td>

                        {/* Shift Timings */}
                        <td className="text-xs text-slate-600 font-semibold">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700">{log.shiftName || 'Standard'}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{log.shiftTime || 'N/A'}</span>
                          </div>
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
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemName="logs"
              className="border-none rounded-none border-t border-slate-100 bg-white"
            />
          </>
        ) : (
          /* DAILY SUMMARY GROUPING TABLE */
          <>
            <div className="table-container !shadow-none !border-none !rounded-none">
              <table className="table-element">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Staff ID</th>
                    <th>Staff Code</th>
                    <th>Staff Member</th>
                    <th>Role / Department</th>
                    <th>Shift Timings</th>
                    <th className="text-center">Logins Count</th>
                    <th className="text-center">Logouts Count</th>
                  </tr>
                </thead>
                <tbody>
                  {dailySummaryData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400 font-medium italic">
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

                        {/* Staff Code */}
                        <td className="text-xs font-semibold text-slate-600 font-mono">
                          {sum.staffCode || 'N/A'}
                        </td>

                        {/* Staff Name */}
                        <td className="font-bold text-slate-800 text-xs">
                          {sum.staffName}
                        </td>

                        {/* Role */}
                        <td className="text-xs text-slate-600 font-semibold">
                          {sum.role}
                        </td>

                        {/* Shift Timings */}
                        <td className="text-xs text-slate-600 font-semibold">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700">{sum.shiftName || 'Standard'}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{sum.shiftTime || 'N/A'}</span>
                          </div>
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
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemName="daily summaries"
              className="border-none rounded-none border-t border-slate-100 bg-white"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default StaffLogsPage;
