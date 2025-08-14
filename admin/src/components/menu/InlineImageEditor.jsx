import { useState, useRef } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { toast } from '../common/Toast';
import { ConfirmDialog } from '../common/ConfirmDialog';
import menuItemService from '../../services/menuItemService';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid';

export const InlineImageEditor = ({ item, onImageUpdate, size = 'md' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    // Only trigger file input if no image exists or if we're not in editing state
    if (!item.imageUrl && !isEditing) {
      setIsEditing(true);
      fileInputRef.current?.click();
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (!isEditing) {
      setIsEditing(true);
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setIsEditing(false);
      return;
    }

    // Validate file
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size should be less than 5MB');
      setIsEditing(false);
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG and WebP images are allowed');
      setIsEditing(false);
      return;
    }

    try {
      setIsUploading(true);
      await menuItemService.uploadImage(item._id, file);
      toast.success('Image updated successfully');
      onImageUpdate(); // Refresh the parent component
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to update image');
    } finally {
      setIsUploading(false);
      setIsEditing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setShowRemoveConfirm(true);
  };

  const confirmRemoveImage = async () => {
    try {
      setIsUploading(true);
      await menuItemService.deleteImage(item._id);
      toast.success('Image removed successfully');
      onImageUpdate(); // Refresh the parent component
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    } finally {
      setIsUploading(false);
      setShowRemoveConfirm(false);
    }
  };

  const cancelRemoveImage = () => {
    setShowRemoveConfirm(false);
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <>
      <div className="relative group">
        {/* Image Container */}
        <div
          className={`relative overflow-hidden rounded-lg bg-gray-100 cursor-pointer transition-all duration-200 ${sizeClasses[size]} ${isEditing ? 'ring-2 ring-primary-500 ring-offset-2' : 'group-hover:ring-2 group-hover:ring-gray-300'
            }`}
          onClick={handleImageClick}
        >
          {/* Loading Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
              <LoadingSpinner size="sm" />
            </div>
          )}

          {/* Image or Placeholder */}
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 cursor-pointer">
              <div className="text-center">
                <div className="flex items-center justify-center mx-auto">
                  <PlusIcon className={`h-8 w-8 text-gray-300`} />
                </div>
                {size !== 'sm' && (
                  <div className="text-xs text-gray-500 mt-1">Add Image</div>
                )}
              </div>
            </div>
          )}

          {/* Overlay for existing images - two horizontal divisions */}
          {!isUploading && item.imageUrl && (
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-80 transition-all duration-200 flex flex-col">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                className="flex-1 w-full flex items-center justify-center cursor-pointer bg-red-500 text-white rounded-none transition-all duration-200"
                title="Remove image"
                style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
              >
                <TrashIcon className={`${iconSizes[size]} text-white`} />
              </button>

              {/* Bottom half - Edit Image (Pencil Icon) */}
              <button
                onClick={handleEditClick}
                className="flex-1 w-full flex items-center justify-center bg-gray-800 bg-opacity-50 hover:bg-opacity-75 text-white rounded-none transition-all duration-200 cursor-pointer"
                title="Edit image"
                style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
              >
                <PencilIcon className={`${iconSizes[size]} text-white`} />
              </button>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Remove Confirmation Dialog */}
      {showRemoveConfirm && (
        <ConfirmDialog
          isOpen={showRemoveConfirm}
          title="Remove Image"
          message="Are you sure you want to remove this image? This action cannot be undone."
          confirmText="Remove"
          cancelText="Cancel"
          confirmVariant="danger"
          onConfirm={confirmRemoveImage}
          onCancel={cancelRemoveImage}
        />
      )}
    </>
  );
};
