import { create } from 'zustand';

/**
 * useToastStore - Global lightweight notification state manager.
 * Allows adding and dismissing beautiful status-themed toast banners.
 */
export const useToastStore = create((set) => ({
  toasts: [],
  
  /**
   * Adds a new toast notification.
   * @param {string} message - Toast content.
   * @param {'success'|'info'|'warning'|'error'} type - Style theme.
   * @param {number} duration - Time before automatic dismissal in ms.
   */
  addToast: (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }));

    // Auto-dismiss logic
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, duration);
  },

  /**
   * Manually dismisses a toast notification.
   * @param {string} id - Id of the toast.
   */
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  }
}));
