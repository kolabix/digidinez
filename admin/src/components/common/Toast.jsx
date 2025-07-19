import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

const Toast = ({ type = 'success', message, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

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
      'fixed top-4 right-4 max-w-sm w-full bg-white shadow-lg rounded-lg border-l-4 p-4 z-50 transform transition-all duration-300 ease-in-out',
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

export default Toast;
