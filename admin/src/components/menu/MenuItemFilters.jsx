import { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export const MenuItemFilters = ({ filters, onChange, categories, tags }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (e) => {
    onChange({ search: e.target.value });
  };

  const handleCategoryChange = (categoryId) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    onChange({ categories: newCategories });
  };

  const handleTagChange = (tagId) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter(id => id !== tagId)
      : [...filters.tags, tagId];
    onChange({ tags: newTags });
  };

  const handleVegFilter = (value) => {
    onChange({ isVeg: filters.isVeg === value ? null : value });
  };

  const handleSpicyLevel = (level) => {
    onChange({ spicyLevel: filters.spicyLevel === level ? null : level });
  };

  const handleAvailability = (value) => {
    onChange({ isAvailable: filters.isAvailable === value ? null : value });
  };

  const clearFilters = () => {
    onChange({
      search: '',
      categories: [],
      tags: [],
      isVeg: null,
      spicyLevel: null,
      isAvailable: null
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Search Bar */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search menu items..."
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Less Filters' : 'More Filters'}
        </Button>
        {(filters.categories.length > 0 || filters.tags.length > 0 || filters.isVeg !== null || filters.spicyLevel !== null || filters.isAvailable !== null) && (
          <Button variant="ghost" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Categories */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.categories.includes(category.id)
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-800'
                  } hover:bg-primary-50`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleTagChange(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.tags.includes(tag.id)
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-800'
                  } hover:bg-primary-50`}
                  style={{
                    backgroundColor: filters.tags.includes(tag.id) ? tag.color + '33' : undefined,
                    color: filters.tags.includes(tag.id) ? tag.color : undefined
                  }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Veg/Non-veg */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Type</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleVegFilter(true)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.isVeg === true
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  } hover:bg-green-50`}
                >
                  Veg
                </button>
                <button
                  onClick={() => handleVegFilter(false)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.isVeg === false
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  } hover:bg-red-50`}
                >
                  Non-veg
                </button>
              </div>
            </div>

            {/* Spicy Level */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Spicy Level</h3>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(level => (
                  <button
                    key={level}
                    onClick={() => handleSpicyLevel(level)}
                    className={`w-8 h-8 rounded-full text-sm ${
                      filters.spicyLevel === level
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    } hover:bg-red-50`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Availability</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAvailability(true)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.isAvailable === true
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  } hover:bg-green-50`}
                >
                  Available
                </button>
                <button
                  onClick={() => handleAvailability(false)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.isAvailable === false
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  } hover:bg-red-50`}
                >
                  Unavailable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 