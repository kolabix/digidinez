import { useEffect } from 'react';
import useForm from '../../hooks/useForm';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export const CategoryForm = ({ 
  category = null, 
  isOpen, 
  onClose, 
  onSubmit,
  loading = false 
}) => {
  const { 
    values, 
    errors, 
    handleChange, 
    setFormValues, 
    setFormErrors,
    validateForm,
    resetForm 
  } = useForm({
    name: '',
    isActive: true
  }, {
    name: {
      required: true,
      message: 'Category name is required'
    }
  });

  // Update form when category changes (for edit mode)
  useEffect(() => {
    if (category) {
      setFormValues({
        name: category.name,
        isActive: category.isActive
      });
    } else {
      setFormValues({
        name: '',
        isActive: true
      });
    }
  }, [category, setFormValues]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(values);
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save category';
      setFormErrors({ name: message });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {category ? 'Edit Category' : 'Add Category'}
          </h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category Name"
            name="name"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="e.g., Appetizers, Main Course, Desserts"
            required
            autoFocus
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={values.isActive}
              onChange={(e) => {
                const event = {
                  target: {
                    name: 'isActive',
                    value: e.target.checked
                  }
                };
                handleChange(event);
              }}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active category
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="flex-1"
            >
              {category ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
