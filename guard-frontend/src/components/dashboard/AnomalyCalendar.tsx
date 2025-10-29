import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, ChevronDown } from 'lucide-react';
import { CalendarDayData, Anomaly } from '../../types/database';
import { getAnomaliesForCalendar } from '../../services/dashboardService';
import AnomalyDetailModal from './AnomalyDetailModal';

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
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [anomaliesMap, setAnomaliesMap] = useState<Map<string, Anomaly[]>>(new Map());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAnomalies, setSelectedAnomalies] = useState<Anomaly[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Fetch anomalies for current month
  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const month = currentMonth.getMonth();
        const year = currentMonth.getFullYear();
        const anomalies = await getAnomaliesForCalendar(month, year);
        setAnomaliesMap(anomalies);
      } catch (error) {
        console.error('Error fetching anomalies:', error);
      }
    };

    fetchAnomalies();
  }, [currentMonth]);

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

    // Check database anomalies for this date
    const dayAnomalies = anomaliesMap.get(dateStr) || [];
    if (dayAnomalies.length > 0) {
      // Calculate max severity from actual anomalies
      const severityOrder: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
      const maxSeverity = dayAnomalies.reduce<'low' | 'medium' | 'high' | 'critical'>((max, anomaly) => {
        const currentLevel = severityOrder[anomaly.severity] || 0;
        const maxLevel = severityOrder[max] || 0;
        return currentLevel > maxLevel ? (anomaly.severity as 'low' | 'medium' | 'high' | 'critical') : max;
      }, 'low');

      return {
        date: dateStr,
        total_data_points: 144, // Default value
        anomaly_count: dayAnomalies.length,
        max_severity: maxSeverity,
        has_data: true
      };
    }

    return null;
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

  // Set specific month
  const setMonth = (monthIndex: number): void => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(monthIndex);
      return newDate;
    });
    setShowMonthPicker(false);
  };

  // Set specific year
  const setYear = (year: number): void => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);
      return newDate;
    });
    setShowYearPicker(false);
  };

  // Generate year options (current year ± 5)
  const getYearOptions = (): number[] => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  };

  // Handle date click
  const handleDateClick = (day: number) => {
    const clickedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    // Get anomalies for this date
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayAnomalies = anomaliesMap.get(dateStr) || [];

    setSelectedDate(clickedDate);
    setSelectedAnomalies(dayAnomalies);
    setShowModal(true);

    // Call parent callback if provided
    if (onDateClick) {
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
    <>
    <div className={`bg-white rounded-lg p-4 shadow-sm border ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Kalender Anomali
        </h2>
      </div>
      
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2">
          {/* Month Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowMonthPicker(!showMonthPicker);
                setShowYearPicker(false);
              }}
              className="flex items-center space-x-1 px-3 py-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="font-medium text-gray-900">
                {monthNames[currentMonth.getMonth()]}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {showMonthPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {monthNames.map((month, index) => (
                  <button
                    key={month}
                    onClick={() => setMonth(index)}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                      index === currentMonth.getMonth() ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Year Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowYearPicker(!showYearPicker);
                setShowMonthPicker(false);
              }}
              className="flex items-center space-x-1 px-3 py-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="font-medium text-gray-900">
                {currentMonth.getFullYear()}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {showYearPicker && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {getYearOptions().map((year) => (
                  <button
                    key={year}
                    onClick={() => setYear(year)}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                      year === currentMonth.getFullYear() ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      
      {/* Month Stats */}
      <div className="text-center text-sm text-gray-500 mb-3">
        <span className="font-medium">{totalAnomalies}</span> Anomali bulan ini
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-600 mb-1">
        {dayHeaders.map((day) => (
          <div key={day} className="p-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {getDaysInMonth().map((day, index) => {
          if (day === null) {
            return <div key={index} className="p-1.5"></div>;
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
              className={`relative p-1.5 hover:bg-gray-50 rounded cursor-pointer transition-colors ${
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
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
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

    {/* Anomaly Detail Modal */}
    <AnomalyDetailModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      date={selectedDate}
      anomalies={selectedAnomalies}
    />
    </>
  );
};

export default AnomalyCalendar;