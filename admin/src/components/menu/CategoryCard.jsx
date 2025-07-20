import { useState } from 'react';
import Button from '../common/Button';
import ConfirmDialog from '../common/ConfirmDialog';

const CategoryCard = ({ category, onEdit, onDelete, isDragging, dragHandleProps }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await onDelete(category._id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Delete category error:', error);
    }
  };

  return (
    <>
      <div 
        className={`bg-white rounded-lg border p-4 transition-all duration-200 ${
          isDragging ? 'shadow-lg scale-105 rotate-2' : 'shadow-sm hover:shadow-md'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Drag Handle */}
            <div 
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
              </svg>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">{category.name}</h3>
              <p className="text-sm text-gray-500">Sort order: {category.sortOrder}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Status Badge */}
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              category.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {category.isActive ? 'Active' : 'Inactive'}
            </span>

            {/* Actions */}
            <Button
              variant="ghost"
              onClick={() => onEdit(category)}
              className="text-blue-600 hover:text-blue-700"
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${category.name}"? This action cannot be undone.`}
        confirmButtonText="Delete"
        confirmButtonVariant="danger"
      />
    </>
  );
};

export default CategoryCard;
