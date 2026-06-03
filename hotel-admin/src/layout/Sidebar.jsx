import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getCookie, deleteCookie } from '../api/cookieHelper';
import {
  LayoutDashboard,
  Bed,
  Users,
  CalendarRange,
  Clock,
  BarChart3,
  LogOut,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  Activity
} from 'lucide-react';

const navLinks = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
  { label: 'Rooms Management', path: '/rooms', icon: <Bed size={20} /> },
  { label: 'Shift Management', path: '/shifts', icon: <Clock size={20} /> },
  { label: 'Staff Management', path: '/staff', icon: <Users size={20} /> },
  { label: 'Staff Logs', path: '/staff-logs', icon: <Activity size={20} /> },
  { label: 'Bookings', path: '/bookings', icon: <CalendarRange size={20} /> },
  { label: 'Reports & Stats', path: '/reports', icon: <BarChart3 size={20} /> },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    deleteCookie('adminToken');
    deleteCookie('adminUserEmail');
    navigate('/login');
  };

  const userEmail = getCookie('adminUserEmail') || 'praveen.reddy@blackcube.ae';
  const userInitials = userEmail.split('@')[0].substring(0, 2).toUpperCase();

  return (
    <aside
      className={`
        flex flex-col bg-primary text-white h-screen transition-all duration-300 z-30 shadow-2xl border-r border-slate-800 shrink-0
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <ShieldAlert size={24} className="text-accent animate-pulse" />
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-wide leading-none">SNOWLINE BLOOM Admin</span>
              <span className="text-[10px] text-accent/80 tracking-widest font-semibold mt-0.5 uppercase">Enterprise</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center w-full">
            <ShieldAlert size={24} className="text-accent" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors ml-auto text-slate-400 hover:text-white"
          aria-label="Toggle Sidebar"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation - scrollable list */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto scrollbar-thin">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200
               ${isActive
                ? 'bg-accent text-white shadow-lg shadow-accent/20 scale-[1.02]'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
              }`
            }
          >
            <span className="shrink-0">{link.icon}</span>
            {!collapsed && <span className="tracking-wide">{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Profile & Logout section at the bottom */}
      <div className="mt-auto border-t border-slate-800 p-4 flex flex-col gap-3 shrink-0 bg-slate-950/40">
        <div className="flex items-center gap-3">
          {/* Avatar with dynamic initials */}
          <div className="h-10 w-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-bold text-sm shrink-0 border border-accent/30 shadow-inner">
            {userInitials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-tight text-slate-200">Admin Portal</p>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{userEmail}</p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`
            flex items-center gap-2.5 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg py-2.5 transition-all font-medium cursor-pointer
            ${collapsed ? 'justify-center px-0' : 'px-3'}
          `}
          title="Logout"
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Logout Panel</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
