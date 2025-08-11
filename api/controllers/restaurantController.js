import { Restaurant } from '../models/index.js';
import { validationResult } from 'express-validator';
import { uploadBufferToBlob, deleteBlobObject } from '../utils/imageUpload.js';

/**
 * Restaurant Profile Controller
 * Handles restaurant profile management operations
 */

// @desc    Get restaurant profile
// @route   GET /api/restaurants/profile
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
          logoUrl: restaurant.logoUrl,
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
// @route   PUT /api/restaurants/profile
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

    const { name, email, phone, address } = req.body;
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
        country: address.country?.trim() || 'US'
      };
    }

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
          logoUrl: updatedRestaurant.logoUrl,
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
// @route   PATCH /api/restaurants/status
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
          logoUrl: updatedRestaurant.logoUrl,
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

// @desc    Upload restaurant logo
// @route   POST /api/restaurants/logo
// @access  Private
export const uploadLogo = async (req, res) => {
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

    // Delete old logo if it exists
    if (currentRestaurant.logoUrl) {
      try {
        await deleteBlobObject(currentRestaurant.logoUrl);
      } catch (deleteError) {
        console.warn('Failed to delete old logo:', deleteError);
        // Continue with upload even if deletion fails
      }
    }

    // Upload new logo to Vercel Blob
    const uploadResult = await uploadBufferToBlob(restaurantId, req.file, 'logos');
    
    // Update restaurant with new logo URL
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { logoUrl: uploadResult.publicUrl },
      { 
        new: true,
        select: '-password'
      }
    );

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: {
        restaurant: {
          id: updatedRestaurant._id,
          name: updatedRestaurant.name,
          logoUrl: updatedRestaurant.logoUrl,
          updatedAt: updatedRestaurant.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading logo'
    });
  }
};

// @desc    Get restaurant statistics
// @route   GET /api/restaurants/stats
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
          hasQrCode: !!restaurant.qrCodeUrl
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
// @route   GET /api/restaurants/ssg/list
// @access  Internal (protected by secret header)
export const listActiveRestaurantsForSsg = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isActive: true })
      .select('_id name logoUrl');

    const entities = restaurants.map(r => ({
      id: r._id,
      name: r.name,
      logoUrl: r.logoUrl || null
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
