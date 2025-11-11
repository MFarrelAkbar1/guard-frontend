import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Calendar, Download } from 'lucide-react';
import Button from '../common/Button';
import { getPowerReadingsForChart } from '../../services/dashboardService';

interface EnergyDataPoint {
  timestamp: string;
  power: number;
  voltage: number;
  current: number;
}

interface EnergyChartProps {
  timeRange?: '1h' | '24h' | '7d' | '30d';
  className?: string;
  showControls?: boolean;
  height?: number;
}

const EnergyChart: React.FC<EnergyChartProps> = ({ 
  timeRange = '24h',
  className = '',
  showControls = true,
  height = 300
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedMetric, setSelectedMetric] = useState<'power' | 'voltage' | 'current'>('power');
  const [data, setData] = useState<EnergyDataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data when time range changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const readings = await getPowerReadingsForChart(selectedTimeRange);

        // Transform power readings to chart data format
        const chartData = readings.map(reading => ({
          timestamp: reading.recorded_at,
          power: Number(reading.power_consumption ?? 0),
          voltage: Number(reading.voltage ?? 0),
          current: Number(reading.current ?? 0)
        })) as EnergyDataPoint[];

        setData(chartData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTimeRange]);

  // Get metric configuration
  const getMetricConfig = (metric: 'power' | 'voltage' | 'current') => {
    const configs = {
      power: {
        label: 'Power (W)',
        color: '#3B82F6',
        unit: 'W',
        format: (value: number) => `${value}W`
      },
      voltage: {
        label: 'Voltage (V)',
        color: '#10B981',
        unit: 'V',
        format: (value: number) => `${value}V`
      },
      current: {
        label: 'Current (A)',
        color: '#F59E0B',
        unit: 'A',
        format: (value: number) => `${value}A`
      }
    };
    return configs[metric];
  };

  // Create SVG path for line chart
  const createPath = (points: number[], width: number, height: number) => {
    if (points.length === 0) return '';
    
    const padding = 40;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    
    const pathData = points.map((value, index) => {
      const x = padding + (index / (points.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - min) / range) * chartHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    
    return pathData;
  };

  // Format time label
  const formatTimeLabel = (timestamp: string, range: string): string => {
    const date = new Date(timestamp);
    switch (range) {
      case '1h':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case '24h':
        return date.toLocaleTimeString('en-US', { hour: '2-digit' });
      case '7d':
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      case '30d':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      default:
        return '';
    }
  };

  // Calculate statistics
  const currentValue = data.length > 0 ? data[data.length - 1][selectedMetric] : 0;
  const previousValue = data.length > 1 ? data[data.length - 2][selectedMetric] : currentValue;
  const change = currentValue - previousValue;
  const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0;

  const metricConfig = getMetricConfig(selectedMetric);

  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm border ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">
          Pengeluaran Energi
        </h2>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Time Range Selector */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(['1h', '24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  selectedTimeRange === range
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Metric Selector */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(['power', 'voltage', 'current'] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-3 py-1 text-sm rounded-md transition-colors capitalize ${
                  selectedMetric === metric
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {metric}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Value & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {metricConfig.format(currentValue)}
          </div>
          <div className="text-sm text-gray-500">Current {metricConfig.label}</div>
        </div>
        
        <div>
          <div className={`text-lg font-semibold ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change >= 0 ? '+' : ''}{metricConfig.format(change)}
          </div>
          <div className="text-sm text-gray-500">Change from previous</div>
        </div>
        
        <div>
          <div className={`text-lg font-semibold ${
            changePercent >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500">Percentage change</div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {loading ? (
          <div 
            className="flex items-center justify-center bg-gray-50 rounded-lg"
            style={{ height: `${height}px` }}
          >
            <div className="text-gray-500">Loading chart...</div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <svg
              width="100%"
              height={height}
              viewBox={`0 0 800 ${height}`}
              className="w-full"
            >
              {/* Grid Lines */}
              {[0, 1, 2, 3, 4].map(i => (
                <line
                  key={i}
                  x1="40"
                  y1={40 + (i * (height - 80) / 4)}
                  x2="760"
                  y2={40 + (i * (height - 80) / 4)}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />
              ))}

              {/* Chart Line */}
              <path
                d={createPath(
                  data.map(d => d[selectedMetric]),
                  800,
                  height
                )}
                fill="none"
                stroke={metricConfig.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {data.map((point, index) => {
                const min = Math.min(...data.map(d => d[selectedMetric]));
                const max = Math.max(...data.map(d => d[selectedMetric]));
                const range = max - min || 1;

                const x = 40 + (index / (data.length - 1)) * 720;
                const y = 40 + (height - 80) - ((point[selectedMetric] - min) / range) * (height - 80);

                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    fill={metricConfig.color}
                    className="hover:r-6 transition-all cursor-pointer"
                  >
                    <title>
                      {formatTimeLabel(point.timestamp, selectedTimeRange)}: {metricConfig.format(point[selectedMetric])}
                    </title>
                  </circle>
                );
              })}
            </svg>
            </div>
        )}
      </div>
    </div>
  );
}

export default EnergyChart;