import { useState } from 'react';
import { TagIcon } from '@heroicons/react/24/outline';
import { useTags } from '../../hooks/useTags';
import { TagList } from '../../components/menu/TagList';
import { TagForm } from '../../components/menu/TagForm';
import { toast } from '../../components/common/Toast';

export const Tags = () => {
  const {
    tags,
    loading,
    error,
    stats,
    createTag,
    updateTag,
    deleteTag,
    toggleTagStatus
  } = useTags();

  const [showTagForm, setShowTagForm] = useState(false);
  const [editingTag, setEditingTag] = useState(null);

  // Handle create tag
  const handleCreateTag = () => {
    setEditingTag(null);
    setShowTagForm(true);
  };

  // Handle edit tag
  const handleEditTag = (tag) => {
    setEditingTag(tag);
    setShowTagForm(true);
  };

  // Handle form submit (create or update)
  const handleFormSubmit = async (tagData) => {
    try {
      if (editingTag) {
        await updateTag(editingTag._id, tagData);
        toast.success('Tag updated successfully');
      } else {
        await createTag(tagData);
        toast.success('Tag created successfully');
      }
      setShowTagForm(false);
      setEditingTag(null);
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  // Handle delete tag
  const handleDeleteTag = async (tagId) => {
    try {
      await deleteTag(tagId);
      toast.success('Tag deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete tag');
    }
  };

  // Handle toggle tag status
  const handleToggleTagStatus = async (tagId) => {
    try {
      const tag = tags.find(t => t._id === tagId);
      await toggleTagStatus(tagId);
      toast.success(`Tag ${tag?.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      toast.error(error.message || 'Failed to update tag status');
    }
  };

  // Handle close form
  const handleCloseForm = () => {
    setShowTagForm(false);
    setEditingTag(null);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <TagIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Error Loading Tags</h3>
          <p className="mt-2 text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Tag Management</h2>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage flexible labels for your menu items
          </p>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="mt-4 sm:mt-0 flex space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{stats.totalTags}</div>
              <div className="text-xs text-gray-500">Total Tags</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.activeTags}</div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
          </div>
        )}
      </div>

      {/* Tag List */}
      <TagList
        tags={tags}
        loading={loading}
        onCreateTag={handleCreateTag}
        onEditTag={handleEditTag}
        onDeleteTag={handleDeleteTag}
        onToggleStatus={handleToggleTagStatus}
      />

      {/* Tag Form Modal */}
      <TagForm
        isOpen={showTagForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        tag={editingTag}
        existingTags={tags}
      />
    </div>
  );
};
