import { useState } from 'react';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { DietaryBadge } from '../common/DietaryBadge';
import placeholderImage from '../../assets/placeholder-food-img.jpg';

export const MenuItemCard = ({ item, onEdit, onDelete, onToggleAvailability }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(item._id);
    setShowDeleteConfirm(false);
  };

  // Helper function to render spicy level indicators
  const renderSpicyLevel = (level) => {
    return Array(level)
      .fill('🌶️')
      .map((emoji, index) => (
        <span key={index} className="text-red-500">
          {emoji}
        </span>
      ));
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Image Section */}
      <div className="relative h-48 bg-gray-100">
        <img
          src={item.imageUrl || placeholderImage}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        {/* Veg/Non-veg Indicator */}
        <div className="absolute top-2 left-2">
          <DietaryBadge isVeg={item.isVeg} />
        </div>
        {/* Availability Badge */}
        {!item.isAvailable && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
            Unavailable
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
              {item.spicyLevel > 0 && (
                <div className="flex items-center">
                  {renderSpicyLevel(item.spicyLevel)}
                </div>
              )}
            </div>
            {/* Description */}
            <p className="text-gray-600 text-sm line-clamp-2">
              {item.description}
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-semibold text-primary-600 block mb-2">
              ₹{item.price}
            </span>
            {/* Actions */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(item._id)}
                className="p-1.5 text-gray-600 hover:text-gray-900"
                title="Edit item"
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleAvailability(item._id)}
                className={`p-1.5 ${item.isAvailable ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'}`}
                title={item.isAvailable ? 'Mark unavailable' : 'Mark available'}
              >
                {item.isAvailable ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="p-1.5 text-red-600 hover:text-red-700"
                title="Delete item"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Categories */}
        {item.categoryIds?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {item.categoryIds.map(category => (
              <span
                key={category._id}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}

        {/* Tags */}
        {item.tagIds?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tagIds.map(tag => (
              <span
                key={tag._id}
                className="px-2 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: tag.color + '33',
                  color: tag.color
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Menu Item"
          message={`Are you sure you want to delete "${item.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}; 