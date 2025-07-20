import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import useForm from '../../hooks/useForm';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export const LoginForm = ({ onSubmit, loading, error }) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    validateForm,
    setFormErrors
  } = useForm({
    initialValues: {
      identifier: '',
      password: ''
    },
    validationRules: {
      identifier: {
        required: true,
        message: 'Email or phone number is required'
      },
      password: {
        required: true,
        minLength: 6,
        message: 'Password is required'
      }
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const result = await onSubmit(values);
    
    if (!result.success) {
      // Handle validation errors from backend
      if (result.validationErrors) {
        const newErrors = {};
        result.validationErrors.forEach(err => {
          newErrors[err.field] = err.message;
        });
        setFormErrors(newErrors);
      } else {
        setFormErrors({ general: result.error });
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* General error display */}
      {(error || errors.general) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || errors.general}
        </div>
      )}

      <Input
        label="Email or Phone Number"
        name="identifier"
        type="text"
        placeholder="Enter your email or phone"
        value={values.identifier}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.identifier}
        touched={touched.identifier}
        required
        autoComplete="username"
      />

      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className="input-field pr-10"
            autoComplete="current-password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
        {touched.password && errors.password && (
          <p className="text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading || isSubmitting}
        disabled={loading || isSubmitting}
        className="w-full"
      >
        {loading || isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
};
