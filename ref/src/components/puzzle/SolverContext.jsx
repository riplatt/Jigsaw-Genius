
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';

// --- Data (final version from user's code) ---
const pieces = [
    {"id": 0, "edges": [0, 0, 1, 17]}, {"id": 1, "edges": [0, 0, 1, 5]}, {"id": 2, "edges": [0, 0, 9, 17]},
    {"id": 3, "edges": [0, 0, 17, 9]}, {"id": 4, "edges": [0, 1, 2, 1]}, {"id": 5, "edges": [0, 1, 10, 9]},
    {"id": 6, "edges": [0, 1, 6, 1]}, {"id": 7, "edges": [0, 1, 6, 13]}, {"id": 8, "edges": [0, 1, 11, 17]},
    {"id": 9, "edges": [0, 1, 7, 5]}, {"id": 10, "edges": [0, 1, 15, 9]}, {"id": 11, "edges": [0, 1, 8, 5]},
    {"id": 12, "edges": [0, 1, 8, 13]}, {"id": 13, "edges": [0, 1, 21, 5]}, {"id": 14, "edges": [0, 9, 10, 1]},
    {"id": 15, "edges": [0, 9, 18, 17]}, {"id": 16, "edges": [0, 9, 14, 13]}, {"id": 17, "edges": [0, 9, 19, 13]},
    {"id": 18, "edges": [0, 9, 7, 9]}, {"id": 19, "edges": [0, 9, 15, 9]}, {"id": 20, "edges": [0, 9, 4, 5]},
    {"id": 21, "edges": [0, 9, 12, 1]}, {"id": 22, "edges": [0, 9, 12, 13]}, {"id": 23, "edges": [0, 9, 20, 1]},
    {"id": 24, "edges": [0, 9, 21, 1]}, {"id": 25, "edges": [0, 17, 2, 9]}, {"id": 26, "edges": [0, 17, 2, 17]},
    {"id": 27, "edges": [0, 17, 10, 17]}, {"id": 28, "edges": [0, 17, 18, 17]}, {"id": 29, "edges": [0, 17, 7, 13]},
    {"id": 30, "edges": [0, 17, 15, 9]}, {"id": 31, "edges": [0, 17, 20, 17]}, {"id": 32, "edges": [0, 17, 8, 9]},
    {"id": 33, "edges": [0, 17, 8, 5]}, {"id": 34, "edges": [0, 17, 16, 13]}, {"id": 35, "edges": [0, 17, 22, 5]},
    {"id": 36, "edges": [0, 5, 18, 1]}, {"id": 37, "edges": [0, 5, 3, 13]}, {"id": 38, "edges": [0, 5, 11, 13]},
    {"id": 39, "edges": [0, 5, 19, 9]}, {"id": 40, "edges": [0, 5, 19, 17]}, {"id": 41, "edges": [0, 5, 15, 1]},
    {"id": 42, "edges": [0, 5, 15, 9]}, {"id": 43, "edges": [0, 5, 15, 17]}, {"id": 44, "edges": [0, 5, 4, 1]},
    {"id": 45, "edges": [0, 5, 20, 5]}, {"id": 46, "edges": [0, 5, 8, 5]}, {"id": 47, "edges": [0, 5, 16, 5]},
    {"id": 48, "edges": [0, 13, 2, 13]}, {"id": 49, "edges": [0, 13, 10, 1]}, {"id": 50, "edges": [0, 13, 10, 9]},
    {"id": 51, "edges": [0, 13, 6, 1]}, {"id": 52, "edges": [0, 13, 7, 5]}, {"id": 53, "edges": [0, 13, 4, 5]},
    {"id": 54, "edges": [0, 13, 4, 13]}, {"id": 55, "edges": [0, 13, 8, 17]}, {"id": 56, "edges": [0, 13, 16, 1]},
    {"id": 57, "edges": [0, 13, 16, 13]}, {"id": 58, "edges": [0, 13, 21, 9]}, {"id": 59, "edges": [0, 13, 22, 17]},
    {"id": 60, "edges": [2, 2, 6, 18]}, {"id": 61, "edges": [2, 2, 14, 7]}, {"id": 62, "edges": [2, 10, 10, 3]},
    {"id": 63, "edges": [2, 18, 2, 8]}, {"id": 64, "edges": [2, 18, 18, 22]}, {"id": 65, "edges": [2, 18, 14, 14]},
    {"id": 66, "edges": [2, 18, 11, 10]}, {"id": 67, "edges": [2, 18, 20, 6]}, {"id": 68, "edges": [2, 18, 22, 8]},
    {"id": 69, "edges": [2, 3, 3, 7]}, {"id": 70, "edges": [2, 3, 7, 12]}, {"id": 71, "edges": [2, 11, 14, 18]},
    {"id": 72, "edges": [2, 11, 15, 4]}, {"id": 73, "edges": [2, 11, 20, 15]}, {"id": 74, "edges": [2, 11, 8, 3]},
    {"id": 75, "edges": [2, 19, 14, 15]}, {"id": 76, "edges": [2, 19, 19, 15]}, {"id": 77, "edges": [2, 7, 3, 16]},
    {"id": 78, "edges": [2, 7, 20, 3]}, {"id": 79, "edges": [2, 7, 16, 21]}, {"id": 80, "edges": [2, 15, 19, 18]},
    {"id": 81, "edges": [2, 4, 18, 18]}, {"id": 82, "edges": [2, 4, 11, 4]}, {"id": 83, "edges": [2, 12, 18, 19]},
    {"id": 84, "edges": [2, 12, 6, 14]}, {"id": 85, "edges": [2, 12, 8, 12]}, {"id": 86, "edges": [2, 12, 16, 20]},
    {"id": 87, "edges": [2, 20, 2, 21]}, {"id": 88, "edges": [2, 20, 6, 22]}, {"id": 89, "edges": [2, 20, 4, 16]},
    {"id": 90, "edges": [2, 8, 11, 12]}, {"id": 91, "edges": [2, 8, 19, 15]}, {"id": 92, "edges": [2, 8, 19, 4]},
    {"id": 93, "edges": [2, 8, 4, 21]}, {"id": 94, "edges": [2, 8, 12, 14]}, {"id": 95, "edges": [2, 21, 21, 3]},
    {"id": 96, "edges": [2, 22, 4, 19]}, {"id": 97, "edges": [2, 22, 20, 8]}, {"id": 98, "edges": [2, 22, 21, 6]},
    {"id": 99, "edges": [2, 22, 22, 21]}, {"id": 100, "edges": [10, 10, 12, 15]}, {"id": 101, "edges": [10, 10, 12, 16]},
    {"id": 102, "edges": [10, 10, 16, 19]}, {"id": 103, "edges": [10, 10, 22, 6]}, {"id": 104, "edges": [10, 18, 4, 15]},
    {"id": 105, "edges": [10, 6, 3, 8]}, {"id": 106, "edges": [10, 6, 19, 8]}, {"id": 107, "edges": [10, 6, 4, 15]},
    {"id": 108, "edges": [10, 6, 16, 11]}, {"id": 109, "edges": [10, 14, 15, 12]},
    {"id": 110, "edges": [10, 14, 12, 15]}, {"id": 111, "edges": [10, 3, 20, 19]}, {"id": 112, "edges": [10, 3, 20, 16]},
    {"id": 113, "edges": [10, 11, 14, 4]}, {"id": 114, "edges": [10, 11, 7, 12]}, {"id": 115, "edges": [10, 11, 12, 11]},
    {"id": 116, "edges": [10, 11, 22, 16]}, {"id": 117, "edges": [10, 19, 3, 21]}, {"id": 118, "edges": [10, 7, 16, 12]},
    {"id": 119, "edges": [10, 15, 8, 22]}, {"id": 120, "edges": [10, 4, 14, 22]}, {"id": 121, "edges": [10, 20, 6, 16]},
    {"id": 122, "edges": [10, 20, 14, 19]}, {"id": 123, "edges": [10, 20, 20, 15]}, {"id": 124, "edges": [10, 8, 12, 22]},
    {"id": 125, "edges": [10, 8, 21, 15]}, {"id": 126, "edges": [10, 16, 14, 6]}, {"id": 127, "edges": [10, 16, 19, 21]},
    {"id": 128, "edges": [10, 16, 4, 3]}, {"id": 129, "edges": [10, 16, 20, 8]}, {"id": 130, "edges": [10, 21, 6, 20]},
    {"id": 131, "edges": [10, 21, 12, 14]}, {"id": 132, "edges": [10, 22, 14, 16]}, {"id": 133, "edges": [10, 22, 11, 4]},
    {"id": 134, "edges": [10, 22, 4, 3]}, {"id": 135, "edges": [10, 22, 16, 20]}, {"id": 136, "edges": [18, 18, 20, 7]},
    {"id": 137, "edges": [18, 6, 6, 3]}, {"id": 138, "edges": [18, 6, 6, 11]}, {"id": 139, "edges": [18, 6, 6, 12]},
    {"id": 140, "edges": [18, 6, 19, 21]}, {"id": 141, "edges": [18, 6, 15, 6]}, {"id": 142, "edges": [18, 6, 16, 12]},
    {"id": 143, "edges": [18, 6, 21, 21]}, {"id": 144, "edges": [18, 14, 3, 4]}, {"id": 145, "edges": [18, 3, 18, 12]},
    {"id": 146, "edges": [18, 3, 18, 22]}, {"id": 147, "edges": [18, 3, 3, 14]}, {"id": 148, "edges": [18, 3, 15, 12]},
    {"id": 149, "edges": [18, 19, 6, 11]}, {"id": 150, "edges": [18, 19, 4, 22]}, {"id": 151, "edges": [18, 7, 11, 11]},
    {"id": 152, "edges": [18, 7, 11, 19]}, {"id": 153, "edges": [18, 7, 22, 16]}, {"id": 154, "edges": [18, 4, 7, 7]},
    {"id": 155, "edges": [18, 4, 7, 12]}, {"id": 156, "edges": [18, 4, 22, 7]}, {"id": 157, "edges": [18, 20, 7, 16]},
    {"id": 158, "edges": [18, 20, 8, 6]}, {"id": 159, "edges": [18, 8, 21, 21]}, {"id": 160, "edges": [18, 16, 6, 20]},
    {"id": 161, "edges": [18, 16, 14, 20]}, {"id": 162, "edges": [18, 22, 15, 11]}, {"id": 163, "edges": [18, 22, 4, 16]},
    {"id": 6, "edges": [14, 14, 3, 4]}, {"id": 165, "edges": [6, 14, 4, 8]}, {"id": 166, "edges": [6, 11, 3, 3]},
    {"id": 167, "edges": [6, 19, 11, 15]}, {"id": 168, "edges": [6, 19, 19, 21]}, {"id": 169, "edges": [6, 7, 4, 8]},
    {"id": 170, "edges": [6, 7, 20, 16]}, {"id": 171, "edges": [6, 7, 21, 11]}, {"id": 172, "edges": [6, 15, 15, 15]},
    {"id": 173, "edges": [6, 15, 12, 20]}, {"id": 174, "edges": [6, 4, 7, 21]}, {"id": 175, "edges": [6, 12, 7, 19]},
    {"id": 176, "edges": [6, 20, 14, 4]}, {"id": 177, "edges": [6, 8, 12, 16]}, {"id": 178, "edges": [6, 8, 8, 15]},
    {"id": 179, "edges": [6, 16, 7, 16]}, {"id": 180, "edges": [6, 21, 11, 16]}, {"id": 181, "edges": [6, 21, 7, 11]},
    {"id": 182, "edges": [14, 14, 19, 8]}, {"id": 183, "edges": [14, 3, 22, 7]}, {"id": 184, "edges": [14, 11, 19, 12]},
    {"id": 185, "edges": [14, 11, 8, 8]}, {"id": 186, "edges": [14, 19, 21, 7]}, {"id": 187, "edges": [14, 7, 14, 21]},
    {"id": 188, "edges": [14, 7, 3, 19]}, {"id": 189, "edges": [14, 7, 16, 19]}, {"id": 190, "edges": [14, 15, 3, 3]},
    {"id": 191, "edges": [14, 15, 15, 20]}, {"id": 192, "edges": [14, 4, 11, 7]}, {"id": 193, "edges": [14, 12, 21, 11]},
    {"id": 194, "edges": [14, 12, 21, 22]}, {"id": 195, "edges": [14, 12, 22, 15]}, {"id": 196, "edges": [14, 20, 11, 22]},
    {"id": 197, "edges": [14, 20, 19, 8]}, {"id": 198, "edges": [14, 20, 20, 20]}, {"id": 199, "edges": [14, 8, 19, 3]},
    {"id": 200, "edges": [14, 16, 21, 8]}, {"id": 201, "edges": [14, 16, 22, 7]}, {"id": 202, "edges": [14, 21, 12, 19]},
    {"id": 203, "edges": [14, 21, 12, 8]}, {"id": 204, "edges": [14, 21, 16, 3]}, {"id": 205, "edges": [14, 21, 22, 21]},
    {"id": 206, "edges": [3, 3, 22, 7]}, {"id": 207, "edges": [3, 11, 19, 22]}, {"id": 208, "edges": [3, 11, 8, 15]},
    {"id": 209, "edges": [3, 7, 11, 19]}, {"id": 210, "edges": [3, 7, 16, 15]}, {"id": 211, "edges": [3, 15, 3, 16]},
    {"id": 212, "edges": [3, 4, 8, 8]}, {"id": 213, "edges": [3, 12, 3, 20]}, {"id": 214, "edges": [3, 12, 4, 22]},
    {"id": 215, "edges": [3, 12, 22, 21]}, {"id": 216, "edges": [3, 20, 19, 15]}, {"id": 217, "edges": [3, 16, 4, 12]},
    {"id": 218, "edges": [3, 21, 11, 4]}, {"id": 219, "edges": [3, 22, 11, 16]}, {"id": 220, "edges": [3, 22, 21, 21]},
    {"id": 221, "edges": [3, 22, 21, 22]}, {"id": 222, "edges": [11, 11, 12, 22]}, {"id": 223, "edges": [11, 11, 20, 7]},
    {"id": 224, "edges": [11, 11, 16, 15]}, {"id": 225, "edges": [11, 7, 19, 15]}, {"id": 226, "edges": [11, 7, 12, 12]},
    {"id": 227, "edges": [11, 4, 19, 8]}, {"id": 228, "edges": [11, 20, 7, 22]}, {"id": 229, "edges": [11, 20, 16, 8]},
    {"id": 230, "edges": [11, 8, 12, 20]}, {"id": 231, "edges": [11, 8, 12, 21]}, {"id": 232, "edges": [19, 19, 19, 20]},
    {"id": 233, "edges": [19, 7, 16, 4]}, {"id": 234, "edges": [19, 4, 7, 4]}, {"id": 235, "edges": [19, 4, 7, 20]},
    {"id": 236, "edges": [19, 4, 12, 15]}, {"id": 237, "edges": [19, 12, 4, 16]}, {"id": 238, "edges": [19, 20, 15, 22]},
    {"id": 239, "edges": [19, 20, 21, 15]}, {"id": 240, "edges": [19, 8, 7, 21]}, {"id": 241, "edges": [19, 8, 4, 21]},
    {"id": 242, "edges": [7, 15, 15, 12]}, {"id": 243, "edges": [7, 15, 20, 8]}, {"id": 244, "edges": [7, 4, 22, 20]},
    {"id": 245, "edges": [7, 21, 16, 22]}, {"id": 246, "edges": [15, 15, 21, 22]}, {"id": 247, "edges": [15, 4, 12, 4]},
    {"id": 248, "edges": [15, 12, 4, 21]}, {"id": 249, "edges": [15, 20, 16, 21]}, {"id": 250, "edges": [4, 4, 22, 8]},
    {"id": 251, "edges": [4, 12, 8, 12]}, {"id": 252, "edges": [12, 8, 16, 20]}, {"id": 253, "edges": [20, 16, 21, 16]},
    {"id": 254, "edges": [20, 22, 16, 22]}, {"id": 255, "edges": [8, 22, 21, 22]}
];

const hints = {
    135: {"id": 138, "rotation": 180},
    34:  {"id": 207, "rotation": 270},
    45:  {"id": 254, "rotation": 270},
    210: {"id": 180, "rotation": 270},
    221: {"id": 248, "rotation": 0},
};

// CORRECT fixed order from user - starts with hint positions and their adjacents
const fixed_order = [
    34, 45, 135, 210, 221, 18, 29, 33, 35, 44, 46, 50, 61, 119, 134, 136, 151, 194, 205, 209, 211, 220, 222, 226, 237, 17, 19, 28, 30, 49, 51, 60, 62, 118, 120, 150, 152, 193, 195, 204, 206, 225, 227, 236, 238, 2, 13, 32, 36, 43, 47, 66, 77, 103, 133, 137, 167, 178, 189, 208, 212, 219, 223, 242, 253, 0, 1, 3, 4, 11, 12, 14, 15, 16, 20, 27, 31, 48, 52, 59, 63, 64, 65, 67, 68, 75, 76, 78, 79, 101, 102, 104, 105, 117, 121, 149, 153, 165, 166, 168, 169, 176, 177, 179, 180, 187, 188, 190, 191, 192, 196, 203, 207, 224, 228, 235, 239, 240, 241, 243, 244, 251, 252, 254, 255, 37, 42, 82, 87, 93, 132, 138, 162, 173, 183, 213, 218, 5, 10, 21, 26, 53, 58, 69, 74, 80, 81, 83, 84, 85, 86, 88, 89, 90, 91, 92, 94, 95, 100, 106, 116, 122, 148, 154, 160, 161, 163, 164, 170, 171, 172, 174, 175, 181, 182, 184, 185, 186, 197, 202, 229, 234, 245, 250, 7, 24, 39, 56, 112, 114, 124, 126, 129, 141, 143, 215, 232, 247, 9, 22, 41, 54, 71, 97, 109, 111, 131, 139, 144, 146, 156, 158, 200, 217, 230, 249, 73, 99, 107, 198, 6, 8, 96, 127, 128, 159, 246, 248, 23, 25, 38, 40, 55, 57, 70, 72, 98, 108, 110, 113, 115, 123, 125, 130, 140, 142, 145, 147, 155, 157, 199, 201, 214, 216, 231, 233
];

const SIZE = 16;
const pieceMap = Object.fromEntries(pieces.map(p => [p.id, p]));
const directions = { north: -SIZE, east: 1, south: SIZE, west: -1 }; // Use SIZE for directions

// --- Pre-calculate hint-adjacent positions for efficient lookup ---
const hintAdjacentPositions = new Set();
Object.keys(hints).forEach(hintPosStr => {
    const hintPos = parseInt(hintPosStr);
    Object.values(directions).forEach(offset => {
        const adjPos = hintPos + offset;
        const row = Math.floor(adjPos / SIZE);
        const col = adjPos % SIZE;
        // Check for valid position within board bounds and no wrap-around between rows for horizontal movements
        if (adjPos >= 0 && adjPos < SIZE * SIZE &&
            !(offset === directions.east && col === 0) && // Moved right, but landed on col 0 (implies wrap-around)
            !(offset === directions.west && col === SIZE - 1)) // Moved left, but landed on col SIZE-1 (implies wrap-around)
        {
            hintAdjacentPositions.add(adjPos);
        }
    });
});

const CALIBRATION_RUNS = 1000;

const getInitialState = (key, defaultValue) => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
        return defaultValue;
    }
};

const SolverContext = createContext();
export const useSolver = () => useContext(SolverContext);

export const SolverProvider = ({ children }) => {
  const [board, setBoard] = useState(Array(SIZE * SIZE).fill(null));
  const [isRunning, setIsRunning] = useState(false);
  
  // --- Persistent State ---
  const [currentRun, setCurrentRun] = useState(() => getInitialState('solver-currentRun', { run: 0, score: 0 }));
  const [stats, setStats] = useState(() => getInitialState('solver-stats', {
    totalRuns: 0, bestScore: 0, avgScore: 0, completedSolutions: 0
  }));
  const [hintAdjacencyStats, setHintAdjacencyStats] = useState(() => getInitialState('solver-hintAdjacencyStats', {}));
  const [mlParams, setMlParams] = useState(() => getInitialState('solver-mlParams', {
    weightingConstant: 0.1,
    useCalibration: true
  }));

  // --- Save state to localStorage on change ---
  useEffect(() => {
    localStorage.setItem('solver-currentRun', JSON.stringify(currentRun));
    localStorage.setItem('solver-stats', JSON.stringify(stats));
    localStorage.setItem('solver-hintAdjacencyStats', JSON.stringify(hintAdjacencyStats));
    localStorage.setItem('solver-mlParams', JSON.stringify(mlParams));
  }, [currentRun, stats, hintAdjacencyStats, mlParams]);

  const rotate = (edges, rot) => {
    const steps = Math.round(rot / 90) % 4;
    if (steps === 0) return [...edges];
    return [...edges.slice(4 - steps), ...edges.slice(0, 4 - steps)];
  };
  
  const fits = (currentBoard, pos, pieceEdges) => {
    const row = Math.floor(pos / SIZE);
    const col = pos % SIZE;

    // --- BORDER CHECKS ---
    // A '0' edge MUST be on the corresponding border.
    // A non-'0' edge MUST NOT be on the corresponding border.
    
    // North edge
    if ((row === 0) !== (pieceEdges[0] === 0)) return false;
    // East edge
    if ((col === SIZE - 1) !== (pieceEdges[1] === 0)) return false;
    // South edge
    if ((row === SIZE - 1) !== (pieceEdges[2] === 0)) return false;
    // West edge
    if ((col === 0) !== (pieceEdges[3] === 0)) return false;

    // --- NEIGHBOR CHECKS ---
    // Check North neighbor
    if (row > 0) {
      const neighbor = currentBoard[pos + directions.north];
      if (neighbor && neighbor.edges[2] !== pieceEdges[0]) {
        return false; // My North must match neighbor's South
      }
    }

    // Check East neighbor
    if (col < SIZE - 1) {
      const neighbor = currentBoard[pos + directions.east];
      if (neighbor && neighbor.edges[3] !== pieceEdges[1]) {
        return false; // My East must match neighbor's West
      }
    }

    // Check South neighbor
    if (row < SIZE - 1) {
      const neighbor = currentBoard[pos + directions.south];
      if (neighbor && neighbor.edges[0] !== pieceEdges[2]) {
        return false; // My South must match neighbor's North
      }
    }

    // Check West neighbor
    if (col > 0) {
      const neighbor = currentBoard[pos + directions.west];
      if (neighbor && neighbor.edges[1] !== pieceEdges[3]) {
        return false; // My West must match neighbor's East
      }
    }

    return true;
  };

  const runSingleLayout = useCallback(() => {
    const newBoard = Array(SIZE * SIZE).fill(null);
    let pool = [...pieces];
    const used_ids = new Set();

    // Place hints first
    for (const [posStr, hint] of Object.entries(hints)) {
        const pos = parseInt(posStr);
        const piece = pieceMap[hint.id];
        if (piece) {
            newBoard[pos] = {
                id: piece.id,
                edges: rotate(piece.edges, hint.rotation),
                rotation: hint.rotation,
                isHint: true,
            };
            used_ids.add(piece.id);
        }
    }
    
    pool = pool.filter(p => !used_ids.has(p.id));

    // Follow the fixed order for placement
    for (const pos of fixed_order) {
      if (newBoard[pos] !== null) continue;
      
      const validPlacements = [];

      // Find all possible pieces and their rotations that fit
      for (const piece of pool) {
          for (const rotation of [0, 90, 180, 270]) {
              const rotatedEdges = rotate(piece.edges, rotation);
              if (fits(newBoard, pos, rotatedEdges)) {
                  validPlacements.push({
                      piece: piece,
                      rotation: rotation,
                      edges: rotatedEdges,
                  });
              }
          }
      }

      // If any valid placements were found, pick one
      if (validPlacements.length > 0) {
          let chosenPlacement;

          // --- Weighted ML Selection for Hint-Adjacent spots ---
          const isWeightingActive = !mlParams.useCalibration || stats.totalRuns > CALIBRATION_RUNS;
          if (hintAdjacentPositions.has(pos) && isWeightingActive) { 
              const weightedOptions = [];
              let totalWeight = 0;

              for (const p of validPlacements) {
                  const pieceId = p.piece.id;
                  const rotation = p.rotation;
                  let weight = 1.0; // Default weight for exploration

                  // Find performance stats for this specific piece and rotation
                  // The `key` structure here is for identifying the specific hint-adjacent position
                  const statsKey = Object.keys(hints).map(hPos => 
                      Object.keys(directions).map(dir => ({ pos: parseInt(hPos) + directions[dir], key: `${hPos}-${dir}`}))
                  ).flat().find(item => item.pos === pos)?.key;
                  
                  if (statsKey && hintAdjacencyStats[statsKey]?.[pieceId]?.[rotation]) {
                      const localAvgScore = hintAdjacencyStats[statsKey][pieceId][rotation].avgScore;
                      const globalAvgScore = stats.avgScore;
                      const scoreDelta = localAvgScore - globalAvgScore;
                      weight = Math.exp(mlParams.weightingConstant * scoreDelta);
                  }

                  weightedOptions.push({ placement: p, weight: weight });
                  totalWeight += weight;
              }

              // --- Weighted Random Choice ---
              let randomChoice = Math.random() * totalWeight;
              for (const option of weightedOptions) {
                  randomChoice -= option.weight;
                  if (randomChoice <= 0) {
                      chosenPlacement = option.placement;
                      break;
                  }
              }
              if (!chosenPlacement) chosenPlacement = weightedOptions[weightedOptions.length-1].placement; // Fallback
          
          } else {
            // --- Standard Random Selection ---
            chosenPlacement = validPlacements[Math.floor(Math.random() * validPlacements.length)];
          }
          
          newBoard[pos] = {
              id: chosenPlacement.piece.id,
              edges: chosenPlacement.edges,
              rotation: chosenPlacement.rotation,
          };
          
          used_ids.add(chosenPlacement.piece.id);
          pool = pool.filter(p => p.id !== chosenPlacement.piece.id);
      }
    }
    
    const score = newBoard.filter(p => p !== null).length;
    setBoard(newBoard);
    
    const newTotalRuns = (stats.totalRuns || 0) + 1;
    const newAvgScore = (((stats.avgScore || 0) * (stats.totalRuns || 0)) + score) / newTotalRuns;
    
    setCurrentRun({ run: (currentRun.run || 0) + 1, score });
    setStats({
        totalRuns: newTotalRuns,
        bestScore: Math.max(stats.bestScore || 0, score),
        avgScore: newAvgScore,
        completedSolutions: (stats.completedSolutions || 0) + (score === (SIZE * SIZE) ? 1 : 0) // Updated to use SIZE
    });

    // Update hint adjacency stats with rotation
    setHintAdjacencyStats(prevStats => {
      const newStats = JSON.parse(JSON.stringify(prevStats));
      Object.keys(hints).forEach(hintPosStr => {
        const hintPos = parseInt(hintPosStr);
        Object.entries(directions).forEach(([dirName, offset]) => {
          const adjPos = hintPos + offset;
          const row = Math.floor(adjPos / SIZE);
          const col = adjPos % SIZE;
          // Apply same boundary checks as in hintAdjacentPositions setup
          if (adjPos >= 0 && adjPos < SIZE * SIZE &&
              !(offset === directions.east && col === 0) &&
              !(offset === directions.west && col === SIZE - 1)) {

              const adjacentPiece = newBoard[adjPos];
              if (adjacentPiece && !adjacentPiece.isHint) {
                const { id: pieceId, rotation } = adjacentPiece;
                const key = `${hintPos}-${dirName}`;
                
                if (!newStats[key]) newStats[key] = {};
                if (!newStats[key][pieceId]) newStats[key][pieceId] = {};
                if (!newStats[key][pieceId][rotation]) newStats[key][pieceId][rotation] = { avgScore: 0, count: 0, bestScore: 0 };
                
                const currentPieceStats = newStats[key][pieceId][rotation];
                const newCount = currentPieceStats.count + 1;
                // Update running average: Avg_n = Avg_{n-1} + (Value_n - Avg_{n-1}) / n
                const newAvgScore = currentPieceStats.avgScore + (score - currentPieceStats.avgScore) / newCount;

                currentPieceStats.avgScore = newAvgScore;
                currentPieceStats.count = newCount;
                currentPieceStats.bestScore = Math.max(currentPieceStats.bestScore || 0, score);
              }
          }
        });
      });
      return newStats;
    });
  }, [stats, currentRun, hintAdjacencyStats, mlParams]);
  
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(runSingleLayout, 333); // Run 3x faster
    }
    return () => clearInterval(interval);
  }, [isRunning, runSingleLayout]);
  
  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setBoard(Array(SIZE * SIZE).fill(null));
    const initialRunState = { run: 0, score: 0 };
    const initialStatsState = { totalRuns: 0, bestScore: 0, avgScore: 0, completedSolutions: 0 };
    const initialHintState = {};
    const initialMlParams = { weightingConstant: 0.1, useCalibration: true };
    
    setCurrentRun(initialRunState);
    setStats(initialStatsState);
    setHintAdjacencyStats(initialHintState);
    setMlParams(initialMlParams);
    
    localStorage.removeItem('solver-currentRun');
    localStorage.removeItem('solver-stats');
    localStorage.removeItem('solver-hintAdjacencyStats');
    localStorage.removeItem('solver-mlParams');
  };

  const loadBackupData = (data) => {
      if(data && data.solverState && data.hintAdjacencyStats) {
          setStats(data.solverState.stats || { totalRuns: 0, bestScore: 0, avgScore: 0, completedSolutions: 0 });
          setCurrentRun(data.solverState.currentRun || { run: 0, score: 0 });
          setHintAdjacencyStats(data.hintAdjacencyStats || {});
          setMlParams(data.solverState.mlParams || { weightingConstant: 0.1, useCalibration: true });
          setBoard(Array(SIZE * SIZE).fill(null)); // Reset board view on load
      } else {
          console.error("Invalid backup file format");
          alert("Could not load data. The file format is invalid.");
      }
  };

  // Add function to calculate selection percentages
  const getSelectionPercentages = useCallback((hintPos, direction) => {
    const key = `${hintPos}-${direction}`;
    const isWeightingActive = !mlParams.useCalibration || stats.totalRuns > CALIBRATION_RUNS;
    if (!hintAdjacencyStats[key] || !isWeightingActive) {
      return {};
    }

    const pieceStats = hintAdjacencyStats[key];
    const weights = {};
    let totalWeight = 0;

    // Calculate weights for all pieces/rotations
    for (const pieceId in pieceStats) {
      for (const rotation in pieceStats[pieceId]) {
        const localAvgScore = pieceStats[pieceId][rotation].avgScore;
        const globalAvgScore = stats.avgScore;
        const scoreDelta = localAvgScore - globalAvgScore;
        const weight = Math.exp(mlParams.weightingConstant * scoreDelta);
        
        if (!weights[pieceId]) weights[pieceId] = {};
        weights[pieceId][rotation] = weight;
        totalWeight += weight;
      }
    }

    // Convert to percentages
    const percentages = {};
    for (const pieceId in weights) {
      percentages[pieceId] = {};
      for (const rotation in weights[pieceId]) {
        percentages[pieceId][rotation] = (weights[pieceId][rotation] / totalWeight) * 100;
      }
    }

    return percentages;
  }, [hintAdjacencyStats, stats, mlParams]);

  const value = {
    board, isRunning, currentRun, stats, hintAdjacencyStats, pieces, hints, mlParams,
    handleStart, handlePause, handleReset, loadBackupData, getSelectionPercentages, setMlParams
  };

  return (
    <SolverContext.Provider value={value}>
      {children}
    </SolverContext.Provider>
  );
};
