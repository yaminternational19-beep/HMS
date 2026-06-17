import React, { useState, useEffect } from 'react';
import OperationsStats from './components/OperationsStats';
import CheckInList from './components/CheckInList';
import CheckOutList from './components/CheckOutList';
import { getBookingsList, updateBooking, getBookingPayslip } from '../../api/booking';
import { exportPayslipToPDF } from '../bookings/services/bookingExport.service';
import PaymentModal from './components/PaymentModal';
import { useToastStore } from '../../store/useToastStore';
import { MdLogin, MdLogout } from 'react-icons/md';
import Pagination from '../../components/Pagination';
import { Loader2 } from 'lucide-react';
import './styles/checkinout.css';

const CheckInOutPage = () => {
  const [activeTab, setActiveTab] = useState('checkin');
  const [arrivals, setArrivals] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [totalArrivalsItems, setTotalArrivalsItems] = useState(0);
  const [totalDeparturesItems, setTotalDeparturesItems] = useState(0);
  const [pendingArrivals, setPendingArrivals] = useState(0);
  const [pendingDepartures, setPendingDepartures] = useState(0);
  const [apiStats, setApiStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPaymentGuest, setSelectedPaymentGuest] = useState(null);
  
  const addToast = useToastStore((state) => state.addToast);

  const fetchOpsData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'checkin') {
        const response = await getBookingsList({
          status: 'Confirmed,Pending,Checked-In',
          page: currentPage,
          limit: itemsPerPage
        });
        if (response && response.success) {
          const bookings = response.data.bookings || [];
          const arrivalsMapped = bookings.map(b => {
            const raw = b.raw || b.rawData || {};
            const adv = parseFloat(raw.paymentDetails?.advancePaid || 0);
            const amt = parseFloat(b.amount || 0);
            return {
              id: b.bookingCode,
              guestName: b.guestName,
              phone: b.phone,
              roomType: b.roomType,
              assignedRoom: b.roomNumber,
              eta: raw.bookingDetails?.expectedArrival ? new Date(raw.bookingDetails.expectedArrival).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }) : '12:00',
              status: b.status === 'Checked-In' ? 'Checked-In' : 'Pending',
              balance: Math.max(0, amt - adv),
              isVIP: raw.bookingDetails?.purposeOfVisit === 'Business',
              raw: b
            };
          });
          setArrivals(arrivalsMapped);
          setTotalArrivalsItems(response.data.pagination?.totalItems || 0);
          if (response.data.stats) {
            setApiStats(response.data.stats);
            setPendingArrivals(response.data.stats.pendingArrivals || 0);
            setPendingDepartures(response.data.stats.pendingDepartures || 0);
          }
        }
      } else {
        const response = await getBookingsList({
          status: 'Checked-In,Checked-Out',
          page: currentPage,
          limit: itemsPerPage
        });
        if (response && response.success) {
          const bookings = response.data.bookings || [];
          const departuresMapped = bookings.map(b => {
            const raw = b.raw || b.rawData || {};
            const adv = parseFloat(raw.paymentDetails?.advancePaid || 0);
            const amt = parseFloat(b.amount || 0);
            return {
              id: b.bookingCode,
              guestName: b.guestName,
              roomNumber: b.roomNumber,
              roomType: b.roomType,
              checkOutDate: b.checkOut,
              balance: Math.max(0, amt - adv),
              status: b.status === 'Checked-Out' ? 'Checked-Out' : 'Pending',
              raw: b
            };
          });
          setDepartures(departuresMapped);
          setTotalDeparturesItems(response.data.pagination?.totalItems || 0);
          if (response.data.stats) {
            setApiStats(response.data.stats);
            setPendingArrivals(response.data.stats.pendingArrivals || 0);
            setPendingDepartures(response.data.stats.pendingDepartures || 0);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load operations data:', err);
      addToast('Failed to load check-in/check-out directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpsData();
  }, [activeTab, currentPage]);

  const totalArrivalsPages = Math.ceil(totalArrivalsItems / itemsPerPage);
  const totalDeparturesPages = Math.ceil(totalDeparturesItems / itemsPerPage);

  useEffect(() => {
    if (activeTab === 'checkin' && currentPage > totalArrivalsPages && totalArrivalsPages > 0) {
      setCurrentPage(totalArrivalsPages);
    } else if (activeTab === 'checkout' && currentPage > totalDeparturesPages && totalDeparturesPages > 0) {
      setCurrentPage(totalDeparturesPages);
    }
  }, [totalArrivalsItems, totalDeparturesItems, activeTab, currentPage, totalArrivalsPages, totalDeparturesPages]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const handleCheckIn = async (guest) => {
    try {
      const response = await updateBooking(guest.id, { status: 'Checked-In' });
      if (response && response.success) {
        addToast(`${guest.guestName} successfully checked in to Room ${guest.assignedRoom}!`, 'success');
        fetchOpsData();
      }
    } catch (error) {
      console.error('Failed to check in:', error);
      const errorMsg = error?.response?.data?.message || 'Failed to process Check-In.';
      addToast(errorMsg, 'error');
    }
  };

  const handleCheckOut = async (guest) => {
    if (guest.balance > 0) {
      addToast(`Cannot check-out ${guest.guestName} — outstanding balance of ₹${guest.balance.toLocaleString()}. Please clear billing first.`, 'error');
      return;
    }
    try {
      const response = await updateBooking(guest.id, { status: 'Checked-Out' });
      if (response && response.success) {
        addToast(`${guest.guestName} has been successfully checked out. Room ${guest.roomNumber} is now queued for housekeeping.`, 'success');
        
        // Auto-download payslip
        try {
          const payslipResponse = await getBookingPayslip(guest.id);
          if (payslipResponse && payslipResponse.success) {
            exportPayslipToPDF(payslipResponse.data);
          }
        } catch (pdfErr) {
          console.error('Failed to generate automatic invoice:', pdfErr);
        }

        fetchOpsData();
      }
    } catch (error) {
      console.error('Failed to check out:', error);
      const errorMsg = error?.response?.data?.message || 'Failed to process Check-Out.';
      addToast(errorMsg, 'error');
    }
  };

  const handlePayBalanceClick = (guest) => {
    setSelectedPaymentGuest(guest);
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (paymentData) => {
    try {
      const { paymentMethod, transactionId, amountToPay } = paymentData;
      const guest = selectedPaymentGuest;
      if (!guest) return;

      const rawData = guest.raw.rawData || guest.raw.raw || {};
      const payDetails = rawData.paymentDetails || {};
      
      const newAdvance = (parseFloat(payDetails.advancePaid) || 0) + amountToPay;
      
      const updatedRawData = {
        ...rawData,
        paymentDetails: {
          ...payDetails,
          advancePaid: newAdvance,
          paymentMethod: paymentMethod,
          transactionId: transactionId || payDetails.transactionId,
        }
      };

      const response = await updateBooking(guest.id, { rawData: updatedRawData });
      if (response && response.success) {
        addToast(`Balance of ₹${amountToPay.toLocaleString()} settled for ${guest.guestName} via ${paymentMethod}.`, 'success');
        setPaymentModalOpen(false);
        fetchOpsData();
      }
    } catch (error) {
      console.error('Failed to update payment:', error);
      addToast(error?.response?.data?.message || 'Failed to update payment balance.', 'error');
    }
  };

  return (
    <div className="ops-page animate-fade-in">

      {/* Header */}
      <div className="ops-header">
        <div>
          <h1 className="ops-title">Guest Check-In / Check-Out</h1>
          <p className="ops-subtitle">Manage arrivals and departures in real time.</p>
        </div>
        <span className="ops-date-badge">{today}</span>
      </div>

      {/* Stats */}
      <OperationsStats stats={apiStats} />

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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Loader2 size={32} className="text-indigo-600 animate-spin mb-2 animate-duration-1000" />
            <p className="text-slate-500 text-sm font-medium">Loading operations directory...</p>
          </div>
        ) : activeTab === 'checkin' ? (
          <>
            <CheckInList arrivals={arrivals} onCheckIn={handleCheckIn} />
            <Pagination
              currentPage={currentPage}
              totalItems={totalArrivalsItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemName="arrivals"
            />
          </>
        ) : (
          <>
            <CheckOutList 
              departures={departures} 
              onCheckOut={handleCheckOut} 
              onPayBalance={handlePayBalanceClick}
            />
            <Pagination
              currentPage={currentPage}
              totalItems={totalDeparturesItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemName="departures"
            />
          </>
        )}
      </div>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        guest={selectedPaymentGuest}
        onSubmit={handlePaymentSubmit}
      />
    </div>
  );
};

export default CheckInOutPage;
