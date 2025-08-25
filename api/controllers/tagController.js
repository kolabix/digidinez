import { validationResult } from 'express-validator';
import Tag from '../models/Tag.js';
import MenuItem from '../models/MenuItem.js';

// @desc    Get all tags for a restaurant
// @route   GET /menu/tags
// @access  Private (Restaurant only)
const getTags = async (req, res) => {
  try {
    const restaurantId = req.restaurant.id;
    
    // Get tags with menu item counts
    const tags = await Tag.findByRestaurant(restaurantId, false); // Include inactive tags
    
    // Add menu item counts to each tag
    const tagsWithCounts = await Promise.all(
      tags.map(async (tag) => {
        const menuItemsCount = await tag.getMenuItemsCount();
        return {
          ...tag.toObject(),
          menuItemsCount
        };
      })
    );

    res.json({
      success: true,
      data: {
        tags: tagsWithCounts,
        totalTags: tagsWithCounts.length,
        activeTags: tagsWithCounts.filter(tag => tag.isActive).length
      }
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tags',
      error: error.message
    });
  }
};

// @desc    Create a new tag
// @route   POST /menu/tags
// @access  Private (Restaurant only)
const createTag = async (req, res) => {
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

    const { name, color } = req.body;
    const restaurantId = req.restaurant.id;

    // Check if tag with this name already exists for this restaurant
    const existingTag = await Tag.findOne({
      restaurantId,
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } // Case-insensitive check
    });

    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: 'A tag with this name already exists'
      });
    }

    // Create new tag
    const tag = new Tag({
      name: name.trim(),
      color: color || '#3B82F6',
      restaurantId
    });

    await tag.save();

    // Add menu items count (will be 0 for new tag)
    const tagWithCount = {
      ...tag.toObject(),
      menuItemsCount: 0
    };

    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      data: {
        tag: tagWithCount
      }
    });
  } catch (error) {
    console.error('Create tag error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A tag with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating tag',
      error: error.message
    });
  }
};

// @desc    Update a tag
// @route   PUT /menu/tags/:id
// @access  Private (Restaurant only)
const updateTag = async (req, res) => {
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

    const { id } = req.params;
    const { name, color, isActive } = req.body;
    const restaurantId = req.restaurant.id;

    // Find the tag
    const tag = await Tag.findOne({ _id: id, restaurantId });
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    // If name is being changed, check for duplicates
    if (name && name.trim() !== tag.name) {
      const existingTag = await Tag.findOne({
        restaurantId,
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: id }
      });

      if (existingTag) {
        return res.status(400).json({
          success: false,
          message: 'A tag with this name already exists'
        });
      }
    }

    // Update fields
    if (name) tag.name = name.trim();
    if (color) tag.color = color;
    if (typeof isActive === 'boolean') tag.isActive = isActive;

    await tag.save();

    // Add menu items count
    const menuItemsCount = await tag.getMenuItemsCount();
    const tagWithCount = {
      ...tag.toObject(),
      menuItemsCount
    };

    res.json({
      success: true,
      message: 'Tag updated successfully',
      data: {
        tag: tagWithCount
      }
    });
  } catch (error) {
    console.error('Update tag error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A tag with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating tag',
      error: error.message
    });
  }
};

// @desc    Delete a tag
// @route   DELETE /menu/tags/:id
// @access  Private (Restaurant only)
const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.restaurant.id;

    // Find the tag
    const tag = await Tag.findOne({ _id: id, restaurantId });
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    // Check if tag is being used by any menu items
    const menuItemsCount = await MenuItem.countDocuments({
      restaurantId,
      tagIds: id
    });

    if (menuItemsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete tag. It is currently used by ${menuItemsCount} menu item(s). Please remove this tag from all menu items first.`
      });
    }

    // Delete the tag
    await Tag.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting tag',
      error: error.message
    });
  }
};

// @desc    Get tags for public use (no auth required)
// @route   GET /menu/tags/public/:restaurantId
// @access  Public
const getPublicTags = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    const tags = await Tag.findByRestaurant(restaurantId, true); // Only active tags
    
    res.json({
      success: true,
      data: {
        tags: tags.map(tag => ({
          _id: tag._id,
          name: tag.name,
          slug: tag.slug,
          color: tag.color
        }))
      }
    });
  } catch (error) {
    console.error('Get public tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tags',
      error: error.message
    });
  }
};

export {
  getTags,
  createTag,
  updateTag,
  deleteTag,
  getPublicTags
};
