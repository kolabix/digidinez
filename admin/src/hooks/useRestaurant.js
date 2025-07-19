import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import restaurantService from '../services/restaurantService';

// Custom hook for restaurant profile management
const useRestaurant = () => {
  const { restaurant: authRestaurant, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize profile from auth context
  useEffect(() => {
    if (authRestaurant) {
      setProfile(authRestaurant);
    }
  }, [authRestaurant]);

  // Fetch fresh profile data from backend
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await restaurantService.getProfile();
      if (response.success) {
        setProfile(response.data);
        // Update auth context with fresh data
        if (updateUser) {
          updateUser(response.data);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  // Update profile with optimistic updates
  const updateProfile = useCallback(async (updateData) => {
    setIsUpdating(true);
    setError(null);

    // Optimistic update - immediately update UI
    const previousProfile = profile;
    setProfile(prev => ({ ...prev, ...updateData }));

    try {
      const response = await restaurantService.updateProfile(updateData);
      if (response.success) {
        // Update with actual server response
        setProfile(response.data);
        // Update auth context
        if (updateUser) {
          updateUser(response.data);
        }
        return { success: true, data: response.data };
      }
    } catch (err) {
      // Rollback optimistic update on error
      setProfile(previousProfile);
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      console.error('Update profile error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  }, [profile, updateUser]);

  // Toggle restaurant status
  const toggleStatus = useCallback(async () => {
    setIsUpdating(true);
    setError(null);

    // Calculate new status
    const newStatus = !profile.isActive;

    // Optimistic update
    const previousProfile = profile;
    setProfile(prev => ({ ...prev, isActive: newStatus }));

    try {
      const response = await restaurantService.toggleStatus(newStatus);
      if (response.success) {
        setProfile(response.data);
        // Update auth context
        if (updateUser) {
          updateUser(response.data);
        }
        return { success: true, data: response.data };
      }
    } catch (err) {
      // Rollback on error
      setProfile(previousProfile);
      const errorMessage = err.response?.data?.message || 'Failed to toggle status';
      setError(errorMessage);
      console.error('Toggle status error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  }, [profile, updateUser]);

  // Update address specifically
  const updateAddress = useCallback(async (addressData) => {
    setIsUpdating(true);
    setError(null);

    // Optimistic update
    const previousProfile = profile;
    setProfile(prev => ({ 
      ...prev, 
      address: { ...prev.address, ...addressData }
    }));

    try {
      const response = await restaurantService.updateAddress(addressData);
      if (response.success) {
        setProfile(response.data);
        // Update auth context
        if (updateUser) {
          updateUser(response.data);
        }
        return { success: true, data: response.data };
      }
    } catch (err) {
      // Rollback on error
      setProfile(previousProfile);
      const errorMessage = err.response?.data?.message || 'Failed to update address';
      setError(errorMessage);
      console.error('Update address error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  }, [profile, updateUser]);

  // Validate email uniqueness
  const validateEmail = useCallback(async (email) => {
    try {
      const result = await restaurantService.validateEmail(email, profile?.email);
      return result;
    } catch (err) {
      console.error('Email validation error:', err);
      return { isValid: false, message: 'Validation failed' };
    }
  }, [profile?.email]);

  // Validate phone uniqueness
  const validatePhone = useCallback(async (phone) => {
    try {
      const result = await restaurantService.validatePhone(phone, profile?.phone);
      return result;
    } catch (err) {
      console.error('Phone validation error:', err);
      return { isValid: false, message: 'Validation failed' };
    }
  }, [profile?.phone]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh profile data
  const refresh = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    // State
    profile,
    loading,
    error,
    isUpdating,

    // Actions
    fetchProfile,
    updateProfile,
    toggleStatus,
    updateAddress,
    validateEmail,
    validatePhone,
    clearError,
    refresh,

    // Computed values
    isActive: profile?.isActive || false,
    hasAddress: !!(profile?.address?.street && profile?.address?.city),
    isProfileComplete: !!(profile?.name && profile?.email && profile?.phone)
  };
};

export default useRestaurant;
