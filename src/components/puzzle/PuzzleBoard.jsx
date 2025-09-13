import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, ChevronLeft, ChevronRight, Trophy, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EDGE_COLORS = {
  0: '#1e293b',  // slate-800 (border/empty)
  1: '#ef4444',  // red
  2: '#f97316',  // orange  
  3: '#eab308',  // yellow
  4: '#22c55e',  // green
  5: '#06b6d4',  // cyan
  6: '#3b82f6',  // blue
  7: '#8b5cf6',  // violet
  8: '#ec4899',  // pink
  9: '#f59e0b',  // amber
  10: '#10b981', // emerald
  11: '#14b8a6', // teal
  12: '#6366f1', // indigo
  13: '#a855f7', // purple
  14: '#84cc16', // lime
  15: '#f43f5e', // rose
  16: '#64748b', // slate
  17: '#78716c', // stone
  18: '#dc2626', // red-600
  19: '#ea580c', // orange-600
  20: '#ca8a04', // yellow-600
  21: '#16a34a', // green-600
  22: '#0891b2'  // cyan-600
};

function PuzzleBoard({ board, size = 16, hints, completedSolutions = [], bestPartialSolution = null, isRunning, currentRun, onExportSolution }) {
  const SIZE = size;
  const TOTAL_PIECES = SIZE * SIZE;
  
  // Solution browser state
  const [viewMode, setViewMode] = useState('live'); // 'live', 'best', or 'solutions'
  const [currentSolutionIndex, setCurrentSolutionIndex] = useState(0);
  
  // Determine which board to display
  const displayBoard = useMemo(() => {
    switch (viewMode) {
      case 'best':
        return bestPartialSolution?.board || board;
      case 'solutions':
        return completedSolutions.length > 0 
          ? completedSolutions[currentSolutionIndex]?.board || board
          : board;
      default: // 'live'
        return board;
    }
  }, [viewMode, bestPartialSolution, completedSolutions, currentSolutionIndex, board]);
  
  // Dynamic text size based on board size
  const getTextSize = () => {
    if (SIZE <= 4) return 'text-xs';
    if (SIZE <= 6) return 'text-[10px]';
    if (SIZE <= 10) return 'text-[8px]';
    return 'text-[6px]';
  };

  // Dynamic edge indicator sizes based on board size
  const getEdgeSizes = () => {
    if (SIZE <= 4) return { horizontal: 'w-6 h-2', vertical: 'w-2 h-6' };
    if (SIZE <= 6) return { horizontal: 'w-4 h-2', vertical: 'w-2 h-4' };
    if (SIZE <= 10) return { horizontal: 'w-3 h-1', vertical: 'w-1 h-3' };
    return { horizontal: 'w-2 h-1', vertical: 'w-1 h-2' };
  };

  // Memoize expensive calculations
  const placedPiecesCount = useMemo(() => displayBoard.filter(p => p).length, [displayBoard]);
  const completionPercentage = useMemo(() => ((placedPiecesCount / TOTAL_PIECES) * 100).toFixed(1), [placedPiecesCount, TOTAL_PIECES]);
  const hintsCount = useMemo(() => hints ? Object.keys(hints).length : 0, [hints]);
  const remainingPieces = useMemo(() => TOTAL_PIECES - placedPiecesCount, [TOTAL_PIECES, placedPiecesCount]);

  const getPieceColor = (piece, position) => {
    if (!piece) return 'bg-muted/30';
    
    if (hints && hints[position]) {
      return 'bg-gradient-to-br from-yellow-400 to-amber-500';
    }
    
    return 'bg-muted';
  };

  const getEdgeColorClass = (edgeId) => {
    // Map edge IDs to Tailwind color classes
    const colorMap = {
      0: 'bg-slate-800',     // border/empty
      1: 'bg-red-500',       // red
      2: 'bg-orange-500',    // orange  
      3: 'bg-yellow-500',    // yellow
      4: 'bg-green-500',     // green
      5: 'bg-cyan-500',      // cyan
      6: 'bg-blue-500',      // blue
      7: 'bg-violet-500',    // violet
      8: 'bg-pink-500',      // pink
      9: 'bg-amber-500',     // amber
      10: 'bg-emerald-500',  // emerald
      11: 'bg-teal-500',     // teal
      12: 'bg-indigo-500',   // indigo
      13: 'bg-purple-500',   // purple
      14: 'bg-lime-500',     // lime
      15: 'bg-rose-500',     // rose
      16: 'bg-slate-500',    // slate
      17: 'bg-stone-500',    // stone
      18: 'bg-red-600',      // red-600
      19: 'bg-orange-600',   // orange-600
      20: 'bg-yellow-600',   // yellow-600
      21: 'bg-green-600',    // green-600
      22: 'bg-cyan-600'      // cyan-600
    };
    return colorMap[edgeId] || 'bg-slate-800';
  };

  const renderEdgeIndicators = (piece) => {
    if (!piece || !piece.edges) return null;
    
    const edgeSizes = getEdgeSizes();
    
    return (
      <div className="absolute inset-0">
        {/* North */}
        <div 
          className={`absolute top-0 left-1/2 transform -translate-x-1/2 ${edgeSizes.horizontal} rounded-b ${getEdgeColorClass(piece.edges[0])}`}
        />
        {/* East */}
        <div 
          className={`absolute right-0 top-1/2 transform -translate-y-1/2 ${edgeSizes.vertical} rounded-l ${getEdgeColorClass(piece.edges[1])}`}
        />
        {/* South */}
        <div 
          className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 ${edgeSizes.horizontal} rounded-t ${getEdgeColorClass(piece.edges[2])}`}
        />
        {/* West */}
        <div 
          className={`absolute left-0 top-1/2 transform -translate-y-1/2 ${edgeSizes.vertical} rounded-r ${getEdgeColorClass(piece.edges[3])}`}
        />
      </div>
    );
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="grid grid-cols-3 items-center">
          {/* Left Column - Title */}
          <div>
            <CardTitle className="text-2xl">Puzzle Board</CardTitle>
          </div>
            
            {/* Center Column - Board View Controls */}
            <div className="flex justify-center">
              <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
                <div className="flex items-center gap-4">
                  <TabsList className="grid grid-cols-3 h-auto w-full">
                    <TabsTrigger value="live" className="text-xs">
                      <Play className="h-3 w-3 mr-1" />
                      Live
                    </TabsTrigger>
                    <TabsTrigger 
                      value="best" 
                      disabled={!bestPartialSolution?.board}
                      className="text-xs"
                    >
                      <Trophy className="h-3 w-3 mr-1" />
                      Best ({bestPartialSolution?.score || 0})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="solutions" 
                      disabled={completedSolutions.length === 0}
                      className="text-xs"
                    >
                      <Square className="h-3 w-3 mr-1" />
                      Solutions ({completedSolutions.length})
                    </TabsTrigger>
                  </TabsList>

                  {/* Solution Navigation - Inline with tabs */}
                  {viewMode === 'solutions' && completedSolutions.length > 1 && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentSolutionIndex(Math.max(0, currentSolutionIndex - 1))}
                        disabled={currentSolutionIndex === 0}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                      <span className="text-xs text-muted-foreground min-w-8 text-center">
                        {currentSolutionIndex + 1}/{completedSolutions.length}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentSolutionIndex(Math.min(completedSolutions.length - 1, currentSolutionIndex + 1))}
                        disabled={currentSolutionIndex === completedSolutions.length - 1}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </Tabs>
            </div>
            
            {/* Right Column - Status Info */}
            <div className="flex items-center justify-end gap-4">
              {currentRun && (
                <div className="text-sm text-muted-foreground">
                  Run #{currentRun.run} • Score: {currentRun.score}
                </div>
              )}
              {isRunning && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-muted-foreground">Running</span>
                </div>
              )}
            </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="relative">
          <div 
            className={`grid gap-1 mx-auto bg-muted/30 p-4 rounded-xl max-w-[600px] w-full border`}
            style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
          >
            {Array.from({ length: SIZE * SIZE }, (_, position) => {
              const piece = displayBoard[position];
              
              return (
                <motion.div
                  key={position}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: piece ? 1 : 0.8, 
                    opacity: piece ? 1 : 0.3 
                  }}
                  transition={{ 
                    duration: 0.2,
                    delay: piece ? position * 0.001 : 0  // Staggered animation based on position
                  }}
                  className={`
                    relative aspect-square rounded-sm border
                    ${getPieceColor(piece, position)}
                    ${piece ? 'shadow-sm' : ''}
                  `}
                >
                  {renderEdgeIndicators(piece)}
                  
                  {piece && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`${getTextSize()} font-bold text-foreground`}>
                        {piece.id}
                      </span>
                    </div>
                  )}
                  
                  {hints && hints[position] && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white shadow-lg">
                      <div className="w-full h-full bg-yellow-300 rounded-full animate-pulse" />
                    </div>
                  )}
                </motion.div>
              );
            })}
            </div>

            {/* Download Overlay Button - Show for Best and Solutions modes */}
            {(viewMode === 'best' || viewMode === 'solutions') && onExportSolution && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Button
                  onClick={() => {
                    if (viewMode === 'best') {
                      onExportSolution('best');
                    } else if (viewMode === 'solutions') {
                      onExportSolution('solution', currentSolutionIndex);
                    }
                  }}
                  className="
                    group pointer-events-auto bg-background/90 hover:bg-background
                    border-2 border-border hover:border-border/80
                    text-foreground
                    backdrop-blur-sm shadow-xl
                    transition-all duration-200 ease-in-out
                    hover:scale-110 active:scale-95
                    w-16 h-16 rounded-full p-0
                  "
                  title={
                    viewMode === 'best' 
                      ? `Download Best Solution (${bestPartialSolution?.score || 0} pieces)` 
                      : `Download Solution #${currentSolutionIndex + 1}`
                  }
                >
                  <Download className="h-6 w-6 opacity-60 group-hover:opacity-100 transition-opacity duration-300 ease-in-out" />
                </Button>
              </motion.div>
            )}
          </div>
          
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Pieces Placed</div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {placedPiecesCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Completion</div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {completionPercentage}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Hints Fixed</div>
              <div className="text-2xl font-bold text-yellow-600 mt-1">
                {hintsCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Remaining</div>
              <div className="text-2xl font-bold text-muted-foreground mt-1">
                {remainingPieces}
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

export default React.memo(PuzzleBoard);