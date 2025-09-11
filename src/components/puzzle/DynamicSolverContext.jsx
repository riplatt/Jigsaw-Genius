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
  const [bestPartialSolution, setBestPartialSolution] = useState({
    board: null,
    score: 0,
    timestamp: null
  });

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

  // Piece rotation utility
  const rotate = useCallback((edges, rot) => {
    const steps = Math.round(rot / 90) % 4;
    if (steps === 0) return [...edges];
    return [...edges.slice(4 - steps), ...edges.slice(0, 4 - steps)];
  }, []);

  // Memoize piece map for performance
  const pieceMap = useMemo(() => 
    Object.fromEntries(puzzleConfig.pieces.map(p => [p.id, p])), 
    [puzzleConfig.pieces]
  );

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

    // Create available pieces pool (excluding hints)
    const hintIds = new Set(Object.values(puzzleConfig.hints).map(h => h.id));
    let pool = puzzleConfig.pieces.filter(p => !hintIds.has(p.id));
    const used_ids = new Set(Object.values(puzzleConfig.hints).map(h => h.id));

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

      const validPlacements = [];

      // Try all available pieces with all rotations
      for (const piece of pool) {
        for (const rotation of [0, 90, 180, 270]) {
          const rotatedEdges = rotate(piece.edges, rotation);
          if (fits(newBoard, pos, rotatedEdges)) {
            validPlacements.push({
              piece,
              edges: rotatedEdges,
              rotation,
            });
          }
        }
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

      used_ids.add(chosenPlacement.piece.id);
      pool = pool.filter(p => p.id !== chosenPlacement.piece.id);
      placementCount++;
    }

    const score = newBoard.filter(p => p !== null).length;
    const endTime = performance.now();
    const executionTime = endTime - startTime;

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

    // Track best partial solution
    if (score > bestPartialSolution.score) {
      setBestPartialSolution({
        board: newBoard.map(p => p ? { ...p } : null), // Deep copy
        score,
        timestamp: new Date().toISOString()
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

  // Main solving loop using useEffect (like original SolverContext)
  useEffect(() => {
    if (!isRunning) return;

    let intervalId;
    
    const runSolvingLoop = async () => {
      await solve();
      if (isRunning) {
        intervalId = setTimeout(runSolvingLoop, solverConfig.SOLVER_INTERVAL);
      }
    };

    // Start the solving loop
    intervalId = setTimeout(runSolvingLoop, solverConfig.SOLVER_INTERVAL);

    return () => {
      if (intervalId) {
        clearTimeout(intervalId);
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
    setCurrentRun({ run: 0, score: 0 });
    setBoard(Array(puzzleConfig.boardSize * puzzleConfig.boardSize).fill(null));
    setRunsSinceLastBoardUpdate(0);
    setBestPartialSolution({ board: null, score: 0, timestamp: null });
  }, [puzzleConfig.boardSize, stopSolver]);

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
  };

  return (
    <DynamicSolverContext.Provider value={contextValue}>
      {children}
    </DynamicSolverContext.Provider>
  );
};

export default DynamicSolverProvider;