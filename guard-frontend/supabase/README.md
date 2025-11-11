# Supabase Edge Functions

This directory contains Supabase Edge Functions for the GUARD application.

## Functions

### send-weekly-report

Sends weekly energy reports via email using Resend API.

**Endpoint**: `https://lccrqphxhmoeynwlkwfd.supabase.co/functions/v1/send-weekly-report`

**Method**: POST

**Body** (FormData):
- `to` - Email recipient
- `subject` - Email subject
- `body` - Email body (plain text)
- `attachment` - PDF file (optional)

## Deployment

Deploy the function using Supabase CLI:

```bash
# Set access token
export SUPABASE_ACCESS_TOKEN=your_token_here

# Deploy function
npx supabase functions deploy send-weekly-report --project-ref lccrqphxhmoeynwlkwfd
```

## Environment Variables

Required secrets (set in Supabase dashboard or CLI):

```bash
npx supabase secrets set RESEND_API_KEY=your_resend_api_key
```

## Local Development

To test the function locally:

```bash
# Start local Supabase
npx supabase start

# Serve function locally
npx supabase functions serve send-weekly-report --env-file .env.local

# Test with curl
curl -X POST http://localhost:54321/functions/v1/send-weekly-report \
  -F "to=test@example.com" \
  -F "subject=Test Email" \
  -F "body=This is a test email"
```

## Files

- `config.toml` - Supabase project configuration
- `functions/send-weekly-report/` - Weekly report email function
- `functions/_shared/` - Shared utilities and types

## Notes

- The function uses Resend API for email delivery (100 emails/day on free tier)
- JWT verification is disabled for this function (verify_jwt = false)
- The function handles both plain text emails and emails with PDF attachments
