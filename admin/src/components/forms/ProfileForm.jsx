import { useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import useForm from '../../hooks/useForm';
import { Input } from '../common/Input';
import { DualLogoUpload } from './DualLogoUpload';
import restaurantService from '../../services/restaurantService';
import { toast } from '../common/Toast';

export const ProfileForm = forwardRef(({ profile, onSave, onCancel, loading }, ref) => {
  const [primaryLogoFile, setPrimaryLogoFile] = useState(null);
  const [brandMarkFile, setBrandMarkFile] = useState(null);
  const [primaryLogoLoading, setPrimaryLogoLoading] = useState(false);
  const [brandMarkLoading, setBrandMarkLoading] = useState(false);
  const [currentPrimaryLogoUrl, setCurrentPrimaryLogoUrl] = useState(profile?.primaryLogoUrl || null);
  const [currentBrandMarkUrl, setCurrentBrandMarkUrl] = useState(profile?.brandMarkUrl || null);

  const initialValues = {
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    hideRestaurantNameInHeader: false
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFormValues,
    validateForm,
    setFormErrors,
    setFieldValue
  } = useForm(
    initialValues,
    {
      name: {
        required: true,
        minLength: 2,
        message: 'Restaurant name must be at least 2 characters'
      },
      email: {
        required: true,
        type: 'email',
        message: 'Please enter a valid email address'
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
      'address.street': {
        minLength: 5,
        message: 'Street address should be at least 5 characters'
      },
      'address.city': {
        minLength: 2,
        message: 'City name should be at least 2 characters'
      },
      'address.state': {
        minLength: 2,
        message: 'State should be at least 2 characters'
      },
      'address.zipCode': {
        validate: (value) => {
          // Indian PIN code validation: 6 digits
          if (value && !/^\d{6}$/.test(value)) {
            return 'Please enter a valid PIN code (6 digits)';
          }
        }
      },
      'address.country': {
        minLength: 2,
        message: 'Country should be at least 2 characters'
      },
      hideRestaurantNameInHeader: {
        type: 'boolean'
      }
    }
  );

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      const formData = {
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: {
          street: profile.address?.street || '',
          city: profile.address?.city || '',
          state: profile.address?.state || '',
          zipCode: profile.address?.zipCode || '',
          country: profile.address?.country || 'India'
        },
        hideRestaurantNameInHeader: profile.hideRestaurantNameInHeader || false
      };
      setFormValues(formData);
    } else {
      setFormValues(initialValues);
    }
  }, [profile, setFormValues]);

  // Handle primary logo upload
  const handlePrimaryLogoUpload = (file) => {
    setPrimaryLogoFile(file);
  };

  // Handle brand mark upload
  const handleBrandMarkUpload = (file) => {
    setBrandMarkFile(file);
  };

  // Handle primary logo removal
  const handlePrimaryLogoRemove = () => {
    setPrimaryLogoFile(null);
    setCurrentPrimaryLogoUrl(null);
  };

  // Handle brand mark removal
  const handleBrandMarkRemove = () => {
    setBrandMarkFile(null);
    setCurrentBrandMarkUrl(null);
  };

  // Upload logos before saving profile
  const uploadLogosIfNeeded = async () => {
    try {
      // Upload primary logo if needed
      if (primaryLogoFile) {
        setPrimaryLogoLoading(true);
        const response = await restaurantService.uploadPrimaryLogo(primaryLogoFile);
        if (response.success) {
          setCurrentPrimaryLogoUrl(response.data.restaurant.primaryLogoUrl);
          setPrimaryLogoFile(null);
          toast.success('Primary logo uploaded successfully!');
        }
      }

      // Upload brand mark if needed
      if (brandMarkFile) {
        setBrandMarkLoading(true);
        const response = await restaurantService.uploadBrandMark(brandMarkFile);
        if (response.success) {
          setCurrentBrandMarkUrl(response.data.restaurant.brandMarkUrl);
          setBrandMarkFile(null);
          toast.success('Brand mark uploaded successfully!');
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to upload logo');
      throw error;
    } finally {
      setPrimaryLogoLoading(false);
      setBrandMarkLoading(false);
    }
  };

  // Expose submit function to parent component
  useImperativeHandle(ref, () => ({
    submitForm: async () => {
      if (validateForm()) {
        try {
          // Upload logos first if needed
          await uploadLogosIfNeeded();
          // Then save profile
          await onSave(values);
        } catch (error) {
          // Error handling is done in parent component
        }
      }
    }
  }));

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await onSave(values);
      } catch (err) {
        // Error handling is done in parent component
      }
    }
  };

  // Ensure values.address exists
  const address = values.address || initialValues.address;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Logo Upload Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <DualLogoUpload
            currentPrimaryLogoUrl={currentPrimaryLogoUrl}
            currentBrandMarkUrl={currentBrandMarkUrl}
            onPrimaryLogoUpload={handlePrimaryLogoUpload}
            onPrimaryLogoRemove={handlePrimaryLogoRemove}
            onBrandMarkUpload={handleBrandMarkUpload}
            onBrandMarkRemove={handleBrandMarkRemove}
            loading={primaryLogoLoading}
          />
        </div>
      </div>

      {/* Header Display Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Public Menu Header Settings
          </h3>
          
          <div className="space-y-4">
            {/* Hide Restaurant Name Checkbox */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="hideRestaurantNameInHeader"
                  name="hideRestaurantNameInHeader"
                  type="checkbox"
                  checked={values.hideRestaurantNameInHeader || false}
                  onChange={(e) => {
                    // Handle checkbox change properly
                    const { name, checked } = e.target;
                    // Use setFieldValue to update the form state
                    setFieldValue(name, checked);
                  }}
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="hideRestaurantNameInHeader" className="font-medium text-gray-700">
                  Hide Restaurant Name in Public Menu Header
                </label>
                <p className="text-gray-500 mt-1">
                  If your main logo already includes your restaurant name or you prefer a logo-only header, enable this.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                value={values.name || ''}
                onChange={handleChange}
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
                value={values.email || ''}
                onChange={handleChange}
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
                value={values.phone || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.phone}
                touched={touched.phone}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Address Information
          </h3>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Street Address */}
            <div>
              <Input
                type="text"
                name="address.street"
                label="Street Address"
                value={address.street}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors['address.street']}
                touched={touched['address.street']}
                placeholder="123 MG Road"
              />
            </div>

            {/* City and State */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Input
                  type="text"
                  name="address.city"
                  label="City"
                  value={address.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors['address.city']}
                  touched={touched['address.city']}
                  placeholder="Mumbai"
                />
              </div>

              <div>
                <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                  State / Province
                </label>
                <select
                  id="address.state"
                  name="address.state"
                  value={address.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors['address.state'] && touched['address.state']
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-300 focus:border-primary-500'
                  }`}
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
                  <option value="Dadra and Nagar Haveli">Dadra and Nagar Haveli</option>
                  <option value="Daman and Diu">Daman and Diu</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Lakshadweep">Lakshadweep</option>
                  <option value="Puducherry">Puducherry</option>
                </select>
                {errors['address.state'] && touched['address.state'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['address.state']}</p>
                )}
              </div>
            </div>

            {/* PIN Code and Country */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Input
                  type="text"
                  name="address.zipCode"
                  label="PIN Code"
                  value={address.zipCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors['address.zipCode']}
                  touched={touched['address.zipCode']}
                  placeholder="400001"
                />
              </div>

              <div>
                <Input
                  type="text"
                  name="address.country"
                  label="Country"
                  value={address.country}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors['address.country']}
                  touched={touched['address.country']}
                  placeholder="India"
                  disabled
                />
              </div>
            </div>

            {/* Address Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Address Information:</strong> Your address helps customers find you and is used for delivery services. 
                    All address fields are optional, but providing complete information improves customer experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
});

ProfileForm.displayName = 'ProfileForm';

export default ProfileForm;
