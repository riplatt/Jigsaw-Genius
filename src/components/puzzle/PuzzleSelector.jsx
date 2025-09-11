import React, { useState, useCallback } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Upload, Download, Info, AlertCircle } from "lucide-react";
import { 
  parsePuzzleFile, 
  loadPuzzleFromFile, 
  exportPuzzleToFormat, 
  getAvailableMiniPuzzles 
} from "../../utils/puzzleParser";

export const PuzzleSelector = ({ 
  currentPuzzle, 
  onPuzzleSelect, 
  onPuzzleLoad, 
  className = "" 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMiniPuzzle, setSelectedMiniPuzzle] = useState("");
  const [uploadProgress, setUploadProgress] = useState(null);

  const miniPuzzles = getAvailableMiniPuzzles();

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
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
      onPuzzleLoad(puzzleConfig);
      setUploadProgress(null);
      setError(null);
    } catch (err) {
      setError(err.message);
      setUploadProgress(null);
    } finally {
      setIsLoading(false);
      event.target.value = ''; // Clear file input
    }
  }, [onPuzzleLoad]);

  const handleMiniPuzzleSelect = useCallback(async (filename) => {
    if (!filename) return;
    
    setIsLoading(true);
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
      onPuzzleLoad(puzzleConfig);
      setUploadProgress(null);
      setSelectedMiniPuzzle("");
    } catch (err) {
      setError(`Failed to load mini-puzzle: ${err.message}`);
      setUploadProgress(null);
    } finally {
      setIsLoading(false);
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
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Puzzle Configuration
        </CardTitle>
        <CardDescription>
          Select a puzzle to solve. Upload custom puzzles or choose from available mini-puzzles.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Puzzle Info */}
        {currentPuzzle && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{currentPuzzle.name}</h3>
              <Badge variant="secondary">
                {currentPuzzle.boardSize}×{currentPuzzle.boardSize}
              </Badge>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 grid grid-cols-2 gap-2">
              <span>Pieces: {currentPuzzle.totalPieces}</span>
              <span>Colors: {currentPuzzle.metadata?.edgeColorCount || 'Unknown'}</span>
              <span>Hints: {Object.keys(currentPuzzle.hints || {}).length}</span>
              <span>File: {currentPuzzle.metadata?.filename || 'Generated'}</span>
            </div>
            
            <Button
              onClick={handleExportPuzzle}
              variant="outline"
              size="sm"
              className="mt-3"
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Puzzle
            </Button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-800 dark:text-red-200">
                  Puzzle Loading Error
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {error}
                </p>
                <Button
                  onClick={resetError}
                  variant="outline"
                  size="sm"
                  className="mt-2 text-red-700 border-red-300 hover:bg-red-100"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploadProgress && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
              <span className="text-blue-800 dark:text-blue-200">{uploadProgress}</span>
            </div>
          </div>
        )}

        {/* File Upload */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Upload Custom Puzzle
          </label>
          <div className="flex items-center gap-3">
            <Input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => document.querySelector('input[type="file"]').click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Supported format: First line "N N", then N² lines with 4 edge values each (North East South West)
          </p>
        </div>

        {/* Mini-Puzzle Selector */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Load Mini-Puzzle
          </label>
          <div className="flex gap-3">
            <Select 
              value={selectedMiniPuzzle} 
              onValueChange={setSelectedMiniPuzzle}
              disabled={isLoading}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Choose a mini-puzzle to load..." />
              </SelectTrigger>
              <SelectContent>
                {miniPuzzles.map((puzzle) => (
                  <SelectItem key={puzzle.filename} value={puzzle.filename}>
                    <div className="flex items-center justify-between w-full">
                      <span>{puzzle.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {puzzle.size}×{puzzle.size}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => handleMiniPuzzleSelect(selectedMiniPuzzle)}
              disabled={isLoading || !selectedMiniPuzzle}
            >
              Load
            </Button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mini-puzzles are subsets of the original Eternity II pieces designed for testing and development
          </p>
        </div>

        {/* Format Help */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
            Puzzle File Format
          </h4>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
            <p><strong>Line 1:</strong> Two identical numbers representing board size (e.g., "4 4" for 4×4)</p>
            <p><strong>Remaining lines:</strong> One line per piece with 4 space-separated edge values</p>
            <p><strong>Edge order:</strong> North East South West (clockwise from top)</p>
            <p><strong>Edge values:</strong> 0 = border edge, 1-23 = color matching edges</p>
            <p><strong>Example:</strong></p>
            <pre className="mt-2 p-2 bg-slate-100 dark:bg-slate-700 rounded text-xs">
{`4 4
0 0 1 1
0 0 1 2
0 0 2 1
0 0 2 2`}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};