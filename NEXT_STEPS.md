# What's Next - Step by Step Guide

You've organized the project and prepared the middleware. Here's what to do next in order:

---

## ✅ Step 1: Get Supabase Service Role Key

**Why**: Middleware needs this to insert data into database

**How**:
1. Go to: https://supabase.com/dashboard
2. Click on your project: **lccrqphxhmoeynwlkwfd**
3. Left sidebar → **Settings** → **API**
4. Scroll down to **Project API keys**
5. Find **`service_role`** key (NOT the `anon` key!)
6. Click **"Reveal"** and copy it
7. ⚠️ **IMPORTANT**: This is secret, don't share publicly!

**Save it somewhere safe** - you'll need it for Railway deployment.

---

## 📋 Step 2: Get Info from Hardware Team

**Why**: Middleware needs MQTT broker credentials to connect

**Ask your teammates for**:

| Info | Example | Where They Get It |
|------|---------|-------------------|
| MQTT Broker URL | `mqtt://abc123.s1.eu.hivemq.cloud` | HiveMQ dashboard |
| MQTT Username | `guarduser` | HiveMQ dashboard |
| MQTT Password | `GuardPass123` | HiveMQ dashboard |
| MQTT Topic | `guard/sensor/data` | ESP-01 code |

**Create a note with these values** - you'll add them to Railway.

---

## 🗃️ Step 3: Get Fridge UUIDs from Database

**Why**: Hardware team needs these for their ESP-01 code

**How**:
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Left sidebar → **Table Editor**
4. Click **`fridges`** table
5. Copy the `id` column values

You should see something like:
```
Fridge A: 550e8400-e29b-41d4-a716-446655440000
Fridge B: 6ba7b810-9dad-11d1-80b4-00c04fd430c8
```

**Share these UUIDs with your hardware team** - they need to put this in ESP-01 code!

---

## 🚀 Step 4: Deploy Middleware to Railway.app

**Follow**: `guard-mqtt-bridge/DEPLOYMENT_RAILWAY.md`

### Quick version:

1. **Push to GitHub**:
   ```bash
   cd C:/Outpost/Capstone/Website/guard-mqtt-bridge
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR-USERNAME/guard-mqtt-bridge.git
   git push -u origin main
   ```

2. **Deploy on Railway**:
   - Go to: https://railway.app
   - Sign up with GitHub
   - New Project → Deploy from GitHub
   - Select `guard-mqtt-bridge` repo
   - Add environment variables (from Steps 1 & 2)
   - Deploy!

3. **Verify**:
   - Check logs show: `✅ Connected to MQTT broker`
   - Visit health endpoint: `https://your-app.railway.app/health`

---

## 🧪 Step 5: Test End-to-End

**Once hardware team is ready**:

1. Hardware sends test message:
   ```json
   {
     "fridge_id": "uuid-from-step-3",
     "voltage": 220.5,
     "current": 0.82
   }
   ```

2. Check Railway logs:
   ```
   📨 Received message
   💾 Inserting to database
   ✅ Successfully inserted
   ```

3. Check Supabase:
   - Go to Table Editor → `power_readings`
   - You should see new row!

4. Check React Dashboard:
   - Open: http://localhost:3000
   - Charts should show real data!

---

## 📊 Summary Checklist

### Your Tasks:
- [ ] Get Supabase service role key
- [ ] Get MQTT credentials from hardware team
- [ ] Get fridge UUIDs from database
- [ ] Share fridge UUIDs with hardware team
- [ ] Push middleware code to GitHub
- [ ] Deploy to Railway.app
- [ ] Verify deployment (check health endpoint)

### Hardware Team Tasks:
- [ ] Set up HiveMQ MQTT broker
- [ ] Update ESP-01 code with:
  - [ ] Fridge UUID
  - [ ] Correct message format
  - [ ] MQTT topic: `guard/sensor/data`
- [ ] Test publish to MQTT

### Integration Test:
- [ ] Hardware publishes test message
- [ ] Middleware receives and processes
- [ ] Data inserted to Supabase
- [ ] Dashboard shows real-time data

---

## 🎯 Current Status

| Component | Status | Action |
|-----------|--------|--------|
| Frontend | ✅ Running | localhost:3000 |
| Database | ✅ Ready | Need to apply migration |
| Middleware | ✅ Code Ready | Need to deploy |
| Hardware | 🔄 In Progress | Team working on it |

---

## 📞 Coordination Points

**Tell hardware team**:

1. **Message format** (simplified):
   ```json
   {
     "fridge_id": "GET-THIS-FROM-YOU",
     "voltage": 220.5,
     "current": 0.82
   }
   ```

2. **NO need to send**:
   - ❌ `temperature` (removed)
   - ❌ `recorded_at` (middleware adds it)
   - ❌ `power_consumption` (middleware calculates it)

3. **MQTT topic**: `guard/sensor/data`

---

## 🆘 If You Get Stuck

1. **Can't get Supabase key**: Check Settings → API in Supabase dashboard
2. **Hardware team not ready**: You can still deploy! Just test with mock data
3. **Railway deployment fails**: Check logs, ensure all env vars are set
4. **MQTT not connecting**: Verify credentials with hardware team

---

**Ready?** Start with **Step 1** - get that Supabase service role key! 🚀
