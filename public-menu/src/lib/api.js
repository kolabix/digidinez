import { getRestaurantId } from './url.js';

/**
 * Make API request with error handling
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const url = `/api${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

/**
 * Load data using restaurant ID (slug is actually the restaurant ID)
 */
export async function loadInitialData({ slug }) {
  // The slug parameter is actually the restaurant ID
  const restaurantId = slug || getRestaurantId();
  
  if (!restaurantId) {
    throw new Error('Restaurant ID not found in URL or environment');
  }

  try {
    // Use the unified public menu endpoint
    const data = await apiRequest(`/menu/public/${restaurantId}`);
    
    // Validate unified response structure
    if (data.success && data.data && data.data.restaurant) {
      const items = data.data.menuItems || [];
      
      // Normalize the data structure
      const normalizedItems = normalizeMenuItems(items);
      const normalizedCategories = normalizeCategories(data.data.categories || []);
      const normalizedTags = data.data.tags || extractTagsFromItems(normalizedItems);
      
      return {
        restaurant: data.data.restaurant,
        categories: normalizedCategories,
        items: normalizedItems,
        tags: normalizedTags,
        mode: 'unified'
      };
    } else {
      throw new Error('Invalid response structure from API');
    }
  } catch (error) {
    console.error('Failed to load menu data:', error);
    throw error;
  }
}



/**
 * Normalize menu items to match expected structure
 */
export function normalizeMenuItems(items) {
  return items.map(item => ({
    id: item.id || item._id,
    name: item.name,
    description: item.description,
    price: item.price,
    imageUrl: item.imageUrl || (item.image ? item.image.url : null),
    isAvailable: item.isAvailable,
    foodType: item.foodType || 'veg',
    spicyLevel: item.spicyLevel || 0,
    categoryIds: (item.categoryIds || []).map(cat => ({
      id: cat.id || cat._id,
      name: cat.name
    })),
    tagIds: (item.tagIds || []).map(tag => ({
      id: tag.id || tag._id,
      name: tag.name,
      color: tag.color
    }))
  }));
}

/**
 * Normalize categories to match expected structure
 */
export function normalizeCategories(categories) {
  return categories.map(category => ({
    id: category.id || category._id,
    name: category.name,
    sortOrder: category.sortOrder || 0
  }));
}

/**
 * Extract unique tags from menu items
 */
export function extractTagsFromItems(items) {
  const tagMap = new Map();
  
  items.forEach(item => {
    if (item.tagIds && Array.isArray(item.tagIds)) {
      item.tagIds.forEach(tag => {
        // Handle both 'id' and '_id' field names
        const tagId = tag.id || tag._id;
        if (tagId && tag.name) {
          tagMap.set(tagId, {
            id: tagId,
            name: tag.name,
            color: tag.color || '#6b7280'
          });
        }
      });
    }
  });
  
  return Array.from(tagMap.values());
}

/**
 * Search items (client-side only for now)
 */
export async function searchItems({ restaurantId, query }) {
  if (!query || query.trim().length < 2) return [];

  // For now, we'll use client-side search since the backend doesn't have a search endpoint
  // In the future, if a search endpoint is added, we can implement server-side search here
  return null; // Will be handled by client-side filtering
}

/**
 * Filter items based on criteria
 */
export function filterItems(items, { veg, nonveg, tags, q }) {
  return items.filter(item => {
    // Veg/Non-veg filter
    const isVeg = item.foodType === 'veg';
    if (veg === 'true' && !isVeg) return false;
    if (nonveg === 'true' && isVeg) return false;
    
    // Tags filter
    if (tags && tags.length > 0) {
      const itemTagIds = item.tagIds?.map(tag => tag.id) || [];
      const hasMatchingTag = tags.some(tagId => itemTagIds.includes(tagId));
      if (!hasMatchingTag) return false;
    }
    
    // Search filter
    if (q && q.trim()) {
      const searchTerm = q.toLowerCase().trim();
      const nameMatch = item.name?.toLowerCase().includes(searchTerm);
      const descMatch = item.description?.toLowerCase().includes(searchTerm);
      if (!nameMatch && !descMatch) return false;
    }
    
    return true;
  });
}
