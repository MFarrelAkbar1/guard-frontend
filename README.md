# GUARD - Grid Usage Anomaly Recognition and Disconnection

IoT-based power monitoring and anomaly detection system for smart grid management.

## 🏗️ Project Structure

```
GUARD/
├── guard-frontend/          # React Dashboard (Web Interface)
│   ├── src/                # React components, pages, services
│   ├── docs/               # Documentation files
│   ├── database/           # Database schemas & migrations
│   └── README.md           # Frontend documentation
│
└── guard-mqtt-bridge/      # MQTT Middleware (Node.js)
    ├── index.js            # Main server code
    ├── DEPLOYMENT_RAILWAY.md  # Deployment guide
    └── README.md           # Middleware documentation
```

## 📋 Overview

**GUARD** is a complete IoT solution for monitoring electrical power consumption and detecting anomalies in real-time.

### Components:
- **Hardware**: STM32F401CCUx + ESP-01 WiFi + Current/Voltage sensors
- **MQTT Broker**: HiveMQ Cloud (message broker)
- **Middleware**: Node.js bridge (MQTT → Supabase)
- **Database**: Supabase PostgreSQL
- **Frontend**: React dashboard (monitoring & analytics)

---

## 🚀 Quick Start

### 1. Frontend Setup

```bash
cd guard-frontend
npm install
npm start
```

Frontend runs on: **http://localhost:3000**

See: [guard-frontend/README.md](guard-frontend/README.md)

### 2. Middleware Setup

```bash
cd guard-mqtt-bridge
npm install
npm start
```

Middleware runs on: **http://localhost:3001**

See: [guard-mqtt-bridge/README.md](guard-mqtt-bridge/README.md)

### 3. Database Setup

Apply database schema:
- See: [guard-frontend/docs/APPLY_SCHEMA_CHANGES.md](guard-frontend/docs/APPLY_SCHEMA_CHANGES.md)

---

## 📊 Data Flow

```
┌─────────────────────────────────────────────────────┐
│  STM32F401CCUx + ESP-01                             │
│  Reads: Voltage, Current                            │
│  Publishes via MQTT                                 │
└────────────┬────────────────────────────────────────┘
             │ MQTT
             ↓
┌─────────────────────────────────────────────────────┐
│  HiveMQ Cloud (MQTT Broker)                         │
│  Topic: guard/sensor/data                           │
└────────────┬────────────────────────────────────────┘
             │ Subscribe
             ↓
┌─────────────────────────────────────────────────────┐
│  guard-mqtt-bridge (Middleware)                     │
│  - Calculates: power = voltage × current            │
│  - Detects anomalies                                │
│  - Adds timestamp                                   │
└────────────┬────────────────────────────────────────┘
             │ REST API
             ↓
┌─────────────────────────────────────────────────────┐
│  Supabase PostgreSQL                                │
│  Tables: power_readings, anomalies, fridges         │
└────────────┬────────────────────────────────────────┘
             │ Supabase JS
             ↓
┌─────────────────────────────────────────────────────┐
│  guard-frontend (React Dashboard)                   │
│  Real-time charts, analytics, anomaly detection     │
└─────────────────────────────────────────────────────┘
```

---

## 👥 Team

- **Leader Supervisor**: Sakti Cahya Buana
- **Web Developer**: Muhammad Farrel Akbar, Sakti Cahya Buana
- **Instrument Technician**: Stasya Adelia, Christy Clarrimond Kewas, Ahmad Maydanul Ilmi
- **Institution**: Universitas Gadjah Mada, Indonesia

---

## 📚 Documentation

- **[PROJECT_ORGANIZATION.md](PROJECT_ORGANIZATION.md)** - Complete project organization
- **[NEXT_STEPS.md](NEXT_STEPS.md)** - Deployment steps
- **[guard-frontend/README.md](guard-frontend/README.md)** - Frontend documentation
- **[guard-mqtt-bridge/README.md](guard-mqtt-bridge/README.md)** - Middleware documentation
- **[guard-frontend/docs/](guard-frontend/docs/)** - All project docs
- **[guard-frontend/database/](guard-frontend/database/)** - Database schemas

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd guard-frontend
# Deploy to Vercel or Netlify
```

### Middleware (Railway.app)
See: [guard-mqtt-bridge/DEPLOYMENT_RAILWAY.md](guard-mqtt-bridge/DEPLOYMENT_RAILWAY.md)

---

## 🔑 Environment Variables

### Frontend (.env)
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

### Middleware (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
MQTT_BROKER=mqtt://your-hivemq-instance.com
MQTT_USERNAME=your_username
MQTT_PASSWORD=your_password
MQTT_TOPIC=guard/sensor/data
```

---

## 📊 Database Schema

### Main Tables:
- **fridges** - Device/fridge information
- **power_readings** - Sensor data (voltage, current, power)
- **anomalies** - Detected anomalies
- **cost_settings** - Cost calculation settings
- **daily_stats** - Daily aggregated statistics

See: [guard-frontend/database/DATABASE_SCHEMA_UPDATED.sql](guard-frontend/database/DATABASE_SCHEMA_UPDATED.sql)

---

## 🧪 Testing

### Test MQTT Message:
```bash
mosquitto_pub -h broker.hivemq.com -t "guard/sensor/data" \
  -m '{"fridge_id":"your-uuid","voltage":220.5,"current":0.82}'
```

---

## 📄 License

MIT - Team GUARD, Universitas Gadjah Mada

---

**⚡ GUARD System - Protecting Your Home, One Anomaly at a Time**
