import React, { useState, useCallback } from "react";
import { BarChart3, Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { DynamicSolverProvider, useDynamicSolver } from "../components/puzzle/DynamicSolverContext";
import { PuzzleSelector } from "../components/puzzle/PuzzleSelector";

import PuzzleBoard from "../components/puzzle/PuzzleBoard";
import DynamicSolverControls from "../components/puzzle/DynamicSolverControls";

// Internal solver page component that uses the context
function NxNSolverContent() {
  const dynamicSolverContext = useDynamicSolver();
  const {
    puzzleConfig,
    board, 
    isRunning, 
    currentRun, 
    stats, 
    bestPartialSolution,
    completedSolutionsArray,
    mlParams,
    startSolver, 
    stopSolver, 
    resetSolver,
    placementStrategies,
    exportPartialSolution,
    loadPuzzle
  } = dynamicSolverContext;
  
  const [showComparison, setShowComparison] = useState(false);
  const [puzzleDialogOpen, setPuzzleDialogOpen] = useState(false);

  const handleStart = useCallback(() => {
    if (isRunning) {
      stopSolver();
    } else {
      startSolver();
    }
  }, [isRunning, startSolver, stopSolver]);

  const handlePause = useCallback(() => {
    stopSolver();
  }, [stopSolver]);

  const handleReset = useCallback(() => {
    resetSolver();
  }, [resetSolver]);

  const handlePuzzleLoad = useCallback((puzzleConfig) => {
    loadPuzzle(puzzleConfig);
    setPuzzleDialogOpen(false);
  }, [loadPuzzle]);

  const handleExportSolution = useCallback((type, solutionIndex = null) => {
    if (type === 'best') {
      // Export best partial solution
      exportPartialSolution();
    } else if (type === 'solution' && solutionIndex !== null) {
      // Export specific complete solution
      // We need to create a temporary export for the selected solution
      const solutionToExport = completedSolutionsArray[solutionIndex];
      if (solutionToExport) {
        // Use the existing export function but with the solution data
        const solutionData = {
          board: solutionToExport.board,
          score: solutionToExport.score,
          timestamp: solutionToExport.timestamp
        };
        exportPartialSolution(solutionData);
      }
    }
  }, [exportPartialSolution, completedSolutionsArray]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Puzzle className="h-8 w-8 text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              NxN Jigsaw Genius
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Advanced puzzle solver for Eternity II-style edge-matching puzzles of any size
          </p>
          
          {/* Puzzle Info Bar */}
          <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              {puzzleConfig.name}
            </span>
            <span>{puzzleConfig.boardSize}×{puzzleConfig.boardSize}</span>
            <span>{puzzleConfig.totalPieces} pieces</span>
            <span>{Object.keys(puzzleConfig.hints || {}).length} hints</span>
          </div>
        </div>

        <DynamicSolverControls
          isRunning={isRunning}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          currentRun={currentRun}
          stats={stats}
          mlParams={mlParams}
          setMlParams={dynamicSolverContext.setMlParams}
          placementStrategies={placementStrategies}
          puzzleSize={puzzleConfig.boardSize}
        />

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Dialog open={puzzleDialogOpen} onOpenChange={setPuzzleDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-purple-500/30 text-purple-200 hover:bg-purple-500/10 hover:border-purple-400/50 hover:text-purple-100 transition-all duration-200 shadow-lg backdrop-blur-sm bg-slate-900/50"
              >
                <Puzzle className="w-4 h-4 mr-2" />
                Load Puzzle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <Puzzle className="h-5 w-5" />
                  Puzzle Configuration
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  Select a puzzle to solve. Upload custom puzzles or choose from available mini-puzzles.
                </DialogDescription>
              </DialogHeader>
              <PuzzleSelector
                currentPuzzle={puzzleConfig}
                onPuzzleLoad={handlePuzzleLoad}
              />
            </DialogContent>
          </Dialog>
          
          <Button
            onClick={() => setShowComparison(!showComparison)}
            variant="outline"
            className="border-purple-500/30 text-purple-200 hover:bg-purple-500/10 hover:border-purple-400/50 hover:text-purple-100 transition-all duration-200 shadow-lg backdrop-blur-sm bg-slate-900/50"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {showComparison ? 'Hide' : 'Show'} Strategy Comparison
          </Button>
        </div>

        {/* Strategy Comparison Panel */}
        {showComparison && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Strategy Comparison</h3>
            <p className="text-slate-300">
              Strategy performance comparison will be displayed here.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {Object.entries(placementStrategies).map(([key, strategy]) => (
                <div key={key} className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="font-semibold text-white">{strategy.name}</div>
                  <div className="text-sm text-slate-400">{strategy.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <PuzzleBoard 
          board={board} 
          size={puzzleConfig.boardSize}
          hints={puzzleConfig.hints}
          pieces={puzzleConfig.pieces}
          completedSolutions={completedSolutionsArray}
          bestPartialSolution={bestPartialSolution}
          isRunning={isRunning}
          currentRun={currentRun}
          onExportSolution={handleExportSolution}
        />

        {stats.completedSolutions > 0 && (
          <div className="bg-green-900/20 border border-green-500/30 text-green-100 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-400"></div>
              <span>
                🎉 Congratulations! Found {stats.completedSolutions} complete solution{stats.completedSolutions > 1 ? 's' : ''}!
              </span>
            </div>
          </div>
        )}

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Live Hint Adjacency Analysis</h3>
          <p className="text-slate-300">
            ML analysis will be displayed here once {puzzleConfig.boardSize <= 6 ? '100' : puzzleConfig.boardSize <= 10 ? '500' : '1000'} calibration runs are complete.
          </p>
          <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
            <div className="text-sm text-slate-400">Puzzle: {puzzleConfig.name}</div>
            <div className="text-sm text-slate-400">Board Size: {puzzleConfig.boardSize}×{puzzleConfig.boardSize}</div>
            <div className="text-sm text-slate-400">Hints: {Object.keys(puzzleConfig.hints || {}).length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main exported component with context provider
export default function NxNSolverPage({ initialPuzzle = null }) {
  return (
    <DynamicSolverProvider initialPuzzle={initialPuzzle}>
      <NxNSolverContent />
    </DynamicSolverProvider>
  );
}