import clsx from 'clsx';

export const Input = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  className = '',
  checked,
  multiline = false,
  rows = 3,
  ...props
}) => {
  const hasError = touched && error;

  const handleChange = (e) => {
    if (type === 'checkbox') {
      // Create a custom event object for checkbox changes
      const customEvent = {
        target: {
          name,
          value: e.target.checked,
          type: 'checkbox'
        }
      };
      onChange(customEvent);
    } else {
      onChange(e);
    }
  };

  if (type === 'checkbox') {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          onBlur={onBlur}
          className={clsx(
            'rounded transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-200',
            hasError ? 'text-red-600' : 'text-primary-600',
            className
          )}
          {...props}
        />
        {label && (
          <span className="text-sm text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </span>
        )}
        {hasError && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </label>
    );
  }

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <InputComponent
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        rows={multiline ? rows : undefined}
        className={clsx(
          'w-full px-3 py-2 border border-gray-300 rounded-lg transition-colors duration-200',
          'focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-200',
          hasError && 'border-red-300 focus:border-red-500 focus:ring-red-200',
          className
        )}
        {...props}
      />
      {hasError && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
