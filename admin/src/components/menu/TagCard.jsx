import { useState } from 'react';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import ConfirmDialog from '../common/ConfirmDialog';

const TagCard = ({ 
  tag, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEdit = () => {
    onEdit(tag);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await onDelete(tag._id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Delete failed:', error);
      // Error handling will be done by parent component
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = () => {
    if (tag.menuItemsCount > 0 && tag.isActive) {
      // Show warning if deactivating a tag that's in use
      setShowStatusDialog(true);
    } else {
      // Safe to toggle
      handleStatusConfirm();
    }
  };

  const handleStatusConfirm = async () => {
    try {
      setLoading(true);
      await onToggleStatus(tag._id);
      setShowStatusDialog(false);
    } catch (error) {
      console.error('Status toggle failed:', error);
      // Error handling will be done by parent component
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`
        bg-white rounded-lg border shadow-sm p-4 hover:shadow-md transition-shadow
        ${!tag.isActive ? 'opacity-75 bg-gray-50' : ''}
      `}>
        {/* Tag Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* Tag Color & Name */}
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full border border-gray-200"
                style={{ backgroundColor: tag.color }}
                title={`Color: ${tag.color}`}
              />
              <span className="font-medium text-gray-900">
                {tag.name}
              </span>
            </div>
            
            {/* Status Badge */}
            <div className="flex items-center space-x-2">
              {tag.isActive ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <EyeIcon className="w-3 h-3 mr-1" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  <EyeSlashIcon className="w-3 h-3 mr-1" />
                  Inactive
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="p-1.5 text-gray-600 hover:text-gray-900"
              title="Edit tag"
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStatusToggle}
              className={`p-1.5 ${tag.isActive ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'}`}
              title={tag.isActive ? 'Deactivate tag' : 'Activate tag'}
              loading={loading}
            >
              {tag.isActive ? (
                <EyeSlashIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="p-1.5 text-red-600 hover:text-red-700"
              title="Delete tag"
              disabled={tag.menuItemsCount > 0}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tag Details */}
        <div className="space-y-2">
          {/* Slug */}
          <div className="text-sm text-gray-500">
            Slug: <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{tag.slug}</code>
          </div>

          {/* Menu Items Count */}
          <div className="text-sm text-gray-600">
            {tag.menuItemsCount === 0 ? (
              <span>Not used by any menu items</span>
            ) : (
              <span>
                Used by <strong>{tag.menuItemsCount}</strong> menu item{tag.menuItemsCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Tag Preview */}
          <div className="pt-2">
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Tag"
        message={`Are you sure you want to delete the tag "${tag.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={loading}
      />

      {/* Status Change Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showStatusDialog}
        onCancel={() => setShowStatusDialog(false)}
        onConfirm={handleStatusConfirm}
        title={tag.isActive ? 'Deactivate Tag' : 'Activate Tag'}
        message={
          tag.isActive && tag.menuItemsCount > 0
            ? `This tag is currently used by ${tag.menuItemsCount} menu item(s). Deactivating it will hide the tag from public menus, but won't remove it from existing menu items.`
            : `Are you sure you want to ${tag.isActive ? 'deactivate' : 'activate'} the tag "${tag.name}"?`
        }
        confirmText={tag.isActive ? 'Deactivate' : 'Activate'}
        cancelText="Cancel"
        variant={tag.isActive ? 'warning' : 'primary'}
        loading={loading}
      />
    </>
  );
};

export default TagCard;
