import type { WeeklyReportData } from './reportService';

/**
 * Email Service
 * Handles sending weekly reports via email
 */

export interface EmailConfig {
  to: string;
  subject: string;
  body: string;
  attachmentBlob?: Blob;
  attachmentFilename?: string;
}

/**
 * Send email with weekly report via Supabase Edge Function
 */
export async function sendWeeklyReportEmail(
  email: string,
  reportData: WeeklyReportData,
  pdfBlob?: Blob
): Promise<{ success: boolean; message: string }> {
  try {
    const subject = `GUARD Weekly Report - Week ${reportData.reportPeriod.weekNumber} (${reportData.reportPeriod.startDate} to ${reportData.reportPeriod.endDate})`;
    const body = generateEmailBody(reportData);

    return await sendEmailViaAPI(email, subject, body, pdfBlob);

  } catch (error) {
    console.error('Error sending weekly report email:', error);
    return {
      success: false,
      message: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Generate email body with summary and link
 */
function generateEmailBody(reportData: WeeklyReportData): string {
  return `
Dear GUARD User,

Your weekly energy report is ready!

REPORT SUMMARY
==============
Period: ${reportData.reportPeriod.startDate} to ${reportData.reportPeriod.endDate} (Week ${reportData.reportPeriod.weekNumber})

📊 POWER CONSUMPTION
• Total: ${reportData.powerConsumption.totalKwh} kWh
• Average Daily: ${reportData.powerConsumption.averageDailyKwh} kWh
• Peak Day: ${reportData.powerConsumption.peakUsageDay.date} (${reportData.powerConsumption.peakUsageDay.kwh} kWh)
• vs Last Week: ${reportData.powerConsumption.comparisonToPreviousWeek.changePercent}% ${reportData.powerConsumption.comparisonToPreviousWeek.changeType}

⚠️ ANOMALIES
• Total Detected: ${reportData.anomalies.totalCount}
• Critical: ${reportData.anomalies.severityBreakdown.critical} | High: ${reportData.anomalies.severityBreakdown.high} | Medium: ${reportData.anomalies.severityBreakdown.medium} | Low: ${reportData.anomalies.severityBreakdown.low}
• Active: ${reportData.anomalies.resolutionStatus.active} | Resolved: ${reportData.anomalies.resolutionStatus.resolved}

💚 DEVICE HEALTH
• Online Devices: ${reportData.deviceHealth.onlineDevices}/${reportData.deviceHealth.totalDevices}
• Average Efficiency: ${reportData.deviceHealth.averageEfficiency}%

💰 COST ANALYSIS
• Estimated Cost: Rp ${reportData.costAnalysis.estimatedCostIdr.toLocaleString('id-ID')}
• Savings: Rp ${reportData.costAnalysis.savingsIdr.toLocaleString('id-ID')}
• vs Last Week: ${reportData.costAnalysis.comparisonToPreviousWeek.changePercent}% ${reportData.costAnalysis.comparisonToPreviousWeek.changeType}

Please see the attached PDF for the full detailed report.

Access your dashboard: ${window.location.origin}

Best regards,
GUARD System
Grid Usage Anomaly Recognition and Disconnection

---
This is an automated email. Please do not reply to this message.
Generated: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
`.trim();
}

/**
 * Send email via Supabase Edge Function
 */
async function sendEmailViaAPI(
  to: string,
  subject: string,
  body: string,
  pdfBlob?: Blob
): Promise<{ success: boolean; message: string }> {
  try {
    const formData = new FormData();
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('body', body);

    if (pdfBlob) {
      formData.append('attachment', pdfBlob, 'weekly-report.pdf');
    }

    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('REACT_APP_SUPABASE_URL is not configured');
    }

    const apiEndpoint = `${supabaseUrl}/functions/v1/send-weekly-report`;

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to send email');
    }

    return {
      success: true,
      message: `Email sent successfully to ${to}`
    };

  } catch (error) {
    console.error('Error calling email API:', error);
    throw error;
  }
}

/**
 * Send test email (without report data)
 */
export async function sendTestEmail(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('REACT_APP_SUPABASE_URL is not configured');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/send-test-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to: email })
    });

    if (!response.ok) {
      throw new Error('Failed to send test email');
    }

    return {
      success: true,
      message: `Test email sent successfully to ${email}`
    };

  } catch (error) {
    console.error('Error sending test email:', error);
    return {
      success: false,
      message: `Failed to send test email: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
