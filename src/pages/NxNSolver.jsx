import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Puzzle, Home } from "lucide-react";
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
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Puzzle className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              NxN Jigsaw Genius
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Advanced puzzle solver for Eternity II-style edge-matching puzzles of any size
          </p>
          
          {/* Puzzle Info Bar */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
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
        
        {/* Action Buttons - same level as controls */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="transition-all duration-200 shadow-lg backdrop-blur-sm bg-muted text-foreground hover:bg-accent"
          >
            <Home className="w-4 h-4 mr-2" />
            Eternity II Solver
          </Button>
          
          <Dialog open={puzzleDialogOpen} onOpenChange={setPuzzleDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="transition-all duration-200 shadow-lg backdrop-blur-sm bg-muted text-foreground hover:bg-accent"
              >
                <Puzzle className="w-4 h-4 mr-2" />
                Load Puzzle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-popover border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <Puzzle className="h-5 w-5" />
                  Puzzle Configuration
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
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
            className="transition-all duration-200 shadow-lg backdrop-blur-sm bg-muted text-foreground hover:bg-accent"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {showComparison ? 'Hide' : 'Show'} Strategy Comparison
          </Button>
        </div>

        {/* Strategy Comparison Panel */}
        {showComparison && (
          <div className="bg-card backdrop-blur-sm rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Strategy Comparison</h3>
            <p className="text-muted-foreground">
              Strategy performance comparison will be displayed here.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {Object.entries(placementStrategies).map(([key, strategy]) => (
                <div key={key} className="p-3 bg-muted rounded-lg">
                  <div className="font-semibold text-foreground">{strategy.name}</div>
                  <div className="text-sm text-muted-foreground">{strategy.description}</div>
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
          <div className="bg-secondary border border-border text-secondary-foreground rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary"></div>
              <span>
                🎉 Congratulations! Found {stats.completedSolutions} complete solution{stats.completedSolutions > 1 ? 's' : ''}!
              </span>
            </div>
          </div>
        )}

        <div className="bg-card backdrop-blur-sm rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Live Hint Adjacency Analysis</h3>
          <p className="text-muted-foreground">
            ML analysis will be displayed here once {puzzleConfig.boardSize <= 6 ? '100' : puzzleConfig.boardSize <= 10 ? '500' : '1000'} calibration runs are complete.
          </p>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">Puzzle: {puzzleConfig.name}</div>
            <div className="text-sm text-muted-foreground">Board Size: {puzzleConfig.boardSize}×{puzzleConfig.boardSize}</div>
            <div className="text-sm text-muted-foreground">Hints: {Object.keys(puzzleConfig.hints || {}).length}</div>
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