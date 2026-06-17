import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { MdMenu } from 'react-icons/md';

const MainLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-bg-main overflow-hidden w-full">
      {/* Sidebar */}
      <Sidebar isMobileOpen={isMobileSidebarOpen} setIsMobileOpen={setIsMobileSidebarOpen} />

      {/* Right Content Area */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden w-full relative">
        
        {/* Mobile Header (Only visible on small screens) */}
        <header className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 rounded-lg hover:bg-slate-100">
              <MdMenu size={24} />
            </button>
            <span className="font-bold text-lg tracking-wide text-primary">FrontOffice</span>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full">
          <Outlet />
        </main>

        {/* Sticky Footer - locked at the bottom, never scrolls out of view */}
        <Footer />

      </div>
    </div>
  );
};

export default MainLayout;
