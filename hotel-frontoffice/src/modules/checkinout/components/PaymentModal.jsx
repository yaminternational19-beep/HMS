import React, { useState, useEffect } from 'react';
import { MdClose, MdPayment } from 'react-icons/md';
import ActionButton from '../../../components/ActionButton';

const PaymentModal = ({ isOpen, onClose, guest, onSubmit }) => {
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPaymentMethod('Cash');
      setTransactionId('');
    }
  }, [isOpen]);

  if (!isOpen || !guest) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      paymentMethod,
      transactionId,
      amountToPay: guest.balance
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-slide-up flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <MdPayment size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Settle Balance</h3>
              <p className="text-xs font-semibold text-slate-500">Pay outstanding amount for check-out</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex justify-between items-center">
            <span className="text-sm font-bold text-amber-800">Due Amount</span>
            <span className="text-2xl font-extrabold text-amber-600">₹{guest.balance?.toLocaleString()}</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:border-primary shadow-sm"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            {paymentMethod !== 'Cash' && (
              <div className="space-y-1 animate-fade-in">
                <label className="text-xs font-bold text-slate-700">Transaction ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. TXN123456789"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-primary shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <ActionButton type="button" variant="secondary" onClick={onClose}>
              Cancel
            </ActionButton>
            <ActionButton type="submit" variant="primary">
              Confirm Payment
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
