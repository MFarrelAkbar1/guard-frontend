import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface AnomalyData {
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface AnomalyCalendarProps {
  className?: string;
  onDateClick?: (date: Date) => void;
}

const AnomalyCalendar: React.FC<AnomalyCalendarProps> = ({ 
  className = '', 
  onDateClick 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Mock anomaly data
  const getAnomalyData = (day: number): AnomalyData | null => {
    const anomalies: Record<number, AnomalyData> = {
      1: { count: 1, severity: 'high' },
      2: { count: 2, severity: 'critical' },
      4: { count: 1, severity: 'critical' },
      9: { count: 1, severity: 'medium' },
      10: { count: 1, severity: 'high' },
      11: { count: 1, severity: 'critical' },
      15: { count: 1, severity: 'low' },
      18: { count: 2, severity: 'medium' },
      22: { count: 1, severity: 'high' }
    };
    return anomalies[day] || null;
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
      const anomaly = getAnomalyData(day as number);
      return total + (anomaly?.count || 0);
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
          
          const anomaly = getAnomalyData(day);
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
              }`}
              onClick={() => handleDateClick(day)}
            >
              <span className="text-sm">{day}</span>
              
              {/* Anomaly Indicator */}
              {anomaly && (
                <div className="absolute top-0 right-0">
                  <div 
                    className={`w-2 h-2 rounded-full ${getSeverityColor(anomaly.severity)}`}
                    title={`${anomaly.count} anomaly (${anomaly.severity})`}
                  />
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