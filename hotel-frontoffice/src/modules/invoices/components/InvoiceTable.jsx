import React from 'react';
import { MdCheckCircle, MdPending, MdWarning, MdCancel, MdHourglassEmpty, MdVisibility, MdReceipt } from 'react-icons/md';
import { INVOICE_STATUS } from '../constants/invoiceStatus';
import ActionButton from '../../../components/ActionButton';
import '../styles/invoices.css';

const statusConfig = {
  [INVOICE_STATUS.PAID]:      { cls: 'inv-badge-paid',      icon: <MdCheckCircle size={11} />,    label: 'Paid' },
  [INVOICE_STATUS.PENDING]:   { cls: 'inv-badge-pending',   icon: <MdHourglassEmpty size={11} />, label: 'Pending' },
  [INVOICE_STATUS.PARTIAL]:   { cls: 'inv-badge-partial',   icon: <MdPending size={11} />,        label: 'Partial' },
  [INVOICE_STATUS.OVERDUE]:   { cls: 'inv-badge-overdue',   icon: <MdWarning size={11} />,        label: 'Overdue' },
  [INVOICE_STATUS.CANCELLED]: { cls: 'inv-badge-cancelled', icon: <MdCancel size={11} />,         label: 'Cancelled' }
};

const InvoiceTable = ({ invoices, onView, selectedIds = [], onToggleSelectAll = () => {}, onToggleSelectRow = () => {} }) => {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center text-slate-400">
        <MdReceipt size={48} className="mb-3 text-slate-300" />
        <p className="text-sm font-semibold">No invoices found</p>
      </div>
    );
  }

  return (
    <div className="inv-table-wrap">
      <table className="inv-table">
        <thead className="inv-table-head">
          <tr>
            <th className="inv-table-th w-10 text-center">
              <input
                type="checkbox"
                checked={invoices.length > 0 && invoices.every(inv => selectedIds.includes(inv.id))}
                onChange={onToggleSelectAll}
                className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-600 cursor-pointer h-4 w-4"
                title="Select All Invoices"
              />
            </th>
            <th className="inv-table-th">Invoice #</th>
            <th className="inv-table-th">Guest</th>
            <th className="inv-table-th">Room</th>
            <th className="inv-table-th">Stay</th>
            <th className="inv-table-th">Duration</th>
            <th className="inv-table-th">Total</th>
            <th className="inv-table-th inv-table-cell-tight w-[110px]">Balance</th>
            <th className="inv-table-th inv-table-cell-tight w-[120px]">Status</th>
            <th className="inv-table-th inv-table-cell-tight w-[70px] text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => {
            const badge = statusConfig[inv.status] || statusConfig[INVOICE_STATUS.PENDING];
            return (
              <tr key={inv.id} className="inv-table-row">
                <td className="inv-table-td text-center w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(inv.id)}
                    onChange={() => onToggleSelectRow(inv.id)}
                    className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-600 cursor-pointer h-4 w-4"
                  />
                </td>
                <td className="inv-table-td whitespace-nowrap">
                  <span className="inv-id">{inv.id}</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{inv.bookingId}</p>
                </td>
                <td className="inv-table-td">
                  <p className="inv-guest-name max-w-[150px] break-words">{inv.guestName}</p>
                  <p className="inv-guest-sub whitespace-nowrap">{inv.phone}</p>
                </td>
                <td className="inv-table-td">
                  <p className="font-semibold text-slate-800 whitespace-nowrap">Room {inv.roomNumber}</p>
                  <p className="text-xs text-slate-400 max-w-[120px] break-words">{inv.roomType}</p>
                </td>
                <td className="inv-table-td whitespace-nowrap">
                  <div className="flex flex-col gap-0.5">
                    <div className="text-xs text-slate-650">
                      <span className="font-bold text-slate-400">In:</span> {inv.checkIn}
                    </div>
                    <div className="text-xs text-slate-650">
                      <span className="font-bold text-slate-400">Out:</span> {inv.checkOut}
                    </div>
                  </div>
                </td>
                <td className="inv-table-td whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center self-start px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-150 rounded text-[10px] font-black uppercase tracking-wider">
                      {inv.nights} Night{inv.nights > 1 ? 's' : ''}
                    </span>
                    <span className="inline-flex items-center self-start px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-black uppercase tracking-wider">
                      {inv.nights + 1} Day{inv.nights + 1 > 1 ? 's' : ''}
                    </span>
                  </div>
                </td>
                <td className="inv-table-td">
                  <span className="inv-amount">₹{inv.totalAmount.toLocaleString()}</span>
                </td>
                <td className="inv-table-td inv-table-cell-tight whitespace-nowrap">
                  {inv.balanceDue > 0 ? (
                    <span className="inv-balance-due">₹{inv.balanceDue.toLocaleString()}</span>
                  ) : (
                    <span className="inv-balance-clear">Settled</span>
                  )}
                </td>
                <td className="inv-table-td inv-table-cell-tight whitespace-nowrap">
                  <span className={`inv-badge ${badge.cls}`}>
                    {badge.icon} {badge.label}
                  </span>
                </td>
                <td className="inv-table-td inv-table-cell-tight text-center">
                  <ActionButton
                    variant="table-view"
                    onClick={() => onView(inv)}
                    icon={MdVisibility}
                    iconSize={16}
                    title="View Invoice"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceTable;
