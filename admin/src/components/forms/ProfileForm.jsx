import { useEffect, forwardRef, useImperativeHandle } from 'react';
import useForm from '../../hooks/useForm';
import Input from '../common/Input';

const ProfileForm = forwardRef(({ profile, onSave, onCancel, loading }, ref) => {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFormValues,
    validateForm,
    setFormErrors
  } = useForm(
    {
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
    },
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
        type: 'phone',
        message: 'Please enter a valid phone number'
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
          if (value && !/^[A-Za-z0-9\s\-]{3,10}$/.test(value)) {
            return 'Please enter a valid postal code (3-10 characters, letters, numbers, spaces, or dashes)';
          }
        }
      },
      'address.country': {
        minLength: 2,
        message: 'Country should be at least 2 characters'
      }
    }
  );

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormValues({
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
  }, [profile]); // Remove setFormValues from dependency array

  // Expose submit function to parent component
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      if (validateForm()) {
        onSave(values);
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
                value={values.name}
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
                value={values.email}
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
                value={values.phone}
                onChange={handleChange}
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
                value={values.address.street}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors['address.street']}
                touched={touched['address.street']}
                placeholder="123 Main Street"
              />
            </div>

            {/* City and State */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Input
                  type="text"
                  name="address.city"
                  label="City"
                  value={values.address.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors['address.city']}
                  touched={touched['address.city']}
                  placeholder="New York"
                />
              </div>

              <div>
                <Input
                  type="text"
                  name="address.state"
                  label="State / Province"
                  value={values.address.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors['address.state']}
                  touched={touched['address.state']}
                  placeholder="NY"
                />
              </div>
            </div>

            {/* ZIP Code and Country */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Input
                  type="text"
                  name="address.zipCode"
                  label="ZIP / Postal Code"
                  value={values.address.zipCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors['address.zipCode']}
                  touched={touched['address.zipCode']}
                  placeholder="10001"
                />
              </div>

              <div>
                <label htmlFor="address.country" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <select
                  id="address.country"
                  name="address.country"
                  value={values.address.country}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors['address.country'] && touched['address.country']
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-300 focus:border-primary-500'
                  }`}
                >
                  <option value="">Select a country</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Italy">Italy</option>
                  <option value="Spain">Spain</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="Belgium">Belgium</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="Austria">Austria</option>
                  <option value="Sweden">Sweden</option>
                  <option value="Norway">Norway</option>
                  <option value="Denmark">Denmark</option>
                  <option value="Finland">Finland</option>
                  <option value="Ireland">Ireland</option>
                  <option value="Portugal">Portugal</option>
                  <option value="Greece">Greece</option>
                  <option value="Japan">Japan</option>
                  <option value="South Korea">South Korea</option>
                  <option value="Singapore">Singapore</option>
                  <option value="New Zealand">New Zealand</option>
                  <option value="Mexico">Mexico</option>
                  <option value="Brazil">Brazil</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Chile">Chile</option>
                  <option value="Colombia">Colombia</option>
                  <option value="Other">Other</option>
                </select>
                {errors['address.country'] && touched['address.country'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['address.country']}</p>
                )}
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
