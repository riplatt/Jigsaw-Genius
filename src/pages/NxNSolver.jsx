import React, { useState, useCallback } from "react";
import { BarChart3, Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    mlParams,
    startSolver, 
    stopSolver, 
    resetSolver,
    placementStrategies,
    exportPartialSolution,
    loadPuzzle
  } = dynamicSolverContext;
  
  const [showComparison, setShowComparison] = useState(false);
  const [showPuzzleSelector, setShowPuzzleSelector] = useState(false);

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
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
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

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => setShowPuzzleSelector(!showPuzzleSelector)}
              variant="outline"
              className="text-slate-300 border-slate-600 hover:bg-slate-800"
            >
              <Puzzle className="h-4 w-4 mr-2" />
              {showPuzzleSelector ? 'Hide' : 'Load'} Puzzle
            </Button>
            
            {bestPartialSolution.board && (
              <Button
                onClick={exportPartialSolution}
                variant="outline"
                className="text-slate-300 border-slate-600 hover:bg-slate-800"
              >
                Export Best Solution ({bestPartialSolution.score} pieces)
              </Button>
            )}
            
            <Button
              onClick={() => setShowComparison(!showComparison)}
              variant="outline" 
              className="text-slate-300 border-slate-600 hover:bg-slate-800"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {showComparison ? 'Hide' : 'Show'} Strategy Comparison
            </Button>
          </div>
        </div>

        {/* Puzzle Selector */}
        {showPuzzleSelector && (
          <div className="mb-8">
            <PuzzleSelector
              currentPuzzle={puzzleConfig}
              onPuzzleLoad={loadPuzzle}
              className="max-w-4xl mx-auto"
            />
          </div>
        )}


        {/* Single Column Layout */}
        <div className="space-y-8 max-w-6xl mx-auto">
          {/* 1. Puzzle Selector */}
          {showPuzzleSelector && (
            <PuzzleSelector
              currentPuzzle={puzzleConfig}
              onPuzzleLoad={loadPuzzle}
            />
          )}

          {/* 2. Solver Controls */}
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

          {/* 3. Puzzle Board */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Puzzle Board</h3>
            <PuzzleBoard 
              board={board} 
              size={puzzleConfig.boardSize}
              hints={puzzleConfig.hints}
              pieces={puzzleConfig.pieces}
            />
          </div>

          {/* 4. Hint Analysis */}
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

        {/* Strategy Comparison (Full Width) */}
        {showComparison && (
          <div className="space-y-6">
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
          </div>
        )}
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