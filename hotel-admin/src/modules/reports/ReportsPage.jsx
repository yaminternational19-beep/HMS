import React from 'react';
import { 
  Download, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Coins, 
  Users, 
  CalendarRange,
  ChevronRight
} from 'lucide-react';

const analyticsSummary = [
  { label: 'Room Revenue', value: '₹84,200', change: '+12.5%', icon: <Coins size={18} className="text-emerald-600" />, bg: 'bg-emerald-50' },
  { label: 'F&B Revenue', value: '₹32,150', change: '+8.3%', icon: <BarChart3 size={18} className="text-blue-600" />, bg: 'bg-blue-50' },
  { label: 'Occupancy Rate Avg', value: '78.4%', change: '+4.1%', icon: <TrendingUp size={18} className="text-amber-600" />, bg: 'bg-amber-50' },
  { label: 'Guest Feedback Score', value: '4.8 / 5.0', change: '+2.1%', icon: <PieChart size={18} className="text-purple-600" />, bg: 'bg-purple-50' },
];

const reportsList = [
  { title: 'Monthly Occupancy & ADR Analysis', date: 'May 2026', size: '2.4 MB', format: 'PDF Report' },
  { title: 'Q1 Financial Summary & Audits', date: 'Quarter 1 2026', size: '4.8 MB', format: 'Excel Sheet' },
  { title: 'Housekeeping Efficiency & Room Turn Times', date: 'May 10 - May 17', size: '1.1 MB', format: 'PDF Report' },
  { title: 'Corporate Guest Activity Ledger', date: 'May 2026', size: '3.6 MB', format: 'CSV Ledger' },
];

const ReportsPage = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col tablet:flex-row tablet:items-center tablet:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-800">Enterprise Reports & Analytics</h2>
          <p className="text-xs text-slate-400">Review occupancy trends, evaluate department efficiency, audit invoice ledgers, and download financial statements.</p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-amber-700 transition-all cursor-pointer shadow-md shadow-accent/15">
          <Download size={14} />
          <span>Export All Data</span>
        </button>
      </div>

      {/* Analytics Summary Row */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsSummary.map((summary, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{summary.label}</span>
              <p className="text-xl font-extrabold text-slate-800">{summary.value}</p>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                <span>{summary.change}</span>
                <span>YoY</span>
              </div>
            </div>

            <div className={`h-12 w-12 rounded-xl flex items-center justify-center border border-slate-100 ${summary.bg}`}>
              {summary.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Main Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Dynamic Analytics Visual Chart Placeholders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-6">
          <h3 className="text-base font-bold text-slate-800">Operational Performance Highlights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Occupancy Card Graphic */}
            <div className="border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wide">
                <span>Occupancy Trend YTD</span>
                <span className="text-accent">78.4% Average</span>
              </div>
              
              {/* Custom micro-bar graphic */}
              <div className="flex items-end justify-between h-32 pt-4">
                {[45, 60, 55, 70, 85, 78, 90, 80].map((h, i) => (
                  <div key={i} className="w-6 bg-slate-100 rounded-md h-full relative group">
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-accent group-hover:bg-amber-600 rounded-md transition-all duration-300"
                      style={{ height: `${h}%` }}
                    ></div>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[8px] font-bold px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {h}%
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-100">
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
              </div>
            </div>

            {/* Department Spending Card Graphic */}
            <div className="border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wide">
                <span>Expenditures by Dept</span>
                <span className="text-slate-700">₹45,180.00 Total</span>
              </div>
              
              {/* List distribution chart */}
              <div className="space-y-3.5 pt-2">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>Rooms Maintenance</span>
                    <span>35%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>F&B Provisions</span>
                    <span>28%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>Housekeeping Essentials</span>
                    <span>22%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '22%' }}></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Statements and Documents Downloads Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-800">Printable Financial Records</h3>
          
          <div className="space-y-3.5">
            {reportsList.map((rep, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[160px]">{rep.title}</h4>
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>{rep.date}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                    <span>{rep.size}</span>
                  </div>
                </div>

                <button className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:bg-accent hover:text-white hover:border-accent flex items-center justify-center cursor-pointer transition-all">
                  <Download size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default ReportsPage;
