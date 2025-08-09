import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import useForm from '../../hooks/useForm';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export const RegisterForm = ({ onSubmit, loading, error, successMessage }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    validateForm,
    setFormErrors
  } = useForm({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    validationRules: {
      name: {
        required: true,
        minLength: 2,
        message: 'Restaurant name is required (minimum 2 characters)'
      },
      email: {
        required: true,
        type: 'email',
        message: 'Valid email address is required'
      },
      phone: {
        required: true,
        validate: (value) => {
          // Indian phone number validation: 10 digits with optional +91
          const indianPhoneRegex = /^(\+91[-\s]?)?[6-9]\d{9}$/;
          if (!indianPhoneRegex.test(value.replace(/\s/g, ''))) {
            return 'Please enter a valid Indian phone number (10 digits starting with 6-9)';
          }
        }
      },
      password: {
        required: true,
        minLength: 8,
        message: 'Password must be at least 8 characters long'
      },
      confirmPassword: {
        required: true,
        validate: (value, formValues) => {
          if (value !== formValues.password) {
            return 'Passwords do not match';
          }
        }
      },
      street: {
        required: true,
        message: 'Street address is required'
      },
      city: {
        required: true,
        message: 'City is required'
      },
      state: {
        required: true,
        message: 'State is required'
      },
      zipCode: {
        validate: (value) => {
          // Indian PIN code validation: 6 digits
          if (value && !/^\d{6}$/.test(value)) {
            return 'Please enter a valid PIN code (6 digits)';
          }
        }
      }
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare restaurant data
    const restaurantData = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      password: values.password,
      address: {
        street: values.street,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        country: values.country
      }
    };

    const result = await onSubmit(restaurantData);
    
    if (!result.success) {
      // Handle validation errors from backend
      if (result.validationErrors) {
        const newErrors = {};
        result.validationErrors.forEach(err => {
          newErrors[err.field] = err.message;
        });
        setFormErrors(newErrors);
      } else {
        setFormErrors({ general: result.error });
      }
    }
    
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* General error display */}
      {(error || errors.general) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || errors.general}
        </div>
      )}

      {/* Restaurant Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Restaurant Details</h3>
        
        <Input
          label="Restaurant Name"
          name="name"
          type="text"
          placeholder="Enter your restaurant name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.name}
          touched={touched.name}
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="restaurant@example.com"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            touched={touched.email}
            required
            autoComplete="email"
          />

          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.phone}
            touched={touched.phone}
            required
            autoComplete="tel"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 characters"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className="input-field pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className="input-field pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
      </div>

      {/* Restaurant Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Restaurant Address</h3>
        
        <Input
          label="Street Address"
          name="street"
          type="text"
          placeholder="123 Main Street"
          value={values.street}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.street}
          touched={touched.street}
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="City"
            name="city"
            type="text"
            placeholder="Mumbai"
            value={values.city}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.city}
            touched={touched.city}
            required
          />

          <div className="space-y-1">
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="state"
              name="state"
              value={values.state}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.state && touched.state
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-300 focus:border-primary-500'
              }`}
              required
            >
              <option value="">Select State</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Arunachal Pradesh">Arunachal Pradesh</option>
              <option value="Assam">Assam</option>
              <option value="Bihar">Bihar</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Goa">Goa</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Haryana">Haryana</option>
              <option value="Himachal Pradesh">Himachal Pradesh</option>
              <option value="Jharkhand">Jharkhand</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Kerala">Kerala</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Manipur">Manipur</option>
              <option value="Meghalaya">Meghalaya</option>
              <option value="Mizoram">Mizoram</option>
              <option value="Nagaland">Nagaland</option>
              <option value="Odisha">Odisha</option>
              <option value="Punjab">Punjab</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Sikkim">Sikkim</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="Tripura">Tripura</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Uttarakhand">Uttarakhand</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
              <option value="Chandigarh">Chandigarh</option>
              <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
              <option value="Delhi">Delhi</option>
              <option value="Jammu and Kashmir">Jammu and Kashmir</option>
              <option value="Ladakh">Ladakh</option>
              <option value="Lakshadweep">Lakshadweep</option>
              <option value="Puducherry">Puducherry</option>
            </select>
            {touched.state && errors.state && (
              <p className="text-sm text-red-600">{errors.state}</p>
            )}
          </div>

          <Input
            label="PIN Code"
            name="zipCode"
            type="text"
            placeholder="400001"
            value={values.zipCode}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.zipCode}
            touched={touched.zipCode}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Country
          </label>
          <select
            id="country"
            name="country"
            value={values.country}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.country && touched.country
                ? 'border-red-300 focus:border-red-500'
                : 'border-gray-300 focus:border-primary-500'
            }`}
          >
            <option value="India">India</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
            <option value="Germany">Germany</option>
            <option value="France">France</option>
            <option value="Italy">Italy</option>
            <option value="Spain">Spain</option>
            <option value="Netherlands">Netherlands</option>
            <option value="Singapore">Singapore</option>
            <option value="United Arab Emirates">United Arab Emirates</option>
            <option value="Other">Other</option>
          </select>
          {touched.country && errors.country && (
            <p className="text-sm text-red-600">{errors.country}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading || isSubmitting}
        disabled={loading || isSubmitting}
        className="w-full"
      >
        {loading || isSubmitting ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
};
