import { useCallback, useState } from 'react';

/**
 * Get restaurant slug from URL path or environment variable
 */
export function getRestaurantSlug() {
  const path = window.location.pathname;
  const match = path.match(/\/menu\/([^/]+)/);
  return match?.[1];
}

/**
 * Custom hook for managing URL query parameters without page reloads
 */
export function useQueryState(initialParams = {}) {
  const [params, setParams] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const initial = {};
    
    // Initialize with current URL params
    for (const [key, value] of searchParams.entries()) {
      initial[key] = value;
    }
    
    // Merge with initial params
    return { ...initial, ...initialParams };
  });

  const updateParams = useCallback((newParams) => {
    setParams(prev => {
      const updated = { ...prev, ...newParams };
      
      // Remove undefined/null values
      Object.keys(updated).forEach(key => {
        if (updated[key] === undefined || updated[key] === null || updated[key] === '') {
          delete updated[key];
        }
      });
      
      // Update URL without reload
      const searchParams = new URLSearchParams();
      Object.entries(updated).forEach(([key, value]) => {
        searchParams.set(key, value);
      });
      
      const newUrl = `${window.location.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      window.history.replaceState(null, '', newUrl);
      
      return updated;
    });
  }, []);

  const setParam = useCallback((key, value) => {
    updateParams({ [key]: value });
  }, [updateParams]);

  const removeParam = useCallback((key) => {
    setParams(prev => {
      const updated = { ...prev };
      delete updated[key];
      
      const searchParams = new URLSearchParams();
      Object.entries(updated).forEach(([k, v]) => {
        searchParams.set(k, v);
      });
      
      const newUrl = `${window.location.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      window.history.replaceState(null, '', newUrl);
      
      return updated;
    });
  }, []);

  return {
    params,
    setParams: updateParams,
    setParam,
    removeParam
  };
}

/**
 * Parse comma-separated string into array
 */
export function parseCommaList(str) {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

/**
 * Convert array to comma-separated string
 */
export function stringifyCommaList(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return '';
  return arr.join(',');
}
