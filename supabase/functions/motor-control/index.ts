// Supabase Edge Function: Motor Control
// Replaces Node-RED motor control API
// Receives motor commands from React and publishes to MQTT

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import mqtt from "npm:mqtt@5.3.5"

// TEMPORARY: Using HiveMQ because test.mosquitto.org is DOWN (connack timeout)
// TODO: Switch back to mosquitto when hardware team confirms it's working
// FIXED: Changed to TCP to match Node-RED connection (was WebSocket before)
const MQTT_BROKER = "mqtt://broker.hivemq.com:1883"

// ORIGINAL mosquitto config (restore this when mosquitto is back up):
// const MQTT_BROKER = "mqtt://test.mosquitto.org:1883" // TCP (matches Node-RED)
// const MQTT_BROKER = "ws://test.mosquitto.org:8080" // WebSocket (doesn't work with Node-RED TCP)

const MQTT_TOPIC = "/motor/control"
const API_KEY = "korsletzilanomagon05"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate API key
    const apiKey = req.headers.get('X-API-Key')
    if (apiKey !== API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    const { device_id, state } = await req.json()

    if (!device_id || !state) {
      return new Response(
        JSON.stringify({ error: 'Missing device_id or state' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!['ON', 'OFF'].includes(state)) {
      return new Response(
        JSON.stringify({ error: 'State must be ON or OFF' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`[Motor Control] ${device_id}: ${state}`)

    // Connect to MQTT broker via TCP (matches Node-RED connection)
    const client = mqtt.connect(MQTT_BROKER, {
      clientId: `edge_function_${Date.now()}`,
      clean: true,
      connectTimeout: 10000, // 10 seconds
      reconnectPeriod: 0, // Don't reconnect
    })

    // Wait for connection
    await new Promise((resolve, reject) => {
      client.on('connect', () => {
        console.log('Connected to MQTT broker via TCP')
        resolve(true)
      })
      client.on('error', (err) => {
        console.error('MQTT connection error:', err)
        reject(err)
      })
      setTimeout(() => reject(new Error('Connection timeout after 10s')), 10000)
    })

    // Publish motor command repeatedly for 5 seconds (reliability)
    const message = `motor=${state}`
    let publishCount = 0

    // Publish every 500ms for 5 seconds (10 times total)
    const publishInterval = setInterval(() => {
      client.publish(MQTT_TOPIC, message, { qos: 0 })
      publishCount++
      console.log(`Published ${publishCount}/10: ${message}`)
    }, 500)

    // Stop after 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5000))
    clearInterval(publishInterval)

    console.log(`✅ Finished: Sent ${publishCount} messages to ${MQTT_TOPIC}`)

    // Disconnect
    client.end()

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        device_id,
        state,
        message: `Motor command sent: ${state}`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
