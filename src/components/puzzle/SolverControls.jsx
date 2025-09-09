
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Download, Upload, Check, ChevronsUpDown, Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSolver } from './SolverContext';

export default function SolverControls({ 
  isRunning, 
  onStart, 
  onPause, 
  onReset, 
  currentStats 
}) {
  const { 
    hintAdjacencyStats, loadBackupData, stats, currentRun, getSelectionPercentages, 
    mlParams, setMlParams, PLACEMENT_STRATEGIES, strategyStats, comparisonMetrics 
  } = useSolver();
  
  // Get current strategy stats for display
  const currentStrategyStats = strategyStats[mlParams.placementStrategy] || {
    totalRuns: 0,
    bestScore: 0,
    avgScore: 0,
    scores: []
  };
  
  // Calculate completed solutions for current strategy (256 is complete)
  const currentStrategyCompletedSolutions = currentStrategyStats.scores ? 
    currentStrategyStats.scores.filter(score => score === 256).length : 0;
  const [strategyOpen, setStrategyOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleDownload = () => {
    const csvRows = [];
    csvRows.push(['HintPosition', 'Direction', 'PieceId', 'Rotation', 'AvgScore', 'Count', 'BestScore', 'SelectionPercentage']);

    const allPercentages = {};
    Object.keys(hintAdjacencyStats).forEach(key => {
        const [hintPos, direction] = key.split('-');
        allPercentages[key] = getSelectionPercentages(hintPos, direction);
    });

    // Create CSV data from hint adjacency stats
    Object.keys(hintAdjacencyStats).forEach(key => {
        const [hintPos, direction] = key.split('-');
        const pieceData = hintAdjacencyStats[key];
        
        Object.keys(pieceData).forEach(pieceId => {
            const rotationData = pieceData[pieceId];
            Object.keys(rotationData).forEach(rotation => {
                const stats = rotationData[rotation];
                const percentage = allPercentages[key]?.[pieceId]?.[rotation] || 0;
                csvRows.push([
                    hintPos,
                    direction,
                    pieceId,
                    rotation,
                    stats.avgScore.toFixed(2),
                    stats.count,
                    stats.bestScore || 0, // Use 0 if bestScore is not available
                    percentage.toFixed(2)
                ]);
            });
        });
    });

    // Add metadata rows
    csvRows.push(['# METADATA', '', '', '', '', '', '', '']); // Ensure this row has 8 columns to match header length
    csvRows.push(['TotalRuns', stats.totalRuns || 0]);
    csvRows.push(['BestScore', stats.bestScore || 0]);
    csvRows.push(['AvgScore', (stats.avgScore || 0).toFixed(2)]);
    csvRows.push(['CompletedSolutions', stats.completedSolutions || 0]);
    csvRows.push(['CurrentRunNumber', currentRun.run || 0]);
    csvRows.push(['CurrentRunScore', currentRun.score || 0]);
    csvRows.push(['WeightingConstant', mlParams.weightingConstant]);
    csvRows.push(['UseCalibration', mlParams.useCalibration]);
    csvRows.push(['PlacementStrategy', mlParams.placementStrategy || 'optimized']);
    
    // Add strategy statistics
    csvRows.push(['# STRATEGY STATISTICS']);
    csvRows.push(['Strategy', 'Runs', 'Best', 'Avg', 'StdDev', 'DeadEnds', 'AvgTime', 'TotalPieces', 'AvgOptions']);
    
    Object.entries(strategyStats).forEach(([strategy, stats]) => {
      csvRows.push([
        strategy,
        stats.totalRuns,
        stats.bestScore,
        stats.avgScore.toFixed(2),
        stats.stdDev.toFixed(2),
        stats.deadEnds,
        stats.timeMetrics.avgTimePerRun.toFixed(2),
        stats.totalPiecesPlaced,
        stats.validOptionsStats.avgOptionsPerPosition.toFixed(2)
      ]);
    });
    
    // Add comparison metrics
    csvRows.push(['# COMPARISON METRICS']);
    csvRows.push(['OriginalWins', comparisonMetrics.originalWins]);
    csvRows.push(['OptimizedWins', comparisonMetrics.optimizedWins]);
    csvRows.push(['Ties', comparisonMetrics.ties]);
    csvRows.push(['AvgScoreDiff', comparisonMetrics.avgScoreDiff.toFixed(2)]);
    csvRows.push(['EfficiencyRatio', comparisonMetrics.efficiencyRatio.toFixed(2)]);
    csvRows.push(['TotalComparisons', comparisonMetrics.totalComparisons]);

    const csvContent = csvRows.map(row => row.map(cell => {
      // Ensure cells with commas or quotes are properly quoted
      const processedCell = String(cell).replace(/"/g, '""'); // Escape double quotes
      return `"${processedCell}"`;
    }).join(',')).join('\n');
    
    const dataBlob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().slice(0, 10);
    link.download = `E2-Solver-Backup-${date}-Run${currentRun.run}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvContent = e.target.result;
          const lines = csvContent.split('\n');
          const newHintAdjacencyStats = {};
          let newStats = { totalRuns: 0, bestScore: 0, avgScore: 0, completedSolutions: 0 };
          let newCurrentRun = { run: 0, score: 0 };
          let newMlParams = { weightingConstant: 0.1, useCalibration: true };
          let newStrategyStats = {
            original: {
              totalRuns: 0, scores: [], bestScore: 0, avgScore: 0, stdDev: 0,
              deadEnds: 0, totalPiecesPlaced: 0, positionFailures: {},
              timeMetrics: { totalTime: 0, avgTimePerRun: 0 },
              validOptionsStats: { totalOptions: 0, avgOptionsPerPosition: 0 }
            },
            optimized: {
              totalRuns: 0, scores: [], bestScore: 0, avgScore: 0, stdDev: 0,
              deadEnds: 0, totalPiecesPlaced: 0, positionFailures: {},
              timeMetrics: { totalTime: 0, avgTimePerRun: 0 },
              validOptionsStats: { totalOptions: 0, avgOptionsPerPosition: 0 }
            }
          };
          let newComparisonMetrics = {
            originalWins: 0, optimizedWins: 0, ties: 0,
            avgScoreDiff: 0, efficiencyRatio: 0, totalComparisons: 0
          };
          
          let isMetadata = false;
          
          for (let i = 1; i < lines.length; i++) { // Skip header
            const line = lines[i].trim();
            if (!line) continue;
            
            // Regex to split CSV line, handling quoted commas and unquoting cells
            const cells = line.match(/(?:[^,"]+|"[^"]*")+/g)?.map(cell => {
              // Remove surrounding quotes and unescape internal quotes
              return cell.startsWith('"') && cell.endsWith('"')
                ? cell.substring(1, cell.length - 1).replace(/""/g, '"')
                : cell;
            });

            if (!cells || cells.length === 0) continue;

            if (cells[0] === '# METADATA' || cells[0] === '# STRATEGY STATISTICS' || cells[0] === '# COMPARISON METRICS') {
              isMetadata = true;
              continue;
            }
            
            if (isMetadata) {
              const [key, value] = cells;
              switch (key) {
                case 'TotalRuns':
                  newStats.totalRuns = parseInt(value) || 0;
                  break;
                case 'BestScore':
                  newStats.bestScore = parseInt(value) || 0;
                  break;
                case 'AvgScore':
                  newStats.avgScore = parseFloat(value) || 0;
                  break;
                case 'CompletedSolutions':
                  newStats.completedSolutions = parseInt(value) || 0;
                  break;
                case 'CurrentRunNumber':
                  newCurrentRun.run = parseInt(value) || 0;
                  break;
                case 'CurrentRunScore':
                  newCurrentRun.score = parseInt(value) || 0;
                  break;
                case 'WeightingConstant':
                  newMlParams.weightingConstant = parseFloat(value) || 0.1;
                  break;
                case 'UseCalibration':
                  newMlParams.useCalibration = value === 'true';
                  break;
                case 'PlacementStrategy':
                  newMlParams.placementStrategy = value || 'optimized';
                  break;
                case 'OriginalWins':
                  newComparisonMetrics.originalWins = parseInt(value) || 0;
                  break;
                case 'OptimizedWins':
                  newComparisonMetrics.optimizedWins = parseInt(value) || 0;
                  break;
                case 'Ties':
                  newComparisonMetrics.ties = parseInt(value) || 0;
                  break;
                case 'AvgScoreDiff':
                  newComparisonMetrics.avgScoreDiff = parseFloat(value) || 0;
                  break;
                case 'EfficiencyRatio':
                  newComparisonMetrics.efficiencyRatio = parseFloat(value) || 0;
                  break;
                case 'TotalComparisons':
                  newComparisonMetrics.totalComparisons = parseInt(value) || 0;
                  break;
              }
            } else {
              // Note: The 'SelectionPercentage' column is exported but ignored on import,
              // as it's a derived value that will be recalculated based on loaded stats.
              const [hintPos, direction, pieceId, rotation, avgScore, count, bestScore] = cells; 
              if (hintPos && direction && pieceId && rotation) {
                const key = `${hintPos}-${direction}`;
                if (!newHintAdjacencyStats[key]) newHintAdjacencyStats[key] = {};
                if (!newHintAdjacencyStats[key][pieceId]) newHintAdjacencyStats[key][pieceId] = {};
                
                newHintAdjacencyStats[key][pieceId][rotation] = {
                  avgScore: parseFloat(avgScore) || 0,
                  count: parseInt(count) || 0,
                  bestScore: parseInt(bestScore) || 0
                };
              }
            }
          }
          
          loadBackupData({
            hintAdjacencyStats: newHintAdjacencyStats,
            solverState: {
              stats: newStats,
              currentRun: newCurrentRun,
              mlParams: newMlParams
            },
            strategyStats: newStrategyStats,
            comparisonMetrics: newComparisonMetrics
          });
          alert("CSV backup data loaded successfully! The solver's state has been restored.");
        } catch (error) {
          console.error("Failed to parse CSV file:", error);
          alert("Error: Could not load the data. Please ensure it's a valid CSV backup file.");
        }
      };
      reader.readAsText(file);
    }
    // Reset file input to allow uploading the same file again
    event.target.value = null;
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="bg-slate-950/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Solver Controls</h3>
          <p className="text-slate-300 text-sm max-w-md">
            Start the simulation or import a previous run.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={isRunning ? onPause : onStart}
            className={`w-28 ${
              isRunning 
                ? 'bg-orange-600 hover:bg-orange-700' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start
              </>
            )}
          </Button>
          
          <Button
            onClick={onReset}
            variant="outline"
            className="w-28 border-rose-500/50 text-rose-300 hover:bg-rose-500/20 hover:text-rose-200"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>

          <div className="flex gap-3">
             <Button
                onClick={handleDownload}
                variant="outline"
                className="border-sky-500/50 text-sky-300 hover:bg-sky-500/20 hover:text-sky-200"
                disabled={stats.totalRuns === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                CSV Export
              </Button>
              <Button
                onClick={triggerFileUpload}
                variant="outline"
                className="border-sky-500/50 text-sky-300 hover:bg-sky-500/20 hover:text-sky-200"
              >
                <Upload className="w-4 h-4 mr-2" />
                CSV Import
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".csv"
              />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-bold text-white">Machine Learning Controls</h3>
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-slate-400 hover:text-slate-200 transition-colors">
                <Info className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-slate-900 border-slate-700 text-slate-200">
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-100">Machine Learning Strategy</h4>
                <p className="text-sm text-slate-300">
                  {mlParams.useCalibration 
                    ? "After 1000 calibration runs, the solver uses machine learning to weight hint-adjacent pieces based on their historical performance. Selection probabilities are shown for each optimal piece/rotation."
                    : "The solver is using machine learning to weight hint-adjacent pieces based on historical performance. Selection probabilities are shown for each optimal piece/rotation. Calibration is disabled."
                  }
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
                <Label className="text-slate-300">Placement Strategy</Label>
                <Popover open={strategyOpen} onOpenChange={setStrategyOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={strategyOpen}
                      className="w-full justify-between bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50"
                    >
                      {PLACEMENT_STRATEGIES[mlParams.placementStrategy]?.name || "Select strategy..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-slate-900 border-slate-700">
                    <Command className="bg-slate-900">
                      <CommandInput placeholder="Search strategy..." className="text-slate-300" />
                      <CommandList>
                        <CommandEmpty>No strategy found.</CommandEmpty>
                        <CommandGroup>
                          {Object.entries(PLACEMENT_STRATEGIES).map(([key, strategy]) => (
                            <CommandItem
                              key={key}
                              value={key}
                              onSelect={(currentValue) => {
                                setMlParams(p => ({ ...p, placementStrategy: currentValue }));
                                setStrategyOpen(false);
                              }}
                              className="text-slate-300 hover:bg-slate-800"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  mlParams.placementStrategy === key ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div>
                                <div className="font-medium">{strategy.name}</div>
                                <div className="text-xs text-slate-400">{strategy.description}</div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-slate-400">
                  {PLACEMENT_STRATEGIES[mlParams.placementStrategy]?.description}
                </p>
            </div>
            <div className="space-y-3">
                <Label htmlFor="weight-slider" className="text-slate-300">
                    Learning Rate (k): {mlParams.weightingConstant.toFixed(2)}
                </Label>
                <Slider
                    id="weight-slider"
                    min={0.01}
                    max={1}
                    step={0.01}
                    value={[mlParams.weightingConstant]}
                    onValueChange={(value) => setMlParams(p => ({ ...p, weightingConstant: value[0] }))}
                />
                 <p className="text-xs text-slate-400">Higher values make the solver more aggressively favor high-scoring pieces.</p>
            </div>
            <div className="flex items-center space-x-3">
                <Switch
                    id="calibration-switch"
                    checked={mlParams.useCalibration}
                    onCheckedChange={(checked) => setMlParams(p => ({ ...p, useCalibration: checked }))}
                />
                <Label htmlFor="calibration-switch" className="text-slate-300">
                    Enable 1000 Run Calibration
                </Label>
            </div>
            <div className="space-y-3">
                <Label htmlFor="board-update-slider" className="text-slate-300">
                    Board Update Frequency: {mlParams.boardUpdateFrequency}
                </Label>
                <Slider
                    id="board-update-slider"
                    min={1}
                    max={50}
                    step={1}
                    value={[mlParams.boardUpdateFrequency]}
                    onValueChange={(value) => setMlParams(p => ({ ...p, boardUpdateFrequency: value[0] }))}
                />
                <p className="text-xs text-slate-400">Update visual board every N runs (higher = smoother, lower = more real-time)</p>
            </div>
        </div>
      </div>
      
      {currentStats && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center bg-slate-800/50 rounded-lg p-3">
             <div className="text-xs text-slate-400 uppercase tracking-wide">
              Total Runs
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {currentStrategyStats.totalRuns?.toLocaleString() || 0}
            </div>
          </div>
          
          <div className="text-center bg-slate-800/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 uppercase tracking-wide">
              Best Score
            </div>
            <div className="text-2xl font-bold text-green-400 mt-1">
              {currentStrategyStats.bestScore || 0}
            </div>
          </div>
          
          <div className="text-center bg-slate-800/50 rounded-lg p-3">
             <div className="text-xs text-slate-400 uppercase tracking-wide">
              Avg Score
            </div>
            <div className="text-2xl font-bold text-blue-400 mt-1">
              {currentStrategyStats.avgScore ? currentStrategyStats.avgScore.toFixed(1) : '0.0'}
            </div>
          </div>
          
          <div className="text-center bg-slate-800/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 uppercase tracking-wide">
              Solutions
            </div>
            <div className="text-2xl font-bold text-purple-400 mt-1">
              {currentStrategyCompletedSolutions}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
