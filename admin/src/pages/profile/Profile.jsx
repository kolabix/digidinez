import Layout from '../../components/layout/Layout';

const Profile = () => {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Restaurant Profile
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your restaurant information and settings
          </p>
        </div>

        {/* Profile Sections Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-600">Restaurant Name</div>
                <div className="text-gray-900">Coming in Session 4</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-600">Contact Information</div>
                <div className="text-gray-900">Email & Phone Management</div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Address Information
            </h2>
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-600">Location</div>
                <div className="text-gray-900">Address Management</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-600">Service Area</div>
                <div className="text-gray-900">Delivery & Pickup Settings</div>
              </div>
            </div>
          </div>

          {/* Restaurant Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Restaurant Status
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-600">Current Status</div>
              <div className="text-gray-900">Active/Inactive Toggle</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <button className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                Edit Profile Information
              </button>
              <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                Manage Address
              </button>
              <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                Update Business Hours
              </button>
            </div>
          </div>
        </div>

        {/* Development Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-blue-600 font-semibold">ℹ️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Development Status
              </h3>
              <div className="mt-1 text-sm text-blue-700">
                <p>This is a placeholder page for Session 2 navigation testing.</p>
                <p>Full profile management functionality will be implemented in Sessions 3-4.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
