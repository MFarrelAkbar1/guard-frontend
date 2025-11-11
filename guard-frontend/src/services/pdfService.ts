import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { WeeklyReportData } from './reportService';

/**
 * PDF Service
 * Handles PDF generation for weekly reports
 */

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

/**
 * Generate PDF report from weekly report data
 */
export async function generateWeeklyReportPDF(data: WeeklyReportData): Promise<Blob> {
  try {
    const doc = new jsPDF();
    let yPosition = 20;

    // Add logo/header (you can add your logo image here)
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('GUARD', 20, yPosition);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Grid Usage Anomaly Recognition and Disconnection', 20, yPosition + 6);

    // Report title
    yPosition += 15;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Weekly Energy Report', 20, yPosition);

    // Report period
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Period: ${data.reportPeriod.startDate} to ${data.reportPeriod.endDate} (Week ${data.reportPeriod.weekNumber})`, 20, yPosition);
    doc.text(`Generated: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`, 20, yPosition + 5);

    yPosition += 15;

    // POWER CONSUMPTION SUMMARY
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(59, 130, 246); // Blue
    doc.rect(20, yPosition - 5, 170, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Power Consumption Summary', 22, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 10;

    // Key metrics
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const powerMetrics = [
      ['Total Consumption', `${data.powerConsumption.totalKwh} kWh`],
      ['Average Daily', `${data.powerConsumption.averageDailyKwh} kWh`],
      ['Peak Usage Day', `${data.powerConsumption.peakUsageDay.date} (${data.powerConsumption.peakUsageDay.kwh} kWh)`],
      ['vs Previous Week', `${data.powerConsumption.comparisonToPreviousWeek.changePercent}% ${data.powerConsumption.comparisonToPreviousWeek.changeType}`]
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: powerMetrics,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' }
      }
    });

    yPosition = doc.lastAutoTable.finalY + 10;

    // Daily breakdown table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Daily Breakdown', 20, yPosition);
    yPosition += 5;

    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Consumption (kWh)']],
      body: data.powerConsumption.dailyBreakdown.map(d => [d.date, d.kwh.toString()]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 }
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // ANOMALY REPORT
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(249, 115, 22); // Orange
    doc.rect(20, yPosition - 5, 170, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Anomaly Report', 22, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 10;

    const anomalyMetrics = [
      ['Total Anomalies', data.anomalies.totalCount.toString()],
      ['Critical', data.anomalies.severityBreakdown.critical.toString()],
      ['High', data.anomalies.severityBreakdown.high.toString()],
      ['Medium', data.anomalies.severityBreakdown.medium.toString()],
      ['Low', data.anomalies.severityBreakdown.low.toString()],
      ['Active', data.anomalies.resolutionStatus.active.toString()],
      ['Resolved', data.anomalies.resolutionStatus.resolved.toString()]
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: anomalyMetrics,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' }
      }
    });

    yPosition = doc.lastAutoTable.finalY + 10;

    // Top anomalies
    if (data.anomalies.topAnomalies.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Top Anomaly Types', 20, yPosition);
      yPosition += 5;

      autoTable(doc, {
        startY: yPosition,
        head: [['Type', 'Count', 'Severity']],
        body: data.anomalies.topAnomalies.map(a => [a.type, a.count.toString(), a.severity]),
        theme: 'striped',
        headStyles: { fillColor: [249, 115, 22] },
        styles: { fontSize: 9 }
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    }

    // Check if we need a new page
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }

    // DEVICE HEALTH
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(34, 197, 94); // Green
    doc.rect(20, yPosition - 5, 170, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Device Health', 22, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 10;

    const healthMetrics = [
      ['Total Devices', data.deviceHealth.totalDevices.toString()],
      ['Online Devices', data.deviceHealth.onlineDevices.toString()],
      ['Average Efficiency', `${data.deviceHealth.averageEfficiency}%`]
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: healthMetrics,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' }
      }
    });

    yPosition = doc.lastAutoTable.finalY + 10;

    // Device details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Device Details', 20, yPosition);
    yPosition += 5;

    autoTable(doc, {
      startY: yPosition,
      head: [['Device', 'Status', 'Uptime %', 'Avg Power (W)', 'Total (kWh)', 'Efficiency %', 'Anomalies']],
      body: data.deviceHealth.deviceDetails.map(d => [
        d.name,
        d.status,
        d.uptimePercent.toString(),
        d.averagePowerWatts.toString(),
        d.totalKwh.toString(),
        d.efficiency.toString(),
        d.anomalyCount.toString()
      ]),
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94], fontSize: 8 },
      styles: { fontSize: 8 }
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Check if we need a new page
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }

    // COST ANALYSIS
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(168, 85, 247); // Purple
    doc.rect(20, yPosition - 5, 170, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Cost Analysis', 22, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 10;

    const costMetrics = [
      ['Estimated Cost', `Rp ${data.costAnalysis.estimatedCostIdr.toLocaleString('id-ID')}`],
      ['Savings (Anomaly Prevention)', `Rp ${data.costAnalysis.savingsIdr.toLocaleString('id-ID')}`],
      ['vs Previous Week', `${data.costAnalysis.comparisonToPreviousWeek.changePercent}% ${data.costAnalysis.comparisonToPreviousWeek.changeType}`]
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: costMetrics,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 70 },
        1: { cellWidth: 'auto' }
      }
    });

    yPosition = doc.lastAutoTable.finalY + 10;

    // Cost per device
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Cost per Device', 20, yPosition);
    yPosition += 5;

    autoTable(doc, {
      startY: yPosition,
      head: [['Device', 'Cost (IDR)']],
      body: data.costAnalysis.costPerDevice.map(d => [
        d.name,
        `Rp ${d.costIdr.toLocaleString('id-ID')}`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [168, 85, 247] },
      styles: { fontSize: 9 }
    });

    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${pageCount} | Generated by GUARD System`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Convert to Blob
    const pdfBlob = doc.output('blob');
    return pdfBlob;

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * Download PDF report
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate and download weekly report PDF
 */
export async function generateAndDownloadWeeklyReport(data: WeeklyReportData): Promise<void> {
  try {
    const pdfBlob = await generateWeeklyReportPDF(data);
    const filename = `GUARD_Weekly_Report_${data.reportPeriod.startDate}_to_${data.reportPeriod.endDate}.pdf`;
    downloadPDF(pdfBlob, filename);
  } catch (error) {
    console.error('Error generating and downloading PDF:', error);
    throw error;
  }
}
