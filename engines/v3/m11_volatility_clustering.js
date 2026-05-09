/**
 * CORTEX V3 - Method 11: Volatility Clustering
 * Detects psychological floors in clusters and chop patterns.
 */
function predict(features, history) {
  const streakLen = features.currentStreakLen;
  const streakDir = features.currentStreakDir;
  
  if (streakLen === 0 || streakDir === "NONE") return { confidence: 0 };

  let targetSize = streakDir;
  let targetNumber = targetSize === "BIG" ? 9 : 0;
  let targetColor = targetSize === "BIG" ? "GREEN" : "RED_VIOLET";
  let conf = 0;

  if (streakLen === 1 || streakLen === 2) {
    // Chop zone danger - severely lowered confidence
    conf = 20;
    targetSize = streakDir === "BIG" ? "SMALL" : "BIG"; // Expect a flip
    targetNumber = targetSize === "BIG" ? 7 : 2;
  } else if (streakLen >= 3 && streakLen <= 5) {
    // Psychological floor established, ride the cluster
    conf = 65;
    targetSize = streakDir;
    targetNumber = streakDir === "BIG" ? 8 : 1; 
  } else {
    // Overextended, prepare for break
    conf = 45;
    targetSize = streakDir === "BIG" ? "SMALL" : "BIG";
    targetNumber = targetSize === "BIG" ? 6 : 4;
  }

  return {
    method: "M11_VOL_CLUSTER",
    number: targetNumber,
    size: targetSize,
    color: targetColor, 
    confidence: conf
  };
}

module.exports = { predict };
