# Deploy GUARD MQTT Bridge to Railway.app

Railway.app is perfect for this MQTT middleware because it runs 24/7 without sleeping (unlike Render.com free tier).

## ✅ Why Railway.app?

- ✅ **Never sleeps** - Keeps MQTT connection alive 24/7
- ✅ **$5 free credit/month** - Enough for lightweight Node.js app
- ✅ **Persistent connections** - Perfect for MQTT
- ✅ **Easy deployment** - Deploy from GitHub in minutes
- ✅ **Automatic SSL** - HTTPS for health endpoint

---

## 📋 Prerequisites

Before deploying, make sure you have:

1. ✅ GitHub account
2. ✅ This code pushed to GitHub repository
3. ✅ Supabase service role key
4. ✅ HiveMQ credentials from hardware team

---

## 🚀 Step-by-Step Deployment

### **Step 1: Push Code to GitHub**

```bash
cd C:/Outpost/Capstone/Website/guard-mqtt-bridge

# Initialize git (if not already)
git init

# Add all files (except .env - it's in .gitignore)
git add .

# Commit
git commit -m "Add GUARD MQTT bridge middleware"

# Create a new repository on GitHub, then:
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/guard-mqtt-bridge.git
git push -u origin main
```

⚠️ **Important**: Make sure `.env` is in `.gitignore` (it already is)!

---

### **Step 2: Sign Up for Railway.app**

1. Go to: **https://railway.app**
2. Click **"Start a New Project"** or **"Login"**
3. Sign up with **GitHub** (easiest way)
4. Authorize Railway to access your repositories

---

### **Step 3: Create New Project**

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: `guard-mqtt-bridge`
4. Railway will auto-detect it's a Node.js project

---

### **Step 4: Configure Environment Variables**

After deployment starts, click on your service, then:

1. Go to **"Variables"** tab
2. Click **"+ New Variable"**
3. Add these one by one:

```env
SUPABASE_URL
https://lccrqphxhmoeynwlkwfd.supabase.co

SUPABASE_SERVICE_KEY
<PASTE_YOUR_SERVICE_ROLE_KEY_HERE>

MQTT_BROKER
<GET_FROM_HARDWARE_TEAM>

MQTT_USERNAME
<GET_FROM_HARDWARE_TEAM>

MQTT_PASSWORD
<GET_FROM_HARDWARE_TEAM>

MQTT_TOPIC
guard/sensor/data

PORT
3001
```

#### **Where to Get Values:**

**SUPABASE_SERVICE_KEY**:
1. Go to: https://supabase.com/dashboard
2. Select project: **lccrqphxhmoeynwlkwfd**
3. Settings → API
4. Copy **`service_role`** key (the long one, NOT anon key!)

**MQTT Credentials** (from hardware team):
- `MQTT_BROKER` - HiveMQ cloud URL
- `MQTT_USERNAME` - HiveMQ username
- `MQTT_PASSWORD` - HiveMQ password

---

### **Step 5: Deploy**

1. Click **"Deploy"** or wait for auto-deploy
2. Watch the logs in real-time
3. Wait ~2-3 minutes for build to complete

You should see logs like:
```
🚀 Starting GUARD MQTT Bridge Server...
✅ Connected to MQTT broker
✅ Subscribed to topic: guard/sensor/data
📡 Waiting for MQTT messages...
```

---

### **Step 6: Get Your Service URL**

1. Go to **"Settings"** tab
2. Find **"Domains"** section
3. Click **"Generate Domain"**
4. Copy your URL: `https://guard-mqtt-bridge-production.up.railway.app`

---

### **Step 7: Test Deployment**

Visit your health endpoint:
```
https://your-app-name.up.railway.app/health
```

You should see:
```json
{
  "status": "ok",
  "service": "GUARD MQTT Bridge",
  "mqtt_connected": true,
  "uptime": 123.45,
  "timestamp": "2025-10-29T..."
}
```

✅ If `mqtt_connected: true` → Success!
❌ If `mqtt_connected: false` → Check MQTT credentials

---

## 📊 Monitor Your Service

### View Logs (Real-time)

1. Click on your service
2. Go to **"Logs"** tab
3. Watch for:
   - ✅ MQTT connection
   - 📨 Incoming messages
   - 💾 Database insertions
   - 🚨 Anomaly detections

### Check Usage

1. Go to **"Metrics"** tab
2. Monitor:
   - CPU usage
   - Memory usage
   - Network traffic

Railway shows estimated monthly cost based on usage.

---

## 🧪 Test with Hardware

Once deployed, your hardware team's ESP-01 should:

1. Publish to MQTT topic
2. Middleware receives message
3. You see in Railway logs:
   ```
   📨 Received message: {"fridge_id":"...", "voltage":220.5, "current":0.82}
   💾 Inserting to database...
   ✅ Successfully inserted
   ```
4. Check Supabase - new row in `power_readings` table!

---

## 🔧 Troubleshooting

### Problem: "MQTT connection failed"

**Check**:
1. MQTT_BROKER URL is correct
2. MQTT_USERNAME is correct
3. MQTT_PASSWORD is correct
4. HiveMQ instance is running

**Fix**:
- Update environment variables in Railway
- Redeploy (automatic)

### Problem: "Database insertion failed"

**Check**:
1. SUPABASE_SERVICE_KEY is the **service_role** key (not anon key!)
2. `fridge_id` exists in your `fridges` table
3. Database schema is updated

**Fix**:
- Verify Supabase credentials
- Check Supabase logs for errors

### Problem: "No messages received"

**Check**:
1. Hardware is publishing to correct topic
2. MQTT_TOPIC matches what ESP-01 is using
3. HiveMQ broker is working

**Fix**:
- Check Railway logs for MQTT connection status
- Test with manual MQTT publish

---

## 💰 Cost Estimate

**Railway.app free tier**:
- $5 credit/month
- This lightweight Node.js app uses ~$3-4/month
- **Should be free** for students!

If you run out of credit:
- Add a credit card (but won't charge unless you exceed)
- Or use Railway's student/education discount

---

## 🔄 Update Deployment

When you make code changes:

```bash
git add .
git commit -m "Update middleware"
git push
```

Railway will **automatically redeploy**! 🚀

---

## 📱 Share with Team

Give your hardware team:

1. **Railway service URL**: `https://your-app.railway.app`
2. **Health check**: `https://your-app.railway.app/health`
3. **MQTT topic**: `guard/sensor/data`
4. **Message format**:
   ```json
   {
     "fridge_id": "uuid-from-database",
     "voltage": 220.5,
     "current": 0.82
   }
   ```

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Railway.app account created
- [ ] Project deployed from GitHub
- [ ] Environment variables added
- [ ] Service is running (check logs)
- [ ] MQTT connected (`mqtt_connected: true`)
- [ ] Health endpoint working
- [ ] Test message sent from hardware
- [ ] Data appears in Supabase

---

## 🆘 Need Help?

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Check Logs**: Railway dashboard → Logs tab

---

**Ready to deploy?** Follow Step 1 and push your code to GitHub! 🚀
