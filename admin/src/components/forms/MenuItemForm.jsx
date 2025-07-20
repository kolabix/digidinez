import { useState, useCallback } from 'react';
import useForm from '../../hooks/useForm';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { toast } from '../common/Toast';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ConfirmDialog } from '../common/ConfirmDialog';
import menuItemService from '../../services/menuItemService';

export const MenuItemForm = ({ item = null, onClose, categories, tags }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(item?.image || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { values, errors, handleChange, handleSubmit, setFieldValue, setFieldError } = useForm({
    initialValues: {
      name: item?.name || '',
      description: item?.description || '',
      price: item?.price || '',
      categoryIds: item?.categoryIds || [],
      tagIds: item?.tagIds || [],
      isVeg: item?.isVeg ?? true,
      isSpicy: item?.isSpicy ?? false,
      spicyLevel: item?.spicyLevel || 0,
      isAvailable: item?.isAvailable ?? true,
      preparationTime: item?.preparationTime || '',
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
          ? await menuItemService.updateItem(item.id, formData)
          : await menuItemService.createItem(formData);

        // Handle image upload if there's a new image
        if (imageFile && response.data.menuItem.id) {
          await menuItemService.uploadImage(response.data.menuItem.id, imageFile);
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
    if (item?.id) {
      try {
        await menuItemService.deleteImage(item.id);
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
    'Milk', 'Eggs', 'Fish', 'Shellfish', 'Tree Nuts',
    'Peanuts', 'Wheat', 'Soybeans', 'Sesame'
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
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                  {categories.map(category => (
                    <label key={category.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={values.categoryIds.includes(category.id)}
                        onChange={() => {
                          const newCategories = values.categoryIds.includes(category.id)
                            ? values.categoryIds.filter(id => id !== category.id)
                            : [...values.categoryIds, category.id];
                          setFieldValue('categoryIds', newCategories);
                        }}
                        className="rounded text-primary-600"
                      />
                      <span>{category.name}</span>
                    </label>
                  ))}
                </div>
                {errors.categoryIds && (
                  <p className="mt-1 text-sm text-red-600">{errors.categoryIds}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                  {tags.map(tag => (
                    <label key={tag.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={values.tagIds.includes(tag.id)}
                        onChange={() => {
                          const newTags = values.tagIds.includes(tag.id)
                            ? values.tagIds.filter(id => id !== tag.id)
                            : [...values.tagIds, tag.id];
                          setFieldValue('tagIds', newTags);
                        }}
                        className="rounded text-primary-600"
                      />
                      <span
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{
                          backgroundColor: tag.color + '33',
                          color: tag.color
                        }}
                      >
                        {tag.name}
                      </span>
                    </label>
                  ))}
                </div>
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
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={values.isVeg}
                      onChange={(e) => setFieldValue('isVeg', e.target.checked)}
                      className="rounded text-green-600"
                    />
                    <span>Vegetarian</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={values.isSpicy}
                      onChange={(e) => {
                        setFieldValue('isSpicy', e.target.checked);
                        if (!e.target.checked) {
                          setFieldValue('spicyLevel', 0);
                        }
                      }}
                      className="rounded text-red-600"
                    />
                    <span>Spicy</span>
                  </label>

                  {values.isSpicy && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Spicy Level
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(level => (
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

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={values.isAvailable}
                      onChange={(e) => setFieldValue('isAvailable', e.target.checked)}
                      className="rounded text-primary-600"
                    />
                    <span>Available</span>
                  </label>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {commonAllergens.map(allergen => (
                  <label key={allergen} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={values.allergens.includes(allergen)}
                      onChange={() => {
                        const newAllergens = values.allergens.includes(allergen)
                          ? values.allergens.filter(a => a !== allergen)
                          : [...values.allergens, allergen];
                        setFieldValue('allergens', newAllergens);
                      }}
                      className="rounded text-primary-600"
                    />
                    <span className="text-sm">{allergen}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
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
      {showConfirm && (
        <ConfirmDialog
          title="Remove Image"
          message="Are you sure you want to remove this image?"
          confirmLabel="Remove"
          onConfirm={confirmRemoveImage}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}; 