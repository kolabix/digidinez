import { useState, useCallback } from 'react';

const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update field value (supports nested objects)
  const setValue = (name, value) => {
    // Handle nested field names like "address.street"
    if (name.includes('.')) {
      const keys = name.split('.');
      setValues(prev => {
        const newValues = { ...prev };
        let current = newValues;
        
        // Navigate to the parent object
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        
        // Set the final value
        current[keys[keys.length - 1]] = value;
        return newValues;
      });
    } else {
      setValues(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle input change (supports nested objects)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValue(name, value);
  };

  // Handle input blur
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, values[name]);
  };

  // Validate single field (supports nested objects)
  const validateField = (name, value) => {
    const rule = validationRules[name];
    if (!rule) return;

    // Get the actual value for nested fields
    let fieldValue = value;
    if (name.includes('.')) {
      const keys = name.split('.');
      fieldValue = keys.reduce((obj, key) => obj?.[key], values);
    }

    let error = '';

    // Required validation
    if (rule.required && (!fieldValue || fieldValue.trim() === '')) {
      error = rule.message || `${name} is required`;
    }
    // Only validate other rules if field has a value OR if it's required
    else if (fieldValue || rule.required) {
      // Email validation
      if (rule.type === 'email' && fieldValue) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(fieldValue)) {
          error = rule.message || 'Please enter a valid email address';
        }
      }
      // Phone validation
      else if (rule.type === 'phone' && fieldValue) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(fieldValue.replace(/\s/g, ''))) {
          error = rule.message || 'Please enter a valid phone number';
        }
      }
      // Minimum length validation (only if field has value)
      else if (rule.minLength && fieldValue && fieldValue.length < rule.minLength) {
        error = rule.message || `Minimum ${rule.minLength} characters required`;
      }
      // Custom validation
      else if (rule.validate) {
        const customError = rule.validate(fieldValue, values);
        if (customError) {
          error = customError;
        }
      }
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    return error === '';
  };

  // Get value from nested object path
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Validate all fields
  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    Object.keys(validationRules).forEach(name => {
      const fieldValue = name.includes('.') ? getNestedValue(values, name) : values[name];
      
      // Call validateField but don't rely on its return value
      // Instead, validate directly here to avoid timing issues
      const rule = validationRules[name];
      if (!rule) return;

      let error = '';

      // Required validation
      if (rule.required && (!fieldValue || fieldValue.trim() === '')) {
        error = rule.message || `${name} is required`;
      }
      // Only validate other rules if field has a value OR if it's required
      else if (fieldValue || rule.required) {
        // Email validation
        if (rule.type === 'email' && fieldValue) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(fieldValue)) {
            error = rule.message || 'Please enter a valid email address';
          }
        }
        // Phone validation
        else if (rule.type === 'phone' && fieldValue) {
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          if (!phoneRegex.test(fieldValue.replace(/\s/g, ''))) {
            error = rule.message || 'Please enter a valid phone number';
          }
        }
        // Minimum length validation (only if field has value)
        else if (rule.minLength && fieldValue && fieldValue.length < rule.minLength) {
          error = rule.message || `Minimum ${rule.minLength} characters required`;
        }
        // Custom validation
        else if (rule.validate) {
          const customError = rule.validate(fieldValue, values);
          if (customError) {
            error = customError;
          }
        }
      }

      // Set error in newErrors object
      newErrors[name] = error;
      
      if (error) {
        isValid = false;
      }
    });

    // Update errors state with the complete new errors object
    setErrors(newErrors);

    // Mark all fields as touched
    const allTouched = Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    return isValid;
  };

  // Reset form
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  // Set form errors (from API)
  const setFormErrors = (apiErrors) => {
    if (typeof apiErrors === 'string') {
      setErrors({ general: apiErrors });
    } else if (typeof apiErrors === 'object') {
      setErrors(apiErrors);
    }
  };

  // Set entire form values (useful for initialization)
  const setFormValues = useCallback((newValues) => {
    setValues(newValues);
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur,
    setValue,
    setFormValues,
    validateForm,
    resetForm,
    setFormErrors,
    hasErrors: Object.values(errors).some(error => error !== ''),
    getNestedValue,
  };
};

export default useForm;
