import { useState, useCallback } from 'react';
import Select from 'react-select';
import useForm from '../../hooks/useForm';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { toast } from '../common/Toast';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ConfirmDialog } from '../common/ConfirmDialog';
import menuItemService from '../../services/menuItemService';

const selectStyles = {
  control: (base) => ({
    ...base,
    minHeight: '42px',
    borderColor: '#D1D5DB',
    '&:hover': {
      borderColor: '#9CA3AF'
    }
  }),
  option: (base, { data, isSelected }) => {
    // Special styling for tags
    if (data.color) {
      return {
        ...base,
        backgroundColor: isSelected ? `${data.color}33` : 'transparent',
        color: data.color,
        '&:hover': {
          backgroundColor: `${data.color}22`
        }
      };
    }
    // Default styling for categories and other options
    return {
      ...base,
      backgroundColor: isSelected ? '#4F46E5' : base.backgroundColor,
      '&:hover': {
        backgroundColor: isSelected ? '#4F46E5' : '#F3F4F6'
      }
    };
  },
  multiValue: (base, { data }) => ({
    ...base,
    backgroundColor: data.color ? `${data.color}33` : '#E5E7EB',
  }),
  multiValueLabel: (base, { data }) => ({
    ...base,
    color: data.color || '#374151',
    fontSize: '0.875rem'
  }),
  multiValueRemove: (base, { data }) => ({
    ...base,
    color: data.color || '#374151',
    '&:hover': {
      backgroundColor: data.color ? `${data.color}44` : '#D1D5DB',
      color: data.color || '#1F2937'
    }
  })
};

export const MenuItemForm = ({ item = null, onClose, categories, tags }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(item?.imageUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { values, errors, handleChange, handleSubmit, setFieldValue, setFieldError } = useForm({
    initialValues: {
      name: item?.name || '',
      description: item?.description || '',
      price: item?.price || '',
      categoryIds: item?.categoryIds?.map(cat => cat._id) || [],
      tagIds: item?.tagIds?.map(tag => tag._id) || [],
      isVeg: item?.isVeg ?? false,
      isSpicy: item?.isSpicy ?? false,
      spicyLevel: item?.spicyLevel || 0,
      isAvailable: item?.isAvailable ?? true,
      preparationTime: item?.preparationTime || 15,
      nutritionInfo: item?.nutritionInfo || {
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
      },
      allergens: item?.allergens || []
    },
    onSubmit: async (formData) => {
      try {
        setIsSubmitting(true);

        // Format the price as a number
        formData.price = parseFloat(formData.price);
        
        // Format nutrition info values as numbers
        formData.nutritionInfo = {
          calories: parseFloat(formData.nutritionInfo.calories) || 0,
          protein: parseFloat(formData.nutritionInfo.protein) || 0,
          carbs: parseFloat(formData.nutritionInfo.carbs) || 0,
          fat: parseFloat(formData.nutritionInfo.fat) || 0
        };

        // Create or update the menu item
        const response = item
          ? await menuItemService.updateItem(item._id, formData)
          : await menuItemService.createItem(formData);

        // Handle image upload if there's a new image
        if (imageFile && response.data.menuItem._id) {
          await menuItemService.uploadImage(response.data.menuItem._id, imageFile);
        }

        toast.success(item ? 'Menu item updated successfully' : 'Menu item created successfully');
        onClose();
      } catch (error) {
        console.error('Error saving menu item:', error);
        if (error.response?.data?.errors) {
          // Set field-specific errors
          Object.entries(error.response.data.errors).forEach(([field, message]) => {
            setFieldError(field, message);
          });
        } else {
          toast.error('Failed to save menu item');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Only JPEG, PNG and WebP images are allowed');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const confirmRemoveImage = async () => {
    if (item?._id) {
      try {
        await menuItemService.deleteImage(item._id);
        toast.success('Image removed successfully');
      } catch (error) {
        toast.error('Failed to remove image');
        return;
      }
    }
    setImageFile(null);
    setImagePreview(null);
    setShowConfirm(false);
  };

  // Common allergens in Indian cuisine
  const commonAllergens = [
    'dairy', 'eggs', 'fish', 'shellfish', 'tree-nuts',
    'peanuts', 'wheat', 'soy', 'sesame'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {item ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Name"
                name="name"
                value={values.name}
                onChange={handleChange}
                error={errors.name}
                required
              />
              <Input
                label="Price (₹)"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={values.price}
                onChange={handleChange}
                error={errors.price}
                required
              />
            </div>

            <Input
              label="Description"
              name="description"
              value={values.description}
              onChange={handleChange}
              error={errors.description}
              multiline
              rows={3}
            />

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Image
              </label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="danger"
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 flex items-center justify-center"
                      onClick={handleRemoveImage}
                    >
                      ✕
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer text-gray-600 text-sm text-center p-2"
                    >
                      Click to upload<br />or drag and drop
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Categories and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories
                </label>
                <Select
                  isMulti
                  name="categoryIds"
                  value={categories?.filter(cat => 
                    values.categoryIds?.includes(cat._id.toString()) || 
                    values.categoryIds?.includes(cat._id)
                  )?.map(cat => ({
                    value: cat._id,
                    label: cat.name
                  })) || []}
                  options={categories?.map(cat => ({
                    value: cat._id,
                    label: cat.name
                  })) || []}
                  onChange={(selectedOptions) => {
                    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
                    setFieldValue('categoryIds', selectedIds);
                  }}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  styles={selectStyles}
                  placeholder="Select categories..."
                />
                {errors.categoryIds && (
                  <p className="mt-1 text-sm text-red-600">{errors.categoryIds}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <Select
                  isMulti
                  name="tagIds"
                  value={tags?.filter(tag => 
                    values.tagIds?.includes(tag._id.toString()) || 
                    values.tagIds?.includes(tag._id)
                  )?.map(tag => ({
                    value: tag._id,
                    label: tag.name,
                    color: tag.color
                  })) || []}
                  options={tags?.map(tag => ({
                    value: tag._id,
                    label: tag.name,
                    color: tag.color
                  })) || []}
                  onChange={(selectedOptions) => {
                    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
                    setFieldValue('tagIds', selectedIds);
                  }}
                  formatOptionLabel={({ label, color }) => (
                    <span
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{
                        backgroundColor: color + '33',
                        color: color
                      }}
                    >
                      {label}
                    </span>
                  )}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  styles={selectStyles}
                  placeholder="Select tags..."
                />
                {errors.tagIds && (
                  <p className="mt-1 text-sm text-red-600">{errors.tagIds}</p>
                )}
              </div>
            </div>

            {/* Item Properties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Properties
                </label>
                <div className="space-y-3">
                  <Input
                    type="checkbox"
                    label="Veg"
                    name="isVeg"
                    checked={values.isVeg}
                    onChange={handleChange}
                    className="rounded text-green-600"
                  />

                  <Input
                    type="checkbox"
                    label="Spicy"
                    name="isSpicy"
                    checked={values.isSpicy}
                    onChange={(e) => {
                      handleChange(e);
                      if (!e.target.value) {
                        setFieldValue('spicyLevel', 0);
                      }
                    }}
                    className="rounded text-red-600"
                  />

                  {values.isSpicy && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Spicy Level
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3].map(level => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setFieldValue('spicyLevel', level)}
                            className={`w-8 h-8 rounded-full text-sm ${
                              values.spicyLevel === level
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            } hover:bg-red-50`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Input
                    type="checkbox"
                    label="Available"
                    name="isAvailable"
                    checked={values.isAvailable}
                    onChange={handleChange}
                    className="rounded text-primary-600"
                  />
                </div>
              </div>

              <div>
                <Input
                  label="Preparation Time (minutes)"
                  name="preparationTime"
                  type="number"
                  min="0"
                  value={values.preparationTime}
                  onChange={handleChange}
                  error={errors.preparationTime}
                />
              </div>
            </div>

            {/* Nutrition Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Nutrition Information (per serving)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Input
                  label="Calories"
                  name="nutritionInfo.calories"
                  type="number"
                  min="0"
                  value={values.nutritionInfo.calories}
                  onChange={handleChange}
                  error={errors.nutritionInfo?.calories}
                />
                <Input
                  label="Protein (g)"
                  name="nutritionInfo.protein"
                  type="number"
                  min="0"
                  value={values.nutritionInfo.protein}
                  onChange={handleChange}
                  error={errors.nutritionInfo?.protein}
                />
                <Input
                  label="Carbs (g)"
                  name="nutritionInfo.carbs"
                  type="number"
                  min="0"
                  value={values.nutritionInfo.carbs}
                  onChange={handleChange}
                  error={errors.nutritionInfo?.carbs}
                />
                <Input
                  label="Fat (g)"
                  name="nutritionInfo.fat"
                  type="number"
                  min="0"
                  value={values.nutritionInfo.fat}
                  onChange={handleChange}
                  error={errors.nutritionInfo?.fat}
                />
              </div>
            </div>

            {/* Allergens */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergens
              </label>
              <Select
                isMulti
                name="allergens"
                value={values.allergens.map(allergen => ({
                  value: allergen,
                  label: allergen
                }))}
                options={commonAllergens.map(allergen => ({
                  value: allergen,
                  label: allergen
                }))}
                onChange={(selectedOptions) => {
                  const selectedAllergens = selectedOptions ? selectedOptions.map(option => option.value) : [];
                  setFieldValue('allergens', selectedAllergens);
                }}
                className="basic-multi-select"
                classNamePrefix="select"
                styles={selectStyles}
                placeholder="Select allergens..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" />
                ) : item ? (
                  'Update Item'
                ) : (
                  'Create Item'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirm Image Remove Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Remove Image"
        message="Are you sure you want to remove this image?"
        confirmText="Remove"
        onConfirm={confirmRemoveImage}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}; 