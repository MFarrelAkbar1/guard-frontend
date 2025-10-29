# GUARD Database Files

This folder contains all database schemas, migrations, and mock data.

## 🎯 Current/Active Files

### **Schema (Use these)**

- **[DATABASE_SCHEMA_UPDATED.sql](DATABASE_SCHEMA_UPDATED.sql)** ⭐ **CURRENT** - Updated schema (no temperature)
- **[SCHEMA_MIGRATION.sql](SCHEMA_MIGRATION.sql)** ⭐ **RUN THIS** - Migration script to update database

### **Mock Data**

- **[MOCK_DATA_COMPLETE.sql](MOCK_DATA_COMPLETE.sql)** - Complete test data with multiple days
- **[MOCK_DATA_SIMPLE.sql](MOCK_DATA_SIMPLE.sql)** - Simple test data
- **[MOCK_DATA.sql](MOCK_DATA.sql)** - Original mock data

## 📜 Legacy/Old Files (Archive)

These are older versions kept for reference:

- **[DATABASE_SCHEMA.sql](DATABASE_SCHEMA.sql)** - Original schema (with temperature)
- **[DATABASE_SCHEMA_FIXED.sql](DATABASE_SCHEMA_FIXED.sql)** - Previous version
- **[DATABASE_SCHEMA_NO_RLS.sql](DATABASE_SCHEMA_NO_RLS.sql)** - Version without RLS
- **[schema.sql](schema.sql)** - Very old schema
- **[queries.sql](queries.sql)** - Old query examples
- **[auth_sync.sql](auth_sync.sql)** - Auth synchronization

## 🚀 Quick Start

### Apply Latest Schema

1. Open Supabase SQL Editor
2. Run `SCHEMA_MIGRATION.sql` to update existing database
3. OR run `DATABASE_SCHEMA_UPDATED.sql` for fresh install

### Add Test Data

After schema is applied:
```sql
-- Run any of the MOCK_DATA files to populate with test data
```

## 📊 Schema Overview

### Tables:
1. **fridges** - Device/fridge information
2. **power_readings** - Sensor data (voltage, current, power)
3. **anomalies** - Detected anomalies
4. **cost_settings** - User cost configuration
5. **daily_stats** - Pre-aggregated daily statistics

### Key Changes (Latest):
- ✅ `voltage` - REQUIRED (NOT NULL)
- ✅ `current` - REQUIRED (NOT NULL)
- ❌ `temperature` - REMOVED (no sensor)
- ✅ `recorded_at` - Auto-generates if not provided

## Navigation

- [Back to Main README](../README.md)
- [Documentation](../docs/)
- [Migration Guide](../docs/APPLY_SCHEMA_CHANGES.md)
