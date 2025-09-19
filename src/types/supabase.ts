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
          id: number
          device_id: string
          raw_data_id: number
          type: 'power_spike' | 'power_drop' | 'power_fluctuation' | 'overconsumption' | 'underconsumption'
          severity: 'low' | 'medium' | 'high' | 'critical'
          status: 'active' | 'not_resolved' | 'ignored' | 'disconnected'
          detected_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: number
          device_id: string
          raw_data_id: number
          type: 'power_spike' | 'power_drop' | 'power_fluctuation' | 'overconsumption' | 'underconsumption'
          severity: 'low' | 'medium' | 'high' | 'critical'
          status?: 'active' | 'not_resolved' | 'ignored' | 'disconnected'
          detected_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: number
          device_id?: string
          raw_data_id?: number
          type?: 'power_spike' | 'power_drop' | 'power_fluctuation' | 'overconsumption' | 'underconsumption'
          severity?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'active' | 'not_resolved' | 'ignored' | 'disconnected'
          detected_at?: string
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anomalies_device_id_fkey"
            columns: ["device_id"]
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anomalies_raw_data_id_fkey"
            columns: ["raw_data_id"]
            referencedRelation: "iot_raw_data"
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