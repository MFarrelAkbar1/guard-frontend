import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import LoginForm from '../components/forms/LoginForm';
import { FullPageLoading } from '../components/common/Loading';

interface LoginPageProps {
  onLogin: () => void;
}

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleLogin = async (formData: LoginFormData) => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simple validation - in real app, this would be server-side
      if (formData.email === 'admin@guard.com' && formData.password === 'password123') {
        onLogin();
      } else if (formData.email && formData.password) {
        // Allow any email/password for demo
        onLogin();
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
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
            <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
          </div>

          {/* Login Form */}
          <LoginForm
            onSubmit={handleLogin}
            loading={loading}
            error={error}
          />

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

          {/* Demo Credentials */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              <strong>Demo:</strong> Gunakan email dan password sembarang untuk masuk
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default LoginPage;