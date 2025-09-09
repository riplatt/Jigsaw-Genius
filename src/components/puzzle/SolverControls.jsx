
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Download, Upload, Check, ChevronsUpDown } from "lucide-react";
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
  const { hintAdjacencyStats, loadBackupData, stats, currentRun, getSelectionPercentages, mlParams, setMlParams, PLACEMENT_STRATEGIES } = useSolver();
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

            if (cells[0] === '# METADATA') {
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
            }
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
        <h3 className="text-xl font-bold text-white mb-4">Machine Learning Controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        </div>
      </div>
      
      {currentStats && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center bg-slate-800/50 rounded-lg p-3">
             <div className="text-xs text-slate-400 uppercase tracking-wide">
              Total Runs
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {currentStats.totalRuns?.toLocaleString() || 0}
            </div>
          </div>
          
          <div className="text-center bg-slate-800/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 uppercase tracking-wide">
              Best Score
            </div>
            <div className="text-2xl font-bold text-green-400 mt-1">
              {currentStats.bestScore || 0}
            </div>
          </div>
          
          <div className="text-center bg-slate-800/50 rounded-lg p-3">
             <div className="text-xs text-slate-400 uppercase tracking-wide">
              Avg Score
            </div>
            <div className="text-2xl font-bold text-blue-400 mt-1">
              {currentStats.avgScore ? currentStats.avgScore.toFixed(1) : '0.0'}
            </div>
          </div>
          
          <div className="text-center bg-slate-800/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 uppercase tracking-wide">
              Solutions
            </div>
            <div className="text-2xl font-bold text-purple-400 mt-1">
              {currentStats.completedSolutions || 0}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
