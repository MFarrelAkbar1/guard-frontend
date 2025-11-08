import { useEffect, useRef } from 'react';
import type { Anomaly } from '../types/database';
import {
  requestNotificationPermission,
  showAnomalyNotification,
  getNotificationSettings
} from '../services/notificationService';

/**
 * Custom hook to monitor anomalies and trigger notifications
 */
export function useAnomalyNotifications(anomalies: Anomaly[]) {
  const previousAnomaliesRef = useRef<Anomaly[]>([]);
  const hasRequestedPermission = useRef(false);

  useEffect(() => {
    // Request notification permission on first load
    if (!hasRequestedPermission.current) {
      requestNotificationPermission().then(() => {
        hasRequestedPermission.current = true;
      });
    }
  }, []);

  useEffect(() => {
    // Skip if no previous anomalies (initial load)
    if (previousAnomaliesRef.current.length === 0 && anomalies.length > 0) {
      previousAnomaliesRef.current = anomalies;
      return;
    }

    // Get notification settings
    const settings = getNotificationSettings();

    if (!settings.enabled) {
      previousAnomaliesRef.current = anomalies;
      return;
    }

    // Detect new anomalies
    const previousIds = new Set(previousAnomaliesRef.current.map(a => a.id));
    const newAnomalies = anomalies.filter(a => !previousIds.has(a.id));

    // Filter by minimum severity
    const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
    const minSeverityValue = severityOrder[settings.minSeverity];

    const filteredAnomalies = newAnomalies.filter(a => {
      const anomalySeverity = severityOrder[a.severity as keyof typeof severityOrder] || 0;
      return anomalySeverity >= minSeverityValue;
    });

    // Show notifications for new anomalies
    filteredAnomalies.forEach(anomaly => {
      showAnomalyNotification(anomaly);
    });

    // Update previous anomalies
    previousAnomaliesRef.current = anomalies;
  }, [anomalies]);
}
