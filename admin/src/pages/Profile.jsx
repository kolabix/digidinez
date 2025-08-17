import { useState, useEffect, useRef } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ProfileForm } from '../components/forms/ProfileForm';
import useRestaurant from '../hooks/useRestaurant';
import { Button } from '../components/common/Button';
import { toast } from '../components/common/Toast';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [dialogAction, setDialogAction] = useState(null); // Store the action when dialog opens
  const hasFetchedRef = useRef(false);
  const profileFormRef = useRef(null);
  const { 
    profile, 
    loading, 
    error, 
    fetchProfile, 
    updateProfile, 
    toggleStatus 
  } = useRestaurant();

  useEffect(() => {
    // Prevent duplicate calls in React StrictMode
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchProfile();
    }
  }, [fetchProfile]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async (profileData) => {
    try {
      await updateProfile(profileData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleStatusToggle = async () => {
    setIsTogglingStatus(true);
    try {
      await toggleStatus();
      toast.success(
        `Restaurant ${dialogAction?.isCurrentlyActive ? 'deactivated' : 'activated'} successfully!`
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setIsTogglingStatus(false);
      setShowConfirmDialog(false);
      setDialogAction(null);
    }
  };

  if (loading && !profile) {
    return (
      <div className="h-64 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading profile: {error}</p>
        <Button 
          variant="danger"
          onClick={fetchProfile}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title={`${dialogAction?.actionText || 'Toggle'} Restaurant`}
        message={`Are you sure you want to ${dialogAction?.actionText?.toLowerCase() || 'toggle'} your restaurant? This will ${dialogAction?.isCurrentlyActive ? 'hide' : 'show'} your menu from customers.`}
        confirmText={dialogAction?.actionText || 'Confirm'}
        confirmVariant={dialogAction?.actionVariant || 'danger'}
        onConfirm={handleStatusToggle}
        onCancel={() => {
          setShowConfirmDialog(false);
          setDialogAction(null);
        }}
        loading={isTogglingStatus}
      />

      {/* Page Header - Now Sticky */}
      <div className="sticky top-0 z-10 bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Restaurant Profile</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your restaurant information and settings
              </p>
            </div>
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
              <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                profile?.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {profile?.isActive ? 'Active' : 'Inactive'}
              </span>
              {!isEditing ? (
                <Button 
                  onClick={handleEditToggle}
                  className="flex items-center justify-center space-x-2 w-full sm:w-auto"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit Profile</span>
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex items-center justify-center space-x-2 flex-1 sm:flex-initial"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span>Cancel</span>
                  </Button>
                  <Button 
                    onClick={() => {
                      // Trigger form submission via ref
                      if (profileFormRef.current) {
                        profileFormRef.current.submitForm();
                      }
                    }}
                    loading={loading}
                    disabled={loading}
                    className="flex items-center justify-center space-x-2 flex-1 sm:flex-initial"
                  >
                    {!loading && <CheckIcon className="h-4 w-4" />}
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      {isEditing ? (
        <ProfileForm 
          ref={profileFormRef}
          profile={profile}
          onSave={handleSave}
          onCancel={handleCancel}
          loading={loading}
        />
      ) : (
        <div className="space-y-6">
          {/* Primary Logo Display */}
          {profile?.primaryLogoUrl && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Primary Logo
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={profile.primaryLogoUrl}
                      alt="Primary logo"
                      className="w-24 h-24 rounded-lg object-contain border border-gray-200"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Your main restaurant logo. This can be wide or rectangular and may include your restaurant name.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Brand Mark Display */}
          {profile?.brandMarkUrl && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Brand Mark (Square Logo)
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={profile.brandMarkUrl}
                      alt="Brand mark"
                      className="w-24 h-24 rounded-lg object-contain border border-gray-200"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Your square logo used for browser icons, mobile shortcuts, and other compact placements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header Display Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Public Menu Header Settings
              </h3>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  profile?.hideRestaurantNameInHeader 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {profile?.hideRestaurantNameInHeader ? 'Restaurant Name Hidden' : 'Restaurant Name Visible'}
                </span>
                <p className="text-sm text-gray-600">
                  {profile?.hideRestaurantNameInHeader 
                    ? 'Your restaurant name will not be displayed separately in the public menu header.'
                    : 'Your restaurant name will be displayed alongside the logo in the public menu header.'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Basic Information
                </h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Restaurant Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{profile?.name || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{profile?.email || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{profile?.phone || 'Not provided'}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Address
                </h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Street Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">{profile?.address?.street || 'Not provided'}</dd>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">City</dt>
                      <dd className="mt-1 text-sm text-gray-900">{profile?.address?.city || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">State</dt>
                      <dd className="mt-1 text-sm text-gray-900">{profile?.address?.state || 'Not provided'}</dd>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">ZIP Code</dt>
                      <dd className="mt-1 text-sm text-gray-900">{profile?.address?.zipCode || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Country</dt>
                      <dd className="mt-1 text-sm text-gray-900">{profile?.address?.country || 'Not provided'}</dd>
                    </div>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restaurant Status */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Restaurant Status
          </h3>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                Your restaurant is currently <span className={`font-medium ${profile?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {profile?.isActive ? 'active' : 'inactive'}
                </span> {profile?.isActive ? 'and visible to customers' : 'and hidden from customers'}.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Toggle this setting to temporarily {profile?.isActive ? 'disable' : 'enable'} your restaurant's public menu.
              </p>
            </div>
            <div className="flex items-center justify-center sm:justify-end">
              <button 
                onClick={() => {
                  // Capture the current state when opening dialog
                  setDialogAction({
                    isCurrentlyActive: profile?.isActive,
                    actionText: profile?.isActive ? 'Deactivate' : 'Activate',
                    actionVariant: profile?.isActive ? 'danger' : 'success'
                  });
                  setShowConfirmDialog(true);
                }}
                disabled={isTogglingStatus}
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  profile?.isActive ? 'bg-primary-600' : 'bg-gray-200'
                } ${isTogglingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className={`${
                  profile?.isActive ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
