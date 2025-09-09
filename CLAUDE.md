# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Eternity II Jigsaw Genius**, a sophisticated React web application that solves the notorious Eternity II 16×16 edge-matching puzzle using a non-backtracking statistical solver with machine learning optimization. The app employs intelligent piece placement strategies and real-time performance analysis.

## Development Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:5173
npm install          # Install dependencies
npm run build        # Build for production
npm run preview      # Preview production build locally

# Adding UI components (uses shadcn/ui)
npx shadcn@latest add <component>  # Add new UI components
```

## Core Architecture

### 1. Solver Engine (`src/components/puzzle/SolverContext.jsx`)
The heart of the application - a React Context that manages:
- **256-piece puzzle state** with 16×16 board representation
- **Machine learning parameters** (learning rate, calibration mode, placement strategy)
- **Placement strategies** - configurable algorithms (Original vs Optimized with Diagonal Restriction)
- **Non-backtracking solver logic** using statistical piece placement
- **Performance statistics** tracking (runs, scores, completion rates)
- **Hint adjacency learning** - ML weights for pieces adjacent to fixed hints

Key concepts:
- **Fixed hints**: 5 pre-placed pieces that never move
- **Placement strategies**: Ordered sequences for piece placement (Hints → Orthogonal-Adjacent → Diagonal Restriction → Checkerboard → Surrounded)
- **Edge validation**: Pieces must match neighboring edge colors and respect border constraints (edge 0)
- **Exponential weighting**: `weight = exp(k * (localAvgScore - globalAvgScore))` for ML piece selection

### 2. UI Architecture
- **React Context Pattern**: `SolverContext` provides state to entire app
- **shadcn/ui Components**: Modern, accessible UI built on Radix primitives
- **Tailwind CSS**: Utility-first styling with custom dark theme
- **Responsive Design**: Mobile-first approach with grid layouts

### 3. Component Structure
```
src/components/puzzle/
├── SolverContext.jsx       # Core solver logic and state management
├── PuzzleBoard.jsx         # 16×16 visual board with animated pieces
├── SolverControls.jsx      # Start/pause/reset + ML parameter controls + strategy selection
├── HintAnalysis.jsx        # ML performance visualization
└── StrategyComparison.jsx  # Statistical strategy comparison with performance metrics

src/components/ui/          # shadcn/ui components (auto-generated)
├── button.jsx
├── command.jsx             # For combobox/dropdown functionality
├── popover.jsx
├── slider.jsx              # For configuration controls
└── ...

src/pages/
└── Solver.jsx             # Main page orchestrating all components

src/config/
└── solver.js             # Configuration constants and edge colors

src/utils/
└── statistics.js          # Statistical analysis utilities (t-tests, effect sizes, etc.)
```

### 4. Data Management
- **localStorage**: Automatic persistence of solver state, ML parameters, strategy statistics, and comparison metrics
- **CSV Export/Import**: Full solver state backup including ML statistics, strategy performance data, and head-to-head comparisons
- **State Structure**: Pieces array (256 objects with id, edges, rotation), hints object, placement strategies, per-strategy statistics
- **Strategy Statistics**: Performance tracking per strategy (runs, scores, timing, dead-ends, position failures)
- **Comparison Metrics**: Head-to-head win/loss records, efficiency ratios, statistical significance testing

### 5. Machine Learning Implementation
The solver uses **adaptive piece selection** for hint-adjacent positions:
- **Calibration phase**: First 1000 runs establish baseline performance without ML
- **Statistical learning**: Tracks avgScore, count, bestScore for each piece/rotation combination
- **Weighted selection**: High-performing pieces get exponentially higher selection probability
- **Continuous updates**: Statistics update after each solving attempt

## Key Configuration

### Solver Parameters (`src/config/solver.js`)
```javascript
SOLVER_CONFIG = {
  BOARD_SIZE: 16,
  SOLVER_INTERVAL: 333,        # Solving speed (ms between attempts)
  CALIBRATION_RUNS: 1000,      # ML calibration period
  YIELD_THRESHOLD: 16,         # Performance optimization
}

mlParams = {
  weightingConstant: 0.1,      # Learning rate for ML piece selection
  useCalibration: true,        # Enable 1000-run calibration period
  placementStrategy: 'optimized', # Strategy selection ('original' or 'optimized')
  boardUpdateFrequency: 10,    # Visual board update throttling (1-50 runs)
}
```

### Placement Strategies
Two built-in strategies in `SolverContext.jsx`:
- **Original**: Standard placement order
- **Optimized**: 25% faster using Diagonal Restriction method

### Strategy Comparison System
Comprehensive statistical analysis comparing strategy performance:
- **Performance Metrics**: Runs/sec, pieces/sec, completion rates, dead-end tracking
- **Statistical Analysis**: Standard deviation, percentiles, t-test significance, Cohen's d effect size
- **Head-to-Head Comparison**: Win/loss records, efficiency ratios, score differentials
- **Visual Dashboard**: Side-by-side strategy cards, comparison panel, position failure heatmaps
- **Export/Import**: Full comparison data included in CSV backups

## Important Patterns

### Adding New Placement Strategies
1. Add strategy definition to `PLACEMENT_STRATEGIES` object in `SolverContext.jsx`
2. Strategy must have `name`, `description`, and `order` (array of 256 positions)
3. Order should start with hints (34, 45, 135, 210, 221) and arrange remaining pieces logically

### Working with Solver State
- Always use `useSolver()` hook to access context
- State updates are batched for performance
- `mlParams` object controls all ML behavior and placement strategy selection

### Performance Considerations
- Solver uses time-slicing with `yieldToMain()` to maintain 60fps
- Large datasets (>10,000 runs) may impact browser performance
- Visual board updates are throttled (configurable 1-50 runs) to prevent flickering
- Strategy statistics are maintained separately for accurate per-strategy tracking

### CSV Data Format
Exports include:
- **Piece statistics**: HintPosition, Direction, PieceId, Rotation, AvgScore, Count, BestScore, SelectionPercentage
- **Metadata**: TotalRuns, BestScore, AvgScore, CompletedSolutions, WeightingConstant, UseCalibration, PlacementStrategy
- **Strategy statistics**: Per-strategy performance metrics (runs, timing, dead-ends, position failures)
- **Comparison metrics**: Head-to-head win/loss records, efficiency ratios, statistical significance

## Development Notes

- **No TypeScript**: Project uses JSX with PropTypes-style validation
- **State Management**: Pure React Context, no external state libraries
- **Routing**: Uses React Router for navigation (single-page for now)
- **Testing**: No test framework currently configured
- **Linting**: No ESLint configuration present

The solver is designed for research and experimentation - the algorithm can be modified, new placement strategies added, and ML parameters tuned for different solving approaches.