// Supabase generated types
// This file should be generated using: npx supabase gen types typescript --project-id your-project-id > src/types/supabase.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          password_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          password_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          password_hash?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      devices: {
        Row: {
          id: string
          user_id: string
          name: string
          location: string | null
          status: 'online' | 'offline' | 'warning' | 'error'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          name: string
          location?: string | null
          status?: 'online' | 'offline' | 'warning' | 'error'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          location?: string | null
          status?: 'online' | 'offline' | 'warning' | 'error'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "devices_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      iot_raw_data: {
        Row: {
          id: number
          device_id: string
          timestamp: string
          power: number
          is_anomaly: boolean
          received_at: string
        }
        Insert: {
          id?: number
          device_id: string
          timestamp: string
          power: number
          is_anomaly?: boolean
          received_at?: string
        }
        Update: {
          id?: number
          device_id?: string
          timestamp?: string
          power?: number
          is_anomaly?: boolean
          received_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iot_raw_data_device_id_fkey"
            columns: ["device_id"]
            referencedRelation: "devices"
            referencedColumns: ["id"]
          }
        ]
      }
      anomalies: {
        Row: {
          id: string
          fridge_id: string
          user_id: string
          type: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          description: string | null
          power_reading_id: string | null
          detected_at: string
          resolved_at: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          fridge_id: string
          user_id: string
          type: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          description?: string | null
          power_reading_id?: string | null
          detected_at: string
          resolved_at?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          fridge_id?: string
          user_id?: string
          type?: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
          description?: string | null
          power_reading_id?: string | null
          detected_at?: string
          resolved_at?: string | null
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anomalies_fridge_id_fkey"
            columns: ["fridge_id"]
            referencedRelation: "fridges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anomalies_power_reading_id_fkey"
            columns: ["power_reading_id"]
            referencedRelation: "power_readings"
            referencedColumns: ["id"]
          }
        ]
      }
      fridges: {
        Row: {
          id: string
          user_id: string
          name: string
          model: string | null
          location: string | null
          design_power_consumption: number
          status: string
          installed_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          model?: string | null
          location?: string | null
          design_power_consumption: number
          status?: string
          installed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          model?: string | null
          location?: string | null
          design_power_consumption?: number
          status?: string
          installed_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      power_readings: {
        Row: {
          id: string
          fridge_id: string
          power_consumption: number
          voltage: number | null
          current: number | null
          temperature: number | null
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          fridge_id: string
          power_consumption: number
          voltage?: number | null
          current?: number | null
          temperature?: number | null
          recorded_at: string
          created_at?: string
        }
        Update: {
          id?: string
          fridge_id?: string
          power_consumption?: number
          voltage?: number | null
          current?: number | null
          temperature?: number | null
          recorded_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "power_readings_fridge_id_fkey"
            columns: ["fridge_id"]
            referencedRelation: "fridges"
            referencedColumns: ["id"]
          }
        ]
      }
      cost_settings: {
        Row: {
          id: string
          user_id: string
          short_circuit_repair_cost: number
          short_circuit_frequency_per_year: number
          electricity_rate_per_kwh: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          short_circuit_repair_cost?: number
          short_circuit_frequency_per_year?: number
          electricity_rate_per_kwh?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          short_circuit_repair_cost?: number
          short_circuit_frequency_per_year?: number
          electricity_rate_per_kwh?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_stats: {
        Row: {
          id: string
          user_id: string
          fridge_id: string
          date: string
          total_power_kwh: number
          avg_power_watts: number | null
          max_power_watts: number | null
          min_power_watts: number | null
          anomaly_count: number
          uptime_minutes: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          fridge_id: string
          date: string
          total_power_kwh: number
          avg_power_watts?: number | null
          max_power_watts?: number | null
          min_power_watts?: number | null
          anomaly_count?: number
          uptime_minutes?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          fridge_id?: string
          date?: string
          total_power_kwh?: number
          avg_power_watts?: number | null
          max_power_watts?: number | null
          min_power_watts?: number | null
          anomaly_count?: number
          uptime_minutes?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_stats_fridge_id_fkey"
            columns: ["fridge_id"]
            referencedRelation: "fridges"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      device_status: 'online' | 'offline' | 'warning' | 'error'
      anomaly_type: 'power_spike' | 'power_drop' | 'power_fluctuation' | 'overconsumption' | 'underconsumption'
      anomaly_severity: 'low' | 'medium' | 'high' | 'critical'
      anomaly_status: 'active' | 'not_resolved' | 'ignored' | 'disconnected'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}