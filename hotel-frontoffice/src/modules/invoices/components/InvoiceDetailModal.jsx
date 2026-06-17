import React from 'react';
import { MdClose, MdDownload, MdCheckCircle, MdWarning, MdHotel } from 'react-icons/md';
import { INVOICE_STATUS } from '../constants/invoiceStatus';
import ActionButton from '../../../components/ActionButton';
import { downloadInvoicePDF } from '../services/invoiceDownload.service';
import '../styles/invoices.css';

const statusConfig = {
  [INVOICE_STATUS.PAID]:      { cls: 'inv-badge-paid',    label: 'Paid' },
  [INVOICE_STATUS.PENDING]:   { cls: 'inv-badge-pending', label: 'Pending' },
  [INVOICE_STATUS.PARTIAL]:   { cls: 'inv-badge-partial', label: 'Partial Payment' },
  [INVOICE_STATUS.OVERDUE]:   { cls: 'inv-badge-overdue', label: 'Overdue' },
  [INVOICE_STATUS.CANCELLED]: { cls: 'inv-badge-cancelled', label: 'Cancelled' }
};

const InvoiceDetailModal = ({ invoice, onClose, onMarkPaid }) => {
  if (!invoice) return null;

  const badge = statusConfig[invoice.status] || statusConfig[INVOICE_STATUS.PENDING];

  return (
    <div className="inv-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="inv-modal-box animate-slide-up" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="inv-modal-header">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <MdHotel size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{invoice.id}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-slate-500">Booking {invoice.bookingId}</p>
                <span className={`inv-badge ${badge.cls}`}>{badge.label}</span>
              </div>
            </div>
          </div>
          <ActionButton variant="remove-member" onClick={onClose} icon={MdClose} iconSize={20} />
        </div>

        {/* Body */}
        <div className="inv-modal-body">

          {/* Guest & Room Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="inv-modal-section-title">Guest Details</p>
              <p className="font-bold text-slate-900">{invoice.guestName}</p>
              <p className="text-sm text-slate-500 mt-0.5">{invoice.phone}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="inv-modal-section-title">Room Details</p>
              <p className="font-bold text-slate-900">Room {invoice.roomNumber}</p>
              <p className="text-sm text-slate-500 mt-0.5">{invoice.roomType}</p>
            </div>
          </div>

          {/* Stay Info */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-3 gap-4">
            <div>
              <p className="inv-modal-section-title">Check-In</p>
              <p className="font-bold text-slate-900 text-sm">{invoice.checkIn}</p>
            </div>
            <div>
              <p className="inv-modal-section-title">Check-Out</p>
              <p className="font-bold text-slate-900 text-sm">{invoice.checkOut}</p>
            </div>
            <div>
              <p className="inv-modal-section-title">Stay Duration</p>
              <span className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-150 rounded-md text-xs font-black uppercase tracking-wider mt-0.5">
                {invoice.nights} Day{invoice.nights > 1 ? 's' : ''} Stayed
              </span>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
              <p className="inv-modal-section-title mb-0">Billing Breakdown</p>
            </div>
            <div className="px-5 py-3 divide-y divide-dashed divide-slate-100">
              {invoice.lineItems.map((item, idx) => (
                <div key={idx} className="inv-line-item-row">
                  <span className="inv-line-item-label">{item.description}</span>
                  <span className="inv-line-item-amount">₹{item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="px-5 py-4 border-t border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Sub Total</span>
                <span className="font-semibold">₹{invoice.subTotal.toLocaleString()}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount</span>
                  <span className="font-semibold">− ₹{invoice.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-slate-500">
                <span>GST (9%)</span>
                <span className="font-semibold">₹{invoice.gst.toLocaleString()}</span>
              </div>
              <div className="inv-total-row border-t border-slate-200 pt-2 mt-2">
                <span>Total Amount</span>
                <span>₹{invoice.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Amount Paid</span>
                <span className="font-bold text-emerald-600">₹{invoice.paidAmount.toLocaleString()}</span>
              </div>
              {invoice.balanceDue > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-red-600">Balance Due</span>
                  <span className="font-black text-red-600">₹{invoice.balanceDue.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          {invoice.paymentMethod && (
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-center gap-3">
              <MdCheckCircle size={20} className="text-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-700">
                  Payment received via {invoice.paymentMethod}
                </p>
                {invoice.paidDate && (
                  <p className="text-xs text-emerald-500 mt-0.5">Settled on {invoice.paidDate}</p>
                )}
              </div>
            </div>
          )}

          {/* Overdue Warning */}
          {invoice.status === INVOICE_STATUS.OVERDUE && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-100 flex items-center gap-3">
              <MdWarning size={20} className="text-red-500 shrink-0" />
              <p className="text-sm font-bold text-red-600">
                This invoice is overdue! Issued on {invoice.issuedDate}. Please collect payment immediately.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="inv-modal-footer">
          <ActionButton variant="secondary" onClick={onClose}>
            Close
          </ActionButton>
          <ActionButton variant="secondary" icon={MdDownload} onClick={() => downloadInvoicePDF(invoice)}>
            Download PDF
          </ActionButton>
          {(invoice.status === INVOICE_STATUS.PENDING ||
            invoice.status === INVOICE_STATUS.PARTIAL ||
            invoice.status === INVOICE_STATUS.OVERDUE) && (
            <ActionButton variant="primary" icon={MdCheckCircle} onClick={() => onMarkPaid(invoice)}>
              Mark as Paid
            </ActionButton>
          )}
        </div>

      </div>
    </div>
  );
};

export default InvoiceDetailModal;
