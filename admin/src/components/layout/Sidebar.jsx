import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon,
  UserIcon,
  DocumentTextIcon,
  QrCodeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { restaurant } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      current: location.pathname === '/dashboard'
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: UserIcon,
      current: location.pathname.startsWith('/profile')
    },
    {
      name: 'Menu Management',
      href: '/menu/categories',
      icon: DocumentTextIcon,
      current: location.pathname.startsWith('/menu'),
      disabled: false // Phase 4 - Session 1 Complete
    },
    {
      name: 'QR Codes',
      href: '/qr',
      icon: QrCodeIcon,
      current: location.pathname.startsWith('/qr'),
      disabled: true // Phase 5
    }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          {/* Restaurant Info */}
          <div className="flex flex-1 flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="text-lg font-semibold text-gray-900">
                DigiDinez
              </div>
            </div>
            
            {/* Restaurant Name */}
            <div className="mt-4 px-4">
              <div className="text-sm text-gray-600">Restaurant</div>
              <div className="font-medium text-gray-900 truncate">
                {restaurant?.name || 'Loading...'}
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="mt-8 flex-1 space-y-1 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.disabled ? '#' : item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${item.current
                      ? 'bg-primary-100 text-primary-900'
                      : item.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={item.disabled ? (e) => e.preventDefault() : undefined}
                >
                  <item.icon
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${item.current
                        ? 'text-primary-500'
                        : item.disabled
                        ? 'text-gray-400'
                        : 'text-gray-400 group-hover:text-gray-500'
                      }
                    `}
                  />
                  {item.name}
                  {item.disabled && (
                    <span className="ml-auto text-xs text-gray-400">Soon</span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`
        fixed inset-0 flex z-40 lg:hidden
        ${isOpen ? 'block' : 'hidden'}
      `}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          {/* Close button */}
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          
          {/* Mobile navigation content (same as desktop) */}
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <div className="text-lg font-semibold text-gray-900">
                DigiDinez
              </div>
            </div>
            
            <div className="mt-4 px-4">
              <div className="text-sm text-gray-600">Restaurant</div>
              <div className="font-medium text-gray-900 truncate">
                {restaurant?.name || 'Loading...'}
              </div>
            </div>
            
            <nav className="mt-8 space-y-1 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.disabled ? '#' : item.href}
                  className={`
                    group flex items-center px-2 py-2 text-base font-medium rounded-md
                    ${item.current
                      ? 'bg-primary-100 text-primary-900'
                      : item.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={(e) => {
                    if (item.disabled) {
                      e.preventDefault();
                    } else {
                      onClose();
                    }
                  }}
                >
                  <item.icon className={`
                    mr-4 h-6 w-6 flex-shrink-0
                    ${item.current
                      ? 'text-primary-500'
                      : item.disabled
                      ? 'text-gray-400'
                      : 'text-gray-400 group-hover:text-gray-500'
                    }
                  `} />
                  {item.name}
                  {item.disabled && (
                    <span className="ml-auto text-xs text-gray-400">Soon</span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
