import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Dashboard = () => {
  const { restaurant, logout, loading } = useAuth();
  
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
        <button 
          onClick={logout}
          className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {restaurant.name}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your restaurant's digital menu and QR codes
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center">
                <span className="text-primary-600 font-semibold">🍽️</span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-600">Menu Items</div>
              <div className="text-2xl font-bold text-gray-900">0</div>
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
              <div className="text-sm font-medium text-gray-600">Status</div>
              <div className="text-2xl font-bold text-gray-900">
                {restaurant.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <span className="text-blue-600 font-semibold">📱</span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-600">QR Code</div>
              <div className="text-2xl font-bold text-gray-900">Ready</div>
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
            <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-400">2</span>
            </div>
            <div>
              <div className="font-medium text-gray-400">Add Menu Items</div>
              <div className="text-sm text-gray-400">Coming in Phase 4</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-400">3</span>
            </div>
            <div>
              <div className="font-medium text-gray-400">Generate QR Code</div>
              <div className="text-sm text-gray-400">Coming in Phase 5</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
