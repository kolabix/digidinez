import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { DietaryBadge } from './DietaryBadge.jsx';

export default function VegToggle({ value, onChange }) {
  const options = [
    { key: 'all', label: 'All', icon: null },
    { key: 'veg', label: 'Veg', icon: 'veg' },
    { key: 'nonveg', label: 'Non-veg', icon: 'nonveg' }
  ];

  const getCurrentValue = () => {
    if (value.veg === 'true') return 'veg';
    if (value.nonveg === 'true') return 'nonveg';
    return 'all';
  };

  const handleOptionClick = (optionKey) => {
    const newValue = {};
    
    if (optionKey === 'veg') {
      newValue.veg = 'true';
      newValue.nonveg = undefined;
    } else if (optionKey === 'nonveg') {
      newValue.veg = undefined;
      newValue.nonveg = 'true';
    } else {
      newValue.veg = undefined;
      newValue.nonveg = undefined;
    }
    
    onChange(newValue);
  };

  const currentValue = getCurrentValue();

  return (
    <div className="flex bg-surface-muted rounded-lg p-1">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = currentValue === option.key;
        
        return (
          <button
            key={option.key}
            onClick={() => handleOptionClick(option.key)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              {
                'bg-surface text-text-primary shadow-sm': isActive,
                'text-text-secondary hover:text-text-primary': !isActive
              }
            )}
            aria-label={`Show ${option.label} items`}
            aria-pressed={isActive}
          >
            {option.icon && (
              <DietaryBadge 
                isVeg={option.icon === 'veg'} 
              />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
