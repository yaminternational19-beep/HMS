import React, { useState } from 'react';
import { bookings } from '../../mockdata/bookings.mock';
import BookingStats from './components/BookingStats';
import BookingSummary from './components/BookingSummary';
import BookingFilters from './components/BookingFilters';
import BookingTable from './components/BookingTable';
import BookingForm from './components/BookingForm';
import ActionButton from '../../components/ActionButton';
import Pagination from '../../components/Pagination';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import { exportToPDF, exportToExcel } from './services/bookingExport.service';
import { useToastStore } from '../../store/useToastStore';
import './styles/bookings.css';

const BookingPage = () => {
  // Master data state
  const [allBookings, setAllBookings] = useState(bookings);
  const addToast = useToastStore((state) => state.addToast);

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    roomType: 'All',
    status: 'All'
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selection states
  const [selectedIds, setSelectedIds] = useState([]);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

  // Cancellation Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingBookingId, setDeletingBookingId] = useState(null);

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
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

  // Actions
  const handleView = (booking) => {
    alert(`Viewing Booking: ${booking.id || booking.raw?.bookingDetails?.bookingId}\nGuest: ${booking.guestName}\nRoom: ${booking.room || booking.raw?.bookingDetails?.roomNumber} (${booking.roomType})`);
  };

  const handleNewReservation = () => {
    addToast('Opening guest registration wizard...', 'info');
    setEditingBooking(null);
    setIsFormOpen(true);
  };

  const handleEdit = (booking) => {
    addToast(`Loading registration details for ${booking.guestName}...`, 'info');
    setEditingBooking(booking);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    setDeletingBookingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (reason) => {
    // Cancel the booking by filtering it out or setting status
    setAllBookings(prev => prev.filter(b => b.id !== deletingBookingId));

    // Log the cancellation details to confirm reason capture
    console.log(`Cancelled booking ${deletingBookingId}. Reason: ${reason}`);

    addToast(`Reservation ${deletingBookingId} has been successfully cancelled.`, 'warning');

    setIsDeleteModalOpen(false);
    setDeletingBookingId(null);
  };

  const handleCreateOrUpdateBooking = (newBookingData) => {
    if (editingBooking) {
      setAllBookings(prev => prev.map(b => b.id === editingBooking.id ? { ...b, ...newBookingData } : b));
      addToast(`Reservation for ${newBookingData.guestName || editingBooking.guestName} updated successfully!`, 'success');
    } else {
      const nextIdNumber = allBookings.length + 1;
      const formattedId = `BKG-${String(nextIdNumber).padStart(3, '0')}`;

      const newBooking = {
        id: formattedId,
        ...newBookingData
      };
      setAllBookings(prev => [newBooking, ...prev]);
      addToast(`New reservation ${formattedId} registered successfully!`, 'success');
    }
    setIsFormOpen(false);
    setEditingBooking(null);
  };

  // Filter logic
  const filteredBookings = allBookings.filter(booking => {
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
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

  // Selection helpers
  const currentItemIds = currentItems.map(item => item.id);
  const isAllSelected = currentItems.length > 0 && currentItemIds.every(id => selectedIds.includes(id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(prev => prev.filter(id => !currentItemIds.includes(id)));
    } else {
      setSelectedIds(prev => {
        const newSelections = currentItemIds.filter(id => !prev.includes(id));
        return [...prev, ...newSelections];
      });
    }
  };

  const handleToggleSelectRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="booking-page-container">

      {/* 1. Header */}
      <div className="booking-header-wrapper">
        <div>
          <h1 className="booking-header-title">Bookings Directory</h1>
          <p className="booking-header-subtitle">Manage guest reservations, room assignments, and payments.</p>
        </div>
        <ActionButton
          onClick={handleNewReservation}
          variant="primary"
        >
          <span>New Reservation</span>
        </ActionButton>
      </div>

      {/* 2. Stats Section */}
      <BookingStats data={allBookings} />

      {/* 3. Booking Summaries */}
      <BookingSummary data={allBookings} />

      {/* 4. Unified Bookings Workspace (Filters + Table + Pagination) */}
      <div className="booking-workspace-container">
        {/* Filter Section */}
        <BookingFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          onExportPDF={() => {
            if (selectedIds.length === 0) {
              addToast('Please select data from the list before exporting.', 'warning');
              return;
            }
            const dataToExport = allBookings.filter(b => selectedIds.includes(b.id));
            exportToPDF(dataToExport);
          }}
          onExportExcel={() => {
            if (selectedIds.length === 0) {
              addToast('Please select data from the list before exporting.', 'warning');
              return;
            }
            const dataToExport = allBookings.filter(b => selectedIds.includes(b.id));
            exportToExcel(dataToExport);
          }}
        />

        {/* Table Section */}
        <BookingTable
          data={currentItems}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          className="border-none shadow-none rounded-none"
          selectedIds={selectedIds}
          onToggleSelectRow={handleToggleSelectRow}
          isAllSelected={isAllSelected}
          onToggleSelectAll={handleToggleSelectAll}
        />

        {/* Pagination Section */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemName="bookings"
          className="border-none rounded-none border-t border-slate-100 bg-white"
        />
      </div>

      {/* Booking Form Pop-up Modal */}
      <BookingForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingBooking(null);
        }}
        onSubmit={handleCreateOrUpdateBooking}
        editingData={editingBooking}
      />

      {/* Cancellation Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingBookingId(null);
        }}
        onConfirm={handleConfirmDelete}
        bookingId={deletingBookingId}
      />

    </div>
  );
};

export default BookingPage;
