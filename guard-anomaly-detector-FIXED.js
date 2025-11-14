// ========================================
// GUARD V1 - FIXED Anomaly Detection Algorithm
// Real-time implementation for Node-RED
// FIXES:
// 1. Spike detection BEFORE phase change (175% MAE threshold)
// 2. Phase duration lower threshold (< 0.5x expected)
// 3. MAE thresholds use 99.9th percentile (was 95th)
// 4. Transition buffer correctly skips MAE check and EMA update
// ========================================

// Initialize global context for persistent state (per device)
const data = msg.payload;
const deviceId = data.device_id || "blackpill-01";

// Get or initialize state for this device
const allStates = global.get('guardStates') || {};
const guardState = allStates[deviceId] || {
    deviceId: deviceId,
    bootstrapCompleted: false,
    dataCount: 0,
    bootstrapSize: 60,
    emaAlpha: 0.2,
    bufferFactor: 0.1,

    // Spike detection config
    spikeMAEMultiplier: 1.75,  // 175% of MAE threshold

    // Duration thresholds
    durationLowerMultiplier: 0.5,  // 50% of expected (too short)
    durationUpperMultiplier: 1.5,  // 150% of expected (too long)

    autoThreshold: 0,
    bufferZone: 0,

    currentPhase: 'idle',
    phaseStartTime: Date.now(),
    lastPhaseChangeTime: Date.now(),
    lastPhaseChangeIndex: -10,  // Track by index instead of time

    emaPowerCooling: 0,
    emaPowerIdle: 0,
    emaTimeCooling: 600000,  // milliseconds
    emaTimeIdle: 900000,

    maeThresholdCooling: 3.0,
    maeThresholdIdle: 2.0,

    bootstrapPowers: [],

    totalAnomalies: 0,
    totalSpikes: 0,
    phaseChanges: 0
};

// Parse incoming data
const voltage = parseFloat(data.voltage);
const current = parseFloat(data.current);
const powerConsumption = voltage * current;
const timestamp = data.timestamp || new Date().toISOString();

// Helper functions
function calculateMean(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

function calculatePercentile(arr, percentile) {
    if (arr.length === 0) return 0;
    const sorted = arr.slice().sort((a, b) => a - b);
    const index = Math.floor((percentile / 100) * (sorted.length - 1));
    return sorted[index];
}

function updateEMA(currentValue, previousEMA, alpha) {
    if (previousEMA === 0) return currentValue;
    return alpha * currentValue + (1 - alpha) * previousEMA;
}

function calculateMAE(currentValue, referenceValue) {
    return Math.abs(currentValue - referenceValue);
}

// ========================================
// BOOTSTRAP PHASE
// ========================================

if (!guardState.bootstrapCompleted) {
    guardState.bootstrapPowers.push(powerConsumption);
    guardState.dataCount++;

    if (guardState.bootstrapPowers.length >= guardState.bootstrapSize) {
        guardState.autoThreshold = calculateMean(guardState.bootstrapPowers);
        guardState.bufferZone = guardState.bufferFactor * guardState.autoThreshold;

        const coolingPowers = guardState.bootstrapPowers.filter(p => p >= guardState.autoThreshold);
        const idlePowers = guardState.bootstrapPowers.filter(p => p < guardState.autoThreshold);

        if (coolingPowers.length > 0) {
            guardState.emaPowerCooling = calculateMean(coolingPowers);
            const coolingMAEs = coolingPowers.map(p => Math.abs(p - guardState.emaPowerCooling));
            // FIXED: Use 99.9th percentile instead of 95th
            guardState.maeThresholdCooling = calculatePercentile(coolingMAEs, 99.9);
        }

        if (idlePowers.length > 0) {
            guardState.emaPowerIdle = calculateMean(idlePowers);
            const idleMAEs = idlePowers.map(p => Math.abs(p - guardState.emaPowerIdle));
            // FIXED: Use 99.9th percentile instead of 95th
            guardState.maeThresholdIdle = calculatePercentile(idleMAEs, 99.9);
        }

        guardState.currentPhase = powerConsumption >= guardState.autoThreshold ? 'cooling' : 'idle';
        guardState.phaseStartTime = Date.now();
        guardState.lastPhaseChangeIndex = guardState.dataCount;
        guardState.bootstrapCompleted = true;

        node.warn(`✅ [${deviceId}] Bootstrap complete! Threshold: ${guardState.autoThreshold.toFixed(1)}W (±${guardState.bufferZone.toFixed(1)}W)`);
        node.warn(`   Cooling EMA: ${guardState.emaPowerCooling.toFixed(1)}W | MAE threshold: ${guardState.maeThresholdCooling.toFixed(3)}W`);
        node.warn(`   Idle EMA: ${guardState.emaPowerIdle.toFixed(1)}W | MAE threshold: ${guardState.maeThresholdIdle.toFixed(3)}W`);
    }

    msg.anomalyDetection = {
        isAnomaly: false,
        type: null,
        bootstrapProgress: `${guardState.dataCount}/${guardState.bootstrapSize}`,
        bootstrapCompleted: guardState.bootstrapCompleted
    };

    allStates[deviceId] = guardState;
    global.set('guardStates', allStates);
    return msg;
}

// ========================================
// REAL-TIME ANOMALY DETECTION
// ========================================

// Get reference EMA and MAE threshold for CURRENT phase (before any changes)
const referenceEMA = guardState.currentPhase === 'cooling'
    ? guardState.emaPowerCooling
    : guardState.emaPowerIdle;

const maeThreshold = guardState.currentPhase === 'cooling'
    ? guardState.maeThresholdCooling
    : guardState.maeThresholdIdle;

const maeValue = calculateMAE(powerConsumption, referenceEMA);

// ========================================
// STEP 1: SPIKE DETECTION (BEFORE PHASE CHANGE)
// ========================================

const spikeThreshold = guardState.spikeMAEMultiplier * maeThreshold;
const isSpike = maeValue > spikeThreshold;

if (isSpike) {
    guardState.totalSpikes++;
    guardState.totalAnomalies++;

    node.warn(`⚡ [${deviceId}] SPIKE ANOMALY DETECTED!`);
    node.warn(`   Power: ${powerConsumption.toFixed(2)}W | Expected: ${referenceEMA.toFixed(2)}W`);
    node.warn(`   MAE: ${maeValue.toFixed(2)}W | Spike threshold: ${spikeThreshold.toFixed(2)}W`);
    node.warn(`   Ratio: ${(powerConsumption / referenceEMA).toFixed(2)}x | Phase: ${guardState.currentPhase}`);

    msg.anomalyDetection = {
        isAnomaly: true,
        type: 'power_spike',
        severity: 'critical',
        phase: guardState.currentPhase,
        maeValue: parseFloat(maeValue.toFixed(3)),
        maeThreshold: parseFloat(maeThreshold.toFixed(3)),
        spikeThreshold: parseFloat(spikeThreshold.toFixed(3)),
        referenceEMA: parseFloat(referenceEMA.toFixed(2)),
        autoThreshold: parseFloat(guardState.autoThreshold.toFixed(2)),
        spikeRatio: parseFloat((powerConsumption / referenceEMA).toFixed(2)),
        statistics: {
            totalDataPoints: guardState.dataCount,
            totalAnomalies: guardState.totalAnomalies,
            totalSpikes: guardState.totalSpikes,
            phaseChanges: guardState.phaseChanges,
            anomalyRate: ((guardState.totalAnomalies / guardState.dataCount) * 100).toFixed(2) + '%'
        }
    };

    msg.rawPowerData = {
        voltage: voltage,
        current: current,
        power: parseFloat(powerConsumption.toFixed(2)),
        ssr_state: data.ssr_state,
        timestamp: timestamp,
        deviceId: deviceId
    };

    guardState.dataCount++;
    allStates[deviceId] = guardState;
    global.set('guardStates', allStates);

    // Return early - skip phase change and EMA update
    return msg;
}

// ========================================
// STEP 2: PHASE CHANGE DETECTION
// ========================================

const upperBound = guardState.autoThreshold + guardState.bufferZone;
const lowerBound = guardState.autoThreshold - guardState.bufferZone;
let phaseChanged = false;
let newPhase = guardState.currentPhase;

if (guardState.currentPhase === 'idle' && powerConsumption > upperBound) {
    newPhase = 'cooling';
    phaseChanged = true;
} else if (guardState.currentPhase === 'cooling' && powerConsumption < lowerBound) {
    newPhase = 'idle';
    phaseChanged = true;
}

// Duration anomaly flags
let phaseTooShort = false;
let phaseTooLong = false;

if (phaseChanged) {
    const phaseDuration = Date.now() - guardState.phaseStartTime;

    // Get expected duration for completed phase
    const expectedDuration = guardState.currentPhase === 'cooling'
        ? guardState.emaTimeCooling
        : guardState.emaTimeIdle;

    // FIXED: Check if phase was too SHORT (NEW!)
    const lowerDurationThreshold = guardState.durationLowerMultiplier * expectedDuration;
    phaseTooShort = phaseDuration < lowerDurationThreshold;

    // Check if phase was too LONG (existing)
    const upperDurationThreshold = guardState.durationUpperMultiplier * expectedDuration;
    phaseTooLong = phaseDuration > upperDurationThreshold;

    if (phaseTooShort) {
        guardState.totalAnomalies++;
        node.warn(`⚠️ [${deviceId}] PHASE TOO SHORT!`);
        node.warn(`   Phase: ${guardState.currentPhase} | Duration: ${(phaseDuration/60000).toFixed(1)} min`);
        node.warn(`   Expected: ${(expectedDuration/60000).toFixed(1)} min | Threshold: >${(lowerDurationThreshold/60000).toFixed(1)} min`);
    }

    if (phaseTooLong) {
        guardState.totalAnomalies++;
        node.warn(`⚠️ [${deviceId}] PHASE TOO LONG!`);
        node.warn(`   Phase: ${guardState.currentPhase} | Duration: ${(phaseDuration/60000).toFixed(1)} min`);
        node.warn(`   Expected: ${(expectedDuration/60000).toFixed(1)} min | Threshold: <${(upperDurationThreshold/60000).toFixed(1)} min`);
    }

    // Update EMA for completed phase duration
    if (guardState.currentPhase === 'cooling') {
        guardState.emaTimeCooling = updateEMA(phaseDuration, guardState.emaTimeCooling, guardState.emaAlpha);
    } else {
        guardState.emaTimeIdle = updateEMA(phaseDuration, guardState.emaTimeIdle, guardState.emaAlpha);
    }

    node.warn(`🔄 [${deviceId}] Phase change: ${guardState.currentPhase} → ${newPhase} (${(phaseDuration/60000).toFixed(1)} min)`);

    // Update to new phase
    guardState.currentPhase = newPhase;
    guardState.phaseStartTime = Date.now();
    guardState.lastPhaseChangeTime = Date.now();
    guardState.lastPhaseChangeIndex = guardState.dataCount;
    guardState.phaseChanges++;
}

// ========================================
// STEP 3: MAE ANOMALY DETECTION
// ========================================

// Check transition buffer (1 data point after phase change)
const pointsSincePhaseChange = guardState.dataCount - guardState.lastPhaseChangeIndex;
const inTransitionBuffer = pointsSincePhaseChange <= 1;

// MAE anomaly detection (skip if in transition buffer)
const isMaeAnomaly = !inTransitionBuffer && maeValue > maeThreshold;

if (isMaeAnomaly) {
    guardState.totalAnomalies++;
    node.warn(`⚠️ [${deviceId}] MAE ANOMALY DETECTED!`);
    node.warn(`   Power: ${powerConsumption.toFixed(1)}W | EMA: ${referenceEMA.toFixed(1)}W | MAE: ${maeValue.toFixed(2)}W`);
    node.warn(`   Phase: ${guardState.currentPhase} | Threshold: ${maeThreshold.toFixed(3)}W`);
}

// ========================================
// STEP 4: DURATION ANOMALY DETECTION (CURRENT PHASE)
// ========================================

const currentPhaseDuration = Date.now() - guardState.phaseStartTime;
const currentExpectedDuration = guardState.currentPhase === 'cooling'
    ? guardState.emaTimeCooling
    : guardState.emaTimeIdle;

const currentDurationThreshold = guardState.durationUpperMultiplier * currentExpectedDuration;
const isCurrentPhaseTooLong = currentPhaseDuration > currentDurationThreshold;

if (isCurrentPhaseTooLong) {
    guardState.totalAnomalies++;
    node.warn(`⚠️ [${deviceId}] CURRENT PHASE TOO LONG!`);
    node.warn(`   Phase: ${guardState.currentPhase} | Duration: ${(currentPhaseDuration/60000).toFixed(1)} min`);
    node.warn(`   Expected: ${(currentExpectedDuration/60000).toFixed(1)} min`);
}

// ========================================
// STEP 5: UPDATE EMA (SKIP IF ANOMALY OR TRANSITION BUFFER)
// ========================================

if (!isMaeAnomaly && !inTransitionBuffer) {
    if (guardState.currentPhase === 'cooling') {
        guardState.emaPowerCooling = updateEMA(powerConsumption, guardState.emaPowerCooling, guardState.emaAlpha);
    } else {
        guardState.emaPowerIdle = updateEMA(powerConsumption, guardState.emaPowerIdle, guardState.emaAlpha);
    }
}

// ========================================
// DETERMINE OVERALL ANOMALY TYPE AND SEVERITY
// ========================================

let anomalyType = null;
let anomalySeverity = 'normal';

if (phaseTooShort) {
    anomalyType = 'phase_too_short';
    anomalySeverity = 'warning';
} else if (phaseTooLong) {
    anomalyType = 'phase_too_long';
    anomalySeverity = 'warning';
} else if (isMaeAnomaly && isCurrentPhaseTooLong) {
    anomalyType = 'critical_combined';
    anomalySeverity = 'critical';
} else if (isMaeAnomaly) {
    anomalyType = 'power_deviation';
    anomalySeverity = 'warning';
} else if (isCurrentPhaseTooLong) {
    anomalyType = 'duration_exceeded';
    anomalySeverity = 'warning';
}

// ========================================
// PREPARE OUTPUT MESSAGE
// ========================================

msg.anomalyDetection = {
    isAnomaly: anomalyType !== null,
    type: anomalyType,
    severity: anomalySeverity,
    phase: guardState.currentPhase,
    maeValue: parseFloat(maeValue.toFixed(3)),
    maeThreshold: parseFloat(maeThreshold.toFixed(3)),
    phaseDuration: Math.floor(currentPhaseDuration / 60000),
    expectedDuration: Math.floor(currentExpectedDuration / 60000),
    referenceEMA: parseFloat(referenceEMA.toFixed(2)),
    autoThreshold: parseFloat(guardState.autoThreshold.toFixed(2)),
    inTransitionBuffer: inTransitionBuffer,
    statistics: {
        totalDataPoints: guardState.dataCount,
        totalAnomalies: guardState.totalAnomalies,
        totalSpikes: guardState.totalSpikes,
        phaseChanges: guardState.phaseChanges,
        anomalyRate: ((guardState.totalAnomalies / guardState.dataCount) * 100).toFixed(2) + '%'
    }
};

msg.rawPowerData = {
    voltage: voltage,
    current: current,
    power: parseFloat(powerConsumption.toFixed(2)),
    ssr_state: data.ssr_state,
    timestamp: timestamp,
    deviceId: deviceId
};

guardState.dataCount++;
allStates[deviceId] = guardState;
global.set('guardStates', allStates);

return msg;
