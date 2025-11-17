/**
 * Motor Status Service
 * Fetches motor status from the dedicated motor_status table
 */

import { supabase } from '../lib/supabase';
import type { MotorStatus } from '../types/database';

/**
 * Get the latest motor status for a device
 */
export async function getLatestMotorStatus(fridgeId: string): Promise<MotorStatus | null> {
  const { data, error } = await (supabase as any)
    .from('motor_status')
    .select('*')
    .eq('fridge_id', fridgeId)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching motor status:', error);
    return null;
  }

  return data as MotorStatus;
}

/**
 * Get motor status history for a device
 */
export async function getMotorStatusHistory(
  fridgeId: string,
  limit: number = 100
): Promise<MotorStatus[]> {
  const { data, error } = await (supabase as any)
    .from('motor_status')
    .select('*')
    .eq('fridge_id', fridgeId)
    .order('recorded_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching motor status history:', error);
    return [];
  }

  return data as MotorStatus[];
}

/**
 * Get latest motor status for all devices
 */
export async function getAllLatestMotorStatus(): Promise<Map<string, MotorStatus>> {
  const { data, error } = await (supabase as any)
    .from('motor_status')
    .select('*')
    .order('recorded_at', { ascending: false });

  if (error) {
    console.error('Error fetching all motor status:', error);
    return new Map();
  }

  // Group by fridge_id and get the latest for each
  const statusMap = new Map<string, MotorStatus>();
  for (const status of (data as MotorStatus[])) {
    if (!statusMap.has(status.fridge_id)) {
      statusMap.set(status.fridge_id, status);
    }
  }

  return statusMap;
}

/**
 * Calculate motor uptime statistics
 */
export async function getMotorUptimeStats(fridgeId: string, hours: number = 24): Promise<{
  totalOnTime: number;  // in minutes
  totalOffTime: number; // in minutes
  switchCount: number;
  onPercentage: number;
}> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const { data, error } = await (supabase as any)
    .from('motor_status')
    .select('*')
    .eq('fridge_id', fridgeId)
    .gte('recorded_at', since)
    .order('recorded_at', { ascending: true });

  if (error || !data || data.length === 0) {
    return {
      totalOnTime: 0,
      totalOffTime: 0,
      switchCount: 0,
      onPercentage: 0
    };
  }

  const statuses = data as MotorStatus[];
  let totalOnTime = 0;
  let totalOffTime = 0;
  let switchCount = 0;

  for (let i = 0; i < statuses.length - 1; i++) {
    const current = statuses[i];
    const next = statuses[i + 1];
    const duration = new Date(next.recorded_at).getTime() - new Date(current.recorded_at).getTime();
    const durationMinutes = duration / (1000 * 60);

    if (current.ssr_state === 1) {
      totalOnTime += durationMinutes;
    } else {
      totalOffTime += durationMinutes;
    }

    if (current.ssr_state !== next.ssr_state) {
      switchCount++;
    }
  }

  const totalTime = totalOnTime + totalOffTime;
  const onPercentage = totalTime > 0 ? (totalOnTime / totalTime) * 100 : 0;

  return {
    totalOnTime: Math.round(totalOnTime),
    totalOffTime: Math.round(totalOffTime),
    switchCount,
    onPercentage: Math.round(onPercentage * 10) / 10
  };
}
