import type { Anomaly } from '../types/database';

/**
 * Notification Service
 * Handles browser notifications and sound alerts for anomalies
 */

// Notification sound using Web Audio API
let audioContext: AudioContext | null = null;

/**
 * Initialize audio context
 */
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Play notification sound based on severity
 */
export async function playNotificationSound(severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): Promise<void> {
  try {
    // Check if sound is enabled in settings
    const settings = getNotificationSettings();
    if (!settings.sound) {
      return;
    }

    const context = getAudioContext();

    // Create oscillator for beep sound
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    // Set frequency based on severity
    const frequencies = {
      low: 400,
      medium: 600,
      high: 800,
      critical: 1000
    };

    oscillator.frequency.value = frequencies[severity];
    oscillator.type = 'sine';

    // Set volume
    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

    // Play sound
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.5);

    // For critical, play multiple beeps
    if (severity === 'critical') {
      setTimeout(() => playNotificationSound('critical'), 600);
    }
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

/**
 * Check if notifications are supported and permitted
 */
export function canShowNotifications(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

/**
 * Get severity emoji and color
 */
function getSeverityInfo(severity: string): { emoji: string; urgency: NotificationOptions['tag'] } {
  switch (severity) {
    case 'low':
      return { emoji: '🟢', urgency: 'low' };
    case 'medium':
      return { emoji: '🟡', urgency: 'medium' };
    case 'high':
      return { emoji: '🟠', urgency: 'high' };
    case 'critical':
      return { emoji: '🔴', urgency: 'critical' };
    default:
      return { emoji: '⚠️', urgency: 'medium' };
  }
}

/**
 * Show browser notification for anomaly
 */
export async function showAnomalyNotification(anomaly: Anomaly, deviceName?: string): Promise<void> {
  if (!canShowNotifications()) {
    console.log('Notifications not permitted');
    return;
  }

  try {
    const { emoji, urgency } = getSeverityInfo(anomaly.severity);
    const device = deviceName || (anomaly as any).fridges?.name || 'Unknown Device';

    const title = `${emoji} Anomaly Detected - ${anomaly.severity.toUpperCase()}`;
    const options: NotificationOptions = {
      body: `${device}\n${anomaly.type.replace(/_/g, ' ')}\n${anomaly.description || 'Anomaly detected on your device'}`,
      icon: '/logo192.png', // Make sure you have this icon in your public folder
      badge: '/logo192.png',
      tag: `anomaly-${anomaly.id}`,
      requireInteraction: anomaly.severity === 'critical', // Keep critical notifications until user interacts
      timestamp: new Date(anomaly.detected_at).getTime(),
      data: {
        anomalyId: anomaly.id,
        severity: anomaly.severity,
        url: '/dashboard?view=anomaly'
      }
    };

    const notification = new Notification(title, options);

    // Handle notification click
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      // Navigate to anomaly view
      window.location.hash = '#anomaly';
      notification.close();
    };

    // Play sound based on severity
    await playNotificationSound(anomaly.severity as 'low' | 'medium' | 'high' | 'critical');

  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

/**
 * Show multiple anomaly notifications
 */
export async function showMultipleAnomalyNotifications(anomalies: Anomaly[]): Promise<void> {
  if (anomalies.length === 0) return;

  // If multiple anomalies, show summary notification
  if (anomalies.length > 1) {
    const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
    const highCount = anomalies.filter(a => a.severity === 'high').length;

    const title = `⚠️ ${anomalies.length} New Anomalies Detected`;
    const severitySummary = [];
    if (criticalCount > 0) severitySummary.push(`${criticalCount} Critical`);
    if (highCount > 0) severitySummary.push(`${highCount} High`);

    const options: NotificationOptions = {
      body: severitySummary.length > 0
        ? `Including: ${severitySummary.join(', ')}\nClick to view details`
        : 'Click to view all anomaly details',
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'multiple-anomalies',
      requireInteraction: criticalCount > 0,
      data: {
        count: anomalies.length,
        url: '/dashboard?view=anomaly'
      }
    };

    if (canShowNotifications()) {
      const notification = new Notification(title, options);
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        window.location.hash = '#anomaly';
        notification.close();
      };
    }

    // Play sound for highest severity
    const maxSeverity = anomalies.reduce((max, a) => {
      const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
      return (severityOrder[a.severity as keyof typeof severityOrder] || 0) >
             (severityOrder[max as keyof typeof severityOrder] || 0) ? a.severity : max;
    }, 'low');

    await playNotificationSound(maxSeverity as 'low' | 'medium' | 'high' | 'critical');
  } else {
    // Single anomaly
    await showAnomalyNotification(anomalies[0]);
  }
}

/**
 * Test notification (for settings page)
 */
export async function showTestNotification(): Promise<void> {
  const permission = await requestNotificationPermission();

  if (permission === 'granted') {
    const notification = new Notification('🔔 Test Notification', {
      body: 'Notifications are working correctly!\nYou will receive alerts when anomalies are detected.',
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'test-notification'
    });

    await playNotificationSound('medium');

    notification.onclick = () => {
      notification.close();
    };
  } else {
    alert('Please enable notifications in your browser settings to receive alerts.');
  }
}

/**
 * Get notification settings from localStorage
 */
export function getNotificationSettings(): {
  enabled: boolean;
  sound: boolean;
  minSeverity: 'low' | 'medium' | 'high' | 'critical';
} {
  const settings = localStorage.getItem('notification_settings');
  if (settings) {
    return JSON.parse(settings);
  }

  // Default settings
  return {
    enabled: true,
    sound: true,
    minSeverity: 'medium'
  };
}

/**
 * Save notification settings to localStorage
 */
export function saveNotificationSettings(settings: {
  enabled: boolean;
  sound: boolean;
  minSeverity: 'low' | 'medium' | 'high' | 'critical';
}): void {
  localStorage.setItem('notification_settings', JSON.stringify(settings));
}
