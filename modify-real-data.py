import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import sys

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("📊 Modifying Real Data CSV...")

# Read the original CSV
df = pd.read_csv('real-data-export-extended.csv')
print(f"✅ Loaded {len(df)} records")

# Convert timestamp to datetime
df['timestamp'] = pd.to_datetime(df['timestamp'])

# Extract date for easier filtering
df['date'] = df['timestamp'].dt.date

# Get unique dates
unique_dates = sorted(df['date'].unique())
print(f"📅 Dates found: {unique_dates}")

# Day 1 (Nov 17): Normal operation only (0-0.4A)
# Day 2 (Nov 18): Normal + 1-2 hour anomaly window
# Day 3 (Nov 19): Normal + 1-2 hour anomaly window

# Step 1: Normalize ALL currents to 0-0.4A range first
print("\n🔧 Step 1: Normalizing all currents to 0-0.4A...")

for idx, row in df.iterrows():
    if row['ssr_state'] == 0:
        # Motor OFF: current = 0
        df.at[idx, 'current'] = 0.0
    else:
        # Motor ON: random current 0.14-0.4A (realistic fridge operation)
        # Use some variation: idle-ish (0.14-0.2A) or cooling (0.25-0.4A)
        if np.random.random() < 0.6:  # 60% cooling phase
            df.at[idx, 'current'] = round(np.random.uniform(0.25, 0.4), 2)
        else:  # 40% light operation
            df.at[idx, 'current'] = round(np.random.uniform(0.14, 0.24), 2)

    # Recalculate power
    df.at[idx, 'power'] = round(df.at[idx, 'voltage'] * df.at[idx, 'current'], 2)

print("✅ All currents normalized to 0-0.4A")

# Step 2: Add anomalies to Day 2 (Nov 18)
print("\n⚠️ Step 2: Adding anomalies to Day 2 (Nov 18)...")

day2_date = unique_dates[1]  # Nov 18
day2_data = df[df['date'] == day2_date]

# Choose anomaly window: 10:00-11:30 (1.5 hours = 90 minutes)
anomaly_start_hour = 10
anomaly_duration_minutes = 90

day2_anomaly_mask = (
    (df['date'] == day2_date) &
    (df['timestamp'].dt.hour >= anomaly_start_hour) &
    (df['timestamp'].dt.hour < anomaly_start_hour + 2) &
    (df['timestamp'].dt.minute < (anomaly_duration_minutes % 60) if anomaly_duration_minutes < 120 else 60)
)

# Count how many records will be affected
anomaly_count_day2 = day2_anomaly_mask.sum()
print(f"   Anomaly window: Nov 18, {anomaly_start_hour:02d}:00 - {anomaly_start_hour + anomaly_duration_minutes//60:02d}:{anomaly_duration_minutes%60:02d}")
print(f"   Affected records: {anomaly_count_day2}")

# Apply anomalies
for idx in df[day2_anomaly_mask].index:
    if df.at[idx, 'ssr_state'] == 1:  # Only when motor is ON
        # Anomaly current: 1.0-2.0A
        df.at[idx, 'current'] = round(np.random.uniform(1.0, 2.0), 2)
        df.at[idx, 'power'] = round(df.at[idx, 'voltage'] * df.at[idx, 'current'], 2)

print(f"✅ Day 2 anomalies added")

# Step 3: Add anomalies to Day 3 (Nov 19)
print("\n⚠️ Step 3: Adding anomalies to Day 3 (Nov 19)...")

day3_date = unique_dates[2]  # Nov 19

# Choose anomaly window: 14:00-15:45 (1.75 hours = 105 minutes)
anomaly_start_hour_day3 = 14
anomaly_duration_minutes_day3 = 105

day3_anomaly_mask = (
    (df['date'] == day3_date) &
    (df['timestamp'].dt.hour >= anomaly_start_hour_day3) &
    (
        (df['timestamp'].dt.hour < anomaly_start_hour_day3 + 1) |
        ((df['timestamp'].dt.hour == anomaly_start_hour_day3 + 1) & (df['timestamp'].dt.minute < anomaly_duration_minutes_day3 % 60))
    )
)

# Count how many records will be affected
anomaly_count_day3 = day3_anomaly_mask.sum()
print(f"   Anomaly window: Nov 19, {anomaly_start_hour_day3:02d}:00 - {anomaly_start_hour_day3 + anomaly_duration_minutes_day3//60:02d}:{anomaly_duration_minutes_day3%60:02d}")
print(f"   Affected records: {anomaly_count_day3}")

# Apply anomalies
for idx in df[day3_anomaly_mask].index:
    if df.at[idx, 'ssr_state'] == 1:  # Only when motor is ON
        # Anomaly current: 1.0-2.0A
        df.at[idx, 'current'] = round(np.random.uniform(1.0, 2.0), 2)
        df.at[idx, 'power'] = round(df.at[idx, 'voltage'] * df.at[idx, 'current'], 2)

print(f"✅ Day 3 anomalies added")

# Remove the temporary date column
df = df.drop('date', axis=1)

# Step 4: Save modified CSV
output_file = 'real-data-export-extended-MODIFIED.csv'
df.to_csv(output_file, index=False)
print(f"\n💾 Saved to: {output_file}")

# Step 5: Generate statistics report
print("\n" + "="*60)
print("📊 MODIFICATION REPORT")
print("="*60)

df['date'] = df['timestamp'].dt.date

for date in sorted(df['date'].unique()):
    day_data = df[df['date'] == date]
    ssr_on = day_data[day_data['ssr_state'] == 1]

    print(f"\n📅 {date}:")
    print(f"   Total records: {len(day_data)}")
    print(f"   SSR ON records: {len(ssr_on)}")
    print(f"   Current range: {ssr_on['current'].min():.2f} - {ssr_on['current'].max():.2f} A")
    print(f"   Current mean: {ssr_on['current'].mean():.2f} A")
    print(f"   Power range: {ssr_on['power'].min():.2f} - {ssr_on['power'].max():.2f} W")

    # Count anomalies (current > 0.5A)
    anomalies = ssr_on[ssr_on['current'] > 0.5]
    if len(anomalies) > 0:
        print(f"   ⚠️ ANOMALIES: {len(anomalies)} records")
        print(f"      Current range: {anomalies['current'].min():.2f} - {anomalies['current'].max():.2f} A")
        print(f"      Time range: {anomalies['timestamp'].min().strftime('%H:%M')} - {anomalies['timestamp'].max().strftime('%H:%M')}")

print("\n" + "="*60)
print("✅ MODIFICATION COMPLETE!")
print("="*60)
print(f"\n📁 Original file: real-data-export-extended.csv (preserved)")
print(f"📁 Modified file: {output_file}")
print("\n💡 You can now use the modified CSV for your simulation!")
