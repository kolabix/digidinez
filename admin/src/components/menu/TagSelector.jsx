import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';

const TagSelector = ({ 
  selectedTags = [], 
  availableTags = [], 
  onChange, 
  onCreateTag,
  placeholder = "Select tags...",
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Filter available tags based on search
  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedTags.some(selected => selected._id === tag._id)
  );

  // Check if we can create a new tag from search term
  const canCreateTag = searchTerm.trim() && 
    !availableTags.some(tag => tag.name.toLowerCase() === searchTerm.trim().toLowerCase());

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  // Handle tag selection
  const handleTagSelect = (tag) => {
    const newSelectedTags = [...selectedTags, tag];
    onChange(newSelectedTags);
    setSearchTerm('');
  };

  // Handle tag removal
  const handleTagRemove = (tagToRemove) => {
    const newSelectedTags = selectedTags.filter(tag => tag._id !== tagToRemove._id);
    onChange(newSelectedTags);
  };

  // Handle create new tag
  const handleCreateTag = async () => {
    if (canCreateTag && onCreateTag) {
      try {
        const newTag = await onCreateTag({
          name: searchTerm.trim(),
          color: '#3B82F6' // Default color
        });
        
        if (newTag) {
          // Add the new tag to selection
          handleTagSelect(newTag);
        }
      } catch (error) {
        console.error('Failed to create tag:', error);
      }
    }
  };

  return (
    <div className="space-y-2">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag._id}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag)}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-white hover:bg-black hover:bg-opacity-20 focus:outline-none"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Tag Selector Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            relative w-full cursor-pointer rounded-lg border bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            ${disabled 
              ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        >
          <span className="block truncate text-gray-700">
            {placeholder}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon
              className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
            {/* Search Input */}
            <div className="px-3 py-2 border-b border-gray-200">
              <input
                ref={searchRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search or create tags..."
                className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Filtered Tags */}
            {filteredTags.length > 0 && (
              <div className="py-1">
                {filteredTags.map((tag) => (
                  <button
                    key={tag._id}
                    type="button"
                    onClick={() => handleTagSelect(tag)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span>{tag.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Create New Tag Option */}
            {canCreateTag && onCreateTag && (
              <div className="border-t border-gray-200 py-1">
                <button
                  type="button"
                  onClick={handleCreateTag}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-primary-600"
                >
                  <div className="flex items-center space-x-2">
                    <PlusIcon className="h-4 w-4" />
                    <span>Create "{searchTerm.trim()}"</span>
                  </div>
                </button>
              </div>
            )}

            {/* No Results */}
            {filteredTags.length === 0 && !canCreateTag && (
              <div className="px-3 py-2 text-gray-500 text-sm">
                {searchTerm ? 'No tags found' : 'No more tags available'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagSelector;
