import { useState, useEffect, useRef } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { useTags } from '../../hooks/useTags';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { toast } from '../../components/common/Toast';
import { MenuItemForm } from '../../components/forms/MenuItemForm';
import menuItemService from '../../services/menuItemService';
import { Input } from '../common/Input';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { DietaryBadge } from '../common/DietaryBadge';
import placeholderImage from '../../assets/placeholder-food-img.jpg';

export const MenuItems = () => {
  // State for items, loading, and filters
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, itemId: null, itemName: '' });
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
      
      {/* Header - Keeping exact same structure */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Menu Items</h2>
          <p className="mt-1 text-sm text-gray-500">
            Easily manage and organize your restaurant's menu items.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleAddItem}
        >
          Add New Item
        </Button>
      </div>

      {/* Search Component */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
            </svg>
          </div>
          <Input 
            type="search" 
            className="block w-full ps-10" 
            placeholder="Search Menu Items" 
            value={filters.search}
            onChange={handleSearchChange}
          />
          {searchLoading && (
            <div className="absolute inset-y-0 end-0 flex items-center pe-3">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
      </div>

      {/* Compact Table Layout */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-1">Image</div>
            <div className="col-span-3">Name & Details</div>
            <div className="col-span-2">Categories</div>
            <div className="col-span-2">Tags</div>
            <div className="col-span-1">Price</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {items.map(item => (
            <div key={item._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Image */}
                <div className="col-span-1">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={item.imageUrl || placeholderImage}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
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
                      {item.categoryIds.map((category, index) => (
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
                  <span className="font-semibold text-gray-900">₹{item.price}</span>
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <div className="flex items-center">
                    <button 
                      onClick={() => handleToggleAvailability(item._id)}
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
                  </div>
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

        {/* Empty State */}
        {items.length === 0 && !loading && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No menu items found</h3>
            <p className="mt-2 text-gray-500">
              {Object.values(filters).some(v => v !== null && v !== '' && v.length !== 0)
                ? 'Try searching for a different menu item'
                : 'Get started by adding your first menu item'}
            </p>
            <Button variant="primary" onClick={handleAddItem} className="mt-4">
              Add Menu Item
            </Button>
          </div>
        )}
      </div>

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