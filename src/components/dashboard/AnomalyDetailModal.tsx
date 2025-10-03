import React from 'react';
import { X, AlertTriangle, Calendar, Clock, Zap, Activity } from 'lucide-react';
import type { Anomaly } from '../../types/database';

interface AnomalyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  anomalies: Anomaly[];
}

const AnomalyDetailModal: React.FC<AnomalyDetailModalProps> = ({
  isOpen,
  onClose,
  date,
  anomalies
}) => {
  if (!isOpen || !date) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <Activity className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <Zap className="h-5 w-5 text-green-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Backdrop with animation */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Modal with fade and scale animation */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col transition-all duration-300 ${
            isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4" />
                  <h2 className="text-lg font-bold">{formatDate(date)}</h2>
                </div>
                <p className="text-blue-100 text-xs">
                  {anomalies.length} {anomalies.length === 1 ? 'Anomaly' : 'Anomalies'} Detected
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {anomalies.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No anomalies detected on this date</p>
              </div>
            ) : (
              <div className="space-y-3">
                {anomalies.map((anomaly, index) => (
                  <div
                    key={anomaly.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-all duration-200"
                  >
                    {/* Anomaly Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(anomaly.severity)}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 capitalize">
                            {anomaly.type.replace(/_/g, ' ')}
                          </h3>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {formatTime(anomaly.detected_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(
                          anomaly.severity
                        )}`}
                      >
                        {anomaly.severity.toUpperCase()}
                      </span>
                    </div>

                    {/* Anomaly Description */}
                    {anomaly.description && (
                      <p className="text-xs text-gray-600 mb-2 pl-7">
                        {anomaly.description}
                      </p>
                    )}

                    {/* Anomaly Footer */}
                    <div className="flex items-center justify-between pl-7 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        {(anomaly as any).fridges?.name || 'Unknown Device'}
                      </div>
                      <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                        anomaly.status === 'resolved'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {anomaly.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnomalyDetailModal;
