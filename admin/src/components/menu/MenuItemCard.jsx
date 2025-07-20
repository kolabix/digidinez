import { useState } from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { DietaryBadge } from '../common/DietaryBadge';
import placeholderImage from '../../assets/placeholder-food-img.jpg';

export const MenuItemCard = ({ item, onEdit, onDelete, onToggleAvailability }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

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

  const shouldTruncate = item.description?.length > 100;
  const truncatedDescription = shouldTruncate && !showFullDescription 
    ? `${item.description.slice(0, 100)}...` 
    : item.description;

  return (
    <div className="w-full bg-white rounded-lg shadow-sm hover:shadow transition-shadow duration-200 mb-4">
      <div className="flex flex-col md:flex-row md:h-[250px]">
        {/* Image Section */}
        <div className="relative h-48 md:h-full md:w-[250px] bg-gray-100 flex-shrink-0">
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
        <div className="p-4 md:p-6 flex flex-col flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                {item.spicyLevel > 0 && (
                  <div className="flex items-center">
                    {renderSpicyLevel(item.spicyLevel)}
                  </div>
                )}
              </div>
              <span className="text-lg font-semibold text-primary-600 mt-1 block">
                ₹{item.price}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mt-2 md:w-2/3">
            <p className="text-gray-600 text-sm">
              {truncatedDescription}
              {shouldTruncate && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="ml-1 text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
                >
                  {showFullDescription ? 'Read less' : 'Read more'}
                </button>
              )}
            </p>
          </div>

          {/* Tags */}
          <div className="mt-3">
            {item.tagIds?.length > 0 && (
              <div>
                {item.tagIds.map((tag, index) => (
                  <span key={tag._id}>
                    <span
                      className="text-sm px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: tag.color + '33',
                        color: tag.color
                      }}
                    >
                      {tag.name}
                    </span>
                    {index < item.tagIds.length - 1 && <span className="mx-1">,</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* Action Buttons - Now in the content section for better alignment */}
          <div className="mt-3 flex items-center space-x-3">
              {/* Availability Toggle */}
              <button 
                onClick={() => onToggleAvailability(item._id)}
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  item.isAvailable ? 'bg-primary-600' : 'bg-gray-200'
                }`}
                title={item.isAvailable ? 'Mark unavailable' : 'Mark available'}
              >
                <span 
                  className={`${
                    item.isAvailable ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                ></span>
              </button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(item._id)}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
                title="Edit item"
              >
                <PencilSquareIcon className="h-6 w-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="p-2 text-red-600 hover:text-red-700 rounded-full hover:bg-red-50"
                title="Delete item"
              >
                <TrashIcon className="h-6 w-6" />
              </Button>
            </div>
        </div>
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