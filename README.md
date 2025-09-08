# Eternity II Jigsaw Genius

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.8-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.6-blue.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A sophisticated web application for solving the infamous **Eternity II puzzle** using a non-backtracking statistical solver with machine learning optimization. The app employs intelligent piece placement strategies and real-time performance analysis to tackle this notoriously difficult 16×16 edge-matching puzzle.

## ✨ Features

- **🧩 Advanced Solving Algorithm**: Non-backtracking statistical solver with weighted machine learning
- **📊 Real-time Analytics**: Live performance tracking with detailed statistics
- **🎯 Machine Learning Optimization**: Adaptive piece selection based on historical performance
- **💾 State Persistence**: Automatic saving and loading of solver progress
- **📈 CSV Import/Export**: Backup and restore solver data with detailed statistics
- **🎨 Interactive Visualization**: Animated 16×16 puzzle board with color-coded edges
- **⚙️ Configurable Parameters**: Adjustable learning rates and calibration settings
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

## 🖼️ Screenshots

*[Add screenshots of the application interface here]*

## 🏗️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + Custom UI Components
- **Animation**: Framer Motion
- **UI Components**: Radix UI (shadcn/ui pattern)
- **State Management**: React Context API + localStorage
- **Icons**: Lucide React
- **Build Tool**: Vite with hot module replacement

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/riplatt/Jigsaw-Genius.git
   cd e2-jigsaw-genius
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application.

### Building for Production

```bash
npm run build
npm run preview
```

## 🎮 Usage

### Basic Operation

1. **Start Solving**: Click the "Start" button to begin the solving process
2. **Monitor Progress**: Watch the real-time board updates and statistics
3. **Pause/Resume**: Use the "Pause" button to stop and resume solving
4. **Reset**: Clear all progress and start fresh with the "Reset" button

### Machine Learning Controls

- **Learning Rate (k)**: Adjust how aggressively the solver favors high-scoring pieces (0.01-1.0)
- **Calibration Mode**: Enable/disable the 1000-run calibration period
- **Performance Tracking**: Monitor total runs, best scores, and completion rates

### Data Management

- **CSV Export**: Download comprehensive solver data including piece statistics
- **CSV Import**: Restore previous solving sessions and continue training
- **Automatic Persistence**: All progress is automatically saved to browser storage

## 🧠 Algorithm Details

### Solving Strategy

The solver uses a **non-backtracking statistical approach** with the following key components:

1. **Fixed Placement Order**: Follows a predetermined sequence starting with hint-adjacent positions
2. **Edge Validation**: Ensures pieces fit by matching edge colors and border constraints
3. **Machine Learning Weighting**: Uses exponential weighting based on historical performance

### Machine Learning Implementation

```javascript
// Weight calculation for piece selection
weight = exp(k * (localAvgScore - globalAvgScore))
```

- **Calibration Phase**: First 1000 runs establish baseline performance
- **Adaptive Selection**: Pieces with better historical performance get higher selection probability
- **Continuous Learning**: Statistics update after each solving attempt

### Puzzle Constraints

- **Board Size**: 16×16 (256 total pieces)
- **Fixed Hints**: 5 pre-placed pieces at specific positions
- **Edge Colors**: 23 different edge colors (0-22, where 0 = border)
- **Rotations**: Each piece can be rotated in 90° increments

## 📁 Project Structure

```
src/
├── components/
│   ├── puzzle/
│   │   ├── SolverContext.jsx     # Main solver logic and state
│   │   ├── PuzzleBoard.jsx       # Visual board component
│   │   ├── SolverControls.jsx    # Control panel
│   │   └── HintAnalysis.jsx      # ML performance analysis
│   ├── ui/                       # Reusable UI components
│   │   ├── button.jsx
│   │   ├── slider.jsx
│   │   └── ...
│   └── Layout.jsx                # Main application layout
├── pages/
│   └── Solver.jsx                # Main solver page
├── config/
│   └── solver.js                 # Configuration constants
├── utils/
│   └── index.js                  # Utility functions
└── main.jsx                      # Application entry point
```

## ⚙️ Configuration

### Solver Parameters

Located in `src/config/solver.js`:

```javascript
export const SOLVER_CONFIG = {
  BOARD_SIZE: 16,
  TOTAL_PIECES: 256,
  CALIBRATION_RUNS: 1000,
  SOLVER_INTERVAL: 333, // milliseconds
  // ... other configuration options
};
```

### Customizable Settings

- **Solving Speed**: Adjust `SOLVER_INTERVAL` for faster/slower solving
- **Calibration Period**: Modify `CALIBRATION_RUNS` for different training lengths
- **Animation Settings**: Configure duration and delays for visual effects

## 📄 CSV Data Format

### Export Format

The CSV export includes the following data:

| Column | Description |
|--------|-------------|
| HintPosition | Position of the hint piece |
| Direction | Adjacent direction (north, east, south, west) |
| PieceId | ID of the puzzle piece |
| Rotation | Rotation angle (0, 90, 180, 270) |
| AvgScore | Average score for this piece/rotation |
| Count | Number of times this combination was used |
| BestScore | Best score achieved with this combination |
| SelectionPercentage | ML-calculated selection probability |

### Metadata Section

Additional solver state information:
- Total runs, best score, average score
- Completed solutions count
- Current run information
- ML parameters (weighting constant, calibration setting)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and commit them: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Submit a pull request

### Development Guidelines

- Follow React best practices and hooks patterns
- Use TypeScript for new components (optional)
- Maintain Tailwind CSS class organization
- Add comments for complex algorithm logic
- Test your changes thoroughly

### Code Style

- Use ES6+ features and functional components
- Follow the existing code structure and naming conventions
- Keep components focused and maintainable
- Use React.memo for performance optimization where appropriate

## 🐛 Known Issues

- Large datasets (>10,000 runs) may impact browser performance
- CSV import requires exact format matching
- Mobile performance may be limited for extended solving sessions

## 🔮 Future Enhancements

- [ ] Web Workers for parallel solving
- [ ] Advanced ML algorithms (neural networks)
- [ ] Pattern recognition for common configurations
- [ ] Backtracking option for dead-end recovery
- [ ] Multiple solving strategy comparison
- [ ] 3D visualization mode
- [ ] Tournament mode for strategy comparison

## 📈 Performance Tips

1. **Regular Exports**: Save your progress frequently using CSV export
2. **Browser Resources**: Close other tabs for better performance during long runs
3. **Learning Rate**: Start with lower values (0.1-0.3) for more stable learning
4. **Calibration**: Allow the full 1000-run calibration for optimal ML performance

## 🙏 Acknowledgments

- **Eternity II Puzzle** creators for the original challenge
- **React** and **Vite** teams for excellent development tools
- **Tailwind CSS** for the utility-first styling approach
- **Radix UI** for accessible component primitives

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- **Project Repository**: [https://github.com/riplatt/Jigsaw-Genius](https://github.com/riplatt/Jigsaw-Genius)
- **Issues**: [https://github.com/riplatt/Jigsaw-Genius/issues](https://github.com/riplatt/Jigsaw-Genius/issues)

---

**Made with ❤️ for puzzle enthusiasts and algorithm researchers**