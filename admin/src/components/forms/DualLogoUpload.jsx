import { useState } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const DualLogoUpload = ({ 
  currentPrimaryLogoUrl, 
  currentBrandMarkUrl,
  onPrimaryLogoUpload, 
  onBrandMarkUpload,
  onPrimaryLogoRemove,
  onBrandMarkRemove,
  loading = false 
}) => {
  const [primaryLogoFile, setPrimaryLogoFile] = useState(null);
  const [brandMarkFile, setBrandMarkFile] = useState(null);
  const [primaryLogoLoading, setPrimaryLogoLoading] = useState(false);
  const [brandMarkLoading, setBrandMarkLoading] = useState(false);
  const [brandMarkValidation, setBrandMarkValidation] = useState({ isValid: false, message: '' });

  const handlePrimaryLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPrimaryLogoFile(file);
      onPrimaryLogoUpload(file);
    }
  };

  const handleBrandMarkChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate aspect ratio
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const aspectRatioDiff = Math.abs(width - height);
        const isValid = aspectRatioDiff <= 10; // Allow 10px tolerance
        
        if (isValid) {
          setBrandMarkFile(file);
          onBrandMarkUpload(file);
          setBrandMarkValidation({ isValid: true, message: 'Image is valid! (1:1 aspect ratio)' });
        } else {
          setBrandMarkValidation({ 
            isValid: false, 
            message: `Image must be square (1:1 aspect ratio). Current dimensions: ${width} × ${height}` 
          });
        }
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const handlePrimaryLogoRemove = () => {
    setPrimaryLogoFile(null);
    onPrimaryLogoRemove();
  };

  const handleBrandMarkRemove = () => {
    setBrandMarkFile(null);
    onBrandMarkRemove();
    setBrandMarkValidation({ isValid: false, message: '' });
  };

  return (
    <div className="space-y-6">
      {/* Primary Logo Upload */}
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Primary Logo
        </h3>
        <div className="space-y-4">
          {/* Current Primary Logo Display */}
          {(currentPrimaryLogoUrl || primaryLogoFile) && (
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={primaryLogoFile ? URL.createObjectURL(primaryLogoFile) : currentPrimaryLogoUrl}
                  alt="Primary logo"
                  className="w-24 h-24 rounded-lg object-contain border border-gray-200"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  Current primary logo
                </p>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handlePrimaryLogoRemove}
                  className="mt-2"
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          )}

          {/* Primary Logo Upload Input */}
          {!currentPrimaryLogoUrl && !primaryLogoFile && (
            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="primary-logo-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Upload Primary Logo</span>
                    <input
                      id="primary-logo-upload"
                      name="primary-logo-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handlePrimaryLogoChange}
                      disabled={loading || primaryLogoLoading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WebP up to 5MB
                </p>
              </div>
            </div>
          )}

          {/* Primary Logo Helper Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Primary Logo:</strong> Upload your main restaurant logo. This can be wide or rectangular and may include your restaurant name. It's used in the admin panel and can be used in the public header if you choose to hide the restaurant name.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Mark Upload */}
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Brand Mark (Square Logo)
        </h3>
        <div className="space-y-4">
          {/* Current Brand Mark Display */}
          {(currentBrandMarkUrl || brandMarkFile) && (
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={brandMarkFile ? URL.createObjectURL(brandMarkFile) : currentBrandMarkUrl}
                  alt="Brand mark"
                  className="w-24 h-24 rounded-lg object-contain border border-gray-200"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  Current brand mark
                </p>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleBrandMarkRemove}
                  className="mt-2"
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          )}

          {/* Brand Mark Upload Input */}
          {!currentBrandMarkUrl && !brandMarkFile && (
            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="brand-mark-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Upload Brand Mark</span>
                    <input
                      id="brand-mark-upload"
                      name="brand-mark-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleBrandMarkChange}
                      disabled={loading || brandMarkLoading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WebP up to 5MB
                </p>
              </div>
            </div>
          )}

          {/* Brand Mark Validation Status */}
          {brandMarkValidation.message && (
            <div className={`p-4 rounded-lg border ${
              brandMarkValidation.isValid 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {brandMarkValidation.isValid ? (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    {brandMarkValidation.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Brand Mark Helper Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Brand Mark (Square Logo):</strong> Upload a square (1:1) image. This will be used for browser icons, mobile shortcuts, and other compact placements. Recommended: 512×512 px or higher.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading States */}
      {(primaryLogoLoading || brandMarkLoading) && (
        <div className="flex items-center justify-center p-4">
          <LoadingSpinner size="md" text="Uploading..." />
        </div>
      )}
    </div>
  );
};

export default DualLogoUpload;
