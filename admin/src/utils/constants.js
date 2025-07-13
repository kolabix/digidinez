// API Endpoints
export const API_BASE_URL = 'http://localhost:3001/api';

// Route paths
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  MENU: '/menu',
  PROFILE: '/profile',
  QR_CODE: '/qr-code',
};

// Menu categories (from backend)
export const MENU_CATEGORIES = [
  'appetizers',
  'main-course',
  'desserts',
  'beverages',
  'salads',
  'soups',
  'sandwiches',
  'pizza',
  'pasta',
  'seafood',
  'vegetarian'
];

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters',
  PHONE_INVALID: 'Please enter a valid phone number',
};

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};

// App metadata
export const APP_NAME = 'DigiDinez Admin';
export const APP_VERSION = '1.0.0';
