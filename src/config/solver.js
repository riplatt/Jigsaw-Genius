// Solver configuration constants
export const SOLVER_CONFIG = {
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
  }
};

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