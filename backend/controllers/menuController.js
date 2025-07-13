import { MenuItem, Restaurant } from '../models/index.js';
import { validationResult } from 'express-validator';
import { deleteImageFile, getImagePath, getImageUrl, getImageInfo } from '../utils/imageUpload.js';

// @desc    Get all menu items for authenticated restaurant
// @route   GET /api/menu/items
// @access  Private
export const getMenuItems = async (req, res) => {
  try {
    const { category, isAvailable, limit = 50, sort = 'category name' } = req.query;
    
    // Build query options
    const options = {
      category: category && category !== 'all' ? category : undefined,
      isAvailable: isAvailable !== undefined ? isAvailable === 'true' : undefined,
      limit: parseInt(limit),
      sort: {}
    };

    // Parse sort parameter
    const sortFields = sort.split(' ');
    sortFields.forEach(field => {
      if (field.startsWith('-')) {
        options.sort[field.substring(1)] = -1;
      } else {
        options.sort[field] = 1;
      }
    });

    const menuItems = await MenuItem.findByRestaurant(req.restaurant.id, options);
    
    // Get categories for this restaurant
    const categories = await MenuItem.getCategoriesByRestaurant(req.restaurant.id);

    res.json({
      success: true,
      count: menuItems.length,
      data: {
        menuItems,
        categories
      }
    });

  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching menu items'
    });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/items/:id
// @access  Private
export const getMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findOne({
      _id: req.params.id,
      restaurantId: req.restaurant.id
    }).populate('restaurant', 'name email phone');

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      data: {
        menuItem
      }
    });

  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching menu item'
    });
  }
};

// @desc    Create new menu item
// @route   POST /api/menu/items
// @access  Private
export const createMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      tags,
      nutritionInfo,
      allergens,
      spicyLevel,
      preparationTime,
      isAvailable = true
    } = req.body;

    // Validation
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, price, and category'
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0'
      });
    }

    // Check if menu item with same name exists for this restaurant
    const existingItem = await MenuItem.findOne({
      name: name.trim(),
      restaurantId: req.restaurant.id
    });

    if (existingItem) {
      return res.status(409).json({
        success: false,
        message: 'Menu item with this name already exists'
      });
    }

    // Create menu item
    const menuItem = await MenuItem.create({
      name: name.trim(),
      description: description?.trim(),
      price: parseFloat(price),
      category: category.toLowerCase(),
      tags: tags || [],
      nutritionInfo: nutritionInfo || {},
      allergens: allergens || [],
      spicyLevel: spicyLevel || 0,
      preparationTime: preparationTime || null,
      isAvailable,
      restaurantId: req.restaurant.id
    });

    // Populate restaurant info
    await menuItem.populate('restaurant', 'name email');

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: {
        menuItem
      }
    });

  } catch (error) {
    console.error('Create menu item error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating menu item'
    });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/items/:id
// @access  Private
export const updateMenuItem = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      tags,
      nutritionInfo,
      allergens,
      spicyLevel,
      preparationTime,
      isAvailable
    } = req.body;

    // Find menu item
    const menuItem = await MenuItem.findOne({
      _id: req.params.id,
      restaurantId: req.restaurant.id
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check if new name conflicts with existing item
    if (name && name.trim() !== menuItem.name) {
      const existingItem = await MenuItem.findOne({
        name: name.trim(),
        restaurantId: req.restaurant.id,
        _id: { $ne: req.params.id }
      });

      if (existingItem) {
        return res.status(409).json({
          success: false,
          message: 'Menu item with this name already exists'
        });
      }
    }

    // Update fields
    if (name) menuItem.name = name.trim();
    if (description !== undefined) menuItem.description = description?.trim();
    if (price !== undefined) {
      if (price <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be greater than 0'
        });
      }
      menuItem.price = parseFloat(price);
    }
    if (category) menuItem.category = category.toLowerCase();
    if (tags !== undefined) menuItem.tags = tags;
    if (nutritionInfo !== undefined) menuItem.nutritionInfo = nutritionInfo;
    if (allergens !== undefined) menuItem.allergens = allergens;
    if (spicyLevel !== undefined) menuItem.spicyLevel = spicyLevel;
    if (preparationTime !== undefined) menuItem.preparationTime = preparationTime;
    if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;

    await menuItem.save();
    await menuItem.populate('restaurant', 'name email');

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: {
        menuItem
      }
    });

  } catch (error) {
    console.error('Update menu item error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating menu item'
    });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/items/:id
// @access  Private
export const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findOne({
      _id: req.params.id,
      restaurantId: req.restaurant.id
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });

  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting menu item'
    });
  }
};

// @desc    Toggle menu item availability
// @route   PATCH /api/menu/items/:id/toggle
// @access  Private
export const toggleAvailability = async (req, res) => {
  try {
    const menuItem = await MenuItem.findOne({
      _id: req.params.id,
      restaurantId: req.restaurant.id
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    await menuItem.toggleAvailability();

    res.json({
      success: true,
      message: `Menu item ${menuItem.isAvailable ? 'enabled' : 'disabled'} successfully`,
      data: {
        menuItem: {
          id: menuItem._id,
          name: menuItem.name,
          isAvailable: menuItem.isAvailable
        }
      }
    });

  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling availability'
    });
  }
};

// @desc    Get menu items by category
// @route   GET /api/menu/items/category/:category
// @access  Private
export const getMenuItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { isAvailable = true, limit = 50 } = req.query;

    const menuItems = await MenuItem.findByRestaurant(req.restaurant.id, {
      category,
      isAvailable: isAvailable === 'true',
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      count: menuItems.length,
      category,
      data: {
        menuItems
      }
    });

  } catch (error) {
    console.error('Get menu items by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching menu items by category'
    });
  }
};

// @desc    Bulk update menu items (for batch operations)
// @route   PUT /api/menu/items/bulk
// @access  Private
export const bulkUpdateMenuItems = async (req, res) => {
  try {
    const { updates } = req.body; // Array of {id, updates}
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of updates'
      });
    }

    const results = [];
    
    for (const update of updates) {
      try {
        const menuItem = await MenuItem.findOne({
          _id: update.id,
          restaurantId: req.restaurant.id
        });

        if (menuItem) {
          Object.assign(menuItem, update.updates);
          await menuItem.save();
          results.push({ id: update.id, success: true });
        } else {
          results.push({ id: update.id, success: false, error: 'Item not found' });
        }
      } catch (error) {
        results.push({ id: update.id, success: false, error: error.message });
      }
    }

    res.json({
      success: true,
      message: 'Bulk update completed',
      data: {
        results
      }
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bulk update'
    });
  }
};

// @desc    Upload image for menu item
// @route   POST /api/menu/items/:id/image
// @access  Private
export const uploadMenuItemImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Find menu item
    const menuItem = await MenuItem.findOne({
      _id: id,
      restaurantId: req.restaurant.id
    });

    if (!menuItem) {
      // If menu item not found, delete the uploaded file
      if (req.file) {
        deleteImageFile(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Delete old image if exists
    if (menuItem.image) {
      const oldImagePath = getImagePath(menuItem.image);
      deleteImageFile(oldImagePath);
    }

    // Update menu item with new image
    menuItem.image = req.file.filename;
    await menuItem.save();

    // Get image info
    const imageInfo = getImageInfo(req.file.filename);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        menuItem: {
          id: menuItem._id,
          name: menuItem.name,
          image: imageInfo
        }
      }
    });

  } catch (error) {
    // Delete uploaded file on error
    if (req.file) {
      deleteImageFile(req.file.path);
    }
    
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading image'
    });
  }
};

// @desc    Delete image for menu item
// @route   DELETE /api/menu/items/:id/image
// @access  Private
export const deleteMenuItemImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Find menu item
    const menuItem = await MenuItem.findOne({
      _id: id,
      restaurantId: req.restaurant.id
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    if (!menuItem.image) {
      return res.status(400).json({
        success: false,
        message: 'Menu item has no image to delete'
      });
    }

    // Delete image file
    const imagePath = getImagePath(menuItem.image);
    const deleted = deleteImageFile(imagePath);

    // Update menu item (remove image reference)
    menuItem.image = null;
    await menuItem.save();

    res.json({
      success: true,
      message: 'Image deleted successfully',
      data: {
        fileDeleted: deleted,
        menuItem: {
          id: menuItem._id,
          name: menuItem.name,
          image: null
        }
      }
    });

  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting image'
    });
  }
};

// @desc    Get image info for menu item
// @route   GET /api/menu/items/:id/image
// @access  Private
export const getMenuItemImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Find menu item
    const menuItem = await MenuItem.findOne({
      _id: id,
      restaurantId: req.restaurant.id
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    if (!menuItem.image) {
      return res.status(404).json({
        success: false,
        message: 'Menu item has no image'
      });
    }

    // Get image info
    const imageInfo = getImageInfo(menuItem.image);

    if (!imageInfo) {
      return res.status(404).json({
        success: false,
        message: 'Image file not found'
      });
    }

    res.json({
      success: true,
      data: {
        image: imageInfo
      }
    });

  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting image info'
    });
  }
};
