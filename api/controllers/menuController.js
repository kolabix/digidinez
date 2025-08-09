import { MenuItem, Restaurant, MenuCategory, Tag } from '../models/index.js';
import { validationResult } from 'express-validator';
import { uploadBufferToBlob, deleteBlobObject } from '../utils/imageUpload.js';

// @desc    Get all menu items for authenticated restaurant
// @route   GET /api/menu/items
// @access  Private
export const getMenuItems = async (req, res) => {
  try {
    const { 
      category, 
      isAvailable, 
      limit = 50, 
      sort = 'category name',
      search,
      categories,
      tags,
      foodType,
      spicyLevel
    } = req.query;
    
    let menuItems;
    
    // If search term is provided, use text search
    if (search && search.trim()) {
      menuItems = await MenuItem.searchItems(req.restaurant.id, search.trim());
    } else {
      // Build query options for regular filtering
      const options = {
        category: category && category !== 'all' ? category : undefined,
        isAvailable: isAvailable !== undefined ? isAvailable === 'true' : undefined,
        limit: parseInt(limit),
        sort: {}
      };

      // Handle additional filters
      if (categories) {
        options.categoryIds = categories.split(',').map(id => id.trim());
      }
      
      if (tags) {
        options.tagIds = tags.split(',').map(id => id.trim());
      }
      
      if (foodType !== undefined && ['veg', 'non-veg'].includes(foodType)) {
        options.foodType = foodType;
      }
      
      if (spicyLevel !== undefined) {
        options.maxSpicyLevel = parseInt(spicyLevel);
      }

      // Parse sort parameter
      const sortFields = sort.split(' ');
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          options.sort[field.substring(1)] = -1;
        } else {
          options.sort[field] = 1;
        }
      });

      menuItems = await MenuItem.findByRestaurant(req.restaurant.id, options);
    }
    
    // Get categories for this restaurant
    const restaurantCategories = await MenuItem.getCategoriesByRestaurant(req.restaurant.id);

    res.json({
      success: true,
      count: menuItems.length,
      data: {
        menuItems,
        categories: restaurantCategories
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
    })
    .populate('categoryIds', 'name')
    .populate('tagIds', 'name color');

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
      categoryIds,
      tagIds,
      nutritionInfo,
      allergens,
      spicyLevel,
      preparationTime,
      isAvailable = true,
      foodType = 'veg',
      isSpicy = false
    } = req.body;

    // Validation
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and price'
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0'
      });
    }

    // Validate category IDs if provided
    if (categoryIds && categoryIds.length > 0) {
      const validCategories = await MenuCategory.find({
        _id: { $in: categoryIds },
        restaurantId: req.restaurant.id
      });
      
      if (validCategories.length !== categoryIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more invalid category IDs'
        });
      }
    }

    // Validate tag IDs if provided
    if (tagIds && tagIds.length > 0) {
      const validTags = await Tag.find({
        _id: { $in: tagIds },
        restaurantId: req.restaurant.id
      });
      
      if (validTags.length !== tagIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more invalid tag IDs'
        });
      }
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
      categoryIds: categoryIds || [],
      tagIds: tagIds || [],
      nutritionInfo: nutritionInfo || {},
      allergens: allergens || [],
      spicyLevel: spicyLevel || 0,
      preparationTime: preparationTime || null,
      isAvailable,
      foodType,
      isSpicy,
      restaurantId: req.restaurant.id
    });

    // Populate category and tag info
    await menuItem.populate([
      { path: 'categoryIds', select: 'name' },
      { path: 'tagIds', select: 'name color' }
    ]);

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
      categoryIds,
      tagIds,
      nutritionInfo,
      allergens,
      spicyLevel,
      preparationTime,
      isAvailable,
      foodType,
      isSpicy
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

    // Validate category IDs if provided
    if (categoryIds && categoryIds.length > 0) {
      const validCategories = await MenuCategory.find({
        _id: { $in: categoryIds },
        restaurantId: req.restaurant.id
      });
      
      if (validCategories.length !== categoryIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more invalid category IDs'
        });
      }
    }

    // Validate tag IDs if provided
    if (tagIds && tagIds.length > 0) {
      const validTags = await Tag.find({
        _id: { $in: tagIds },
        restaurantId: req.restaurant.id
      });
      
      if (validTags.length !== tagIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more invalid tag IDs'
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
    if (categoryIds !== undefined) menuItem.categoryIds = categoryIds;
    if (tagIds !== undefined) menuItem.tagIds = tagIds;
    if (nutritionInfo !== undefined) menuItem.nutritionInfo = nutritionInfo;
    if (allergens !== undefined) menuItem.allergens = allergens;
    if (spicyLevel !== undefined) menuItem.spicyLevel = spicyLevel;
    if (preparationTime !== undefined) menuItem.preparationTime = preparationTime;
    if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;
    if (foodType !== undefined) menuItem.foodType = foodType;
    if (isSpicy !== undefined) menuItem.isSpicy = isSpicy;

    await menuItem.save();
    
    // Populate the updated menu item
    await menuItem.populate(['categoryIds', 'tagIds']);

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

    // Delete old image from Blob if exists
    if (menuItem.image?.publicUrl || menuItem.image?.key) {
      try { await deleteBlobObject(menuItem.image.key || menuItem.image.publicUrl); } catch (_) {}
    }

    // Upload to Blob in restaurants/{id}/food-images/*
    const blobInfo = await uploadBufferToBlob(req.restaurant.id, req.file, 'food-images');

    // Update menu item with new image (Blob metadata)
    menuItem.image = {
      key: blobInfo.key,
      publicUrl: blobInfo.publicUrl,
      size: blobInfo.size,
      mimetype: blobInfo.mimetype,
      uploadedAt: blobInfo.uploadedAt
    };
    await menuItem.save();

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        menuItem: {
          id: menuItem._id,
          name: menuItem.name,
          image: menuItem.image,
          imageUrl: menuItem.image.publicUrl
        }
      }
    });

  } catch (error) {
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

    // Delete from Blob using key or public URL
    let fileDeleted = false;
    try {
      await deleteBlobObject(menuItem.image.key || menuItem.image.publicUrl);
      fileDeleted = true;
    } catch (_) {
      fileDeleted = false;
    }

    // Update menu item (remove image reference)
    menuItem.image = null;
    await menuItem.save();

    res.json({
      success: true,
      message: 'Image deleted successfully',
      data: {
        fileDeleted,
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

    res.json({
      success: true,
      data: {
        image: menuItem.image,
        imageUrl: menuItem.image.publicUrl
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

// @desc    Get public menu for a restaurant (no authentication required)
// @route   GET /api/menu/public/:restaurantId
// @access  Public
export const getPublicMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { category } = req.query;

    // Validate restaurant ID format
    if (!restaurantId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID format'
      });
    }

    // Check if restaurant exists and is active
    const restaurant = await Restaurant.findOne({ 
      _id: restaurantId, 
      isActive: true 
    }).select('name address phone qrCodeUrl');

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found or inactive'
      });
    }

    // Build query options for public menu (only available items)
    const options = {
      category: category && category !== 'all' ? category : undefined,
      isAvailable: true, // Only show available items to public
      limit: 100, // Higher limit for public viewing
      sort: { category: 1, name: 1 }
    };

    const menuItems = await MenuItem.findByRestaurant(restaurantId, options);
    
    // Get categories for this restaurant (only categories with available items)
    const categories = await MenuItem.getCategoriesByRestaurant(restaurantId, { availableOnly: true });

    res.json({
      success: true,
      count: menuItems.length,
      data: {
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          address: restaurant.address,
          phone: restaurant.phone
        },
        menuItems,
        categories
      }
    });

  } catch (error) {
    console.error('Get public menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching public menu'
    });
  }
};

// @desc    Get all menu categories for authenticated restaurant
// @route   GET /api/menu/categories
// @access  Private
export const getMenuCategories = async (req, res) => {
  try {
    const categories = await MenuCategory.findByRestaurant(req.restaurant.id);
    
    res.json({
      success: true,
      count: categories.length,
      data: {
        categories
      }
    });

  } catch (error) {
    console.error('Get menu categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
};

// @desc    Create new menu category
// @route   POST /api/menu/categories
// @access  Private
export const createMenuCategory = async (req, res) => {
  try {
    const { name, sortOrder } = req.body;

    const category = await MenuCategory.create({
      name,
      sortOrder,
      restaurantId: req.restaurant.id
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        category
      }
    });

  } catch (error) {
    console.error('Create category error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating category'
    });
  }
};

// @desc    Update menu category
// @route   PUT /api/menu/categories/:id
// @access  Private
export const updateMenuCategory = async (req, res) => {
  try {
    const category = await MenuCategory.findOneAndUpdate(
      { _id: req.params.id, restaurantId: req.restaurant.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        category
      }
    });

  } catch (error) {
    console.error('Update category error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating category'
    });
  }
};

// @desc    Delete menu category
// @route   DELETE /api/menu/categories/:id
// @access  Private
export const deleteMenuCategory = async (req, res) => {
  try {
    const category = await MenuCategory.findOne({
      _id: req.params.id,
      restaurantId: req.restaurant.id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if any menu items are using this category
    const menuItemsCount = await MenuItem.countDocuments({
      restaurantId: req.restaurant.id,
      categoryIds: req.params.id
    });

    if (menuItemsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${menuItemsCount} menu items are using this category.`
      });
    }

    await MenuCategory.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting category'
    });
  }
};

// @desc    Reorder categories
// @route   PATCH /api/menu/categories/reorder
// @access  Private
export const reorderCategories = async (req, res) => {
  try {
    const { categoryOrders } = req.body;

    if (!Array.isArray(categoryOrders) || categoryOrders.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Category orders array is required'
      });
    }

    // Update sort order for each category
    const updatePromises = categoryOrders.map(({ id, sortOrder }) => {
      return MenuCategory.findOneAndUpdate(
        { _id: id, restaurantId: req.restaurant.id },
        { sortOrder },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    // Fetch updated categories
    const categories = await MenuCategory.findByRestaurant(req.restaurant.id);

    res.json({
      success: true,
      message: 'Categories reordered successfully',
      data: {
        categories
      }
    });

  } catch (error) {
    console.error('Reorder categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reordering categories'
    });
  }
};

// @desc    Get all tags for authenticated restaurant
// @route   GET /api/menu/tags
// @access  Private
export const getTags = async (req, res) => {
  try {
    const tags = await Tag.findByRestaurant(req.restaurant.id);
    
    res.json({
      success: true,
      count: tags.length,
      data: {
        tags
      }
    });

  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tags'
    });
  }
};

// @desc    Create new tag
// @route   POST /api/menu/tags
// @access  Private
export const createTag = async (req, res) => {
  try {
    const { name, color } = req.body;

    const tag = await Tag.create({
      name,
      color,
      restaurantId: req.restaurant.id
    });

    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      data: {
        tag
      }
    });

  } catch (error) {
    console.error('Create tag error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tag with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating tag'
    });
  }
};

// @desc    Update tag
// @route   PUT /api/menu/tags/:id
// @access  Private
export const updateTag = async (req, res) => {
  try {
    const tag = await Tag.findOneAndUpdate(
      { _id: req.params.id, restaurantId: req.restaurant.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    res.json({
      success: true,
      message: 'Tag updated successfully',
      data: {
        tag
      }
    });

  } catch (error) {
    console.error('Update tag error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tag with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating tag'
    });
  }
};

// @desc    Delete tag
// @route   DELETE /api/menu/tags/:id
// @access  Private
export const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findOne({
      _id: req.params.id,
      restaurantId: req.restaurant.id
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    // Check if any menu items are using this tag
    const menuItemsCount = await MenuItem.countDocuments({
      restaurantId: req.restaurant.id,
      tagIds: req.params.id
    });

    if (menuItemsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete tag. ${menuItemsCount} menu items are using this tag.`
      });
    }

    await Tag.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });

  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting tag'
    });
  }
};
