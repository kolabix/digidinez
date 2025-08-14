import { useState, useEffect, useRef } from 'react';
import { Search, Menu } from 'lucide-react';

export default function BottomBar({ 
  restaurantId, 
  categories, 
  itemsByCategory, 
  onSearchChange, 
  onMenuClick,
  searchValue = ''
}) {
  const [searchInput, setSearchInput] = useState(searchValue);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      onSearchChange(searchInput);
    }, 250);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput, onSearchChange]);

  // Sync with external search value
  useEffect(() => {
    setSearchInput(searchValue);
  }, [searchValue]);

  const handleSearchFocus = () => {
    setShowSearchResults(true);
  };

  const handleSearchBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => setShowSearchResults(false), 200);
  };

  const handleSearchResultClick = (categoryId) => {
    setShowSearchResults(false);
    setSearchInput('');
    onSearchChange('');
    
    // Scroll to category with proper offset for sticky header
    setTimeout(() => {
      const element = document.getElementById(`category-${categoryId}`);
      if (element) {
        const headerHeight = 140; // Height of sticky header + filter bar
        const elementTop = element.offsetTop;
        const scrollTop = elementTop - headerHeight;
        
        window.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  // Get search results (top 5 items)
  const getSearchResults = () => {
    if (!searchInput.trim() || searchInput.trim().length < 2) return [];
    
    const searchTerm = searchInput.toLowerCase().trim();
    const results = [];
    
    categories.forEach(category => {
      const items = itemsByCategory[category.id] || [];
      const matchingItems = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        (item.description && item.description.toLowerCase().includes(searchTerm))
      );
      
      if (matchingItems.length > 0) {
        results.push({
          category,
          items: matchingItems.slice(0, 2) // Max 2 items per category
        });
      }
    });
    
    return results.slice(0, 5); // Max 5 results total
  };

  const searchResults = getSearchResults();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border">
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="relative">
              <Search 
                size={18} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" 
              />
              {/* iOS Safari zoom prevention: text-base (16px) on mobile, text-sm (14px) on desktop */}
              <input
                ref={searchInputRef}
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                placeholder={`Search in ${restaurantId ? 'menu' : 'restaurant'}...`}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-muted border border-border rounded-lg text-base sm:text-sm focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-border-focus"
              />
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-surface border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {searchResults.map(({ category, items }) => (
                  <div key={category.id} className="border-b border-border last:border-b-0">
                    <div className="px-3 py-2 bg-surface-muted text-xs font-medium text-text-secondary">
                      {category.name}
                    </div>
                    {items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSearchResultClick(category.id)}
                        className="w-full px-3 py-2 text-left hover:bg-surface-muted text-sm"
                      >
                        <div className="font-medium text-text-primary truncate">
                          {item.name}
                        </div>
                        {item.description && (
                          <div className="text-text-secondary truncate text-xs">
                            {item.description}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Menu Button */}
          <button
            onClick={onMenuClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-text-primary text-white rounded-lg font-medium text-sm hover:bg-text-primary/90 transition-colors"
            aria-label="Open menu categories"
          >
            <Menu size={18} />
            Menu
          </button>
        </div>
      </div>
    </div>
  );
}
