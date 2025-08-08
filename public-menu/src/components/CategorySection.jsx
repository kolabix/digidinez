import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import MenuItemCard from './MenuItemCard.jsx';
import clsx from 'clsx';

export default function CategorySection({ category, items }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!items || items.length === 0) return null;

  return (
    <section 
      id={`category-${category.id}`}
      className="section-anchor"
    >
      {/* Category Header */}
      <div className="sticky top-[140px] z-20 bg-surface border-b border-border">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-surface-muted transition-colors"
          aria-expanded={isExpanded}
        >
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-text-primary truncate">
              {category.name}
            </h2>
            <p className="text-sm text-text-secondary">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </p>
          </div>
          <ChevronDown 
            size={20} 
            className={clsx(
              'text-text-secondary transition-transform flex-shrink-0',
              {
                'rotate-180': isExpanded
              }
            )} 
          />
        </button>
      </div>

      {/* Menu Items */}
      {isExpanded && (
        <div className="px-4 py-4 space-y-4">
          {items.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
