import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import useForm from '../../hooks/useForm';
import Button from '../common/Button';
import Input from '../common/Input';

const TagForm = ({ isOpen, onClose, onSubmit, tag = null, existingTags = [] }) => {
  const [selectedColor, setSelectedColor] = useState('#3B82F6');

  // Predefined color options for quick selection
  const colorOptions = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Green', value: '#22C55E' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Gray', value: '#6B7280' }
  ];

  const { values, errors, handleChange, handleSubmit, setFieldError, resetForm, setFormValues } = useForm({
    initialValues: {
      name: '',
      color: '#3B82F6'
    },
    onSubmit: async (formData) => {
      // Validate tag name uniqueness
      const trimmedName = formData.name.trim();
      const existingTag = existingTags.find(t => 
        t.name.toLowerCase() === trimmedName.toLowerCase() && 
        (!tag || t._id !== tag._id) // Exclude current tag when editing
      );

      if (existingTag) {
        setFieldError('name', 'A tag with this name already exists');
        return;
      }

      await onSubmit({
        name: trimmedName,
        color: formData.color
      });
    }
  });

  // Set form values when editing or reset when creating new
  useEffect(() => {
    if (tag) {
      setFormValues({
        name: tag.name,
        color: tag.color
      });
      setSelectedColor(tag.color);
    } else {
      // Use setFormValues instead of resetForm to avoid potential conflicts
      setFormValues({
        name: '',
        color: '#3B82F6'
      });
      setSelectedColor('#3B82F6');
    }
  }, [tag, setFormValues]);

  // Handle color selection
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    handleChange({ target: { name: 'color', value: color } });
  };

  // Handle custom color input
  const handleCustomColorChange = (e) => {
    const color = e.target.value;
    setSelectedColor(color);
    handleChange(e);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {tag ? 'Edit Tag' : 'Create New Tag'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tag Name */}
          <Input
            label="Tag Name"
            name="name"
            type="text"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="e.g., Spicy, Vegan, Chef's Special"
            required
            maxLength={30}
          />

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tag Color
            </label>
            
            {/* Predefined Colors */}
            <div className="grid grid-cols-5 gap-2 mb-3">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleColorSelect(color.value)}
                  className={`
                    w-8 h-8 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                    ${selectedColor === color.value 
                      ? 'border-gray-900 ring-2 ring-primary-500' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>

            {/* Custom Color Input */}
            <div className="flex items-center space-x-2">
              <input
                type="color"
                name="color"
                value={selectedColor}
                onChange={handleCustomColorChange}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                title="Custom color"
              />
              <Input
                name="color"
                type="text"
                value={values.color}
                onChange={handleCustomColorChange}
                placeholder="#3B82F6"
                className="flex-1"
                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                title="Enter a valid hex color (e.g., #FF0000)"
              />
            </div>
            {errors.color && (
              <p className="mt-1 text-sm text-red-600">{errors.color}</p>
            )}
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div className="flex items-center space-x-2">
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: selectedColor }}
              >
                {values.name || 'Tag Name'}
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              {tag ? 'Update Tag' : 'Create Tag'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TagForm;
