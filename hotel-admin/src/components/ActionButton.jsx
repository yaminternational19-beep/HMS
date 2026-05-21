import React from 'react';

/**
 * ActionButton - A premium, reusable global action button component
 * supporting table actions, primary/secondary styles, hover effects,
 * icons, tooltips, and interactive states.
 */
const ActionButton = ({
  children,
  onClick,
  variant = 'default',
  icon: Icon,
  iconSize = 18,
  title = '',
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) => {
  // Map variant to styling classes
  const getVariantClasses = () => {
    switch (variant) {
      // Table icon action buttons (styled in global-table.css)
      case 'table-view':
        return 'action-btn action-btn-view';
      case 'table-edit':
        return 'action-btn action-btn-edit';
      case 'table-delete':
        return 'action-btn action-btn-delete';
      
      // Standard button variants
      case 'primary':
        return 'flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
      
      case 'secondary':
        return 'flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 hover:text-accent hover:border-accent rounded-lg text-sm font-semibold transition-all bg-white shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
      
      case 'pdf':
        return 'flex items-center justify-center gap-1.5 px-4 py-1.5 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 rounded-lg text-sm font-semibold transition-all bg-red-50/30 shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

      case 'excel':
        return 'flex items-center justify-center gap-1.5 px-4 py-1.5 border border-emerald-200 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 rounded-lg text-sm font-semibold transition-all bg-emerald-50/30 shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
      
      case 'success':
        return 'flex items-center justify-center gap-1.5 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
      
      case 'danger':
        return 'flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
      
      case 'add-member':
        return 'flex items-center gap-1 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

      case 'remove-member':
        return 'text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors cursor-pointer';

      default:
        return 'action-btn';
    }
  };

  const variantClasses = getVariantClasses();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${variantClasses} ${className}`}
      {...props}
    >
      {Icon && <Icon size={iconSize} className="flex-shrink-0" />}
      {children}
    </button>
  );
};

export default ActionButton;
