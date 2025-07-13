import { useState } from 'react';

const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update field value
  const setValue = (name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle input change
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

  // Validate single field
  const validateField = (name, value) => {
    const rule = validationRules[name];
    if (!rule) return;

    let error = '';

    // Required validation
    if (rule.required && (!value || value.trim() === '')) {
      error = rule.message || `${name} is required`;
    }
    // Email validation
    else if (rule.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        error = rule.message || 'Please enter a valid email address';
      }
    }
    // Phone validation
    else if (rule.type === 'phone' && value) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        error = rule.message || 'Please enter a valid phone number';
      }
    }
    // Minimum length validation
    else if (rule.minLength && value && value.length < rule.minLength) {
      error = rule.message || `Minimum ${rule.minLength} characters required`;
    }
    // Custom validation
    else if (rule.validate && value) {
      const customError = rule.validate(value, values);
      if (customError) {
        error = customError;
      }
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    return error === '';
  };

  // Validate all fields
  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    Object.keys(validationRules).forEach(name => {
      const isFieldValid = validateField(name, values[name]);
      if (!isFieldValid) {
        isValid = false;
        newErrors[name] = errors[name];
      }
    });

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

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur,
    setValue,
    validateForm,
    resetForm,
    setFormErrors,
    hasErrors: Object.values(errors).some(error => error !== ''),
  };
};

export default useForm;
