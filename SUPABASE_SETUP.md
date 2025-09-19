# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Create a new project
5. Choose a database password
6. Wait for project to be ready

## 2. Get Supabase Credentials

1. Go to your project dashboard
2. Click on "Settings" (gear icon)
3. Go to "API" section
4. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOi...`)

## 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file with your Supabase credentials:
   ```env
   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```

## 4. Run Database Schema

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the sidebar
3. Click "New query"
4. Copy and paste the contents of `database/schema.sql`
5. Click "Run" to execute the schema
6. Verify tables are created in the "Database" section

## 5. Test Connection

1. Start your React app:
   ```bash
   npm start
   ```

2. Check browser console for any Supabase connection errors
3. If successful, you should see no error messages

## 6. Optional: Setup Authentication

Supabase provides built-in authentication. To enable:

1. Go to "Authentication" in your Supabase dashboard
2. Go to "Settings" tab
3. Configure your authentication providers
4. Update your site URL if needed

## 7. Environment Variables Explained

- `REACT_APP_SUPABASE_URL`: Your project's API URL
- `REACT_APP_SUPABASE_ANON_KEY`: Public key (safe for frontend)
- `REACT_APP_API_BASE_URL`: Your backend API URL (if using separate backend)

## 8. Security Notes

- ✅ **Safe to expose**: `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`
- ❌ **Never expose**: Service role key (only use in secure backend)
- ✅ **Row Level Security**: Enabled in schema to protect user data
- ✅ **Git ignored**: `.env` file is in `.gitignore`

## 9. Database Queries

Common queries are available in `database/queries.sql`:
- Get calendar data
- Get device statistics
- Insert IoT data
- Manage anomalies

## 10. Troubleshooting

**Connection Error:**
- Check your `.env` file has correct values
- Ensure project URL doesn't have trailing slash
- Verify anon key is copied completely

**Schema Error:**
- Ensure you're running the SQL as the project owner
- Check for syntax errors in the SQL
- Verify extensions are enabled (uuid-ossp)

**Authentication Error:**
- Check RLS policies are correctly configured
- Ensure user is authenticated before making queries

## Next Steps

1. Test the schema with sample data
2. Implement API calls in your React components
3. Set up real-time subscriptions for live data
4. Configure authentication flow