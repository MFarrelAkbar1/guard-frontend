import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, AlertCircle, Check, Mail, Search } from 'lucide-react';

interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  success?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
  helperText?: string;
  autoComplete?: string;
  name?: string;
  id?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  success = false,
  disabled = false,
  required = false,
  className = '',
  icon,
  showPasswordToggle = false,
  helperText,
  autoComplete,
  name,
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;
  const hasError = Boolean(error);
  const hasIcon = Boolean(icon);
  const hasPasswordToggle = type === 'password' && showPasswordToggle;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Generate unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Input styling classes
  const inputClasses = `
    w-full px-3 py-2 border rounded-lg transition-all duration-200 outline-none
    ${hasIcon ? 'pl-10' : ''}
    ${hasPasswordToggle ? 'pr-10' : ''}
    ${hasError 
      ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
      : success
        ? 'border-green-300 bg-green-50 focus:ring-2 focus:ring-green-500 focus:border-green-500'
        : 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400'
    }
    ${disabled 
      ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
      : 'text-gray-900'
    }
    ${isFocused && !hasError && !success ? 'border-blue-500 ring-2 ring-blue-500' : ''}
    ${className}
  `.trim();

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className={`block text-sm font-medium mb-2 ${
            hasError 
              ? 'text-red-700' 
              : success 
                ? 'text-green-700' 
                : 'text-gray-700'
          } ${required ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''}`}
        >
          {label}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {hasIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className={`h-5 w-5 ${
              hasError 
                ? 'text-red-400' 
                : success 
                  ? 'text-green-400' 
                  : 'text-gray-400'
            }`}>
              {icon}
            </div>
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className={inputClasses}
          {...props}
        />

        {/* Right Icons */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {/* Success Icon */}
          {success && !hasError && (
            <Check className="h-5 w-5 text-green-500" />
          )}

          {/* Error Icon */}
          {hasError && (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}

          {/* Password Toggle */}
          {hasPasswordToggle && !hasError && !success && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Helper Text / Error Message */}
      {(error || helperText) && (
        <div className="mt-2">
          {error ? (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </p>
          ) : helperText ? (
            <p className="text-sm text-gray-500">{helperText}</p>
          ) : null}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Preset Input Components
export const EmailInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'icon'>>(
  (props, ref) => (
    <Input
      {...props}
      ref={ref}
      type="email"
      icon={<Mail className="h-5 w-5" />}
      autoComplete="email"
    />
  )
);

export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'showPasswordToggle'>>(
  (props, ref) => (
    <Input
      {...props}
      ref={ref}
      type="password"
      showPasswordToggle={true}
      autoComplete="current-password"
    />
  )
);

export const SearchInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'icon'>>(
  (props, ref) => (
    <Input
      {...props}
      ref={ref}
      type="text"
      icon={<Search className="h-5 w-5" />}
    />
  )
);

export default Input;