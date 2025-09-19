// Database types matching PostgreSQL schema

export type DeviceStatus = 'online' | 'offline' | 'warning' | 'error';
export type AnomalyType = 'power_spike' | 'power_drop' | 'power_fluctuation' | 'overconsumption' | 'underconsumption';
export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';
export type AnomalyStatus = 'active' | 'not_resolved' | 'ignored' | 'disconnected';

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

export interface Anomaly {
  id: number; // BIGSERIAL
  device_id: string;
  raw_data_id: number; // Foreign key to IoTRawData
  type: AnomalyType;
  severity: AnomalySeverity;
  status: AnomalyStatus;
  detected_at: string; // ISO timestamp
  resolved_at?: string; // ISO timestamp, nullable
}

// Joined/Extended interfaces for frontend use
export interface DeviceWithStats extends Device {
  latest_power?: number;
  latest_timestamp?: string;
  anomaly_count_today?: number;
  total_data_points_today?: number;
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