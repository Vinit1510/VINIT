/**
 * CORTEX V3 - Method 04v2: Stochastic Guard (Trend Following)
 * Rides momentum, but auto-disables during extreme market skews.
 */
function predict(features, history) {
  const avg5 = features.movingAvg5;
  const avg10 = features.movingAvg10;
  const ratio = features.bigSmallRatio10;

  // THE GUARD: Lock out if ratio is extreme
  if (ratio < 0.4 || ratio > 0.6) {
    return {
      method: "M04v2_TREND_GUARDED",
      number: 5, size: "BIG", color: "GREEN_VIOLET",
      confidence: 0 // Locked
    };
  }

  // Trend Following Logic
  let targetSize = "BIG";
  let targetNumber = 6;
  let targetColor = "RED";
  let conf = 0;

  if (avg5 > avg10) {
    targetSize = "BIG";
    targetNumber = avg5 > 6 ? 8 : 6;
    targetColor = "RED";
    // Strong trend
    conf = (avg5 - avg10) > 1.5 ? 82 : 65;
  } else {
    targetSize = "SMALL";
    targetNumber = avg5 < 3 ? 2 : 4;
    targetColor = "RED";
    conf = (avg10 - avg5) > 1.5 ? 82 : 65;
  }

  return {
    method: "M04v2_TREND_GUARDED",
    number: targetNumber,
    size: targetSize,
    color: targetColor,
    confidence: conf
  };
}

module.exports = { predict };
