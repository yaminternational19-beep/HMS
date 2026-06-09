import React from 'react';
import { MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import ActionButton from '../../../components/ActionButton';

const BookingTable = ({ 
  data = [], 
  onView, 
  onEdit, 
  onDelete, 
  className = "",
  selectedIds = [],
  onToggleSelectRow = () => {},
  isAllSelected = false,
  onToggleSelectAll = () => {}
}) => {
  const getStatusTagClass = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'status-tag-confirmed';
      case 'Pending':
        return 'status-tag-pending';
      case 'Checked-In':
        return 'status-tag-checkedin';
      case 'Checked-Out':
        return 'status-tag-checkedout';
      case 'Cancelled':
      default:
        return 'status-tag-cancelled';
    }
  };

  const getPaymentTagClass = (payStatus) => {
    switch (payStatus) {
      case 'Paid':
        return 'status-tag-paid';
      case 'Partial':
        return 'status-tag-partial';
      case 'Pending':
      default:
        return 'status-tag-unpaid';
    }
  };

  return (
    <div className={`table-container ${className}`}>
      <table className="table-element">
        <thead>
          <tr>
            <th className="w-12 text-center">
              <input 
                type="checkbox" 
                checked={isAllSelected} 
                onChange={onToggleSelectAll} 
                className="w-4 h-4 rounded text-primary border-slate-300 focus:ring-accent cursor-pointer"
              />
            </th>
            <th>Booking ID</th>
            <th>Guest Name</th>
            <th>Phone Number</th>
            <th>Room</th>
            <th>Room Type</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Guests</th>
            <th>Booking Status</th>
            <th>Payment Status</th>
            <th>Amount</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={13} className="text-center py-8 text-text-muted font-medium">
                No matching bookings found.
              </td>
            </tr>
          ) : (
            data.map((booking) => (
              <tr key={booking.id}>
                <td className="text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(booking.id)} 
                    onChange={() => onToggleSelectRow(booking.id)} 
                    className="w-4 h-4 rounded text-primary border-slate-300 focus:ring-accent cursor-pointer"
                  />
                </td>
                <td className="font-semibold text-primary">{booking.id}</td>
                <td className="font-bold text-text-main">{booking.guestName}</td>
                <td className="text-text-muted">{booking.phone}</td>
                <td className="font-semibold text-text-main">{booking.room}</td>
                <td className="text-text-muted">{booking.roomType}</td>
                <td className="text-text-muted">{booking.checkIn}</td>
                <td className="text-text-muted">{booking.checkOut}</td>
                <td className="text-center text-text-main font-semibold">{booking.totalGuests}</td>
                <td>
                  <span className={`status-tag ${getStatusTagClass(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td>
                  <span className={`status-tag ${getPaymentTagClass(booking.paymentStatus)}`}>
                    {booking.paymentStatus}
                  </span>
                </td>
                <td className="font-extrabold text-blue-600 text-sm">
                  ₹{booking.amount.toLocaleString()}
                </td>
                <td>
                  <div className="action-group justify-center">
                    <ActionButton
                      onClick={() => onView(booking)}
                      variant="table-view"
                      title="View Details"
                      icon={MdVisibility}
                    />
                    <ActionButton
                      onClick={() => onEdit(booking)}
                      variant="table-edit"
                      title="Edit Booking"
                      icon={MdEdit}
                    />
                    <ActionButton
                      onClick={() => onDelete(booking.id)}
                      variant="table-delete"
                      title="Cancel/Delete"
                      icon={MdDelete}
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BookingTable;
