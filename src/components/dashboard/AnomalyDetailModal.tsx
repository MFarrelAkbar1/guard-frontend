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

      {/* Modal with slide-up animation */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-white rounded-t-2xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5" />
                  <h2 className="text-xl font-bold">{formatDate(date)}</h2>
                </div>
                <p className="text-blue-100 text-sm">
                  {anomalies.length} {anomalies.length === 1 ? 'Anomaly' : 'Anomalies'} Detected
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {anomalies.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No anomalies detected on this date</p>
              </div>
            ) : (
              <div className="space-y-4">
                {anomalies.map((anomaly, index) => (
                  <div
                    key={anomaly.id}
                    className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Anomaly Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getSeverityIcon(anomaly.severity)}
                        <div>
                          <h3 className="font-semibold text-gray-900 capitalize">
                            {anomaly.type.replace(/_/g, ' ')}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {formatTime(anomaly.detected_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                          anomaly.severity
                        )}`}
                      >
                        {anomaly.severity.toUpperCase()}
                      </span>
                    </div>

                    {/* Anomaly Description */}
                    {anomaly.description && (
                      <p className="text-sm text-gray-600 mb-3 pl-8">
                        {anomaly.description}
                      </p>
                    )}

                    {/* Anomaly Footer */}
                    <div className="flex items-center justify-between pl-8 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        {(anomaly as any).fridges?.name || 'Unknown Device'}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
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
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
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
