/**
 * Puzzle Parser Utility for Eternity II Format Files
 * 
 * Handles parsing of puzzle definition files in the standard format:
 * Line 1: N N (board size)
 * Following lines: piece_edge1 piece_edge2 piece_edge3 piece_edge4 (N, E, S, W edges)
 */

/**
 * Parse puzzle file content into a puzzle configuration
 * @param {string} fileContent - Raw content of the puzzle file
 * @param {string} filename - Name of the file for error reporting
 * @returns {Object} Parsed puzzle configuration
 */
export function parsePuzzleFile(fileContent, filename = 'unknown') {
  try {
    const lines = fileContent.trim().split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length === 0) {
      throw new Error('Empty file');
    }
    
    // Parse first line for board dimensions
    const dimensionLine = lines[0].trim().split(/\s+/);
    if (dimensionLine.length !== 2) {
      throw new Error('First line must contain exactly two numbers (N N)');
    }
    
    const [width, height] = dimensionLine.map(num => parseInt(num.trim()));
    
    if (isNaN(width) || isNaN(height) || width !== height) {
      throw new Error('Board dimensions must be equal positive integers (NxN)');
    }
    
    if (width < 3 || width > 20) {
      throw new Error('Board size must be between 3 and 20');
    }
    
    const boardSize = width;
    const expectedPieces = boardSize * boardSize;
    
    // Parse piece definitions
    const pieces = [];
    const pieceLines = lines.slice(1);
    
    if (pieceLines.length !== expectedPieces) {
      throw new Error(`Expected ${expectedPieces} pieces for ${boardSize}x${boardSize} board, found ${pieceLines.length}`);
    }
    
    for (let i = 0; i < pieceLines.length; i++) {
      const line = pieceLines[i].trim();
      if (!line) continue;
      
      const edges = line.split(/\s+/).map(edge => parseInt(edge.trim()));
      
      if (edges.length !== 4) {
        throw new Error(`Piece ${i + 1}: Expected 4 edges, found ${edges.length}`);
      }
      
      if (edges.some(edge => isNaN(edge) || edge < 0 || edge > 23)) {
        throw new Error(`Piece ${i + 1}: Edge values must be integers between 0-23`);
      }
      
      pieces.push({
        id: i,
        edges: edges // [North, East, South, West]
      });
    }
    
    // Detect potential hints (pieces with all border edges = 0)
    const hints = detectPotentialHints(pieces, boardSize);
    
    const puzzleConfig = {
      name: extractPuzzleName(filename),
      boardSize,
      totalPieces: expectedPieces,
      pieces,
      hints,
      metadata: {
        filename,
        parsedAt: new Date().toISOString(),
        edgeColorCount: getUniqueEdgeColors(pieces).length
      }
    };
    
    // Validate the puzzle
    validatePuzzle(puzzleConfig);
    
    return puzzleConfig;
    
  } catch (error) {
    throw new Error(`Failed to parse puzzle file "${filename}": ${error.message}`);
  }
}

/**
 * Detect potential hint pieces (corner pieces or pieces with multiple border edges)
 */
function detectPotentialHints(pieces, boardSize) {
  const hints = {};
  const cornerPositions = [
    0, // Top-left
    boardSize - 1, // Top-right  
    boardSize * (boardSize - 1), // Bottom-left
    boardSize * boardSize - 1 // Bottom-right
  ];
  
  // Look for corner pieces first
  pieces.forEach((piece, index) => {
    const borderEdges = piece.edges.filter(edge => edge === 0).length;
    
    // Corner pieces have exactly 2 border edges
    if (borderEdges === 2) {
      const position = findBestPositionForCornerPiece(piece, boardSize);
      if (position !== -1) {
        hints[position] = {
          id: piece.id,
          rotation: calculateRequiredRotation(piece, position, boardSize)
        };
      }
    }
  });
  
  return hints;
}

/**
 * Find the best position for a corner piece based on its edge pattern
 */
function findBestPositionForCornerPiece(piece, boardSize) {
  const { edges } = piece; // [N, E, S, W]
  const borderEdgeIndices = edges.map((edge, i) => edge === 0 ? i : -1).filter(i => i !== -1);
  
  if (borderEdgeIndices.length !== 2) return -1;
  
  const [first, second] = borderEdgeIndices.sort((a, b) => a - b);
  
  // Check if the border edges are adjacent (valid corner piece)
  const isAdjacent = (second - first === 1) || (first === 0 && second === 3);
  if (!isAdjacent) return -1;
  
  // Map border edge pattern to corner position
  if (first === 0 && second === 1) return boardSize - 1; // Top-right (N=0, E=0)
  if (first === 1 && second === 2) return boardSize * boardSize - 1; // Bottom-right (E=0, S=0)
  if (first === 2 && second === 3) return boardSize * (boardSize - 1); // Bottom-left (S=0, W=0)
  if (first === 0 && second === 3) return 0; // Top-left (N=0, W=0)
  
  return -1;
}

/**
 * Calculate the required rotation to place a piece at a specific position
 */
function calculateRequiredRotation(piece, position, boardSize) {
  const row = Math.floor(position / boardSize);
  const col = position % boardSize;
  
  // Determine required border edges for this position
  const requiredBorders = [
    row === 0, // North border
    col === boardSize - 1, // East border
    row === boardSize - 1, // South border
    col === 0 // West border
  ];
  
  // Find rotation that aligns piece edges with required borders
  for (let rotation = 0; rotation < 360; rotation += 90) {
    const rotatedEdges = rotatePieceEdges(piece.edges, rotation);
    const matches = rotatedEdges.every((edge, i) => 
      (edge === 0) === requiredBorders[i]
    );
    
    if (matches) return rotation;
  }
  
  return 0; // Default rotation
}

/**
 * Rotate piece edges by specified degrees
 */
function rotatePieceEdges(edges, degrees) {
  const steps = Math.round(degrees / 90) % 4;
  if (steps === 0) return [...edges];
  return [...edges.slice(4 - steps), ...edges.slice(0, 4 - steps)];
}

/**
 * Get all unique edge colors used in the puzzle
 */
function getUniqueEdgeColors(pieces) {
  const colors = new Set();
  pieces.forEach(piece => {
    piece.edges.forEach(edge => colors.add(edge));
  });
  return Array.from(colors).sort((a, b) => a - b);
}

/**
 * Extract puzzle name from filename
 */
function extractPuzzleName(filename) {
  const name = filename.replace(/\.[^/.]+$/, ''); // Remove extension
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Validate the puzzle configuration for consistency
 */
function validatePuzzle(puzzleConfig) {
  const { pieces, boardSize, hints } = puzzleConfig;
  
  // Validate piece count
  if (pieces.length !== boardSize * boardSize) {
    throw new Error(`Piece count mismatch: expected ${boardSize * boardSize}, got ${pieces.length}`);
  }
  
  // Validate hint positions
  Object.keys(hints).forEach(position => {
    const pos = parseInt(position);
    if (pos < 0 || pos >= boardSize * boardSize) {
      throw new Error(`Invalid hint position: ${pos}`);
    }
  });
  
  // Validate border constraints
  validateBorderConstraints(pieces, boardSize);
  
  return true;
}

/**
 * Validate that border pieces have appropriate edge 0 values
 */
function validateBorderConstraints(pieces, boardSize) {
  // For each position, check if border pieces have edge 0 on border sides
  for (let pos = 0; pos < boardSize * boardSize; pos++) {
    const row = Math.floor(pos / boardSize);
    const col = pos % boardSize;
    
    const isTopBorder = row === 0;
    const isRightBorder = col === boardSize - 1;
    const isBottomBorder = row === boardSize - 1;
    const isLeftBorder = col === 0;
    
    // Count pieces that could fit at this position
    let validPieces = 0;
    
    pieces.forEach(piece => {
      // Try all rotations
      for (let rotation = 0; rotation < 4; rotation++) {
        const rotatedEdges = rotatePieceEdges(piece.edges, rotation * 90);
        
        const fits = 
          (isTopBorder === (rotatedEdges[0] === 0)) &&
          (isRightBorder === (rotatedEdges[1] === 0)) &&
          (isBottomBorder === (rotatedEdges[2] === 0)) &&
          (isLeftBorder === (rotatedEdges[3] === 0));
        
        if (fits) {
          validPieces++;
          break; // Found a valid rotation for this piece
        }
      }
    });
    
    if (validPieces === 0) {
      console.warn(`Warning: No pieces can fit at position ${pos} (row ${row}, col ${col})`);
    }
  }
}

/**
 * Create a puzzle configuration from the existing 16x16 E2 pieces
 * (for backwards compatibility)
 */
export function createE2PuzzleConfig() {
  // This would use the existing pieces array from SolverContext
  // Implementation depends on how we want to handle the transition
  return {
    name: "Eternity II 16x16",
    boardSize: 16,
    totalPieces: 256,
    pieces: [], // Would be populated with existing E2 pieces
    hints: {
      135: { id: 138, rotation: 180 },
      34: { id: 207, rotation: 270 },
      45: { id: 254, rotation: 270 },
      210: { id: 180, rotation: 270 },
      221: { id: 248, rotation: 0 }
    },
    metadata: {
      filename: "e2pieces16x16.txt",
      parsedAt: new Date().toISOString(),
      edgeColorCount: 23
    }
  };
}

/**
 * Load and parse puzzle from uploaded file
 * @param {File} file - File object from file input
 * @returns {Promise<Object>} Parsed puzzle configuration
 */
export async function loadPuzzleFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const puzzleConfig = parsePuzzleFile(content, file.name);
        resolve(puzzleConfig);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Export puzzle configuration to file format
 */
export function exportPuzzleToFormat(puzzleConfig) {
  const lines = [];
  
  // First line: board dimensions
  lines.push(`${puzzleConfig.boardSize} ${puzzleConfig.boardSize}`);
  
  // Piece definitions
  puzzleConfig.pieces.forEach(piece => {
    lines.push(piece.edges.join(' '));
  });
  
  return lines.join('\n') + '\n';
}

/**
 * Get list of available mini-puzzles
 */
export function getAvailableMiniPuzzles() {
  return [
    { name: "4x4 Hard", filename: "e2pieces_hard_4x4.txt", size: 4 },
    { name: "5x5 Hard", filename: "e2pieces_hard_5x5.txt", size: 5 },
    { name: "6x6 Hard", filename: "e2pieces_hard_6x6.txt", size: 6 },
    { name: "7x7 Hard", filename: "e2pieces_hard_7x7.txt", size: 7 },
    { name: "8x8 Hard", filename: "e2pieces_hard_8x8.txt", size: 8 },
    { name: "9x9 Hard", filename: "e2pieces_hard_9x9.txt", size: 9 },
    { name: "10x10 Hard", filename: "e2pieces_hard_10x10.txt", size: 10 },
    { name: "10x10 Profile", filename: "e2pieces_profile_10x10.txt", size: 10 },
    { name: "11x11 Profile", filename: "e2pieces_profile_11x11.txt", size: 11 },
    { name: "12x12 Profile", filename: "e2pieces_profile_12x12.txt", size: 12 },
  ];
}