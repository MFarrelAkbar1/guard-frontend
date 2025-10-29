# GUARD MQTT Bridge Server

Middleware server that bridges MQTT messages from ESP-01 IoT devices to Supabase PostgreSQL database.

## Architecture

```
STM32 + ESP-01 → MQTT Broker (HiveMQ) → This Server → Supabase PostgreSQL
```

## Features

- ✅ Subscribe to MQTT topics from HiveMQ
- ✅ Parse sensor data (voltage, current)
- ✅ Calculate power consumption (P = V × I)
- ✅ Insert data into Supabase `power_readings` table
- ✅ Real-time anomaly detection
- ✅ Automatic anomaly logging
- ✅ Health check endpoint
- ✅ Graceful shutdown handling

## Prerequisites

- Node.js 18 or higher
- Supabase account with service role key
- MQTT broker (HiveMQ) credentials

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

## Environment Variables

Get these values from your team:

```env
# From Supabase Dashboard → Settings → API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# From HiveMQ Cloud Dashboard
MQTT_BROKER=mqtt://your-hivemq-instance.com
MQTT_USERNAME=your-username
MQTT_PASSWORD=your-password
MQTT_TOPIC=guard/sensor/data

# Server port (optional)
PORT=3001
```

## Running Locally

```bash
# Start the server
npm start

# The server will:
# 1. Connect to MQTT broker
# 2. Subscribe to sensor data topic
# 3. Process incoming messages
# 4. Store data in Supabase
```

## Expected MQTT Message Format

The ESP-01 should publish JSON messages to the configured topic:

```json
{
  "fridge_id": "uuid-of-fridge-device",
  "voltage": 220.5,
  "current": 0.82
}
```

### Required Fields:
- `fridge_id` - UUID of the fridge in database
- `voltage` - Voltage reading in Volts (e.g., 220.5)
- `current` - Current reading in Amperes (e.g., 0.82)

### Optional Fields:
- `recorded_at` - Timestamp (ISO 8601 format). If not provided, middleware auto-generates it

**Note:**
- Power consumption is automatically calculated: `P = V × I`
- Timestamp is automatically added by middleware if ESP-01 doesn't provide it
- Temperature field has been removed (no sensor)

## Anomaly Detection

The server automatically detects anomalies:

| Condition | Type | Severity |
|-----------|------|----------|
| Power > 150% design | power_surge | critical |
| Power > 130% design | power_surge | high |
| Voltage < 180V | voltage_drop | high |
| Voltage < 200V | voltage_drop | medium |
| Voltage > 250V | voltage_surge | critical |
| Voltage > 240V | voltage_surge | high |

## Health Check

Access the health check endpoint:

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "service": "GUARD MQTT Bridge",
  "mqtt_connected": true,
  "uptime": 123.45,
  "timestamp": "2025-10-29T10:30:00Z"
}
```

## Deployment on Render.com

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - GUARD MQTT Bridge"
git branch -M main
git remote add origin https://github.com/your-username/guard-mqtt-bridge.git
git push -u origin main
```

### Step 2: Deploy on Render.com

1. Go to https://render.com
2. Sign up / Log in
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: guard-mqtt-bridge
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add Environment Variables (from .env)
7. Click "Create Web Service"

### Step 3: Verify Deployment

After deployment:
- Visit: `https://your-app.onrender.com/health`
- Check logs for MQTT connection status

## Troubleshooting

### MQTT Connection Failed
- Check MQTT broker URL and credentials
- Verify HiveMQ instance is running
- Check firewall/network settings

### Database Insertion Failed
- Verify Supabase service role key (not anon key!)
- Check if `fridge_id` exists in `fridges` table
- Verify Row Level Security (RLS) policies

### No Messages Received
- Check ESP-01 is publishing to correct topic
- Verify MQTT broker connection
- Check server logs for errors

## Testing Locally

Send a test MQTT message:

```bash
# Using mosquitto_pub (install mosquitto-clients)
mosquitto_pub -h broker.hivemq.com -t "guard/sensor/data" -m '{"fridge_id":"your-fridge-uuid","voltage":220.5,"current":0.82}'

# Or test with node:
node -e "const mqtt = require('mqtt'); const client = mqtt.connect('mqtt://broker.hivemq.com'); client.on('connect', () => { client.publish('guard/sensor/data', JSON.stringify({fridge_id:'your-uuid', voltage:220.5, current:0.82})); console.log('Published!'); client.end(); });"
```

## Logs

The server provides detailed logs:
- 📨 Received messages
- 💾 Database insertions
- 🚨 Anomaly detections
- ❌ Errors and warnings

## Team Coordination

**Ask your teammates for:**
1. HiveMQ connection details (broker URL, username, password)
2. MQTT topic name they're using
3. Exact JSON format ESP-01 is sending
4. Fridge UUID(s) from the database

## License

MIT - Team GUARD, Universitas Gadjah Mada
