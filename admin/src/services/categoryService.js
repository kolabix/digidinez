import api from './api';

const categoryService = {
  // Get all categories for the authenticated restaurant
  getCategories: async () => {
    try {
      const response = await api.get('/menu/categories');
      return response.data.data.categories;
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  },

  // Create a new category
  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/menu/categories', categoryData);
      return response.data.data.category;
    } catch (error) {
      console.error('Create category error:', error);
      throw error;
    }
  },

  // Update an existing category
  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/menu/categories/${id}`, categoryData);
      return response.data.data.category;
    } catch (error) {
      console.error('Update category error:', error);
      throw error;
    }
  },

  // Delete a category
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/menu/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete category error:', error);
      throw error;
    }
  },

  // Reorder categories
  reorderCategories: async (categoryOrders) => {
    try {
      const response = await api.patch('/menu/categories/reorder', {
        categoryOrders
      });
      return response.data.data.categories;
    } catch (error) {
      console.error('Reorder categories error:', error);
      throw error;
    }
  }
};

export default categoryService;
