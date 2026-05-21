import React, { useState } from 'react';
import { bookings as mockBookings } from './mockdata/bookings.mock';
import BookingStats from './components/BookingStats';
import BookingSummary from './components/BookingSummary';
import BookingFilters from './components/BookingFilters';
import BookingTable from './components/BookingTable';
import Pagination from '../../components/Pagination';
import { exportToPDF, exportToExcel } from './services/bookingExport.service';
import { MdVisibility } from 'react-icons/md';
import './styles/bookings.css';

const BookingsPage = () => {
  // Master read-only data state
  const [allBookings] = useState(mockBookings);

  // Filters states
  const [filters, setFilters] = useState({
    search: '',
    roomType: 'All',
    status: 'All'
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected records for batch export
  const [selectedIds, setSelectedIds] = useState([]);

  // Local notification state (Toast system)
  const [toasts, setToasts] = useState([]);

  // View details modal state
  const [viewingBooking, setViewingBooking] = useState(null);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // reset to page 1 on filter
  };

  const handleReset = () => {
    setFilters({
      search: '',
      roomType: 'All',
      status: 'All'
    });
    setCurrentPage(1);
    addToast('Search filters reset to default.', 'info');
  };

  // View detail action
  const handleView = (booking) => {
    setViewingBooking(booking);
  };

  // Filter logic matching frontoffice behavior
  const filteredBookings = allBookings.filter((booking) => {
    const matchesSearch =
      booking.guestName.toLowerCase().includes((filters.search || '').toLowerCase()) ||
      booking.id.toLowerCase().includes((filters.search || '').toLowerCase()) ||
      booking.phone.includes(filters.search || '');

    const matchesRoomType = filters.roomType === 'All' || booking.roomType === filters.roomType;
    const matchesStatus = filters.status === 'All' || booking.status === filters.status;

    return matchesSearch && matchesRoomType && matchesStatus;
  });

  // Pagination calculations
  const totalItems = filteredBookings.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

  // Selection helpers
  const currentItemIds = currentItems.map((item) => item.id);
  const isAllSelected = currentItems.length > 0 && currentItemIds.every((id) => selectedIds.includes(id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentItemIds.includes(id)));
    } else {
      setSelectedIds((prev) => {
        const newSelections = currentItemIds.filter((id) => !prev.includes(id));
        return [...prev, ...newSelections];
      });
    }
  };

  const handleToggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in booking-page-container">
      
      {/* 1. Header (Clean read-only representation, no New Registration button) */}
      <div className="booking-header-wrapper">
        <div>
          <h1 className="booking-header-title">Bookings Directory</h1>
          <p className="booking-header-subtitle">Inspect guest reservations, room assignments, and payments.</p>
        </div>
        <div className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold select-none border border-slate-200">
          Admin Read-Only Access
        </div>
      </div>

      {/* 2. Stats Section */}
      <BookingStats data={allBookings} />

      {/* 3. Booking Summaries */}
      <BookingSummary data={allBookings} />

      {/* 4. Unified Workspace (Filters + Table + Pagination) */}
      <div className="booking-workspace-container">
        {/* Filters */}
        <BookingFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          onExportPDF={() => {
            if (selectedIds.length === 0) {
              addToast('Please select data from the list before exporting.', 'warning');
              return;
            }
            const dataToExport = allBookings.filter((b) => selectedIds.includes(b.id));
            exportToPDF(dataToExport, addToast);
          }}
          onExportExcel={() => {
            if (selectedIds.length === 0) {
              addToast('Please select data from the list before exporting.', 'warning');
              return;
            }
            const dataToExport = allBookings.filter((b) => selectedIds.includes(b.id));
            exportToExcel(dataToExport, addToast);
          }}
        />

        {/* Table */}
        <BookingTable
          data={currentItems}
          onView={handleView}
          className="border-none shadow-none rounded-none"
          selectedIds={selectedIds}
          onToggleSelectRow={handleToggleSelectRow}
          isAllSelected={isAllSelected}
          onToggleSelectAll={handleToggleSelectAll}
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemName="bookings"
          className="border-none rounded-none border-t border-slate-100 bg-white"
        />
      </div>

      {/* 5. View Details Modal Pop-up */}
      {viewingBooking && (
        <div className="booking-modal-overlay animate-fade-in" onClick={() => setViewingBooking(null)}>
          <div className="booking-modal-container animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="booking-modal-header !bg-slate-900 !text-white">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-slate-800 text-amber-500 rounded-lg">
                  <MdVisibility size={18} />
                </span>
                <span className="text-base font-bold text-white">Booking Details - {viewingBooking.id}</span>
              </div>
              <button 
                onClick={() => setViewingBooking(null)} 
                className="text-white/80 hover:text-white font-bold font-mono text-lg cursor-pointer"
              >
                ×
              </button>
            </div>
            <div className="booking-modal-body p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Guest Name</label>
                  <p className="text-sm font-bold text-slate-800">{viewingBooking.guestName}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Phone Number</label>
                  <p className="text-sm text-slate-600 font-semibold">{viewingBooking.phone}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Room / Type</label>
                  <p className="text-sm font-bold text-slate-800">Room {viewingBooking.room} ({viewingBooking.roomType})</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Guests</label>
                  <p className="text-sm text-slate-800 font-semibold">{viewingBooking.totalGuests} Guests</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Check-In</label>
                  <p className="text-sm text-slate-800 font-semibold">{viewingBooking.checkIn}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Check-Out</label>
                  <p className="text-sm text-slate-800 font-semibold">{viewingBooking.checkOut}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Booking Status</label>
                  <div>
                    <span className={`status-tag ${
                      viewingBooking.status === 'Confirmed' ? 'status-tag-confirmed' :
                      viewingBooking.status === 'Pending' ? 'status-tag-pending' :
                      viewingBooking.status === 'Checked-In' ? 'status-tag-checkedin' :
                      viewingBooking.status === 'Checked-Out' ? 'status-tag-checkedout' :
                      'status-tag-cancelled'
                    }`}>{viewingBooking.status}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Payment Status</label>
                  <div>
                    <span className={`status-tag ${
                      viewingBooking.paymentStatus === 'Paid' ? 'status-tag-paid' :
                      viewingBooking.paymentStatus === 'Partial' ? 'status-tag-partial' :
                      'status-tag-unpaid'
                    }`}>{viewingBooking.paymentStatus}</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4 mt-2 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Total Amount</span>
                  <span className="text-lg font-extrabold text-blue-600">₹{viewingBooking.amount.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => setViewingBooking(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Local Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border text-white font-medium flex items-center justify-between gap-3 animate-slide-in-right ${
              toast.type === 'success' ? 'bg-emerald-600 border-emerald-500' :
              toast.type === 'warning' ? 'bg-amber-600 border-amber-500' :
              toast.type === 'error' ? 'bg-red-600 border-red-500' :
              'bg-slate-800 border-slate-700'
            }`}
          >
            <span className="text-xs">{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-white/80 hover:text-white text-xs font-bold font-mono cursor-pointer"
            >
              ×
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default BookingsPage;
