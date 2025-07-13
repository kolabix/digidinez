import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { restaurant, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!restaurant) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DigiDinez Admin</h1>
              <p className="text-sm text-gray-600">Welcome, {restaurant.name}!</p>
            </div>
            <button
              onClick={logout}
              className="btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="card p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Restaurant Dashboard
            </h2>
            <p className="text-gray-600 mb-6">
              Your restaurant management dashboard will be built in the upcoming phases.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card p-6 text-center">
                <h3 className="font-medium text-gray-900 mb-2">Menu Management</h3>
                <p className="text-sm text-gray-500">Coming in Phase 4</p>
              </div>
              <div className="card p-6 text-center">
                <h3 className="font-medium text-gray-900 mb-2">QR Codes</h3>
                <p className="text-sm text-gray-500">Coming in Phase 5</p>
              </div>
              <div className="card p-6 text-center">
                <h3 className="font-medium text-gray-900 mb-2">Restaurant Profile</h3>
                <p className="text-sm text-gray-500">Coming in Phase 3</p>
              </div>
            </div>

            {/* Restaurant Info */}
            {restaurant && (
              <div className="mt-8 card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Restaurant Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><span className="font-medium">Name:</span> {restaurant.name}</p>
                    <p><span className="font-medium">Email:</span> {restaurant.email}</p>
                    <p><span className="font-medium">Phone:</span> {restaurant.phone}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        restaurant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {restaurant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                    {restaurant.address && (
                      <p><span className="font-medium">Address:</span> {restaurant.address.street}, {restaurant.address.city}, {restaurant.address.state}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
