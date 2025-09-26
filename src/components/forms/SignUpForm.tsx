import React, { useState } from 'react';
import { User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { EmailInput, PasswordInput } from './Input';
import Button from '../common/Button';

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface SignUpFormProps {
  onSubmit: (data: SignUpFormData) => void;
  loading?: boolean;
  error?: string;
  success?: string;
  className?: string;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  onSubmit,
  loading = false,
  error,
  success,
  className = ''
}) => {
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const [touched, setTouched] = useState<{
    name?: boolean;
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});

  // Validation rules
  const validateField = (name: keyof SignUpFormData, value: string) => {
    const errors: { [key: string]: string } = {};

    if (name === 'name') {
      if (!value.trim()) {
        errors.name = 'Name is required';
      } else if (value.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
      }
    }

    if (name === 'email') {
      if (!value.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (name === 'password') {
      if (!value) {
        errors.password = 'Password is required';
      } else if (value.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }

    if (name === 'confirmPassword') {
      if (!value) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (value !== formData.password) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    return errors;
  };

  const handleInputChange = (name: keyof SignUpFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (name: keyof SignUpFormData) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const errors = validateField(name, formData[name]);
    setFieldErrors(prev => ({ ...prev, ...errors }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const allErrors: { [key: string]: string } = {};
    (Object.keys(formData) as Array<keyof SignUpFormData>).forEach(field => {
      const errors = validateField(field, formData[field]);
      Object.assign(allErrors, errors);
    });

    setFieldErrors(allErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    // If no errors, submit form
    if (Object.keys(allErrors).length === 0) {
      onSubmit(formData);
    }
  };

  const isFormValid = formData.name.trim() &&
    formData.email.trim() &&
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            className={`
              block w-full pl-10 pr-3 py-2 border rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${fieldErrors.name && touched.name
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300'
              }
            `}
            placeholder="Enter your full name"
            disabled={loading}
          />
        </div>
        {fieldErrors.name && touched.name && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {fieldErrors.name}
          </p>
        )}
      </div>

      {/* Email Field */}
      <EmailInput
        label="Email Address"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        onBlur={() => handleBlur('email')}
        error={touched.email ? fieldErrors.email : undefined}
        disabled={loading}
        placeholder="Enter your email address"
      />

      {/* Password Field */}
      <PasswordInput
        label="Password"
        value={formData.password}
        onChange={(e) => handleInputChange('password', e.target.value)}
        onBlur={() => handleBlur('password')}
        error={touched.password ? fieldErrors.password : undefined}
        disabled={loading}
        placeholder="Create a password"
      />

      {/* Confirm Password Field */}
      <PasswordInput
        label="Confirm Password"
        value={formData.confirmPassword}
        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
        onBlur={() => handleBlur('confirmPassword')}
        error={touched.confirmPassword ? fieldErrors.confirmPassword : undefined}
        disabled={loading}
        placeholder="Confirm your password"
      />

      {/* Success Message */}
      {success && (
        <div className="flex items-center p-3 text-sm text-green-800 bg-green-50 rounded-lg">
          <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center p-3 text-sm text-red-800 bg-red-50 rounded-lg">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        disabled={!isFormValid || loading}
        className="mt-6"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
};

export default SignUpForm;