import { Restaurant } from '../models/index.js';
import jwt from 'jsonwebtoken';

// Helper function to detect if input is email or phone
const detectLoginType = (identifier) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(identifier) ? 'email' : 'phone';
};

// Helper function to set JWT cookie
const setAuthCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('authToken', token, cookieOptions);
};

// @desc    Register new restaurant
// @route   POST /auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, phone, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if email already exists
    const existingEmail = await Restaurant.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email address is already registered'
      });
    }

    // Check if phone already exists
    const existingPhone = await Restaurant.findOne({ phone });
    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: 'Phone number is already registered'
      });
    }

    // Create restaurant
    const restaurant = await Restaurant.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      address: address || {}
    });

    // Generate JWT token
    const token = restaurant.generateAuthToken();

    // Set HTTP-only cookie
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Restaurant registered successfully',
      data: {
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          email: restaurant.email,
          phone: restaurant.phone,
          isActive: restaurant.isActive
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `Restaurant with this ${field} already exists`
      });
    }

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
      message: 'Server error during registration'
    });
  }
};

// @desc    Login restaurant
// @route   POST /auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Validation
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/phone and password'
      });
    }

    // Detect if identifier is email or phone
    const loginType = detectLoginType(identifier);
    const query = loginType === 'email' 
      ? { email: identifier.toLowerCase() }
      : { phone: identifier };

    // Find restaurant and include password
    const restaurant = await Restaurant.findOne(query).select('+password');

    if (!restaurant) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Note: We don't check isActive here because restaurant owners
    // should always be able to log in to manage their restaurant.
    // isActive only controls public menu visibility, not admin access.

    // Verify password
    const isPasswordValid = await restaurant.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = restaurant.generateAuthToken();

    // Set HTTP-only cookie
    setAuthCookie(res, token);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          email: restaurant.email,
          phone: restaurant.phone,
          isActive: restaurant.isActive
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current restaurant profile
// @route   GET /auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.restaurant.id)
      .populate('menuItemsCount');

    res.json({
      success: true,
      data: {
        restaurant
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Logout restaurant
// @route   POST /auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // Clear the HTTP-only cookie
    res.cookie('authToken', '', {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// @desc    Refresh JWT token
// @route   POST /auth/refresh
// @access  Private
export const refreshToken = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.restaurant.id);

    if (!restaurant || !restaurant.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Restaurant not found or inactive'
      });
    }

    // Generate new token
    const token = restaurant.generateAuthToken();

    // Set new HTTP-only cookie
    setAuthCookie(res, token);

    res.json({
      success: true,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token refresh'
    });
  }
};
