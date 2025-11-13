// src/components/dashboard/EnergyCard.tsx

import React, { useState, useEffect } from 'react';
import { Power, AlertTriangle, CheckCircle, Wifi, WifiOff, Loader2 } from 'lucide-react';
import Button from '../common/Button';
import { ConfirmModal } from '../common/Modal';
import { DeviceWithStats } from '../../types/database';
import { controlMotor } from '../../services/motorControlService';
import { getLatestSSRState } from '../../services/fridgeService';

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

  // Get initial motor status from database SSR state or localStorage fallback
  const getInitialMotorStatus = (): 'ON' | 'OFF' | 'unknown' => {
    const saved = localStorage.getItem(`motor_status_${device.id}`);
    return (saved as 'ON' | 'OFF') || 'unknown';
  };

  const [motorStatus, setMotorStatus] = useState<'ON' | 'OFF' | 'unknown'>(getInitialMotorStatus);
  const [lastCommand, setLastCommand] = useState<string>('');

  // Fetch latest SSR state from database on mount and periodically
  useEffect(() => {
    const fetchSSRState = async () => {
      try {
        const ssrState = await getLatestSSRState(device.id);
        if (ssrState !== null && ssrState !== undefined) {
          const newStatus = ssrState === 1 ? 'ON' : 'OFF';
          setMotorStatus(newStatus);
          // Update localStorage to keep it in sync
          localStorage.setItem(`motor_status_${device.id}`, newStatus);
        }
      } catch (error) {
        console.error('Failed to fetch SSR state:', error);
      }
    };

    // Fetch immediately on mount
    fetchSSRState();

    // Update every 5 seconds to sync with dashboard refresh
    const interval = setInterval(fetchSSRState, 5000);

    return () => clearInterval(interval);
  }, [device.id]);

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

  // Motor status is now persisted in localStorage
  // No need to poll Node-RED API - status persists across refreshes
  // The status is updated when user clicks ON/OFF buttons

  // Handle device control via Node-RED API
  const handleControlClick = (action: 'disconnect' | 'reconnect') => {
    setPendingAction(action);
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (!pendingAction) return;

    setLoading(true);
    setShowConfirmModal(false);

    try {
      // Map UI action to MQTT command
      const command = pendingAction === 'disconnect' ? 'OFF' : 'ON';

      // Send command via Node-RED API
      const response = await controlMotor(device.id, command);

      // Update local state and save to localStorage
      setMotorStatus(command);
      setLastCommand(command);
      localStorage.setItem(`motor_status_${device.id}`, command);

      // Call parent callback if provided (for UI updates)
      onControlDevice?.(device.id, pendingAction);

      // Success - no popup needed, button state change is visual feedback
      console.log(`✅ Success: ${response.message}`);

    } catch (error) {
      console.error('Failed to control motor:', error);
      // Only show error popup
      alert(`Failed to ${pendingAction} motor. Please try again.`);
    } finally {
      setLoading(false);
      setPendingAction(null);
    }
  };

  const cancelAction = () => {
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  // Determine if motor is currently ON or OFF
  const isMotorOn = motorStatus === 'ON';

  return (
    <div className={`${config.bgColor} border-2 rounded-xl p-6 transition-all hover:shadow-md ${className}`}>
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${isMotorOn ? 'bg-green-100' : 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
            <Power className={`h-6 w-6 ${isMotorOn ? 'text-green-600' : 'text-gray-600'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{device.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              {config.connectionIcon}
              <span className="text-sm text-gray-600">{device.id}</span>
            </div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.statusBadge}`}>
          {config.label}
        </span>
      </div>

      {/* Energy Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white bg-opacity-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Current Power</p>
          <p className="text-lg font-bold text-gray-900">
            {device.current_power?.toFixed(2) || '0.00'} W
          </p>
        </div>
        <div className="bg-white bg-opacity-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Total Energy</p>
          <p className="text-lg font-bold text-gray-900">
            {device.total_energy?.toFixed(3) || '0.000'} kWh
          </p>
        </div>
        <div className="bg-white bg-opacity-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Voltage</p>
          <p className="text-lg font-bold text-gray-900">
            {device.voltage?.toFixed(1) || '0.0'} V
          </p>
        </div>
        <div className="bg-white bg-opacity-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Current</p>
          <p className="text-lg font-bold text-gray-900">
            {device.current?.toFixed(2) || '0.00'} A
          </p>
        </div>
      </div>

      {/* Motor Status */}
      <div className="mb-4 p-3 bg-white bg-opacity-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Motor Status:</span>
          <span className={`font-semibold ${isMotorOn ? 'text-green-600' : 'text-gray-600'}`}>
            {motorStatus === 'unknown' ? 'Unknown' : motorStatus}
          </span>
        </div>
        {lastCommand && (
          <div className="text-xs text-gray-500 mt-1">
            Last command: {lastCommand}
          </div>
        )}
      </div>

      {/* Anomaly Alert */}
      {device.anomaly_count && device.anomaly_count > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
          <span className="text-sm text-yellow-800">
            {device.anomaly_count} anomal{device.anomaly_count === 1 ? 'y' : 'ies'} detected
          </span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2">
        {isMotorOn ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleControlClick('disconnect')}
            disabled={loading}
            className="flex-1"
            icon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
          >
            {loading ? 'Stopping...' : 'Turn OFF'}
          </Button>
        ) : (
          <Button
            variant="success"
            size="sm"
            onClick={() => handleControlClick('reconnect')}
            disabled={loading}
            className="flex-1"
            icon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
          >
            {loading ? 'Starting...' : 'Turn ON'}
          </Button>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={cancelAction}
        onConfirm={confirmAction}
        title={`${pendingAction === 'disconnect' ? 'Turn OFF' : 'Turn ON'} Motor`}
        message={`Are you sure you want to ${pendingAction === 'disconnect' ? 'turn OFF' : 'turn ON'} ${device.name}?`}
        type={pendingAction === 'disconnect' ? 'danger' : 'info'}
        confirmText={pendingAction === 'disconnect' ? 'Turn OFF' : 'Turn ON'}
        loading={loading}
      />
    </div>
  );
};

export default EnergyCard;