# Security Configuration

## ⚠️ Important: Environment Variables Required

This project requires environment variables for sensitive data like API keys and database credentials. **NEVER commit these to Git.**

## Setup Instructions

### 1. Create `.env` file

Copy the example file and fill in your actual values:

```bash
cp .env.example .env
```

### 2. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the following:
   - Project URL
   - `service_role` key (keep this secret!)
   - `anon` key (public key)

### 3. Update `.env` file

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here
FRIDGE_ID=your-fridge-uuid-here
MOTOR_CONTROL_API_KEY=your-api-key-here
```

### 4. Install python-dotenv (if using Python scripts)

```bash
pip install python-dotenv
```

## Security Best Practices

- ✅ **DO** use `.env` files for local development
- ✅ **DO** add `.env` to `.gitignore`
- ✅ **DO** use environment variables in production
- ✅ **DO** rotate keys immediately if exposed
- ❌ **NEVER** commit API keys or secrets to Git
- ❌ **NEVER** share `.env` files publicly
- ❌ **NEVER** hardcode credentials in source code

## If Keys Are Exposed

1. **Immediately rotate** all exposed keys in Supabase dashboard
2. Update your local `.env` file with new keys
3. Notify your team
4. Review Git history to remove exposed keys (use `git-filter-repo` or similar)

## Files That Use Environment Variables

- `populate-database-from-csv.py` - Database population script
- Other utility scripts in the project root

## Need Help?

If you don't have access to the Supabase credentials, contact the project administrator.
