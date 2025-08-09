import api from './api';

const menuItemService = {
  // Get all menu items with optional filters
  getItems: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.categories?.length) params.append('categories', filters.categories.join(','));
    if (filters.tags?.length) params.append('tags', filters.tags.join(','));
    if (filters.foodType) params.append('foodType', filters.foodType);
    if (filters.spicyLevel !== null) params.append('spicyLevel', filters.spicyLevel);
    if (filters.isAvailable !== null) params.append('isAvailable', filters.isAvailable);

    const response = await api.get(`/menu/items?${params.toString()}`);
    return response.data;
  },

  // Get a single menu item by ID
  getItem: async (id) => {
    const response = await api.get(`/menu/items/${id}`);
    return response.data;
  },

  // Create a new menu item
  createItem: async (itemData) => {
    const response = await api.post('/menu/items', itemData);
    return response.data;
  },

  // Update an existing menu item
  updateItem: async (id, itemData) => {
    const response = await api.put(`/menu/items/${id}`, itemData);
    return response.data;
  },

  // Delete a menu item
  deleteItem: async (id) => {
    const response = await api.delete(`/menu/items/${id}`);
    return response.data;
  },

  // Toggle item availability
  toggleAvailability: async (id) => {
    const response = await api.patch(`/menu/items/${id}/toggle`);
    return response.data;
  },

  // Upload item image
  uploadImage: async (id, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post(
      `/menu/items/${id}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Delete item image
  deleteImage: async (id) => {
    const response = await api.delete(`/menu/items/${id}/image`);
    return response.data;
  }
};

export default menuItemService; 