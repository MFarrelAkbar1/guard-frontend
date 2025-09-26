# Email Configuration Guide

This guide explains how to enable email functionality in your GUARD application.

## Current Status
- ✅ Frontend email UI is implemented
- ✅ Development mode shows mock email functionality
- ⚠️ Production email requires SMTP configuration

## Option 1: Configure Supabase SMTP (Recommended)

### Step 1: Access Supabase Dashboard
1. Go to https://lccrqphxhmoeynwlkwfd.supabase.co
2. Navigate to **Settings** → **Auth** → **SMTP Settings**

### Step 2: Configure SMTP Provider
Choose one of these providers:

#### Gmail SMTP
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Pass: your-app-password (not your regular password)
```

#### SendGrid SMTP
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: your-sendgrid-api-key
```

#### Mailgun SMTP
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: your-mailgun-username
SMTP Pass: your-mailgun-password
```

### Step 3: Configure Email Templates
In Supabase Auth settings, customize:
- **Confirm signup** template
- **Reset password** template
- **Magic link** template

## Option 2: Custom Backend API (Alternative)

If you prefer to handle emails through your own backend:

### Step 1: Create Backend Endpoint
Create an endpoint at `http://localhost:3001/api/send-test-email`

Example using Node.js + Express + Nodemailer:

```javascript
// backend/routes/email.js
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configure your email transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail', // or your preferred service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/send-test-email', async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: message
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

### Step 2: Add Environment Variables
Add to your backend `.env`:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Option 3: Supabase Edge Functions

Create a Supabase Edge Function for email handling:

```sql
-- Create the function
create or replace function send_notification_email(
  recipient_email text,
  email_subject text,
  email_body text
)
returns void
language plpgsql
security definer
as $$
begin
  -- This would integrate with your email service
  -- Implementation depends on your chosen email provider
end;
$$;
```

## Testing Email Functionality

### Development Mode
- Click "Send Test Email" in Settings
- You'll see a mock success message
- Check browser console for log messages

### Production Mode
- Configure SMTP as described above
- Test with "Send Test Email" button
- Check email inbox for actual delivery

## Email Notification Types

The GUARD system supports these email notifications:

1. **Anomaly Alerts** - Sent when power anomalies are detected
2. **Power Threshold Warnings** - Sent when consumption exceeds limits
3. **Weekly Reports** - Summary of energy usage and anomalies
4. **System Updates** - Maintenance and update notifications

## Troubleshooting

### Common Issues

1. **Gmail "Less secure apps" error**
   - Use App Passwords instead of regular password
   - Enable 2FA and generate App Password

2. **SendGrid authentication failed**
   - Verify API key is correct
   - Check SendGrid domain authentication

3. **Emails going to spam**
   - Configure SPF, DKIM, and DMARC records
   - Use a verified domain

### Testing Commands

```bash
# Test email service connectivity
curl -X POST http://localhost:3001/api/send-test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","message":"Hello"}'
```

## Security Notes

- Never expose SMTP credentials in frontend code
- Use environment variables for sensitive data
- Consider using API keys instead of passwords
- Implement rate limiting for email endpoints
- Validate email addresses before sending

## Next Steps

1. Choose your preferred email solution (Supabase SMTP recommended)
2. Configure credentials and test
3. Customize email templates
4. Set up monitoring for email delivery
5. Implement email analytics if needed