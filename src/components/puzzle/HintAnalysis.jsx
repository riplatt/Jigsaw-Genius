
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

// This PiecePreview component is preserved as it's a separate component.
// The HintAnalysis component will define a *local* PiecePreview for its specific needs.
const PiecePreview = ({ pieceId, rotation, label, pieces }) => {
    const piece = pieces ? pieces.find(p => p.id === pieceId) : null;
    
    if (!piece) {
        return (
            <Card className="min-w-[150px]">
                <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide text-center">
                        {label}
                    </div>
                    <div className="relative w-12 h-12 bg-muted rounded-lg mx-auto mb-3 border flex items-center justify-center">
                        <span className="text-xs font-bold text-muted-foreground">N/A</span>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-medium text-foreground mb-1">
                            No Data
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const finalEdges = rotateEdges(piece.edges, rotation);

    return (
      <Card className="min-w-[150px]">
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide text-center">
            {label}
          </div>

          <div 
              className={`relative w-12 h-12 bg-muted rounded-lg mx-auto mb-3 border transform`}
              style={{ transform: `rotate(${rotation}deg)` }}
          >
            {/* Edge indicators are based on original orientation, container is rotated */}
            <div className="absolute inset-0">
              <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-1.5 rounded-b ${getEdgeColorClass(piece.edges[0])}`} />
              <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-1.5 h-3 rounded-l ${getEdgeColorClass(piece.edges[1])}`} />
              <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-1.5 rounded-t ${getEdgeColorClass(piece.edges[2])}`} />
              <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-3 rounded-r ${getEdgeColorClass(piece.edges[3])}`} />
            </div>

            <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `rotate(-${rotation}deg)` }}>
              <span className="text-xs font-bold text-foreground">
                {piece.id}
              </span>
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm font-medium text-foreground mb-1">
              Piece #{piece.id}
            </div>
            <div className="text-xs text-muted-foreground">
              Rot: {rotation}°
            </div>
          </div>
        </CardContent>
      </Card>
    );
};


function HintAnalysis({ hintAdjacencyStats, pieces, hints, stats, mlParams, getSelectionPercentages }) {

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
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Live Hint Adjacency Analysis</CardTitle>
          <p className="text-muted-foreground text-sm max-w-2xl">
            This shows the highest-performing piece and its specific rotation for each position next to a fixed hint. 
            {getAnalysisDescription()}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">

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
                <Card className="min-w-[150px]">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide text-center">
                      {label}
                    </div>
                    <div className="relative w-12 h-12 bg-muted rounded-lg mx-auto mb-3 border flex items-center justify-center">
                      <span className="text-xs font-bold text-muted-foreground">N/A</span>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-foreground mb-1">No Data</div>
                      <div className="text-xs text-muted-foreground">0%</div>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            // 'pieces' is available from the outer scope (HintAnalysis props)
            const piece = pieces ? pieces.find(p => p.id === bestData.pieceId) : null;
            if (!piece) return null;

            return (
              <Card className="min-w-[150px]">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide text-center">
                    {label}
                  </div>

                  <div 
                      className={`relative w-12 h-12 bg-muted rounded-lg mx-auto mb-3 border transform`}
                      style={{ transform: `rotate(${bestData.rotation}deg)` }}
                  >
                    <div className="absolute inset-0">
                      <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-1.5 rounded-b ${getEdgeColorClass(piece.edges[0])}`} />
                      <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-1.5 h-3 rounded-l ${getEdgeColorClass(piece.edges[1])}`} />
                      <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-1.5 rounded-t ${getEdgeColorClass(piece.edges[2])}`} />
                      <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-3 rounded-r ${getEdgeColorClass(piece.edges[3])}`} />
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `rotate(-${bestData.rotation}deg)` }}>
                      <span className="text-xs font-bold text-foreground">
                        {piece.id}
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm font-medium text-foreground mb-1">
                      Piece #{piece.id}
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Rot: {bestData.rotation}° • Avg: {bestData.avgScore?.toFixed(1) || 'N/A'}
                    </div>
                    <div className="text-xs font-bold text-green-600">
                      {bestData.percentage?.toFixed(2) || '0.00'}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          };

          return (
            <Card key={position} className="mb-6 last:mb-0">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 border border-yellow-500/30">
                    Hint at Position {position}
                  </Badge>
                  <span className="text-muted-foreground">
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
                    <div className="col-start-1 md:col-start-2 row-start-2 flex justify-center items-center">
                      <Card className="bg-yellow-500/10 border-yellow-500/30">
                        <CardContent className="p-4">
                          <div className="text-xs text-yellow-600 mb-2 uppercase tracking-wide text-center">
                            Fixed Hint
                          </div>

                          <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg mx-auto mb-3">
                            {hintPiece && (
                              <>
                                <div className="absolute inset-0 transform" style={{ transform: `rotate(${hintData.rotation}deg)` }}>
                                  <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-1.5 rounded-b ${getEdgeColorClass(hintPiece.edges[0])}`} />
                                  <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-1.5 h-3 rounded-l ${getEdgeColorClass(hintPiece.edges[1])}`} />
                                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-1.5 rounded-t ${getEdgeColorClass(hintPiece.edges[2])}`} />
                                  <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1.5 h-3 rounded-r ${getEdgeColorClass(hintPiece.edges[3])}`} />
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
                            <div className="text-sm font-medium text-yellow-600">
                              Piece #{hintData.id}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
              </CardContent>
            </Card>
          );
        })}
        </CardContent>
      </Card>
    </div>
  );
}

export default React.memo(HintAnalysis);
