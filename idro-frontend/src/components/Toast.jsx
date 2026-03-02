import React, { useState, useContext, createContext, useCallback } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, X, Info } from 'lucide-react';

// Create Toast Context
const ToastContext = createContext();

// Toast Provider Component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random(); // Ensure unique ID
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// Toast Container - Renders all active toasts
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-20 right-6 z-[9999] space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <Toast 
          key={toast.id} 
          {...toast} 
          onClose={() => removeToast(toast.id)} 
        />
      ))}
    </div>
  );
}

// Individual Toast Component
function Toast({ id, message, type, onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300); // Match animation duration
  };

  // Configuration for different toast types
  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-900/90',
      borderColor: 'border-green-500',
      iconColor: 'text-green-400',
      shadowColor: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-900/90',
      borderColor: 'border-red-500',
      iconColor: 'text-red-400',
      shadowColor: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-orange-900/90',
      borderColor: 'border-orange-500',
      iconColor: 'text-orange-400',
      shadowColor: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-900/90',
      borderColor: 'border-blue-500',
      iconColor: 'text-blue-400',
      shadowColor: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]'
    }
  };

  const { icon: Icon, bgColor, borderColor, iconColor, shadowColor } = config[type] || config.info;

  return (
    <div 
      className={`
        pointer-events-auto
        ${bgColor} 
        border ${borderColor} 
        ${shadowColor}
        backdrop-blur-md
        rounded-lg p-4 
        min-w-[320px] max-w-md
        flex items-center gap-3
        transition-all duration-300 ease-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
        animate-slideInRight
      `}
    >
      {/* Icon */}
      <div className={`p-2 rounded-full bg-black/20 flex-shrink-0`}>
        <Icon size={20} className={iconColor} />
      </div>
      
      {/* Message */}
      <p className="text-white text-sm font-medium flex-1 break-words">
        {message}
      </p>
      
      {/* Close Button */}
      <button 
        onClick={handleClose}
        className="p-1 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
        aria-label="Close notification"
      >
        <X size={16} className="text-slate-400 hover:text-white" />
      </button>
    </div>
  );
}

// Custom Hook to use Toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export { ToastContext };
export default Toast;