import api from './api';

/**
 * QR Code Service
 * Handles all QR code related API calls
 */

/**
 * Generate or regenerate QR code for the current restaurant
 */
export const generateQRCode = async () => {
  try {
    const response = await api.post('/restaurants/generate-qr');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get current restaurant's QR code information
 */
export const getQRCode = async () => {
  try {
    const response = await api.get('/restaurants/qr');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete current restaurant's QR code
 */
export const deleteQRCode = async () => {
  try {
    const response = await api.delete('/restaurants/qr');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get QR code image URL for a specific restaurant (public endpoint)
 */
export const getQRCodeImage = async (restaurantId) => {
  try {
    const response = await api.get(`/restaurants/${restaurantId}/qr`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
