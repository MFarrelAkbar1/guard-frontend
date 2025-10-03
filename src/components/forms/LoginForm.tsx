import React, { useState } from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import Input, { EmailInput, PasswordInput } from './Input';
import Button from '../common/Button';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  onForgotPassword?: (email: string) => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onForgotPassword,
  loading = false,
  error,
  className = ''
}) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [touched, setTouched] = useState<{
    email?: boolean;
    password?: boolean;
  }>({});

  // Validation rules
  const validateField = (name: keyof LoginFormData, value: string | boolean) => {
    const errors: { [key: string]: string } = {};

    if (name === 'email') {
      const emailValue = value as string;
      if (!emailValue.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(emailValue)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (name === 'password') {
      const passwordValue = value as string;
      if (!passwordValue.trim()) {
        errors.password = 'Password is required';
      } else if (passwordValue.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
      }
    }

    return errors;
  };

  // Handle input changes
  const handleInputChange = (field: keyof LoginFormData) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === 'rememberMe' ? e.target.checked : e.target.value;
      
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));

      // Clear field error when user starts typing
      if (fieldErrors[field as keyof typeof fieldErrors]) {
        setFieldErrors(prev => ({
          ...prev,
          [field]: undefined
        }));
      }

      // Real-time validation for touched fields
      if (touched[field as keyof typeof touched] && field !== 'rememberMe') {
        const errors = validateField(field, value);
        setFieldErrors(prev => ({
          ...prev,
          ...errors
        }));
      }
    };

  // Handle field blur (mark as touched)
  const handleBlur = (field: keyof typeof touched) => () => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    // Validate field when it loses focus
    const errors = validateField(field, formData[field]);
    setFieldErrors(prev => ({
      ...prev,
      ...errors
    }));
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const emailErrors = validateField('email', formData.email);
    const passwordErrors = validateField('password', formData.password);
    
    const allErrors = { ...emailErrors, ...passwordErrors };
    setFieldErrors(allErrors);
    
    // Mark all fields as touched
    setTouched({
      email: true,
      password: true
    });

    return Object.keys(allErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const isFormValid = !fieldErrors.email && !fieldErrors.password && 
                     formData.email.trim() && formData.password.trim();

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`} noValidate>
      {/* Global Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Email Field */}
      <EmailInput
        label="Email Address"
        name="email"
        value={formData.email}
        onChange={handleInputChange('email')}
        onBlur={handleBlur('email')}
        error={touched.email ? fieldErrors.email : undefined}
        placeholder="Enter your email address"
        required
        disabled={loading}
      />

      {/* Password Field */}
      <PasswordInput
        label="Password"
        name="password"
        value={formData.password}
        onChange={handleInputChange('password')}
        onBlur={handleBlur('password')}
        error={touched.password ? fieldErrors.password : undefined}
        placeholder="Enter your password"
        required
        disabled={loading}
      />

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleInputChange('rememberMe')}
            disabled={loading}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span className="ml-2 text-sm text-gray-600">Remember me</span>
        </label>
        
        <button
          type="button"
          className="text-sm text-blue-600 hover:text-blue-500 transition-colors focus:outline-none focus:underline"
          disabled={loading}
          onClick={() => {
            if (onForgotPassword && formData.email) {
              onForgotPassword(formData.email);
            } else if (onForgotPassword) {
              const email = window.prompt('Please enter your email address:');
              if (email) {
                onForgotPassword(email);
              }
            }
          }}
        >
          Forgot password?
        </button>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        disabled={!isFormValid || loading}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>

      {/* Sign Up Link */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <a
            href="/sign-up"
            className="text-blue-600 hover:text-blue-500 font-medium transition-colors focus:outline-none focus:underline"
          >
            Sign up here
          </a>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;