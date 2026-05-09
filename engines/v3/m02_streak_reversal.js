/**
 * CORTEX V3 - Method 02v2: Exponential Reversal
 * Triggers massive confidence when the 10-round ratio hits extremes.
 */
function predict(features, history) {
  const ratio = features.bigSmallRatio10;
  
  let targetSize = "BIG";
  let targetNumber = 5;
  let targetColor = "GREEN_VIOLET";
  let conf = 0;

  // Extreme Small Imbalance (Force BIG)
  if (ratio <= 0.3) {
    targetSize = "BIG";
    targetNumber = ratio <= 0.2 ? 8 : 7; // 8 for max emergency, 7 for standard reversal
    targetColor = targetNumber === 8 ? "RED" : "GREEN";
    conf = ratio <= 0.2 ? 95 : 85; 
  }
  // Extreme Big Imbalance (Force SMALL)
  else if (ratio >= 0.7) {
    targetSize = "SMALL";
    targetNumber = ratio >= 0.8 ? 2 : 3; 
    targetColor = targetNumber === 2 ? "RED" : "GREEN";
    conf = ratio >= 0.8 ? 95 : 85;
  }
  else {
    // Normal market, low confidence
    conf = 20;
    targetSize = ratio > 0.5 ? "SMALL" : "BIG";
  }

  return {
    method: "M02v2_EXP_REVERSAL",
    number: targetNumber,
    size: targetSize,
    color: targetColor,
    confidence: conf
  };
}

module.exports = { predict };
