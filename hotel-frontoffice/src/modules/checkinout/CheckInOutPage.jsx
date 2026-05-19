import React, { useState } from 'react';
import OperationsStats from './components/OperationsStats';
import CheckInList from './components/CheckInList';
import CheckOutList from './components/CheckOutList';
import { TODAY_ARRIVALS, TODAY_DEPARTURES } from '../../mockdata/frontdesk.mock';
import { useToastStore } from '../../store/useToastStore';
import { MdLogin, MdLogout } from 'react-icons/md';
import Pagination from '../../components/Pagination';
import './styles/checkinout.css';

const CheckInOutPage = () => {
  const [activeTab, setActiveTab] = useState('checkin');
  const [arrivals, setArrivals] = useState(TODAY_ARRIVALS);
  const [departures, setDepartures] = useState(TODAY_DEPARTURES);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const addToast = useToastStore((state) => state.addToast);

  const pendingArrivals = arrivals.filter(a => a.status === 'Pending').length;
  const pendingDepartures = departures.filter(d => d.status === 'Pending').length;

  // Format today's date nicely
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Pagination slicing
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentArrivals = arrivals.slice(indexOfFirstItem, indexOfLastItem);
  const currentDepartures = departures.slice(indexOfFirstItem, indexOfLastItem);

  const handleCheckIn = (guest) => {
    addToast(`Processing Check-In for ${guest.guestName}...`, 'info');
    setTimeout(() => {
      setArrivals(prev =>
        prev.map(a => a.id === guest.id ? { ...a, status: 'Checked-In' } : a)
      );
      addToast(`${guest.guestName} successfully checked in to Room ${guest.assignedRoom}!`, 'success');
    }, 800);
  };

  const handleCheckOut = (guest) => {
    if (guest.balance > 0) {
      addToast(`Cannot check-out ${guest.guestName} — outstanding balance of ₹${guest.balance.toLocaleString()}. Please clear billing first.`, 'error');
      return;
    }
    addToast(`Processing Check-Out for ${guest.guestName}...`, 'info');
    setTimeout(() => {
      setDepartures(prev =>
        prev.map(d => d.id === guest.id ? { ...d, status: 'Checked-Out' } : d)
      );
      addToast(`${guest.guestName} has been successfully checked out. Room ${guest.roomNumber} is now queued for housekeeping.`, 'success');
    }, 800);
  };

  return (
    <div className="ops-page animate-fade-in">

      {/* Header */}
      <div className="ops-header">
        <div>
          <h1 className="ops-title">Guest Check-In / Check-Out</h1>
          <p className="ops-subtitle">Manage today's arrivals and departures in real time.</p>
        </div>
        <span className="ops-date-badge">{today}</span>
      </div>

      {/* Stats */}
      <OperationsStats arrivals={arrivals} departures={departures} />

      {/* Tabbed Workspace */}
      <div className="ops-workspace">

        {/* Tab Bar */}
        <div className="ops-tab-bar">
          <button
            onClick={() => handleTabChange('checkin')}
            className={`ops-tab ${activeTab === 'checkin' ? 'ops-tab-active' : 'ops-tab-inactive'}`}
          >
            <MdLogin size={18} />
            Check-In
            <span className={`ops-tab-badge ${activeTab === 'checkin' ? 'ops-tab-badge-active' : 'ops-tab-badge-inactive'}`}>
              {pendingArrivals}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('checkout')}
            className={`ops-tab ${activeTab === 'checkout' ? 'ops-tab-active' : 'ops-tab-inactive'}`}
          >
            <MdLogout size={18} />
            Check-Out
            <span className={`ops-tab-badge ${activeTab === 'checkout' ? 'ops-tab-badge-active' : 'ops-tab-badge-inactive'}`}>
              {pendingDepartures}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'checkin' ? (
          <>
            <CheckInList arrivals={currentArrivals} onCheckIn={handleCheckIn} />
            <Pagination
              currentPage={currentPage}
              totalItems={arrivals.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemName="arrivals"
            />
          </>
        ) : (
          <>
            <CheckOutList departures={currentDepartures} onCheckOut={handleCheckOut} />
            <Pagination
              currentPage={currentPage}
              totalItems={departures.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemName="departures"
            />
          </>
        )}
      </div>

    </div>
  );
};

export default CheckInOutPage;
