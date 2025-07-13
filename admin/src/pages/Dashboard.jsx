import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DigiDinez Admin</h1>
              <p className="text-sm text-gray-600">Welcome, {user.name}</p>
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
