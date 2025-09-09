import React from 'react';
import { Badge } from "@/components/ui/badge";
import { 
  calculatePValue, 
  calculateEffectSize, 
  calculatePercentiles, 
  interpretEffectSize, 
  interpretPValue 
} from '../../utils/statistics';

// Individual strategy card component
const StrategyCard = ({ strategy, stats, placementStrategies }) => {
  const strategyInfo = placementStrategies[strategy];
  const percentiles = calculatePercentiles(stats.scores, [25, 50, 75, 90, 95]);
  
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-white">{strategyInfo?.name || strategy}</h4>
        <Badge variant="outline" className="text-slate-300 border-slate-600">
          {stats.totalRuns} runs
        </Badge>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Best Score:</span>
          <span className="font-mono text-green-400">{stats.bestScore}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-slate-400">Average:</span>
          <span className="font-mono text-blue-400">{stats.avgScore.toFixed(1)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-slate-400">Std Dev:</span>
          <span className="font-mono text-slate-300">{stats.stdDev.toFixed(1)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-slate-400">95th %:</span>
          <span className="font-mono text-purple-400">{percentiles[95] || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-slate-400">Dead Ends:</span>
          <span className="font-mono text-red-400">{stats.deadEnds}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-slate-400">Avg Time:</span>
          <span className="font-mono text-yellow-400">{stats.timeMetrics.avgTimePerRun.toFixed(0)}ms</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-slate-400">Efficiency:</span>
          <span className="font-mono text-cyan-400">
            {stats.totalRuns > 0 ? ((stats.totalPiecesPlaced / stats.totalRuns) / 256 * 100).toFixed(1) : 0}%
          </span>
        </div>
      </div>
    </div>
  );
};

// Head-to-head comparison metrics
const ComparisonPanel = ({ metrics, originalStats, optimizedStats }) => {
  const originalScores = originalStats.scores || [];
  const optimizedScores = optimizedStats.scores || [];
  
  const pValue = calculatePValue(originalScores, optimizedScores);
  const effectSize = calculateEffectSize(originalScores, optimizedScores);
  
  const pValueInterp = interpretPValue(pValue);
  const effectInterp = interpretEffectSize(effectSize);
  
  const totalGames = metrics.originalWins + metrics.optimizedWins + metrics.ties;
  const originalWinRate = totalGames > 0 ? (metrics.originalWins / totalGames * 100) : 0;
  const optimizedWinRate = totalGames > 0 ? (metrics.optimizedWins / totalGames * 100) : 0;
  const tieRate = totalGames > 0 ? (metrics.ties / totalGames * 100) : 0;
  
  return (
    <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
      <h4 className="font-bold text-white mb-4 flex items-center gap-2">
        Head-to-Head Comparison
        {pValueInterp.symbol && (
          <span className={`${pValueInterp.color} font-mono`}>{pValueInterp.symbol}</span>
        )}
      </h4>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Original Wins</div>
          <div className="text-2xl font-bold text-red-400">{metrics.originalWins}</div>
          <div className="text-xs text-slate-400">{originalWinRate.toFixed(1)}%</div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Optimized Wins</div>
          <div className="text-2xl font-bold text-green-400">{metrics.optimizedWins}</div>
          <div className="text-xs text-slate-400">{optimizedWinRate.toFixed(1)}%</div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Ties</div>
          <div className="text-2xl font-bold text-slate-400">{metrics.ties}</div>
          <div className="text-xs text-slate-400">{tieRate.toFixed(1)}%</div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Avg Diff</div>
          <div className={`text-2xl font-bold ${metrics.avgScoreDiff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {metrics.avgScoreDiff >= 0 ? '+' : ''}{metrics.avgScoreDiff.toFixed(1)}
          </div>
          <div className="text-xs text-slate-400">pieces</div>
        </div>
      </div>
      
      {/* Statistical Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-700">
        <div className="text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Statistical Significance</div>
          <div className={`text-lg font-bold ${pValueInterp.color}`}>
            {pValueInterp.label}
          </div>
          <div className="text-xs text-slate-400">p ≈ {pValue.toFixed(3)}</div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Effect Size</div>
          <div className={`text-lg font-bold ${effectInterp.color}`}>
            {effectInterp.label}
          </div>
          <div className="text-xs text-slate-400">Cohen's d = {effectSize.toFixed(2)}</div>
        </div>
      </div>
      
      {/* Efficiency Ratio */}
      {metrics.efficiencyRatio > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700 text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Efficiency Ratio</div>
          <div className={`text-xl font-bold ${metrics.efficiencyRatio > 1 ? 'text-green-400' : 'text-red-400'}`}>
            {metrics.efficiencyRatio.toFixed(2)}x
          </div>
          <div className="text-xs text-slate-400">
            Optimized is {metrics.efficiencyRatio.toFixed(2)}x more likely to win
          </div>
        </div>
      )}
    </div>
  );
};

// Position failure heatmap (simplified version)
const PositionFailureHeatmap = ({ strategyStats }) => {
  const originalFailures = strategyStats.original.positionFailures || {};
  const optimizedFailures = strategyStats.optimized.positionFailures || {};
  
  // Get top 10 most problematic positions for each strategy
  const getTopFailures = (failures) => {
    return Object.entries(failures)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
  };
  
  const topOriginalFailures = getTopFailures(originalFailures);
  const topOptimizedFailures = getTopFailures(optimizedFailures);
  
  if (topOriginalFailures.length === 0 && topOptimizedFailures.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
      <h4 className="font-bold text-white mb-4">Most Problematic Positions</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h5 className="font-semibold text-slate-300 mb-2">Original Strategy</h5>
          <div className="space-y-1">
            {topOriginalFailures.slice(0, 5).map(([pos, count]) => (
              <div key={pos} className="flex justify-between text-sm">
                <span className="text-slate-400">Position {pos}:</span>
                <span className="text-red-400 font-mono">{count} failures</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h5 className="font-semibold text-slate-300 mb-2">Optimized Strategy</h5>
          <div className="space-y-1">
            {topOptimizedFailures.slice(0, 5).map(([pos, count]) => (
              <div key={pos} className="flex justify-between text-sm">
                <span className="text-slate-400">Position {pos}:</span>
                <span className="text-red-400 font-mono">{count} failures</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main StrategyComparison component
export default function StrategyComparison({ strategyStats, comparisonMetrics, PLACEMENT_STRATEGIES }) {
  const hasData = strategyStats.original.totalRuns > 0 || strategyStats.optimized.totalRuns > 0;
  
  if (!hasData) {
    return (
      <div className="bg-slate-950/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-800">
        <h3 className="text-xl font-bold text-white mb-4">Strategy Performance Comparison</h3>
        <div className="text-center py-8">
          <div className="text-slate-400 mb-2">No comparison data available yet</div>
          <div className="text-sm text-slate-500">
            Run the solver with both strategies to see detailed comparison statistics
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-slate-950/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-800">
      <h3 className="text-xl font-bold text-white mb-6">Strategy Performance Comparison</h3>
      
      {/* Side-by-side strategy cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <StrategyCard 
          strategy="original" 
          stats={strategyStats.original} 
          placementStrategies={PLACEMENT_STRATEGIES}
        />
        <StrategyCard 
          strategy="optimized" 
          stats={strategyStats.optimized} 
          placementStrategies={PLACEMENT_STRATEGIES}
        />
      </div>
      
      {/* Comparison metrics - only show if we have data from both strategies */}
      {strategyStats.original.totalRuns > 0 && strategyStats.optimized.totalRuns > 0 && (
        <>
          <ComparisonPanel 
            metrics={comparisonMetrics}
            originalStats={strategyStats.original}
            optimizedStats={strategyStats.optimized}
          />
          
          <PositionFailureHeatmap strategyStats={strategyStats} />
        </>
      )}
      
      {/* Show message if only one strategy has data */}
      {(strategyStats.original.totalRuns === 0 || strategyStats.optimized.totalRuns === 0) && (
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="text-blue-200 text-sm">
            💡 <strong>Tip:</strong> Switch between strategies and run more attempts to generate head-to-head comparison statistics.
          </div>
        </div>
      )}
    </div>
  );
}