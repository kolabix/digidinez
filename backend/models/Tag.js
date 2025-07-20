import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tag name is required'],
    trim: true,
    maxlength: [30, 'Tag name cannot exceed 30 characters']
  },
  slug: {
    type: String,
    trim: true,
    lowercase: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required']
  },
  color: {
    type: String,
    default: '#3B82F6', // Default blue color
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique tag names per restaurant
tagSchema.index({ restaurantId: 1, name: 1 }, { unique: true });
tagSchema.index({ restaurantId: 1, slug: 1 }, { unique: true });

// Index for performance
tagSchema.index({ restaurantId: 1, isActive: 1 });

// Generate slug before saving
tagSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }
  next();
});

// Static method to get tags by restaurant
tagSchema.statics.findByRestaurant = function(restaurantId, activeOnly = true) {
  const query = { restaurantId };
  if (activeOnly) {
    query.isActive = true;
  }
  return this.find(query).sort({ name: 1 });
};

// Instance method to get menu items count with this tag
tagSchema.methods.getMenuItemsCount = async function() {
  const MenuItem = mongoose.model('MenuItem');
  return await MenuItem.countDocuments({
    restaurantId: this.restaurantId,
    tagIds: this._id,
    isAvailable: true
  });
};

export default mongoose.model('Tag', tagSchema);
