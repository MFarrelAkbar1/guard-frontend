// src/services/motorControlService.ts

// NEW: Using Supabase Edge Functions instead of Node-RED
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://lccrqphxhmoeynwlkwfd.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjY3JxcGh4aG1vZXlud2xrd2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTUwMzUsImV4cCI6MjA3MzE3MTAzNX0.F9j4gt4pkHhl4AxtxskVs7pWFv1UP2wCu8jsKfdzyDs';
const MOTOR_CONTROL_URL = `${SUPABASE_URL}/functions/v1/motor-control`;
const API_KEY = process.env.REACT_APP_MOTOR_API_KEY || 'korsletzilanomagon05';

// Legacy Node-RED support (fallback)
const NODE_RED_API_URL = process.env.REACT_APP_NODE_RED_API_URL || 'http://localhost:1880';

if (!SUPABASE_URL) {
  throw new Error('REACT_APP_SUPABASE_URL is not configured');
}

if (!SUPABASE_ANON_KEY) {
  throw new Error('REACT_APP_SUPABASE_ANON_KEY is not configured');
}

if (!API_KEY) {
  throw new Error('REACT_APP_MOTOR_API_KEY is not configured');
}

export interface MotorControlRequest {
  device_id: string;
  command: 'ON' | 'OFF';
}

export interface MotorControlResponse {
  success: boolean;
  message: string;
  device_id: string;
  command: string;
  topic: string;
  timestamp: string;
}

export interface MotorStatusResponse {
  success: boolean;
  device_id: string;
  status: string;
  last_command: string;
  last_update: string;
  timestamp: string;
}

export interface MotorControlError {
  success: false;
  error: string;
  timestamp: string;
}

/**
 * Send motor control command (ON/OFF) via Supabase Edge Function
 */
export const controlMotor = async (
  deviceId: string,
  command: 'ON' | 'OFF'
): Promise<MotorControlResponse> => {
  try {
    // Call Supabase Edge Function
    const url = MOTOR_CONTROL_URL;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, // Supabase authentication
      'apikey': SUPABASE_ANON_KEY, // Alternative Supabase auth header
      'X-API-Key': API_KEY, // Our custom API key for motor control
    };
    const body = {
      device_id: deviceId,
      state: command, // Edge Function expects 'state' not 'command'
    };

    console.log(`[Motor Control] Calling Edge Function: ${url}`);
    console.log(`[Motor Control] Device: ${deviceId}, State: ${command}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success) {
      throw new Error(data.error || 'Motor control failed');
    }

    // Transform Edge Function response to match expected format
    return {
      success: data.success,
      message: data.message,
      device_id: data.device_id,
      command: data.state, // Map 'state' back to 'command'
      topic: '/motor/control',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Motor control error:', error);
    throw error;
  }
};

/**
 * Get current motor status from Node-RED
 */
export const getMotorStatus = async (
  deviceId: string
): Promise<MotorStatusResponse> => {
  try {
    const response = await fetch(
      `${NODE_RED_API_URL}/api/motor/status?device_id=${deviceId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Get motor status error:', error);
    throw error;
  }
};

/**
 * Turn motor ON
 */
export const turnMotorOn = async (deviceId: string): Promise<MotorControlResponse> => {
  return controlMotor(deviceId, 'ON');
};

/**
 * Turn motor OFF
 */
export const turnMotorOff = async (deviceId: string): Promise<MotorControlResponse> => {
  return controlMotor(deviceId, 'OFF');
};