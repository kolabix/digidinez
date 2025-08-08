import { Search, Filter } from 'lucide-react';

export default function EmptyState({ hasFilters }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center mb-4">
        {hasFilters ? (
          <Filter size={24} className="text-text-secondary" />
        ) : (
          <Search size={24} className="text-text-secondary" />
        )}
      </div>
      
      <h3 className="text-lg font-medium text-text-primary mb-2">
        {hasFilters ? 'No items found' : 'No menu items available'}
      </h3>
      
      <p className="text-text-secondary max-w-sm">
        {hasFilters 
          ? 'Try adjusting your filters or search terms to find what you\'re looking for.'
          : 'This restaurant hasn\'t added any menu items yet. Please check back later.'
        }
      </p>
    </div>
  );
}
