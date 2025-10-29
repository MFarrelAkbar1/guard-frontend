import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import type {
  DashboardStats,
  Fridge,
  DailyStats,
  Anomaly,
  PowerReading,
  CostSettings,
  EnergyChartData
} from '../types/database';

// Supabase types
type DbFridge = Database['public']['Tables']['fridges']['Row'];
type DbAnomaly = Database['public']['Tables']['anomalies']['Row'];
type DbCostSettings = Database['public']['Tables']['cost_settings']['Row'];

/**
 * Dashboard Service
 * Handles all data fetching for the dashboard
 */

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get current date
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    // Get all fridges for the user
    const { data: fridges, error: fridgesError } = await supabase
      .from('fridges')
      .select('*')
      .eq('status', 'active');

    if (fridgesError) throw fridgesError;

    const fridgeCount = fridges?.length || 0;

    // Get today's daily stats
    const { data: todayStats, error: todayError } = await supabase
      .from('daily_stats')
      .select('total_power_kwh')
      .eq('date', today);

    if (todayError) throw todayError;

    const totalPowerToday = todayStats?.reduce((sum, stat) => sum + Number(stat.total_power_kwh), 0) || 0;

    // Get yesterday's stats for trend
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const { data: yesterdayStats, error: yesterdayError } = await supabase
      .from('daily_stats')
      .select('total_power_kwh')
      .eq('date', yesterdayStr);

    if (yesterdayError) throw yesterdayError;

    const totalPowerYesterday = yesterdayStats?.reduce((sum, stat) => sum + Number(stat.total_power_kwh), 0) || 0;

    // Calculate trend
    const trendValue = totalPowerYesterday > 0
      ? ((totalPowerToday - totalPowerYesterday) / totalPowerYesterday) * 100
      : 0;

    // Get weekly anomalies count
    const { count: weeklyAnomaliesCount, error: anomaliesError } = await supabase
      .from('anomalies')
      .select('*', { count: 'exact', head: true })
      .gte('detected_at', weekAgoStr);

    if (anomaliesError) throw anomaliesError;

    // Calculate efficiency (current power vs design power)
    let efficiency = 100;
    if (fridges && fridges.length > 0) {
      const totalDesignPower = fridges.reduce((sum, f) => sum + Number(f.design_power_consumption), 0);

      // Get latest power readings for each fridge
      const { data: latestReadings, error: readingsError } = await supabase
        .from('power_readings')
        .select('fridge_id, power_consumption, recorded_at')
        .order('recorded_at', { ascending: false })
        .limit(fridges.length * 10);

      if (!readingsError && latestReadings) {
        // Get the latest reading for each fridge
        const latestByFridge = new Map<string, number>();
        latestReadings.forEach(reading => {
          if (!latestByFridge.has(reading.fridge_id)) {
            latestByFridge.set(reading.fridge_id, Number(reading.power_consumption));
          }
        });

        const totalCurrentPower = Array.from(latestByFridge.values()).reduce((sum, power) => sum + power, 0);
        efficiency = totalDesignPower > 0 ? (totalCurrentPower / totalDesignPower) * 100 : 100;
      }
    }

    // Calculate cost savings
    const costSavings = await calculateCostSavings();

    return {
      total_devices: fridgeCount,
      online_devices: fridgeCount,
      total_power_consumption: totalPowerToday,
      anomalies_today: 0, // Will be calculated separately if needed
      anomalies_this_week: weeklyAnomaliesCount || 0,
      energy_efficiency: Math.round(efficiency),
      total_power_today_kwh: totalPowerToday,
      cost_savings_idr: costSavings,
      total_power_trend: {
        value: Math.abs(Math.round(trendValue * 10) / 10),
        type: trendValue >= 0 ? 'increase' : 'decrease'
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

/**
 * Calculate cost savings based on anomaly prevention
 */
async function calculateCostSavings(): Promise<number> {
  try {
    // Get cost settings
    const { data: costSettings, error: settingsError } = await supabase
      .from('cost_settings')
      .select('*')
      .single();

    if (settingsError || !costSettings) {
      // Default values if no settings
      return 0;
    }

    // Calculate daily cost savings
    // Formula: (repair_cost * frequency_per_year) / 365 * days_active
    const dailySavings = (costSettings.short_circuit_repair_cost * costSettings.short_circuit_frequency_per_year) / 365;

    // Get the installation date of the first fridge to calculate days active
    const { data: firstFridge } = await supabase
      .from('fridges')
      .select('installed_at')
      .order('installed_at', { ascending: true })
      .limit(1)
      .single();

    let daysActive = 0;
    if (firstFridge) {
      const installedDate = new Date(firstFridge.installed_at);
      const today = new Date();
      daysActive = Math.floor((today.getTime() - installedDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    return Math.round(dailySavings * daysActive);
  } catch (error) {
    console.error('Error calculating cost savings:', error);
    return 0;
  }
}

/**
 * Get all fridges
 */
export async function getFridges(): Promise<Fridge[]> {
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
 * Get energy chart data for the past 7 days
 */
export async function getEnergyChartData(): Promise<EnergyChartData> {
  try {
    // Get last 7 days
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    // Get fridges
    const { data: fridges, error: fridgesError } = await supabase
      .from('fridges')
      .select('id, name')
      .eq('status', 'active');

    if (fridgesError) throw fridgesError;

    // Get daily stats for all fridges
    const { data: dailyStats, error: statsError } = await supabase
      .from('daily_stats')
      .select('fridge_id, date, total_power_kwh')
      .in('date', dates)
      .order('date', { ascending: true });

    if (statsError) throw statsError;

    // Organize data by fridge
    const datasets = (fridges || []).map(fridge => {
      const fridgeData = dates.map(date => {
        const stat = dailyStats?.find(s => s.fridge_id === fridge.id && s.date === date);
        return stat ? Number(stat.total_power_kwh) : 0;
      });

      return {
        label: fridge.name,
        data: fridgeData,
        fridge_id: fridge.id
      };
    });

    return {
      labels: dates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets
    };
  } catch (error) {
    console.error('Error fetching energy chart data:', error);
    throw error;
  }
}

/**
 * Get anomalies for calendar
 */
export async function getAnomaliesForCalendar(month: number, year: number): Promise<Map<string, Anomaly[]>> {
  try {
    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    const { data, error } = await supabase
      .from('anomalies')
      .select(`
        *,
        fridges(name)
      `)
      .gte('detected_at', startDate)
      .lte('detected_at', endDate)
      .order('detected_at', { ascending: false });

    if (error) throw error;

    // Group by date
    const anomaliesByDate = new Map<string, Anomaly[]>();
    data?.forEach(anomaly => {
      const date = anomaly.detected_at.split('T')[0];
      if (!anomaliesByDate.has(date)) {
        anomaliesByDate.set(date, []);
      }
      // Cast to Anomaly type (Supabase returns string types, but we need stricter AnomalyType)
      anomaliesByDate.get(date)!.push(anomaly as unknown as Anomaly);
    });

    return anomaliesByDate;
  } catch (error) {
    console.error('Error fetching anomalies for calendar:', error);
    throw error;
  }
}

/**
 * Get recent anomalies
 */
export async function getRecentAnomalies(limit: number = 10): Promise<Anomaly[]> {
  try {
    const { data, error } = await supabase
      .from('anomalies')
      .select(`
        *,
        fridges(name)
      `)
      .order('detected_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as unknown as Anomaly[];
  } catch (error) {
    console.error('Error fetching recent anomalies:', error);
    throw error;
  }
}
