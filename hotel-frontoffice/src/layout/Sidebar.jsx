import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getCookie, deleteCookie } from '../api/cookieHelper';
import { logoutStaff } from '../api/auth';
import {
  MdDashboard,
  MdBookOnline,
  MdKingBed,
  MdChevronRight,
  MdChevronLeft,
  MdHotel,
  MdLogout,
  MdRoomPreferences,
  MdReceipt,
} from 'react-icons/md';

const navLinks = [
  { label: 'Dashboard', path: '/dashboard', icon: <MdDashboard size={20} /> },
  { label: 'Bookings', path: '/bookings', icon: <MdBookOnline size={20} /> },
  { label: 'Check-In / Out', path: '/checkinout', icon: <MdRoomPreferences size={20} /> },
  { label: 'Invoices', path: '/invoices', icon: <MdReceipt size={20} /> },
  { label: 'Rooms', path: '/rooms', icon: <MdKingBed size={20} /> },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutStaff();
    } catch (err) {
      console.error('Failed to log logout event on server', err);
    }
    deleteCookie('employeeToken');
    deleteCookie('employeeName');
    deleteCookie('employeeRole');
    deleteCookie('employeeCode');
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const employeeName = getCookie('employeeName') || 'Sarah Connor';
  const employeeRole = getCookie('employeeRole') || 'Front Desk Manager';
  const initials = employeeName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'SC';

  return (
    <aside
      className={`
        flex flex-col bg-primary text-white h-screen transition-all duration-300 z-30
        ${collapsed ? 'w-16' : 'w-52'}
      `}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/10 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <MdHotel size={24} className="text-accent" />
            <span className="font-bold text-lg tracking-wide">FrontOffice</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors ml-auto"
          aria-label="Toggle Sidebar"
        >
          {collapsed ? <MdChevronRight size={22} /> : <MdChevronLeft size={22} />}
        </button>
      </div>

      {/* Navigation - scrollable list */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
               ${isActive
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <span className="shrink-0">{link.icon}</span>
            {!collapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Profile & Logout section at the bottom */}
      <div className="mt-auto border-t border-white/10 p-3 flex flex-col gap-3 shrink-0">
        <div className="flex items-center gap-3">
          {/* Avatar with dynamic initials */}
          <div className="h-9 w-9 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-sm shrink-0 border border-accent/30">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-tight">{employeeName}</p>
              <p className="text-[10px] text-white/50 truncate">{employeeRole}</p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`
            flex items-center gap-2.5 text-xs text-white/70 hover:text-red-400 hover:bg-white/5 rounded-lg py-2 transition-colors font-medium cursor-pointer
            ${collapsed ? 'justify-center px-0' : 'px-3'}
          `}
          title="Logout"
        >
          <MdLogout size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
