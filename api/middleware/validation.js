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
  
  body('categoryIds')
    .optional()
    .isArray()
    .withMessage('Category IDs must be an array')
    .custom((categoryIds) => {
      if (categoryIds && categoryIds.length > 0) {
        for (const id of categoryIds) {
          if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error('Invalid category ID format');
          }
        }
      }
      return true;
    }),
  
  body('tagIds')
    .optional()
    .isArray()
    .withMessage('Tag IDs must be an array')
    .custom((tagIds) => {
      if (tagIds && tagIds.length > 0) {
        for (const id of tagIds) {
          if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error('Invalid tag ID format');
          }
        }
      }
      return true;
    }),

  body('foodType')
    .optional()
    .isIn(['veg', 'non-veg'])
    .withMessage('foodType must be either "veg" or "non-veg"'),

  body('isSpicy')
    .optional()
    .isBoolean()
    .withMessage('isSpicy must be a boolean'),
  
  body('spicyLevel')
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage('Spicy level must be between 0 and 5'),
  
  body('preparationTime')
    .optional({ nullable: true })
    .customSanitizer((value) => (value === '' || value === null ? undefined : value))
    .isInt({ min: 1, max: 180 })
    .withMessage('Preparation time must be between 1 and 180 minutes'),
  
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
  
  body('foodType')
    .optional()
    .isIn(['veg', 'non-veg'])
    .withMessage('foodType must be either "veg" or "non-veg"'),
  
  body('spicyLevel')
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage('Spicy level must be between 0 and 5'),
  
  body('preparationTime')
    .optional({ nullable: true })
    .customSanitizer((value) => (value === '' || value === null ? undefined : value))
    .isInt({ min: 1, max: 180 })
    .withMessage('Preparation time must be between 1 and 180 minutes'),
  
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
  
  query('foodType')
    .optional()
    .isIn(['veg', 'non-veg'])
    .withMessage('Invalid foodType filter'),
  
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
  
  body('hideRestaurantNameInHeader')
    .optional()
    .isBoolean()
    .withMessage('hideRestaurantNameInHeader must be a boolean value'),
  
  body('primaryLogoUrl')
    .optional()
    .isURL()
    .withMessage('Primary logo URL must be a valid URL'),
  
  body('brandMarkUrl')
    .optional()
    .isURL()
    .withMessage('Brand mark URL must be a valid URL'),
  
  handleValidationErrors
];

// Validation rules for restaurant status toggle
export const validateStatusToggle = [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  
  handleValidationErrors
];

// Validation rules for menu categories
export const validateCreateMenuCategory = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a positive number'),
  
  handleValidationErrors
];

export const validateUpdateMenuCategory = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a positive number'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  handleValidationErrors
];

// Validation rules for tags
export const validateCreateTag = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Tag name must be between 2 and 30 characters'),
  
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color'),
  
  handleValidationErrors
];

export const validateUpdateTag = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Tag name must be between 2 and 30 characters'),
  
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  handleValidationErrors
];
