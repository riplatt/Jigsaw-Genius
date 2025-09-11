/**
 * Dynamic Placement Strategy Generator for NxN Eternity II Puzzles
 * 
 * Generates optimal piece placement orders for any board size based on the
 * proven strategy hierarchy: Hints → Orthogonal-Adjacent → Diagonal-Adjacent → Checkerboard → Surrounded
 */

/**
 * Generate placement strategies for an NxN board
 * @param {number} boardSize - Size of the board (N for NxN)
 * @param {Object} hints - Optional hint positions {position: {id, rotation}}
 * @param {string} strategyType - 'auto', 'spiral', 'checkerboard', or 'custom'
 * @returns {Object} Strategy configurations with placement orders
 */
export function generatePlacementStrategies(boardSize, hints = {}, strategyType = 'auto') {
  const totalPositions = boardSize * boardSize;
  const allPositions = Array.from({ length: totalPositions }, (_, i) => i);
  
  // Convert hints to position array
  const hintPositions = Object.keys(hints).map(pos => parseInt(pos));
  
  // Auto-generate hints if none provided (center positions for better constraint propagation)
  const autoHints = hintPositions.length > 0 ? hintPositions : generateAutoHints(boardSize);
  
  // Generate position categories
  const categories = categorizePositions(boardSize, autoHints);
  
  const strategies = {
    original: {
      name: "Standard Strategy",
      description: "Traditional placement order",
      order: generateStandardOrder(categories, allPositions)
    },
    optimized: {
      name: "Optimized Strategy", 
      description: "Constraint-based ordering for faster solving",
      order: generateOptimizedOrder(categories)
    }
  };
  
  // Add strategy-specific variations
  if (strategyType === 'spiral') {
    strategies.spiral = {
      name: "Spiral Strategy",
      description: "Spiral outward from center",
      order: generateSpiralOrder(boardSize)
    };
  }
  
  if (strategyType === 'checkerboard') {
    strategies.checkerboard = {
      name: "Checkerboard Strategy", 
      description: "Alternate black/white pattern",
      order: generateCheckerboardOrder(boardSize)
    };
  }
  
  return strategies;
}

/**
 * Auto-generate hint positions for better constraint propagation
 * Places hints near center and strategic positions
 */
function generateAutoHints(boardSize) {
  const hints = [];
  const center = Math.floor(boardSize / 2);
  
  if (boardSize >= 4) {
    // Center position
    hints.push(center * boardSize + center);
    
    if (boardSize >= 6) {
      // Add strategic positions around center
      const offset = Math.floor(boardSize / 4);
      hints.push((center - offset) * boardSize + (center - offset));
      hints.push((center - offset) * boardSize + (center + offset));
      hints.push((center + offset) * boardSize + (center - offset));
      hints.push((center + offset) * boardSize + (center + offset));
    }
  }
  
  return hints.filter(pos => pos >= 0 && pos < boardSize * boardSize);
}

/**
 * Categorize all positions into strategic groups
 */
function categorizePositions(boardSize, hintPositions) {
  const totalPositions = boardSize * boardSize;
  const categories = {
    hints: [...hintPositions],
    orthogonalAdjacent: [],
    diagonalAdjacent: [],
    checkerboard: [],
    surrounded: []
  };
  
  // Pre-calculate all adjacent positions
  const orthogonalSet = new Set();
  const diagonalSet = new Set();
  
  hintPositions.forEach(hintPos => {
    // Orthogonal (N, E, S, W)
    const orthogonalOffsets = [-boardSize, 1, boardSize, -1];
    orthogonalOffsets.forEach(offset => {
      const pos = hintPos + offset;
      if (isValidPosition(pos, hintPos, boardSize, offset)) {
        orthogonalSet.add(pos);
      }
    });
    
    // Diagonal (NE, SE, SW, NW)
    const diagonalOffsets = [-boardSize + 1, boardSize + 1, boardSize - 1, -boardSize - 1];
    diagonalOffsets.forEach(offset => {
      const pos = hintPos + offset;
      if (isValidPosition(pos, hintPos, boardSize, offset)) {
        diagonalSet.add(pos);
      }
    });
  });
  
  // Remove hints from adjacent sets
  hintPositions.forEach(hint => {
    orthogonalSet.delete(hint);
    diagonalSet.delete(hint);
  });
  
  categories.orthogonalAdjacent = Array.from(orthogonalSet).sort((a, b) => a - b);
  categories.diagonalAdjacent = Array.from(diagonalSet).sort((a, b) => a - b);
  
  // Generate checkerboard pattern (excluding hints and adjacents)
  const usedPositions = new Set([
    ...hintPositions,
    ...categories.orthogonalAdjacent,
    ...categories.diagonalAdjacent
  ]);
  
  for (let pos = 0; pos < totalPositions; pos++) {
    if (usedPositions.has(pos)) continue;
    
    const row = Math.floor(pos / boardSize);
    const col = pos % boardSize;
    
    // Checkerboard pattern: alternating positions for constraint propagation
    if ((row + col) % 2 === 0) {
      categories.checkerboard.push(pos);
    } else {
      categories.surrounded.push(pos);
    }
  }
  
  return categories;
}

/**
 * Check if a position is valid (within bounds, no wrap-around)
 */
function isValidPosition(newPos, originalPos, boardSize, offset) {
  if (newPos < 0 || newPos >= boardSize * boardSize) return false;
  
  const originalRow = Math.floor(originalPos / boardSize);
  const originalCol = originalPos % boardSize;
  const newRow = Math.floor(newPos / boardSize);
  const newCol = newPos % boardSize;
  
  // Check for wrap-around on horizontal movements
  if (Math.abs(offset) === 1) {
    return Math.abs(newRow - originalRow) === 0 && Math.abs(newCol - originalCol) === 1;
  }
  
  // Check for wrap-around on diagonal movements
  if (Math.abs(offset) === boardSize + 1 || Math.abs(offset) === boardSize - 1) {
    return Math.abs(newRow - originalRow) === 1 && Math.abs(newCol - originalCol) === 1;
  }
  
  return true;
}

/**
 * Generate standard placement order (for compatibility)
 */
function generateStandardOrder(categories, allPositions) {
  return [
    ...categories.hints,
    ...categories.orthogonalAdjacent,
    ...categories.diagonalAdjacent,
    ...categories.checkerboard,
    ...categories.surrounded
  ];
}

/**
 * Generate optimized placement order with enhanced constraint propagation
 */
function generateOptimizedOrder(categories) {
  return [
    ...categories.hints,
    ...categories.orthogonalAdjacent,
    ...categories.diagonalAdjacent,
    ...categories.checkerboard,
    ...categories.surrounded
  ];
}

/**
 * Generate spiral placement order (outward from center)
 */
function generateSpiralOrder(boardSize) {
  const order = [];
  const visited = new Set();
  
  const center = Math.floor(boardSize / 2);
  let row = center;
  let col = center;
  
  // Directions: right, down, left, up
  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  let dirIndex = 0;
  let steps = 1;
  
  order.push(row * boardSize + col);
  visited.add(row * boardSize + col);
  
  while (order.length < boardSize * boardSize) {
    for (let i = 0; i < 2; i++) { // Each step size is used twice
      const [dr, dc] = directions[dirIndex];
      
      for (let j = 0; j < steps; j++) {
        row += dr;
        col += dc;
        
        if (row >= 0 && row < boardSize && col >= 0 && col < boardSize) {
          const pos = row * boardSize + col;
          if (!visited.has(pos)) {
            order.push(pos);
            visited.add(pos);
          }
        }
      }
      
      dirIndex = (dirIndex + 1) % 4;
    }
    steps++;
  }
  
  return order;
}

/**
 * Generate checkerboard placement order
 */
function generateCheckerboardOrder(boardSize) {
  const order = [];
  const totalPositions = boardSize * boardSize;
  
  // First pass: positions where (row + col) % 2 === 0
  for (let pos = 0; pos < totalPositions; pos++) {
    const row = Math.floor(pos / boardSize);
    const col = pos % boardSize;
    if ((row + col) % 2 === 0) {
      order.push(pos);
    }
  }
  
  // Second pass: remaining positions
  for (let pos = 0; pos < totalPositions; pos++) {
    const row = Math.floor(pos / boardSize);
    const col = pos % boardSize;
    if ((row + col) % 2 === 1) {
      order.push(pos);
    }
  }
  
  return order;
}

/**
 * Calculate hint-adjacent positions for ML optimization
 * @param {number} boardSize - Size of the board
 * @param {Object} hints - Hint positions
 * @returns {Set} Set of positions adjacent to hints
 */
export function calculateHintAdjacentPositions(boardSize, hints) {
  const hintAdjacentPositions = new Set();
  const directions = { north: -boardSize, east: 1, south: boardSize, west: -1 };
  
  Object.keys(hints).forEach((hintPosStr) => {
    const hintPos = parseInt(hintPosStr);
    Object.values(directions).forEach((offset) => {
      const adjPos = hintPos + offset;
      
      if (isValidPosition(adjPos, hintPos, boardSize, offset)) {
        hintAdjacentPositions.add(adjPos);
      }
    });
  });
  
  return hintAdjacentPositions;
}

/**
 * Validate that a placement strategy covers all positions exactly once
 */
export function validateStrategy(strategy, expectedSize) {
  const positions = new Set(strategy.order);
  
  if (positions.size !== expectedSize) {
    throw new Error(`Strategy has ${positions.size} positions, expected ${expectedSize}`);
  }
  
  if (strategy.order.length !== expectedSize) {
    throw new Error(`Strategy order has ${strategy.order.length} items, expected ${expectedSize}`);
  }
  
  for (let i = 0; i < expectedSize; i++) {
    if (!positions.has(i)) {
      throw new Error(`Strategy missing position ${i}`);
    }
  }
  
  return true;
}