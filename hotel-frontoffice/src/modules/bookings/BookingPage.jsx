import React, { useState, useEffect } from 'react';
import { getBookingsList, createBooking, updateBooking, getBookingPayslip } from '../../api/booking';
import BookingStats from './components/BookingStats';
import BookingSummary from './components/BookingSummary';
import BookingFilters from './components/BookingFilters';
import BookingTable from './components/BookingTable';
import BookingForm from './components/BookingForm';
import BookingDetailModal from './components/BookingDetailModal';
import ActionButton from '../../components/ActionButton';
import Pagination from '../../components/Pagination';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import { exportToPDF, exportToExcel, exportPayslipToPDF } from './services/bookingExport.service';
import { useToastStore } from '../../store/useToastStore';
import { Loader2 } from 'lucide-react';
import './styles/bookings.css';

const BookingPage = () => {
  const addToast = useToastStore((state) => state.addToast);

  // Live data states
  const [allBookings, setAllBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [detailedBooking, setDetailedBooking] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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



  // Query live bookings from API
  const fetchBookings = async (showSilently = false) => {
    if (!showSilently) setLoading(true);
    try {
      const response = await getBookingsList({
        ...filters,
        page: currentPage,
        limit: itemsPerPage
      });
      console.log('Bookings API Response:', response);
      if (response && response.success) {
        if (response.data && response.data.bookings) {
          console.log('Setting bookings state to:', response.data.bookings);
          setAllBookings(response.data.bookings || []);
          setStats(response.data.stats || {});
          setTotalItems(response.data.pagination?.totalItems || 0);
        } else {
          console.log('Fallback: Setting bookings state to:', response.data);
          setAllBookings(response.data || []);
          setTotalItems(response.data?.length || 0);
          setStats({});
        }
      }
    } catch (error) {
      console.error('Failed to load reservations:', error);
      const errorMsg = error?.response?.data?.message || 'Failed to connect to backend reservations services.';
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch bookings on filters or page changes
  useEffect(() => {
    fetchBookings();
  }, [filters, currentPage]);

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
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
    setDetailedBooking(booking);
    setIsDetailOpen(true);
  };

  const handleCheckIn = async (booking) => {
    try {
      const code = booking.id || booking.bookingCode;
      const response = await updateBooking(code, { status: 'Checked-In' });
      if (response && response.success) {
        addToast(`Guest ${booking.guestName} successfully checked in!`, 'success');
        setIsDetailOpen(false);
        setDetailedBooking(null);
        fetchBookings(true);
      }
    } catch (error) {
      console.error('Failed to check in:', error);
      const errorMsg = error?.response?.data?.message || 'Failed to process Check-In.';
      addToast(errorMsg, 'error');
    }
  };

  const handleCheckOut = async (booking) => {
    try {
      const code = booking.id || booking.bookingCode;
      const response = await updateBooking(code, { status: 'Checked-Out' });
      if (response && response.success) {
        addToast(`Guest ${booking.guestName} checked out successfully.`, 'success');
        
        // Auto-download payslip
        try {
          const payslipResponse = await getBookingPayslip(code);
          if (payslipResponse && payslipResponse.success) {
            exportPayslipToPDF(payslipResponse.data);
          }
        } catch (pdfErr) {
          console.error('Failed to generate automatic invoice:', pdfErr);
        }

        setIsDetailOpen(false);
        setDetailedBooking(null);
        fetchBookings(true);
      }
    } catch (error) {
      console.error('Failed to check out:', error);
      const errorMsg = error?.response?.data?.message || 'Failed to process Check-Out.';
      addToast(errorMsg, 'error');
    }
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

  const handleConfirmDelete = async (reason) => {
    try {
      const response = await updateBooking(deletingBookingId, {
        status: 'Cancelled',
        cancellationReason: reason
      });
      
      if (response && response.success) {
        addToast(`Reservation ${deletingBookingId} has been successfully cancelled.`, 'warning');
        setIsDeleteModalOpen(false);
        setDeletingBookingId(null);
        fetchBookings(true);
      }
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
      const errorMsg = error?.response?.data?.message || 'Failed to process reservation cancellation.';
      addToast(errorMsg, 'error');
    }
  };

  const handleCreateOrUpdateBooking = async (newBookingData) => {
    try {
      if (editingBooking) {
        const code = editingBooking.id || editingBooking.bookingCode;
        const response = await updateBooking(code, newBookingData);
        if (response && response.success) {
          addToast(`Reservation for ${newBookingData.guestName || editingBooking.guestName} updated successfully!`, 'success');
          setIsFormOpen(false);
          setEditingBooking(null);
          fetchBookings(true);
        }
      } else {
        const response = await createBooking(newBookingData);
        if (response && response.success) {
          const registered = response.data;
          addToast(`New reservation ${registered.bookingCode} registered successfully!`, 'success');
          setIsFormOpen(false);
          setEditingBooking(null);
          fetchBookings(true);
        }
      }
    } catch (error) {
      console.error('Failed to process registration:', error);
      const errorMsg = error?.response?.data?.message || 'Failed to save registration details.';
      addToast(errorMsg, 'error');
    }
  };

  // Pagination calculations (server-side driven)
  const currentItems = allBookings;

  // Selection helpers
  const currentItemIds = currentItems.map(item => item.id);
  const isAllSelected = currentItems.length > 0 && currentItemIds.every(id => selectedIds.includes(id));

  const handleToggleSelectAll = async () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      addToast('Selecting all records...', 'info');
      try {
        const response = await getBookingsList({
          ...filters,
          page: 1,
          limit: 100000
        });
        if (response && response.success) {
          const fullData = response.data.bookings || response.data;
          const allIds = fullData.map(b => b.id || b.bookingCode);
          setSelectedIds(allIds);
          addToast(`Selected all ${allIds.length} records.`, 'success');
        }
      } catch (err) {
        addToast('Failed to select all records.', 'error');
      }
    }
  };

  const handleToggleSelectRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="booking-page-container relative min-h-[500px]">
      

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
      <BookingStats data={allBookings} stats={stats} />

      {/* 3. Booking Summaries */}
      <BookingSummary data={allBookings} stats={stats} />

      {/* 4. Unified Bookings Workspace (Filters + Table + Pagination) */}
      <div className="booking-workspace-container relative min-h-[300px]">
        {/* Filter Section */}
        <BookingFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          onExportPDF={async () => {
            if (selectedIds.length === 0) {
              addToast('Please select data from the list before exporting.', 'warning');
              return;
            }
            addToast('Preparing PDF export...', 'info');
            try {
              const res = await getBookingsList({ ...filters, page: 1, limit: 100000 });
              if (res && res.success) {
                const fullData = res.data.bookings || res.data;
                const dataToExport = fullData.filter(b => selectedIds.includes(b.id || b.bookingCode));
                exportToPDF(dataToExport);
              }
            } catch (err) {
              addToast('Failed to fetch data for PDF export.', 'error');
            }
          }}
          onExportExcel={async () => {
            if (selectedIds.length === 0) {
              addToast('Please select data from the list before exporting.', 'warning');
              return;
            }
            addToast('Preparing Excel export...', 'info');
            try {
              const res = await getBookingsList({ ...filters, page: 1, limit: 100000 });
              if (res && res.success) {
                const fullData = res.data.bookings || res.data;
                const dataToExport = fullData.filter(b => selectedIds.includes(b.id || b.bookingCode));
                exportToExcel(dataToExport);
              }
            } catch (err) {
              addToast('Failed to fetch data for Excel export.', 'error');
            }
          }}
        />

        {/* Loading Spinner for list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-b-2xl border-x border-b border-slate-100">
            <Loader2 size={32} className="text-indigo-600 animate-spin mb-2" />
            <p className="text-slate-500 text-sm font-medium">Loading reservations directory...</p>
          </div>
        ) : (
          <>
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
          </>
        )}
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

      {/* Booking Details Viewer & Status Manager Modal */}
      <BookingDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailedBooking(null);
        }}
        booking={detailedBooking}
        onCheckIn={() => handleCheckIn(detailedBooking)}
        onCheckOut={() => handleCheckOut(detailedBooking)}
        onDownloadPayslip={async () => {
          try {
            const code = detailedBooking.id || detailedBooking.bookingCode;
            const response = await getBookingPayslip(code);
            if (response && response.success) {
              exportPayslipToPDF(response.data);
            }
          } catch (error) {
            console.error('Failed to print receipt:', error);
            addToast('Failed to download invoice details.', 'error');
          }
        }}
      />

    </div>
  );
};

export default BookingPage;
