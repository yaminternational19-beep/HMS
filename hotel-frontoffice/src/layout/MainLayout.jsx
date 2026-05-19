import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-bg-main overflow-hidden">
      {/* Sidebar - fully locked left */}
      <Sidebar />

      {/* Right Content Area - locked height */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">

        {/* Scrollable Page Content - ONLY this area scrolls */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

        {/* Sticky Footer - locked at the bottom, never scrolls out of view */}
        <Footer />

      </div>
    </div>
  );
};

export default MainLayout;
