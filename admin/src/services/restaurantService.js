import api from './api';

// Restaurant API Service
const restaurantService = {
  // Get restaurant profile
  async getProfile() {
    try {
      const response = await api.get('/restaurants/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Update restaurant profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/restaurants/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Toggle restaurant status (Active/Inactive)
  async toggleStatus(newStatus) {
    try {
      console.log('🔄 Frontend: Sending toggle status request:', { isActive: newStatus, type: typeof newStatus });
      const response = await api.patch('/restaurants/status', {
        isActive: newStatus
      });
      console.log('✅ Frontend: Toggle status response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Frontend: Toggle status error:', error);
      console.error('❌ Frontend: Error response:', error.response?.data);
      throw error;
    }
  },

  // Get restaurant statistics (for future use)
  async getStats() {
    try {
      const response = await api.get('/restaurants/stats');
      return response.data;
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  },

  // Update restaurant address specifically
  async updateAddress(addressData) {
    try {
      const response = await api.put('/restaurants/profile', {
        address: addressData
      });
      return response.data;
    } catch (error) {
      console.error('Update address error:', error);
      throw error;
    }
  },

  // Validate email uniqueness (for form validation)
  async validateEmail(email, currentEmail) {
    try {
      if (email === currentEmail) {
        return { isValid: true };
      }
      
      // This would be a separate endpoint, but we can use the update
      // endpoint to check for validation errors
      const response = await api.put('/restaurants/profile', {
        email: email
      });
      return { isValid: true };
    } catch (error) {
      if (error.response?.status === 400 && 
          error.response?.data?.message?.includes('email')) {
        return { isValid: false, message: 'Email already exists' };
      }
      throw error;
    }
  },

  // Validate phone uniqueness (for form validation)
  async validatePhone(phone, currentPhone) {
    try {
      if (phone === currentPhone) {
        return { isValid: true };
      }
      
      // Similar to email validation
      const response = await api.put('/restaurants/profile', {
        phone: phone
      });
      return { isValid: true };
    } catch (error) {
      if (error.response?.status === 400 && 
          error.response?.data?.message?.includes('phone')) {
        return { isValid: false, message: 'Phone number already exists' };
      }
      throw error;
    }
  }
};

export default restaurantService;
