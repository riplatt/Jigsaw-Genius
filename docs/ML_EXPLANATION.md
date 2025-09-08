# Machine Learning System Explanation

## Overview
The solver uses a **statistical machine learning approach** that learns from experience to improve piece placement decisions. It's not a traditional neural network, but rather a clever **weighted probability system** based on historical performance.

## Key Concepts

### 1. **Hint-Adjacent Learning** 🎯
The ML system focuses specifically on positions **adjacent to fixed hint pieces**:

- **5 Fixed Hints** at positions: 135, 34, 45, 210, 221
- Each hint has **4 adjacent positions** (north, east, south, west)
- **Total of ~20 positions** where ML learning is applied

### 2. **Statistical Tracking** 📊
For each hint-adjacent position, the system tracks:

```javascript
hintAdjacencyStats = {
  "135-north": {      // Position 135, north direction
    "42": {           // Piece ID 42
      "90": {         // 90-degree rotation
        avgScore: 187.5,  // Average score when this piece/rotation was used
        count: 12,        // How many times it was tried
        bestScore: 245    // Best score achieved with this combination
      },
      "180": { ... }  // Other rotations
    },
    "73": { ... }     // Other pieces
  },
  "135-east": { ... } // Other directions
}
```

### 3. **Weight Calculation Algorithm** ⚖️

The core ML formula is:

```javascript
weight = Math.exp(k * (localAvgScore - globalAvgScore))
```

Where:
- **`localAvgScore`**: Average score for this specific piece/rotation at this position
- **`globalAvgScore`**: Overall average score across all runs
- **`k`**: Learning rate constant (default: 0.1, adjustable 0.01-1.0)

#### **How This Works:**
- If `localAvgScore > globalAvgScore` → **Higher weight** (piece performs well here)
- If `localAvgScore < globalAvgScore` → **Lower weight** (piece performs poorly here)
- If `localAvgScore = globalAvgScore` → **Weight = 1.0** (neutral)

### 4. **Weighted Random Selection** 🎲

Instead of purely random choice, the system:

1. **Calculates weights** for all valid pieces/rotations
2. **Sums total weight**
3. **Generates random number** × total weight
4. **Selects piece** based on weighted probability

**Example:**
```
Piece A: weight = 2.5 (good historical performance)
Piece B: weight = 1.0 (neutral performance)  
Piece C: weight = 0.4 (poor historical performance)
Total weight = 3.9

Piece A gets ~64% selection chance (2.5/3.9)
Piece B gets ~26% selection chance (1.0/3.9)
Piece C gets ~10% selection chance (0.4/3.9)
```

## Learning Process

### **Phase 1: Calibration (First 1000 runs)** 🏃‍♂️
- **Purpose**: Establish baseline performance data
- **Behavior**: Random selection (no ML weighting)
- **Goal**: Gather enough data for meaningful statistics

### **Phase 2: Active Learning (After 1000 runs)** 🧠
- **Purpose**: Use learned patterns to improve performance
- **Behavior**: Weighted selection based on historical data
- **Result**: Increasingly better piece placement decisions

## Real-World Example

Let's say position 119 (north of hint 135) has these options:

```
Valid pieces for position 119:
- Piece 42, rotation 90°: Has been tried 15 times, avgScore = 195
- Piece 73, rotation 180°: Has been tried 8 times, avgScore = 180  
- Piece 91, rotation 0°: Has been tried 3 times, avgScore = 210

Global average score: 185

Weights:
- Piece 42: exp(0.1 × (195-185)) = exp(1.0) = 2.72
- Piece 73: exp(0.1 × (180-185)) = exp(-0.5) = 0.61
- Piece 91: exp(0.1 × (210-185)) = exp(2.5) = 12.18

Selection probabilities:
- Piece 42: 2.72 / 15.51 = 17.5%
- Piece 73: 0.61 / 15.51 = 3.9%  
- Piece 91: 12.18 / 15.51 = 78.6% ← Most likely to be chosen!
```

## Parameters You Can Adjust

### **Learning Rate (k)** 🎛️
- **Range**: 0.01 - 1.0
- **Low values (0.01-0.1)**: Conservative learning, gradual improvement
- **High values (0.5-1.0)**: Aggressive learning, rapid adaptation
- **Default**: 0.1 (balanced approach)

### **Calibration Toggle** 🔄
- **Enabled**: Wait for 1000 runs before starting ML
- **Disabled**: Start ML immediately (with limited data)

## Why This Approach Works

### **Advantages:** ✅
1. **Focused Learning**: Only learns where it matters most (hint-adjacent positions)
2. **Continuous Improvement**: Gets better with more data
3. **Balanced Exploration**: Still tries "bad" pieces occasionally (exploration vs exploitation)
4. **Rotation-Specific**: Learns that piece X at 90° might be better than at 180°
5. **Position-Specific**: Learns that piece Y works well north of hint A but not east of hint B

### **Limitations:** ⚠️
1. **Only hint-adjacent**: Doesn't learn patterns for other positions
2. **Requires lots of data**: Needs many runs to be effective
3. **Local optimization**: Might miss global patterns
4. **Simple algorithm**: Could be enhanced with more sophisticated ML

## Observing the Learning

You can see the ML in action through:

1. **Selection Percentages**: In the Hint Analysis section, watch percentages change
2. **Performance Trends**: Average scores should gradually improve
3. **Console Logs**: Enable to see selection reasoning
4. **CSV Exports**: Detailed statistics for analysis

## Future ML Enhancements

Potential improvements:
- **Pattern Recognition**: Learn common successful configurations
- **Neural Networks**: More sophisticated learning algorithms
- **Genetic Algorithms**: Evolve solving strategies
- **Transfer Learning**: Apply patterns from one hint to another
- **Ensemble Methods**: Combine multiple ML approaches

---

The current ML system is elegant in its simplicity - it learns from experience and gradually improves decision-making in the most critical positions of the puzzle!