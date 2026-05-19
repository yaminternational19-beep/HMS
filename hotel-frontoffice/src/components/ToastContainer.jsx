import React from 'react';
import { useToastStore } from '../store/useToastStore';
import { MdCheckCircle, MdInfo, MdWarning, MdError, MdClose } from 'react-icons/md';

/**
 * ToastContainer - Listens to the global useToastStore state
 * and renders self-dismissing luxury toast notifications.
 */
const ToastContainer = () => {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <MdCheckCircle className="text-emerald-600 flex-shrink-0" size={20} />;
      case 'warning':
        return <MdWarning className="text-amber-500 flex-shrink-0" size={20} />;
      case 'error':
        return <MdError className="text-red-500 flex-shrink-0" size={20} />;
      case 'info':
      default:
        return <MdInfo className="text-blue-500 flex-shrink-0" size={20} />;
    }
  };

  const getStyleClasses = (type) => {
    switch (type) {
      case 'success':
        return 'border-emerald-100 bg-emerald-50 text-emerald-800 shadow-emerald-50/20';
      case 'warning':
        return 'border-amber-100 bg-amber-50 text-amber-800 shadow-amber-50/20';
      case 'error':
        return 'border-red-100 bg-red-50 text-red-800 shadow-red-50/20';
      case 'info':
      default:
        return 'border-blue-100 bg-blue-50 text-blue-800 shadow-blue-50/20';
    }
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 p-4 border rounded-xl shadow-lg backdrop-blur-sm pointer-events-auto animate-slide-in-right transition-all ${getStyleClasses(
            toast.type
          )}`}
        >
          {getIcon(toast.type)}
          <span className="text-sm font-semibold flex-grow leading-snug">
            {toast.message}
          </span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition-colors cursor-pointer"
          >
            <MdClose size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
