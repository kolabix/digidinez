import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import useForm from '../../hooks/useForm';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { register, loading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur,
    validateForm,
    setFormErrors
  } = useForm(
    {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    {
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
        type: 'phone',
        message: 'Valid phone number is required'
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
      }
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');
    
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

    const result = await register(restaurantData);
    
    if (result.success) {
      setSuccessMessage(result.message);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setFormErrors({ general: result.error });
    }
    
    setIsSubmitting(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Create Restaurant Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join DigiDinez and digitize your menu
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
                  placeholder="+1234567890"
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
                    <input
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
                    <input
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
                  placeholder="City"
                  value={values.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.city}
                  touched={touched.city}
                  required
                />

                <Input
                  label="State"
                  name="state"
                  type="text"
                  placeholder="State"
                  value={values.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.state}
                  touched={touched.state}
                  required
                />

                <Input
                  label="ZIP Code"
                  name="zipCode"
                  type="text"
                  placeholder="12345"
                  value={values.zipCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.zipCode}
                  touched={touched.zipCode}
                />
              </div>

              <Input
                label="Country"
                name="country"
                type="text"
                placeholder="Country"
                value={values.country}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.country}
                touched={touched.country}
              />
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

          <div className="mt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
