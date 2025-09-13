/**
 * Puzzle Loader Module
 * Centralized loading and management of all puzzle configurations
 */

// Import all puzzle configurations
import { eternityII_16x16 } from '../data/eternityII_16x16.js';
import { e2pieces_hard_4x4 } from '../data/e2pieces_hard_4x4.js';
import { e2pieces_hard_5x5 } from '../data/e2pieces_hard_5x5.js';
import { e2pieces_hard_6x6 } from '../data/e2pieces_hard_6x6.js';
import { e2pieces_hard_7x7 } from '../data/e2pieces_hard_7x7.js';
import { e2pieces_hard_8x8 } from '../data/e2pieces_hard_8x8.js';
import { e2pieces_hard_9x9 } from '../data/e2pieces_hard_9x9.js';
import { e2pieces_hard_10x10 } from '../data/e2pieces_hard_10x10.js';
import { e2pieces_profile_10x10 } from '../data/e2pieces_profile_10x10.js';
import { e2pieces_profile_11x11 } from '../data/e2pieces_profile_11x11.js';
import { e2pieces_profile_12x12 } from '../data/e2pieces_profile_12x12.js';

/**
 * Registry of all available puzzles
 */
const PUZZLE_REGISTRY = {
  // Original Eternity II with full strategy definitions
  'eternityII_16x16': eternityII_16x16,
  
  // Converted puzzles (strategies will be auto-generated)
  'e2pieces_hard_4x4': e2pieces_hard_4x4,
  'e2pieces_hard_5x5': e2pieces_hard_5x5,
  'e2pieces_hard_6x6': e2pieces_hard_6x6,
  'e2pieces_hard_7x7': e2pieces_hard_7x7,
  'e2pieces_hard_8x8': e2pieces_hard_8x8,
  'e2pieces_hard_9x9': e2pieces_hard_9x9,
  'e2pieces_hard_10x10': e2pieces_hard_10x10,
  'e2pieces_profile_10x10': e2pieces_profile_10x10,
  'e2pieces_profile_11x11': e2pieces_profile_11x11,
  'e2pieces_profile_12x12': e2pieces_profile_12x12,
};

/**
 * Get list of all available puzzles with metadata
 */
export function getAvailablePuzzles() {
  return Object.entries(PUZZLE_REGISTRY).map(([key, puzzle]) => ({
    id: key,
    name: puzzle.name,
    boardSize: puzzle.boardSize,
    totalPieces: puzzle.totalPieces,
    difficulty: puzzle.metadata?.difficulty || 'Unknown',
    description: puzzle.metadata?.description || 'No description available',
    hasHints: Object.keys(puzzle.hints || {}).length > 0,
    hintCount: Object.keys(puzzle.hints || {}).length,
    hasPhaseStrategies: puzzle.placement_strategies && 
      Object.values(puzzle.placement_strategies).some(s => s.phases),
  }));
}

/**
 * Load a specific puzzle by ID
 */
export function loadPuzzle(puzzleId) {
  const puzzle = PUZZLE_REGISTRY[puzzleId];
  if (!puzzle) {
    throw new Error(`Puzzle "${puzzleId}" not found`);
  }
  
  // Return a deep copy to prevent mutations
  return JSON.parse(JSON.stringify(puzzle));
}

/**
 * Get puzzle by board size and difficulty
 */
export function getPuzzlesByFilter(options = {}) {
  const { boardSize, difficulty, hasHints } = options;
  
  return getAvailablePuzzles().filter(puzzle => {
    if (boardSize && puzzle.boardSize !== boardSize) return false;
    if (difficulty && puzzle.difficulty !== difficulty) return false;
    if (hasHints !== undefined && puzzle.hasHints !== hasHints) return false;
    return true;
  });
}

/**
 * Get recommended starter puzzles for different skill levels
 */
export function getRecommendedPuzzles() {
  return {
    beginner: ['e2pieces_hard_4x4', 'e2pieces_hard_5x5'],
    intermediate: ['e2pieces_hard_6x6', 'e2pieces_hard_7x7', 'e2pieces_hard_8x8'],
    advanced: ['e2pieces_hard_9x9', 'e2pieces_hard_10x10', 'e2pieces_profile_10x10'],
    expert: ['e2pieces_profile_11x11', 'e2pieces_profile_12x12', 'eternityII_16x16'],
  };
}

/**
 * Validate puzzle configuration
 */
export function validatePuzzle(puzzle) {
  const errors = [];
  
  if (!puzzle.name) errors.push('Missing puzzle name');
  if (!puzzle.boardSize || puzzle.boardSize < 2) errors.push('Invalid board size');
  if (!puzzle.pieces || !Array.isArray(puzzle.pieces)) errors.push('Missing or invalid pieces array');
  if (puzzle.pieces.length !== puzzle.totalPieces) errors.push('Piece count mismatch');
  if (puzzle.boardSize * puzzle.boardSize !== puzzle.totalPieces) {
    errors.push('Board size and total pieces mismatch');
  }
  
  // Validate pieces
  puzzle.pieces.forEach((piece, index) => {
    if (piece.id !== index) errors.push(`Piece ${index} has incorrect ID`);
    if (!piece.edges || piece.edges.length !== 4) {
      errors.push(`Piece ${index} has invalid edges`);
    }
  });
  
  // Validate hints
  if (puzzle.hints) {
    Object.entries(puzzle.hints).forEach(([pos, hint]) => {
      const position = parseInt(pos);
      if (position < 0 || position >= puzzle.totalPieces) {
        errors.push(`Invalid hint position: ${pos}`);
      }
      if (!puzzle.pieces.find(p => p.id === hint.id)) {
        errors.push(`Hint references non-existent piece: ${hint.id}`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Transform puzzle to enhanced format with phase-based strategies
 */
export function enhancePuzzleStrategies(puzzle) {
  // If already has phase-based strategies, return as-is
  if (puzzle.placement_strategies && 
      Object.values(puzzle.placement_strategies).some(s => s.phases)) {
    return puzzle;
  }
  
  // Generate enhanced strategies based on existing data
  const enhanced = { ...puzzle };
  enhanced.placement_strategies = generatePhaseBasedStrategies(puzzle);
  
  return enhanced;
}

/**
 * Generate phase-based strategies from existing placement strategies
 */
function generatePhaseBasedStrategies(puzzle) {
  const { boardSize, hints = {}, placement_strategies = {} } = puzzle;
  const hintPositions = Object.keys(hints).map(pos => parseInt(pos));
  
  // If puzzle has existing strategies, convert them to phase format
  const strategies = {};
  
  Object.entries(placement_strategies).forEach(([key, strategy]) => {
    if (strategy.phases) {
      // Already in phase format
      strategies[key] = strategy;
    } else if (strategy.placements) {
      // Convert old format to phase format
      strategies[key] = convertToPhaseFormat(strategy, hintPositions, boardSize);
    }
  });
  
  // If no strategies exist, generate default ones
  if (Object.keys(strategies).length === 0) {
    strategies.optimized = generateDefaultStrategy(puzzle);
  }
  
  return strategies;
}

/**
 * Convert old placement format to new phase format
 */
function convertToPhaseFormat(strategy, hintPositions, boardSize) {
  const { name, placements } = strategy;
  
  // Categorize positions into phases
  const hintSet = new Set(hintPositions);
  const orthogonalAdjacent = new Set();
  const diagonalAdjacent = new Set();
  
  // Calculate adjacent positions
  hintPositions.forEach(hintPos => {
    // Orthogonal directions
    [-boardSize, 1, boardSize, -1].forEach(offset => {
      const pos = hintPos + offset;
      if (isValidPosition(pos, hintPos, boardSize, offset)) {
        orthogonalAdjacent.add(pos);
      }
    });
    
    // Diagonal directions  
    [-boardSize-1, -boardSize+1, boardSize-1, boardSize+1].forEach(offset => {
      const pos = hintPos + offset;
      if (isValidPosition(pos, hintPos, boardSize, offset)) {
        diagonalAdjacent.add(pos);
      }
    });
  });
  
  // Remove hints from adjacent sets
  hintPositions.forEach(hint => {
    orthogonalAdjacent.delete(hint);
    diagonalAdjacent.delete(hint);
  });
  
  const phases = [];
  
  // Add hints phase if hints exist
  if (hintPositions.length > 0) {
    phases.push({
      name: "hints",
      description: "Fixed hint pieces",
      positions: hintPositions,
      constraintLevel: "fixed"
    });
  }
  
  // Categorize remaining positions
  const remaining = placements.filter(pos => !hintSet.has(pos));
  const orthogonal = remaining.filter(pos => orthogonalAdjacent.has(pos));
  const diagonal = remaining.filter(pos => diagonalAdjacent.has(pos));
  const others = remaining.filter(pos => 
    !orthogonalAdjacent.has(pos) && !diagonalAdjacent.has(pos)
  );
  
  if (orthogonal.length > 0) {
    phases.push({
      name: "orthogonal-adjacent",
      description: "Directly adjacent to hints",
      positions: orthogonal,
      constraintLevel: "high"
    });
  }
  
  if (diagonal.length > 0) {
    phases.push({
      name: "diagonal-adjacent", 
      description: "Diagonally adjacent to hints",
      positions: diagonal,
      constraintLevel: "medium"
    });
  }
  
  if (others.length > 0) {
    // Split others into reasonable phases
    const mid = Math.ceil(others.length / 2);
    phases.push({
      name: "constrained",
      description: "Moderately constrained positions",
      positions: others.slice(0, mid),
      constraintLevel: "medium"
    });
    
    if (others.length > mid) {
      phases.push({
        name: "remaining",
        description: "Least constrained positions",
        positions: others.slice(mid),
        constraintLevel: "low"
      });
    }
  }
  
  return {
    name: name || "Converted Strategy",
    description: "Auto-converted from position list",
    phases
  };
}

/**
 * Generate default strategy for puzzles without predefined strategies
 */
function generateDefaultStrategy(puzzle) {
  const { boardSize, hints = {} } = puzzle;
  const totalPositions = boardSize * boardSize;
  const hintPositions = Object.keys(hints).map(pos => parseInt(pos));
  
  // Use center positions as hints if none provided
  const autoHints = hintPositions.length > 0 ? hintPositions : [
    Math.floor(totalPositions / 2)
  ];
  
  const phases = [];
  const used = new Set();
  
  // Hints phase
  if (autoHints.length > 0) {
    phases.push({
      name: "hints",
      description: "Starting positions",
      positions: autoHints,
      constraintLevel: "fixed"
    });
    autoHints.forEach(pos => used.add(pos));
  }
  
  // Sequential filling by constraint level
  const remaining = Array.from({length: totalPositions}, (_, i) => i)
    .filter(pos => !used.has(pos));
  
  // Group by constraint level (distance from edges/corners)
  const byConstraint = groupByConstraintLevel(remaining, boardSize);
  
  Object.entries(byConstraint).forEach(([level, positions]) => {
    if (positions.length > 0) {
      phases.push({
        name: level,
        description: `${level} constraint positions`,
        positions: positions.sort((a, b) => a - b),
        constraintLevel: level
      });
    }
  });
  
  return {
    name: "Auto-Generated Strategy",
    description: "Automatically generated constraint-based strategy",
    phases
  };
}

function groupByConstraintLevel(positions, boardSize) {
  const groups = { high: [], medium: [], low: [] };
  
  positions.forEach(pos => {
    const row = Math.floor(pos / boardSize);
    const col = pos % boardSize;
    const isEdge = row === 0 || row === boardSize - 1 || col === 0 || col === boardSize - 1;
    const isCorner = (row === 0 || row === boardSize - 1) && (col === 0 || col === boardSize - 1);
    
    if (isCorner) {
      groups.high.push(pos);
    } else if (isEdge) {
      groups.medium.push(pos);
    } else {
      groups.low.push(pos);
    }
  });
  
  return groups;
}

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
  
  return true;
}