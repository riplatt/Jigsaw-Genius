import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { createSolverConfig } from "../../config/solver.js";
import { updateStrategyStats, updateComparisonMetrics } from "../../utils/statistics.js";
import { generatePlacementStrategies, calculateHintAdjacentPositions, validateStrategy } from "../../utils/strategyGenerator.js";
import { parsePuzzleFile } from "../../utils/puzzleParser.js";

// Default puzzle configuration using a real solvable 4x4 puzzle
const createDefaultE2Config = () => {
  // 4x4 puzzle content (from e2pieces_hard_4x4.txt)
  const puzzleContent = `4 4
0 0 1 1
0 0 1 2
0 0 2 1
0 0 2 2
0 1 3 1
0 1 3 2
0 1 4 1
0 1 5 2
0 2 4 1
0 2 4 2
0 2 5 1
0 2 5 2
3 3 5 5
3 4 3 5
3 4 4 4
3 5 5 4`;

  try {
    return parsePuzzleFile(puzzleContent, "default_4x4.txt");
  } catch (error) {
    console.error("Failed to create default config:", error);
    // Fallback to a minimal working 3x3 puzzle
    return {
      name: "Default 3x3 Puzzle",
      boardSize: 3,
      totalPieces: 9,
      pieces: [
        { id: 0, edges: [0, 1, 1, 0] },
        { id: 1, edges: [0, 2, 1, 1] },
        { id: 2, edges: [0, 0, 2, 2] },
        { id: 3, edges: [1, 1, 2, 0] },
        { id: 4, edges: [1, 2, 2, 1] },
        { id: 5, edges: [2, 0, 2, 2] },
        { id: 6, edges: [2, 1, 0, 0] },
        { id: 7, edges: [2, 2, 0, 1] },
        { id: 8, edges: [2, 0, 0, 2] },
      ],
      hints: {},
      metadata: {
        filename: "fallback_3x3.txt",
        parsedAt: new Date().toISOString(),
        edgeColorCount: 3
      }
    };
  }
};

const getInitialState = (key, defaultValue) => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const saveState = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error saving localStorage key "${key}":`, error);
  }
};

const DynamicSolverContext = createContext();
export const useDynamicSolver = () => useContext(DynamicSolverContext);

export const DynamicSolverProvider = ({ children, initialPuzzle = null }) => {
  // Core puzzle configuration state
  const [puzzleConfig, setPuzzleConfig] = useState(() => 
    initialPuzzle || createDefaultE2Config()
  );
  
  // Derived solver configuration
  const solverConfig = useMemo(() => createSolverConfig(puzzleConfig), [puzzleConfig]);
  
  // Dynamic placement strategies
  const placementStrategies = useMemo(() => 
    generatePlacementStrategies(puzzleConfig.boardSize, puzzleConfig.hints),
    [puzzleConfig.boardSize, puzzleConfig.hints]
  );
  
  // Hint-adjacent positions for ML
  const hintAdjacentPositions = useMemo(() =>
    calculateHintAdjacentPositions(puzzleConfig.boardSize, puzzleConfig.hints),
    [puzzleConfig.boardSize, puzzleConfig.hints]
  );
  
  // Board state
  const [board, setBoard] = useState(() => 
    Array(puzzleConfig.boardSize * puzzleConfig.boardSize).fill(null)
  );
  const [isRunning, setIsRunning] = useState(false);
  const [runsSinceLastBoardUpdate, setRunsSinceLastBoardUpdate] = useState(0);
  
  // Store completed solutions for browsing
  const [completedSolutionsArray, setCompletedSolutionsArray] = useState(() =>
    getInitialState(`solver-completedSolutions-${puzzleConfig.name}`, [])
  );

  // Store best partial solution board (single instance)
  const [bestPartialSolution, setBestPartialSolution] = useState(() =>
    getInitialState(`solver-bestPartialSolution-${puzzleConfig.name}`, { board: null, score: 0 })
  );

  // Persistent state with puzzle-specific keys
  const [currentRun, setCurrentRun] = useState(() =>
    getInitialState(`solver-currentRun-${puzzleConfig.name}`, { run: 0, score: 0 })
  );
  const [stats, setStats] = useState(() =>
    getInitialState(`solver-stats-${puzzleConfig.name}`, {
      totalRuns: 0,
      bestScore: 0,
      avgScore: 0,
      completedSolutions: 0,
    })
  );
  const [hintAdjacencyStats, setHintAdjacencyStats] = useState(() =>
    getInitialState(`solver-hintAdjacencyStats-${puzzleConfig.name}`, {})
  );
  const [mlParams, setMlParams] = useState(() =>
    getInitialState(`solver-mlParams-${puzzleConfig.name}`, {
      weightingConstant: 0.1,
      useCalibration: true,
      placementStrategy: 'optimized',
      boardUpdateFrequency: 10,
    })
  );
  
  // Strategy-specific statistics
  const [strategyStats, setStrategyStats] = useState(() => 
    getInitialState(`solver-strategyStats-${puzzleConfig.name}`, 
      Object.keys(placementStrategies).reduce((acc, key) => {
        acc[key] = {
          totalRuns: 0,
          scores: [],
          bestScore: 0,
          avgScore: 0,
          stdDev: 0,
          deadEnds: 0,
          totalPiecesPlaced: 0,
          positionFailures: {},
          timeMetrics: {
            totalTime: 0,
            avgTimePerRun: 0,
          },
          validOptionsStats: {
            totalOptions: 0,
            avgOptionsPerPosition: 0,
          }
        };
        return acc;
      }, {})
    )
  );

  const [comparisonMetrics, setComparisonMetrics] = useState(() =>
    getInitialState(`solver-comparisonMetrics-${puzzleConfig.name}`, {
      originalWins: 0,
      optimizedWins: 0,
      ties: 0,
      avgScoreDiff: 0,
      efficiencyRatio: 0,
      totalComparisons: 0,
    })
  );

  // Update board size when puzzle changes
  useEffect(() => {
    const newSize = puzzleConfig.boardSize * puzzleConfig.boardSize;
    setBoard(Array(newSize).fill(null));
    setRunsSinceLastBoardUpdate(0);
    setBestPartialSolution({ board: null, score: 0, timestamp: null });
  }, [puzzleConfig.boardSize]);

  // Memoize piece map for performance
  const pieceMap = useMemo(() => 
    Object.fromEntries(puzzleConfig.pieces.map(p => [p.id, p])), 
    [puzzleConfig.pieces]
  );

  // Piece rotation utility
  const rotate = useCallback((edges, rot) => {
    const steps = Math.round(rot / 90) % 4;
    if (steps === 0) return [...edges];
    return [...edges.slice(4 - steps), ...edges.slice(0, 4 - steps)];
  }, []);

  // Helper function to determine piece type based on edges
  const getPieceType = useCallback((edges) => {
    const zeroCount = edges.filter(edge => edge === 0).length;
    if (zeroCount === 2) {
      // Check if zeros are adjacent (corner piece)
      for (let i = 0; i < 4; i++) {
        if (edges[i] === 0 && edges[(i + 1) % 4] === 0) {
          return 'corner';
        }
      }
      // If two zeros but not adjacent, it's an invalid piece type for standard puzzles
      return 'invalid';
    } else if (zeroCount === 1) {
      return 'edge';
    } else if (zeroCount === 0) {
      return 'center';
    }
    return 'invalid';
  }, []);

  // Helper function to determine position type on board
  const getPositionType = useCallback((pos, SIZE) => {
    const row = Math.floor(pos / SIZE);
    const col = pos % SIZE;
    
    const isTopRow = row === 0;
    const isBottomRow = row === SIZE - 1;
    const isLeftCol = col === 0;
    const isRightCol = col === SIZE - 1;
    
    // Check if corner
    if ((isTopRow && isLeftCol) || (isTopRow && isRightCol) || 
        (isBottomRow && isLeftCol) || (isBottomRow && isRightCol)) {
      return 'corner';
    }
    
    // Check if edge (on border but not corner)
    if (isTopRow || isBottomRow || isLeftCol || isRightCol) {
      return 'edge';
    }
    
    // Otherwise it's a center position
    return 'center';
  }, []);

  // Pre-calculate all piece rotations for O(1) lookup (dynamic based on puzzle pieces)
  const preCalculatedRotations = useMemo(() => {
    const rotations = [];
    for (const piece of puzzleConfig.pieces) {
      for (const rotation of [0, 90, 180, 270]) {
        const rotatedEdges = rotate(piece.edges, rotation);
        const pieceType = getPieceType(rotatedEdges);
        rotations.push({
          id: piece.id,
          rotation: rotation,
          edges: rotatedEdges,
          originalPiece: piece,
          type: pieceType
        });
      }
    }
    return rotations;
  }, [puzzleConfig.pieces, rotate, getPieceType]);

  // Create edge-based lookup indices for fast constraint filtering
  const edgeIndices = useMemo(() => {
    const indices = {
      north: {},  // pieces by north edge value
      east: {},   // pieces by east edge value  
      south: {},  // pieces by south edge value
      west: {},   // pieces by west edge value
      // Type-based indices for position-specific filtering
      corner: [],  // indices of corner pieces
      edge: [],    // indices of edge pieces
      center: []   // indices of center pieces
    };

    preCalculatedRotations.forEach((pieceRotation, index) => {
      const [north, east, south, west] = pieceRotation.edges;
      
      // Index by each edge position
      if (!indices.north[north]) indices.north[north] = [];
      if (!indices.east[east]) indices.east[east] = [];
      if (!indices.south[south]) indices.south[south] = [];
      if (!indices.west[west]) indices.west[west] = [];
      
      // Store the index in preCalculatedRotations array for O(1) lookup
      indices.north[north].push(index);
      indices.east[east].push(index);
      indices.south[south].push(index);
      indices.west[west].push(index);
      
      // Also categorize by piece type for position-based filtering
      if (pieceRotation.type === 'corner') {
        indices.corner.push(index);
      } else if (pieceRotation.type === 'edge') {
        indices.edge.push(index);
      } else if (pieceRotation.type === 'center') {
        indices.center.push(index);
      }
    });

    return indices;
  }, [preCalculatedRotations]);

  // Helper function to find valid pieces using edge indices for fast constraint filtering
  const findValidPieces = useCallback((currentBoard, pos, availablePieceIds) => {
    const SIZE = puzzleConfig.boardSize;
    const row = Math.floor(pos / SIZE);
    const col = pos % SIZE;
    const directions = { north: -SIZE, east: 1, south: SIZE, west: -1 };
    
    // First filter by position type to eliminate incompatible pieces
    const positionType = getPositionType(pos, SIZE);
    let candidateIndices = new Set(edgeIndices[positionType] || []);
    
    // If no pieces match the position type, return empty
    if (candidateIndices.size === 0) {
      return [];
    }
    
    // Determine required edges based on position and neighbors
    let requiredNorth = null, requiredEast = null, requiredSouth = null, requiredWest = null;
    
    // Border constraints (must have edge 0 on borders)
    if (row === 0) requiredNorth = 0;
    if (col === SIZE - 1) requiredEast = 0;
    if (row === SIZE - 1) requiredSouth = 0;
    if (col === 0) requiredWest = 0;
    
    // Neighbor constraints (must match adjacent pieces)
    if (row > 0) {
      const northNeighbor = currentBoard[pos + directions.north];
      if (northNeighbor) requiredNorth = northNeighbor.edges[2]; // Match neighbor's south edge
    }
    if (col < SIZE - 1) {
      const eastNeighbor = currentBoard[pos + directions.east];
      if (eastNeighbor) requiredEast = eastNeighbor.edges[3]; // Match neighbor's west edge
    }
    if (row < SIZE - 1) {
      const southNeighbor = currentBoard[pos + directions.south];
      if (southNeighbor) requiredSouth = southNeighbor.edges[0]; // Match neighbor's north edge
    }
    if (col > 0) {
      const westNeighbor = currentBoard[pos + directions.west];
      if (westNeighbor) requiredWest = westNeighbor.edges[1]; // Match neighbor's east edge
    }
    
    // Now intersect with edge-based constraints (only from position-compatible pieces)
    let hasConstraints = false;
    
    // Intersect with edge-based constraints (starting from position-compatible pieces)
    if (requiredNorth !== null && edgeIndices.north[requiredNorth]) {
      candidateIndices = new Set([...candidateIndices].filter(x => edgeIndices.north[requiredNorth].includes(x)));
      hasConstraints = true;
    }
    
    if (requiredEast !== null && edgeIndices.east[requiredEast]) {
      candidateIndices = new Set([...candidateIndices].filter(x => edgeIndices.east[requiredEast].includes(x)));
      hasConstraints = true;
    }
    
    if (requiredSouth !== null && edgeIndices.south[requiredSouth]) {
      candidateIndices = new Set([...candidateIndices].filter(x => edgeIndices.south[requiredSouth].includes(x)));
      hasConstraints = true;
    }
    
    if (requiredWest !== null && edgeIndices.west[requiredWest]) {
      candidateIndices = new Set([...candidateIndices].filter(x => edgeIndices.west[requiredWest].includes(x)));
      hasConstraints = true;
    }
    
    // Filter by available pieces and return valid placements
    const validPlacements = [];
    for (const index of candidateIndices) {
      const pieceRotation = preCalculatedRotations[index];
      if (availablePieceIds.has(pieceRotation.id)) {
        validPlacements.push({
          piece: pieceRotation.originalPiece,
          rotation: pieceRotation.rotation,
          edges: pieceRotation.edges,
        });
      }
    }
    
    return validPlacements;
  }, [puzzleConfig.boardSize, preCalculatedRotations, edgeIndices, getPositionType]);

  // Save state to localStorage when it changes
  useEffect(() => {
    const puzzleName = puzzleConfig.name;
    localStorage.setItem(`solver-currentRun-${puzzleName}`, JSON.stringify(currentRun));
    localStorage.setItem(`solver-stats-${puzzleName}`, JSON.stringify(stats));
    localStorage.setItem(`solver-hintAdjacencyStats-${puzzleName}`, JSON.stringify(hintAdjacencyStats));
    localStorage.setItem(`solver-mlParams-${puzzleName}`, JSON.stringify(mlParams));
    localStorage.setItem(`solver-strategyStats-${puzzleName}`, JSON.stringify(strategyStats));
    localStorage.setItem(`solver-comparisonMetrics-${puzzleName}`, JSON.stringify(comparisonMetrics));
  }, [puzzleConfig.name, currentRun, stats, hintAdjacencyStats, mlParams, strategyStats, comparisonMetrics]);

  // Edge fitting validation
  const fits = useCallback((currentBoard, pos, pieceEdges) => {
    const SIZE = puzzleConfig.boardSize;
    const row = Math.floor(pos / SIZE);
    const col = pos % SIZE;

    // Border checks - edge 0 must be on border, non-0 must not be on border
    if ((row === 0) !== (pieceEdges[0] === 0)) return false; // North
    if ((col === SIZE - 1) !== (pieceEdges[1] === 0)) return false; // East  
    if ((row === SIZE - 1) !== (pieceEdges[2] === 0)) return false; // South
    if ((col === 0) !== (pieceEdges[3] === 0)) return false; // West

    const directions = { north: -SIZE, east: 1, south: SIZE, west: -1 };

    // Neighbor checks
    if (row > 0) {
      const neighbor = currentBoard[pos + directions.north];
      if (neighbor && neighbor.edges[2] !== pieceEdges[0]) return false;
    }
    if (col < SIZE - 1) {
      const neighbor = currentBoard[pos + directions.east];  
      if (neighbor && neighbor.edges[3] !== pieceEdges[1]) return false;
    }
    if (row < SIZE - 1) {
      const neighbor = currentBoard[pos + directions.south];
      if (neighbor && neighbor.edges[0] !== pieceEdges[2]) return false;
    }
    if (col > 0) {
      const neighbor = currentBoard[pos + directions.west];
      if (neighbor && neighbor.edges[1] !== pieceEdges[3]) return false;
    }

    return true;
  }, [puzzleConfig.boardSize]);

  // Yield control to maintain UI responsiveness
  const yieldToMain = useCallback(() => {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }, []);

  // Main solver function
  const solve = useCallback(async () => {
    const startTime = performance.now();
    const SIZE = puzzleConfig.boardSize;
    const currentStrategy = mlParams.placementStrategy;
    const strategy = placementStrategies[currentStrategy];
    
    if (!strategy) {
      console.error(`Strategy '${currentStrategy}' not found`);
      return;
    }

    // Initialize board with hints
    const newBoard = Array(SIZE * SIZE).fill(null);
    Object.entries(puzzleConfig.hints).forEach(([pos, hint]) => {
      const position = parseInt(pos);
      const piece = pieceMap[hint.id];
      if (piece) {
        newBoard[position] = {
          id: piece.id,
          edges: rotate(piece.edges, hint.rotation),
          rotation: hint.rotation,
        };
      }
    });

    // Create available pieces pool (excluding hints) - use Set for O(1) removal
    const hintIds = new Set(Object.values(puzzleConfig.hints).map(h => h.id));
    const availablePieceIds = new Set(
      puzzleConfig.pieces.filter(p => !hintIds.has(p.id)).map(p => p.id)
    );

    let placementCount = Object.keys(puzzleConfig.hints).length;
    let deadEndCount = 0;
    let totalValidOptions = 0;
    const positionFailures = {};

    // Follow placement strategy order
    for (const pos of strategy.order) {
      if (newBoard[pos] !== null) continue; // Skip if already placed (hint)

      // Yield control periodically for UI responsiveness
      if (performance.now() - startTime > solverConfig.PERFORMANCE.YIELD_THRESHOLD) {
        await yieldToMain();
      }

      // Use optimized piece selection with pre-calculated rotations and edge indices
      const pieceSelectionStart = performance.now();
      const validPlacements = findValidPieces(newBoard, pos, availablePieceIds);
      const pieceSelectionTime = performance.now() - pieceSelectionStart;
      
      // Log performance for first few positions of first few runs
      if (placementCount < 3 && stats.totalRuns < 5) {
        console.log(`Run ${stats.totalRuns + 1}, Position ${pos}: Found ${validPlacements.length} valid pieces in ${pieceSelectionTime.toFixed(2)}ms (${availablePieceIds.size} available)`);
      }

      totalValidOptions += validPlacements.length;

      if (validPlacements.length === 0) {
        deadEndCount++;
        positionFailures[pos] = (positionFailures[pos] || 0) + 1;
        break; // Dead end - restart
      }

      // Select placement (ML-enhanced for hint-adjacent positions)
      let chosenPlacement;
      const isWeightingActive = !mlParams.useCalibration || 
        stats.totalRuns > solverConfig.CALIBRATION_RUNS;

      if (hintAdjacentPositions.has(pos) && isWeightingActive) {
        // ML-weighted selection
        const weightedOptions = [];
        let totalWeight = 0;

        for (const p of validPlacements) {
          const pieceId = p.piece.id;
          const rotation = p.rotation;
          let weight = 1.0;

          // Find ML stats for this position
          const statsKey = findHintAdjacentStatsKey(pos, puzzleConfig.hints, SIZE);
          
          if (statsKey && hintAdjacencyStats[statsKey]?.[pieceId]?.[rotation]) {
            const localAvgScore = hintAdjacencyStats[statsKey][pieceId][rotation].avgScore;
            const globalAvgScore = stats.avgScore;
            const scoreDelta = localAvgScore - globalAvgScore;
            weight = Math.exp(mlParams.weightingConstant * scoreDelta);
          }

          weightedOptions.push({ placement: p, weight });
          totalWeight += weight;
        }

        // Weighted random selection
        let randomChoice = Math.random() * totalWeight;
        for (const option of weightedOptions) {
          randomChoice -= option.weight;
          if (randomChoice <= 0) {
            chosenPlacement = option.placement;
            break;
          }
        }
        if (!chosenPlacement) {
          chosenPlacement = weightedOptions[weightedOptions.length - 1].placement;
        }
      } else {
        // Standard random selection
        chosenPlacement = validPlacements[Math.floor(Math.random() * validPlacements.length)];
      }

      // Place the chosen piece
      newBoard[pos] = {
        id: chosenPlacement.piece.id,
        edges: chosenPlacement.edges,
        rotation: chosenPlacement.rotation,
      };

      availablePieceIds.delete(chosenPlacement.piece.id);
      placementCount++;
    }

    const score = newBoard.filter(p => p !== null).length;
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    // Log performance for first few runs
    if (stats.totalRuns < 5) {
      console.log(`Run ${stats.totalRuns + 1} (${currentStrategy}): Score ${score}/256 in ${executionTime.toFixed(1)}ms (${placementCount} pieces placed)`);
    }

    // Update stats
    const newTotalRuns = (stats.totalRuns || 0) + 1;
    const newAvgScore = ((stats.avgScore || 0) * (stats.totalRuns || 0) + score) / newTotalRuns;

    const currentStrategyStats = strategyStats[currentStrategy] || { totalRuns: 0 };
    const newCurrentRun = { run: currentStrategyStats.totalRuns + 1, score };
    const newStats = {
      totalRuns: newTotalRuns,
      bestScore: Math.max(stats.bestScore || 0, score),
      avgScore: newAvgScore,
      completedSolutions: (stats.completedSolutions || 0) + (score === SIZE * SIZE ? 1 : 0),
    };

    // Track best partial solution board (only if score improves)
    if (score > bestPartialSolution.score) {
      const newBestPartial = {
        board: newBoard.map(p => p ? { ...p } : null), // Deep copy
        score,
        timestamp: new Date().toISOString()
      };
      setBestPartialSolution(newBestPartial);
      
      // Persist to localStorage
      localStorage.setItem(`solver-bestPartialSolution-${puzzleConfig.name}`, JSON.stringify(newBestPartial));
    }

    // Store complete solutions
    if (score === SIZE * SIZE) {
      setCompletedSolutionsArray(prevSolutions => {
        const newSolution = {
          board: newBoard.map(p => p ? { ...p } : null), // Deep copy
          score,
          timestamp: new Date().toISOString(),
          runNumber: newCurrentRun.run,
          strategy: currentStrategy
        };
        
        // Check if this solution already exists (avoid duplicates)
        const solutionExists = prevSolutions.some(sol => 
          JSON.stringify(sol.board) === JSON.stringify(newSolution.board)
        );
        
        if (!solutionExists) {
          const updatedSolutions = [...prevSolutions, newSolution];
          saveState(`solver-completedSolutions-${puzzleConfig.name}`, updatedSolutions);
          return updatedSolutions;
        }
        return prevSolutions;
      });
    }

    // Update strategy stats
    setStrategyStats(prevStats => {
      const updatedStats = {
        ...prevStats,
        [currentStrategy]: updateStrategyStats(prevStats[currentStrategy], {
          score,
          deadEnds: deadEndCount,
          piecesPlaced: placementCount,
          executionTime,
          positionFailures,
          validOptions: totalValidOptions
        })
      };
      
      // Update comparison metrics if both strategies have data
      if (updatedStats.original?.totalRuns > 0 && updatedStats.optimized?.totalRuns > 0) {
        const latestOriginalScore = updatedStats.original.scores[updatedStats.original.scores.length - 1] || 0;
        const latestOptimizedScore = updatedStats.optimized.scores[updatedStats.optimized.scores.length - 1] || 0;
        
        if (currentStrategy === 'original' && updatedStats.optimized.scores.length > 0) {
          setComparisonMetrics(prev => updateComparisonMetrics(prev, score, latestOptimizedScore));
        } else if (currentStrategy === 'optimized' && updatedStats.original.scores.length > 0) {
          setComparisonMetrics(prev => updateComparisonMetrics(prev, latestOriginalScore, score));
        }
      }
      
      return updatedStats;
    });

    setCurrentRun(newCurrentRun);
    setStats(newStats);

    // Throttled visual board updates
    const newRunsSinceUpdate = runsSinceLastBoardUpdate + 1;
    if (newRunsSinceUpdate >= mlParams.boardUpdateFrequency) {
      setBoard(newBoard);
      setRunsSinceLastBoardUpdate(0);
    } else {
      setRunsSinceLastBoardUpdate(newRunsSinceUpdate);
    }

    // Update ML stats
    updateHintAdjacencyStatsForSolution(newBoard, score);

  }, [puzzleConfig, mlParams, placementStrategies, hintAdjacentPositions, pieceMap, 
      solverConfig, stats, bestPartialSolution.score, runsSinceLastBoardUpdate, 
      strategyStats, fits, rotate, yieldToMain]);

  // Helper to find hint-adjacent stats key
  const findHintAdjacentStatsKey = (pos, hints, SIZE) => {
    const directions = { north: -SIZE, east: 1, south: SIZE, west: -1 };
    
    return Object.keys(hints)
      .map(hPos => 
        Object.keys(directions).map(dir => ({
          pos: parseInt(hPos) + directions[dir],
          key: `${hPos}-${dir}`
        }))
      )
      .flat()
      .find(item => item.pos === pos)?.key;
  };

  // Update ML statistics after each solve
  const updateHintAdjacencyStatsForSolution = (solutionBoard, score) => {
    setHintAdjacencyStats(prevStats => {
      const newStats = { ...prevStats };
      const SIZE = puzzleConfig.boardSize;
      const directions = { north: -SIZE, east: 1, south: SIZE, west: -1 };

      Object.keys(puzzleConfig.hints).forEach(hintPosStr => {
        const hintPos = parseInt(hintPosStr);
        Object.entries(directions).forEach(([dirName, offset]) => {
          const adjPos = hintPos + offset;
          const row = Math.floor(adjPos / SIZE);
          const col = adjPos % SIZE;
          
          if (adjPos >= 0 && adjPos < SIZE * SIZE &&
              !(offset === directions.east && col === 0) &&
              !(offset === directions.west && col === SIZE - 1)) {
            
            const piece = solutionBoard[adjPos];
            if (piece) {
              const statsKey = `${hintPosStr}-${dirName}`;
              
              if (!newStats[statsKey]) newStats[statsKey] = {};
              if (!newStats[statsKey][piece.id]) newStats[statsKey][piece.id] = {};
              if (!newStats[statsKey][piece.id][piece.rotation]) {
                newStats[statsKey][piece.id][piece.rotation] = {
                  avgScore: 0,
                  count: 0,
                  bestScore: 0
                };
              }

              const entry = newStats[statsKey][piece.id][piece.rotation];
              entry.avgScore = (entry.avgScore * entry.count + score) / (entry.count + 1);
              entry.count++;
              entry.bestScore = Math.max(entry.bestScore, score);
            }
          }
        });
      });

      return newStats;
    });
  };

  // Main solving loop using requestAnimationFrame (like original SolverContext for efficiency)
  useEffect(() => {
    let animationFrame;
    let lastRunTime = 0;
    const TARGET_INTERVAL = solverConfig.SOLVER_INTERVAL;

    const runWithTimeSlicing = (timestamp) => {
      if (!isRunning) return;

      // Only run if enough time has passed since last run
      if (timestamp - lastRunTime >= TARGET_INTERVAL) {
        const startTime = performance.now();
        
        // Run the solver with a time budget
        solve().then(() => {
          const endTime = performance.now();
          const executionTime = endTime - startTime;
          
          lastRunTime = timestamp;
        });
      }

      animationFrame = requestAnimationFrame(runWithTimeSlicing);
    };

    if (isRunning) {
      animationFrame = requestAnimationFrame(runWithTimeSlicing);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isRunning, solve, solverConfig.SOLVER_INTERVAL]);

  // Solver control functions
  const startSolver = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stopSolver = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetSolver = useCallback(() => {
    stopSolver();
    
    // Reset run state
    setCurrentRun({ run: 0, score: 0 });
    setBoard(Array(puzzleConfig.boardSize * puzzleConfig.boardSize).fill(null));
    setRunsSinceLastBoardUpdate(0);
    
    // Reset solution tracking
    setBestPartialSolution({ board: null, score: 0, timestamp: null });
    setCompletedSolutionsArray([]);
    
    // Reset all statistics
    setStats({
      totalRuns: 0,
      bestScore: 0,
      avgScore: 0,
      completedSolutions: 0,
    });
    
    // Reset ML learning data
    setHintAdjacencyStats({});
    setStrategyStats({});
    setComparisonMetrics({});
    
    // Clear localStorage for this puzzle
    saveState(`solver-stats-${puzzleConfig.name}`, {
      totalRuns: 0,
      bestScore: 0,
      avgScore: 0,
      completedSolutions: 0,
    });
    saveState(`solver-hintAdjacencyStats-${puzzleConfig.name}`, {});
    saveState(`solver-strategyStats-${puzzleConfig.name}`, {});
    saveState(`solver-comparisonMetrics-${puzzleConfig.name}`, {});
    saveState(`solver-completedSolutions-${puzzleConfig.name}`, []);
    saveState(`solver-bestPartialSolution-${puzzleConfig.name}`, { board: null, score: 0, timestamp: null });
    
    console.log(`Reset all data for puzzle: ${puzzleConfig.name}`);
  }, [puzzleConfig.boardSize, puzzleConfig.name, stopSolver]);

  // Puzzle loading function
  const loadPuzzle = useCallback((newPuzzleConfig) => {
    stopSolver();
    setPuzzleConfig(newPuzzleConfig);
    
    // Validate new strategies
    const strategies = generatePlacementStrategies(newPuzzleConfig.boardSize, newPuzzleConfig.hints);
    Object.values(strategies).forEach(strategy => {
      validateStrategy(strategy, newPuzzleConfig.totalPieces);
    });
    
    // Reset state for new puzzle
    setCurrentRun({ run: 0, score: 0 });
    setRunsSinceLastBoardUpdate(0);
    setBestPartialSolution({ board: null, score: 0, timestamp: null });
    
    console.log(`Loaded puzzle: ${newPuzzleConfig.name} (${newPuzzleConfig.boardSize}x${newPuzzleConfig.boardSize})`);
  }, [stopSolver]);

  // Export functionality for partial solutions
  const exportPartialSolution = useCallback(() => {
    const currentBoard = bestPartialSolution.board || board;
    const exportData = {
      puzzleName: puzzleConfig.name,
      boardSize: puzzleConfig.boardSize,
      score: bestPartialSolution.score || currentBoard.filter(p => p !== null).length,
      timestamp: bestPartialSolution.timestamp || new Date().toISOString(),
      board: currentBoard,
      statistics: {
        totalRuns: stats.totalRuns,
        avgScore: stats.avgScore,
        bestScore: stats.bestScore,
        completedSolutions: stats.completedSolutions
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${puzzleConfig.name.toLowerCase().replace(/\s+/g, '_')}_partial_solution.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }, [puzzleConfig, bestPartialSolution, board, stats]);

  // Get selection percentages for ML weighting (for HintAnalysis display)
  const getSelectionPercentages = useCallback(
    (hintPos, direction) => {
      const key = `${hintPos}-${direction}`;
      const isWeightingActive = !mlParams.useCalibration || stats.totalRuns > 1000;
      
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
          percentages[pieceId][rotation] = totalWeight > 0 
            ? Math.round((weights[pieceId][rotation] / totalWeight) * 100)
            : 0;
        }
      }

      return percentages;
    },
    [hintAdjacencyStats, mlParams.weightingConstant, mlParams.useCalibration, stats.totalRuns, stats.avgScore]
  );

  const contextValue = {
    // Puzzle configuration
    puzzleConfig,
    loadPuzzle,
    
    // Solver state
    board,
    isRunning,
    currentRun,
    stats,
    bestPartialSolution,
    completedSolutionsArray,
    
    // Solver controls
    startSolver,
    stopSolver, 
    resetSolver,
    solve,
    
    // Configuration
    mlParams,
    setMlParams,
    placementStrategies,
    solverConfig,
    
    // Statistics
    hintAdjacencyStats,
    strategyStats,
    comparisonMetrics,
    
    // Export
    exportPartialSolution,
    
    // Utilities
    rotate,
    fits,
    getSelectionPercentages,
  };

  return (
    <DynamicSolverContext.Provider value={contextValue}>
      {children}
    </DynamicSolverContext.Provider>
  );
};

export default DynamicSolverProvider;