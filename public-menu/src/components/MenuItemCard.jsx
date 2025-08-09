import ImageWithBlur from './ImageWithBlur.jsx';
import { DietaryBadge } from './DietaryBadge.jsx';

import { useEffect, useRef, useState } from 'react';

export default function MenuItemCard({ item }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(price);
  };

  const renderSpicyLevel = (level) => {
    if (!level || level === 0) return null;
    
    const peppers = '🌶'.repeat(Math.min(level, 3));
    return (
      <span className="text-sm text-text-secondary ml-1" title={`Spicy level: ${level}`}>
        {peppers}
      </span>
    );
  };

  const renderTags = (tags) => {
    if (!tags || tags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {tags.slice(0, 3).map((tag) => (
          <span
            key={tag.id}
            className="px-2 py-1 text-xs rounded-full border"
            style={{
              borderColor: tag.color,
              color: tag.color,
              backgroundColor: `${tag.color}10`
            }}
          >
            {tag.name}
          </span>
        ))}
        {tags.length > 3 && (
          <span className="px-2 py-1 text-xs text-text-secondary bg-surface-muted rounded-full">
            +{tags.length - 3}
          </span>
        )}
      </div>
    );
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descRef = useRef(null);

  useEffect(() => {
    const checkOverflow = () => {
      const el = descRef.current;
      if (!el) return;
      // Force clamp for measurement by toggling class via style
      // but simpler: measure full text vs client height with the clamp applied in CSS
      setIsOverflowing(el.scrollHeight > el.clientHeight + 1);
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [item?.description]);

  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  return (
    <div className="flex gap-4 p-4 bg-surface rounded-lg border border-border hover:border-border-focus transition-colors">
      {/* Image (only when present) */}
      {item?.imageUrl ? (
        <div className="flex-shrink-0">
          <ImageWithBlur
            src={item.imageUrl}
            alt={item.name}
            className="w-20 h-20 rounded-lg"
            aspectRatio="1/1"
          />
        </div>
      ) : null}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Top row: title + price */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="mt-[2px] flex-shrink-0">
              <DietaryBadge isVeg={item.foodType === 'veg'} />
            </div>
            <h3 className="min-w-0 font-medium text-text-primary line-clamp-2">
              {item.name}
              {renderSpicyLevel(item.spicyLevel)}
            </h3>
          </div>
          <div className="flex-shrink-0 text-right font-semibold text-text-primary">
            {formatPrice(item.price)}
          </div>
        </div>

        {/* Second row: description spans full width */}
        {item.description && (
          <div className="mt-1">
            <p
              ref={descRef}
              className={`text-sm text-text-secondary ${!isExpanded ? 'line-clamp-2' : ''}`}
            >
              {item.description}
            </p>
            {isOverflowing && (
              <button
                onClick={toggleExpanded}
                className="mt-1 text-sm font-medium text-primary hover:underline"
                aria-expanded={isExpanded}
              >
                {isExpanded ? 'Read less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {/* Tags */}
        {renderTags(item.tagIds)}
      </div>
    </div>
  );
}
