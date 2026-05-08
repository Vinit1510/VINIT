/**
 * Method 10: Ensemble Voting Engine
 * Combines ALL other methods using weighted voting.
 * Filters out dead methods (confidence=0). Dynamically weights by accuracy.
 */
function predict(features, history) {
  // Fallback — this only runs if ensemble() is not called
  const size = features.bigSmallRatio10 < 0.5 ? "BIG" : "SMALL";
  const pool = size === "BIG" ? [5, 6, 7, 8, 9] : [0, 1, 2, 3, 4];
  return { number: pool[2], size, color: "GREEN", confidence: 30, method: "ENSEMBLE" };
}

function ensemble(allResults, features, history, weights) {
  // CRITICAL FIX: Filter out dead methods (confidence === 0)
  const active = allResults.filter((r) => r.confidence > 0 && r.method !== "ENSEMBLE");

  if (active.length === 0) {
    return { number: 5, size: "BIG", color: "GREEN_VIOLET", confidence: 0, method: "ENSEMBLE" };
  }

  const sizeVotes = { BIG: 0, SMALL: 0 };
  let maxConfMethod = active[0];

  for (const r of active) {
    // WEIGHTED VOTES: Instead of counting as 1, we count as recent accuracy weight * confidence weight!
    const baseWeight = weights.get(r.method) || 1.0;
    const confWeight = r.confidence / 100;
    const voteWeight = baseWeight * confWeight;

    sizeVotes[r.size] += voteWeight;
    if (r.confidence > maxConfMethod.confidence) maxConfMethod = r;
  }

  const bigVotes = sizeVotes.BIG;
  const smallVotes = sizeVotes.SMALL;
  
  // Decide majority based on highest weighted vote power
  const majoritySize = bigVotes > smallVotes ? "BIG" : (smallVotes > bigVotes ? "SMALL" : null);

  if (!majoritySize) {
    return { number: 5, size: "BIG", color: "GREEN_VIOLET", confidence: 0, method: "ENSEMBLE(CONTRADICTION)" };
  }

  // Now that we have a valid mathematical majority, weight the numbers WITHIN that majority size
  const numWeights = {};
  for (const r of active) {
    if (r.size !== majoritySize) continue; // Ignore dissenting votes when picking the specific number
    const baseWeight = weights.get(r.method) || 1.0;
    const confWeight = r.confidence / 100;
    const w = baseWeight * confWeight;
    numWeights[r.number] = (numWeights[r.number] || 0) + w;
  }

  const numEntries = Object.entries(numWeights).sort(([, a], [, b]) => b - a);
  const finalNum = numEntries.length > 0 ? parseInt(numEntries[0][0]) : (majoritySize === "BIG" ? 7 : 2);
  const finalSize = finalNum >= 5 ? "BIG" : "SMALL";

  // Confidence calculation (normalized vote strength)
  const totalVotesPower = bigVotes + smallVotes;
  const voteStrength = totalVotesPower > 0 ? Math.max(bigVotes, smallVotes) / totalVotesPower : 0.5;

  // Consensus Optimization: Focus weighted confidence only on the winning majority side!
  const winningActive = active.filter((r) => r.size === majoritySize);
  const weightedConf = winningActive.length > 0
    ? winningActive.reduce((sum, r) => sum + r.confidence * (weights.get(r.method) || 1), 0)
      / winningActive.reduce((sum, r) => sum + (weights.get(r.method) || 1), 0)
    : 35;
    
  // Base confidence calculation
  let confidence = Math.round(weightedConf * 0.6 + voteStrength * 40);

  // CONSENSUS ACCELERATOR: Boost confidence aggressively when models strongly agree!
  if (voteStrength >= 0.85) {
    confidence = Math.round(confidence * 1.35); // 35% boost for extreme consensus
  } else if (voteStrength >= 0.75) {
    confidence = Math.round(confidence * 1.20); // 20% boost for high consensus
  } else if (voteStrength >= 0.65) {
    confidence = Math.round(confidence * 1.10); // 10% boost for moderate consensus
  }

  // Cap between 10% and 95%
  confidence = Math.max(10, Math.min(95, confidence));

  let color = "GREEN";
  if (finalNum === 0) color = "RED_VIOLET";
  else if (finalNum === 5) color = "GREEN_VIOLET";
  else if ([2, 4, 6, 8].includes(finalNum)) color = "RED";

  return {
    number: finalNum, size: finalSize, color, confidence,
    method: `ENSEMBLE(${maxConfMethod.method})`,
  };
}

module.exports = { predict, ensemble };
