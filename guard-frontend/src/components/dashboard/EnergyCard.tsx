import React, { useState } from 'react';
import { Power, AlertTriangle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import Button from '../common/Button';
import { ConfirmModal } from '../common/Modal';
import { DeviceWithStats } from '../../types/database';

interface EnergyCardProps {
  device: DeviceWithStats;
  onControlDevice?: (deviceId: string, action: 'disconnect' | 'reconnect') => void;
  className?: string;
}

const EnergyCard: React.FC<EnergyCardProps> = ({ 
  device, 
  onControlDevice, 
  className = '' 
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'disconnect' | 'reconnect' | null>(null);
  const [loading, setLoading] = useState(false);

  // Status configurations
  const statusConfig = {
    online: {
      bgColor: 'bg-green-50 border-green-200',
      statusBadge: 'bg-green-100 text-green-800',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      connectionIcon: <Wifi className="h-4 w-4 text-green-600" />,
      label: 'Online'
    },
    offline: {
      bgColor: 'bg-gray-50 border-gray-200',
      statusBadge: 'bg-gray-100 text-gray-800',
      icon: <WifiOff className="h-5 w-5 text-gray-600" />,
      connectionIcon: <WifiOff className="h-4 w-4 text-gray-600" />,
      label: 'Offline'
    },
    warning: {
      bgColor: 'bg-yellow-50 border-yellow-200',
      statusBadge: 'bg-yellow-100 text-yellow-800',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
      connectionIcon: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
      label: 'Warning'
    },
    error: {
      bgColor: 'bg-red-50 border-red-200',
      statusBadge: 'bg-red-100 text-red-800',
      icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
      connectionIcon: <AlertTriangle className="h-4 w-4 text-red-600" />,
      label: 'Error'
    }
  };

  const config = statusConfig[device.status];

  // Handle device control
  const handleControlClick = (action: 'disconnect' | 'reconnect') => {
    setPendingAction(action);
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (!pendingAction) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      onControlDevice?.(device.id, pendingAction);
    } catch (error) {
      console.error('Control action failed:', error);
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
      setPendingAction(null);
    }
  };

  // Format last update time
  const formatLastUpdate = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`${config.bgColor} border rounded-lg p-4 transition-all hover:shadow-md ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900 truncate">{device.name}</h3>
            {config.connectionIcon}
          </div>
          {device.location && (
            <p className="text-xs text-gray-500">{device.location}</p>
          )}
        </div>
        
        {/* Status Badge */}
        <span className={`px-2 py-1 text-xs rounded-full ${config.statusBadge}`}>
          {config.label}
        </span>
      </div>

      {/* Main Metrics */}
      <div className="mb-4">
        {/* Latest Power Reading */}
        <div className="flex items-end gap-2 mb-2">
          <span className="text-3xl font-bold text-gray-900">
            {device.latest_power?.toFixed(1) || '--'}W
          </span>
          <span className="text-sm text-gray-500 mb-1">current consumption</span>
        </div>

        {/* Data Points Today */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
          <div className="text-center bg-white/50 rounded p-2">
            <div className="text-gray-500">Data Points Today</div>
            <div className="font-medium text-gray-900">{device.total_data_points_today || 0}</div>
          </div>
          <div className="text-center bg-white/50 rounded p-2">
            <div className="text-gray-500">Anomalies Today</div>
            <div className={`font-medium ${
              (device.anomaly_count_today || 0) > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {device.anomaly_count_today || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Status Description */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {device.status === 'online' && 'Device operating normally'}
          {device.status === 'offline' && 'Device disconnected from network'}
          {device.status === 'warning' && 'Anomaly detected - monitoring required'}
          {device.status === 'error' && 'Critical error - immediate attention required'}
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2 mb-3">
        {device.status === 'online' || device.status === 'warning' ? (
          <Button
            variant={device.status === 'warning' ? 'danger' : 'outline'}
            size="sm"
            fullWidth
            onClick={() => handleControlClick('disconnect')}
            icon={<Power className="h-4 w-4" />}
          >
            Disconnect
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => handleControlClick('reconnect')}
            icon={<Power className="h-4 w-4" />}
          >
            Reconnect
          </Button>
        )}
      </div>

      {/* Last Update */}
      <div className="text-xs text-gray-500 text-center">
        Last update: {device.latest_timestamp ? formatLastUpdate(device.latest_timestamp) : 'No data'}
      </div>

      {/* Device Image/Icon */}
      <div className="flex justify-center mt-3">
        <div className="w-16 h-12 bg-amber-200 rounded flex items-center justify-center">
          <div className="w-10 h-8 bg-gray-800 rounded"></div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmAction}
        title={`${pendingAction === 'disconnect' ? 'Disconnect' : 'Reconnect'} Device`}
        message={`Are you sure you want to ${pendingAction} ${device.name}?`}
        type={pendingAction === 'disconnect' ? 'danger' : 'info'}
        confirmText={pendingAction === 'disconnect' ? 'Disconnect' : 'Reconnect'}
        loading={loading}
      />
    </div>
  );
};

export default EnergyCard;