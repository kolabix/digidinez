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
    min: [0, 'Price cannot be negative'],
    set: function(val) {
      return Math.round(val * 100) / 100; // Round to 2 decimal places
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: {
      values: [
        'appetizers',
        'main-course',
        'desserts',
        'beverages',
        'salads',
        'soups',
        'sides',
        'specials',
        'vegetarian',
        'vegan',
        'other'
      ],
      message: 'Category must be a valid menu category'
    }
  },
  image: {
    type: String,
    default: null,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  nutritionInfo: {
    calories: { type: Number, min: 0 },
    protein: { type: Number, min: 0 },
    carbs: { type: Number, min: 0 },
    fat: { type: Number, min: 0 }
  },
  allergens: [{
    type: String,
    enum: [
      'dairy',
      'eggs',
      'fish',
      'shellfish',
      'tree-nuts',
      'peanuts',
      'wheat',
      'soy',
      'sesame'
    ]
  }],
  spicyLevel: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  preparationTime: {
    type: Number, // in minutes
    min: 0,
    max: 120
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
menuItemSchema.index({ restaurantId: 1, category: 1 });
menuItemSchema.index({ restaurantId: 1, isAvailable: 1 });
menuItemSchema.index({ restaurantId: 1, name: 'text', description: 'text' });

// Virtual for formatted price
menuItemSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Virtual to populate restaurant info
menuItemSchema.virtual('restaurant', {
  ref: 'Restaurant',
  localField: 'restaurantId',
  foreignField: '_id',
  justOne: true
});

// Static method to find items by restaurant
menuItemSchema.statics.findByRestaurant = function(restaurantId, options = {}) {
  const {
    category,
    isAvailable = true,
    limit = 50,
    sort = { category: 1, name: 1 }
  } = options;

  const query = { restaurantId, isAvailable };
  
  if (category && category !== 'all') {
    query.category = category;
  }

  return this.find(query)
    .sort(sort)
    .limit(limit)
    .select('-__v');
};

// Static method to get categories for a restaurant
menuItemSchema.statics.getCategoriesByRestaurant = function(restaurantId) {
  return this.distinct('category', { 
    restaurantId, 
    isAvailable: true 
  });
};

// Instance method to toggle availability
menuItemSchema.methods.toggleAvailability = function() {
  this.isAvailable = !this.isAvailable;
  return this.save();
};

// Pre-save middleware to ensure price formatting
menuItemSchema.pre('save', function(next) {
  if (this.isModified('price')) {
    this.price = Math.round(this.price * 100) / 100;
  }
  next();
});

export default mongoose.model('MenuItem', menuItemSchema);
