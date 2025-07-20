import { useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon, TagIcon } from '@heroicons/react/24/outline';
import TagCard from './TagCard';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';

const TagList = ({ 
  tags, 
  loading, 
  onCreateTag, 
  onEditTag, 
  onDeleteTag, 
  onToggleStatus 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'

  // Filter tags based on search and status
  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tag.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && tag.isActive) ||
                         (filterStatus === 'inactive' && !tag.isActive);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button
          variant="primary"
          onClick={onCreateTag}
          className="inline-flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Tag
        </Button>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full sm:w-64"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Tags</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Filter Results Info */}
      {(searchTerm || filterStatus !== 'all') && (
        <div className="text-sm text-gray-600">
          Showing {filteredTags.length} of {tags.length} tags
          {searchTerm && (
            <span> matching "{searchTerm}"</span>
          )}
          {filterStatus !== 'all' && (
            <span> ({filterStatus})</span>
          )}
        </div>
      )}

      {/* Tags Grid */}
      {filteredTags.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTags.map((tag) => (
            <TagCard
              key={tag._id}
              tag={tag}
              onEdit={onEditTag}
              onDelete={onDeleteTag}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      ) : tags.length === 0 ? (
        // No tags at all
        <div className="text-center py-12">
          <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No tags yet</h3>
          <p className="mt-2 text-gray-500 max-w-sm mx-auto">
            Create your first tag to start organizing your menu items with flexible labels.
          </p>
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={onCreateTag}
              className="inline-flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Your First Tag
            </Button>
          </div>
        </div>
      ) : (
        // No tags match current filter
        <div className="text-center py-12">
          <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No tags found</h3>
          <p className="mt-2 text-gray-500">
            {searchTerm 
              ? `No tags match "${searchTerm}"`
              : `No ${filterStatus} tags found`
            }
          </p>
          <div className="mt-6 space-x-3">
            {searchTerm && (
              <Button
                variant="secondary"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            )}
            {filterStatus !== 'all' && (
              <Button
                variant="secondary"
                onClick={() => setFilterStatus('all')}
              >
                Show All Tags
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagList;
