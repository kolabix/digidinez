import { useState, useEffect } from 'react';
import { PlusIcon, TagIcon } from '@heroicons/react/24/outline';
import { TagCard } from './TagCard';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Input } from '../common/Input';

export const TagList = ({
  tags,
  loading,
  onEditTag,
  onDeleteTag,
  onToggleStatus,
  onCreateTag
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filter tags based on search and status
  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && tag.isActive) ||
      (filterStatus === 'inactive' && !tag.isActive);

    return matchesSearch && matchesStatus;
  });

  // Get display text for the selected filter
  const getFilterDisplayText = () => {
    switch (filterStatus) {
      case 'active':
        return 'Active Only';
      case 'inactive':
        return 'Inactive Only';
      default:
        return 'All Tags';
    }
  };

  // Handle filter selection
  const handleFilterSelect = (status) => {
    setFilterStatus(status);
    setIsDropdownOpen(false);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest('.dropdown-container')) {
      setIsDropdownOpen(false);
    }
  };

  // Add click outside listener
  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex bg-white rounded-lg shadow p-4">
        <div className="dropdown-container relative">
          <button
            onClick={toggleDropdown}
            className="shrink-0 inline-flex w-36 items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 cursor-pointer rounded-s-lg hover:bg-gray-200 focus:outline-none"
            type="button"
          >
            {getFilterDisplayText()}
            <svg className={`w-2.5 h-2.5 ms-2.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
            </svg>
          </button>
          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-44 border border-gray-200">
              <ul className="py-2 text-sm text-gray-700" aria-labelledby="dropdown-button">
                <li>
                  <button
                    type="button"
                    onClick={() => handleFilterSelect('all')}
                    className={`inline-flex w-full px-4 py-2 hover:bg-gray-100 ${filterStatus === 'all' ? 'bg-primary-50 text-primary-700' : ''}`}
                  >
                    All Tags
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleFilterSelect('active')}
                    className={`inline-flex w-full px-4 py-2 hover:bg-gray-100 ${filterStatus === 'active' ? 'bg-primary-50 text-primary-700' : ''}`}
                  >
                    Active Only
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleFilterSelect('inactive')}
                    className={`inline-flex w-full px-4 py-2 hover:bg-gray-100 ${filterStatus === 'inactive' ? 'bg-primary-50 text-primary-700' : ''}`}
                  >
                    Inactive Only
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
        <div className="relative w-full">
          <Input type="search"
            className="block p-2.5 w-full border-l-0 rounded-none rounded-e-lg"
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
