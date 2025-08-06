import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true,
    maxlength: [100, 'Menu item name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive number'],
    set: function(value) {
      return Math.round(value * 100) / 100; // Round to 2 decimal places
    }
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required']
  },
  categoryIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuCategory'
  }],
  tagIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  image: {
    filename: String,
    path: String,
    size: Number,
    mimetype: String,
    uploadedAt: { type: Date, default: Date.now }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isVeg: {
    type: Boolean,
    default: true // Default to vegetarian for Indian market
  },
  isSpicy: {
    type: Boolean,
    default: false
  },
  spicyLevel: {
    type: Number,
    min: [0, 'Spicy level must be between 0 and 3'],
    max: [3, 'Spicy level must be between 0 and 3'],
    default: 0
  },
  preparationTime: {
    type: Number, // in minutes
    min: [1, 'Preparation time must be at least 1 minute'],
    max: [180, 'Preparation time cannot exceed 180 minutes']
  },
  nutritionInfo: {
    calories: { type: Number, min: 0 },
    protein: { type: Number, min: 0 }, // in grams
    carbs: { type: Number, min: 0 }, // in grams
    fat: { type: Number, min: 0 } // in grams
  },
  allergens: [{
    type: String,
    enum: ['dairy', 'eggs', 'fish', 'shellfish', 'tree-nuts', 'peanuts', 'wheat', 'soy', 'sesame']
  }],
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance and search
menuItemSchema.index({ restaurantId: 1, isAvailable: 1 });
menuItemSchema.index({ restaurantId: 1, categoryIds: 1 });
menuItemSchema.index({ restaurantId: 1, tagIds: 1 });
menuItemSchema.index({ restaurantId: 1, sortOrder: 1 });

// Text search index for name and description
menuItemSchema.index({ 
  name: 'text', 
  description: 'text' 
}, {
  weights: {
    name: 10,
    description: 5
  }
});

// Virtual for formatted price (Indian Rupees)
menuItemSchema.virtual('formattedPrice').get(function() {
  return `₹${this.price.toFixed(2)}`;
});

// Helper function to get full image URL
const getFullImageUrl = (filename) => {
  if (!filename) return null;
  
  // In development, return full backend URL
  if (process.env.NODE_ENV === 'development') {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    return `${backendUrl}/uploads/menu-images/${filename}`;
  }
  
  // In production, return relative path (will be served by same domain)
  return `/uploads/menu-images/${filename}`;
};

// Virtual for image URL
menuItemSchema.virtual('imageUrl').get(function() {
  if (this.image && this.image.filename) {
    return getFullImageUrl(this.image.filename);
  }
  return null;
});

// Virtual for spicy level description
menuItemSchema.virtual('spicyLevelText').get(function() {
  const levels = ['', 'Mild', 'Medium', 'Hot'];
  return levels[this.spicyLevel] || 'Not Spicy';
});

// Virtual for preparation time formatted
menuItemSchema.virtual('preparationTimeText').get(function() {
  if (!this.preparationTime) return null;
  if (this.preparationTime < 60) {
    return `${this.preparationTime} mins`;
  }
  const hours = Math.floor(this.preparationTime / 60);
  const minutes = this.preparationTime % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
});

// Static method to find menu items by restaurant
menuItemSchema.statics.findByRestaurant = function(restaurantId, options = {}) {
  const query = { restaurantId };
  
  if (options.availableOnly) {
    query.isAvailable = true;
  }
  
  if (options.isAvailable !== undefined) {
    query.isAvailable = options.isAvailable;
  }
  
  if (options.categoryIds && options.categoryIds.length > 0) {
    query.categoryIds = { $in: options.categoryIds };
  }
  
  if (options.tagIds && options.tagIds.length > 0) {
    query.tagIds = { $in: options.tagIds };
  }
  
  if (options.isVeg !== undefined) {
    query.isVeg = options.isVeg;
  }
  
  if (options.maxSpicyLevel !== undefined) {
    query.spicyLevel = { $lte: options.maxSpicyLevel };
  }
  
  const sort = options.sort || { sortOrder: 1, name: 1 };
  
  return this.find(query)
    .populate('categoryIds', 'name')
    .populate('tagIds', 'name color')
    .sort(sort);
};

// Static method to get categories by restaurant
menuItemSchema.statics.getCategoriesByRestaurant = function(restaurantId) {
  return this.aggregate([
    { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
    { $unwind: '$categoryIds' },
    { $group: { _id: '$categoryIds' } },
    { $lookup: { 
        from: 'menucategories', 
        localField: '_id', 
        foreignField: '_id', 
        as: 'category' 
    }},
    { $unwind: '$category' },
    { $replaceRoot: { newRoot: '$category' } },
    { $sort: { sortOrder: 1, name: 1 } }
  ]);
};

// Static method to search menu items
menuItemSchema.statics.searchItems = function(restaurantId, searchTerm, options = {}) {
  const query = {
    restaurantId,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } }
    ]
  };
  
  if (options.availableOnly) {
    query.isAvailable = true;
  }
  
  return this.find(query)
    .populate('categoryIds', 'name')
    .populate('tagIds', 'name color')
    .sort({ name: 1 });
};

// Instance method to toggle availability
menuItemSchema.methods.toggleAvailability = function() {
  this.isAvailable = !this.isAvailable;
  return this.save();
};

export default mongoose.model('MenuItem', menuItemSchema);
