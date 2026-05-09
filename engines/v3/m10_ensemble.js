/**
 * CORTEX V3 - Method 10v2: Master State Controller (Fused with Consensus Accelerator)
 * Evaluates all sub-methods as a dynamic state machine and applies consensus scaling.
 */
function predict() { 
  return { number: 5, size: "BIG", color: "GREEN_VIOLET", confidence: 0, method: "ENSEMBLE" }; 
}

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

  // Find the highest confidence based on current state
  for (const r of allResults) {
    if (r.confidence === 0 || r.method === "ENSEMBLE") continue;
    
    let adjustedConf = r.confidence;

    if (activeMode === "EMERGENCY_REVERSAL" && r.method === "M02v2_EXP_REVERSAL") {
      adjustedConf *= 1.5; // Boost Reversal
    } else if (activeMode === "TREND_RIDING" && r.method === "M04v2_TREND_GUARDED") {
      adjustedConf *= 1.2; // Boost Trend
    } else if (activeMode === "CLUSTER_MOMENTUM" && r.method === "M11_VOL_CLUSTER") {
      adjustedConf *= 1.3; // Boost Clustering
    }

    if (adjustedConf > maxConf) {
      maxConf = adjustedConf;
      finalSize = r.size;
      finalNum = r.number;
      finalColor = r.color;
      winningMethod = r.method;
    }
  }

  // CONSENSUS ACCELERATOR: Boost confidence further when models strongly agree on the winning size!
  const active = allResults.filter((r) => r.confidence > 0 && r.method !== "ENSEMBLE");
  const sizeVotes = { BIG: 0, SMALL: 0 };
  
  for (const r of active) {
    const baseWeight = weights.get(r.method) || 1.0;
    const confWeight = r.confidence / 100;
    sizeVotes[r.size] += baseWeight * confWeight;
  }
  
  const bigVotes = sizeVotes.BIG;
  const smallVotes = sizeVotes.SMALL;
  const totalVotesPower = bigVotes + smallVotes;
  const voteStrength = totalVotesPower > 0 ? Math.max(bigVotes, smallVotes) / totalVotesPower : 0.5;

  if (voteStrength >= 0.85) {
    maxConf = Math.round(maxConf * 1.35); // 35% boost for extreme consensus
  } else if (voteStrength >= 0.75) {
    maxConf = Math.round(maxConf * 1.20); // 20% boost for high consensus
  } else if (voteStrength >= 0.65) {
    maxConf = Math.round(maxConf * 1.10); // 10% boost for moderate consensus
  }

  // Cap confidence at 99
  maxConf = Math.max(10, Math.min(99, Math.round(maxConf)));

  return {
    number: finalNum,
    size: finalSize,
    color: finalColor,
    confidence: maxConf,
    method: `CTRL[${activeMode}]->${winningMethod}`
  };
}

module.exports = { predict, ensemble };
