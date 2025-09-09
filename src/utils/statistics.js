// Statistical analysis utility functions for strategy comparison

// Calculate standard deviation
export const calculateStdDev = (scores) => {
  if (!scores || scores.length === 0) return 0;
  
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  return Math.sqrt(variance);
};

// Calculate percentiles
export const calculatePercentiles = (scores, percentiles = [25, 50, 75, 90, 95, 99]) => {
  if (!scores || scores.length === 0) return {};
  
  const sorted = [...scores].sort((a, b) => a - b);
  const result = {};
  
  percentiles.forEach(p => {
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    result[p] = sorted[Math.max(0, index)];
  });
  
  return result;
};

// Simple t-test for comparing two score arrays (returns approximate p-value)
export const calculatePValue = (scores1, scores2) => {
  if (!scores1 || !scores2 || scores1.length === 0 || scores2.length === 0) return 1;
  
  const mean1 = scores1.reduce((sum, score) => sum + score, 0) / scores1.length;
  const mean2 = scores2.reduce((sum, score) => sum + score, 0) / scores2.length;
  
  const std1 = calculateStdDev(scores1);
  const std2 = calculateStdDev(scores2);
  
  if (std1 === 0 && std2 === 0) return mean1 === mean2 ? 1 : 0;
  
  const pooledStd = Math.sqrt(((scores1.length - 1) * std1 * std1 + (scores2.length - 1) * std2 * std2) / (scores1.length + scores2.length - 2));
  const tStat = Math.abs(mean1 - mean2) / (pooledStd * Math.sqrt(1 / scores1.length + 1 / scores2.length));
  
  // Rough approximation for p-value based on t-statistic
  if (tStat < 1) return 0.3;
  if (tStat < 2) return 0.05;
  if (tStat < 3) return 0.01;
  return 0.001;
};

// Calculate Cohen's d effect size
export const calculateEffectSize = (scores1, scores2) => {
  if (!scores1 || !scores2 || scores1.length === 0 || scores2.length === 0) return 0;
  
  const mean1 = scores1.reduce((sum, score) => sum + score, 0) / scores1.length;
  const mean2 = scores2.reduce((sum, score) => sum + score, 0) / scores2.length;
  
  const std1 = calculateStdDev(scores1);
  const std2 = calculateStdDev(scores2);
  
  const pooledStd = Math.sqrt((std1 * std1 + std2 * std2) / 2);
  
  if (pooledStd === 0) return 0;
  
  return Math.abs(mean1 - mean2) / pooledStd;
};

// Update strategy statistics with new run data
export const updateStrategyStats = (currentStats, newRunData) => {
  const { score, deadEnds, piecesPlaced, executionTime, positionFailures, validOptions } = newRunData;
  
  const newTotalRuns = currentStats.totalRuns + 1;
  const newScores = [...currentStats.scores, score].slice(-1000); // Keep last 1000 scores
  
  const newTotalTime = currentStats.timeMetrics.totalTime + executionTime;
  const newAvgTime = newTotalTime / newTotalRuns;
  
  const newTotalPieces = currentStats.totalPiecesPlaced + piecesPlaced;
  const newTotalOptions = currentStats.validOptionsStats.totalOptions + validOptions;
  
  // Update position failures
  const newPositionFailures = { ...currentStats.positionFailures };
  Object.entries(positionFailures).forEach(([pos, count]) => {
    newPositionFailures[pos] = (newPositionFailures[pos] || 0) + count;
  });
  
  // Calculate new average and standard deviation
  const newAvgScore = newScores.reduce((sum, s) => sum + s, 0) / newScores.length;
  const newStdDev = calculateStdDev(newScores);
  
  return {
    ...currentStats,
    totalRuns: newTotalRuns,
    scores: newScores,
    bestScore: Math.max(currentStats.bestScore, score),
    avgScore: newAvgScore,
    stdDev: newStdDev,
    deadEnds: currentStats.deadEnds + (deadEnds > 0 ? 1 : 0),
    totalPiecesPlaced: newTotalPieces,
    positionFailures: newPositionFailures,
    timeMetrics: {
      totalTime: newTotalTime,
      avgTimePerRun: newAvgTime,
    },
    validOptionsStats: {
      totalOptions: newTotalOptions,
      avgOptionsPerPosition: newTotalOptions / newTotalPieces || 0,
    }
  };
};

// Update comparison metrics
export const updateComparisonMetrics = (currentMetrics, originalScore, optimizedScore) => {
  const newTotalComparisons = currentMetrics.totalComparisons + 1;
  
  let newOriginalWins = currentMetrics.originalWins;
  let newOptimizedWins = currentMetrics.optimizedWins;
  let newTies = currentMetrics.ties;
  
  if (originalScore > optimizedScore) {
    newOriginalWins++;
  } else if (optimizedScore > originalScore) {
    newOptimizedWins++;
  } else {
    newTies++;
  }
  
  const newAvgScoreDiff = ((currentMetrics.avgScoreDiff * currentMetrics.totalComparisons) + (optimizedScore - originalScore)) / newTotalComparisons;
  
  const originalWinRate = newOriginalWins / newTotalComparisons;
  const optimizedWinRate = newOptimizedWins / newTotalComparisons;
  
  // Handle efficiency ratio edge cases properly
  let newEfficiencyRatio;
  if (originalWinRate === 0 && optimizedWinRate === 0) {
    newEfficiencyRatio = 1; // Both have 0 wins, equal efficiency
  } else if (originalWinRate === 0) {
    newEfficiencyRatio = Infinity; // Only optimized has wins
  } else {
    newEfficiencyRatio = optimizedWinRate / originalWinRate;
  }
  
  return {
    originalWins: newOriginalWins,
    optimizedWins: newOptimizedWins,
    ties: newTies,
    avgScoreDiff: newAvgScoreDiff,
    efficiencyRatio: newEfficiencyRatio,
    totalComparisons: newTotalComparisons,
  };
};

// Get interpretation of effect size
export const interpretEffectSize = (effectSize) => {
  if (effectSize < 0.2) return { label: 'Negligible', color: 'text-slate-400' };
  if (effectSize < 0.5) return { label: 'Small', color: 'text-yellow-400' };
  if (effectSize < 0.8) return { label: 'Medium', color: 'text-orange-400' };
  return { label: 'Large', color: 'text-red-400' };
};

// Get interpretation of p-value
export const interpretPValue = (pValue) => {
  if (pValue >= 0.05) return { label: 'Not significant', color: 'text-slate-400', symbol: '' };
  if (pValue >= 0.01) return { label: 'Significant', color: 'text-yellow-400', symbol: '*' };
  if (pValue >= 0.001) return { label: 'Highly significant', color: 'text-orange-400', symbol: '**' };
  return { label: 'Very highly significant', color: 'text-green-400', symbol: '***' };
};