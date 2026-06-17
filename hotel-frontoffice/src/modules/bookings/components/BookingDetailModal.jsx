import React from 'react';
import { MdClose, MdVisibility, MdCheckCircle, MdLogout, MdReceipt } from 'react-icons/md';
import ActionButton from '../../../components/ActionButton';

const BookingDetailModal = ({ isOpen, onClose, booking, onCheckIn, onCheckOut, onDownloadPayslip }) => {
  if (!isOpen || !booking) return null;

  const raw = booking.raw || booking.rawData || {};
  const guestDetails = raw.primaryGuest || {};
  const idProof = raw.idProof || {};
  const paymentDetails = raw.paymentDetails || {};
  const roomDetails = raw.roomDetails || {};
  const emergencyContact = raw.emergencyContact || {};
  const additionalGuests = raw.additionalGuests || [];

  const getStatusTagClass = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Checked-In':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Checked-Out':
        return 'bg-slate-100 text-slate-700 border-slate-350';
      case 'Cancelled':
      default:
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const getPaymentTagClass = (payStatus) => {
    switch (payStatus) {
      case 'Paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Partial':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Pending':
      default:
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  // Helper to determine if front ID proof is an uploaded image URL
  const isImageUrl = (url) => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/uploads/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-slide-up flex flex-col max-h-[90vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-start md:items-center gap-4 px-4 md:px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-slate-900">Reservation Details</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusTagClass(booking.status)}`}>
                {booking.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Booking Code: <strong className="font-mono text-slate-700">{booking.bookingCode}</strong></p>
          </div>
          <ActionButton
            onClick={onClose}
            variant="remove-member"
            icon={MdClose}
            iconSize={20}
          />
        </div>

        {/* Scrollable Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          
          {/* Section 1: Guest and Stay Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Guest Info */}
            <div className="bg-white rounded-xl border border-slate-150 p-5 space-y-3 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Primary Guest Information</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-400 text-xs block">Full Name</span>
                  <strong className="text-slate-800">{booking.guestName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Phone Number</span>
                  <span className="text-slate-700 font-semibold">{booking.phone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 text-xs block">Email Address</span>
                  <span className="text-slate-700 font-medium">{guestDetails.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Nationality</span>
                  <span className="text-slate-700">{guestDetails.nationality || 'Indian'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Occupation</span>
                  <span className="text-slate-700">{guestDetails.occupation || 'N/A'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 text-xs block">Address</span>
                  <p className="text-slate-700 text-xs whitespace-pre-line mt-0.5">
                    {[guestDetails.address1, guestDetails.address2, guestDetails.city, guestDetails.state, guestDetails.country]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Stay Info */}
            <div className="bg-white rounded-xl border border-slate-150 p-5 space-y-3 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Stay Details</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-400 text-xs block">Assigned Room</span>
                  <strong className="text-slate-800">Room {booking.roomNumber} ({booking.roomType})</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Total Guests</span>
                  <strong className="text-slate-850">{booking.totalGuests} Guests</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Check-In Date</span>
                  <span className="text-slate-700 font-medium">{booking.checkIn}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Check-Out Date</span>
                  <span className="text-slate-700 font-medium">{booking.checkOut}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Booking Source</span>
                  <span className="text-slate-700">{raw.bookingDetails?.bookingSource || 'Walk-in'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Purpose of Visit</span>
                  <span className="text-slate-700">{raw.bookingDetails?.purposeOfVisit || 'N/A'}</span>
                </div>
                {booking.cancellationReason && (
                  <div className="col-span-2 bg-red-50/50 p-2.5 rounded-lg border border-red-100">
                    <span className="text-red-500 font-bold text-xs block">Cancellation Reason</span>
                    <p className="text-red-700 text-xs mt-0.5">{booking.cancellationReason}</p>
                  </div>
                )}
                {raw.bookingDetails?.specialRequests && (
                  <div className="col-span-2">
                    <span className="text-slate-400 text-xs block">Special Requests</span>
                    <p className="text-slate-600 text-xs italic mt-0.5">"{raw.bookingDetails.specialRequests}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Identity Verification & Upload Details */}
          <div className="bg-white rounded-xl border border-slate-150 p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Identity Verification Documents</h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${
                idProof.verificationStatus === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                ID Status: {idProof.verificationStatus || 'Pending'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <div>
                  <span className="text-slate-400 text-xs block">Document Type</span>
                  <strong className="text-slate-800">{idProof.idType || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Document Number</span>
                  <strong className="font-mono text-slate-800">{idProof.idNumber || 'N/A'}</strong>
                </div>
                {idProof.passportNumber && (
                  <>
                    <div>
                      <span className="text-slate-400 text-xs block">Passport Number</span>
                      <span className="font-mono text-slate-700">{idProof.passportNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs block">Passport Expiry</span>
                      <span className="text-slate-700">{idProof.passportExpiry}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Front Side Scan */}
              <div className="space-y-1">
                <span className="text-slate-500 text-xs font-semibold block">Front Side Upload</span>
                {isImageUrl(idProof.frontFileName) ? (
                  <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50 aspect-video max-h-36 flex items-center justify-center">
                    <img 
                      src={idProof.frontFileName} 
                      alt="Front ID scan" 
                      className="w-full h-full object-cover"
                    />
                    <a 
                      href={idProof.frontFileName} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity"
                    >
                      <MdVisibility size={18} className="mr-1.5" />
                      View Full Size
                    </a>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-200 p-4 rounded-lg bg-slate-50 text-center text-xs text-slate-400 italic">
                    {idProof.frontFileName ? `Uploaded file: ${idProof.frontFileName}` : 'No document uploaded'}
                  </div>
                )}
              </div>

              {/* Back Side Scan */}
              <div className="space-y-1">
                <span className="text-slate-500 text-xs font-semibold block">Back Side Upload</span>
                {isImageUrl(idProof.backFileName) ? (
                  <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50 aspect-video max-h-36 flex items-center justify-center">
                    <img 
                      src={idProof.backFileName} 
                      alt="Back ID scan" 
                      className="w-full h-full object-cover"
                    />
                    <a 
                      href={idProof.backFileName} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity"
                    >
                      <MdVisibility size={18} className="mr-1.5" />
                      View Full Size
                    </a>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-200 p-4 rounded-lg bg-slate-50 text-center text-xs text-slate-400 italic">
                    {idProof.backFileName ? `Uploaded file: ${idProof.backFileName}` : 'No document uploaded'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Financial Details & Emergency Contacts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Financial Details */}
            <div className="bg-white rounded-xl border border-slate-150 p-5 space-y-3 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Financial Statement</h4>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getPaymentTagClass(booking.paymentStatus)}`}>
                  {booking.paymentStatus}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Room Rent (Subtotal)</span>
                  <span className="font-semibold text-slate-800">₹{parseFloat(paymentDetails.roomRent || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Extra Charges (Amenity/Bed)</span>
                  <span className="font-semibold text-slate-800">₹{parseFloat(paymentDetails.extraCharges || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GST / Tax Amount</span>
                  <span className="font-semibold text-slate-800">₹{parseFloat(paymentDetails.gst || 0).toLocaleString()}</span>
                </div>
                {parseFloat(paymentDetails.discount || 0) > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount Applied</span>
                    <span>-₹{parseFloat(paymentDetails.discount || 0).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-100 pt-2">
                  <span>Final Charged Amount</span>
                  <span>₹{booking.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-indigo-600">
                  <span>Advance/Total Paid</span>
                  <span>₹{parseFloat(paymentDetails.advancePaid || 0).toLocaleString()}</span>
                </div>
                
                {/* Outstanding balance helper */}
                {booking.amount - parseFloat(paymentDetails.advancePaid || 0) > 0 && (
                  <div className="flex justify-between text-xs text-red-500 font-bold border-t border-dashed border-slate-100 pt-2">
                    <span>Outstanding Balance</span>
                    <span>₹{(booking.amount - parseFloat(paymentDetails.advancePaid || 0)).toLocaleString()}</span>
                  </div>
                )}

                <div className="bg-slate-50 p-2 rounded-lg mt-3 flex justify-between items-center text-[11px] text-slate-600">
                  <span>Method: <strong>{paymentDetails.paymentMethod}</strong></span>
                  {paymentDetails.transactionId && <span>TxID: <strong className="font-mono">{paymentDetails.transactionId}</strong></span>}
                </div>
              </div>
            </div>

            {/* Emergency & Extras  (Commented out as requested)
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-xl border border-slate-150 p-5 space-y-3 shadow-sm flex-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Emergency Contact</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-400 text-xs block">Contact Name</span>
                    <strong className="text-slate-800">{emergencyContact.name || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Relation</span>
                    <span className="text-slate-700">{emergencyContact.relation || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 text-xs block">Phone Number</span>
                    <span className="text-slate-700 font-semibold">{emergencyContact.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-150 p-5 space-y-3 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Preferences & Logistics</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-400 text-xs block">Smoking Preference</span>
                    <span className="text-slate-700 font-semibold">{roomDetails.smoking || 'Non-Smoking'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Vehicle Number</span>
                    <span className="font-mono text-slate-700">{roomDetails.vehicleNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Luggage Count</span>
                    <span className="text-slate-700 font-semibold">{roomDetails.luggageCount || 0} items</span>
                  </div>
                </div>
              </div>
            </div>
            */}
          </div>

          {/* Section 4: Additional Guests */}
          {additionalGuests.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-150 p-5 space-y-3 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Additional Guest Members ({additionalGuests.length})</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                      <th className="pb-2">Guest Name</th>
                      <th className="pb-2">Gender / Age</th>
                      <th className="pb-2">Relation</th>
                      <th className="pb-2">Phone</th>
                      <th className="pb-2">Document Proof</th>
                      <th className="pb-2 text-center">Scan Preview</th>
                    </tr>
                  </thead>
                  <tbody>
                    {additionalGuests.map((g, idx) => (
                      <tr key={idx} className="border-b border-slate-100 last:border-0">
                        <td className="py-2.5 font-bold text-slate-800">{g.name}</td>
                        <td className="py-2.5 text-slate-600">{g.gender} / {g.age || 'N/A'} Yrs</td>
                        <td className="py-2.5 text-slate-600">{g.relation}</td>
                        <td className="py-2.5 text-slate-700 font-semibold">{g.phone || 'N/A'}</td>
                        <td className="py-2.5 text-slate-600 font-mono">{g.idType || 'N/A'} : {g.idNumber || 'N/A'}</td>
                        <td className="py-2.5 text-center">
                          {isImageUrl(g.docName) ? (
                            <a 
                              href={g.docName} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              <MdVisibility size={14} className="mr-1" />
                              View Scan
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">No Scan</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <div>
            {/* Payslip/Receipt generation option */}
            {booking.status === 'Checked-Out' && (
              <ActionButton
                onClick={onDownloadPayslip}
                variant="primary"
                icon={MdReceipt}
              >
                Download Payslip PDF
              </ActionButton>
            )}
          </div>
          <div className="flex gap-3">
            {/* Dynamic Check-In button */}
            {(booking.status === 'Confirmed' || booking.status === 'Pending') && (
              <ActionButton
                onClick={onCheckIn}
                variant="primary"
                icon={MdCheckCircle}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Perform Check-In
              </ActionButton>
            )}

            {/* Dynamic Check-Out button */}
            {booking.status === 'Checked-In' && (
              <ActionButton
                onClick={onCheckOut}
                variant="primary"
                icon={MdLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                Perform Check-Out
              </ActionButton>
            )}

            <ActionButton
              onClick={onClose}
              variant="secondary"
            >
              Close Details
            </ActionButton>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingDetailModal;
