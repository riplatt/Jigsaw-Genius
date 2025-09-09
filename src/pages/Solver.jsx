import React, { useState } from "react";
import { AlertCircle, BarChart3 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useSolver } from "../components/puzzle/SolverContext";

import PuzzleBoard from "../components/puzzle/PuzzleBoard";
import SolverControls from "../components/puzzle/SolverControls";
import HintAnalysis from "../components/puzzle/HintAnalysis";
import StrategyComparison from "../components/puzzle/StrategyComparison";

export default function SolverPage() {
  const {
    board, isRunning, currentRun, stats, hints, mlParams,
    handleStart, handlePause, handleReset,
    hintAdjacencyStats, pieces, strategyStats, comparisonMetrics, PLACEMENT_STRATEGIES
  } = useSolver();
  
  const [showComparison, setShowComparison] = useState(false);

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
        
        {/* Strategy Comparison Toggle */}
        <div className="flex justify-center">
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
          <StrategyComparison 
            strategyStats={strategyStats}
            comparisonMetrics={comparisonMetrics}
            PLACEMENT_STRATEGIES={PLACEMENT_STRATEGIES}
          />
        )}
        
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