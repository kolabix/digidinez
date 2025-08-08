import clsx from 'clsx';

export default function TagChips({ tags, selectedTags, onTagToggle }) {
  if (!tags || tags.length === 0) return null;

  const handleTagClick = (tagId) => {
    const isSelected = selectedTags.includes(tagId);
    if (isSelected) {
      onTagToggle(selectedTags.filter(id => id !== tagId));
    } else {
      onTagToggle([...selectedTags, tagId]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag.id);
        
        return (
          <button
            key={tag.id}
            onClick={() => handleTagClick(tag.id)}
            className={clsx(
              'px-3 py-1.5 text-sm font-medium rounded-full border transition-all',
              {
                'border-transparent': isSelected,
                'border-border hover:border-border-focus': !isSelected
              }
            )}
            style={{
              backgroundColor: isSelected ? tag.color : 'transparent',
              color: isSelected ? '#ffffff' : tag.color,
              borderColor: isSelected ? tag.color : undefined
            }}
            aria-label={`${isSelected ? 'Remove' : 'Add'} ${tag.name} filter`}
            aria-pressed={isSelected}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
