import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '../../context/AuthContext';
import deploymentService from '../../services/deploymentService';
import { 
  Bars3Icon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

export const Header = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  const { restaurant, logout } = useAuth();
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState('Idle');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeploymentStatus('Deploying...');
    try {
      await deploymentService.triggerDeployment();
      setDeploymentStatus('Deployment successful!');
    } catch (error) {
      setDeploymentStatus('Deployment failed.');
      console.error('Deployment failed:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16">
          {/* Left side - Mobile menu button + Desktop brand */}
          <div className="flex flex-1 items-center">
            {/* Mobile menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
              onClick={onMobileMenuToggle}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            {/* Desktop brand */}
            <div className="hidden lg:block">
              <div className="text-xl font-bold text-gray-900">
                DigiDinez
              </div>
            </div>
            
            {/* Mobile brand */}
            <div className="block lg:hidden ml-2">
              <div className="text-lg font-semibold text-gray-900">
                DigiDinez
              </div>
            </div>
          </div>

          {/* Center - Deploy Button */}
          <div className="flex items-center mr-4">
            <button
              onClick={handleDeploy}
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              disabled={isDeploying}
            >
              {isDeploying ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <RocketLaunchIcon className="mr-2 h-4 w-4" />
                  Deploy
                </>
              )}
            </button>
            {deploymentStatus && (
              <span className="ml-2 text-sm text-gray-700 hidden md:inline">
                ({deploymentStatus})
              </span>
            )}
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center">
            {/* User dropdown */}
            <Menu as="div" className="relative">
              <div>
                <Menu.Button className="flex items-center bg-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 hover:bg-gray-50 p-2 transition-colors border border-gray-200">
                  <span className="sr-only">Open user menu</span>
                  <div className="flex items-center md:space-x-3">
                    <div className="text-right">
                      <div className="hidden md:block text-sm font-medium text-gray-900">
                        {restaurant?.name || 'Loading...'}
                      </div>
                      <div className="hidden md:block text-xs text-gray-500">
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
                      <Link
                        to="/profile"
                        className={`
                          flex items-center px-4 py-2 text-sm text-gray-700 transition-colors
                          ${active ? 'bg-gray-100' : ''} hover:bg-gray-100
                        `}
                      >
                        <UserCircleIcon className="mr-3 h-4 w-4" />
                        Your Profile
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`
                          flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-colors text-left
                          ${active ? 'bg-gray-100' : ''} hover:bg-gray-100
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
