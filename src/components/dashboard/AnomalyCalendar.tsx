import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { CalendarDayData } from '../../types/database';

interface AnomalyCalendarProps {
  className?: string;
  onDateClick?: (date: Date) => void;
  calendarData?: CalendarDayData[]; // Optional prop for real data
  deviceId?: string; // For filtering data by device
}

const AnomalyCalendar: React.FC<AnomalyCalendarProps> = ({
  className = '',
  onDateClick,
  calendarData = [],
  deviceId
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Get real or mock anomaly data for a specific day
  const getCalendarDayData = (day: number): CalendarDayData | null => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Use real data if available
    const realData = calendarData.find(data => data.date === dateStr);
    if (realData) {
      return realData;
    }

    // Fallback to mock data for demo
    const mockAnomalies: Record<number, Omit<CalendarDayData, 'date'>> = {
      1: { total_data_points: 144, anomaly_count: 1, max_severity: 'high', has_data: true },
      2: { total_data_points: 142, anomaly_count: 2, max_severity: 'critical', has_data: true },
      4: { total_data_points: 140, anomaly_count: 1, max_severity: 'critical', has_data: true },
      9: { total_data_points: 145, anomaly_count: 1, max_severity: 'medium', has_data: true },
      10: { total_data_points: 143, anomaly_count: 1, max_severity: 'high', has_data: true },
      11: { total_data_points: 141, anomaly_count: 1, max_severity: 'critical', has_data: true },
      15: { total_data_points: 144, anomaly_count: 1, max_severity: 'low', has_data: true },
      18: { total_data_points: 142, anomaly_count: 2, max_severity: 'medium', has_data: true },
      22: { total_data_points: 143, anomaly_count: 1, max_severity: 'high', has_data: true }
    };

    const mockData = mockAnomalies[day];
    return mockData ? { date: dateStr, ...mockData } : null;
  };

  // Generate calendar days
  const getDaysInMonth = (): (number | null)[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = firstDay.getDay();

    const days: (number | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDate; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  // Navigate months
  const navigateMonth = (direction: number): void => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // Handle date click
  const handleDateClick = (day: number) => {
    if (onDateClick) {
      const clickedDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      onDateClick(clickedDate);
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const totalAnomalies = getDaysInMonth()
    .filter(day => day !== null)
    .reduce((total: number, day) => {
      const dayData = getCalendarDayData(day as number);
      return total + (dayData?.anomaly_count || 0);
    }, 0);

  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm border ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Kalender Anomali
        </h2>
      </div>
      
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <h3 className="font-medium text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      
      {/* Month Stats */}
      <div className="text-center text-sm text-gray-500 mb-4">
        <span className="font-medium">{totalAnomalies}</span> Anomali bulan ini
      </div>
      
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-600 mb-2">
        {dayHeaders.map((day) => (
          <div key={day} className="p-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {getDaysInMonth().map((day, index) => {
          if (day === null) {
            return <div key={index} className="p-2"></div>;
          }
          
          const dayData = getCalendarDayData(day);
          const today = new Date();
          const isToday =
            today.getDate() === day &&
            today.getMonth() === currentMonth.getMonth() &&
            today.getFullYear() === currentMonth.getFullYear();

          return (
            <div
              key={day}
              className={`relative p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors ${
                isToday ? 'bg-blue-50 text-blue-600 font-medium' : ''
              } ${!dayData?.has_data ? 'opacity-50' : ''}`}
              onClick={() => handleDateClick(day)}
              title={dayData ?
                `${dayData.total_data_points} data points, ${dayData.anomaly_count} anomalies` :
                'No data available'
              }
            >
              <span className="text-sm">{day}</span>

              {/* Data availability indicator */}
              {dayData?.has_data && (
                <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                  <div className="w-1 h-1 bg-blue-400 rounded-full" />
                </div>
              )}

              {/* Anomaly Indicator */}
              {dayData?.anomaly_count && dayData.anomaly_count > 0 && dayData.max_severity && (
                <div className="absolute top-0 right-0 flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full ${getSeverityColor(dayData.max_severity)}`}
                  />
                  {dayData.anomaly_count > 1 && (
                    <span className="text-xs font-bold text-red-600 ml-1">
                      {dayData.anomaly_count}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span className="text-gray-600">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className="text-gray-600">High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-gray-600">Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnomalyCalendar;