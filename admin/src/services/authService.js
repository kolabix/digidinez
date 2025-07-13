import api from './api';

const authService = {
  // Login with email or phone
  login: async (identifier, password) => {
    try {
      const response = await api.post('/auth/login', {
        identifier,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Register new restaurant
  register: async (restaurantData) => {
    try {
      const response = await api.post('/auth/register', restaurantData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Logout failed' };
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get user profile' };
    }
  },
};

export default authService;
