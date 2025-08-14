import { useState, useRef, useEffect } from 'react';
import { toast } from '../common/Toast';
import { LoadingSpinner } from '../common/LoadingSpinner';
import menuItemService from '../../services/menuItemService';
import { PencilIcon } from '@heroicons/react/24/solid';

export const InlinePriceEditor = ({ item, onPriceUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editValue, setEditValue] = useState(item.price?.toString() || '');
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Reset edit value when item changes
  useEffect(() => {
    setEditValue(item.price?.toString() || '');
  }, [item.price]);

  // Handle click outside to cancel editing
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isEditing && containerRef.current && !containerRef.current.contains(event.target)) {
        handleCancel();
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isEditing]);

  const handlePriceClick = () => {
    if (!isEditing) {
      setIsEditing(true);
      setEditValue(item.price?.toString() || '');
      // Focus the input after a brief delay to ensure it's rendered
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 10);
    }
  };

  const handleSave = async () => {
    const newPrice = parseFloat(editValue);
    
    // Validate price
    if (isNaN(newPrice) || newPrice < 0) {
      toast.error('Please enter a valid price (must be a positive number)');
      return;
    }

    if (newPrice === item.price) {
      setIsEditing(false);
      return;
    }

    try {
      setIsUpdating(true);
      await menuItemService.updateItem(item._id, { price: newPrice });
      toast.success('Price updated successfully');
      onPriceUpdate(); // Refresh the parent component
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error('Failed to update price');
      // Reset to original value on error
      setEditValue(item.price?.toString() || '');
    } finally {
      setIsUpdating(false);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(item.price?.toString() || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const formatPrice = (price) => {
    return `₹${price?.toString() || '0'}`;
  };

  if (isEditing) {
    return (
      <div ref={containerRef} className="flex items-center gap-1">
        <div className="relative">
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm pointer-events-none">₹</span>
          <input
            ref={inputRef}
            type="number"
            min="0"
            step="0.01"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-20 pl-6 pr-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>
        
        {isUpdating && <LoadingSpinner size="sm" />}
      </div>
    );
  }

  return (
    <div 
      className="flex items-center gap-1 group cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
      onClick={handlePriceClick}
    >
      <span className="font-semibold text-gray-900">
        {formatPrice(item.price)}
      </span>
      <PencilIcon className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};
