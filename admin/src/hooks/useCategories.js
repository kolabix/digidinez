import { useState, useEffect, useRef } from 'react';
import categoryService from '../services/categoryService';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasExecutedRef = useRef(false);

  // Fetch categories on mount
  useEffect(() => {
    if (!hasExecutedRef.current) {
      hasExecutedRef.current = true;
      fetchCategories();
    }
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryService.getCategories();
      setCategories(response || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData) => {
    try {
      const response = await categoryService.createCategory(categoryData);
      const newCategory = response;
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      throw err;
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      const response = await categoryService.updateCategory(id, categoryData);
      const updatedCategory = response;
      setCategories(prev => 
        prev.map(cat => cat._id === id ? updatedCategory : cat)
      );
      return updatedCategory;
    } catch (err) {
      throw err;
    }
  };

  const deleteCategory = async (id) => {
    try {
      await categoryService.deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat._id !== id));
    } catch (err) {
      throw err;
    }
  };

  const reorderCategories = async (reorderedCategories) => {
    try {
      // Optimistic update
      setCategories(reorderedCategories);
      
      // Prepare category orders for backend
      const categoryOrders = reorderedCategories.map((category, index) => ({
        id: category._id,
        sortOrder: index + 1
      }));

      // Send to backend
      const response = await categoryService.reorderCategories(categoryOrders);
      const updatedCategories = response;
      
      // Update with server response
      setCategories(updatedCategories);
    } catch (err) {
      // Revert optimistic update on error
      fetchCategories();
      throw err;
    }
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories
  };
};
