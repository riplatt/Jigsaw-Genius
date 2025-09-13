import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Download, Upload, Check, ChevronsUpDown, Info, HelpCircle } from "lucide-react";
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

export default function DynamicSolverControls({
  isRunning, 
  onStart, 
  onPause, 
  onReset,
  currentRun,
  stats,
  mlParams,
  setMlParams,
  placementStrategies,
  puzzleSize
}) {
  const [strategyOpen, setStrategyOpen] = useState(false);
  const [strategyValue, setStrategyValue] = useState(mlParams?.placementStrategy || "optimized");
  const fileInputRef = useRef(null);

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

  return (
    <TooltipProvider>
  <div className="bg-card rounded-xl p-6 border border-border max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Solver Controls</h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-sm">{mlInfoText}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      
        <div className="space-y-6">
        {/* Control Buttons */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Start the simulation or import a previous run.
          </p>
          
          <div className="flex gap-3 flex-wrap">
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
        </div>

  <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-bold">Machine Learning Controls</h3>
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-semibold">Machine Learning Strategy</h4>
                  <p className="text-sm text-muted-foreground">
                    {mlParams?.useCalibration 
                      ? "After 1000 calibration runs, the solver uses machine learning to weight hint-adjacent pieces based on their historical performance."
                      : "The solver is using machine learning to weight hint-adjacent pieces based on historical performance. Calibration is disabled."
                    }
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                
                <p className="text-xs text-muted-foreground">{currentStrategy?.description}</p>
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
            </div>

            {/* Calibration Toggle */}
            <div className="flex items-center space-x-3 mt-4">
              <Switch
                checked={mlParams?.useCalibration || false}
                onCheckedChange={handleCalibrationChange}
              />
              <Label className="text-sm text-foreground">
                Enable 1000 Run Calibration
              </Label>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Total Runs
                </div>
                <div className="text-2xl font-bold mt-1">
                  {stats?.totalRuns?.toLocaleString() || 0}
                </div>
              </div>
              <div className="text-center bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Best Score
                </div>
                <div className="text-2xl font-bold text-green-400 mt-1">
                  {stats?.bestScore || 0}
                </div>
              </div>
              <div className="text-center bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Avg Score
                </div>
                <div className="text-2xl font-bold text-blue-400 mt-1">
                  {stats?.avgScore ? stats.avgScore.toFixed(1) : '0.0'}
                </div>
              </div>
              <div className="text-center bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Solutions
                </div>
                <div className="text-2xl font-bold text-purple-400 mt-1">
                  {stats?.completedSolutions || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}