import { useState, useEffect, useRef } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { useTags } from '../../hooks/useTags';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { toast } from '../../components/common/Toast';
import { MenuItemCard } from '../../components/menu/MenuItemCard';
import { MenuItemFilters } from '../../components/menu/MenuItemFilters';
import { MenuItemForm } from '../../components/forms/MenuItemForm';
import menuItemService from '../../services/menuItemService';

export const MenuItems = () => {
  // State for items, loading, and filters
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadMenuItems();
    }
  }, []);

  // Load items when filters change
  useEffect(() => {
    // Skip the first render
    if (hasLoadedRef.current) {
      loadMenuItems();
    }
  }, [filters]);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const response = await menuItemService.getItems(filters);
      setItems(response.data.menuItems);
    } catch (error) {
      toast.error('Failed to load menu items');
      console.error('Error loading menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
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
      loadMenuItems();
    } catch (error) {
      toast.error('Failed to delete menu item');
      console.error('Error deleting menu item:', error);
    }
  };

  const handleToggleAvailability = async (itemId) => {
    try {
      await menuItemService.toggleAvailability(itemId);
      toast.success('Item availability updated');
      loadMenuItems();
    } catch (error) {
      toast.error('Failed to update item availability');
      console.error('Error toggling availability:', error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(null);
    loadMenuItems(); // Refresh list after add/edit
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menu Items</h1>
        <Button variant="primary" onClick={handleAddItem}>
          Add New Item
        </Button>
      </div>

      {/* Filters */}
      <MenuItemFilters
        filters={filters}
        onChange={handleFilterChange}
        categories={categories}
        tags={tags}
      />

      {/* Loading Overlay */}
      {loading && items.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {items.map(item => (
          <MenuItemCard
            key={item.id}
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
              ? 'Try adjusting your filters'
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