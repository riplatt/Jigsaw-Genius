import React from "react";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSolver } from "../components/puzzle/SolverContext";

import PuzzleBoard from "../components/puzzle/PuzzleBoard";
import SolverControls from "../components/puzzle/SolverControls";
import HintAnalysis from "../components/puzzle/HintAnalysis";

export default function SolverPage() {
  const {
    board, isRunning, currentRun, stats, hints, mlParams,
    handleStart, handlePause, handleReset,
    hintAdjacencyStats, pieces
  } = useSolver();

  const alertDescription = mlParams.useCalibration
    ? `After 1000 calibration runs, the solver uses machine learning to weight hint-adjacent pieces based on their historical performance. Selection probabilities are shown for each optimal piece/rotation.`
    : `The solver is using machine learning to weight hint-adjacent pieces based on historical performance. Selection probabilities are shown for each optimal piece/rotation. Calibration is disabled.`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Eternity II Puzzle Solver
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            A non-backtracking statistical solver. Running simulations to find high-scoring piece configurations.
          </p>
        </div>

        <SolverControls
          isRunning={isRunning}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          currentStats={stats}
        />
        
        <Alert className="bg-blue-900/20 border-blue-500/30 text-blue-200">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertTitle>Current Placement Strategy</AlertTitle>
            <AlertDescription>
              {alertDescription}
            </AlertDescription>
        </Alert>

        <PuzzleBoard
          board={board}
          hints={hints}
          currentRun={currentRun}
          isRunning={isRunning}
        />

        {stats.completedSolutions > 0 && (
          <Alert className="bg-green-900/20 border-green-500/30 text-green-100">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              🎉 Congratulations! Found {stats.completedSolutions} complete solution{stats.completedSolutions > 1 ? 's' : ''}!
            </AlertDescription>
          </Alert>
        )}

        <HintAnalysis hintAdjacencyStats={hintAdjacencyStats} pieces={pieces} />

      </div>
    </div>
  );
}