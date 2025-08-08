import { useState, useEffect, useRef } from 'react';
import { loadInitialData, filterItems } from './lib/api.js';
import { getRestaurantSlug, useQueryState, parseCommaList } from './lib/url.js';
import Header from './components/Header.jsx';
import FilterBar from './components/FilterBar.jsx';
import CategorySection from './components/CategorySection.jsx';
import BottomBar from './components/BottomBar.jsx';
import CategorySheet from './components/CategorySheet.jsx';
import EmptyState from './components/EmptyState.jsx';

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const loadingRef = useRef(false);

  // URL state management
  const { params, setParam } = useQueryState();

  // Load initial data
  useEffect(() => {
    // Prevent multiple API calls
    if (loadingRef.current) return;
    loadingRef.current = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const slug = getRestaurantSlug();
        if (!slug) {
          throw new Error('Restaurant ID not found in URL or environment');
        }

        const result = await loadInitialData({ slug });
        setData(result);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err.message || 'Failed to load menu data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Build items by category
  const itemsByCategory = data?.categories?.reduce((acc, category) => {
    const categoryItems = data.items.filter(item => 
      item.categoryIds?.some(cat => cat.id === category.id)
    );
    acc[category.id] = categoryItems;
    return acc;
  }, {}) || {};



  // Filter items based on URL params
  const filteredItems = data?.items ? filterItems(data.items, {
    veg: params.veg,
    nonveg: params.nonveg,
    tags: parseCommaList(params.tags),
    q: params.q
  }) : [];

  // Build filtered items by category
  const filteredItemsByCategory = data?.categories?.reduce((acc, category) => {
    const categoryItems = filteredItems.filter(item => 
      item.categoryIds?.some(cat => cat.id === category.id)
    );
    if (categoryItems.length > 0) {
      acc[category.id] = categoryItems;
    }
    return acc;
  }, {}) || {};

  // Check if any filters are active
  const hasFilters = params.veg || params.nonveg || params.tags || params.q;

  // Handle search change
  const handleSearchChange = (searchTerm) => {
    setParam('q', searchTerm || undefined);
  };

  // Handle filter changes
  const handleFilterChange = (newParams) => {
    Object.entries(newParams).forEach(([key, value]) => {
      setParam(key, value);
    });
  };

  // Handle category sheet
  const handleMenuClick = () => {
    setCategorySheetOpen(true);
  };

  const handleCategorySheetClose = () => {
    setCategorySheetOpen(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="sticky top-0 z-40 bg-surface border-b border-border">
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-surface-muted rounded-lg" />
                <div className="flex-1">
                  <div className="h-6 bg-surface-muted rounded w-3/4 mb-1" />
                  <div className="h-4 bg-surface-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          </div>

          {/* Filter bar skeleton */}
          <div className="sticky top-[73px] z-30 bg-surface border-b border-border">
            <div className="px-4 py-3">
              <div className="h-10 bg-surface-muted rounded-lg w-48" />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="px-4 py-8 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-12 bg-surface-muted rounded mb-4" />
                <div className="space-y-4">
                  {[1, 2].map((j) => (
                    <div key={j} className="flex gap-4 p-4 bg-surface rounded-lg border">
                      <div className="w-20 h-20 bg-surface-muted rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-surface-muted rounded w-3/4" />
                        <div className="h-3 bg-surface-muted rounded w-1/2" />
                        <div className="h-4 bg-surface-muted rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-text-primary mb-2">
            Something went wrong
          </h1>
          <p className="text-text-secondary mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return <EmptyState hasFilters={false} />;
  }

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <Header restaurant={data.restaurant} />

      {/* Filter Bar */}
      <FilterBar
        tags={data.tags}
        value={params}
        onChange={handleFilterChange}
      />

      {/* Content */}
      <main>
        {data.categories.length === 0 ? (
          <EmptyState hasFilters={false} />
        ) : Object.keys(filteredItemsByCategory).length === 0 ? (
          <EmptyState hasFilters={hasFilters} />
        ) : (
          data.categories
            .filter(category => filteredItemsByCategory[category.id])
            .map(category => (
              <CategorySection
                key={category.id}
                category={category}
                items={filteredItemsByCategory[category.id]}
              />
            ))
        )}
      </main>

      {/* Bottom Bar */}
      <BottomBar
        restaurantId={data.restaurant.id}
        categories={data.categories}
        itemsByCategory={itemsByCategory}
        onSearchChange={handleSearchChange}
        onMenuClick={handleMenuClick}
        searchValue={params.q || ''}
      />

      {/* Category Sheet */}
      <CategorySheet
        isOpen={categorySheetOpen}
        onClose={handleCategorySheetClose}
        categories={data.categories}
        itemsByCategory={filteredItemsByCategory}
      />
    </div>
  );
}
