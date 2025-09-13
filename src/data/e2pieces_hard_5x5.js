/**
 * Hard 5x5 Puzzle
 * 5×5 edge-matching puzzle with 25 pieces
 */

export const e2pieces_hard_5x5 = {
  name: "Hard 5x5 Puzzle",
  boardSize: 5,
  totalPieces: 25,
  pieces: [
    { id: 0, edges: [0, 0, 1, 1] },
    { id: 1, edges: [0, 0, 2, 1] },
    { id: 2, edges: [0, 0, 2, 3] },
    { id: 3, edges: [0, 0, 3, 1] },
    { id: 4, edges: [0, 1, 4, 1] },
    { id: 5, edges: [0, 1, 4, 3] },
    { id: 6, edges: [0, 1, 5, 2] },
    { id: 7, edges: [0, 1, 5, 3] },
    { id: 8, edges: [0, 1, 6, 2] },
    { id: 9, edges: [0, 2, 5, 2] },
    { id: 10, edges: [0, 2, 6, 3] },
    { id: 11, edges: [0, 2, 7, 3] },
    { id: 12, edges: [0, 3, 4, 1] },
    { id: 13, edges: [0, 3, 6, 1] },
    { id: 14, edges: [0, 3, 6, 2] },
    { id: 15, edges: [0, 3, 7, 2] },
    { id: 16, edges: [4, 4, 5, 6] },
    { id: 17, edges: [4, 5, 4, 6] },
    { id: 18, edges: [4, 5, 5, 6] },
    { id: 19, edges: [4, 5, 7, 7] },
    { id: 20, edges: [4, 6, 5, 6] },
    { id: 21, edges: [4, 6, 7, 7] },
    { id: 22, edges: [4, 7, 5, 5] },
    { id: 23, edges: [5, 6, 7, 7] },
    { id: 24, edges: [6, 7, 7, 7] }
  ],
  hints: {
    // No predefined hints for this puzzle
  },
  placement_strategies: {
    step_01: {
      name: "sequential",
      placements: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
    },
  },
  metadata: {
    description: "Hard 5x5 Puzzle - 5×5 edge-matching puzzle",
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
