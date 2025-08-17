// Get the base URL for public menu
export const getPublicMenuBaseUrl = () => {
  // Check if VITE_PUBLIC_MENU_BASE_URL is set in environment
  if (import.meta.env.VITE_PUBLIC_MENU_BASE_URL) {
    return import.meta.env.VITE_PUBLIC_MENU_BASE_URL;
  }
  
  // Fallback: use current host with /menu path
  // Only compute this when window is available
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/menu`;
  }
  
  // Return a placeholder during SSR or when window is not available
  return '';
};

// For backward compatibility, export the function result
// Note: This might be empty during SSR, so components should use getPublicMenuBaseUrl() instead
export const PUBLIC_MENU_BASE_URL = getPublicMenuBaseUrl();

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
