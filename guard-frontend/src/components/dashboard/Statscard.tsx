import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  color?: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'gray';
  className?: string;
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  className = '',
  onClick
}) => {
  // Color configurations
  const colorConfig = {
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-green-600'
    },
    red: {
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      textColor: 'text-red-600'
    },
    orange: {
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-600'
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-600'
    },
    gray: {
      bg: 'bg-gray-50',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      textColor: 'text-gray-600'
    }
  };

  const config = colorConfig[color];

  // Trend color configuration
  const getTrendColor = (type: string) => {
    switch (type) {
      case 'increase': return 'text-green-600';
      case 'decrease': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (type: string) => {
    switch (type) {
      case 'increase': return TrendingUp;
      case 'decrease': return TrendingDown;
      default: return null;
    }
  };

  return (
    <div
      className={`bg-white rounded-lg p-6 shadow-sm border transition-all hover:shadow-md ${
        onClick ? 'cursor-pointer hover:border-gray-300' : ''
      } ${className}`}
      onClick={onClick}
    >
      {/* Main Content */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Title */}
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          
          {/* Value */}
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {typeof value === 'number' && value > 999 
              ? value.toLocaleString() 
              : value
            }
          </p>
          
          {/* Subtitle */}
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          
          {/* Trend */}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${getTrendColor(trend.type)}`}>
              {getTrendIcon(trend.type) && (
                React.createElement(getTrendIcon(trend.type)!, { 
                  className: 'h-4 w-4' 
                })
              )}
              <span className="font-medium">
                {trend.type === 'increase' ? '+' : trend.type === 'decrease' ? '-' : ''}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
        
        {/* Icon */}
        <div className={`p-3 rounded-full ${config.iconBg}`}>
          <Icon className={`h-6 w-6 ${config.iconColor}`} />
        </div>
      </div>
    </div>
  );
};

// Preset Stats Cards for common use cases
export const PowerStatsCard: React.FC<Omit<StatsCardProps, 'icon' | 'color'>> = (props) => (
  <StatsCard {...props} icon={require('lucide-react').Power} color="blue" />
);

export const AnomalyStatsCard: React.FC<Omit<StatsCardProps, 'icon' | 'color'>> = (props) => (
  <StatsCard {...props} icon={require('lucide-react').AlertTriangle} color="orange" />
);

export const EfficiencyStatsCard: React.FC<Omit<StatsCardProps, 'icon' | 'color'>> = (props) => (
  <StatsCard {...props} icon={require('lucide-react').TrendingUp} color="green" />
);

export const SavingsStatsCard: React.FC<Omit<StatsCardProps, 'icon' | 'color'>> = (props) => (
  <StatsCard {...props} icon={require('lucide-react').Zap} color="purple" />
);

export default StatsCard;