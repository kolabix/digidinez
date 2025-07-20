import { useState, useEffect, useRef } from 'react';
import categoryService from '../services/categoryService';

const useCategories = () => {
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
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData) => {
    try {
      const newCategory = await categoryService.createCategory(categoryData);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      throw err;
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      const updatedCategory = await categoryService.updateCategory(id, categoryData);
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
      const updatedCategories = await categoryService.reorderCategories(categoryOrders);
      
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

export default useCategories;
