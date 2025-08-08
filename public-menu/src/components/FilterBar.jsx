import { useState } from 'react';
import { ChevronDown, Filter } from 'lucide-react';
import VegToggle from './VegToggle.jsx';
import TagChips from './TagChips.jsx';
import clsx from 'clsx';

export default function FilterBar({ tags, value, onChange }) {
  const [showTags, setShowTags] = useState(false);

  const selectedTags = value.tags ? value.tags.split(',').filter(Boolean) : [];

  const handleTagToggle = (newTags) => {
    onChange({
      ...value,
      tags: newTags.length > 0 ? newTags.join(',') : undefined
    });
  };

  return (
    <div className="sticky top-[73px] z-30 bg-surface border-b border-border">
      <div className="px-4 py-3">
        {/* Main filter row */}
        <div className="flex items-center gap-3">
          <VegToggle value={value} onChange={onChange} />
          
          {tags && tags.length > 0 && (
            <button
              onClick={() => setShowTags(!showTags)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                {
                  'border-primary bg-primary text-white': showTags,
                  'border-border text-text-secondary hover:text-text-primary': !showTags
                }
              )}
              aria-expanded={showTags}
            >
              <Filter size={14} />
              Filters
              <ChevronDown 
                size={14} 
                className={clsx('transition-transform', {
                  'rotate-180': showTags
                })} 
              />
            </button>
          )}
        </div>

        {/* Tags section */}
        {showTags && tags && tags.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <TagChips
              tags={tags}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
            />
          </div>
        )}
      </div>
    </div>
  );
}
