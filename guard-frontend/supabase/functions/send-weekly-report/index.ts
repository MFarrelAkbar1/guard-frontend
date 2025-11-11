// Supabase Edge Function for sending weekly reports via email
// Uses Resend API for email delivery (free tier: 100 emails/day)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request data
    const formData = await req.formData()
    const to = formData.get('to') as string
    const subject = formData.get('subject') as string
    const body = formData.get('body') as string
    const pdfFile = formData.get('attachment') as File | null

    // Validate inputs
    if (!to || !subject || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare email payload
    const emailPayload: any = {
      from: 'GUARD System <onboarding@resend.dev>', // Use your verified domain or resend's default
      to: [to],
      subject: subject,
      text: body,
      html: body.replace(/\n/g, '<br>')
    }

    // Add PDF attachment if present
    if (pdfFile) {
      const pdfBuffer = await pdfFile.arrayBuffer()
      const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)))

      emailPayload.attachments = [{
        filename: 'GUARD_Weekly_Report.pdf',
        content: pdfBase64,
        content_type: 'application/pdf'
      }]
    }

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Resend API error:', data)
      return new Response(
        JSON.stringify({ error: data.message || 'Failed to send email', details: data }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Success
    return new Response(
      JSON.stringify({
        success: true,
        message: `Email sent successfully to ${to}`,
        emailId: data.id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in send-weekly-report function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
