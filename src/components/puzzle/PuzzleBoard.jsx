import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

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

function PuzzleBoard({ board, hints, currentRun, isRunning }) {
  const SIZE = 16;

  // Memoize expensive calculations
  const placedPiecesCount = useMemo(() => board.filter(p => p).length, [board]);
  const completionPercentage = useMemo(() => ((placedPiecesCount / 256) * 100).toFixed(1), [placedPiecesCount]);
  const hintsCount = useMemo(() => hints ? Object.keys(hints).length : 5, [hints]);
  const remainingPieces = useMemo(() => 256 - placedPiecesCount, [placedPiecesCount]);

  const getPieceColor = (piece, position) => {
    if (!piece) return 'bg-slate-900/50';
    
    if (hints && hints[position]) {
      return 'bg-gradient-to-br from-yellow-400 to-amber-500';
    }
    
    return 'bg-gradient-to-br from-slate-700 to-slate-600';
  };

  const renderEdgeIndicators = (piece) => {
    if (!piece || !piece.edges) return null;
    
    return (
      <div className="absolute inset-0">
        {/* North */}
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-1 rounded-b"
          style={{ backgroundColor: EDGE_COLORS[piece.edges[0]] || '#1e293b' }}
        />
        {/* East */}
        <div 
          className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-2 rounded-l"
          style={{ backgroundColor: EDGE_COLORS[piece.edges[1]] || '#1e293b' }}
        />
        {/* South */}
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-1 rounded-t"
          style={{ backgroundColor: EDGE_COLORS[piece.edges[2]] || '#1e293b' }}
        />
        {/* West */}
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-2 rounded-r"
          style={{ backgroundColor: EDGE_COLORS[piece.edges[3]] || '#1e293b' }}
        />
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-950/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Puzzle Board</h2>
            <div className="flex items-center gap-4">
              {currentRun && (
                <div className="text-sm text-slate-300">
                  Run #{currentRun.run} • Score: {currentRun.score}
                </div>
              )}
              {isRunning && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-slate-300">Running</span>
                </div>
              )}
            </div>
          </div>
          
          <div 
            className="grid gap-1 mx-auto bg-slate-900/50 p-4 rounded-xl"
            style={{ 
              gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
              maxWidth: '600px'
            }}
          >
            {Array.from({ length: SIZE * SIZE }, (_, position) => {
              const piece = board[position];
              const row = Math.floor(position / SIZE);
              const col = position % SIZE;
              
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
                    relative aspect-square rounded-sm border border-slate-700
                    ${getPieceColor(piece, position)}
                    ${piece ? 'shadow-lg' : ''}
                  `}
                  style={{ width: '20px', height: '20px' }}
                >
                  {renderEdgeIndicators(piece)}
                  
                  {piece && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-white/70">
                        {piece.id}
                      </span>
                    </div>
                  )}
                  
                  {hints && hints[position] && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-slate-900 shadow-lg">
                      <div className="w-full h-full bg-yellow-300 rounded-full animate-pulse" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
          
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xs text-slate-400 uppercase tracking-wide">Pieces Placed</div>
              <div className="text-2xl font-bold text-white mt-1">
                {placedPiecesCount}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xs text-slate-400 uppercase tracking-wide">Completion</div>
              <div className="text-2xl font-bold text-white mt-1">
                {completionPercentage}%
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xs text-slate-400 uppercase tracking-wide">Hints Fixed</div>
              <div className="text-2xl font-bold text-yellow-400 mt-1">
                {hintsCount}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xs text-slate-400 uppercase tracking-wide">Remaining</div>
              <div className="text-2xl font-bold text-slate-300 mt-1">
                {remainingPieces}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(PuzzleBoard);