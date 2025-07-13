import { body, param, query, validationResult } from 'express-validator';

// Middleware to handle validation results
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Validation rules for creating menu items
export const validateCreateMenuItem = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Menu item name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  
  body('category')
    .isIn([
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
    ])
    .withMessage('Invalid category'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('spicyLevel')
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage('Spicy level must be between 0 and 5'),
  
  body('preparationTime')
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage('Preparation time must be between 1 and 120 minutes'),
  
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  
  handleValidationErrors
];

// Validation rules for updating menu items
export const validateUpdateMenuItem = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Menu item name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  
  body('category')
    .optional()
    .isIn([
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
    ])
    .withMessage('Invalid category'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('spicyLevel')
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage('Spicy level must be between 0 and 5'),
  
  body('preparationTime')
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage('Preparation time must be between 1 and 120 minutes'),
  
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  
  handleValidationErrors
];

// Validation for MongoDB ObjectId parameters
export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid menu item ID'),
  
  handleValidationErrors
];

// Validation for category parameter
export const validateCategory = [
  param('category')
    .isIn([
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
    ])
    .withMessage('Invalid category'),
  
  handleValidationErrors
];

// Validation for query parameters
export const validateMenuQuery = [
  query('category')
    .optional()
    .isIn([
      'all',
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
    ])
    .withMessage('Invalid category filter'),
  
  query('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be true or false'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

// Validation rules for restaurant profile updates
export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Restaurant name must be between 2 and 100 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Street address cannot exceed 200 characters'),
  
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City name cannot exceed 100 characters'),
  
  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State name cannot exceed 100 characters'),
  
  body('address.zipCode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('ZIP code cannot exceed 20 characters'),
  
  body('address.country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country name must be between 2 and 100 characters'),
  
  handleValidationErrors
];

// Validation rules for restaurant status toggle
export const validateStatusToggle = [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  
  handleValidationErrors
];
