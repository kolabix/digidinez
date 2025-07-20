import mongoose from 'mongoose';

const menuCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required']
  },
  sortOrder: {
    type: Number,
    default: 0,
    min: [0, 'Sort order must be a positive number']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique category names per restaurant
menuCategorySchema.index({ restaurantId: 1, name: 1 }, { unique: true });

// Index for performance
menuCategorySchema.index({ restaurantId: 1, sortOrder: 1 });
menuCategorySchema.index({ restaurantId: 1, isActive: 1 });

// Static method to get categories by restaurant
menuCategorySchema.statics.findByRestaurant = function(restaurantId, activeOnly = true) {
  const query = { restaurantId };
  if (activeOnly) {
    query.isActive = true;
  }
  return this.find(query).sort({ sortOrder: 1, name: 1 });
};

// Instance method to get menu items count in this category
menuCategorySchema.methods.getMenuItemsCount = async function() {
  const MenuItem = mongoose.model('MenuItem');
  return await MenuItem.countDocuments({
    restaurantId: this.restaurantId,
    categoryIds: this._id,
    isAvailable: true
  });
};

export default mongoose.model('MenuCategory', menuCategorySchema);
