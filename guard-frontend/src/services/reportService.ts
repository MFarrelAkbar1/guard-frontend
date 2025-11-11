import { supabase } from '../lib/supabase';
import type { Fridge } from '../types/database';

/**
 * Report Service
 * Handles weekly report data aggregation and generation
 */

export interface WeeklyReportData {
  reportPeriod: {
    startDate: string;
    endDate: string;
    weekNumber: number;
  };
  powerConsumption: {
    totalKwh: number;
    dailyBreakdown: Array<{
      date: string;
      kwh: number;
    }>;
    comparisonToPreviousWeek: {
      previousWeekKwh: number;
      changePercent: number;
      changeType: 'increase' | 'decrease';
    };
    peakUsageDay: {
      date: string;
      kwh: number;
    };
    averageDailyKwh: number;
  };
  anomalies: {
    totalCount: number;
    severityBreakdown: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    resolutionStatus: {
      resolved: number;
      active: number;
    };
    timeline: Array<{
      date: string;
      count: number;
    }>;
    topAnomalies: Array<{
      type: string;
      count: number;
      severity: string;
    }>;
  };
  deviceHealth: {
    totalDevices: number;
    onlineDevices: number;
    averageEfficiency: number;
    deviceDetails: Array<{
      fridgeId: string;
      name: string;
      location: string;
      status: string;
      uptimePercent: number;
      averagePowerWatts: number;
      totalKwh: number;
      anomalyCount: number;
      efficiency: number;
    }>;
  };
  costAnalysis: {
    estimatedCostIdr: number;
    savingsIdr: number;
    comparisonToPreviousWeek: {
      previousWeekCost: number;
      changePercent: number;
      changeType: 'increase' | 'decrease';
    };
    costPerDevice: Array<{
      fridgeId: string;
      name: string;
      costIdr: number;
    }>;
  };
}

/**
 * Get date range for the last week
 */
function getLastWeekDateRange(): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 7);
  startDate.setHours(0, 0, 0, 0);

  return { startDate, endDate };
}

/**
 * Get week number for a date
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Generate weekly report data
 */
export async function generateWeeklyReportData(
  customStartDate?: Date,
  customEndDate?: Date
): Promise<WeeklyReportData> {
  try {
    // Date range
    const { startDate, endDate } = customStartDate && customEndDate
      ? { startDate: customStartDate, endDate: customEndDate }
      : getLastWeekDateRange();

    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();

    // Get all fridges
    const { data: fridges, error: fridgesError } = await supabase
      .from('fridges')
      .select('*');

    if (fridgesError) throw fridgesError;

    // Get power readings for the week
    const { data: powerReadings, error: powerError } = await supabase
      .from('power_readings')
      .select('*')
      .gte('recorded_at', startDateStr)
      .lte('recorded_at', endDateStr)
      .order('recorded_at', { ascending: true });

    if (powerError) throw powerError;

    // Get anomalies for the week
    const { data: anomalies, error: anomaliesError } = await supabase
      .from('anomalies')
      .select('*, fridges(name)')
      .gte('detected_at', startDateStr)
      .lte('detected_at', endDateStr)
      .order('detected_at', { ascending: true });

    if (anomaliesError) console.warn('Anomalies query failed:', anomaliesError);

    // Get previous week data for comparison
    const prevWeekStart = new Date(startDate);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(startDate);
    prevWeekEnd.setMilliseconds(-1);

    const { data: prevWeekReadings, error: prevError } = await supabase
      .from('power_readings')
      .select('power_consumption')
      .gte('recorded_at', prevWeekStart.toISOString())
      .lte('recorded_at', prevWeekEnd.toISOString());

    if (prevError) console.warn('Previous week query failed:', prevError);

    // Calculate power consumption metrics
    const totalKwh = (powerReadings || []).reduce((sum, r) => sum + Number(r.power_consumption), 0) / 1000;
    const previousWeekKwh = (prevWeekReadings || []).reduce((sum, r) => sum + Number(r.power_consumption), 0) / 1000;

    const changePercent = previousWeekKwh > 0
      ? ((totalKwh - previousWeekKwh) / previousWeekKwh) * 100
      : 0;

    // Daily breakdown
    const dailyBreakdown = [];
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(startDate);
      dayStart.setDate(dayStart.getDate() + i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayReadings = (powerReadings || []).filter(r => {
        const recordedAt = new Date(r.recorded_at);
        return recordedAt >= dayStart && recordedAt <= dayEnd;
      });

      const dayKwh = dayReadings.reduce((sum, r) => sum + Number(r.power_consumption), 0) / 1000;

      dailyBreakdown.push({
        date: dayStart.toISOString().split('T')[0],
        kwh: Math.round(dayKwh * 100) / 100
      });
    }

    // Peak usage day
    const peakDay = dailyBreakdown.reduce((max, day) => day.kwh > max.kwh ? day : max, dailyBreakdown[0]);

    // Anomaly metrics
    const anomalyCount = (anomalies || []).length;
    const severityBreakdown = {
      low: (anomalies || []).filter(a => a.severity === 'low').length,
      medium: (anomalies || []).filter(a => a.severity === 'medium').length,
      high: (anomalies || []).filter(a => a.severity === 'high').length,
      critical: (anomalies || []).filter(a => a.severity === 'critical').length,
    };

    const resolutionStatus = {
      resolved: (anomalies || []).filter(a => a.status === 'resolved').length,
      active: (anomalies || []).filter(a => a.status === 'active').length,
    };

    // Anomaly timeline
    const anomalyTimeline = dailyBreakdown.map(day => ({
      date: day.date,
      count: (anomalies || []).filter(a => a.detected_at.startsWith(day.date)).length
    }));

    // Top anomalies by type
    const anomalyTypes = (anomalies || []).reduce((acc, a) => {
      const key = a.type;
      if (!acc[key]) {
        acc[key] = { type: key, count: 0, severity: a.severity };
      }
      acc[key].count++;
      return acc;
    }, {} as Record<string, { type: string; count: number; severity: string }>);

    const topAnomalies = Object.values(anomalyTypes)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Device health metrics
    const deviceDetails = await Promise.all((fridges || []).map(async (fridge) => {
      const fridgeReadings = (powerReadings || []).filter(r => r.fridge_id === fridge.id);
      const fridgeAnomalies = (anomalies || []).filter(a => a.fridge_id === fridge.id);

      const totalKwh = fridgeReadings.reduce((sum, r) => sum + Number(r.power_consumption), 0) / 1000;
      const avgPowerWatts = fridgeReadings.length > 0
        ? fridgeReadings.reduce((sum, r) => sum + Number(r.power_consumption), 0) / fridgeReadings.length
        : 0;

      // Calculate uptime (assume 1 reading per minute = 10080 readings per week)
      const expectedReadings = 7 * 24 * 60; // 1 reading per minute
      const uptimePercent = Math.min((fridgeReadings.length / expectedReadings) * 100, 100);

      // Calculate efficiency (compared to design power)
      const efficiency = fridge.design_power_consumption > 0
        ? (avgPowerWatts / fridge.design_power_consumption) * 100
        : 100;

      return {
        fridgeId: fridge.id,
        name: fridge.name,
        location: fridge.location || 'Unknown',
        status: fridgeReadings.length > 0 ? 'online' : 'offline',
        uptimePercent: Math.round(uptimePercent * 100) / 100,
        averagePowerWatts: Math.round(avgPowerWatts * 100) / 100,
        totalKwh: Math.round(totalKwh * 100) / 100,
        anomalyCount: fridgeAnomalies.length,
        efficiency: Math.round(efficiency * 100) / 100
      };
    }));

    const onlineDevices = deviceDetails.filter(d => d.status === 'online').length;
    const averageEfficiency = deviceDetails.length > 0
      ? deviceDetails.reduce((sum, d) => sum + d.efficiency, 0) / deviceDetails.length
      : 0;

    // Cost analysis (assume Rp 1,500 per kWh - standard Indonesian rate)
    const costPerKwh = 1500;
    const estimatedCostIdr = totalKwh * costPerKwh;
    const previousWeekCost = previousWeekKwh * costPerKwh;
    const costChangePercent = previousWeekCost > 0
      ? ((estimatedCostIdr - previousWeekCost) / previousWeekCost) * 100
      : 0;

    // Get cost savings from database
    const { data: costSettings } = await supabase
      .from('cost_settings')
      .select('*')
      .single();

    const dailySavings = costSettings
      ? (costSettings.short_circuit_repair_cost * costSettings.short_circuit_frequency_per_year) / 365
      : 0;
    const savingsIdr = dailySavings * 7; // Weekly savings

    const costPerDevice = deviceDetails.map(d => ({
      fridgeId: d.fridgeId,
      name: d.name,
      costIdr: Math.round(d.totalKwh * costPerKwh)
    }));

    // Build report data
    const reportData: WeeklyReportData = {
      reportPeriod: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        weekNumber: getWeekNumber(startDate)
      },
      powerConsumption: {
        totalKwh: Math.round(totalKwh * 100) / 100,
        dailyBreakdown,
        comparisonToPreviousWeek: {
          previousWeekKwh: Math.round(previousWeekKwh * 100) / 100,
          changePercent: Math.round(Math.abs(changePercent) * 10) / 10,
          changeType: changePercent >= 0 ? 'increase' : 'decrease'
        },
        peakUsageDay: peakDay,
        averageDailyKwh: Math.round((totalKwh / 7) * 100) / 100
      },
      anomalies: {
        totalCount: anomalyCount,
        severityBreakdown,
        resolutionStatus,
        timeline: anomalyTimeline,
        topAnomalies
      },
      deviceHealth: {
        totalDevices: (fridges || []).length,
        onlineDevices,
        averageEfficiency: Math.round(averageEfficiency * 100) / 100,
        deviceDetails
      },
      costAnalysis: {
        estimatedCostIdr: Math.round(estimatedCostIdr),
        savingsIdr: Math.round(savingsIdr),
        comparisonToPreviousWeek: {
          previousWeekCost: Math.round(previousWeekCost),
          changePercent: Math.round(Math.abs(costChangePercent) * 10) / 10,
          changeType: costChangePercent >= 0 ? 'increase' : 'decrease'
        },
        costPerDevice
      }
    };

    return reportData;

  } catch (error) {
    console.error('Error generating weekly report data:', error);
    throw error;
  }
}

/**
 * Format report data as text (for email body or preview)
 */
export function formatReportAsText(data: WeeklyReportData): string {
  return `
GUARD WEEKLY REPORT
===================
Report Period: ${data.reportPeriod.startDate} to ${data.reportPeriod.endDate} (Week ${data.reportPeriod.weekNumber})

POWER CONSUMPTION SUMMARY
-------------------------
Total Consumption: ${data.powerConsumption.totalKwh} kWh
Average Daily: ${data.powerConsumption.averageDailyKwh} kWh
Peak Usage Day: ${data.powerConsumption.peakUsageDay.date} (${data.powerConsumption.peakUsageDay.kwh} kWh)
Comparison to Previous Week: ${data.powerConsumption.comparisonToPreviousWeek.changePercent}% ${data.powerConsumption.comparisonToPreviousWeek.changeType}

Daily Breakdown:
${data.powerConsumption.dailyBreakdown.map(d => `  ${d.date}: ${d.kwh} kWh`).join('\n')}

ANOMALY REPORT
--------------
Total Anomalies: ${data.anomalies.totalCount}
Severity: Critical (${data.anomalies.severityBreakdown.critical}), High (${data.anomalies.severityBreakdown.high}), Medium (${data.anomalies.severityBreakdown.medium}), Low (${data.anomalies.severityBreakdown.low})
Status: Active (${data.anomalies.resolutionStatus.active}), Resolved (${data.anomalies.resolutionStatus.resolved})

Top Anomaly Types:
${data.anomalies.topAnomalies.map((a, i) => `  ${i + 1}. ${a.type}: ${a.count} occurrences (${a.severity})`).join('\n')}

DEVICE HEALTH
-------------
Total Devices: ${data.deviceHealth.totalDevices}
Online Devices: ${data.deviceHealth.onlineDevices}
Average Efficiency: ${data.deviceHealth.averageEfficiency}%

Device Details:
${data.deviceHealth.deviceDetails.map(d => `
  ${d.name} (${d.location})
  - Status: ${d.status}
  - Uptime: ${d.uptimePercent}%
  - Power: ${d.averagePowerWatts}W avg, ${d.totalKwh} kWh total
  - Efficiency: ${d.efficiency}%
  - Anomalies: ${d.anomalyCount}
`).join('\n')}

COST ANALYSIS
-------------
Estimated Cost: Rp ${data.costAnalysis.estimatedCostIdr.toLocaleString('id-ID')}
Savings from Anomaly Prevention: Rp ${data.costAnalysis.savingsIdr.toLocaleString('id-ID')}
Comparison to Previous Week: ${data.costAnalysis.comparisonToPreviousWeek.changePercent}% ${data.costAnalysis.comparisonToPreviousWeek.changeType}

Cost per Device:
${data.costAnalysis.costPerDevice.map(d => `  ${d.name}: Rp ${d.costIdr.toLocaleString('id-ID')}`).join('\n')}

--
Generated by GUARD System
${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
  `.trim();
}
