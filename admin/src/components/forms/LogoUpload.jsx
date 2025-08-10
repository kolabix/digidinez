import { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const LogoUpload = ({ currentLogoUrl, onLogoUpload, onLogoRemove, loading = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // Call parent handler
    onLogoUpload(file);
  };

  const handleRemoveLogo = () => {
    setPreviewUrl(null);
    onLogoRemove();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = previewUrl || currentLogoUrl;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Restaurant Logo
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Upload a logo image for your restaurant. Recommended size: 200x200px. 
          Supported formats: JPEG, PNG, WebP. Maximum size: 5MB.
        </p>
      </div>

      {/* Current Logo Display */}
      {displayUrl && (
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <img
              src={displayUrl}
              alt="Restaurant logo"
              className="w-20 h-20 rounded-lg object-cover border border-gray-200"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              {previewUrl ? 'New logo (not saved yet)' : 'Current logo'}
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={handleRemoveLogo}
              disabled={loading}
              className="mt-2"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Remove Logo
            </Button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {!displayUrl && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center ${
            dragActive 
              ? 'border-primary-400 bg-primary-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileInput}
            className="hidden"
          />
          
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClick}
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Uploading...</span>
                </>
              ) : (
                'Choose Logo Image'
              )}
            </Button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            or drag and drop an image file here
          </p>
        </div>
      )}

      {/* Upload New Logo Button (when current logo exists) */}
      {displayUrl && !previewUrl && (
        <div className="text-center">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClick}
            disabled={loading}
          >
            <PhotoIcon className="h-4 w-4 mr-2" />
            Upload New Logo
          </Button>
        </div>
      )}
    </div>
  );
};

export default LogoUpload;
