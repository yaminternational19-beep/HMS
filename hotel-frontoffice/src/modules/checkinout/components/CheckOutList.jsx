import React from 'react';
import { MdLogout, MdWarning, MdCheckCircle } from 'react-icons/md';
import ActionButton from '../../../components/ActionButton';
import '../styles/checkinout.css';

const AVATAR_COLORS = [
  'bg-amber-500', 'bg-rose-500', 'bg-orange-500',
  'bg-purple-500', 'bg-teal-500', 'bg-pink-500'
];

const CheckOutList = ({ departures, onCheckOut }) => {
  const pending = departures.filter(d => d.status === 'Pending');
  const done = departures.filter(d => d.status === 'Checked-Out');

  if (!departures || departures.length === 0) {
    return (
      <div className="ops-empty">
        <div className="ops-empty-icon">
          <MdLogout size={32} />
        </div>
        <p className="text-sm font-bold text-slate-500">No Departures Found</p>
        <p className="ops-empty-text">No guest departures found.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Pending Check-Outs */}
      {pending.length > 0 && (
        <div>
          <div className="ops-list-header">
            <h3 className="ops-list-title">
              <MdLogout size={16} className="text-amber-500" />
              Pending Check-Out
            </h3>
            <span className="ops-badge ops-badge-warning">{pending.length} Remaining</span>
          </div>
          {pending.map((guest, idx) => (
            <div key={guest.id} className="ops-guest-row">
              <div className="flex items-center gap-4">
                <div className={`ops-guest-avatar ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                  {guest.guestName.charAt(0)}
                </div>
                <div>
                  <h4 className="ops-guest-name">{guest.guestName}</h4>
                  <div className="ops-guest-sub">
                    <span className="font-bold text-slate-700">Room {guest.roomNumber}</span>
                    <span className="ops-guest-sub-dot" />
                    <span>{guest.roomType}</span>
                    <span className="ops-guest-sub-dot" />
                    <span>Booking #{guest.id}</span>
                  </div>
                </div>
              </div>

              <div className="ops-actions">
                {guest.balance > 0 ? (
                  <span className="ops-balance-alert ops-balance-due">
                    <MdWarning size={14} />
                    Due Balance: ₹{guest.balance.toLocaleString()}
                  </span>
                ) : (
                  <span className="ops-balance-alert ops-balance-clear">
                    <MdCheckCircle size={14} />
                    Fully Settled
                  </span>
                )}
                <ActionButton variant="danger" onClick={() => onCheckOut(guest)}>
                  Check-Out Guest
                </ActionButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Already Checked Out */}
      {done.length > 0 && (
        <div>
          <div className="ops-list-header">
            <h3 className="ops-list-title text-slate-500">
              Checked-Out
            </h3>
            <span className="ops-badge ops-badge-done">{done.length} Done</span>
          </div>
          {done.map((guest) => (
            <div key={guest.id} className="ops-guest-row opacity-60">
              <div className="flex items-center gap-4">
                <div className="ops-guest-avatar bg-slate-400">
                  {guest.guestName.charAt(0)}
                </div>
                <div>
                  <h4 className="ops-guest-name">{guest.guestName}</h4>
                  <div className="ops-guest-sub">
                    <span className="font-bold text-slate-700">Room {guest.roomNumber}</span>
                    <span className="ops-guest-sub-dot" />
                    <span>{guest.roomType}</span>
                  </div>
                </div>
              </div>
              <span className="ops-badge ops-badge-done">✓ Checked Out</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckOutList;
