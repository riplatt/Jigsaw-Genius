/**
 * Strategy Generator for NxN Puzzles
 * Generates optimal placement strategies for any puzzle configuration
 */

/**
 * Validate if a position is valid on the board after a directional move
 * @param {number} newPos - The new position after movement
 * @param {number} originalPos - The original position before movement
 * @param {number} boardSize - Size of the board (N for NxN)
 * @param {number} offset - The movement offset
 * @returns {boolean} True if position is valid
 */
function isValidPosition(newPos, originalPos, boardSize, offset) {
  // Check bounds
  if (newPos < 0 || newPos >= boardSize * boardSize) return false;
  
  // Check row wrap-around for horizontal moves
  if (Math.abs(offset) === 1) {
    const originalRow = Math.floor(originalPos / boardSize);
    const newRow = Math.floor(newPos / boardSize);
    return originalRow === newRow;
  }
  
  // Vertical moves are valid if within bounds
  return true;
}

/**
 * Generate placement strategies for board size and hints
 * @param {number} boardSize - Size of the board (N for NxN)
 * @param {Object} hints - Optional hint positions {position: {id, rotation}}
 * @returns {Object} Strategy configurations with placement orders
 */
export function generatePlacementStrategies(boardSize, hints = {}) {
  const hintPositions = Object.keys(hints).map(pos => parseInt(pos));
  
  const strategies = {};
  
  // Generate optimized constraint-based strategy
  strategies.optimized = generateOptimizedStrategy(boardSize, hintPositions);
  
  // Generate alternative strategies
  strategies.spiral = generateSpiralStrategy(boardSize, hintPositions);
  strategies.sequential = generateSequentialStrategy(boardSize, hintPositions);
  
  // Add corner-first strategy for larger puzzles
  if (boardSize >= 6) {
    strategies.cornerFirst = generateCornerFirstStrategy(boardSize, hintPositions);
  }
  
  // Add edge-first strategy
  if (boardSize >= 5) {
    strategies.edgeFirst = generateEdgeFirstStrategy(boardSize, hintPositions);
  }
  
  return strategies;
}

/**
 * Calculate hint-adjacent positions for ML optimization
 * @param {number} boardSize - Size of the board
 * @param {Object} hints - Hint positions
 * @returns {Set} Set of positions adjacent to hints
 */
export function calculateHintAdjacentPositions(boardSize, hints = {}) {
  const hintPositions = Object.keys(hints).map(pos => parseInt(pos));
  const adjacentPositions = new Set();
  
  hintPositions.forEach(hintPos => {
    // Orthogonal directions (N, E, S, W)
    const directions = [-boardSize, 1, boardSize, -1];
    directions.forEach(offset => {
      const pos = hintPos + offset;
      if (isValidPosition(pos, hintPos, boardSize, offset)) {
        adjacentPositions.add(pos);
      }
    });
  });
  
  // Remove hints from adjacent set
  hintPositions.forEach(hint => {
    adjacentPositions.delete(hint);
  });
  
  return adjacentPositions;
}

/**
 * Generate placement strategies for a puzzle configuration
 * @param {Object} puzzle - Puzzle configuration
 * @returns {Object} Generated placement strategies
 */
export function generateStrategiesForPuzzle(puzzle) {
  const { boardSize, hints = {}, totalPieces } = puzzle;
  const hintPositions = Object.keys(hints).map(pos => parseInt(pos));
  
  // Validate puzzle
  if (boardSize * boardSize !== totalPieces) {
    throw new Error('Invalid puzzle: boardSize^2 must equal totalPieces');
  }
  
  const strategies = {};
  
  // Generate optimized constraint-based strategy
  strategies.optimized = generateOptimizedStrategy(boardSize, hintPositions);
  
  // Generate alternative strategies
  strategies.spiral = generateSpiralStrategy(boardSize, hintPositions);
  strategies.sequential = generateSequentialStrategy(boardSize, hintPositions);
  
  // Add corner-first strategy for larger puzzles
  if (boardSize >= 6) {
    strategies.cornerFirst = generateCornerFirstStrategy(boardSize, hintPositions);
  }
  
  // Add edge-first strategy
  if (boardSize >= 5) {
    strategies.edgeFirst = generateEdgeFirstStrategy(boardSize, hintPositions);
  }
  
  return strategies;
}

/**
 * Generate optimized constraint-based strategy
 */
function generateOptimizedStrategy(boardSize, hintPositions) {
  const totalPositions = boardSize * boardSize;
  const usedPositions = new Set(hintPositions);
  
  // Calculate constraint levels for all positions
  const constraintAnalysis = analyzeConstraints(boardSize, hintPositions);
  
  const phases = [];
  
  // Phase 1: Hints (if any)
  if (hintPositions.length > 0) {
    phases.push({
      name: "hints",
      description: "Fixed hint pieces - immovable anchors",
      positions: [...hintPositions].sort((a, b) => a - b),
      constraintLevel: "fixed"
    });
  }
  
  // Phase 2: High constraint positions (adjacent to hints, corners)
  const highConstraint = [];
  for (let pos = 0; pos < totalPositions; pos++) {
    if (usedPositions.has(pos)) continue;
    if (constraintAnalysis[pos].level === 'high') {
      highConstraint.push(pos);
      usedPositions.add(pos);
    }
  }
  
  if (highConstraint.length > 0) {
    phases.push({
      name: "high-constraint",
      description: "Highly constrained positions - corners and hint-adjacent",
      positions: highConstraint.sort((a, b) => 
        constraintAnalysis[b].score - constraintAnalysis[a].score
      ),
      constraintLevel: "high"
    });
  }
  
  // Phase 3: Medium constraint positions (edges, diagonal to hints)
  const mediumConstraint = [];
  for (let pos = 0; pos < totalPositions; pos++) {
    if (usedPositions.has(pos)) continue;
    if (constraintAnalysis[pos].level === 'medium') {
      mediumConstraint.push(pos);
      usedPositions.add(pos);
    }
  }
  
  if (mediumConstraint.length > 0) {
    phases.push({
      name: "medium-constraint",
      description: "Moderately constrained positions - edges and strategic locations",
      positions: mediumConstraint.sort((a, b) => 
        constraintAnalysis[b].score - constraintAnalysis[a].score
      ),
      constraintLevel: "medium"
    });
  }
  
  // Phase 4: Low constraint positions (interior)
  const lowConstraint = [];
  for (let pos = 0; pos < totalPositions; pos++) {
    if (usedPositions.has(pos)) continue;
    lowConstraint.push(pos);
  }
  
  if (lowConstraint.length > 0) {
    phases.push({
      name: "low-constraint",
      description: "Interior positions with flexible placement options",
      positions: lowConstraint.sort((a, b) => 
        constraintAnalysis[b].score - constraintAnalysis[a].score
      ),
      constraintLevel: "low"
    });
  }
  
  return {
    name: "Optimized Constraint Strategy",
    description: "AI-generated strategy based on constraint analysis",
    phases
  };
}

/**
 * Analyze constraint levels for all positions
 */
function analyzeConstraints(boardSize, hintPositions) {
  const totalPositions = boardSize * boardSize;
  const analysis = {};
  
  for (let pos = 0; pos < totalPositions; pos++) {
    const row = Math.floor(pos / boardSize);
    const col = pos % boardSize;
    
    // Basic constraint factors
    const isCorner = (row === 0 || row === boardSize - 1) && 
                     (col === 0 || col === boardSize - 1);
    const isEdge = row === 0 || row === boardSize - 1 || 
                   col === 0 || col === boardSize - 1;
    const isInterior = !isEdge;
    
    // Distance to hints
    let minDistanceToHint = Infinity;
    let adjacentToHint = false;
    
    hintPositions.forEach(hintPos => {
      const hintRow = Math.floor(hintPos / boardSize);
      const hintCol = hintPos % boardSize;
      const distance = Math.abs(row - hintRow) + Math.abs(col - hintCol);
      minDistanceToHint = Math.min(minDistanceToHint, distance);
      
      if (distance === 1) adjacentToHint = true;
    });
    
    // Calculate constraint score (higher = more constrained)
    let score = 0;
    
    if (isCorner) score += 50;
    if (isEdge && !isCorner) score += 30;
    if (isInterior) score += 10;
    if (adjacentToHint) score += 40;
    if (minDistanceToHint < Infinity) {
      score += Math.max(0, 20 - minDistanceToHint * 5);
    }
    
    // Determine constraint level
    let level;
    if (isCorner || adjacentToHint) {
      level = 'high';
    } else if (isEdge || minDistanceToHint <= 2) {
      level = 'medium';
    } else {
      level = 'low';
    }
    
    analysis[pos] = {
      score,
      level,
      isCorner,
      isEdge,
      isInterior,
      adjacentToHint,
      distanceToHint: minDistanceToHint
    };
  }
  
  return analysis;
}

/**
 * Generate spiral strategy (outward from center)
 */
function generateSpiralStrategy(boardSize, hintPositions) {
  const totalPositions = boardSize * boardSize;
  const center = Math.floor(boardSize / 2);
  const centerPos = center * boardSize + center;
  
  // Create spiral order
  const spiralOrder = [];
  const visited = new Set(hintPositions);
  
  // Start from center and spiral outward
  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // right, down, left, up
  let currentRow = center;
  let currentCol = center;
  let dirIndex = 0;
  let steps = 1;
  
  // Add center if not a hint
  if (!visited.has(centerPos)) {
    spiralOrder.push(centerPos);
    visited.add(centerPos);
  }
  
  while (spiralOrder.length + hintPositions.length < totalPositions) {
    for (let i = 0; i < 2; i++) { // Each step count is used twice
      for (let j = 0; j < steps; j++) {
        currentRow += directions[dirIndex][0];
        currentCol += directions[dirIndex][1];
        
        if (currentRow >= 0 && currentRow < boardSize && 
            currentCol >= 0 && currentCol < boardSize) {
          const pos = currentRow * boardSize + currentCol;
          if (!visited.has(pos)) {
            spiralOrder.push(pos);
            visited.add(pos);
          }
        }
      }
      dirIndex = (dirIndex + 1) % 4;
    }
    steps++;
  }
  
  const phases = [];
  
  if (hintPositions.length > 0) {
    phases.push({
      name: "hints",
      description: "Fixed hint pieces",
      positions: [...hintPositions].sort((a, b) => a - b),
      constraintLevel: "fixed"
    });
  }
  
  phases.push({
    name: "spiral",
    description: "Spiral outward from center",
    positions: spiralOrder,
    constraintLevel: "mixed"
  });
  
  return {
    name: "Spiral Strategy",
    description: "Place pieces in spiral pattern from center outward",
    phases
  };
}

/**
 * Generate sequential strategy (left-to-right, top-to-bottom)
 */
function generateSequentialStrategy(boardSize, hintPositions) {
  const totalPositions = boardSize * boardSize;
  const sequentialOrder = [];
  
  for (let pos = 0; pos < totalPositions; pos++) {
    if (!hintPositions.includes(pos)) {
      sequentialOrder.push(pos);
    }
  }
  
  const phases = [];
  
  if (hintPositions.length > 0) {
    phases.push({
      name: "hints", 
      description: "Fixed hint pieces",
      positions: [...hintPositions].sort((a, b) => a - b),
      constraintLevel: "fixed"
    });
  }
  
  phases.push({
    name: "sequential",
    description: "Left-to-right, top-to-bottom placement",
    positions: sequentialOrder,
    constraintLevel: "mixed"
  });
  
  return {
    name: "Sequential Strategy",
    description: "Simple sequential placement order",
    phases
  };
}

/**
 * Generate corner-first strategy
 */
function generateCornerFirstStrategy(boardSize, hintPositions) {
  const totalPositions = boardSize * boardSize;
  const usedPositions = new Set(hintPositions);
  
  // Identify corners
  const corners = [
    0, // top-left
    boardSize - 1, // top-right
    (boardSize - 1) * boardSize, // bottom-left
    totalPositions - 1 // bottom-right
  ].filter(pos => !usedPositions.has(pos));
  
  // Identify edges (excluding corners)
  const edges = [];
  for (let i = 0; i < totalPositions; i++) {
    if (usedPositions.has(i)) continue;
    
    const row = Math.floor(i / boardSize);
    const col = i % boardSize;
    const isEdge = (row === 0 || row === boardSize - 1 || 
                   col === 0 || col === boardSize - 1);
    const isCorner = corners.includes(i);
    
    if (isEdge && !isCorner) {
      edges.push(i);
    }
  }
  
  // Interior positions
  const interior = [];
  for (let i = 0; i < totalPositions; i++) {
    if (usedPositions.has(i) || corners.includes(i) || edges.includes(i)) {
      continue;
    }
    interior.push(i);
  }
  
  const phases = [];
  
  if (hintPositions.length > 0) {
    phases.push({
      name: "hints",
      description: "Fixed hint pieces", 
      positions: [...hintPositions].sort((a, b) => a - b),
      constraintLevel: "fixed"
    });
  }
  
  if (corners.length > 0) {
    phases.push({
      name: "corners",
      description: "Corner positions - highest edge constraints",
      positions: corners.sort((a, b) => a - b),
      constraintLevel: "high"
    });
  }
  
  if (edges.length > 0) {
    phases.push({
      name: "edges",
      description: "Edge positions - moderate constraints",
      positions: edges.sort((a, b) => a - b),
      constraintLevel: "medium"
    });
  }
  
  if (interior.length > 0) {
    phases.push({
      name: "interior",
      description: "Interior positions - neighbor constraints only",
      positions: interior.sort((a, b) => a - b),
      constraintLevel: "low"
    });
  }
  
  return {
    name: "Corner-First Strategy",
    description: "Fill corners first, then edges, then interior",
    phases
  };
}

/**
 * Generate edge-first strategy
 */
function generateEdgeFirstStrategy(boardSize, hintPositions) {
  const totalPositions = boardSize * boardSize;
  const usedPositions = new Set(hintPositions);
  
  // Categorize all positions
  const edges = [];
  const interior = [];
  
  for (let pos = 0; pos < totalPositions; pos++) {
    if (usedPositions.has(pos)) continue;
    
    const row = Math.floor(pos / boardSize);
    const col = pos % boardSize;
    const isEdge = row === 0 || row === boardSize - 1 || 
                   col === 0 || col === boardSize - 1;
    
    if (isEdge) {
      edges.push(pos);
    } else {
      interior.push(pos);
    }
  }
  
  const phases = [];
  
  if (hintPositions.length > 0) {
    phases.push({
      name: "hints",
      description: "Fixed hint pieces",
      positions: [...hintPositions].sort((a, b) => a - b),
      constraintLevel: "fixed"
    });
  }
  
  if (edges.length > 0) {
    phases.push({
      name: "perimeter",
      description: "Complete perimeter first - establishes boundary constraints",
      positions: edges.sort((a, b) => a - b),
      constraintLevel: "high"
    });
  }
  
  if (interior.length > 0) {
    phases.push({
      name: "interior",
      description: "Fill interior positions within established boundary",
      positions: interior.sort((a, b) => a - b),
      constraintLevel: "medium"
    });
  }
  
  return {
    name: "Edge-First Strategy", 
    description: "Complete perimeter before filling interior",
    phases
  };
}

/**
 * Validate a strategy configuration
 */
export function validateStrategy(strategy, boardSize) {
  const totalPositions = boardSize * boardSize;
  const errors = [];
  
  if (!strategy.name) {
    errors.push('Strategy missing name');
  }
  
  if (!strategy.phases || !Array.isArray(strategy.phases)) {
    errors.push('Strategy missing phases array');
    return { isValid: false, errors };
  }
  
  const allPositions = new Set();
  let hasFixedPhase = false;
  
  strategy.phases.forEach((phase, index) => {
    if (!phase.name) {
      errors.push(`Phase ${index} missing name`);
    }
    
    if (!phase.positions || !Array.isArray(phase.positions)) {
      errors.push(`Phase ${index} (${phase.name}) missing positions array`);
      return;
    }
    
    if (phase.constraintLevel === 'fixed') {
      hasFixedPhase = true;
    }
    
    phase.positions.forEach(pos => {
      if (typeof pos !== 'number' || pos < 0 || pos >= totalPositions) {
        errors.push(`Invalid position ${pos} in phase ${phase.name}`);
      }
      
      if (allPositions.has(pos)) {
        errors.push(`Duplicate position ${pos} in phase ${phase.name}`);
      }
      
      allPositions.add(pos);
    });
  });
  
  // Check that all positions are covered
  const expectedPositions = Array.from({length: totalPositions}, (_, i) => i);
  const missingPositions = expectedPositions.filter(pos => !allPositions.has(pos));
  
  if (missingPositions.length > 0) {
    errors.push(`Missing positions: ${missingPositions.join(', ')}`);
  }
  
  if (allPositions.size !== totalPositions) {
    errors.push(`Position count mismatch: expected ${totalPositions}, got ${allPositions.size}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    coverage: allPositions.size / totalPositions,
    hasFixedPhase
  };
}