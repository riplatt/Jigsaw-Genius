/**
 * Hard 4x4 Puzzle
 * 4×4 edge-matching puzzle with 16 pieces
 */

export const e2pieces_hard_4x4 = {
  name: "Hard 4x4 Puzzle",
  boardSize: 4,
  totalPieces: 16,
  pieces: [
    { id: 0, edges: [0, 0, 1, 1] },
    { id: 1, edges: [0, 0, 1, 2] },
    { id: 2, edges: [0, 0, 2, 1] },
    { id: 3, edges: [0, 0, 2, 2] },
    { id: 4, edges: [0, 1, 3, 1] },
    { id: 5, edges: [0, 1, 3, 2] },
    { id: 6, edges: [0, 1, 4, 1] },
    { id: 7, edges: [0, 1, 5, 2] },
    { id: 8, edges: [0, 2, 4, 1] },
    { id: 9, edges: [0, 2, 4, 2] },
    { id: 10, edges: [0, 2, 5, 1] },
    { id: 11, edges: [0, 2, 5, 2] },
    { id: 12, edges: [3, 3, 5, 5] },
    { id: 13, edges: [3, 4, 3, 5] },
    { id: 14, edges: [3, 4, 4, 4] },
    { id: 15, edges: [3, 5, 5, 4] }
  ],
  hints: {
    3: { id: 1, rotation: 0 },
  },
  placement_strategies: {
    optimized: {
      name: "Optimized 4x4 Strategy",
      description: "Constraint-based placement for 4x4 puzzle",
      phases: [
        {
          name: "hints",
          description: "Fixed hint piece at center-right",
          positions: [3],
          constraintLevel: "fixed"
        },
        {
          name: "orthogonal-adjacent",
          description: "Directly adjacent to hint - highest constraints",
          positions: [2, 7],
          constraintLevel: "high"
        },
        {
          name: "diagonal-constrained",
          description: "Diagonally adjacent and corner positions",
          positions: [1, 6, 11],
          constraintLevel: "medium"
        },
        {
          name: "edges",
          description: "Edge positions with moderate constraints",
          positions: [8, 13],
          constraintLevel: "medium"
        },
        {
          name: "interior",
          description: "Interior position - highly constrained by neighbors",
          positions: [12],
          constraintLevel: "high"
        },
        {
          name: "remaining",
          description: "Remaining corners and edges",
          positions: [0, 4, 5, 9, 10, 14, 15],
          constraintLevel: "low"
        }
      ]
    },
    sequential: {
      name: "Sequential Strategy",
      description: "Simple left-to-right, top-to-bottom placement",
      phases: [
        {
          name: "hints",
          description: "Fixed hint piece",
          positions: [3],
          constraintLevel: "fixed"
        },
        {
          name: "sequential",
          description: "Sequential placement order",
          positions: [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
          constraintLevel: "mixed"
        }
      ]
    }
  },
  metadata: {
    description: "Hard 4x4 Puzzle - 4×4 edge-matching puzzle",
    difficulty: "Hard",
    edgeColors: {
      0: "Border (empty)",
      1: "Red",
      2: "Orange",
      3: "Yellow",
      4: "Green",
      5: "Cyan",
      6: "Blue",
      7: "Violet",
      8: "Pink",
      9: "Amber",
      10: "Emerald",
      11: "Teal",
      12: "Indigo",
      13: "Purple",
      14: "Lime",
      15: "Rose",
      16: "Slate",
      17: "Stone",
      18: "Red-600",
      19: "Orange-600",
      20: "Yellow-600",
      21: "Green-600",
      22: "Cyan-600"
    },
  },
};
