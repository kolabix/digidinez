import qrGenerator from '../utils/qrGenerator.js';
import { Restaurant } from '../models/index.js';
import { validationResult } from 'express-validator';

/**
 * QR Code Controller
 * Handles QR code generation and management for restaurants
 */

/**
 * Generate or regenerate QR code for restaurant
 * POST /api/restaurants/generate-qr
 */
export const generateQRCode = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;

    // Ensure QR codes directory exists
    await qrGenerator.ensureQRCodeDirectory();

    // Generate QR code
    const qrDetails = await qrGenerator.generateQRCode(restaurantId);

    // Update restaurant with QR code URL
    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { qrCodeUrl: qrDetails.publicUrl },
      { new: true, select: '-password' }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'QR code generated successfully',
      data: {
        qrCode: {
          url: qrDetails.url,
          publicUrl: qrDetails.publicUrl,
          fileName: qrDetails.fileName,
          size: qrDetails.size,
          generatedAt: qrDetails.generatedAt
        },
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          qrCodeUrl: restaurant.qrCodeUrl
        }
      }
    });

  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get current QR code information
 * GET /api/restaurants/qr
 */
export const getQRCode = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;

    // Get QR code details from file system
    const qrDetails = await qrGenerator.getQRCode(restaurantId);

    if (!qrDetails) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found. Generate one first.'
      });
    }

    // Get restaurant info
    const restaurant = await Restaurant.findById(restaurantId).select('-password');

    res.status(200).json({
      success: true,
      data: {
        qrCode: {
          url: qrDetails.url,
          publicUrl: qrDetails.publicUrl,
          fileName: qrDetails.fileName,
          size: qrDetails.size,
          generatedAt: qrDetails.generatedAt
        },
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          qrCodeUrl: restaurant.qrCodeUrl
        }
      }
    });

  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve QR code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete QR code
 * DELETE /api/restaurants/qr
 */
export const deleteQRCode = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;

    // Delete QR code file
    const deleted = await qrGenerator.deleteQRCode(restaurantId);

    // Update restaurant to remove QR code URL
    await Restaurant.findByIdAndUpdate(
      restaurantId,
      { qrCodeUrl: null }
    );

    res.status(200).json({
      success: true,
      message: 'QR code deleted successfully',
      data: {
        fileDeleted: deleted
      }
    });

  } catch (error) {
    console.error('Delete QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete QR code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get QR code image file (public endpoint)
 * GET /api/restaurants/:id/qr
 */
export const getQRCodeImage = async (req, res) => {
  try {
    const { id: restaurantId } = req.params;

    // Validate restaurant ID format
    if (!restaurantId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID format'
      });
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Get QR code details
    const qrDetails = await qrGenerator.getQRCode(restaurantId);
    if (!qrDetails) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found for this restaurant'
      });
    }

    // Return QR code info (the actual image will be served by static middleware)
    res.status(200).json({
      success: true,
      data: {
        restaurant: {
          id: restaurant._id,
          name: restaurant.name
        },
        qrCode: {
          url: qrDetails.url,
          publicUrl: qrDetails.publicUrl,
          size: qrDetails.size,
          generatedAt: qrDetails.generatedAt
        }
      }
    });

  } catch (error) {
    console.error('Get QR code image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve QR code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
