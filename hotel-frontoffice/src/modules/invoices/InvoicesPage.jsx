import React, { useState, useEffect } from 'react';
import { MdOutlineSearch, MdRestartAlt } from 'react-icons/md';
import InvoiceStats from './components/InvoiceStats';
import InvoiceTable from './components/InvoiceTable';
import InvoiceDetailModal from './components/InvoiceDetailModal';
import { getInvoicesList, updateBooking } from '../../api/booking';
import { INVOICE_STATUS } from './constants/invoiceStatus';
import { useToastStore } from '../../store/useToastStore';
import ActionButton from '../../components/ActionButton';
import Pagination from '../../components/Pagination';
import { Loader2 } from 'lucide-react';
import './styles/invoices.css';

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const addToast = useToastStore(s => s.addToast);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await getInvoicesList();
      if (response && response.success) {
        setInvoices(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load invoices:', error);
      addToast('Failed to load billing invoices from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Filtering
  const filtered = invoices.filter(inv => {
    const matchSearch =
      inv.guestName.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.bookingId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalItems = filtered.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  const handleView = (inv) => setSelectedInvoice(inv);

  const handleMarkPaid = async (inv) => {
    try {
      const raw = inv.raw || {};
      const updatedDetails = {
        ...raw,
        paymentDetails: {
          ...(raw.paymentDetails || {}),
          paymentStatus: 'Paid',
          advancePaid: inv.totalAmount
        }
      };
      
      const response = await updateBooking(inv.bookingId, { raw_data: updatedDetails });
      if (response && response.success) {
        addToast(`Invoice ${inv.id} marked as Paid!`, 'success');
        fetchInvoices();
        setSelectedInvoice(null);
      }
    } catch (error) {
      console.error('Failed to update invoice payment:', error);
      const errorMsg = error?.response?.data?.message || 'Failed to update payment status.';
      addToast(errorMsg, 'error');
    }
  };

  const handleReset = () => {
    setSearch('');
    setStatusFilter('All');
    setCurrentPage(1);
    addToast('Filters reset.', 'info');
  };

  return (
    <div className="inv-page animate-fade-in">

      {/* Header */}
      <div className="inv-header">
        <div>
          <h1 className="inv-title">Invoices & Billing</h1>
          <p className="inv-subtitle">Track guest bills, payment status, and outstanding balances.</p>
        </div>
      </div>

      {/* Stats */}
      <InvoiceStats invoices={invoices} />

      {/* Workspace */}
      <div className="inv-workspace">

        {/* Filters Bar */}
        <div className="inv-filters-bar">
          <div className="inv-search-wrap">
            <span className="inv-search-icon">
              <MdOutlineSearch size={18} />
            </span>
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search invoice, guest, booking..."
              className="inv-search-input"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="inv-filter-select"
          >
            <option value="All">All Statuses</option>
            {Object.values(INVOICE_STATUS).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <ActionButton variant="secondary" icon={MdRestartAlt} onClick={handleReset}>
            Reset
          </ActionButton>
        </div>

        {/* Table / Loader */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Loader2 size={32} className="text-indigo-600 animate-spin mb-2" />
            <p className="text-slate-500 text-sm font-medium">Loading billing invoices...</p>
          </div>
        ) : (
          <>
            <InvoiceTable invoices={currentItems} onView={handleView} />
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemName="invoices"
            />
          </>
        )}

      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onMarkPaid={handleMarkPaid}
        />
      )}

    </div>
  );
};

export default InvoicesPage;
