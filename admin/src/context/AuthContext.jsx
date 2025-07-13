import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.getCurrentUser();
      if (response.success) {
        setRestaurant(response.data);
      }
    } catch (error) {
      console.log('No active session');
      setRestaurant(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(identifier, password);
      if (response.success) {
        setRestaurant(response.data);
        return { success: true };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (restaurantData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register(restaurantData);
      if (response.success) {
        // Don't set restaurant data immediately after registration
        // User will need to login after successful registration
        return { success: true, message: 'Registration successful! Please login to continue.' };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setRestaurant(null);
      setError(null);
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    restaurant,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    checkAuthStatus,
    isAuthenticated: !!restaurant,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
