export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      anomalies: {
        Row: {
          created_at: string | null
          description: string | null
          detected_at: string
          expected_value: number | null
          fridge_id: string | null
          id: string
          mae_value: number | null
          phase: string | null
          phase_duration: number | null
          power_reading_id: string | null
          power_value: number | null
          resolved_at: string | null
          severity: string
          status: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          detected_at: string
          expected_value?: number | null
          fridge_id?: string | null
          id?: string
          mae_value?: number | null
          phase?: string | null
          phase_duration?: number | null
          power_reading_id?: string | null
          power_value?: number | null
          resolved_at?: string | null
          severity: string
          status?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          detected_at?: string
          expected_value?: number | null
          fridge_id?: string | null
          id?: string
          mae_value?: number | null
          phase?: string | null
          phase_duration?: number | null
          power_reading_id?: string | null
          power_value?: number | null
          resolved_at?: string | null
          severity?: string
          status?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anomalies_fridge_id_fkey"
            columns: ["fridge_id"]
            isOneToOne: false
            referencedRelation: "fridges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anomalies_power_reading_id_fkey"
            columns: ["power_reading_id"]
            isOneToOne: false
            referencedRelation: "power_readings"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_settings: {
        Row: {
          created_at: string | null
          electricity_rate_per_kwh: number | null
          id: string
          short_circuit_frequency_per_year: number | null
          short_circuit_repair_cost: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          electricity_rate_per_kwh?: number | null
          id?: string
          short_circuit_frequency_per_year?: number | null
          short_circuit_repair_cost?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          electricity_rate_per_kwh?: number | null
          id?: string
          short_circuit_frequency_per_year?: number | null
          short_circuit_repair_cost?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      daily_stats: {
        Row: {
          anomaly_count: number | null
          avg_power_watts: number | null
          created_at: string | null
          date: string
          fridge_id: string | null
          id: string
          max_power_watts: number | null
          min_power_watts: number | null
          total_power_kwh: number
          uptime_minutes: number | null
          user_id: string | null
        }
        Insert: {
          anomaly_count?: number | null
          avg_power_watts?: number | null
          created_at?: string | null
          date: string
          fridge_id?: string | null
          id?: string
          max_power_watts?: number | null
          min_power_watts?: number | null
          total_power_kwh: number
          uptime_minutes?: number | null
          user_id?: string | null
        }
        Update: {
          anomaly_count?: number | null
          avg_power_watts?: number | null
          created_at?: string | null
          date?: string
          fridge_id?: string | null
          id?: string
          max_power_watts?: number | null
          min_power_watts?: number | null
          total_power_kwh?: number
          uptime_minutes?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_stats_fridge_id_fkey"
            columns: ["fridge_id"]
            isOneToOne: false
            referencedRelation: "fridges"
            referencedColumns: ["id"]
          },
        ]
      }
      fridges: {
        Row: {
          created_at: string | null
          design_power_consumption: number
          id: string
          installed_at: string | null
          location: string | null
          model: string | null
          name: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          design_power_consumption: number
          id?: string
          installed_at?: string | null
          location?: string | null
          model?: string | null
          name: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          design_power_consumption?: number
          id?: string
          installed_at?: string | null
          location?: string | null
          model?: string | null
          name?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      motor_status: {
        Row: {
          created_at: string
          fridge_id: string
          id: number
          recorded_at: string
          ssr_state: number
        }
        Insert: {
          created_at?: string
          fridge_id: string
          id?: number
          recorded_at?: string
          ssr_state: number
        }
        Update: {
          created_at?: string
          fridge_id?: string
          id?: number
          recorded_at?: string
          ssr_state?: number
        }
        Relationships: [
          {
            foreignKeyName: "motor_status_fridge_id_fkey"
            columns: ["fridge_id"]
            isOneToOne: false
            referencedRelation: "fridges"
            referencedColumns: ["id"]
          },
        ]
      }
      power_readings: {
        Row: {
          created_at: string | null
          current: number
          fridge_id: string | null
          id: string
          power_consumption: number
          recorded_at: string | null
          ssr_state: number | null
          voltage: number
        }
        Insert: {
          created_at?: string | null
          current: number
          fridge_id?: string | null
          id?: string
          power_consumption: number
          recorded_at?: string | null
          ssr_state?: number | null
          voltage: number
        }
        Update: {
          created_at?: string | null
          current?: number
          fridge_id?: string | null
          id?: string
          power_consumption?: number
          recorded_at?: string | null
          ssr_state?: number | null
          voltage?: number
        }
        Relationships: [
          {
            foreignKeyName: "power_readings_fridge_id_fkey"
            columns: ["fridge_id"]
            isOneToOne: false
            referencedRelation: "fridges"
            referencedColumns: ["id"]
          },
        ]
      }
      raw_data1: {
        Row: {
          current: number | null
          device_id: string
          id: number
          is_anomaly: boolean | null
          power: number | null
          raw: Json | null
          received_at: string | null
          ts: string
          voltage: number | null
        }
        Insert: {
          current?: number | null
          device_id: string
          id?: number
          is_anomaly?: boolean | null
          power?: number | null
          raw?: Json | null
          received_at?: string | null
          ts: string
          voltage?: number | null
        }
        Update: {
          current?: number | null
          device_id?: string
          id?: number
          is_anomaly?: boolean | null
          power?: number | null
          raw?: Json | null
          received_at?: string | null
          ts?: string
          voltage?: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          password_hash: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          password_hash: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          password_hash?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_daily_stats: {
        Args: { p_date: string; p_fridge_id: string }
        Returns: undefined
      }
    }
    Enums: {
      anomaly_severity: "low" | "medium" | "high" | "critical"
      anomaly_status: "active" | "not_resolved" | "ignored" | "disconnected"
      anomaly_type:
        | "power_spike"
        | "power_drop"
        | "power_fluctuation"
        | "overconsumption"
        | "underconsumption"
      device_status: "online" | "offline" | "warning" | "error"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      anomaly_severity: ["low", "medium", "high", "critical"],
      anomaly_status: ["active", "not_resolved", "ignored", "disconnected"],
      anomaly_type: [
        "power_spike",
        "power_drop",
        "power_fluctuation",
        "overconsumption",
        "underconsumption",
      ],
      device_status: ["online", "offline", "warning", "error"],
    },
  },
} as const
