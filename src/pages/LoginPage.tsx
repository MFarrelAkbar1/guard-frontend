import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import LoginForm from '../components/forms/LoginForm';
import SignUpForm from '../components/forms/SignUpForm';
import { useAuth } from '../contexts/AuthContext';
import { FullPageLoading } from '../components/common/Loading';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const LoginPage: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [showSignUp, setShowSignUp] = useState(false);
  const { signIn, signUp, loading } = useAuth();

  const handleLogin = async (formData: LoginFormData) => {
    setError('');

    try {
      await signIn(formData.email, formData.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    }
  };

  const handleSignUp = async (formData: SignUpFormData) => {
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await signUp(formData.email, formData.password, formData.name);
      setError('Account created successfully! You can now sign in.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed. Please try again.';
      if (errorMessage.includes('User already registered')) {
        setError('This email is already registered. Please try signing in instead.');
      } else {
        setError(errorMessage);
      }
    }
  };

  if (loading) {
    return <FullPageLoading text="Signing you in..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">GUARD</h1>
            <p className="text-gray-600 mt-2">Grid Usage Anomaly Recognition</p>
            <p className="text-sm text-gray-500 mt-1">
              {showSignUp ? 'Create your account' : 'Sign in to your account'}
            </p>
          </div>

          {/* Form */}
          {showSignUp ? (
            <SignUpForm
              onSubmit={handleSignUp}
              loading={loading}
              error={error}
            />
          ) : (
            <LoginForm
              onSubmit={handleLogin}
              loading={loading}
              error={error}
            />
          )}

          {/* Toggle Form */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setShowSignUp(!showSignUp);
                setError('');
              }}
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              {showSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Features Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔍</span>
                <div>
                  <h3 className="font-medium text-gray-900">Real-time Monitoring</h3>
                  <p className="text-sm text-gray-600">24/7 anomaly detection system</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="font-medium text-gray-900">Smart Protection</h3>
                  <p className="text-sm text-gray-600">Automatic power disconnection</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="font-medium text-gray-900">Energy Analytics</h3>
                  <p className="text-sm text-gray-600">Advanced usage optimization</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;