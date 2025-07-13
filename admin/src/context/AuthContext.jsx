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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await authService.getCurrentUser();
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.log('No active session');
      setUser(null);
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
        setUser(response.data);
        return { success: true };
      }
    } catch (error) {
      setError(error.message || 'Login failed');
      return { success: false, error: error.message };
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
        setUser(response.data);
        return { success: true };
      }
    } catch (error) {
      setError(error.message || 'Registration failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    error,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
