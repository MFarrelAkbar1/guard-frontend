// src/services/motorControlService.ts

const NODE_RED_API_URL = process.env.REACT_APP_NODE_RED_API_URL;
const API_KEY = process.env.REACT_APP_MOTOR_API_KEY;

if (!NODE_RED_API_URL) {
  throw new Error('REACT_APP_NODE_RED_API_URL is not configured');
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
 * Send motor control command (ON/OFF) via Node-RED API
 */
export const controlMotor = async (
  deviceId: string,
  command: 'ON' | 'OFF'
): Promise<MotorControlResponse> => {
  try {
    const response = await fetch(`${NODE_RED_API_URL}/api/motor/control`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        device_id: deviceId,
        command: command,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success) {
      throw new Error(data.error || 'Motor control failed');
    }

    return data;
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