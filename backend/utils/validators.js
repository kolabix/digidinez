// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Phone validation - supports various formats
export const isValidPhone = (phone) => {
  // Remove spaces, dashes, parentheses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check if it's a valid phone number format
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(cleanPhone);
};

// Password validation
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Restaurant name validation
export const isValidRestaurantName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 100;
};

// Validate registration input
export const validateRegistration = (data) => {
  const errors = [];
  const { name, email, phone, password } = data;

  if (!isValidRestaurantName(name)) {
    errors.push('Restaurant name must be between 2 and 100 characters');
  }

  if (!isValidEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!isValidPhone(phone)) {
    errors.push('Please provide a valid phone number');
  }

  if (!isValidPassword(password)) {
    errors.push('Password must be at least 6 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate login input
export const validateLogin = (data) => {
  const errors = [];
  const { identifier, password } = data;

  if (!identifier) {
    errors.push('Please provide email or phone number');
  } else {
    // Check if identifier is valid email or phone
    const isEmail = isValidEmail(identifier);
    const isPhone = isValidPhone(identifier);
    
    if (!isEmail && !isPhone) {
      errors.push('Please provide a valid email address or phone number');
    }
  }

  if (!password) {
    errors.push('Please provide password');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitize phone number - remove formatting
export const sanitizePhone = (phone) => {
  return phone.replace(/[\s\-\(\)]/g, '');
};

// Sanitize email - lowercase and trim
export const sanitizeEmail = (email) => {
  return email.toLowerCase().trim();
};
