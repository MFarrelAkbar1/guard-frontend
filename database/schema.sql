-- PostgreSQL Schema for IoT Energy Management System
-- Compatible with Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE device_status AS ENUM ('online', 'offline', 'warning', 'error');
CREATE TYPE anomaly_type AS ENUM ('power_spike', 'power_drop', 'power_fluctuation', 'overconsumption', 'underconsumption');
CREATE TYPE anomaly_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE anomaly_status AS ENUM ('active', 'not_resolved', 'ignored', 'disconnected');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Devices table
CREATE TABLE devices (
    id VARCHAR(50) PRIMARY KEY, -- IoT device identifier (e.g., 'NR-BB332Q-PK-1')
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    status device_status DEFAULT 'offline',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Raw IoT data table (optimized for high-frequency inserts)
CREATE TABLE iot_raw_data (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    power DECIMAL(10,2) NOT NULL, -- Power in watts
    is_anomaly BOOLEAN NOT NULL DEFAULT FALSE,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calculated anomalies table
CREATE TABLE anomalies (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    raw_data_id BIGINT NOT NULL REFERENCES iot_raw_data(id) ON DELETE CASCADE,
    type anomaly_type NOT NULL,
    severity anomaly_severity NOT NULL,
    status anomaly_status DEFAULT 'active',
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance optimization
CREATE INDEX idx_iot_raw_data_device_timestamp ON iot_raw_data(device_id, timestamp DESC);
CREATE INDEX idx_iot_raw_data_timestamp ON iot_raw_data(timestamp DESC);
CREATE INDEX idx_iot_raw_data_is_anomaly ON iot_raw_data(is_anomaly) WHERE is_anomaly = TRUE;
CREATE INDEX idx_anomalies_device_detected ON anomalies(device_id, detected_at DESC);
CREATE INDEX idx_anomalies_status ON anomalies(status);
CREATE INDEX idx_devices_user_id ON devices(user_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) for Supabase
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE iot_raw_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Devices: users can only access their own devices
CREATE POLICY "Users can view own devices" ON devices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices" ON devices
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own devices" ON devices
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own devices" ON devices
    FOR DELETE USING (auth.uid() = user_id);

-- IoT raw data: users can only access data from their devices
CREATE POLICY "Users can view own device data" ON iot_raw_data
    FOR SELECT USING (
        device_id IN (
            SELECT id FROM devices WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "IoT devices can insert data" ON iot_raw_data
    FOR INSERT WITH CHECK (true); -- Allow IoT devices to insert data

-- Anomalies: users can only access anomalies from their devices
CREATE POLICY "Users can view own device anomalies" ON anomalies
    FOR SELECT USING (
        device_id IN (
            SELECT id FROM devices WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert anomalies" ON anomalies
    FOR INSERT WITH CHECK (true); -- Allow system to calculate and insert anomalies

CREATE POLICY "Users can update own device anomalies" ON anomalies
    FOR UPDATE USING (
        device_id IN (
            SELECT id FROM devices WHERE user_id = auth.uid()
        )
    );

-- Sample data for testing
INSERT INTO users (id, name, email, password_hash) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'John Doe', 'john@example.com', '$2b$10$hash_here');

INSERT INTO devices (id, user_id, name, location, status) VALUES
('NR-BB332Q-PK-1', '550e8400-e29b-41d4-a716-446655440000', 'Kulkas NR-BB332Q-PK-1', 'Kitchen Area', 'online'),
('AC-001-LG-2', '550e8400-e29b-41d4-a716-446655440000', 'AC Living Room', 'Living Room', 'online');

-- Sample IoT data
INSERT INTO iot_raw_data (device_id, timestamp, power, is_anomaly) VALUES
('NR-BB332Q-PK-1', NOW() - INTERVAL '1 hour', 120.50, FALSE),
('NR-BB332Q-PK-1', NOW() - INTERVAL '30 minutes', 350.00, TRUE),
('NR-BB332Q-PK-1', NOW() - INTERVAL '15 minutes', 125.75, FALSE);

-- Sample anomaly (calculated)
INSERT INTO anomalies (device_id, raw_data_id, type, severity, status) VALUES
('NR-BB332Q-PK-1', 2, 'power_spike', 'high', 'active');