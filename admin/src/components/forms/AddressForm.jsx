import { useState, useEffect } from 'react';
import Input from '../common/Input';

const AddressForm = ({ address, onAddressChange }) => {
  const [addressData, setAddressData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Initialize address data
  useEffect(() => {
    if (address) {
      setAddressData({
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        country: address.country || ''
      });
    }
  }, [address]);

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case 'street':
        if (value && value.length < 5) return 'Street address should be at least 5 characters';
        return '';
      
      case 'city':
        if (value && value.length < 2) return 'City name should be at least 2 characters';
        return '';
      
      case 'state':
        if (value && value.length < 2) return 'State should be at least 2 characters';
        return '';
      
      case 'zipCode':
        if (value && !/^\d{5}(-\d{4})?$/.test(value)) {
          return 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)';
        }
        return '';
      
      case 'country':
        if (value && value.length < 2) return 'Country should be at least 2 characters';
        return '';
      
      default:
        return '';
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    const newAddressData = {
      ...addressData,
      [name]: value
    };
    
    setAddressData(newAddressData);
    
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

    // Notify parent component
    onAddressChange(newAddressData);
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
              name="street"
              label="Street Address"
              value={addressData.street}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.street}
              touched={touched.street}
              placeholder="123 Main Street"
            />
          </div>

          {/* City and State */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <Input
                type="text"
                name="city"
                label="City"
                value={addressData.city}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={errors.city}
                touched={touched.city}
                placeholder="New York"
              />
            </div>

            <div>
              <Input
                type="text"
                name="state"
                label="State / Province"
                value={addressData.state}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={errors.state}
                touched={touched.state}
                placeholder="NY"
              />
            </div>
          </div>

          {/* ZIP Code and Country */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <Input
                type="text"
                name="zipCode"
                label="ZIP / Postal Code"
                value={addressData.zipCode}
                onChange={handleInputChange}
                onBlur={handleBlur}
                error={errors.zipCode}
                touched={touched.zipCode}
                placeholder="10001"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <select
                id="country"
                name="country"
                value={addressData.country}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.country && touched.country
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
              {errors.country && touched.country && (
                <p className="mt-1 text-sm text-red-600">{errors.country}</p>
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
  );
};

export default AddressForm;
