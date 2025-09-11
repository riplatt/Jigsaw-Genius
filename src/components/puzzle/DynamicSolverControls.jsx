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
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Solver Controls</h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-slate-400 hover:text-slate-200 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm bg-slate-700 border-slate-600 text-slate-200">
                <p className="text-sm">{mlInfoText}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      
      <div className="space-y-6">
        {/* Control Buttons */}
        <div className="space-y-3">
          <p className="text-sm text-slate-300">
            Start the simulation or import a previous run.
          </p>
          
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={onStart}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200",
                isRunning
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              )}
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Download className="h-4 w-4" />
              CSV Export
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-slate-600 text-slate-300 hover:bg-slate-700"
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

        {/* Machine Learning Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">Machine Learning Controls</h3>
            <Info className="h-4 w-4 text-slate-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Placement Strategy */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-300">
                Placement Strategy
              </Label>
              
              <Popover open={strategyOpen} onOpenChange={setStrategyOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={strategyOpen}
                    className="w-full justify-between bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600"
                  >
                    {currentStrategy ? currentStrategy.label : "Select strategy..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-slate-800 border-slate-700">
                  <Command className="bg-slate-800">
                    <CommandInput 
                      placeholder="Search strategy..." 
                      className="text-slate-200 placeholder-slate-400"
                    />
                    <CommandEmpty className="text-slate-400">No strategy found.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {strategyOptions.map((strategy) => (
                          <CommandItem
                            key={strategy.value}
                            value={strategy.value}
                            onSelect={handleStrategyChange}
                            className="text-slate-200 hover:bg-slate-700"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                strategyValue === strategy.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div>
                              <div className="font-medium">{strategy.label}</div>
                              <div className="text-xs text-slate-400">{strategy.description}</div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              
              <p className="text-xs text-slate-400">{currentStrategy?.description}</p>
            </div>

            {/* Learning Rate */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-300">
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
              <p className="text-xs text-slate-400">
                Higher values make the solver more aggressively favor high-scoring pieces.
              </p>
            </div>

            {/* Board Update Frequency */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-300">
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
              <p className="text-xs text-slate-400">
                Update visual board every N runs (higher = smoother, lower = more real-time)
              </p>
            </div>
          </div>

          {/* Calibration Toggle */}
          <div className="flex items-center space-x-3">
            <Switch
              checked={mlParams?.useCalibration || false}
              onCheckedChange={handleCalibrationChange}
              className="data-[state=checked]:bg-blue-600"
            />
            <Label className="text-sm text-slate-300">
              Enable {puzzleSize <= 6 ? '100' : puzzleSize <= 10 ? '500' : '1000'} Run Calibration
            </Label>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="text-sm text-slate-400">TOTAL RUNS</div>
            <div className="text-2xl font-bold text-white">{stats?.totalRuns || 0}</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="text-sm text-slate-400">BEST SCORE</div>
            <div className="text-2xl font-bold text-green-400">{stats?.bestScore || 0}</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="text-sm text-slate-400">AVG SCORE</div>
            <div className="text-2xl font-bold text-blue-400">{stats?.avgScore?.toFixed(1) || '0.0'}</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="text-sm text-slate-400">SOLUTIONS</div>
            <div className="text-2xl font-bold text-purple-400">{stats?.completedSolutions || 0}</div>
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}