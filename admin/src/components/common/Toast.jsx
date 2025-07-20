import { createContext, useContext, useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const ToastContext = createContext(null);

// Event emitter for toast notifications
const toastEventTarget = new EventTarget();
const TOAST_EVENT = 'TOAST_EVENT';

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (event) => {
      const { type, message, duration = 4000 } = event.detail;
      const id = Date.now();
      setToasts(prev => [...prev, { id, type, message, duration }]);
      if (duration) {
        setTimeout(() => removeToast(id), duration);
      }
    };

    toastEventTarget.addEventListener(TOAST_EVENT, handleToast);
    return () => toastEventTarget.removeEventListener(TOAST_EVENT, handleToast);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-4">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </>
  );
};

const Toast = ({ type = 'success', message, onClose }) => {
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon
  };

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  };

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500'
  };

  const Icon = icons[type];

  return (
    <div className={clsx(
      'max-w-sm w-full bg-white shadow-lg rounded-lg border-l-4 p-4 transform transition-all duration-300 ease-in-out',
      styles[type]
    )}>
      <div className="flex items-start">
        <Icon className={clsx('h-5 w-5 mt-0.5 mr-3 flex-shrink-0', iconColors[type])} />
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Static methods that dispatch events instead of using hooks
export const toast = {
  success: (message, duration) => {
    toastEventTarget.dispatchEvent(
      new CustomEvent(TOAST_EVENT, {
        detail: { type: 'success', message, duration }
      })
    );
  },
  error: (message, duration) => {
    toastEventTarget.dispatchEvent(
      new CustomEvent(TOAST_EVENT, {
        detail: { type: 'error', message, duration }
      })
    );
  },
  warning: (message, duration) => {
    toastEventTarget.dispatchEvent(
      new CustomEvent(TOAST_EVENT, {
        detail: { type: 'warning', message, duration }
      })
    );
  }
};
