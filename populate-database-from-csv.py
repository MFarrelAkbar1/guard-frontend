"""
GUARD Database Population Script
Reads modified real data CSV, detects anomalies, and populates Supabase database
"""

import sys
import os
import pandas as pd
import numpy as np
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration from environment variables
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://lccrqphxhmoeynwlkwfd.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
FRIDGE_ID = os.getenv('FRIDGE_ID', '54396b38-2030-46e0-9ef0-a3e425f09148')

if not SUPABASE_KEY:
    raise ValueError("SUPABASE_SERVICE_KEY environment variable is required")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


class AnomalyDetector:
    """Simplified anomaly detector based on GUARD algorithm"""

    def __init__(self, bootstrap_size=60):
        self.bootstrap_size = bootstrap_size
        self.bootstrap_completed = False
        self.auto_threshold = None
        self.buffer_zone = None
        self.current_phase = None
        self.phase_start_idx = 0
        self.last_phase_change_idx = -10
        self.transition_buffer_size = 1

        self.ema_power = {'cooling': None, 'idle': None}
        self.ema_time = {'cooling': None, 'idle': None}
        self.mae_thresholds = {'cooling': None, 'idle': None}

        self.phases = []
        self.anomalies = []

    def bootstrap(self, initial_powers):
        """Bootstrap with auto-threshold detection"""
        if len(initial_powers) < self.bootstrap_size:
            return False

        self.auto_threshold = np.mean(initial_powers)
        self.buffer_zone = 0.1 * self.auto_threshold

        for power in initial_powers:
            phase = 'cooling' if power >= self.auto_threshold else 'idle'
            self.phases.append(phase)

        cooling_powers = [p for i, p in enumerate(initial_powers) if self.phases[i] == 'cooling']
        idle_powers = [p for i, p in enumerate(initial_powers) if self.phases[i] == 'idle']

        if cooling_powers:
            self.ema_power['cooling'] = np.mean(cooling_powers)
            cooling_mae = [abs(p - self.ema_power['cooling']) for p in cooling_powers]
            self.mae_thresholds['cooling'] = np.percentile(cooling_mae, 99.9) if len(cooling_mae) > 1 else 2.0
        else:
            self.mae_thresholds['cooling'] = 2.0

        if idle_powers:
            self.ema_power['idle'] = np.mean(idle_powers)
            idle_mae = [abs(p - self.ema_power['idle']) for p in idle_powers]
            self.mae_thresholds['idle'] = np.percentile(idle_mae, 99.9) if len(idle_mae) > 1 else 1.0
        else:
            self.mae_thresholds['idle'] = 1.0

        self.ema_time['cooling'] = max(5, len(cooling_powers)) if cooling_powers else 10
        self.ema_time['idle'] = max(5, len(idle_powers)) if idle_powers else 15

        self.current_phase = self.phases[-1]
        self.phase_start_idx = len(self.phases) - 1
        self.bootstrap_completed = True

        return True

    def check_phase_change(self, power_value):
        """Check if phase change is needed"""
        upper_bound = self.auto_threshold + self.buffer_zone
        lower_bound = self.auto_threshold - self.buffer_zone

        if self.current_phase == 'idle' and power_value > upper_bound:
            return True, 'cooling'
        elif self.current_phase == 'cooling' and power_value < lower_bound:
            return True, 'idle'

        return False, self.current_phase

    def is_in_transition_buffer(self, index):
        """Check if in transition buffer"""
        return (index - self.last_phase_change_idx) <= self.transition_buffer_size

    def detect_anomaly(self, power_value, index):
        """Detect if current power is anomaly"""
        if not self.bootstrap_completed:
            return False

        if self.is_in_transition_buffer(index):
            return False

        if self.current_phase not in self.ema_power or self.ema_power[self.current_phase] is None:
            return False

        reference_ema = self.ema_power[self.current_phase]
        mae_value = abs(power_value - reference_ema)
        current_threshold = self.mae_thresholds.get(self.current_phase, float('inf'))

        # Spike detection: 175% of MAE threshold
        spike_threshold = 1.75 * current_threshold

        return mae_value > spike_threshold

    def process_datapoint(self, power_value, index):
        """Process single datapoint"""
        if not self.bootstrap_completed:
            return False

        # Check phase change
        should_change, new_phase = self.check_phase_change(power_value)
        if should_change:
            self.last_phase_change_idx = index
            self.current_phase = new_phase
            self.phase_start_idx = index

        # Detect anomaly
        is_anomaly = self.detect_anomaly(power_value, index)

        # Update EMA if not anomaly
        if not is_anomaly and self.ema_power[self.current_phase] is not None:
            self.ema_power[self.current_phase] = 0.2 * power_value + 0.8 * self.ema_power[self.current_phase]

        self.phases.append(self.current_phase)

        return is_anomaly


def clear_tables():
    """Clear existing data from tables"""
    print("Clearing existing data...")
    try:
        # Clear anomalies
        result = supabase.table('anomalies').select('id').limit(1).execute()
        if result.data:
            supabase.table('anomalies').delete().gte('id', '00000000-0000-0000-0000-000000000000').execute()
    except:
        pass

    try:
        # Clear power_readings
        result = supabase.table('power_readings').select('id').limit(1).execute()
        if result.data:
            supabase.table('power_readings').delete().gte('id', '00000000-0000-0000-0000-000000000000').execute()
    except:
        pass

    try:
        # Clear motor_status
        result = supabase.table('motor_status').select('id').limit(1).execute()
        if result.data:
            supabase.table('motor_status').delete().gte('id', 0).execute()
    except:
        pass

    print("Tables cleared")


def populate_database():
    """Main function to populate database from CSV"""

    print("="*60)
    print("GUARD Database Population")
    print("="*60)

    # Read CSV
    print("Reading CSV file...")
    df = pd.read_csv('real-data-export-extended-MODIFIED.csv')
    print(f"Loaded {len(df)} records from CSV")

    # Trim data to natural time range (07:12 on Nov 17 to 23:41 on Nov 19)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    start_time = pd.to_datetime('2025-11-17 07:12:00+00:00')
    end_time = pd.to_datetime('2025-11-19 23:41:00+00:00')

    df = df[(df['timestamp'] >= start_time) & (df['timestamp'] <= end_time)]
    df = df.reset_index(drop=True)
    print(f"Trimmed to {len(df)} records (Nov 17 07:12 to Nov 19 23:41)")

    # Clear existing data
    clear_tables()

    # Initialize detector
    print("Initializing anomaly detector...")
    detector = AnomalyDetector(bootstrap_size=60)

    # Bootstrap
    print("Bootstrapping detector...")
    bootstrap_data = df['power'].values[:60]
    if not detector.bootstrap(bootstrap_data):
        print("Bootstrap failed")
        return

    print(f"Bootstrap complete. Threshold: {detector.auto_threshold:.2f}W")

    # Process data and collect for batch insert
    print("Processing data and detecting anomalies...")

    power_readings = []
    motor_statuses = []
    anomalies = []

    for idx, row in df.iterrows():
        timestamp = str(row['timestamp'])
        voltage = float(row['voltage'])
        current = float(row['current'])
        power = float(row['power'])
        ssr_state = int(row['ssr_state'])

        # Power reading
        power_readings.append({
            'fridge_id': FRIDGE_ID,
            'voltage': voltage,
            'current': current,
            'power_consumption': power,
            'ssr_state': ssr_state,
            'recorded_at': timestamp
        })

        # Motor status
        motor_statuses.append({
            'fridge_id': FRIDGE_ID,
            'ssr_state': ssr_state,
            'recorded_at': timestamp
        })

        # Detect anomaly
        if idx >= 60:  # After bootstrap
            is_anomaly = detector.process_datapoint(power, idx)

            if is_anomaly:
                anomalies.append({
                    'fridge_id': FRIDGE_ID,
                    'power_value': power,
                    'description': f'{power:.2f}W',
                    'detected_at': timestamp,
                    'severity': 'medium',
                    'type': 'power_spike'
                })

    print(f"Detected {len(anomalies)} anomalies")

    # Batch insert power_readings
    print("Inserting power readings...")
    batch_size = 100
    for i in range(0, len(power_readings), batch_size):
        batch = power_readings[i:i+batch_size]
        supabase.table('power_readings').insert(batch).execute()
        print(f"  Inserted {min(i+batch_size, len(power_readings))}/{len(power_readings)}")

    # Batch insert motor_status
    print("Inserting motor statuses...")
    for i in range(0, len(motor_statuses), batch_size):
        batch = motor_statuses[i:i+batch_size]
        supabase.table('motor_status').insert(batch).execute()
        print(f"  Inserted {min(i+batch_size, len(motor_statuses))}/{len(motor_statuses)}")

    # Batch insert anomalies
    if anomalies:
        print("Inserting anomalies...")
        for i in range(0, len(anomalies), batch_size):
            batch = anomalies[i:i+batch_size]
            supabase.table('anomalies').insert(batch).execute()
            print(f"  Inserted {min(i+batch_size, len(anomalies))}/{len(anomalies)}")

    print("="*60)
    print("Database population complete!")
    print(f"  Power readings: {len(power_readings)}")
    print(f"  Motor statuses: {len(motor_statuses)}")
    print(f"  Anomalies: {len(anomalies)}")
    print("="*60)


if __name__ == "__main__":
    populate_database()
