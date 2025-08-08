import { useAuth } from '../context/AuthContext';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';

export const Dashboard = () => {
  const { restaurant, logout, loading: authLoading } = useAuth();
  const { stats, loading: statsLoading, error, refreshStats } = useDashboardStats();
  
  const loading = authLoading || statsLoading;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">No restaurant data found</h2>
        <p className="mt-2 text-gray-600">Please try logging in again.</p>
        <Button 
          onClick={logout}
          className="mt-4"
        >
          Logout
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Error loading dashboard</h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <Button 
          onClick={refreshStats}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {stats.restaurant.name || restaurant.name || 'Restaurant'}!
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your restaurant's digital menu and QR codes
            </p>
          </div>
          <Button 
            onClick={refreshStats}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center">
                <span className="text-primary-600 font-semibold">🍽️</span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-600">Total Menu Items</div>
              <div className="text-2xl font-bold text-gray-900">{stats.menu.totalItems}</div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <span className="text-green-600 font-semibold">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-600">Available Items</div>
              <div className="text-2xl font-bold text-gray-900">{stats.menu.availableItems}</div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <span className="text-blue-600 font-semibold">📁</span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-600">Categories</div>
              <div className="text-2xl font-bold text-gray-900">{stats.menu.totalCategories}</div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                <span className="text-purple-600 font-semibold">📱</span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-600">QR Code</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.restaurant.hasQrCode ? 'Ready' : 'Not Generated'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">Restaurant Status</div>
              <div className="text-lg font-semibold text-gray-900">
                {stats.restaurant.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${stats.restaurant.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">Availability Rate</div>
              <div className="text-lg font-semibold text-gray-900">
                {stats.menu.totalItems > 0 ? `${stats.percentages.availabilityRate}%` : 'N/A'}
              </div>
            </div>
            <div className="w-12 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-green-500 rounded-full" 
                style={{ width: `${stats.percentages.availabilityRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-600">Images Added</div>
              <div className="text-lg font-semibold text-gray-900">
                {stats.menu.totalItems > 0 ? `${stats.percentages.imageCompletionRate}%` : 'N/A'}
              </div>
            </div>
            <div className="w-12 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-blue-500 rounded-full" 
                style={{ width: `${stats.percentages.imageCompletionRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h2>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-primary-600">1</span>
            </div>
            <div>
              <div className="font-medium text-gray-900">Complete Your Profile</div>
              <div className="text-sm text-gray-600">Add your restaurant details and address</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
              stats.menu.totalItems > 0 ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <span className={`text-xs font-semibold ${
                stats.menu.totalItems > 0 ? 'text-green-600' : 'text-gray-400'
              }`}>2</span>
            </div>
            <div>
              <div className={`font-medium ${
                stats.menu.totalItems > 0 ? 'text-gray-900' : 'text-gray-400'
              }`}>Add Menu Items</div>
              <div className="text-sm text-gray-600">
                {stats.menu.totalItems > 0 
                  ? `${stats.menu.totalItems} items added` 
                  : 'Start adding your menu items'
                }
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
              stats.restaurant.hasQrCode ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <span className={`text-xs font-semibold ${
                stats.restaurant.hasQrCode ? 'text-green-600' : 'text-gray-400'
              }`}>3</span>
            </div>
            <div>
              <div className={`font-medium ${
                stats.restaurant.hasQrCode ? 'text-gray-900' : 'text-gray-400'
              }`}>Generate QR Code</div>
              <div className="text-sm text-gray-600">
                {stats.restaurant.hasQrCode 
                  ? 'QR code is ready for use' 
                  : 'Generate QR code for your menu'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
