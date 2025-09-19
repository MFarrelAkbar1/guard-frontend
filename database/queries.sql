-- Common SQL Queries for IoT Energy Management System

-- 1. Get daily calendar data for a specific device
-- Returns: date, total_data_points, anomaly_count, max_severity, has_data
SELECT
    DATE(ird.timestamp) as date,
    COUNT(*) as total_data_points,
    COUNT(CASE WHEN ird.is_anomaly = true THEN 1 END) as anomaly_count,
    CASE
        WHEN COUNT(CASE WHEN a.severity = 'critical' THEN 1 END) > 0 THEN 'critical'
        WHEN COUNT(CASE WHEN a.severity = 'high' THEN 1 END) > 0 THEN 'high'
        WHEN COUNT(CASE WHEN a.severity = 'medium' THEN 1 END) > 0 THEN 'medium'
        WHEN COUNT(CASE WHEN a.severity = 'low' THEN 1 END) > 0 THEN 'low'
        ELSE NULL
    END as max_severity,
    true as has_data
FROM iot_raw_data ird
LEFT JOIN anomalies a ON ird.id = a.raw_data_id
WHERE ird.device_id = $1
    AND ird.timestamp >= $2
    AND ird.timestamp < $3
GROUP BY DATE(ird.timestamp)
ORDER BY date;

-- 2. Get device with latest stats
-- Returns: device info + latest_power, latest_timestamp, anomaly_count_today, total_data_points_today
SELECT
    d.*,
    latest.power as latest_power,
    latest.timestamp as latest_timestamp,
    COALESCE(today_stats.anomaly_count_today, 0) as anomaly_count_today,
    COALESCE(today_stats.total_data_points_today, 0) as total_data_points_today
FROM devices d
LEFT JOIN (
    SELECT DISTINCT ON (device_id)
        device_id, power, timestamp
    FROM iot_raw_data
    ORDER BY device_id, timestamp DESC
) latest ON d.id = latest.device_id
LEFT JOIN (
    SELECT
        device_id,
        COUNT(*) as total_data_points_today,
        COUNT(CASE WHEN is_anomaly = true THEN 1 END) as anomaly_count_today
    FROM iot_raw_data
    WHERE DATE(timestamp) = CURRENT_DATE
    GROUP BY device_id
) today_stats ON d.id = today_stats.device_id
WHERE d.user_id = $1;

-- 3. Get dashboard statistics for a user
-- Returns: total_devices, online_devices, total_power_consumption, anomalies_today, anomalies_this_week
SELECT
    COUNT(DISTINCT d.id) as total_devices,
    COUNT(DISTINCT CASE WHEN d.status = 'online' THEN d.id END) as online_devices,
    COALESCE(SUM(latest.power), 0) as total_power_consumption,
    COALESCE(COUNT(CASE WHEN DATE(a.detected_at) = CURRENT_DATE THEN 1 END), 0) as anomalies_today,
    COALESCE(COUNT(CASE WHEN a.detected_at >= DATE_TRUNC('week', CURRENT_DATE) THEN 1 END), 0) as anomalies_this_week
FROM devices d
LEFT JOIN (
    SELECT DISTINCT ON (device_id)
        device_id, power
    FROM iot_raw_data
    ORDER BY device_id, timestamp DESC
) latest ON d.id = latest.device_id
LEFT JOIN anomalies a ON d.id = a.device_id
WHERE d.user_id = $1;

-- 4. Insert IoT raw data
-- Used when receiving data from IoT devices
INSERT INTO iot_raw_data (device_id, timestamp, power, is_anomaly)
VALUES ($1, $2, $3, $4)
RETURNING id;

-- 5. Create calculated anomaly record
-- Used when system detects and calculates anomaly details
INSERT INTO anomalies (device_id, raw_data_id, type, severity, status)
VALUES ($1, $2, $3, $4, 'active')
RETURNING id;

-- 6. Get recent anomalies for dashboard
-- Returns: recent anomalies with device info and raw data
SELECT
    a.*,
    d.name as device_name,
    d.location as device_location,
    ird.power,
    ird.timestamp as occurrence_time
FROM anomalies a
JOIN devices d ON a.device_id = d.id
JOIN iot_raw_data ird ON a.raw_data_id = ird.id
WHERE d.user_id = $1
    AND a.detected_at >= $2
ORDER BY a.detected_at DESC
LIMIT $3;

-- 7. Update anomaly status
-- Used when user acknowledges, ignores, or resolves anomalies
UPDATE anomalies
SET status = $2, resolved_at = CASE WHEN $2 = 'resolved' THEN NOW() ELSE resolved_at END
WHERE id = $1
    AND device_id IN (SELECT id FROM devices WHERE user_id = $3);

-- 8. Get hourly power consumption for charts
-- Returns: hourly aggregated power data for visualization
SELECT
    DATE_TRUNC('hour', timestamp) as hour,
    AVG(power) as avg_power,
    MIN(power) as min_power,
    MAX(power) as max_power,
    COUNT(*) as data_points,
    COUNT(CASE WHEN is_anomaly = true THEN 1 END) as anomaly_count
FROM iot_raw_data
WHERE device_id = $1
    AND timestamp >= $2
    AND timestamp <= $3
GROUP BY DATE_TRUNC('hour', timestamp)
ORDER BY hour;

-- 9. Get device performance metrics
-- Returns: efficiency and performance indicators
SELECT
    device_id,
    DATE(timestamp) as date,
    AVG(power) as avg_power,
    STDDEV(power) as power_variance,
    COUNT(*) as total_readings,
    COUNT(CASE WHEN is_anomaly = true THEN 1 END) as anomaly_count,
    (COUNT(*) - COUNT(CASE WHEN is_anomaly = true THEN 1 END)) * 100.0 / COUNT(*) as efficiency_percentage
FROM iot_raw_data
WHERE device_id = $1
    AND timestamp >= $2
    AND timestamp <= $3
GROUP BY device_id, DATE(timestamp)
ORDER BY date DESC;

-- 10. Clean up old raw data (for maintenance)
-- Remove raw data older than specified retention period
DELETE FROM iot_raw_data
WHERE timestamp < NOW() - INTERVAL '$1 days'
    AND is_anomaly = false; -- Keep anomaly data longer

-- 11. Get anomaly trends
-- Returns: anomaly counts grouped by type and severity over time
SELECT
    DATE_TRUNC('day', detected_at) as date,
    type,
    severity,
    COUNT(*) as count
FROM anomalies a
JOIN devices d ON a.device_id = d.id
WHERE d.user_id = $1
    AND a.detected_at >= $2
    AND a.detected_at <= $3
GROUP BY DATE_TRUNC('day', detected_at), type, severity
ORDER BY date DESC, severity DESC;

-- 12. Check device connectivity
-- Returns: devices that haven't sent data recently
SELECT
    d.id,
    d.name,
    d.location,
    MAX(ird.timestamp) as last_data_received,
    EXTRACT(EPOCH FROM (NOW() - MAX(ird.timestamp)))/60 as minutes_since_last_data
FROM devices d
LEFT JOIN iot_raw_data ird ON d.id = ird.device_id
WHERE d.user_id = $1
GROUP BY d.id, d.name, d.location
HAVING MAX(ird.timestamp) < NOW() - INTERVAL '30 minutes'
    OR MAX(ird.timestamp) IS NULL
ORDER BY last_data_received DESC NULLS LAST;