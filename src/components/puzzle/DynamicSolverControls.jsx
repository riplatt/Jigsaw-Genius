import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Download, Upload, Check, ChevronsUpDown, Info, HelpCircle, Puzzle } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { PuzzleSelector } from "./PuzzleSelector";

export default function DynamicSolverControls({
  isRunning, 
  onStart, 
  onPause, 
  onReset,
  currentRun,
  stats,
  strategyStats,
  mlParams,
  setMlParams,
  placementStrategies,
  puzzleSize,
  onLoadPuzzle,
  puzzleConfig
}) {
  const [strategyOpen, setStrategyOpen] = useState(false);
  const [strategyValue, setStrategyValue] = useState(mlParams?.placementStrategy || "optimized");
  const [puzzleDialogOpen, setPuzzleDialogOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handlePuzzleLoad = (puzzleConfig) => {
    if (onLoadPuzzle) {
      onLoadPuzzle(puzzleConfig);
    }
    setPuzzleDialogOpen(false);
  };

  // Get current strategy stats for display
  const strategyOptions = Object.entries(placementStrategies || {}).map(([key, strategy]) => ({
    value: key,
    label: strategy.name,
    description: strategy.description
  }));

  const currentStrategy = strategyOptions.find(s => s.value === strategyValue) || strategyOptions[0];

  const handleStrategyChange = (value) => {
    setStrategyValue(value);
    setStrategyOpen(false);
    if (setMlParams) {
      setMlParams(prev => ({ ...prev, placementStrategy: value }));
    }
  };

  const handleWeightingChange = (value) => {
    if (setMlParams) {
      setMlParams(prev => ({ ...prev, weightingConstant: value[0] }));
    }
  };

  const handleCalibrationChange = (checked) => {
    if (setMlParams) {
      setMlParams(prev => ({ ...prev, useCalibration: checked }));
    }
  };

  const handleFrequencyChange = (value) => {
    if (setMlParams) {
      setMlParams(prev => ({ ...prev, boardUpdateFrequency: value[0] }));
    }
  };

  const mlInfoText = mlParams?.useCalibration
    ? `After ${puzzleSize <= 6 ? '100' : puzzleSize <= 10 ? '500' : '1000'} calibration runs, the solver uses machine learning to weight hint-adjacent pieces based on their historical performance. Selection probabilities are shown for each optimal piece/rotation.`
    : `The solver is using machine learning to weight hint-adjacent pieces based on their historical performance. Selection probabilities are shown for each optimal piece/rotation. Calibration is disabled.`;

  // Calculate speed from current strategy stats
  const currentStrategyStats = strategyStats?.[mlParams?.placementStrategy] || {};
  const speed = currentStrategyStats?.timeMetrics?.totalTime > 0 && currentStrategyStats?.totalPiecesPlaced > 0 
    ? (currentStrategyStats.totalPiecesPlaced / (currentStrategyStats.timeMetrics.totalTime / 1000)).toFixed(1)
    : '0.0';

  return (
    <TooltipProvider>
  <div className="bg-card rounded-xl p-4 border border-border max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Controls</h2>
          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center cursor-help">
                  <div className="text-xs text-muted-foreground">Speed</div>
                  <div className="text-lg font-bold text-blue-400">
                    {speed} p/s
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Pieces placed per second - solver performance rate</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center cursor-help">
                  <div className="text-xs text-muted-foreground">Runs</div>
                  <div className="text-lg font-bold">{stats?.totalRuns?.toLocaleString() || 0}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total number of solving attempts made</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center cursor-help">
                  <div className="text-xs text-muted-foreground">Best</div>
                  <div className="text-lg font-bold text-green-400">{stats?.bestScore || 0}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Highest number of pieces successfully placed in one run</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center cursor-help">
                  <div className="text-xs text-muted-foreground">Solutions</div>
                  <div className="text-lg font-bold text-purple-400">{stats?.completedSolutions || 0}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Complete puzzle solutions found (all 256 pieces placed)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      
        <div className="space-y-4">
        {/* Control Buttons */}
        <div className="flex gap-3 flex-wrap">
            <Dialog open={puzzleDialogOpen} onOpenChange={setPuzzleDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Puzzle className="h-4 w-4" />
                  Load Puzzle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Puzzle className="h-5 w-5" />
                    Puzzle Configuration
                  </DialogTitle>
                  <DialogDescription>
                    Select a puzzle to solve. Upload custom puzzles or choose from available puzzles.
                  </DialogDescription>
                </DialogHeader>
                <PuzzleSelector
                  currentPuzzle={puzzleConfig}
                  onPuzzleLoad={handlePuzzleLoad}
                />
              </DialogContent>
            </Dialog>

            <Button
              onClick={onStart}
              variant={isRunning ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start
                </>
              )}
            </Button>

            <Button
              onClick={onReset}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              CSV Export
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              CSV Import
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
            />
          </div>

        {/* ML Controls */}
        <div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Placement Strategy */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Placement Strategy
                </Label>
                
                <Popover open={strategyOpen} onOpenChange={setStrategyOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={strategyOpen}
                      className="w-full justify-between"
                    >
                      {currentStrategy ? currentStrategy.label : "Select strategy..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput 
                        placeholder="Search strategy..." 
                      />
                      <CommandEmpty>No strategy found.</CommandEmpty>
                      <CommandGroup>
                        <CommandList>
                          {strategyOptions.map((strategy) => (
                            <CommandItem
                              key={strategy.value}
                              value={strategy.value}
                              onSelect={handleStrategyChange}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  strategyValue === strategy.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div>
                                <div className="font-medium">{strategy.label}</div>
                                <div className="text-xs text-muted-foreground">{strategy.description}</div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandList>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Learning Rate */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Learning Rate (k): {mlParams?.weightingConstant || 0.1}
                </Label>
                <Slider
                  value={[mlParams?.weightingConstant || 0.1]}
                  onValueChange={handleWeightingChange}
                  max={1.0}
                  min={0.01}
                  step={0.01}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Higher values make the solver more aggressively favor high-scoring pieces.
                </p>
              </div>

              {/* Board Update Frequency */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Board Update Frequency: {mlParams?.boardUpdateFrequency || 10}
                </Label>
                <Slider
                  value={[mlParams?.boardUpdateFrequency || 10]}
                  onValueChange={handleFrequencyChange}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Update visual board every N runs (higher = smoother, lower = more real-time)
                </p>
              </div>

              {/* Calibration Toggle */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Calibration Mode
                </Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    checked={mlParams?.useCalibration || false}
                    onCheckedChange={handleCalibrationChange}
                  />
                  <Label className="text-xs text-muted-foreground">
                    1000 Run Calibration
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Calibrate baseline before ML weighting
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}