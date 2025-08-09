import ImageWithBlur from './ImageWithBlur.jsx';
import { DietaryBadge } from './DietaryBadge.jsx';

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

  return (
    <div className="flex gap-4 p-4 bg-surface rounded-lg border border-border hover:border-border-focus transition-colors">
      {/* Image */}
      <div className="flex-shrink-0 relative">
        <ImageWithBlur
          src={item.imageUrl}
          alt={item.name}
          className="w-20 h-20 rounded-lg"
          aspectRatio="1/1"
        />
        
        {/* Veg/Non-veg indicator */}
        <div className="absolute -top-1 -left-1">
          <DietaryBadge isVeg={item.foodType === 'veg'} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-text-primary line-clamp-2">
              {item.name}
              {renderSpicyLevel(item.spicyLevel)}
            </h3>
            
            {item.description && (
              <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
          
          <div className="flex-shrink-0 text-right">
            <div className="font-semibold text-text-primary">
              {formatPrice(item.price)}
            </div>
          </div>
        </div>

        {/* Tags */}
        {renderTags(item.tagIds)}
      </div>
    </div>
  );
}
