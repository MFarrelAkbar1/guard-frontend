// Database types matching PostgreSQL schema

export type FridgeStatus = 'active' | 'inactive' | 'maintenance';
export type AnomalyType = 'power_spike' | 'phase_too_short' | 'phase_too_long' | 'power_deviation' | 'duration_exceeded' | 'critical_combined';
export type AnomalySeverity = 'normal' | 'warning' | 'critical';
export type AnomalyStatus = 'active' | 'resolved' | 'ignored';

// Legacy types for backward compatibility
export type DeviceStatus = 'online' | 'offline' | 'warning' | 'error';

// Database entities
export interface User {
  id: string; // UUID
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string; // Device identifier (e.g., 'NR-BB332Q-PK-1')
  user_id: string; // UUID foreign key
  name: string;
  location?: string;
  status: DeviceStatus;
  created_at: string;
  updated_at: string;
}

export interface IoTRawData {
  id: number; // BIGSERIAL
  device_id: string;
  timestamp: string; // ISO timestamp
  power: number; // Decimal, power in watts
  is_anomaly: boolean;
  received_at: string; // ISO timestamp
}

export interface Fridge {
  id: string;
  user_id: string;
  name: string;
  model: string | null;
  location: string | null;
  design_power_consumption: number;
  status: FridgeStatus;
  installed_at: string;
  created_at: string;
  updated_at: string;
}

export interface PowerReading {
  id: string;
  fridge_id: string;
  power_consumption: number;
  voltage: number | null;
  current: number | null;
  temperature: number | null;
  recorded_at: string;
  created_at: string;
}

export interface MotorStatus {
  id: number;
  fridge_id: string;
  ssr_state: number;  // 0 = OFF, 1 = ON
  recorded_at: string;
  created_at: string;
}

export interface Anomaly {
  id: string;
  fridge_id: string;
  user_id: string | null;
  type: AnomalyType;
  severity: AnomalySeverity;
  description: string | null;
  power_value: number | null;
  expected_value: number | null;
  mae_value: number | null;
  phase: string | null;
  phase_duration: number | null;
  detected_at: string;
  resolved_at: string | null;
  status: AnomalyStatus;
  created_at: string;
}

export interface CostSettings {
  id: string;
  user_id: string;
  short_circuit_repair_cost: number;
  short_circuit_frequency_per_year: number;
  electricity_rate_per_kwh: number;
  created_at: string;
  updated_at: string;
}

export interface DailyStats {
  id: string;
  user_id: string;
  fridge_id: string;
  date: string;
  total_power_kwh: number;
  avg_power_watts: number | null;
  max_power_watts: number | null;
  min_power_watts: number | null;
  anomaly_count: number;
  uptime_minutes: number;
  created_at: string;
}

// Joined/Extended interfaces for frontend use
export interface FridgeWithStats extends Fridge {
  latest_power?: number;
  latest_timestamp?: string;
  anomaly_count_today?: number;
  total_power_today?: number;
}

export interface AnomalyWithFridge extends Anomaly {
  fridge_name?: string;
}

export interface PowerReadingWithFridge extends PowerReading {
  fridge_name?: string;
}

export interface DeviceWithStats extends Device {
  latest_power?: number;
  latest_timestamp?: string;
  anomaly_count?: number;
  anomaly_count_today?: number;
  total_data_points_today?: number;
  current_power?: number;
  total_energy?: number;
  voltage?: number;
  current?: number;
}

export interface AnomalyWithRawData extends Anomaly {
  raw_data: IoTRawData;
  device: Device;
}

// Calendar view data
export interface CalendarDayData {
  date: string; // YYYY-MM-DD format
  total_data_points: number;
  anomaly_count: number;
  max_severity: AnomalySeverity | null;
  has_data: boolean;
}

// Dashboard aggregated data
export interface DashboardStats {
  total_devices: number;
  online_devices: number;
  total_power_consumption: number;
  anomalies_today: number;
  anomalies_this_week: number;
  energy_efficiency: number; // Calculated percentage
  total_power_today_kwh: number;
  cost_savings_idr: number;
  total_power_trend: {
    value: number;
    type: 'increase' | 'decrease';
  };
}

// Chart data types
export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface EnergyChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    fridge_id?: string;
  }[];
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Form data types
export interface LoginFormData {
  email: string;
  password: string;
  remember_me: boolean;
}

export interface ProfileFormData {
  name: string;
  email: string;
  current_password?: string;
  new_password?: string;
  confirm_password?: string;
}

export interface DeviceFormData {
  name: string;
  location: string;
}

export interface FridgeFormData {
  name: string;
  model?: string;
  location?: string;
  design_power_consumption: number;
  status?: FridgeStatus;
}

export interface UpdateFridgeInput {
  name?: string;
  model?: string;
  location?: string;
  design_power_consumption?: number;
  status?: FridgeStatus;
}