
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { useSolver } from './SolverContext';

const EDGE_COLORS = {
  0: '#1e293b', 1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#22c55e',
  5: '#06b6d4', 6: '#3b82f6', 7: '#8b5cf6', 8: '#ec4899', 9: '#f59e0b',
  10: '#10b981', 11: '#14b8a6', 12: '#6366f1', 13: '#a855f7', 14: '#84cc16',
  15: '#f43f5e', 16: '#64748b', 17: '#78716c', 18: '#dc2626', 19: '#ea580c',
  20: '#ca8a04', 21: '#16a34a', 22: '#0891b2'
};

const rotateEdges = (edges, rotation) => {
    if (!edges || edges.length !== 4) return edges;
    const numRotations = Math.round(rotation / 90) % 4;
    if (numRotations === 0) return edges;
    const rotated = [...edges];
    for (let i = 0; i < numRotations; i++) {
        rotated.unshift(rotated.pop());
    }
    return rotated;
};

// This PiecePreview component is preserved as it's a separate component.
// The HintAnalysis component will define a *local* PiecePreview for its specific needs.
const PiecePreview = ({ pieceId, rotation, label, pieces }) => {
    const piece = pieces ? pieces.find(p => p.id === pieceId) : null;
    
    if (!piece) {
        return (
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 min-w-[150px]">
                <div className="text-xs text-slate-400 mb-2 uppercase tracking-wide text-center">
                    {label}
                </div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg mx-auto mb-3 border border-slate-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white/50">N/A</span>
                </div>
                <div className="text-center">
                    <div className="text-sm font-medium text-white mb-1">
                        No Data
                    </div>
                </div>
            </div>
        );
    }

    const finalEdges = rotateEdges(piece.edges, rotation);

    return (
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 min-w-[150px]">
        <div className="text-xs text-slate-400 mb-2 uppercase tracking-wide text-center">
          {label}
        </div>

        <div 
            className="relative w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg mx-auto mb-3 border border-slate-600"
            style={{ transform: `rotate(${rotation}deg)`}}
        >
          {/* Edge indicators are based on original orientation, container is rotated */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-1.5 rounded-b" style={{ backgroundColor: EDGE_COLORS[piece.edges[0]] || '#1e293b' }} />
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1.5 h-3 rounded-l" style={{ backgroundColor: EDGE_COLORS[piece.edges[1]] || '#1e293b' }} />
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-1.5 rounded-t" style={{ backgroundColor: EDGE_COLORS[piece.edges[2]] || '#1e293b' }} />
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-3 rounded-r" style={{ backgroundColor: EDGE_COLORS[piece.edges[3]] || '#1e293b' }} />
          </div>

          <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `rotate(-${rotation}deg)`}}>
            <span className="text-xs font-bold text-white/70">
              {piece.id}
            </span>
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm font-medium text-white mb-1">
            Piece #{piece.id}
          </div>
          <div className="text-xs text-slate-400">
            Rot: {rotation}°
          </div>
        </div>
      </div>
    );
};


function HintAnalysis({ hintAdjacencyStats, pieces }) {
  const { hints, getSelectionPercentages, stats, mlParams } = useSolver();

  const getBestPieceForAdjacency = (hintPos, direction) => {
    const key = `${hintPos}-${direction}`;
    if (!hintAdjacencyStats || !hintAdjacencyStats[key]) {
      return null;
    }

    const pieceRotationStats = hintAdjacencyStats[key];
    let bestPieceId = null;
    let bestRotation = 0;
    let maxAvgScore = -1;

    for (const pieceId in pieceRotationStats) {
      for (const rotation in pieceRotationStats[pieceId]) {
        const currentStats = pieceRotationStats[pieceId][rotation];
        if (currentStats.count > 0) {
          const avgScore = currentStats.avgScore;
          if (avgScore > maxAvgScore) {
            maxAvgScore = avgScore;
            bestPieceId = parseInt(pieceId);
            bestRotation = parseInt(rotation);
          }
        }
      }
    }
    
    if (bestPieceId === null) return null;
    
    // Get the selection percentage for this best piece/rotation
    const percentages = getSelectionPercentages(hintPos, direction);
    const percentage = percentages[bestPieceId]?.[bestRotation] || 0;
    
    return { 
      pieceId: bestPieceId, 
      rotation: bestRotation, 
      avgScore: maxAvgScore,
      percentage: percentage
    };
  };

  const isWeightingActive = !mlParams.useCalibration || stats.totalRuns > 1000;
  
  const getAnalysisDescription = () => {
    if (isWeightingActive) {
      return `Selection probability is based on machine learning.`;
    }
    if (mlParams.useCalibration) {
      const runsRemaining = 1000 - (stats.totalRuns || 0);
      return `${runsRemaining > 0 ? `${runsRemaining} runs remaining until ML weighting begins.` : 'ML weighting is now active.'}`;
    }
    return `ML weighting is active. Calibration is disabled.`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-950/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-800">
        <h3 className="text-xl font-bold text-white mb-4">Live Hint Adjacency Analysis</h3>
        <p className="text-slate-300 text-sm mb-6 max-w-2xl">
          This shows the highest-performing piece and its specific rotation for each position next to a fixed hint. 
          {getAnalysisDescription()}
        </p>

        {Object.entries(hints).map(([position, hintData]) => {
          const hintPiece = pieces ? pieces.find(p => p.id === hintData.id) : null;
          const bestNorth = getBestPieceForAdjacency(position, 'north');
          const bestEast = getBestPieceForAdjacency(position, 'east');
          const bestSouth = getBestPieceForAdjacency(position, 'south');
          const bestWest = getBestPieceForAdjacency(position, 'west');

          // Local PiecePreview component for this specific section
          const PiecePreview = ({ bestData, label }) => {
            if (!bestData) {
              return (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 min-w-[150px]">
                  <div className="text-xs text-slate-400 mb-2 uppercase tracking-wide text-center">
                    {label}
                  </div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg mx-auto mb-3 border border-slate-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white/50">N/A</span>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-white mb-1">No Data</div>
                    <div className="text-xs text-slate-400">0%</div>
                  </div>
                </div>
              );
            }

            // 'pieces' is available from the outer scope (HintAnalysis props)
            const piece = pieces ? pieces.find(p => p.id === bestData.pieceId) : null;
            if (!piece) return null;

            return (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 min-w-[150px]">
                <div className="text-xs text-slate-400 mb-2 uppercase tracking-wide text-center">
                  {label}
                </div>

                <div 
                    className="relative w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg mx-auto mb-3 border border-slate-600"
                    style={{ transform: `rotate(${bestData.rotation}deg)`}}
                >
                  <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-1.5 rounded-b" style={{ backgroundColor: EDGE_COLORS[piece.edges[0]] || '#1e293b' }} />
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1.5 h-3 rounded-l" style={{ backgroundColor: EDGE_COLORS[piece.edges[1]] || '#1e293b' }} />
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-1.5 rounded-t" style={{ backgroundColor: EDGE_COLORS[piece.edges[2]] || '#1e293b' }} />
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-3 rounded-r" style={{ backgroundColor: EDGE_COLORS[piece.edges[3]] || '#1e293b' }} />
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `rotate(-${bestData.rotation}deg)`}}>
                    <span className="text-xs font-bold text-white/70">
                      {piece.id}
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm font-medium text-white mb-1">
                    Piece #{piece.id}
                  </div>
                  <div className="text-xs text-slate-400 mb-1">
                    Rot: {bestData.rotation}° • Avg: {bestData.avgScore?.toFixed(1) || 'N/A'}
                  </div>
                  <div className="text-xs font-bold text-green-400">
                    {bestData.percentage?.toFixed(2) || '0.00'}%
                  </div>
                </div>
              </div>
            );
          };

          return (
            <div key={position} className="mb-10 last:mb-0 p-4 border border-slate-800 rounded-xl">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  Hint at Position {position}
                </Badge>
                <span className="text-slate-300">
                  (Piece #{hintData.id}, Rotation {hintData.rotation}°)
                </span>
              </div>

              <div className="flex justify-center items-center">
                  <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-3 gap-4 w-auto">
                    {/* North */}
                    <div className="md:col-start-2 row-start-1 flex justify-center items-center">
                      <PiecePreview bestData={bestNorth} label="North Best" />
                    </div>

                    {/* West */}
                    <div className="col-start-1 row-start-2 flex justify-center items-center">
                       <PiecePreview bestData={bestWest} label="West Best" />
                    </div>

                    {/* Center - Hint Piece */}
                    <div className="col-start-1 md:col-start-2 row-start-2 flex justify-center items-center bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
                      <div>
                        <div className="text-xs text-yellow-400 mb-2 uppercase tracking-wide text-center">
                          Fixed Hint
                        </div>

                        <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg mx-auto mb-3">
                          {hintPiece && (
                            <>
                              <div className="absolute inset-0" style={{ transform: `rotate(${hintData.rotation}deg)`}}>
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-1.5 rounded-b" style={{ backgroundColor: EDGE_COLORS[hintPiece.edges[0]] }} />
                                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1.5 h-3 rounded-l" style={{ backgroundColor: EDGE_COLORS[hintPiece.edges[1]] }} />
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-1.5 rounded-t" style={{ backgroundColor: EDGE_COLORS[hintPiece.edges[2]] }} />
                                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-3 rounded-r" style={{ backgroundColor: EDGE_COLORS[hintPiece.edges[3]] }} />
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-bold text-slate-900">
                                  {hintPiece.id}
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="text-center">
                          <div className="text-sm font-medium text-yellow-400">
                            Piece #{hintData.id}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* East */}
                    <div className="col-start-1 md:col-start-3 row-start-2 flex justify-center items-center">
                       <PiecePreview bestData={bestEast} label="East Best" />
                    </div>

                    {/* South */}
                    <div className="md:col-start-2 row-start-3 flex justify-center items-center">
                       <PiecePreview bestData={bestSouth} label="South Best" />
                    </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(HintAnalysis);
