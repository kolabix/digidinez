import qrGenerator from '../utils/qrGenerator.js';
import { Restaurant } from '../models/index.js';

/**
 * Generate or regenerate QR code for restaurant
 * POST /restaurants/generate-qr
 */
export const generateQRCode = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;

    // Load current restaurant to check for existing QR
    const current = await Restaurant.findById(restaurantId).select('name qrCodeUrl');
    if (!current) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // If an older QR exists, delete it from Blob (best-effort; don’t fail the whole request)
    if (current.qrCodeUrl) {
      try { await qrGenerator.deleteQRCode(current.qrCodeUrl); } catch (_) {}
    }

    // Generate a fresh QR (uploaded to Blob)
    const qrDetails = await qrGenerator.generateQRCode(restaurantId);

    // Save the new public URL
    current.qrCodeUrl = qrDetails.publicUrl;
    await current.save();

    return res.status(200).json({
      success: true,
      message: 'QR code generated successfully',
      data: {
        qrCode: {
          url: qrDetails.url,            // destination the QR points to
          publicUrl: qrDetails.publicUrl, // Blob URL
          fileName: qrDetails.fileName,
          size: qrDetails.size,
          generatedAt: qrDetails.generatedAt
        },
        restaurant: {
          id: current._id,
          name: current.name,
          qrCodeUrl: current.qrCodeUrl
        }
      }
    });

  } catch (error) {
    console.error('Generate QR code error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get current QR code information
 * GET /restaurants/qr
 */
export const getQRCode = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;

    // With Blob, the source of truth is the DB (qrCodeUrl), not the filesystem
    const restaurant = await Restaurant.findById(restaurantId).select('name qrCodeUrl');
    if (!restaurant || !restaurant.qrCodeUrl) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found. Generate one first.'
      });
    }

    // We can reconstruct the menu URL deterministically
    const menuUrlBase = process.env.PUBLIC_MENU_URL || 'http://localhost:4000';
    const menuUrl = `${menuUrlBase}/menu/${restaurantId}`;

    return res.status(200).json({
      success: true,
      data: {
        qrCode: {
          url: menuUrl,
          publicUrl: restaurant.qrCodeUrl,
          // size & generatedAt are unknown unless you stored them at creation time
          size: null,
          generatedAt: null
        },
        restaurant: {
          id: restaurantId,
          name: restaurant.name,
          qrCodeUrl: restaurant.qrCodeUrl
        }
      }
    });

  } catch (error) {
    console.error('Get QR code error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve QR code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete QR code
 * DELETE /restaurants/qr
 */
export const deleteQRCode = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;

    const restaurant = await Restaurant.findById(restaurantId).select('qrCodeUrl');
    if (!restaurant || !restaurant.qrCodeUrl) {
      return res.status(404).json({ success: false, message: 'No QR code to delete' });
    }

    // Delete from Blob using the public URL
    let fileDeleted = false;
    try {
      await qrGenerator.deleteQRCode(restaurant.qrCodeUrl);
      fileDeleted = true;
    } catch (_) {
      fileDeleted = false;
    }

    // Remove reference from DB regardless (idempotent)
    restaurant.qrCodeUrl = null;
    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: 'QR code deleted successfully',
      data: { fileDeleted }
    });

  } catch (error) {
    console.error('Delete QR code error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete QR code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get QR code image info (public endpoint)
 * GET /restaurants/:id/qr
 */
export const getQRCodeImage = async (req, res) => {
  try {
    const { id: restaurantId } = req.params;

    if (!restaurantId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant ID format' });
    }

    const restaurant = await Restaurant.findById(restaurantId).select('name qrCodeUrl');
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    if (!restaurant.qrCodeUrl) {
      return res.status(404).json({ success: false, message: 'QR code not found for this restaurant' });
    }

    // Option A (JSON info):
    const menuUrlBase = process.env.PUBLIC_MENU_URL || 'http://localhost:4000';
    const menuUrl = `${menuUrlBase}/menu/${restaurantId}`;

    return res.status(200).json({
      success: true,
      data: {
        restaurant: { id: restaurant._id, name: restaurant.name },
        qrCode: {
          url: menuUrl,
          publicUrl: restaurant.qrCodeUrl
        }
      }
    });

    // Option B (redirect straight to the image):
    // return res.redirect(302, restaurant.qrCodeUrl);

  } catch (error) {
    console.error('Get QR code image error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve QR code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
