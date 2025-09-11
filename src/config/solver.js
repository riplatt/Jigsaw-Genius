// Solver configuration - now supports dynamic puzzle sizes
export const SOLVER_CONFIG = {
  // Default values (backwards compatibility)
  DEFAULT_BOARD_SIZE: 16,
  DEFAULT_TOTAL_PIECES: 256,
  // Legacy compatibility
  BOARD_SIZE: 16,
  TOTAL_PIECES: 256,
  CALIBRATION_RUNS: 1000,
  SOLVER_INTERVAL: 333, // milliseconds - 3x faster than original
  
  // Animation settings
  ANIMATION: {
    DURATION: 0.2,
    STAGGER_DELAY: 0.001,
  },
  
  // Performance settings
  PERFORMANCE: {
    ENABLE_MEMOIZATION: true,
    ENABLE_EDGE_COMPATIBILITY_CACHE: true,
    BATCH_SIZE: 50, // For processing large datasets
    YIELD_THRESHOLD: 16, // Yield control every 16ms to maintain 60fps
    MAX_EXECUTION_TIME: 50, // Warn if solver takes longer than 50ms
  }
};

/**
 * Create dynamic solver configuration for a specific puzzle
 * @param {Object} puzzleConfig - Puzzle configuration object
 * @returns {Object} Solver configuration tailored to the puzzle
 */
export function createSolverConfig(puzzleConfig) {
  if (!puzzleConfig) {
    // Return default configuration
    return {
      ...SOLVER_CONFIG,
      BOARD_SIZE: SOLVER_CONFIG.DEFAULT_BOARD_SIZE,
      TOTAL_PIECES: SOLVER_CONFIG.DEFAULT_TOTAL_PIECES,
    };
  }

  return {
    ...SOLVER_CONFIG,
    BOARD_SIZE: puzzleConfig.boardSize,
    TOTAL_PIECES: puzzleConfig.totalPieces,
    
    // Adjust calibration runs based on puzzle complexity
    CALIBRATION_RUNS: calculateCalibrationRuns(puzzleConfig.boardSize),
    
    // Adjust solver interval for smaller puzzles (can solve faster)
    SOLVER_INTERVAL: calculateSolverInterval(puzzleConfig.boardSize),
  };
}

/**
 * Calculate appropriate calibration runs based on puzzle size
 * Smaller puzzles need fewer runs, larger puzzles need more
 */
function calculateCalibrationRuns(boardSize) {
  const baseRuns = 1000;
  const scaleFactor = (boardSize * boardSize) / 256; // Relative to 16x16
  
  // Minimum 100 runs, maximum 2000 runs
  return Math.max(100, Math.min(2000, Math.round(baseRuns * scaleFactor)));
}

/**
 * Calculate appropriate solver interval based on puzzle size
 * Smaller puzzles can run faster, larger puzzles need more time per iteration
 */
function calculateSolverInterval(boardSize) {
  const baseInterval = 333;
  
  if (boardSize <= 6) return 100;  // Very fast for small puzzles
  if (boardSize <= 10) return 200; // Fast for medium puzzles
  if (boardSize <= 14) return 300; // Standard for large puzzles
  return baseInterval; // Default for very large puzzles
}

// Edge color mapping for visualization
export const EDGE_COLORS = {
  0: '#1e293b',  // slate-800 (border/empty)
  1: '#ef4444',  // red
  2: '#f97316',  // orange  
  3: '#eab308',  // yellow
  4: '#22c55e',  // green
  5: '#06b6d4',  // cyan
  6: '#3b82f6',  // blue
  7: '#8b5cf6',  // violet
  8: '#ec4899',  // pink
  9: '#f59e0b',  // amber
  10: '#10b981', // emerald
  11: '#14b8a6', // teal
  12: '#6366f1', // indigo
  13: '#a855f7', // purple
  14: '#84cc16', // lime
  15: '#f43f5e', // rose
  16: '#64748b', // slate
  17: '#78716c', // stone
  18: '#dc2626', // red-600
  19: '#ea580c', // orange-600
  20: '#ca8a04', // yellow-600
  21: '#16a34a', // green-600
  22: '#0891b2'  // cyan-600
};