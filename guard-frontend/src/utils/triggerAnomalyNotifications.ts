/**
 * Manual Anomaly Notification Trigger
 * Use this to manually trigger notifications for existing anomalies
 */

import type { Anomaly } from '../types/database';
import {
  requestNotificationPermission,
  showAnomalyNotification
} from '../services/notificationService';
import { supabase } from '../lib/supabase';

/**
 * Trigger notifications for all active anomalies
 */
export async function triggerNotificationsForAllAnomalies(): Promise<void> {
  try {
    // Request permission first
    const permission = await requestNotificationPermission();

    if (permission !== 'granted') {
      console.error('Notification permission denied');
      alert('Please enable notifications in your browser settings to receive alerts.');
      return;
    }

    // Fetch all active anomalies from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: anomalies, error } = await supabase
      .from('anomalies')
      .select(`
        *,
        fridges(name)
      `)
      .eq('status', 'active')
      .gte('detected_at', today.toISOString())
      .order('detected_at', { ascending: false });

    if (error) {
      console.error('Error fetching anomalies:', error);
      alert(`Error fetching anomalies: ${error.message}`);
      return;
    }

    if (!anomalies || anomalies.length === 0) {
      alert('No active anomalies found for today.');
      return;
    }

    // Show notifications for each anomaly
    for (const anomaly of anomalies) {
      const deviceName = (anomaly as any).fridges?.name || 'Unknown Device';
      await showAnomalyNotification(anomaly as unknown as Anomaly, deviceName);

      // Small delay between notifications
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    alert(`✅ Triggered ${anomalies.length} anomaly notifications!`);

  } catch (error) {
    console.error('Error triggering notifications:', error);
    alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Trigger notification for specific anomaly ID
 */
export async function triggerNotificationForAnomaly(anomalyId: string): Promise<void> {
  try {
    const permission = await requestNotificationPermission();

    if (permission !== 'granted') {
      alert('Please enable notifications in your browser settings.');
      return;
    }

    const { data: anomaly, error } = await supabase
      .from('anomalies')
      .select(`
        *,
        fridges(name)
      `)
      .eq('id', anomalyId)
      .single();

    if (error || !anomaly) {
      console.error('Error fetching anomaly:', error);
      return;
    }

    const deviceName = (anomaly as any).fridges?.name || 'Unknown Device';
    await showAnomalyNotification(anomaly as unknown as Anomaly, deviceName);

  } catch (error) {
    console.error('Error triggering notification:', error);
  }
}

/**
 * Test notifications - Triggers notification for the most recent anomaly
 */
export async function testNotificationSystem(): Promise<void> {
  try {
    const permission = await requestNotificationPermission();

    if (permission !== 'granted') {
      alert('Please enable notifications in your browser settings.');
      return;
    }

    // Fetch the most recent anomaly
    const { data: anomaly, error } = await supabase
      .from('anomalies')
      .select(`
        *,
        fridges(name)
      `)
      .order('detected_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !anomaly) {
      alert('No anomalies found. Please create some anomalies first.');
      return;
    }

    const deviceName = (anomaly as any).fridges?.name || 'Test Device';
    await showAnomalyNotification(anomaly as unknown as Anomaly, deviceName);
    alert('✅ Test notification sent!');

  } catch (error) {
    console.error('Error testing notifications:', error);
    alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Make functions available globally for console use
if (typeof window !== 'undefined') {
  (window as any).triggerAnomalyNotifications = triggerNotificationsForAllAnomalies;
  (window as any).testNotificationSystem = testNotificationSystem;
  (window as any).triggerNotificationForAnomaly = triggerNotificationForAnomaly;
}
