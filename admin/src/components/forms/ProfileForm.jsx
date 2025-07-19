import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import AddressForm from './AddressForm';
import useForm from '../../hooks/useForm';
import Button from '../common/Button';
import Input from '../common/Input';

const ProfileForm = forwardRef(({ profile, onSave, onCancel, loading }, ref) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: {
          street: profile.address?.street || '',
          city: profile.address?.city || '',
          state: profile.address?.state || '',
          zipCode: profile.address?.zipCode || '',
          country: profile.address?.country || ''
        }
      });
    }
  }, [profile]);

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Restaurant name is required';
        if (value.length < 2) return 'Restaurant name must be at least 2 characters';
        return '';
      
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return '';
      
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
          return 'Please enter a valid phone number';
        }
        return '';
      
      default:
        return '';
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate on change
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Handle address changes
  const handleAddressChange = (addressData) => {
    setFormData(prev => ({
      ...prev,
      address: addressData
    }));
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};
    
    // Validate basic fields
    newErrors.name = validateField('name', formData.name);
    newErrors.email = validateField('email', formData.email);
    newErrors.phone = validateField('phone', formData.phone);

    setErrors(newErrors);

    // Return true if no errors
    return !Object.values(newErrors).some(error => error);
  };

  // Expose submit function to parent component
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      // Mark all fields as touched
      setTouched({
        name: true,
        email: true,
        phone: true
      });

      if (validateForm()) {
        onSave(formData);
      }
    }
  }));

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      phone: true
    });

    if (validateForm()) {
      try {
        await onSave(formData);
      } catch (err) {
        // Error handling is done in parent component
      }
    }
  };

  // Handle field blur
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Restaurant Name */}
            <div className="sm:col-span-2">
              <Input
                type="text"
                name="name"
                label="Restaurant Name"
                required
                value={formData.name}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={errors.name}
                touched={touched.name}
                placeholder="Enter your restaurant name"
              />
            </div>

            {/* Email */}
            <div>
              <Input
                type="email"
                name="email"
                label="Email Address"
                required
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={errors.email}
                touched={touched.email}
                placeholder="restaurant@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <Input
                type="tel"
                name="phone"
                label="Phone Number"
                required
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={errors.phone}
                touched={touched.phone}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <AddressForm
        address={formData.address}
        onAddressChange={handleAddressChange}
      />
    </form>
  );
});

ProfileForm.displayName = 'ProfileForm';

export default ProfileForm;
