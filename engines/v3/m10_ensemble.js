/**
 * CORTEX V3 - Method 10v2: Master State Controller & Consensus Accelerator
 * Evaluates all sub-methods and acts as a dynamic state machine.
 */
function predict() { return { confidence: 0 }; } // Dummy for loader

function ensemble(allResults, features, history, weights) {
  const ratio = features.bigSmallRatio10;
  let activeMode = "TREND_RIDING";

  // State Machine Definitions
  if (ratio <= 0.3 || ratio >= 0.7) {
    activeMode = "EMERGENCY_REVERSAL";
  } else if (features.currentStreakLen >= 3) {
     activeMode = "CLUSTER_MOMENTUM";
  }

  let finalSize = "BIG";
  let finalNum = 5;
  let finalColor = "GREEN_VIOLET";
  let maxConf = 0;
  let winningMethod = "UNKNOWN";

  // Step 1: Find the Dominant Base Strategy based on Active Mode
  for (const r of allResults) {
    let adjustedConf = r.confidence;

    // Tamed base multipliers slightly to avoid fake high confidence
    if (activeMode === "EMERGENCY_REVERSAL" && r.method === "M02v2_EXP_REVERSAL") {
      adjustedConf *= 1.3; 
    } else if (activeMode === "TREND_RIDING" && r.method === "M04v2_TREND_GUARDED") {
      adjustedConf *= 1.1; 
    } else if (activeMode === "CLUSTER_MOMENTUM" && r.method === "M11_VOL_CLUSTER") {
      adjustedConf *= 1.2; 
    }

    if (adjustedConf > maxConf) {
      maxConf = adjustedConf;
      finalSize = r.size;
      finalNum = r.number;
      finalColor = r.color;
      winningMethod = r.method;
    }
  }

  // Step 2: The Consensus Accelerator
  let agreementCount = 0;
  for (const r of allResults) {
    if (r.confidence > 0 && r.method !== winningMethod) {
       if (r.size === finalSize) {
           agreementCount++;
       }
    }
  }

  // Tamed Consensus Multiplier (Protects against 90% failure rates)
  let consensusBoost = 1.0;
  if (agreementCount === 1) consensusBoost = 1.05; // 5% boost
  if (agreementCount === 2) consensusBoost = 1.15; // 15% boost
  if (agreementCount >= 3) consensusBoost = 1.25; // 25% boost maximum

  maxConf *= consensusBoost;

  // Hard Cap confidence at 95 to account for casino variance
  maxConf = Math.min(95, Math.round(maxConf));

  return {
    number: finalNum,
    size: finalSize,
    color: finalColor,
    confidence: maxConf,
    method: `CTRL[${activeMode}]->${winningMethod}`
  };
}

module.exports = { predict, ensemble };
