import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ClipboardDocumentListIcon, 
  TagIcon,
  ListBulletIcon,
  ArrowUpTrayIcon 
} from '@heroicons/react/24/outline';
import { Categories } from '../components/menu/Categories';
import { Tags } from '../components/menu/Tags';
import { MenuItems } from '../components/menu/MenuItems';
import { BulkUpload } from '../components/menu/BulkUpload';

export const MenuManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Determine active tab from URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/categories')) return 'categories';
    if (path.includes('/tags')) return 'tags';
    if (path.includes('/items')) return 'items';
    if (path.includes('/bulk-upload')) return 'bulk-upload';
    return 'categories'; // default
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  const tabs = [
    {
      id: 'categories',
      name: 'Categories',
      icon: ClipboardDocumentListIcon,
      path: '/menu/categories',
      description: 'Organize your menu with categories',
      available: true
    },
    {
      id: 'tags',
      name: 'Tags',
      icon: TagIcon,
      path: '/menu/tags',
      description: 'Create flexible labels for menu items',
      available: true
    },
    {
      id: 'items',
      name: 'Menu Items',
      icon: ListBulletIcon,
      path: '/menu/items',
      description: 'Manage your complete menu inventory',
      available: true
    },
    {
      id: 'bulk-upload',
      name: 'Bulk Upload',
      icon: ArrowUpTrayIcon,
      path: '/menu/bulk-upload',
      description: 'Import menu data from Excel/CSV files',
      available: true
    }
  ];

  const handleTabChange = (tab) => {
    if (!tab.available) return;
    
    setActiveTab(tab.id);
    navigate(tab.path);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'categories':
        return <Categories />;
      case 'tags':
        return <Tags />;
      case 'items':
        return <MenuItems />;
      case 'bulk-upload':
        return <BulkUpload />;
      default:
        return <Categories />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
        <p className="mt-1 text-sm text-gray-500">
          Organize and manage your restaurant's digital menu
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isDisabled = !tab.available;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab)}
                disabled={isDisabled}
                className={`
                  group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium
                  ${isActive
                    ? 'border-primary-500 text-primary-600 cursor-pointer'
                    : isDisabled
                    ? 'border-transparent text-gray-400 cursor-not-allowed'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 cursor-pointer'
                  }
                `}
              >
                <Icon 
                  className={`
                    -ml-0.5 mr-2 h-5 w-5
                    ${isActive
                      ? 'text-primary-500'
                      : isDisabled
                      ? 'text-gray-400'
                      : 'text-gray-400 group-hover:text-gray-500'
                    }
                  `}
                />
                {tab.name}
                {isDisabled && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
};
