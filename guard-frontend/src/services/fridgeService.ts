import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import type { Fridge, FridgeFormData, UpdateFridgeInput } from '../types/database';

// Supabase types
type DbFridge = Database['public']['Tables']['fridges']['Row'];

/**
 * Fridge Service
 * Handles CRUD operations for fridges
 */

/**
 * Get all fridges for the current user
 */
export async function getAllFridges(): Promise<Fridge[]> {
  try {
    const { data, error } = await supabase
      .from('fridges')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Fridge[];
  } catch (error) {
    console.error('Error fetching fridges:', error);
    throw error;
  }
}

/**
 * Get a single fridge by ID
 */
export async function getFridgeById(id: string): Promise<Fridge | null> {
  try {
    const { data, error } = await supabase
      .from('fridges')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Fridge;
  } catch (error) {
    console.error('Error fetching fridge:', error);
    throw error;
  }
}

/**
 * Create a new fridge
 */
export async function createFridge(fridgeData: FridgeFormData): Promise<Fridge> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('fridges')
      .insert([{
        user_id: user.id,
        name: fridgeData.name,
        model: fridgeData.model || null,
        location: fridgeData.location || null,
        design_power_consumption: fridgeData.design_power_consumption,
        status: fridgeData.status || 'active'
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Fridge;
  } catch (error) {
    console.error('Error creating fridge:', error);
    throw error;
  }
}

/**
 * Update an existing fridge
 */
export async function updateFridge(id: string, updates: UpdateFridgeInput): Promise<Fridge> {
  try {
    const { data, error } = await supabase
      .from('fridges')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Fridge;
  } catch (error) {
    console.error('Error updating fridge:', error);
    throw error;
  }
}

/**
 * Delete a fridge
 */
export async function deleteFridge(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('fridges')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting fridge:', error);
    throw error;
  }
}

/**
 * Get the latest SSR state (motor ON/OFF status) from power readings
 */
export async function getLatestSSRState(fridgeId: string): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from('power_readings')
      .select('ssr_state')
      .eq('fridge_id', fridgeId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data?.ssr_state ?? null;
  } catch (error) {
    console.error('Error fetching SSR state:', error);
    return null;
  }
}

/**
 * Get fridge statistics
 */
export async function getFridgeStats(fridgeId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get today's stats
    const { data: todayStats, error: statsError } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('fridge_id', fridgeId)
      .eq('date', today)
      .maybeSingle();

    if (statsError && statsError.code !== 'PGRST116') {
      throw statsError;
    }

    // Get latest power reading
    const { data: latestReading, error: readingError } = await supabase
      .from('power_readings')
      .select('*')
      .eq('fridge_id', fridgeId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (readingError && readingError.code !== 'PGRST116') {
      throw readingError;
    }

    // Get anomaly count today
    const { count: anomalyCount, error: anomalyError } = await supabase
      .from('anomalies')
      .select('*', { count: 'exact', head: true })
      .eq('fridge_id', fridgeId)
      .gte('detected_at', today);

    if (anomalyError) throw anomalyError;

    // Get data points count today
    const { count: dataPointsCount, error: dataPointsError } = await supabase
      .from('power_readings')
      .select('*', { count: 'exact', head: true })
      .eq('fridge_id', fridgeId)
      .gte('recorded_at', today);

    if (dataPointsError) throw dataPointsError;

    return {
      todayPowerKwh: todayStats?.total_power_kwh || 0,
      latestPowerWatts: latestReading?.power_consumption || 0,
      latestVoltage: latestReading?.voltage || 0,
      latestCurrent: latestReading?.current || 0,
      latestTemperature: latestReading?.temperature || null,
      latestSSRState: latestReading?.ssr_state ?? null,
      anomalyCount: anomalyCount || 0,
      dataPointsToday: dataPointsCount || 0,
      lastUpdated: latestReading?.recorded_at || null
    };
  } catch (error) {
    console.error('Error fetching fridge stats:', error);
    throw error;
  }
}
