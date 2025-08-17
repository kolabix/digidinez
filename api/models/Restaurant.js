import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
    maxlength: [100, 'Restaurant name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [
      /^[\+]?91[\d]{10}$/,
      'Please enter a valid Indian phone number (+91XXXXXXXXXX)'
    ]
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { 
      type: String, 
      trim: true,
      match: [/^[1-9][0-9]{5}$/, 'Please enter a valid Indian PIN code (6 digits)']
    },
    country: { type: String, trim: true, default: 'India' }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  qrCodeUrl: {
    type: String,
    default: null
  },
  primaryLogoUrl: {
    type: String,
    default: null
  },
  brandMarkUrl: {
    type: String,
    default: null
  },
  hideRestaurantNameInHeader: {
    type: Boolean,
    default: false
  },
  brandColor: {
    type: String,
    default: '#ffffff',
    match: [/^#[0-9A-Fa-f]{6}$/, 'Brand color must be a valid hex color']
  }
}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Indexes are automatically created by unique: true properties

// Hash password before saving
restaurantSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
restaurantSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate JWT token
restaurantSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      name: this.name 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
    }
  );
};

// Virtual for full address
restaurantSchema.virtual('fullAddress').get(function() {
  const { street, city, state, zipCode, country } = this.address;
  return [street, city, state, zipCode, country]
    .filter(Boolean)
    .join(', ');
});

// Virtual for menu items count (will be populated when needed)
restaurantSchema.virtual('menuItemsCount', {
  ref: 'MenuItem',
  localField: '_id',
  foreignField: 'restaurantId',
  count: true
});

export default mongoose.model('Restaurant', restaurantSchema);
