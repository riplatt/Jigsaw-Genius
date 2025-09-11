import React, { createContext, useContext } from "react";

// Bridge context to make old components work with new DynamicSolverContext
const SolverBridgeContext = createContext();

// This useSolver will be used by components within the SolverBridge
const useSolver = () => useContext(SolverBridgeContext);

export const SolverBridge = ({ children, dynamicSolverContext }) => {
  const {
    puzzleConfig,
    board,
    isRunning,
    currentRun,
    stats,
    bestPartialSolution,
    mlParams,
    setMlParams,
    hintAdjacencyStats,
    strategyStats,
    comparisonMetrics,
    placementStrategies,
    startSolver,
    stopSolver,
    resetSolver,
    exportPartialSolution
  } = dynamicSolverContext;

  // Create bridge value that matches the old SolverContext interface
  const bridgeValue = {
    // State
    board: board || [],
    isRunning: isRunning || false,
    currentRun: currentRun || { run: 0, score: 0 },
    stats: stats || { totalRuns: 0, bestScore: 0, avgScore: 0, completedSolutions: 0 },
    hintAdjacencyStats: hintAdjacencyStats || {},
    pieces: puzzleConfig?.pieces || [],
    hints: puzzleConfig?.hints || {},
    mlParams: mlParams || { weightingConstant: 0.1, useCalibration: true, placementStrategy: 'optimized', boardUpdateFrequency: 10 },
    setMlParams: setMlParams || (() => {}),
    strategyStats: strategyStats || {},
    comparisonMetrics: comparisonMetrics || {},
    
    // Handlers - bridge the different naming
    handleStart: isRunning ? stopSolver : startSolver,
    handlePause: stopSolver || (() => {}),
    handleReset: resetSolver || (() => {}),
    
    // Strategy info
    PLACEMENT_STRATEGIES: placementStrategies || {},
    
    // Additional functionality
    loadBackupData: () => {}, // Placeholder
    getSelectionPercentages: () => ({}), // Placeholder
    
    // Export
    exportPartialSolution: exportPartialSolution || (() => {}),
    bestPartialSolution: bestPartialSolution || { board: null, score: 0, timestamp: null }
  };

  return (
    <SolverBridgeContext.Provider value={bridgeValue}>
      {children}
    </SolverBridgeContext.Provider>
  );
};