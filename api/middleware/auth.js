import jwt from 'jsonwebtoken';
import { Restaurant } from '../models/index.js';

// @desc    Protect routes - Verify JWT token from HTTP-only cookie or Authorization header
export const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from HTTP-only cookie (primary method)
    if (req.cookies && req.cookies.authToken) {
      token = req.cookies.authToken;
    }
    
    // Fallback: Get token from Authorization header (for testing)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get restaurant from token
      const restaurant = await Restaurant.findById(decoded.id);

      if (!restaurant) {
        return res.status(401).json({
          success: false,
          message: 'Restaurant not found. Token invalid.'
        });
      }

      // Note: We don't check isActive here because restaurant owners
      // should always be able to access their admin dashboard.
      // isActive only controls public menu visibility, not admin access.

      // Add restaurant to request object
      req.restaurant = {
        id: restaurant._id,
        name: restaurant.name,
        email: restaurant.email,
        phone: restaurant.phone
      };

      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      
      // Clear invalid cookie if it exists
      if (req.cookies && req.cookies.authToken) {
        res.cookie('authToken', '', {
          expires: new Date(0),
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// @desc    Optional authentication - Set user if token exists
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Get token from HTTP-only cookie
    if (req.cookies && req.cookies.authToken) {
      token = req.cookies.authToken;
    }

    if (token) {
      try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get restaurant from token
        const restaurant = await Restaurant.findById(decoded.id);

        if (restaurant) {
          // Note: We don't check isActive here because restaurant owners
          // should always be able to access their admin dashboard.
          // Add restaurant to request object
          req.restaurant = {
            id: restaurant._id,
            name: restaurant.name,
            email: restaurant.email,
            phone: restaurant.phone
          };
        }
      } catch (jwtError) {
        // Token invalid, but continue without authentication
        console.log('Optional auth: Invalid token, continuing without auth');
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue even if there's an error
  }
};
