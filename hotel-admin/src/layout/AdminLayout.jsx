import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

const AdminLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-bg-main overflow-hidden font-sans antialiased text-slate-800">
      {/* Sidebar navigation */}
      <Sidebar isMobileOpen={isMobileSidebarOpen} setIsMobileOpen={setIsMobileSidebarOpen} />

      {/* Main workspace container */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden w-full">
        
        {/* Navigation & contextual header */}
        <Navbar onMenuToggle={() => setIsMobileSidebarOpen(true)} />

        {/* Dynamic page viewport with custom scrollbar, premium layouts, and animated exits/entrances */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-7xl mx-auto w-full animate-fade-in">
            <Outlet />
          </div>
        </main>

        {/* Global sticky footer panel */}
        <Footer />
        
      </div>
    </div>
  );
};

export default AdminLayout;
