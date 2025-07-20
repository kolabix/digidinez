import { useState } from 'react';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const MenuItemCard = ({ item, onEdit, onDelete, onToggleAvailability }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(item.id);
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
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        {/* Veg/Non-veg Indicator */}
        <div className="absolute top-2 left-2">
          <div className={`w-6 h-6 rounded-full ${
            item.isVeg ? 'bg-green-500' : 'bg-red-500'
          } flex items-center justify-center text-white text-xs`}>
            {item.isVeg ? 'V' : 'N'}
          </div>
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
          <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
          <span className="text-lg font-semibold text-primary-600">
            ₹{item.price}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Spicy Level */}
        {item.spicyLevel > 0 && (
          <div className="mb-2">
            {renderSpicyLevel(item.spicyLevel)}
          </div>
        )}

        {/* Categories */}
        {item.categories?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {item.categories.map(category => (
              <span
                key={category.id}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}

        {/* Tags */}
        {item.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.map(tag => (
              <span
                key={tag.id}
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

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="secondary"
            onClick={() => onToggleAvailability(item.id)}
            className="flex-1"
          >
            {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
          </Button>
          <Button
            variant="primary"
            onClick={() => onEdit(item.id)}
            className="flex-1"
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            className="flex-1"
          >
            Delete
          </Button>
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