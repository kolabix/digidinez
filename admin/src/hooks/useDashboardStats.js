import { useState, useEffect, useRef, useCallback } from 'react';
import restaurantService from '../services/restaurantService';

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    restaurant: {
      name: '',
      isActive: false,
      hasQrCode: false
    },
    menu: {
      totalItems: 0,
      availableItems: 0,
      unavailableItems: 0,
      totalCategories: 0,
      itemsWithImages: 0,
      itemsWithoutImages: 0
    },
    percentages: {
      availabilityRate: 0,
      imageCompletionRate: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasExecutedRef = useRef(false);

  // Fetch dashboard stats from API
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching dashboard stats...');
      const response = await restaurantService.getStats();
      console.log('Dashboard stats response:', response);
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load stats on component mount
  useEffect(() => {
    if (!hasExecutedRef.current) {
      hasExecutedRef.current = true;
      fetchStats();
    }
  }, [fetchStats]);

  // Refresh stats
  const refreshStats = useCallback(() => {
    hasExecutedRef.current = false;
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refreshStats
  };
};
