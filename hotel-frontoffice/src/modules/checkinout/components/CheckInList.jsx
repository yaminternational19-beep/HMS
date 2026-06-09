import React from 'react';
import { MdLogin, MdWarning, MdStar } from 'react-icons/md';
import ActionButton from '../../../components/ActionButton';
import '../styles/checkinout.css';

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'
];

const CheckInList = ({ arrivals, onCheckIn }) => {
  const pending = arrivals.filter(a => a.status === 'Pending');
  const done = arrivals.filter(a => a.status === 'Checked-In');

  if (!arrivals || arrivals.length === 0) {
    return (
      <div className="ops-empty">
        <div className="ops-empty-icon">
          <MdLogin size={32} />
        </div>
        <p className="text-sm font-bold text-slate-500">No Arrivals Found</p>
        <p className="ops-empty-text">All rooms are quiet. Check back later.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Pending Arrivals */}
      {pending.length > 0 && (
        <div>
          <div className="ops-list-header">
            <h3 className="ops-list-title">
              <MdLogin size={16} className="text-blue-500" />
              Awaiting Check-In
            </h3>
            <span className="ops-badge ops-badge-warning">{pending.length} Pending</span>
          </div>
          {pending.map((guest, idx) => (
            <div key={guest.id} className="ops-guest-row">
              <div className="flex items-center gap-4">
                <div className={`ops-guest-avatar ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                  {guest.guestName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="ops-guest-name">{guest.guestName}</h4>
                    {guest.isVIP && (
                      <span className="ops-badge ops-badge-vip flex items-center gap-0.5">
                        <MdStar size={10} /> VIP
                      </span>
                    )}
                  </div>
                  <div className="ops-guest-sub">
                    <span className="font-bold text-slate-700">Room {guest.assignedRoom}</span>
                    <span className="ops-guest-sub-dot" />
                    <span>{guest.roomType}</span>
                    <span className="ops-guest-sub-dot" />
                    <span>ETA: {guest.eta}</span>
                    <span className="ops-guest-sub-dot" />
                    <span>{guest.phone}</span>
                  </div>
                </div>
              </div>

              <div className="ops-actions">
                {guest.balance > 0 && (
                  <span className="ops-balance-alert ops-balance-due">
                    <MdWarning size={14} />
                    Advance Due: ₹{guest.balance.toLocaleString()}
                  </span>
                )}
                <ActionButton variant="primary" onClick={() => onCheckIn(guest)}>
                  Check-In Guest
                </ActionButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Already Checked In */}
      {done.length > 0 && (
        <div>
          <div className="ops-list-header">
            <h3 className="ops-list-title text-emerald-600">
              Checked-In
            </h3>
            <span className="ops-badge ops-badge-success">{done.length} Done</span>
          </div>
          {done.map((guest) => (
            <div key={guest.id} className="ops-guest-row opacity-70">
              <div className="flex items-center gap-4">
                <div className="ops-guest-avatar bg-emerald-500">
                  {guest.guestName.charAt(0)}
                </div>
                <div>
                  <h4 className="ops-guest-name">{guest.guestName}</h4>
                  <div className="ops-guest-sub">
                    <span className="font-bold text-slate-700">Room {guest.assignedRoom}</span>
                    <span className="ops-guest-sub-dot" />
                    <span>{guest.roomType}</span>
                  </div>
                </div>
              </div>
              <span className="ops-badge ops-badge-success">✓ Checked In</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckInList;
