import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '../../context/AuthContext';
import { 
  Bars3Icon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Header = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  const { restaurant, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={onMobileMenuToggle}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>

          {/* Center - Brand (mobile) / Empty (desktop) */}
          <div className="flex items-center lg:hidden">
            <div className="text-lg font-semibold text-gray-900">
              DigiDinez
            </div>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center">
            {/* User dropdown */}
            <Menu as="div" className="relative ml-3">
              <div>
                <Menu.Button className="flex items-center max-w-xs bg-white text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  <span className="sr-only">Open user menu</span>
                  <div className="flex items-center space-x-3">
                    <div className="hidden sm:block text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {restaurant?.name || 'Loading...'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Restaurant Admin
                      </div>
                    </div>
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  </div>
                </Menu.Button>
              </div>
              
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="/profile"
                        className={`
                          flex items-center px-4 py-2 text-sm text-gray-700
                          ${active ? 'bg-gray-100' : ''}
                        `}
                      >
                        <UserCircleIcon className="mr-3 h-4 w-4" />
                        Your Profile
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`
                          flex items-center w-full px-4 py-2 text-sm text-gray-700
                          ${active ? 'bg-gray-100' : ''}
                        `}
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
