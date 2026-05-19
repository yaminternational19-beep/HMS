import React, { useState } from 'react';
import { MdOutlineSearch, MdRestartAlt } from 'react-icons/md';
import InvoiceStats from './components/InvoiceStats';
import InvoiceTable from './components/InvoiceTable';
import InvoiceDetailModal from './components/InvoiceDetailModal';
import { INVOICES } from '../../mockdata/invoices.mock';
import { INVOICE_STATUS } from './constants/invoiceStatus';
import { useToastStore } from '../../store/useToastStore';
import ActionButton from '../../components/ActionButton';
import Pagination from '../../components/Pagination';
import './styles/invoices.css';

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState(INVOICES);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const addToast = useToastStore(s => s.addToast);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const handleMarkPaid = (inv) => {
    setInvoices(prev => prev.map(i =>
      i.id === inv.id
        ? { ...i, status: INVOICE_STATUS.PAID, paidAmount: i.totalAmount, balanceDue: 0, paidDate: new Date().toISOString().slice(0, 10) }
        : i
    ));
    addToast(`Invoice ${inv.id} marked as Paid!`, 'success');
    setSelectedInvoice(null);
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

        {/* Table */}
        <InvoiceTable invoices={currentItems} onView={handleView} />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          itemName="invoices"
        />

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
