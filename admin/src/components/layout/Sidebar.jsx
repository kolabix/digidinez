import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { restaurant } = useAuth();

  const navigation = [
    {
      label: 'Dashboard',
      icon: '📊',
      to: '/'
    },
    {
      label: 'Profile',
      icon: '👤',
      to: '/profile'
    },
    {
      label: 'Menu Management',
      icon: '🍽️',
      to: '/menu/categories'
    },
    {
      label: 'QR Codes',
      icon: '📱',
      to: '/qr'
    }
  ];

  // Base classes for the sidebar
  const sidebarClasses = `
    bg-white border-r border-gray-200 min-h-screen
    lg:block lg:fixed lg:w-64
    ${isOpen ? 'fixed inset-y-0 left-0 w-64 z-30' : 'hidden'}
  `;

  return (
    <div className={sidebarClasses}>
      {/* Restaurant Info */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 truncate">
          {restaurant?.name || 'Restaurant Name'}
        </h2>
        <p className="text-sm text-gray-500 truncate">
          {restaurant?.email || 'email@example.com'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navigation.map((item, index) => (
          <NavLink
          key={index}
          to={item.to}
          className={({ isActive }) => `
            flex items-center px-3 py-2 text-sm font-medium rounded-md
            ${isActive
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-700 hover:bg-gray-50'
            }
            ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={e => {
            if (item.disabled) {
              e.preventDefault();
            } else {
              onClose?.();
            }
          }}
        >
          <span className="mr-3">{item.icon}</span>
          {item.label}
        </NavLink>
        ))}
      </nav>
    </div>
  );
};
