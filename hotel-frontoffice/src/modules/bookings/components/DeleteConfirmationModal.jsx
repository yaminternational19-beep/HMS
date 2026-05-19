import React, { useState, useEffect } from 'react';
import { MdClose, MdWarning, MdCheckCircle } from 'react-icons/md';
import ActionButton from '../../../components/ActionButton';
import '../styles/bookings.css';

/**
 * DeleteConfirmationModal - A custom, premium confirmation modal
 * for canceling/deleting bookings. Prompting the user to select
 * a reason and add optional remarks.
 */
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, bookingId }) => {
  const [reason, setReason] = useState('Guest requested cancellation');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');

  // Reset inputs when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setReason('Guest requested cancellation');
      setDetails('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select or specify a reason.');
      return;
    }
    
    // Combine reason and additional details
    const fullReason = details.trim() 
      ? `${reason}: ${details.trim()}` 
      : reason;
      
    onConfirm(fullReason);
  };

  const commonReasons = [
    'Guest requested cancellation',
    'Guest changed plans / Travel issue',
    'No-show / Guest failed to check-in',
    'Double booking / Booking conflict',
    'Invalid credit card / Payment failure',
    'Duplicate booking',
    'Other / Internal adjustment'
  ];

  return (
    <div className="booking-modal-overlay animate-fade-in">
      <div 
        className="booking-modal-container animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="booking-modal-header">
          <div className="booking-modal-header-title">
            <div className="booking-modal-header-icon">
              <MdWarning size={20} />
            </div>
            <h3 className="booking-modal-header-text">Confirm Cancellation</h3>
          </div>
          <ActionButton 
            onClick={onClose}
            variant="remove-member"
            icon={MdClose}
            iconSize={20}
          />
        </div>

        <form onSubmit={handleSubmit} className="booking-modal-body">
          <div>
            <p className="booking-modal-text">
              Are you sure you want to cancel booking <span className="font-bold text-slate-900">{bookingId}</span>? This action is irreversible.
            </p>
          </div>

          {/* Reason Selection */}
          <div className="space-y-1">
            <label className="booking-modal-label">
              Reason for Cancellation <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              className="booking-modal-select"
            >
              {commonReasons.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Optional Details */}
          <div className="space-y-1">
            <label className="booking-modal-label">
              Additional Details / Remarks (Optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any additional context here..."
              rows="3"
              className="booking-modal-textarea"
            />
          </div>

          {error && (
            <p className="text-xs font-semibold text-red-500">{error}</p>
          )}

          {/* Footer Actions */}
          <div className="booking-modal-footer">
            <ActionButton
              type="button"
              onClick={onClose}
              variant="secondary"
            >
              Go Back
            </ActionButton>
            <ActionButton
              type="submit"
              variant="danger"
              icon={MdCheckCircle}
              iconSize={16}
            >
              Confirm Cancellation
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
