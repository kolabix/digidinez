import React, { useState, useEffect } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Layout from '../../components/layout/Layout';
import ProfileForm from './ProfileForm';
import useRestaurant from '../../hooks/useRestaurant';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const { 
    profile, 
    loading, 
    error, 
    fetchProfile, 
    updateProfile, 
    toggleStatus 
  } = useRestaurant();

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async (profileData) => {
    try {
      await updateProfile(profileData);
      setIsEditing(false);
      showNotification('Profile updated successfully!', 'success');
    } catch (err) {
      showNotification(err.message || 'Failed to update profile', 'error');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleStatusToggle = async () => {
    try {
      await toggleStatus();
      showNotification(
        `Restaurant ${profile?.isActive ? 'deactivated' : 'activated'} successfully!`, 
        'success'
      );
    } catch (err) {
      showNotification(err.message || 'Failed to update status', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  if (loading && !profile) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (error && !profile) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading profile: {error}</p>
          <button 
            onClick={fetchProfile}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Notification */}
        {notification && (
          <div className={`rounded-lg p-4 ${
            notification.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm ${
              notification.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {notification.message}
            </p>
          </div>
        )}

        {/* Page Header */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Restaurant Profile</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your restaurant information and settings
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  profile?.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {profile?.isActive ? 'Active' : 'Inactive'}
                </span>
                {!isEditing ? (
                  <button 
                    onClick={handleEditToggle}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleCancel}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        {isEditing ? (
          <ProfileForm 
            profile={profile}
            onSave={handleSave}
            onCancel={handleCancel}
            loading={loading}
          />
        ) : (
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
        )}

        {/* Restaurant Status */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Restaurant Status
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Your restaurant is currently <span className={`font-medium ${profile?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {profile?.isActive ? 'active' : 'inactive'}
                  </span> {profile?.isActive ? 'and visible to customers' : 'and hidden from customers'}.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Toggle this setting to temporarily {profile?.isActive ? 'disable' : 'enable'} your restaurant's public menu.
                </p>
              </div>
              <button 
                onClick={handleStatusToggle}
                disabled={loading}
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  profile?.isActive ? 'bg-primary-600' : 'bg-gray-200'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className={`${
                  profile?.isActive ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
