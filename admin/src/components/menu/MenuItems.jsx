import { useState, useEffect, useRef, useCallback } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { useTags } from '../../hooks/useTags';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { toast } from '../../components/common/Toast';
import { MenuItemCard } from '../../components/menu/MenuItemCard';
import { MenuItemForm } from '../../components/forms/MenuItemForm';
import menuItemService from '../../services/menuItemService';
import { Input } from '../common/Input';

export const MenuItems = () => {
  // State for items, loading, and filters
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    categories: [],
    tags: [],
    isVeg: null,
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
  }, [filters.categories, filters.tags, filters.isVeg, filters.spicyLevel, filters.isAvailable]);

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

  const handleDeleteItem = async (itemId) => {
    try {
      await menuItemService.deleteItem(itemId);
      toast.success('Menu item deleted successfully');
      loadMenuItems(false);
    } catch (error) {
      toast.error('Failed to delete menu item');
      console.error('Error deleting menu item:', error);
    }
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
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
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

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        {items.map(item => (
          <MenuItemCard
            key={item._id}
            item={item}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onToggleAvailability={handleToggleAvailability}
          />
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

      {/* Add/Edit Form Modal */}
      {showForm && (
        <MenuItemForm
          item={editingItem}
          onClose={handleFormClose}
          categories={categories}
          tags={tags}
        />
      )}
    </div>
  );
}; 