import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DynamicSolverProvider, useDynamicSolver } from "../components/puzzle/DynamicSolverContext";
import { eternityII_16x16 } from "../data/eternityII_16x16";

import PuzzleBoard from "../components/puzzle/PuzzleBoard";
import DynamicSolverControls from "../components/puzzle/DynamicSolverControls";
import HintAnalysis from "../components/puzzle/HintAnalysis";
import StrategyComparison from "../components/puzzle/StrategyComparison";

function SolverPageContent() {
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
    hintAdjacencyStats, 
    strategyStats, 
    comparisonMetrics, 
    placementStrategies,
    exportPartialSolution,
    setMlParams,
    loadPuzzle
  } = dynamicSolverContext;

  // Map interface for compatibility
  const hints = puzzleConfig.hints;
  const pieces = puzzleConfig.pieces;
  const PLACEMENT_STRATEGIES = placementStrategies;
  
  const handleStart = () => {
    if (isRunning) {
      stopSolver();
    } else {
      startSolver();
    }
  };
  
  const handlePause = () => stopSolver();
  const handleReset = () => resetSolver();

  const handleExportSolution = (type, solutionIndex = null) => {
    if (type === 'best') {
      // Export best partial solution
      exportPartialSolution();
    } else if (type === 'solution' && solutionIndex !== null) {
      // Export specific complete solution
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
  };
  
  const handlePuzzleLoad = (puzzleConfig) => {
    loadPuzzle(puzzleConfig);
  };

  const alertDescription = mlParams.useCalibration
    ? `After 1000 calibration runs, the solver uses machine learning to weight hint-adjacent pieces based on their historical performance. Selection probabilities are shown for each optimal piece/rotation.`
    : `The solver is using machine learning to weight hint-adjacent pieces based on historical performance. Selection probabilities are shown for each optimal piece/rotation. Calibration is disabled.`;

  return (
  <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        <DynamicSolverControls
          isRunning={isRunning}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          currentRun={currentRun}
          stats={stats}
          strategyStats={strategyStats}
          mlParams={mlParams}
          setMlParams={setMlParams}
          placementStrategies={placementStrategies}
          puzzleSize={puzzleConfig.boardSize}
          onLoadPuzzle={handlePuzzleLoad}
          puzzleConfig={puzzleConfig}
        />
        
        <PuzzleBoard 
          board={board} 
          size={puzzleConfig.boardSize}
          hints={hints}
          pieces={pieces}
          completedSolutions={completedSolutionsArray}
          bestPartialSolution={bestPartialSolution}
          isRunning={isRunning}
          currentRun={currentRun}
          onExportSolution={handleExportSolution}
        />

        {stats.completedSolutions > 0 && (
          <Alert className="bg-green-900/20 border-green-500/30 text-green-100">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              🎉 Congratulations! Found {stats.completedSolutions} complete solution{stats.completedSolutions > 1 ? 's' : ''}!
            </AlertDescription>
          </Alert>
        )}

        <HintAnalysis 
          hintAdjacencyStats={hintAdjacencyStats} 
          pieces={pieces} 
          hints={hints}
          stats={stats}
          mlParams={mlParams}
          getSelectionPercentages={dynamicSolverContext.getSelectionPercentages}
        />

      </div>
    </div>
  );
}

export default function SolverPage() {
  return (
    <DynamicSolverProvider initialPuzzle={eternityII_16x16}>
      <SolverPageContent />
    </DynamicSolverProvider>
  );
}