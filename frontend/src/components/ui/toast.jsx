// Bridge to shadcn/ui Sonner toast system
import { Toaster, toast as sonnerToast } from 'sonner';
import React, { createContext, useContext } from 'react';

// Context for compatibility with previous useToast usage
const ToastContext = createContext({ showToast: () => {} });

export function ToastProvider({ children }) {
  // Provide a showToast function compatible with previous usage
  const showToast = (message, options = {}) => {
    sonnerToast(message, {
      duration: options.duration || 3500,
      // Add data-testid for registration toast
      'data-testid': message === "Registration successful! Please check your email and confirm your account."
        ? 'register-toast'
        : 'toast',
      ...options,
    });
  };
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toaster position="bottom-right" richColors closeButton />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
} 