import { Restaurant } from '../models/index.js';
import { validationResult } from 'express-validator';
import { uploadBufferToBlob, deleteBlobObject } from '../utils/imageUpload.js';

/**
 * Restaurant Profile Controller
 * Handles restaurant profile management operations
 */

// @desc    Get restaurant profile
// @route   GET /restaurants/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.restaurant.id).select('-password');
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.json({
      success: true,
      data: {
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          email: restaurant.email,
          phone: restaurant.phone,
          address: restaurant.address,
          isActive: restaurant.isActive,
          qrCodeUrl: restaurant.qrCodeUrl,
          primaryLogoUrl: restaurant.primaryLogoUrl,
          brandMarkUrl: restaurant.brandMarkUrl,
          hideRestaurantNameInHeader: restaurant.hideRestaurantNameInHeader,
          fullAddress: restaurant.fullAddress,
          createdAt: restaurant.createdAt,
          updatedAt: restaurant.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// @desc    Update restaurant profile
// @route   PUT /restaurants/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, phone, address, primaryLogoUrl, brandMarkUrl, hideRestaurantNameInHeader } = req.body;
    const restaurantId = req.restaurant.id;

    // Get current restaurant data
    const currentRestaurant = await Restaurant.findById(restaurantId);
    if (!currentRestaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check email uniqueness if email is being changed
    if (email && email.toLowerCase() !== currentRestaurant.email.toLowerCase()) {
      const emailExists = await Restaurant.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: restaurantId } // Exclude current restaurant
      });
      
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'Email address is already registered with another restaurant'
        });
      }
    }

    // Check phone uniqueness if phone is being changed
    if (phone && phone !== currentRestaurant.phone) {
      const phoneExists = await Restaurant.findOne({ 
        phone: phone,
        _id: { $ne: restaurantId } // Exclude current restaurant
      });
      
      if (phoneExists) {
        return res.status(409).json({
          success: false,
          message: 'Phone number is already registered with another restaurant'
        });
      }
    }

    // Prepare update data
    const updateData = {};
    
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (phone) updateData.phone = phone.trim();
    if (address) {
      updateData.address = {
        street: address.street?.trim() || '',
        city: address.city?.trim() || '',
        state: address.state?.trim() || '',
        zipCode: address.zipCode?.trim() || '',
        country: address.country?.trim() || 'India'
      };
    }

    // Add new dual-logo fields
    if (primaryLogoUrl !== undefined) updateData.primaryLogoUrl = primaryLogoUrl;
    if (brandMarkUrl !== undefined) updateData.brandMarkUrl = brandMarkUrl;
    if (hideRestaurantNameInHeader !== undefined) updateData.hideRestaurantNameInHeader = hideRestaurantNameInHeader;

    // Update restaurant
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      updateData,
      { 
        new: true,
        runValidators: true,
        select: '-password'
      }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        restaurant: {
          id: updatedRestaurant._id,
          name: updatedRestaurant.name,
          email: updatedRestaurant.email,
          phone: updatedRestaurant.phone,
          address: updatedRestaurant.address,
          isActive: updatedRestaurant.isActive,
          qrCodeUrl: updatedRestaurant.qrCodeUrl,
          primaryLogoUrl: updatedRestaurant.primaryLogoUrl,
          brandMarkUrl: updatedRestaurant.brandMarkUrl,
          hideRestaurantNameInHeader: updatedRestaurant.hideRestaurantNameInHeader,
          fullAddress: updatedRestaurant.fullAddress,
          updatedAt: updatedRestaurant.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// @desc    Toggle restaurant active status
// @route   PATCH /restaurants/status
// @access  Private
export const toggleStatus = async (req, res) => {
  try {
    // Check for validation errors first
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const restaurantId = req.restaurant.id;
    const { isActive } = req.body;

    // Additional validation
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive field must be a boolean value'
      });
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { isActive },
      { 
        new: true,
        select: '-password'
      }
    );

    if (!updatedRestaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.json({
      success: true,
      message: `Restaurant ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        restaurant: {
          id: updatedRestaurant._id,
          name: updatedRestaurant.name,
          email: updatedRestaurant.email,
          phone: updatedRestaurant.phone,
          address: updatedRestaurant.address,
          isActive: updatedRestaurant.isActive,
          qrCodeUrl: updatedRestaurant.qrCodeUrl,
          primaryLogoUrl: updatedRestaurant.primaryLogoUrl,
          brandMarkUrl: updatedRestaurant.brandMarkUrl,
          hideRestaurantNameInHeader: updatedRestaurant.hideRestaurantNameInHeader,
          fullAddress: updatedRestaurant.fullAddress,
          updatedAt: updatedRestaurant.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Upload restaurant primary logo
// @route   POST /restaurants/primary-logo
// @access  Private
export const uploadPrimaryLogo = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;
    
    // Get current restaurant to check if logo exists
    const currentRestaurant = await Restaurant.findById(restaurantId);
    if (!currentRestaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Delete old primary logo if it exists
    if (currentRestaurant.primaryLogoUrl) {
      try {
        await deleteBlobObject(currentRestaurant.primaryLogoUrl);
      } catch (deleteError) {
        console.warn('Failed to delete old primary logo:', deleteError);
        // Continue with upload even if deletion fails
      }
    }

    // Upload new primary logo to Vercel Blob
    const uploadResult = await uploadBufferToBlob(restaurantId, req.file, 'branding');
    
    // Update restaurant with new primary logo URL
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { primaryLogoUrl: uploadResult.publicUrl },
      { 
        new: true,
        select: '-password'
      }
    );

    // Only generate icons if there's no brand mark, since brand mark should be the primary source for icons
    if (!currentRestaurant.brandMarkUrl) {
      // Trigger icon generation in the background using primary logo as fallback
      generateIconsForRestaurant(restaurantId, uploadResult.publicUrl).catch(error => {
        console.error('Background icon generation failed:', error);
        // Don't fail the primary logo upload if icon generation fails
      });
    }

    res.json({
      success: true,
      message: 'Primary logo uploaded successfully',
      data: {
        restaurant: {
          id: updatedRestaurant._id,
          name: updatedRestaurant.name,
          primaryLogoUrl: updatedRestaurant.primaryLogoUrl,
          updatedAt: updatedRestaurant.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Primary logo upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading primary logo'
    });
  }
};

// @desc    Upload restaurant brand mark (square logo)
// @route   POST /restaurants/brand-mark
// @access  Private
export const uploadBrandMark = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;
    
    // Get current restaurant to check if logo exists
    const currentRestaurant = await Restaurant.findById(restaurantId);
    if (!currentRestaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Delete old brand mark if it exists
    if (currentRestaurant.brandMarkUrl) {
      try {
        await deleteBlobObject(currentRestaurant.brandMarkUrl);
      } catch (deleteError) {
        console.warn('Failed to delete old brand mark:', deleteError);
        // Continue with upload even if deletion fails
      }
    }

    // Upload new brand mark to Vercel Blob
    const uploadResult = await uploadBufferToBlob(restaurantId, req.file, 'branding');
    
    // Update restaurant with new brand mark URL
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { brandMarkUrl: uploadResult.publicUrl },
      { 
        new: true,
        select: '-password'
      }
    );

    // Always regenerate icons when brand mark is updated since it's the primary source for favicons
    // Delete existing icons first to ensure clean generation
    await deleteExistingIcons(restaurantId);
    
    // Trigger icon generation in the background using brand mark
    generateIconsForRestaurant(restaurantId, uploadResult.publicUrl).catch(error => {
      console.error('Background icon generation failed:', error);
      // Don't fail the brand mark upload if icon generation fails
    });

    res.json({
      success: true,
      message: 'Brand mark uploaded successfully. Icons will be generated automatically.',
      data: {
        restaurant: {
          id: updatedRestaurant._id,
          name: updatedRestaurant.name,
          brandMarkUrl: updatedRestaurant.brandMarkUrl,
          updatedAt: updatedRestaurant.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Brand mark upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading brand mark'
    });
  }
};

// Helper function to generate icons for a restaurant
// This function should always use the logo URL passed to it:
// - brandMarkUrl when available (primary source for favicons)
// - primaryLogoUrl as fallback when no brand mark exists
async function generateIconsForRestaurant(restaurantId, logoUrl) {
  try {
    // Import the icon generation utilities
    const sharp = await import('sharp');
    const { uploadRawBufferToS3 } = await import('../utils/s3Upload.js');
    
    // Define icon sizes at the top to avoid hoisting issues
    const iconSizes = [
      { size: 16, name: 'favicon-16x16.png' },
      { size: 32, name: 'favicon-32x32.png' },
      { size: 180, name: 'apple-touch-icon.png' },
      { size: 192, name: 'android-chrome-192x192.png' },
      { size: 512, name: 'android-chrome-512x512.png' }
    ];
    
    // Download logo
    const response = await fetch(logoUrl);
    if (!response.ok) {
      throw new Error(`Failed to download logo: ${response.status}`);
    }
    
    const logoBuffer = await response.arrayBuffer();
    
    // Validate that we got a valid image
    if (logoBuffer.byteLength === 0) {
      throw new Error('Downloaded logo buffer is empty');
    }
    
    // Upload each icon to Vercel Blob
    for (const icon of iconSizes) {
      const iconBuffer = await sharp.default(Buffer.from(logoBuffer))
        .resize(icon.size, icon.size, { 
          fit: 'contain', 
          background: { r: 255, g: 255, b: 255, alpha: 1 } 
        })
        .png()
        .toBuffer();
      
      const blobKey = `restaurants/${restaurantId}/icons/${icon.name}`;
      
      await uploadRawBufferToS3(blobKey, iconBuffer, 'image/png');
    }
    
    // Generate favicon.ico
    const faviconBuffer = await sharp.default(Buffer.from(logoBuffer))
      .resize(16, 16, { 
        fit: 'contain', 
        background: { r: 255, g: 255, b: 255, alpha: 1 } 
      })
      .png()
      .toBuffer();
    
    const faviconKey = `restaurants/${restaurantId}/icons/favicon.ico`;
    await uploadRawBufferToS3(faviconKey, faviconBuffer, 'image/x-icon');
    
  } catch (error) {
    console.error(`Icon generation failed for restaurant ${restaurantId}:`, error);
    throw error;
  }
}

// Helper function to delete existing icons for a restaurant
async function deleteExistingIcons(restaurantId) {
  try {
    // Check if AWS S3 is configured
    if (!process.env.AWS_S3_BUCKET_NAME) {
      console.warn('AWS_S3_BUCKET_NAME not set, skipping icon cleanup');
      return;
    }
    
    // Since Vercel Blob doesn't have a direct list API, we'll try to delete known icon files
    const iconFiles = [
      'favicon-16x16.png',
      'favicon-32x32.png',
      'apple-touch-icon.png',
      'android-chrome-192x192.png',
      'android-chrome-512x512.png',
      'favicon.ico'
    ];

    for (const iconName of iconFiles) {
      try {
        // Use the same key format that generateIconsForRestaurant uses
        const iconKey = `restaurants/${restaurantId}/icons/${iconName}`;
        
        // For deletion, we need to use the full URL since deleteBlobObject expects either a key or URL
        // The iconKey is just the key, so we need to construct the full S3 URL
        const fullIconUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${iconKey}`;
        
        const deleteResult = await deleteBlobObject(fullIconUrl);
        
        if (deleteResult) {
          // Icon was successfully deleted
        } else {
          // Icon was not found or already deleted
        }
      } catch (deleteError) {
        // Icon might not exist, which is fine
      }
    }
  } catch (error) {
    console.warn('Failed to cleanup existing icons:', error);
    // Continue even if cleanup fails
  }
}

// @desc    Get restaurant statistics
// @route   GET /restaurants/stats
// @access  Private
export const getStats = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;

    // Import MenuItem here to avoid circular dependency
    const { MenuItem } = await import('../models/index.js');

    // Get menu statistics
    const totalItems = await MenuItem.countDocuments({ restaurantId });
    const availableItems = await MenuItem.countDocuments({ 
      restaurantId, 
      isAvailable: true 
    });
    const categories = await MenuItem.getCategoriesByRestaurant(restaurantId);
    const itemsWithImages = await MenuItem.countDocuments({ 
      restaurantId, 
      image: { $ne: null } 
    });

    // Get restaurant data
    const restaurant = await Restaurant.findById(restaurantId).select('-password');

    res.json({
      success: true,
      data: {
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          isActive: restaurant.isActive,
          hasQrCode: !!restaurant.qrCodeUrl,
          primaryLogoUrl: restaurant.primaryLogoUrl,
          brandMarkUrl: restaurant.brandMarkUrl,
          hideRestaurantNameInHeader: restaurant.hideRestaurantNameInHeader
        },
        menu: {
          totalItems,
          availableItems,
          unavailableItems: totalItems - availableItems,
          totalCategories: categories.length,
          categories,
          itemsWithImages,
          itemsWithoutImages: totalItems - itemsWithImages
        },
        percentages: {
          availabilityRate: totalItems > 0 ? Math.round((availableItems / totalItems) * 100) : 0,
          imageCompletionRate: totalItems > 0 ? Math.round((itemsWithImages / totalItems) * 100) : 0
        }
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
};

// @desc    List all active restaurants (minimal public fields) for SSG build
// @route   GET /restaurants/ssg/list
// @access  Internal (protected by secret header)
export const listActiveRestaurantsForSsg = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isActive: true })
      .select('_id name primaryLogoUrl brandMarkUrl hideRestaurantNameInHeader brandColor');

    const entities = restaurants.map(r => ({
      id: r._id,
      name: r.name,
      primaryLogoUrl: r.primaryLogoUrl || null,
      brandMarkUrl: r.brandMarkUrl || null,
      hideRestaurantNameInHeader: r.hideRestaurantNameInHeader || false,
      brandColor: r.brandColor || '#ffffff'
    }));

    res.json({
      success: true,
      data: {
        restaurants: entities
      }
    });
  } catch (error) {
    console.error('List restaurants for SSG error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while listing restaurants'
    });
  }
};
