import React from 'react';
import { Shield } from 'lucide-react';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'medium', 
  text = 'Loading...', 
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const containerClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${containerClasses[size]} ${className}`}>
      {/* Spinning Icon */}
      <div className={`${sizeClasses[size]} text-blue-600 animate-spin mb-2`}>
        <Shield className="w-full h-full" />
      </div>
      
      {/* Loading Text */}
      {text && (
        <p className="text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );
};

// Full Page Loading
export const FullPageLoading: React.FC<{ text?: string }> = ({ 
  text = 'Loading GUARD System...' 
}) => (
  <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
    <Loading size="large" text={text} />
  </div>
);

// Button Loading (for inline usage)
export const ButtonLoading: React.FC = () => (
  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
);

// Card Loading Skeleton
export const CardLoading: React.FC = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
    <div className="bg-gray-200 h-4 rounded w-1/2 mb-2"></div>
    <div className="bg-gray-200 h-8 rounded w-full"></div>
  </div>
);

export default Loading;