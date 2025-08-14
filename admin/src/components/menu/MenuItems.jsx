import { useState, useEffect, useRef } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { useTags } from '../../hooks/useTags';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { toast } from '../../components/common/Toast';
import { MenuItemForm } from '../../components/forms/MenuItemForm';
import menuItemService from '../../services/menuItemService';
import { Input } from '../common/Input';
import { PencilSquareIcon, TrashIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { DietaryBadge } from '../common/DietaryBadge';
import { InlineImageEditor } from './InlineImageEditor';
import { InlinePriceEditor } from './InlinePriceEditor';

export const MenuItems = () => {
  // State for items, loading, and filters
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, itemId: null, itemName: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [foodTypeDropdownOpen, setFoodTypeDropdownOpen] = useState(false);
  const [availabilityDropdownOpen, setAvailabilityDropdownOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    categories: [],
    tags: [],
    foodType: '',
    spicyLevel: null,
    isAvailable: null
  });

  // Get categories and tags for filters
  const { categories } = useCategories();
  const { tags } = useTags();

  // Prevent duplicate API calls
  const hasLoadedRef = useRef(false);
  
  // Debounce timer ref
  const debounceTimerRef = useRef(null);

  // Handle click outside for dropdowns
  const handleClickOutside = (e) => {
    if (!e.target.closest('.dropdown-container')) {
      setFoodTypeDropdownOpen(false);
      setAvailabilityDropdownOpen(false);
    }
  };

  // Add click outside listener
  useEffect(() => {
    if (foodTypeDropdownOpen || availabilityDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [foodTypeDropdownOpen, availabilityDropdownOpen]);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadMenuItems(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    // Skip the first render
    if (!hasLoadedRef.current) return;
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      loadMenuItems(true); // true indicates this is a search request
    }, 300); // 300ms delay
    
    // Cleanup timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [filters.search]); // Only trigger on search changes

  // Load items when other filters change (non-search)
  useEffect(() => {
    // Skip the first render and search changes
    if (!hasLoadedRef.current || filters.search) return;
    
    loadMenuItems(false);
  }, [filters.categories, filters.tags, filters.foodType, filters.spicyLevel, filters.isAvailable]);

  const loadMenuItems = async (isSearch = false) => {
    try {
      if (isSearch) {
        setSearchLoading(true);
      } else {
        setLoading(true);
      }
      const response = await menuItemService.getItems(filters);
      setItems(response.data.menuItems);
    } catch (error) {
      toast.error('Failed to load menu items');
      console.error('Error loading menu items:', error);
    } finally {
      if (isSearch) {
        setSearchLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    setFilters(prev => ({ ...prev, search: searchValue }));
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEditItem = async (itemId) => {
    try {
      setLoading(true);
      const response = await menuItemService.getItem(itemId);
      setEditingItem(response.data.menuItem);
      setShowForm(true);
    } catch (error) {
      toast.error('Failed to load menu item details');
      console.error('Error loading menu item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = (itemId, itemName) => {
    setDeleteConfirm({ show: true, itemId, itemName });
  };

  const confirmDelete = async () => {
    try {
      await menuItemService.deleteItem(deleteConfirm.itemId);
      toast.success('Menu item deleted successfully');
      loadMenuItems(false);
    } catch (error) {
      toast.error('Failed to delete menu item');
      console.error('Error deleting menu item:', error);
    } finally {
      setDeleteConfirm({ show: false, itemId: null, itemName: '' });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, itemId: null, itemName: '' });
  };

  const handleToggleAvailability = async (itemId) => {
    try {
      await menuItemService.toggleAvailability(itemId);
      toast.success('Item availability updated');
      loadMenuItems(false);
    } catch (error) {
      toast.error('Failed to update item availability');
      console.error('Error toggling availability:', error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(null);
    loadMenuItems(false); // Refresh list after add/edit
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      categories: [],
      tags: [],
      foodType: '',
      spicyLevel: null,
      isAvailable: null
    });
  };

  const hasActiveFilters = () => {
    return filters.search || 
           filters.categories.length > 0 || 
           filters.tags.length > 0 || 
           filters.foodType || 
           filters.spicyLevel !== null || 
           filters.isAvailable !== null;
  };

  // Helper functions for dropdown display text
  const getFoodTypeDisplayText = () => {
    switch (filters.foodType) {
      case 'veg':
        return 'Veg';
      case 'non-veg':
        return 'Non-Veg';
      default:
        return 'All Types';
    }
  };

  const getAvailabilityDisplayText = () => {
    switch (filters.isAvailable) {
      case true:
        return 'Available';
      case false:
        return 'Unavailable';
      default:
        return 'All Items';
    }
  };

  // Helper functions for dropdown selection
  const handleFoodTypeSelect = (foodType) => {
    handleFilterChange({ foodType });
    setFoodTypeDropdownOpen(false);
  };

  const handleAvailabilitySelect = (isAvailable) => {
    handleFilterChange({ isAvailable });
    setAvailabilityDropdownOpen(false);
  };

  // Group items by category for better organization
  const groupedItems = items.reduce((acc, item) => {
    const categoryName = item.categoryIds && item.categoryIds.length > 0 
      ? item.categoryIds[0].name 
      : 'Uncategorized';
    
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {});

  // Helper function to render spicy level indicators
  const renderSpicyLevel = (level) => {
    if (!level || level === 0) return null;
    return Array(Math.min(level, 3))
      .fill('🌶️')
      .map((emoji, index) => (
        <span key={index} className="text-red-500 text-sm">
          {emoji}
        </span>
      ));
  };

  // Helper function to render tags
  const renderTags = (tagIds) => {
    if (!tagIds || tagIds.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1">
        {tagIds.slice(0, 2).map((tag) => (
          <span
            key={tag._id}
            className="text-xs px-2 py-1 rounded-full"
            style={{
              backgroundColor: tag.color + '20',
              color: tag.color
            }}
          >
            {tag.name}
          </span>
        ))}
        {tagIds.length > 2 && (
          <span className="text-xs px-2 py-1 text-gray-500 bg-gray-100 rounded-full">
            +{tagIds.length - 2}
          </span>
        )}
      </div>
    );
  };

  // Enhanced status indicator
  const renderStatusIndicator = (item) => {
    const isAvailable = item.isAvailable;
    const hasStock = item.stockQuantity !== undefined && item.stockQuantity > 0;
    
    return (
      <div className="flex flex-col items-center gap-1">
        {/* Availability Toggle */}
        <button 
          onClick={() => handleToggleAvailability(item._id)}
          className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
            isAvailable ? 'bg-primary-600' : 'bg-gray-200'
          }`}
          title={isAvailable ? 'Mark unavailable' : 'Mark available'}
        >
          <span 
            className={`${
              isAvailable ? 'translate-x-5' : 'translate-x-0'
            } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
          ></span>
        </button>
        
        {/* Status Text */}
        <span className={`text-xs font-medium ${
          isAvailable ? 'text-green-600' : 'text-red-600'
        }`}>
          {isAvailable ? 'Available' : 'Unavailable'}
        </span>
        
        {/* Stock Indicator */}
        {item.stockQuantity !== undefined && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            hasStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {hasStock ? `Stock: ${item.stockQuantity}` : 'Out of Stock'}
          </span>
        )}
      </div>
    );
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto">
      {/* Loading Overlay */}
      {loading && items.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <LoadingSpinner size="lg" />
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Menu Items</h2>
          <p className="mt-1 text-sm text-gray-500">
            Easily manage and organize your restaurant's menu items.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <FunnelIcon className="h-4 w-4" />
            Filters
            {hasActiveFilters() && (
              <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                {Object.values(filters).filter(v => 
                  v !== null && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
                ).length}
              </span>
            )}
          </Button>
          <Button
            variant="primary"
            onClick={handleAddItem}
          >
            Add New Item
          </Button>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
            </svg>
          </div>
          <Input 
            type="search" 
            className="block w-full ps-10" 
            placeholder="Search by name, description, or ingredients..." 
            value={filters.search}
            onChange={handleSearchChange}
          />
          {searchLoading && (
            <div className="absolute inset-y-0 end-0 flex items-center pe-3">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {categories.map(category => (
                    <label key={category._id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange({ 
                              categories: [...filters.categories, category._id] 
                            });
                          } else {
                            handleFilterChange({ 
                              categories: filters.categories.filter(id => id !== category._id) 
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tag Filter - Only show if tags exist */}
              {tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {tags.map(tag => (
                      <label key={tag._id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.tags.includes(tag._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleFilterChange({ 
                                tags: [...filters.tags, tag._id] 
                              });
                            } else {
                              handleFilterChange({ 
                                tags: filters.tags.filter(id => id !== tag._id) 
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{tag.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Food Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Food Type</label>
                <div className="dropdown-container relative">
                  <button
                    onClick={() => setFoodTypeDropdownOpen(!foodTypeDropdownOpen)}
                    className="shrink-0 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 cursor-pointer rounded-lg hover:bg-gray-200 focus:outline-none"
                    type="button"
                  >
                    {getFoodTypeDisplayText()}
                    <svg className={`w-2.5 h-2.5 ms-2.5 transition-transform duration-200 ${foodTypeDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                    </svg>
                  </button>
                  {foodTypeDropdownOpen && (
                    <div className="absolute z-10 mt-1 bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-44 border border-gray-200">
                      <ul className="py-2 text-sm text-gray-700" aria-labelledby="dropdown-button">
                        <li>
                          <button
                            type="button"
                            onClick={() => handleFoodTypeSelect('')}
                            className={`inline-flex w-full px-4 py-2 hover:bg-gray-100 ${filters.foodType === '' ? 'bg-primary-50 text-primary-700' : ''}`}
                          >
                            All Types
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => handleFoodTypeSelect('veg')}
                            className={`inline-flex w-full px-4 py-2 hover:bg-gray-100 ${filters.foodType === 'veg' ? 'bg-primary-50 text-primary-700' : ''}`}
                          >
                            Veg
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => handleFoodTypeSelect('non-veg')}
                            className={`inline-flex w-full px-4 py-2 hover:bg-gray-100 ${filters.foodType === 'non-veg' ? 'bg-primary-50 text-primary-700' : ''}`}
                          >
                            Non-Veg
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <div className="dropdown-container relative">
                  <button
                    onClick={() => setAvailabilityDropdownOpen(!availabilityDropdownOpen)}
                    className="shrink-0 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 cursor-pointer rounded-lg hover:bg-gray-200 focus:outline-none"
                    type="button"
                  >
                    {getAvailabilityDisplayText()}
                    <svg className={`w-2.5 h-2.5 ms-2.5 transition-transform duration-200 ${availabilityDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                    </svg>
                  </button>
                  {availabilityDropdownOpen && (
                    <div className="absolute z-10 mt-1 bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-44 border border-gray-200">
                      <ul className="py-2 text-sm text-gray-700" aria-labelledby="dropdown-button">
                        <li>
                          <button
                            type="button"
                            onClick={() => handleAvailabilitySelect(null)}
                            className={`inline-flex w-full px-4 py-2 hover:bg-gray-100 ${filters.isAvailable === null ? 'bg-primary-50 text-primary-700' : ''}`}
                          >
                            All Items
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => handleAvailabilitySelect(true)}
                            className={`inline-flex w-full px-4 py-2 hover:bg-gray-100 ${filters.isAvailable === true ? 'bg-primary-50 text-primary-700' : ''}`}
                          >
                            Available
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={() => handleAvailabilitySelect(false)}
                            className={`inline-flex w-full px-4 py-2 hover:bg-gray-100 ${filters.isAvailable === false ? 'bg-primary-50 text-primary-700' : ''}`}
                          >
                            Unavailable
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>



            {/* Filter Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-gray-500">
                {items.length} item{items.length !== 1 ? 's' : ''} found
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Clear All
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Grouped Items */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([categoryName, categoryItems]) => (
          <div key={categoryName} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Category Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{categoryName}</h3>
                  <p className="text-sm text-gray-600">{categoryItems.length} item{categoryItems.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            {/* Items Grid - Mobile Responsive */}
            <div className="divide-y divide-gray-200">
              {categoryItems.map(item => (
                <div key={item._id} className="p-4 hover:bg-gray-50 transition-colors">
                  {/* Mobile Layout */}
                  <div className="block sm:hidden">
                    <div className="flex items-start gap-3">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <InlineImageEditor 
                          item={item} 
                          onImageUpdate={() => loadMenuItems(false)}
                          size="md"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <DietaryBadge isVeg={item.foodType === 'veg'} />
                          <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                          {renderSpicyLevel(item.spicyLevel)}
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                            {item.description}
                          </p>
                        )}

                        {/* Categories & Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {item.categoryIds && item.categoryIds.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.categoryIds.map((category) => (
                                <span key={category._id} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                  {category.name}
                                </span>
                              ))}
                            </div>
                          )}
                          {renderTags(item.tagIds)}
                        </div>

                        {/* Price & Status */}
                        <div className="flex items-center justify-between">
                          <InlinePriceEditor 
                            item={item} 
                            onPriceUpdate={() => loadMenuItems(false)}
                          />
                          {renderStatusIndicator(item)}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditItem(item._id)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <PencilSquareIcon className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item._id, item.name)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:grid sm:grid-cols-12 gap-4 items-center">
                    {/* Image */}
                    <div className="col-span-1">
                      <InlineImageEditor 
                        item={item} 
                        onImageUpdate={() => loadMenuItems(false)}
                        size="sm"
                      />
                    </div>

                    {/* Name & Details */}
                    <div className="col-span-3">
                      <div className="flex items-center gap-2 mb-1">
                        <DietaryBadge isVeg={item.foodType === 'veg'} />
                        <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                        {renderSpicyLevel(item.spicyLevel)}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Categories */}
                    <div className="col-span-2">
                      {item.categoryIds && item.categoryIds.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.categoryIds.map((category) => (
                            <span key={category._id} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                              {category.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Uncategorized</span>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="col-span-2">
                      {renderTags(item.tagIds)}
                    </div>

                    {/* Price */}
                    <div className="col-span-1">
                      <InlinePriceEditor 
                        item={item} 
                        onPriceUpdate={() => loadMenuItems(false)}
                      />
                    </div>

                    {/* Status */}
                    <div className="col-span-1">
                      {renderStatusIndicator(item)}
                    </div>

                    {/* Actions */}
                    <div className="col-span-2">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditItem(item._id)}
                          className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
                          title="Edit item"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item._id, item.name)}
                          className="p-2 text-red-600 hover:text-red-700 rounded-full hover:bg-red-50"
                          title="Delete item"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {items.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">No menu items found</h3>
          <p className="mt-2 text-gray-500">
            {hasActiveFilters()
              ? 'Try adjusting your filters or search terms'
              : 'Get started by adding your first menu item'}
          </p>
          {hasActiveFilters() && (
            <Button variant="secondary" onClick={clearFilters} className="mt-3 mr-2">
              Clear Filters
            </Button>
          )}
          <Button variant="primary" onClick={handleAddItem} className="mt-4">
            Add Menu Item
          </Button>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <MenuItemForm
          item={editingItem}
          onClose={handleFormClose}
          categories={categories}
          tags={tags}
        />
      )}

      {/* Confirm Delete Dialog */}
      {deleteConfirm.show && (
        <ConfirmDialog
          isOpen={deleteConfirm.show}
          title="Confirm Deletion"
          message={`Are you sure you want to delete "${deleteConfirm.itemName}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          confirmVariant="danger"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}; 