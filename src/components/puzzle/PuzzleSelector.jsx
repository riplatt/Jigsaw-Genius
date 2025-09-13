import React, { useState, useCallback, useMemo } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Upload, Download, Info, AlertCircle, Puzzle, Target } from "lucide-react";
import { 
  parsePuzzleFile, 
  loadPuzzleFromFile, 
  exportPuzzleToFormat, 
  getAvailableMiniPuzzles 
} from "../../utils/puzzleParser";
import { 
  getAvailablePuzzles, 
  loadPuzzle, 
  getRecommendedPuzzles 
} from "../../utils/puzzleLoader";
import { generateStrategiesForPuzzle } from "../../utils/strategyGenerator";

export const PuzzleSelector = ({ 
  currentPuzzle, 
  onPuzzleSelect, 
  onPuzzleLoad, 
  className = "" 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loadingPuzzle, setLoadingPuzzle] = useState(null);

  const miniPuzzles = getAvailableMiniPuzzles();
  const availablePuzzles = useMemo(() => getAvailablePuzzles(), []);
  const recommendedPuzzles = useMemo(() => getRecommendedPuzzles(), []);

  const processFile = useCallback(async (file) => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setUploadProgress("Reading file...");

    try {
      const puzzleConfig = await loadPuzzleFromFile(file);
      setUploadProgress("Validating puzzle...");
      
      // Additional validation can be added here
      await new Promise(resolve => setTimeout(resolve, 500)); // Visual feedback
      
      setUploadProgress("Loading puzzle...");
      await new Promise(resolve => setTimeout(resolve, 300)); // Brief pause
      
      setUploadProgress(null);
      setSuccessMessage("Puzzle loaded successfully!");
      setError(null);
      
      // Show success message briefly before triggering onPuzzleLoad (which closes dialog)
      setTimeout(() => {
        onPuzzleLoad(puzzleConfig);
        setSuccessMessage(null);
      }, 800);
    } catch (err) {
      setError(err.message);
      setUploadProgress(null);
    } finally {
      setIsLoading(false);
    }
  }, [onPuzzleLoad]);

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    await processFile(file);
    event.target.value = ''; // Clear file input
  }, [processFile]);

  const handleDrop = useCallback(async (event) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    const textFile = files.find(file => file.type === 'text/plain' || file.name.endsWith('.txt'));
    
    if (textFile) {
      await processFile(textFile);
    } else {
      setError('Please drop a valid .txt file');
    }
  }, [processFile]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleConvertedPuzzleSelect = useCallback(async (puzzleId) => {
    if (!puzzleId) return;
    
    setIsLoading(true);
    setLoadingPuzzle(puzzleId);
    setError(null);
    setUploadProgress("Loading puzzle...");

    try {
      // Load puzzle configuration
      let puzzle = loadPuzzle(puzzleId);
      
      setUploadProgress("Generating strategies...");
      
      // Generate strategies if puzzle doesn't have phase-based strategies
      if (!puzzle.placement_strategies || 
          !Object.values(puzzle.placement_strategies).some(s => s.phases)) {
        const generatedStrategies = generateStrategiesForPuzzle(puzzle);
        puzzle.placement_strategies = generatedStrategies;
      }
      
      setUploadProgress("Initializing solver...");
      await new Promise(resolve => setTimeout(resolve, 300)); // Brief pause
      
      setUploadProgress(null);
      setSuccessMessage("Puzzle loaded successfully!");
      setError(null);
      
      // Show success message briefly before triggering onPuzzleLoad (which closes dialog)
      setTimeout(() => {
        onPuzzleLoad(puzzle);
        setSuccessMessage(null);
      }, 800);
    } catch (err) {
      setError(`Failed to load puzzle: ${err.message}`);
      setUploadProgress(null);
    } finally {
      setIsLoading(false);
      setLoadingPuzzle(null);
    }
  }, [onPuzzleLoad]);

  const handleMiniPuzzleSelect = useCallback(async (filename) => {
    if (!filename) return;
    
    setIsLoading(true);
    setLoadingPuzzle(filename);
    setError(null);
    setUploadProgress("Loading mini-puzzle...");

    try {
      // Load mini-puzzle from data directory
      const response = await fetch(`/data/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}: ${response.statusText}`);
      }
      
      const content = await response.text();
      setUploadProgress("Parsing puzzle...");
      
      const puzzleConfig = parsePuzzleFile(content, filename);
      
      setUploadProgress("Initializing solver...");
      await new Promise(resolve => setTimeout(resolve, 300)); // Brief pause
      
      setUploadProgress(null);
      setSuccessMessage("Puzzle loaded successfully!");
      setError(null);
      
      // Show success message briefly before triggering onPuzzleLoad (which closes dialog)
      setTimeout(() => {
        onPuzzleLoad(puzzleConfig);
        setSuccessMessage(null);
      }, 800);
    } catch (err) {
      setError(`Failed to load mini-puzzle: ${err.message}`);
      setUploadProgress(null);
    } finally {
      setIsLoading(false);
      setLoadingPuzzle(null);
    }
  }, [onPuzzleLoad]);

  const handleExportPuzzle = useCallback(() => {
    if (!currentPuzzle) return;

    try {
      const content = exportPuzzleToFormat(currentPuzzle);
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentPuzzle.name.toLowerCase().replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Export failed: ${err.message}`);
    }
  }, [currentPuzzle]);

  const resetError = () => setError(null);

  return (
    <div className={`w-full space-y-6 ${className}`}>
        {/* Current Puzzle Info */}
        {currentPuzzle && (
          <div className="p-4 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white">{currentPuzzle.name}</h3>
              <Badge variant="secondary" className="bg-slate-700 text-slate-200">
                {currentPuzzle.boardSize}×{currentPuzzle.boardSize}
              </Badge>
            </div>
            <div className="text-sm text-slate-300 grid grid-cols-2 gap-2">
              <span>Pieces: {currentPuzzle.totalPieces}</span>
              <span>Colors: {currentPuzzle.metadata?.edgeColorCount || 'Unknown'}</span>
              <span>Hints: {Object.keys(currentPuzzle.hints || {}).length}</span>
              <span>File: {currentPuzzle.metadata?.filename || 'Generated'}</span>
            </div>
            
            <Button
              onClick={handleExportPuzzle}
              variant="outline"
              size="sm"
              className="mt-3 border-green-500/30 text-green-200 hover:bg-green-500/10 hover:border-green-400/50 hover:text-green-100 transition-all duration-200"
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Puzzle
            </Button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-200">
                  Puzzle Loading Error
                </h4>
                <p className="text-sm text-red-300 mt-1">
                  {error}
                </p>
                <Button
                  onClick={resetError}
                  variant="outline"
                  size="sm"
                  className="mt-2 border-red-500/30 text-red-200 hover:bg-red-500/10 hover:border-red-400/50 hover:text-red-100 transition-all duration-200"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploadProgress && (
          <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="animate-spin h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full" />
              <span className="text-blue-200">{uploadProgress}</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-green-400 flex items-center justify-center">
                <div className="h-2 w-2 bg-green-900 rounded-full" />
              </div>
              <span className="text-green-200">{successMessage}</span>
            </div>
          </div>
        )}

        {/* File Upload - Drag and Drop Zone */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">
            Upload Custom Puzzle
          </label>
          <div 
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer
              ${isDragOver 
                ? 'border-purple-400 bg-purple-500/10' 
                : 'border-slate-600 hover:border-slate-500 bg-slate-800/30'
              }
              ${isLoading ? 'pointer-events-none opacity-50' : ''}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !isLoading && document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-3">
              <Upload className={`h-8 w-8 ${isDragOver ? 'text-purple-400' : 'text-slate-400'}`} />
              <div>
                <p className={`text-sm font-medium ${isDragOver ? 'text-purple-200' : 'text-slate-300'}`}>
                  {isDragOver ? 'Drop your puzzle file here' : 'Drop file here or click to browse'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports .txt files only
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Supported format: First line "N N", then N² lines with 4 edge values each (North East South West)
          </p>
        </div>

        {/* Available Puzzles */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">
            Available Puzzles
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availablePuzzles.map((puzzle) => (
              <Card
                key={puzzle.id}
                className="cursor-pointer transition-all duration-200 hover:bg-slate-700/50 hover:border-blue-400/50 bg-slate-800/30 border-slate-700/50 hover:shadow-lg"
                onClick={() => !isLoading && handleConvertedPuzzleSelect(puzzle.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-slate-200">{puzzle.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{puzzle.description}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`ml-2 ${
                        puzzle.difficulty === 'Hard' ? 'bg-red-500/20 border-red-500 text-red-200' :
                        puzzle.difficulty === 'Profile' ? 'bg-blue-500/20 border-blue-500 text-blue-200' :
                        puzzle.difficulty === 'Extreme' ? 'bg-purple-500/20 border-purple-500 text-purple-200' :
                        'bg-slate-700/50 border-slate-600 text-slate-300'
                      }`}
                    >
                      {puzzle.difficulty}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-2">
                    <span>Size: {puzzle.boardSize}×{puzzle.boardSize}</span>
                    <span>Pieces: {puzzle.totalPieces}</span>
                    <span>Hints: {puzzle.hasHints ? puzzle.hintCount : 'None'}</span>
                    <span>Strategies: {puzzle.hasPhaseStrategies ? 'Advanced' : 'Auto-gen'}</span>
                  </div>
                  {loadingPuzzle === puzzle.id && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="animate-spin h-3 w-3 border border-blue-400 border-t-transparent rounded-full" />
                      <span className="text-xs text-blue-200">Loading...</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-slate-400">
            Click any puzzle to load it with auto-generated or pre-defined placement strategies.
          </p>
        </div>

        {/* Mini-Puzzle Selector */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-300">
            Load Mini-Puzzle (Legacy)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {miniPuzzles.map((puzzle) => (
              <Card
                key={puzzle.filename}
                className="cursor-pointer transition-all duration-200 hover:bg-slate-700/50 hover:border-purple-400/50 bg-slate-800/30 border-slate-700/50 hover:shadow-lg"
                onClick={() => !isLoading && handleMiniPuzzleSelect(puzzle.filename)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-slate-200">{puzzle.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{puzzle.size * puzzle.size} pieces</p>
                    </div>
                    <Badge variant="outline" className="bg-slate-700/50 border-slate-600 text-slate-300">
                      {puzzle.size}×{puzzle.size}
                    </Badge>
                  </div>
                  {loadingPuzzle === puzzle.filename && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="animate-spin h-3 w-3 border border-purple-400 border-t-transparent rounded-full" />
                      <span className="text-xs text-purple-200">Loading...</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-slate-400">
            Click any puzzle to load it immediately. Mini-puzzles are subsets of the original Eternity II pieces designed for testing and development.
          </p>
        </div>

        {/* Format Help */}
        <div className="p-4 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50">
          <h4 className="font-medium text-slate-300 mb-2">
            Puzzle File Format
          </h4>
          <div className="text-sm text-slate-400 space-y-1">
            <p><strong>Line 1:</strong> Two identical numbers representing board size (e.g., "4 4" for 4×4)</p>
            <p><strong>Remaining lines:</strong> One line per piece with 4 space-separated edge values</p>
            <p><strong>Edge order:</strong> North East South West (clockwise from top)</p>
            <p><strong>Edge values:</strong> 0 = border edge, 1-23 = color matching edges</p>
            <p><strong>Example:</strong></p>
            <pre className="mt-2 p-2 bg-slate-700/50 backdrop-blur-sm rounded text-xs border border-slate-600/30">
{`4 4
0 0 1 1
0 0 1 2
0 0 2 1
0 0 2 2`}
            </pre>
          </div>
        </div>
    </div>
  );
};