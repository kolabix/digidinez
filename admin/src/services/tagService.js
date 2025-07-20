import api from './api';

// Get all tags for the authenticated restaurant
export const getTags = async () => {
  try {
    const response = await api.get('/menu/tags');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch tags' };
  }
};

// Create a new tag
export const createTag = async (tagData) => {
  try {
    const response = await api.post('/menu/tags', tagData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create tag' };
  }
};

// Update an existing tag
export const updateTag = async (tagId, tagData) => {
  try {
    const response = await api.put(`/menu/tags/${tagId}`, tagData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update tag' };
  }
};

// Delete a tag
export const deleteTag = async (tagId) => {
  try {
    const response = await api.delete(`/menu/tags/${tagId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete tag' };
  }
};

// Get public tags for a restaurant (no authentication required)
export const getPublicTags = async (restaurantId) => {
  try {
    const response = await api.get(`/menu/tags/public/${restaurantId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch public tags' };
  }
};

export default {
  getTags,
  createTag,
  updateTag,
  deleteTag,
  getPublicTags
};
