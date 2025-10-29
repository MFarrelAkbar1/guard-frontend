// GUARD MQTT Bridge Server
// Receives sensor data from ESP-01 via MQTT and stores in Supabase

require('dotenv').config();
const mqtt = require('mqtt');
const { createClient } = require('@supabase/supabase-js');

// ============================================
// CONFIGURATION
// ============================================

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Use service key for server-side
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// MQTT Configuration
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.hivemq.com';
const MQTT_USERNAME = process.env.MQTT_USERNAME || '';
const MQTT_PASSWORD = process.env.MQTT_PASSWORD || '';
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'guard/sensor/data';

// Server Configuration
const PORT = process.env.PORT || 3001;

// ============================================
// MQTT CLIENT SETUP
// ============================================

console.log('🚀 Starting GUARD MQTT Bridge Server...');
console.log(`📡 MQTT Broker: ${MQTT_BROKER}`);
console.log(`📊 Supabase URL: ${supabaseUrl}`);
console.log(`📝 Listening to topic: ${MQTT_TOPIC}`);

// MQTT connection options
const mqttOptions = {
  clientId: `guard_bridge_${Math.random().toString(16).slice(3)}`,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
};

// Add authentication if provided
if (MQTT_USERNAME && MQTT_PASSWORD) {
  mqttOptions.username = MQTT_USERNAME;
  mqttOptions.password = MQTT_PASSWORD;
}

// Connect to MQTT broker
const mqttClient = mqtt.connect(MQTT_BROKER, mqttOptions);

// ============================================
// MQTT EVENT HANDLERS
// ============================================

mqttClient.on('connect', () => {
  console.log('✅ Connected to MQTT broker');

  // Subscribe to sensor data topic
  mqttClient.subscribe(MQTT_TOPIC, (err) => {
    if (err) {
      console.error('❌ Failed to subscribe to topic:', err);
    } else {
      console.log(`✅ Subscribed to topic: ${MQTT_TOPIC}`);
    }
  });
});

mqttClient.on('message', async (topic, message) => {
  try {
    // Parse incoming message
    const dataString = message.toString();
    console.log(`\n📨 Received message on ${topic}:`);
    console.log(`   Raw: ${dataString}`);

    // Parse JSON data
    const sensorData = JSON.parse(dataString);
    console.log('   Parsed:', sensorData);

    // Validate required fields
    if (!sensorData.fridge_id) {
      console.error('⚠️  Missing fridge_id, skipping...');
      return;
    }

    if (!sensorData.voltage || !sensorData.current) {
      console.error('⚠️  Missing voltage or current data, skipping...');
      return;
    }

    // Validate voltage and current are numbers
    const voltage = parseFloat(sensorData.voltage);
    const current = parseFloat(sensorData.current);

    if (isNaN(voltage) || isNaN(current)) {
      console.error('⚠️  Invalid voltage or current value, skipping...');
      return;
    }

    // Calculate power consumption (P = V × I)
    const powerConsumption = voltage * current;

    // Generate timestamp if not provided by ESP-01
    // Middleware automatically adds timestamp
    const timestamp = sensorData.recorded_at || new Date().toISOString();

    // Prepare data for database
    const powerReading = {
      fridge_id: sensorData.fridge_id,
      voltage: parseFloat(voltage.toFixed(2)),
      current: parseFloat(current.toFixed(2)),
      power_consumption: parseFloat(powerConsumption.toFixed(2)),
      recorded_at: timestamp
    };

    console.log('💾 Inserting to database:', powerReading);

    // Insert into Supabase
    const { data, error } = await supabase
      .from('power_readings')
      .insert([powerReading]);

    if (error) {
      console.error('❌ Database error:', error);
    } else {
      console.log('✅ Successfully inserted to database');

      // Check for anomaly detection (optional)
      await checkForAnomalies(powerReading);
    }

  } catch (error) {
    console.error('❌ Error processing message:', error.message);
    console.error('   Stack:', error.stack);
  }
});

mqttClient.on('error', (error) => {
  console.error('❌ MQTT Error:', error.message);
});

mqttClient.on('close', () => {
  console.log('⚠️  MQTT connection closed');
});

mqttClient.on('reconnect', () => {
  console.log('🔄 Reconnecting to MQTT broker...');
});

// ============================================
// ANOMALY DETECTION
// ============================================

async function checkForAnomalies(reading) {
  try {
    // Get fridge design power
    const { data: fridge, error: fridgeError } = await supabase
      .from('fridges')
      .select('design_power_consumption, user_id, name')
      .eq('id', reading.fridge_id)
      .single();

    if (fridgeError || !fridge) {
      console.log('⚠️  Could not fetch fridge data for anomaly check');
      return;
    }

    const designPower = fridge.design_power_consumption;
    const powerDiff = reading.power_consumption - designPower;
    const powerDiffPercent = (powerDiff / designPower) * 100;

    // Anomaly thresholds
    let anomalyType = null;
    let severity = null;
    let description = null;

    // Power surge detection (>150% of design power)
    if (powerDiffPercent > 150) {
      anomalyType = 'power_surge';
      severity = 'critical';
      description = `Power consumption (${reading.power_consumption}W) is ${powerDiffPercent.toFixed(1)}% above design power (${designPower}W)`;
    }
    // High power consumption (>130% of design power)
    else if (powerDiffPercent > 130) {
      anomalyType = 'power_surge';
      severity = 'high';
      description = `Power consumption (${reading.power_consumption}W) is ${powerDiffPercent.toFixed(1)}% above design power (${designPower}W)`;
    }
    // Voltage drop detection (<200V)
    else if (reading.voltage < 200) {
      anomalyType = 'voltage_drop';
      severity = reading.voltage < 180 ? 'high' : 'medium';
      description = `Low voltage detected: ${reading.voltage}V`;
    }
    // Voltage surge detection (>240V)
    else if (reading.voltage > 240) {
      anomalyType = 'voltage_surge';
      severity = reading.voltage > 250 ? 'critical' : 'high';
      description = `High voltage detected: ${reading.voltage}V`;
    }

    // If anomaly detected, insert into anomalies table
    if (anomalyType) {
      console.log(`🚨 ANOMALY DETECTED: ${anomalyType} (${severity})`);
      console.log(`   ${description}`);

      const anomaly = {
        fridge_id: reading.fridge_id,
        user_id: fridge.user_id,
        type: anomalyType,
        severity: severity,
        description: description,
        detected_at: reading.recorded_at,
        status: 'active'
      };

      const { error: anomalyError } = await supabase
        .from('anomalies')
        .insert([anomaly]);

      if (anomalyError) {
        console.error('❌ Failed to insert anomaly:', anomalyError);
      } else {
        console.log('✅ Anomaly logged to database');
      }
    }

  } catch (error) {
    console.error('❌ Error in anomaly detection:', error.message);
  }
}

// ============================================
// HEALTH CHECK ENDPOINT (for Render.com)
// ============================================

const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'GUARD MQTT Bridge',
      mqtt_connected: mqttClient.connected,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`\n🌐 Health check server running on port ${PORT}`);
  console.log(`   Access: http://localhost:${PORT}/health`);
  console.log('\n📡 Waiting for MQTT messages...\n`);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  mqttClient.end();
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  mqttClient.end();
  server.close();
  process.exit(0);
});
