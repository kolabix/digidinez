import clsx from 'clsx';

const Input = ({
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
  ...props
}) => {
  const hasError = touched && error;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
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

export default Input;
