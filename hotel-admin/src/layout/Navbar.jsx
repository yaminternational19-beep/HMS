import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Settings, Globe, ShieldCheck } from 'lucide-react';

const routeTitleMap = {
  '/': 'Admin Dashboard Overview',
  '/bookings': 'Reservation Records',
  '/rooms': 'Rooms & Property Inventory',
  '/staff': 'Workforce & Shift Roster',
  '/reports': 'Enterprise Systems Analytics',
};

const Navbar = () => {
  const location = useLocation();
  const currentTitle = routeTitleMap[location.pathname] || 'SNOWLINE BLOOM Administration';

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-sm z-20">
      {/* Page Title & Context */}
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">
          {currentTitle}
        </h1>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400 font-medium">
          <ShieldCheck size={14} className="text-accent" />
          <span>HMS Secure Core</span>
          <span className="h-1 w-1 rounded-full bg-slate-300"></span>
          <span>Role: Super Admin</span>
        </div>
      </div>

      {/* Action Panels */}
      <div className="flex items-center gap-6">
        {/* Mock Search Box */}
        {/* <div className="relative hidden tablet:block w-64">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search records, rooms, staff..."
            className="w-full text-sm bg-slate-50 text-slate-800 placeholder-slate-400 pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:bg-white focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all"
          />
        </div> */}

        
        

        {/* Divider */}
        {/* <div className="h-8 w-px bg-slate-200 hidden tablet:block"></div> */}
        
        {/* Global Action Icons */}
        <div className="flex items-center gap-3">
          

          {/* Settings button */}
          <button className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 cursor-pointer">
            <Settings size={18} />
          </button>

          {/* Notifications Notification */}
          <button className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all relative border border-transparent hover:border-slate-200 cursor-pointer">
            <Bell size={18} />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>
          </button>


          {/* Quick link button to Front Office */}
          <a
            href="https://hms-frontoffice.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl text-slate-500 hover:text-accent hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 cursor-pointer hidden laptop:flex items-center gap-1.5 text-xs font-semibold"
            title="Launch Front Office App"
          >
            <Globe size={16} />
            <span>Launch Front Office</span>
          </a>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
