# GUARD Project Organization Summary

## ✅ Completed Tasks

### 1. Database Schema Updated
- ✅ Removed `temperature` column (no sensor)
- ✅ Made `voltage` REQUIRED (NOT NULL)
- ✅ Made `current` REQUIRED (NOT NULL)
- ✅ Added auto-timestamp for `recorded_at`

### 2. Middleware Created
- ✅ Created MQTT bridge server (`guard-mqtt-bridge/`)
- ✅ Auto-calculates power (P = V × I)
- ✅ Auto-generates timestamps
- ✅ Anomaly detection built-in
- ✅ Ready for deployment

### 3. Files Organized
- ✅ All `.md` files → `docs/` folder
- ✅ All `.sql` files → `database/` folder
- ✅ Created README indexes for each folder
- ✅ Updated main README with project structure

---

## 📁 Project Structure

```
Capstone/Website/
│
├── guard-frontend/              # React Dashboard
│   ├── src/                     # Source code
│   │   ├── components/         # React components
│   │   ├── contexts/           # Auth, Theme contexts
│   │   ├── pages/              # Login, Dashboard pages
│   │   ├── services/           # API services
│   │   ├── lib/                # Supabase client
│   │   └── types/              # TypeScript types
│   │
│   ├── docs/                    # 📚 All documentation
│   │   ├── README.md           # Documentation index
│   │   ├── APPLY_SCHEMA_CHANGES.md ⭐
│   │   ├── DATABASE_SETUP_*.md
│   │   ├── SUPABASE_SETUP.md
│   │   ├── EMAIL_SETUP.md
│   │   └── ...
│   │
│   ├── database/                # 🗄️ All database files
│   │   ├── README.md           # Database index
│   │   ├── DATABASE_SCHEMA_UPDATED.sql ⭐
│   │   ├── SCHEMA_MIGRATION.sql ⭐
│   │   ├── MOCK_DATA_*.sql
│   │   └── ...
│   │
│   ├── public/                 # Static assets
│   ├── package.json            # Dependencies
│   └── README.md               # Main README ⭐
│
└── guard-mqtt-bridge/          # MQTT Middleware Server
    ├── index.js                # Main server code ⭐
    ├── package.json            # Dependencies
    ├── .env                    # Configuration (not in git)
    ├── .env.example            # Config template
    ├── .gitignore              # Git ignore
    └── README.md               # Middleware docs ⭐
```

---

## 🎯 Key Files Reference

### Frontend (guard-frontend/)
| File | Description |
|------|-------------|
| `README.md` | Main project README |
| `docs/APPLY_SCHEMA_CHANGES.md` | **Database migration guide** |
| `database/DATABASE_SCHEMA_UPDATED.sql` | **Current schema** |
| `database/SCHEMA_MIGRATION.sql` | **Migration script** |

### Middleware (guard-mqtt-bridge/)
| File | Description |
|------|-------------|
| `index.js` | MQTT → Supabase bridge server |
| `.env` | Configuration (needs updating) |
| `README.md` | Setup & deployment guide |

---

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│  STM32F401CCUx + ESP-01                                 │
│  Sensors: Current & Voltage                             │
│  Sends: { fridge_id, voltage, current }                │
└────────────────┬────────────────────────────────────────┘
                 │ MQTT Publish
                 ↓
┌─────────────────────────────────────────────────────────┐
│  HiveMQ Cloud (MQTT Broker)                             │
│  Topic: guard/sensor/data                               │
└────────────────┬────────────────────────────────────────┘
                 │ MQTT Subscribe
                 ↓
┌─────────────────────────────────────────────────────────┐
│  guard-mqtt-bridge (Middleware)                         │
│  - Receives MQTT messages                               │
│  - Calculates: power = voltage × current                │
│  - Adds timestamp                                       │
│  - Inserts to Supabase                                  │
└────────────────┬────────────────────────────────────────┘
                 │ REST API
                 ↓
┌─────────────────────────────────────────────────────────┐
│  Supabase PostgreSQL                                    │
│  Table: power_readings                                  │
│  Columns: voltage, current, power_consumption, ...      │
└────────────────┬────────────────────────────────────────┘
                 │ Supabase JS Client
                 ↓
┌─────────────────────────────────────────────────────────┐
│  guard-frontend (React Dashboard)                       │
│  URL: http://localhost:3000                             │
│  Displays: Charts, Stats, Anomalies                     │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Next Steps / TODO

### Immediate (You)
- [ ] Apply database migration (run `SCHEMA_MIGRATION.sql`)
- [ ] Get Supabase service role key
- [ ] Get HiveMQ credentials from hardware team
- [ ] Update `.env` in `guard-mqtt-bridge/`
- [ ] Test middleware locally
- [ ] Deploy middleware to Render.com

### Hardware Team
- [ ] Complete HiveMQ setup
- [ ] Get fridge UUIDs from database
- [ ] Update ESP-01 code with new message format:
  ```json
  {
    "fridge_id": "uuid-here",
    "voltage": 220.5,
    "current": 0.82
  }
  ```
- [ ] Test MQTT publishing

### Integration Testing
- [ ] Hardware publishes test data
- [ ] Middleware receives and processes
- [ ] Data appears in Supabase
- [ ] Dashboard displays real-time data

---

## 📖 Documentation Index

### Setup Guides
- **Frontend Setup**: `guard-frontend/README.md`
- **Database Setup**: `guard-frontend/docs/APPLY_SCHEMA_CHANGES.md`
- **Middleware Setup**: `guard-mqtt-bridge/README.md`

### Database
- **Schema**: `guard-frontend/database/DATABASE_SCHEMA_UPDATED.sql`
- **Migration**: `guard-frontend/database/SCHEMA_MIGRATION.sql`
- **Test Data**: `guard-frontend/database/MOCK_DATA_COMPLETE.sql`

### Deployment
- **Middleware Deployment**: See `guard-mqtt-bridge/README.md` → "Deployment on Render.com"

---

## 🔧 Configuration Required

### guard-frontend/.env
```env
REACT_APP_SUPABASE_URL=https://lccrqphxhmoeynwlkwfd.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUz... (already set)
```

### guard-mqtt-bridge/.env
```env
SUPABASE_URL=https://lccrqphxhmoeynwlkwfd.supabase.co
SUPABASE_SERVICE_KEY=<GET_FROM_SUPABASE_DASHBOARD>
MQTT_BROKER=<GET_FROM_HARDWARE_TEAM>
MQTT_USERNAME=<GET_FROM_HARDWARE_TEAM>
MQTT_PASSWORD=<GET_FROM_HARDWARE_TEAM>
MQTT_TOPIC=guard/sensor/data
```

---

## 👥 Team Responsibilities

| Team Member | Responsibility | Status |
|-------------|----------------|--------|
| **Web Developer** (You) | Frontend, Middleware, Database | ✅ Code Ready |
| **Hardware Team** | STM32, ESP-01, Sensors | 🔄 In Progress |
| **Integration** | Both teams | ⏳ Pending |

---

## ✅ What's Working Now

1. ✅ **Frontend**: Running on localhost:3000
2. ✅ **Database**: Supabase connected, schema defined
3. ✅ **Middleware**: Code ready, needs deployment
4. ⏳ **Hardware**: Being developed by teammates
5. ⏳ **MQTT Broker**: Being set up by teammates

---

## 🚀 Deployment Checklist

### Frontend (Vercel/Netlify)
- [ ] Push to GitHub
- [ ] Connect to Vercel
- [ ] Add environment variables
- [ ] Deploy

### Middleware (Render.com)
- [ ] Push to GitHub
- [ ] Connect to Render
- [ ] Add environment variables
- [ ] Deploy
- [ ] Verify health endpoint

### Database (Supabase)
- [ ] Run migration script
- [ ] Verify schema changes
- [ ] Add fridge devices
- [ ] Share fridge UUIDs with hardware team

---

**Last Updated**: 2025-10-29
**Status**: Ready for Database Migration & Middleware Deployment
