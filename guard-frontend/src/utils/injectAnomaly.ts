/**
 * Anomaly Injection Utility
 * Inject anomalous data into the database and instantly trigger notifications
 *
 * Usage from browser console:
 * - window.injectAnomaly('critical')
 * - window.injectAnomaly('warning')
 * - window.injectCustomAnomaly({ power: 250, voltage: 180, current: 0.5, type: 'power_spike' })
 */

import { supabase } from '../lib/supabase';
import type { AnomalyType, AnomalySeverity } from '../types/database';
import {
  requestNotificationPermission,
  showAnomalyNotification
} from '../services/notificationService';

interface AnomalyInjectionParams {
  fridgeId?: string;
  power?: number;
  voltage?: number;
  current?: number;
  type?: AnomalyType;
  severity?: AnomalySeverity;
  description?: string;
}

/**
 * Get the first active fridge ID
 */
async function getDefaultFridgeId(): Promise<string | null> {
  const { data: fridges, error } = await supabase
    .from('fridges')
    .select('id, name')
    .eq('status', 'active')
    .order('name', { ascending: true })
    .limit(1);

  if (error || !fridges || fridges.length === 0) {
    console.error('No active fridges found:', error);
    return null;
  }

  console.log(`🔍 Using fridge: ${fridges[0].name} (${fridges[0].id})`);
  return fridges[0].id;
}

/**
 * Generate anomalous data based on severity
 * Values calibrated based on actual database readings (updated 2025-11-21)
 *
 * Database analysis from MINIATURE TESTING system:
 * - Power range: 0-12.48W (mean: 0.94W, max: 12.48W)
 * - Voltage: 5.82-6.60V (mean: 6.26V)
 * - Current: 0-2.00A (mean: 0.15A)
 *
 * Anomaly thresholds (slightly higher than normal max):
 * - Critical: 30-50% above normal max
 * - Warning: 15-25% above normal max
 * - Normal: At or near normal max
 */
function generateAnomalousData(severity: AnomalySeverity): {
  power: number;
  voltage: number;
  current: number;
  type: AnomalyType;
  description: string;
} {
  switch (severity) {
    case 'critical':
      // 40-50% above normal max values
      return {
        power: 18.0, // 44% above normal max (12.48W)
        voltage: 8.0, // 21% above normal max (6.60V)
        current: 2.8, // 40% above normal max (2.00A)
        type: 'critical_combined',
        description: 'Power at 18W'
      };

    case 'warning':
      // 20-25% above normal max values
      return {
        power: 15.0, // 20% above normal max (12.48W)
        voltage: 7.5, // 14% above normal max (6.60V)
        current: 2.4, // 20% above normal max (2.00A)
        type: 'power_deviation',
        description: 'Power at 15W'
      };

    case 'normal':
    default:
      // At normal operating max (high but acceptable)
      return {
        power: 12.0, // Near normal max (12.48W)
        voltage: 6.5, // Near normal max (6.60V)
        current: 1.8, // Near normal max (2.00A)
        type: 'power_deviation',
        description: 'Power at 12W'
      };
  }
}

/**
 * Calculate expected value and MAE based on phase
 * Based on MINIATURE TESTING system database analysis (updated 2025-11-21)
 */
function calculateExpectedValues(power: number, phase: 'cooling' | 'idle'): {
  expected_value: number;
  mae_value: number;
} {
  if (phase === 'cooling') {
    return {
      expected_value: 10.0, // Normal max power for miniature system (based on DB max: 12.48W)
      mae_value: Math.abs(power - 10.0)
    };
  } else {
    return {
      expected_value: 1.0, // Normal idle power for miniature system (based on DB mean: 0.94W)
      mae_value: Math.abs(power - 1.0)
    };
  }
}

/**
 * Insert anomalous power reading into database
 */
async function insertPowerReading(
  fridgeId: string,
  power: number,
  voltage: number,
  current: number
): Promise<boolean> {
  const timestamp = new Date().toISOString();

  const { error } = await supabase
    .from('power_readings')
    .insert({
      fridge_id: fridgeId,
      power_consumption: power,
      voltage: voltage,
      current: current,
      recorded_at: timestamp,
      created_at: timestamp
    });

  if (error) {
    console.error('❌ Failed to insert power reading:', error);
    return false;
  }

  console.log(`✅ Power reading inserted: ${power}W, ${voltage}V, ${current}A`);
  return true;
}

/**
 * Insert anomaly record into database
 */
async function insertAnomaly(
  fridgeId: string,
  userId: string | null,
  type: AnomalyType,
  severity: AnomalySeverity,
  description: string,
  power: number,
  phase: 'cooling' | 'idle'
): Promise<any> {
  const timestamp = new Date().toISOString();
  const { expected_value, mae_value } = calculateExpectedValues(power, phase);

  const anomalyData: any = {
    fridge_id: fridgeId,
    user_id: userId,
    type: type,
    severity: severity,
    description: description,
    power_value: power,
    expected_value: expected_value,
    mae_value: mae_value,
    phase: phase,
    phase_duration: phase === 'cooling' ? 1800 : 3600, // 30 min cooling, 60 min idle
    detected_at: timestamp,
    status: 'active',
    created_at: timestamp
  };

  const { data, error } = await supabase
    .from('anomalies')
    .insert(anomalyData as any)
    .select(`
      *,
      fridges(name)
    `)
    .single();

  if (error) {
    console.error('❌ Failed to insert anomaly:', error);
    return null;
  }

  console.log(`✅ Anomaly created: ${type} (${severity})`);
  return data;
}

/**
 * Main injection function - Quick presets
 */
export async function injectAnomaly(severity: AnomalySeverity = 'warning'): Promise<void> {
  console.log(`🚀 Injecting ${severity.toUpperCase()} anomaly...`);

  try {
    // Get permission first
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      alert('⚠️ Please enable notifications to see alerts!');
    }

    // Get default fridge
    const fridgeId = await getDefaultFridgeId();
    if (!fridgeId) {
      alert('❌ No active fridges found. Please add a fridge first.');
      return;
    }

    // Generate anomalous data
    const data = generateAnomalousData(severity);

    // Insert power reading
    const readingInserted = await insertPowerReading(
      fridgeId,
      data.power,
      data.voltage,
      data.current
    );

    if (!readingInserted) {
      alert('❌ Failed to insert power reading');
      return;
    }

    // Get current user ID (if any)
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    // Insert anomaly
    const anomaly = await insertAnomaly(
      fridgeId,
      userId,
      data.type,
      severity,
      data.description,
      data.power,
      'cooling' // Assume cooling phase for high power
    );

    if (!anomaly) {
      alert('❌ Failed to create anomaly record');
      return;
    }

    // Trigger instant notification
    if (permission === 'granted') {
      const deviceName = anomaly.fridges?.name || 'Test Device';
      await showAnomalyNotification(anomaly, deviceName);
    }

    // Success message
    const emoji = severity === 'critical' ? '🔴' : severity === 'warning' ? '🟡' : '🟢';
    alert(`${emoji} Anomaly injected successfully!\n\nType: ${data.type}\nSeverity: ${severity}\nPower: ${data.power}W\nVoltage: ${data.voltage}V\nCurrent: ${data.current}A`);

    console.log('✅ Anomaly injection complete!');

  } catch (error) {
    console.error('❌ Error injecting anomaly:', error);
    alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Custom injection function - Full control
 */
export async function injectCustomAnomaly(params: AnomalyInjectionParams = {}): Promise<void> {
  console.log('🚀 Injecting CUSTOM anomaly with params:', params);

  try {
    // Get permission
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      alert('⚠️ Please enable notifications to see alerts!');
    }

    // Get fridge ID
    const fridgeId = params.fridgeId || await getDefaultFridgeId();
    if (!fridgeId) {
      alert('❌ No active fridges found');
      return;
    }

    // Use custom values or defaults
    const power = params.power ?? 200.0;
    const voltage = params.voltage ?? 215.0;
    const current = params.current ?? 0.38;
    const type = params.type ?? 'power_spike';
    const severity = params.severity ?? 'warning';
    const description = params.description ?? `Custom anomaly: Power=${power}W, Voltage=${voltage}V, Current=${current}A`;

    // Insert power reading
    const readingInserted = await insertPowerReading(fridgeId, power, voltage, current);
    if (!readingInserted) {
      alert('❌ Failed to insert power reading');
      return;
    }

    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    // Insert anomaly
    const phase: 'cooling' | 'idle' = power > 50 ? 'cooling' : 'idle';
    const anomaly = await insertAnomaly(fridgeId, userId, type, severity, description, power, phase);

    if (!anomaly) {
      alert('❌ Failed to create anomaly');
      return;
    }

    // Trigger notification
    if (permission === 'granted') {
      const deviceName = anomaly.fridges?.name || 'Test Device';
      await showAnomalyNotification(anomaly, deviceName);
    }

    const emoji = severity === 'critical' ? '🔴' : severity === 'warning' ? '🟡' : '🟢';
    alert(`${emoji} Custom anomaly injected!\n\nType: ${type}\nSeverity: ${severity}\nPower: ${power}W\nVoltage: ${voltage}V\nCurrent: ${current}A`);

    console.log('✅ Custom anomaly injection complete!');

  } catch (error) {
    console.error('❌ Error injecting custom anomaly:', error);
    alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Batch injection - Create multiple anomalies for testing
 */
export async function injectBatchAnomalies(count: number = 3, severity: AnomalySeverity = 'warning'): Promise<void> {
  console.log(`🚀 Injecting ${count} ${severity} anomalies...`);

  for (let i = 0; i < count; i++) {
    await injectAnomaly(severity);
    // Small delay between injections
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`✅ Batch injection complete: ${count} anomalies created`);
}

/**
 * Quick test function - Injects one of each severity
 */
export async function testAllSeverities(): Promise<void> {
  console.log('🧪 Testing all severity levels...');

  await injectAnomaly('normal');
  await new Promise(resolve => setTimeout(resolve, 1000));

  await injectAnomaly('warning');
  await new Promise(resolve => setTimeout(resolve, 1000));

  await injectAnomaly('critical');

  console.log('✅ All severity levels tested!');
}

// Make functions available globally for console use
if (typeof window !== 'undefined') {
  (window as any).injectAnomaly = injectAnomaly;
  (window as any).injectCustomAnomaly = injectCustomAnomaly;
  (window as any).injectBatchAnomalies = injectBatchAnomalies;
  (window as any).testAllSeverities = testAllSeverities;

  console.log(`
🎯 Anomaly Injection Utilities Loaded!

Available console commands:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 Quick Injections:
   injectAnomaly('critical')   // Red alert!
   injectAnomaly('warning')    // Yellow warning
   injectAnomaly('normal')     // Green/minor

📌 Custom Injection:
   injectCustomAnomaly({
     power: 250,
     voltage: 180,
     current: 0.5,
     type: 'power_spike',
     severity: 'critical',
     description: 'Custom test anomaly'
   })

📌 Batch Testing:
   injectBatchAnomalies(5, 'warning')  // 5 warnings
   testAllSeverities()                  // One of each

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}
