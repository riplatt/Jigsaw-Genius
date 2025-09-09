import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { SOLVER_CONFIG } from "../../config/solver.js";

// --- Data from e2pieces16x16.txt ---
const pieces = [
  { id: 0, edges: [1, 17, 0, 0] },
  { id: 1, edges: [1, 5, 0, 0] },
  { id: 2, edges: [9, 17, 0, 0] },
  { id: 3, edges: [17, 9, 0, 0] },
  { id: 4, edges: [2, 1, 0, 1] },
  { id: 5, edges: [10, 9, 0, 1] },
  { id: 6, edges: [6, 1, 0, 1] },
  { id: 7, edges: [6, 13, 0, 1] },
  { id: 8, edges: [11, 17, 0, 1] },
  { id: 9, edges: [7, 5, 0, 1] },
  { id: 10, edges: [15, 9, 0, 1] },
  { id: 11, edges: [8, 5, 0, 1] },
  { id: 12, edges: [8, 13, 0, 1] },
  { id: 13, edges: [21, 5, 0, 1] },
  { id: 14, edges: [10, 1, 0, 9] },
  { id: 15, edges: [18, 17, 0, 9] },
  { id: 16, edges: [14, 13, 0, 9] },
  { id: 17, edges: [19, 13, 0, 9] },
  { id: 18, edges: [7, 9, 0, 9] },
  { id: 19, edges: [15, 9, 0, 9] },
  { id: 20, edges: [4, 5, 0, 9] },
  { id: 21, edges: [12, 1, 0, 9] },
  { id: 22, edges: [12, 13, 0, 9] },
  { id: 23, edges: [20, 1, 0, 9] },
  { id: 24, edges: [21, 1, 0, 9] },
  { id: 25, edges: [2, 9, 0, 17] },
  { id: 26, edges: [2, 17, 0, 17] },
  { id: 27, edges: [10, 17, 0, 17] },
  { id: 28, edges: [18, 17, 0, 17] },
  { id: 29, edges: [7, 13, 0, 17] },
  { id: 30, edges: [15, 9, 0, 17] },
  { id: 31, edges: [20, 17, 0, 17] },
  { id: 32, edges: [8, 9, 0, 17] },
  { id: 33, edges: [8, 5, 0, 17] },
  { id: 34, edges: [16, 13, 0, 17] },
  { id: 35, edges: [22, 5, 0, 17] },
  { id: 36, edges: [18, 1, 0, 5] },
  { id: 37, edges: [3, 13, 0, 5] },
  { id: 38, edges: [11, 13, 0, 5] },
  { id: 39, edges: [19, 9, 0, 5] },
  { id: 40, edges: [19, 17, 0, 5] },
  { id: 41, edges: [15, 1, 0, 5] },
  { id: 42, edges: [15, 9, 0, 5] },
  { id: 43, edges: [15, 17, 0, 5] },
  { id: 44, edges: [4, 1, 0, 5] },
  { id: 45, edges: [20, 5, 0, 5] },
  { id: 46, edges: [8, 5, 0, 5] },
  { id: 47, edges: [16, 5, 0, 5] },
  { id: 48, edges: [2, 13, 0, 13] },
  { id: 49, edges: [10, 1, 0, 13] },
  { id: 50, edges: [10, 9, 0, 13] },
  { id: 51, edges: [6, 1, 0, 13] },
  { id: 52, edges: [7, 5, 0, 13] },
  { id: 53, edges: [4, 5, 0, 13] },
  { id: 54, edges: [4, 13, 0, 13] },
  { id: 55, edges: [8, 17, 0, 13] },
  { id: 56, edges: [16, 1, 0, 13] },
  { id: 57, edges: [16, 13, 0, 13] },
  { id: 58, edges: [21, 9, 0, 13] },
  { id: 59, edges: [22, 17, 0, 13] },
  { id: 60, edges: [6, 18, 2, 2] },
  { id: 61, edges: [14, 7, 2, 2] },
  { id: 62, edges: [10, 3, 2, 10] },
  { id: 63, edges: [2, 8, 2, 18] },
  { id: 64, edges: [18, 22, 2, 18] },
  { id: 65, edges: [14, 14, 2, 18] },
  { id: 66, edges: [11, 10, 2, 18] },
  { id: 67, edges: [20, 6, 2, 18] },
  { id: 68, edges: [22, 8, 2, 18] },
  { id: 69, edges: [3, 7, 2, 3] },
  { id: 70, edges: [7, 12, 2, 3] },
  { id: 71, edges: [14, 18, 2, 11] },
  { id: 72, edges: [15, 4, 2, 11] },
  { id: 73, edges: [20, 15, 2, 11] },
  { id: 74, edges: [8, 3, 2, 11] },
  { id: 75, edges: [14, 15, 2, 19] },
  { id: 76, edges: [19, 15, 2, 19] },
  { id: 77, edges: [3, 16, 2, 7] },
  { id: 78, edges: [20, 3, 2, 7] },
  { id: 79, edges: [16, 21, 2, 7] },
  { id: 80, edges: [19, 18, 2, 15] },
  { id: 81, edges: [18, 18, 2, 4] },
  { id: 82, edges: [11, 4, 2, 4] },
  { id: 83, edges: [18, 19, 2, 12] },
  { id: 84, edges: [6, 14, 2, 12] },
  { id: 85, edges: [8, 12, 2, 12] },
  { id: 86, edges: [16, 20, 2, 12] },
  { id: 87, edges: [2, 21, 2, 20] },
  { id: 88, edges: [6, 22, 2, 20] },
  { id: 89, edges: [4, 16, 2, 20] },
  { id: 90, edges: [11, 12, 2, 8] },
  { id: 91, edges: [19, 15, 2, 8] },
  { id: 92, edges: [19, 4, 2, 8] },
  { id: 93, edges: [4, 21, 2, 8] },
  { id: 94, edges: [12, 14, 2, 8] },
  { id: 95, edges: [21, 3, 2, 21] },
  { id: 96, edges: [4, 19, 2, 22] },
  { id: 97, edges: [20, 8, 2, 22] },
  { id: 98, edges: [21, 6, 2, 22] },
  { id: 99, edges: [22, 21, 2, 22] },
  { id: 100, edges: [12, 15, 10, 10] },
  { id: 101, edges: [12, 16, 10, 10] },
  { id: 102, edges: [16, 19, 10, 10] },
  { id: 103, edges: [22, 6, 10, 10] },
  { id: 104, edges: [4, 15, 10, 18] },
  { id: 105, edges: [3, 8, 10, 6] },
  { id: 106, edges: [19, 8, 10, 6] },
  { id: 107, edges: [4, 15, 10, 6] },
  { id: 108, edges: [16, 11, 10, 6] },
  { id: 109, edges: [15, 12, 10, 14] },
  { id: 110, edges: [12, 15, 10, 14] },
  { id: 111, edges: [20, 19, 10, 3] },
  { id: 112, edges: [20, 16, 10, 3] },
  { id: 113, edges: [14, 4, 10, 11] },
  { id: 114, edges: [7, 12, 10, 11] },
  { id: 115, edges: [12, 11, 10, 11] },
  { id: 116, edges: [22, 16, 10, 11] },
  { id: 117, edges: [3, 21, 10, 19] },
  { id: 118, edges: [16, 12, 10, 7] },
  { id: 119, edges: [8, 22, 10, 15] },
  { id: 120, edges: [14, 22, 10, 4] },
  { id: 121, edges: [6, 16, 10, 20] },
  { id: 122, edges: [14, 19, 10, 20] },
  { id: 123, edges: [20, 15, 10, 20] },
  { id: 124, edges: [12, 22, 10, 8] },
  { id: 125, edges: [21, 15, 10, 8] },
  { id: 126, edges: [14, 6, 10, 16] },
  { id: 127, edges: [19, 21, 10, 16] },
  { id: 128, edges: [4, 3, 10, 16] },
  { id: 129, edges: [20, 8, 10, 16] },
  { id: 130, edges: [6, 20, 10, 21] },
  { id: 131, edges: [12, 14, 10, 21] },
  { id: 132, edges: [14, 16, 10, 22] },
  { id: 133, edges: [11, 4, 10, 22] },
  { id: 134, edges: [4, 3, 10, 22] },
  { id: 135, edges: [16, 20, 10, 22] },
  { id: 136, edges: [20, 7, 18, 18] },
  { id: 137, edges: [6, 3, 18, 6] },
  { id: 138, edges: [6, 11, 18, 6] },
  { id: 139, edges: [6, 12, 18, 6] },
  { id: 140, edges: [19, 21, 18, 6] },
  { id: 141, edges: [15, 6, 18, 6] },
  { id: 142, edges: [16, 12, 18, 6] },
  { id: 143, edges: [21, 21, 18, 6] },
  { id: 144, edges: [3, 4, 18, 14] },
  { id: 145, edges: [18, 12, 18, 3] },
  { id: 146, edges: [18, 22, 18, 3] },
  { id: 147, edges: [3, 14, 18, 3] },
  { id: 148, edges: [15, 12, 18, 3] },
  { id: 149, edges: [6, 11, 18, 19] },
  { id: 150, edges: [4, 22, 18, 19] },
  { id: 151, edges: [11, 11, 18, 7] },
  { id: 152, edges: [11, 19, 18, 7] },
  { id: 153, edges: [22, 16, 18, 7] },
  { id: 154, edges: [7, 7, 18, 4] },
  { id: 155, edges: [7, 12, 18, 4] },
  { id: 156, edges: [22, 7, 18, 4] },
  { id: 157, edges: [7, 16, 18, 20] },
  { id: 158, edges: [8, 6, 18, 20] },
  { id: 159, edges: [21, 21, 18, 8] },
  { id: 160, edges: [6, 20, 18, 16] },
  { id: 161, edges: [14, 20, 18, 16] },
  { id: 162, edges: [15, 11, 18, 22] },
  { id: 163, edges: [4, 16, 18, 22] },
  { id: 164, edges: [3, 4, 6, 14] },
  { id: 165, edges: [4, 8, 6, 14] },
  { id: 166, edges: [3, 3, 6, 11] },
  { id: 167, edges: [11, 15, 6, 19] },
  { id: 168, edges: [19, 21, 6, 19] },
  { id: 169, edges: [4, 8, 6, 7] },
  { id: 170, edges: [20, 16, 6, 7] },
  { id: 171, edges: [21, 11, 6, 7] },
  { id: 172, edges: [15, 15, 6, 15] },
  { id: 173, edges: [12, 20, 6, 15] },
  { id: 174, edges: [7, 21, 6, 4] },
  { id: 175, edges: [7, 19, 6, 12] },
  { id: 176, edges: [14, 4, 6, 20] },
  { id: 177, edges: [12, 16, 6, 8] },
  { id: 178, edges: [8, 15, 6, 8] },
  { id: 179, edges: [7, 16, 6, 16] },
  { id: 180, edges: [11, 16, 6, 21] },
  { id: 181, edges: [7, 11, 6, 21] },
  { id: 182, edges: [19, 8, 14, 14] },
  { id: 183, edges: [22, 7, 14, 3] },
  { id: 184, edges: [19, 12, 14, 11] },
  { id: 185, edges: [8, 8, 14, 11] },
  { id: 186, edges: [21, 7, 14, 19] },
  { id: 187, edges: [14, 21, 14, 7] },
  { id: 188, edges: [3, 19, 14, 7] },
  { id: 189, edges: [16, 19, 14, 7] },
  { id: 190, edges: [3, 3, 14, 15] },
  { id: 191, edges: [15, 20, 14, 15] },
  { id: 192, edges: [11, 7, 14, 4] },
  { id: 193, edges: [21, 11, 14, 12] },
  { id: 194, edges: [21, 22, 14, 12] },
  { id: 195, edges: [22, 15, 14, 12] },
  { id: 196, edges: [11, 22, 14, 20] },
  { id: 197, edges: [19, 8, 14, 20] },
  { id: 198, edges: [20, 20, 14, 20] },
  { id: 199, edges: [19, 3, 14, 8] },
  { id: 200, edges: [21, 8, 14, 16] },
  { id: 201, edges: [22, 7, 14, 16] },
  { id: 202, edges: [12, 19, 14, 21] },
  { id: 203, edges: [12, 8, 14, 21] },
  { id: 204, edges: [16, 3, 14, 21] },
  { id: 205, edges: [22, 21, 14, 21] },
  { id: 206, edges: [22, 7, 3, 3] },
  { id: 207, edges: [19, 22, 3, 11] },
  { id: 208, edges: [8, 15, 3, 11] },
  { id: 209, edges: [11, 19, 3, 7] },
  { id: 210, edges: [16, 15, 3, 7] },
  { id: 211, edges: [3, 16, 3, 15] },
  { id: 212, edges: [8, 8, 3, 4] },
  { id: 213, edges: [3, 20, 3, 12] },
  { id: 214, edges: [4, 22, 3, 12] },
  { id: 215, edges: [22, 21, 3, 12] },
  { id: 216, edges: [19, 15, 3, 20] },
  { id: 217, edges: [4, 12, 3, 16] },
  { id: 218, edges: [11, 4, 3, 21] },
  { id: 219, edges: [11, 16, 3, 22] },
  { id: 220, edges: [21, 21, 3, 22] },
  { id: 221, edges: [21, 22, 3, 22] },
  { id: 222, edges: [12, 22, 11, 11] },
  { id: 223, edges: [20, 7, 11, 11] },
  { id: 224, edges: [16, 15, 11, 11] },
  { id: 225, edges: [19, 15, 11, 7] },
  { id: 226, edges: [12, 12, 11, 7] },
  { id: 227, edges: [19, 8, 11, 4] },
  { id: 228, edges: [7, 22, 11, 20] },
  { id: 229, edges: [16, 8, 11, 20] },
  { id: 230, edges: [12, 20, 11, 8] },
  { id: 231, edges: [12, 21, 11, 8] },
  { id: 232, edges: [19, 20, 19, 19] },
  { id: 233, edges: [16, 4, 19, 7] },
  { id: 234, edges: [7, 4, 19, 4] },
  { id: 235, edges: [7, 20, 19, 4] },
  { id: 236, edges: [12, 15, 19, 4] },
  { id: 237, edges: [4, 16, 19, 12] },
  { id: 238, edges: [15, 22, 19, 20] },
  { id: 239, edges: [21, 15, 19, 20] },
  { id: 240, edges: [7, 21, 19, 8] },
  { id: 241, edges: [4, 21, 19, 8] },
  { id: 242, edges: [15, 12, 7, 15] },
  { id: 243, edges: [20, 8, 7, 15] },
  { id: 244, edges: [22, 20, 7, 4] },
  { id: 245, edges: [16, 22, 7, 21] },
  { id: 246, edges: [21, 22, 15, 15] },
  { id: 247, edges: [12, 4, 15, 4] },
  { id: 248, edges: [4, 21, 15, 12] },
  { id: 249, edges: [16, 21, 15, 20] },
  { id: 250, edges: [22, 8, 4, 4] },
  { id: 251, edges: [8, 12, 4, 12] },
  { id: 252, edges: [16, 20, 12, 8] },
  { id: 253, edges: [21, 16, 20, 16] },
  { id: 254, edges: [16, 22, 20, 22] },
  { id: 255, edges: [21, 22, 8, 22] },
];

const hints = {
  135: { id: 138, rotation: 180 },
  34: { id: 207, rotation: 270 },
  45: { id: 254, rotation: 270 },
  210: { id: 180, rotation: 270 },
  221: { id: 248, rotation: 0 },
};

// Placement strategy definitions
const PLACEMENT_STRATEGIES = {
  original: {
    name: "Original Strategy",
    description: "Standard placement order",
    order: [
      34, 45, 135, 210, 221, 18, 29, 33, 35, 44, 46, 50, 61, 119, 134, 136, 151,
      194, 205, 209, 211, 220, 222, 226, 237, 17, 19, 28, 30, 49, 51, 60, 62, 118,
      120, 150, 152, 193, 195, 204, 206, 225, 227, 236, 238, 2, 13, 32, 36, 43, 47,
      66, 77, 103, 133, 137, 167, 178, 189, 208, 212, 219, 223, 242, 253, 0, 1, 3,
      4, 11, 12, 14, 15, 16, 20, 27, 31, 48, 52, 59, 63, 64, 65, 67, 68, 75, 76, 78,
      79, 101, 102, 104, 105, 117, 121, 149, 153, 165, 166, 168, 169, 176, 177, 179,
      180, 187, 188, 190, 191, 192, 196, 203, 207, 224, 228, 235, 239, 240, 241,
      243, 244, 251, 252, 254, 255, 37, 42, 82, 87, 93, 132, 138, 162, 173, 183,
      213, 218, 5, 10, 21, 26, 53, 58, 69, 74, 80, 81, 83, 84, 85, 86, 88, 89, 90,
      91, 92, 94, 95, 100, 106, 116, 122, 148, 154, 160, 161, 163, 164, 170, 171,
      172, 174, 175, 181, 182, 184, 185, 186, 197, 202, 229, 234, 245, 250, 7, 24,
      39, 56, 112, 114, 124, 126, 129, 141, 143, 215, 232, 247, 9, 22, 41, 54, 71,
      97, 109, 111, 131, 139, 144, 146, 156, 158, 200, 217, 230, 249, 73, 99, 107,
      198, 6, 8, 96, 127, 128, 159, 246, 248, 23, 25, 38, 40, 55, 57, 70, 72, 98,
      108, 110, 113, 115, 123, 125, 130, 140, 142, 145, 147, 155, 157, 199, 201,
      214, 216, 231, 233,
    ]
  },
  optimized: {
    name: "Optimized Strategy",
    description: "25% faster with Diagonal Restriction",
    order: [
      // Hints: 34, 45, 135, 210, 221
      34, 45, 135, 210, 221,
      // Orthogonal-Adjacent: 18, 29, 33, 35, 44, 46, 50, 61, 119, 134, 136, 151, 194, 205, 209, 211, 220, 222, 226, 237
      18, 29, 33, 35, 44, 46, 50, 61, 119, 134, 136, 151, 194, 205, 209, 211, 220, 222, 226, 237,
      // Diagonal Restriction (formerly Weighted Backtracking): 17, 19, 28, 30, 49, 51, 60, 62, 118, 120, 150, 152, 193, 195, 204, 206, 225, 227, 236, 238, 2, 13, 32, 36, 43, 47, 66, 77, 103, 133, 137, 167, 178, 189, 208, 212, 219, 223, 242, 253
      17, 19, 28, 30, 49, 51, 60, 62, 118, 120, 150, 152, 193, 195, 204, 206, 225, 227, 236, 238,
      2, 13, 32, 36, 43, 47, 66, 77, 103, 133, 137, 167, 178, 189, 208, 212, 219, 223, 242, 253,
      // Checkerboard: 0, 4, 6, 8, 10, 15, 21, 23, 25, 38, 40, 53, 55, 57, 64, 68, 70, 72, 74, 81, 83, 85, 89, 91, 95, 96, 98, 100, 106, 108, 110, 113, 115, 123, 125, 127, 128, 130, 140, 142, 145, 147, 155, 157, 159, 160, 164, 170, 172, 174, 181, 185, 187, 191, 198, 200, 202, 215, 217, 230, 232, 234, 240, 245, 247, 249, 251, 255
      0, 4, 6, 8, 10, 15, 21, 23, 25, 38, 40, 53, 55, 57, 64, 68, 70, 72, 74, 81, 83, 85, 89, 91,
      95, 96, 98, 100, 106, 108, 110, 113, 115, 123, 125, 127, 128, 130, 140, 142, 145, 147, 155,
      157, 159, 160, 164, 170, 172, 174, 181, 185, 187, 191, 198, 200, 202, 215, 217, 230, 232,
      234, 240, 245, 247, 249, 251, 255,
      // Surrounded: 1, 3, 5, 7, 9, 14, 16, 20, 22, 24, 31, 37, 39, 48, 52, 54, 56, 65, 67, 69, 73, 80, 82, 84, 90, 97, 99, 107, 111, 112, 114, 124, 126, 129, 141, 143, 144, 146, 156, 158, 171, 173, 175, 186, 188, 190, 201, 203, 207, 216, 218, 224, 231, 233, 235, 239, 241, 246, 248, 250, 252, 254
      1, 3, 5, 7, 9, 14, 16, 20, 22, 24, 31, 37, 39, 48, 52, 54, 56, 65, 67, 69, 73, 80, 82, 84,
      90, 97, 99, 107, 111, 112, 114, 124, 126, 129, 141, 143, 144, 146, 156, 158, 171, 173, 175,
      186, 188, 190, 201, 203, 207, 216, 218, 224, 231, 233, 235, 239, 241, 246, 248, 250, 252, 254
    ]
  }
};

// Note: Legacy fixed_order removed - now using PLACEMENT_STRATEGIES dynamically

const SIZE = SOLVER_CONFIG.BOARD_SIZE;
const directions = { north: -SIZE, east: 1, south: SIZE, west: -1 };

// --- Pre-calculate hint-adjacent positions for efficient lookup ---
const hintAdjacentPositions = new Set();
Object.keys(hints).forEach((hintPosStr) => {
  const hintPos = parseInt(hintPosStr);
  Object.values(directions).forEach((offset) => {
    const adjPos = hintPos + offset;
    const row = Math.floor(adjPos / SIZE);
    const col = adjPos % SIZE;
    // Check for valid position within board bounds and no wrap-around between rows for horizontal movements
    if (
      adjPos >= 0 &&
      adjPos < SIZE * SIZE &&
      !(offset === directions.east && col === 0) && // Moved right, but landed on col 0 (implies wrap-around)
      !(offset === directions.west && col === SIZE - 1)
    ) {
      // Moved left, but landed on col SIZE-1 (implies wrap-around)
      hintAdjacentPositions.add(adjPos);
    }
  });
});

const CALIBRATION_RUNS = SOLVER_CONFIG.CALIBRATION_RUNS;

const getInitialState = (key, defaultValue) => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const SolverContext = createContext();
export const useSolver = () => useContext(SolverContext);

export const SolverProvider = ({ children }) => {
  const [board, setBoard] = useState(Array(SIZE * SIZE).fill(null));
  const [isRunning, setIsRunning] = useState(false);

  // --- Persistent State ---
  const [currentRun, setCurrentRun] = useState(() =>
    getInitialState("solver-currentRun", { run: 0, score: 0 })
  );
  const [stats, setStats] = useState(() =>
    getInitialState("solver-stats", {
      totalRuns: 0,
      bestScore: 0,
      avgScore: 0,
      completedSolutions: 0,
    })
  );
  const [hintAdjacencyStats, setHintAdjacencyStats] = useState(() =>
    getInitialState("solver-hintAdjacencyStats", {})
  );
  const [mlParams, setMlParams] = useState(() =>
    getInitialState("solver-mlParams", {
      weightingConstant: 0.1,
      useCalibration: true,
      placementStrategy: 'optimized', // Default to optimized strategy
    })
  );

  // Define rotate function first (needed by useMemo hooks)
  const rotate = (edges, rot) => {
    const steps = Math.round(rot / 90) % 4;
    if (steps === 0) return [...edges];
    return [...edges.slice(4 - steps), ...edges.slice(0, 4 - steps)];
  };

  // Memoize expensive computations
  const pieceMap = useMemo(() => Object.fromEntries(pieces.map((p) => [p.id, p])), []);

  // Note: Edge compatibility and piecesByEdge optimizations removed for now
  // Can be re-added later if needed for performance improvements

  // --- Save state to localStorage on change ---
  useEffect(() => {
    localStorage.setItem("solver-currentRun", JSON.stringify(currentRun));
    localStorage.setItem("solver-stats", JSON.stringify(stats));
    localStorage.setItem(
      "solver-hintAdjacencyStats",
      JSON.stringify(hintAdjacencyStats)
    );
    localStorage.setItem("solver-mlParams", JSON.stringify(mlParams));
  }, [currentRun, stats, hintAdjacencyStats, mlParams]);

  const fits = (currentBoard, pos, pieceEdges) => {
    const row = Math.floor(pos / SIZE);
    const col = pos % SIZE;

    // --- BORDER CHECKS ---
    // A '0' edge MUST be on the corresponding border.
    // A non-'0' edge MUST NOT be on the corresponding border.

    // North edge
    if ((row === 0) !== (pieceEdges[0] === 0)) return false;
    // East edge
    if ((col === SIZE - 1) !== (pieceEdges[1] === 0)) return false;
    // South edge
    if ((row === SIZE - 1) !== (pieceEdges[2] === 0)) return false;
    // West edge
    if ((col === 0) !== (pieceEdges[3] === 0)) return false;

    // --- NEIGHBOR CHECKS ---
    // Check North neighbor
    if (row > 0) {
      const neighbor = currentBoard[pos + directions.north];
      if (neighbor && neighbor.edges[2] !== pieceEdges[0]) {
        return false; // My North must match neighbor's South
      }
    }

    // Check East neighbor
    if (col < SIZE - 1) {
      const neighbor = currentBoard[pos + directions.east];
      if (neighbor && neighbor.edges[3] !== pieceEdges[1]) {
        return false; // My East must match neighbor's West
      }
    }

    // Check South neighbor
    if (row < SIZE - 1) {
      const neighbor = currentBoard[pos + directions.south];
      if (neighbor && neighbor.edges[0] !== pieceEdges[2]) {
        return false; // My South must match neighbor's North
      }
    }

    // Check West neighbor
    if (col > 0) {
      const neighbor = currentBoard[pos + directions.west];
      if (neighbor && neighbor.edges[1] !== pieceEdges[3]) {
        return false; // My West must match neighbor's East
      }
    }

    return true;
  };

  // Helper function to yield control back to browser
  const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

  const runSingleLayoutAsync = useCallback(async () => {
    const newBoard = Array(SIZE * SIZE).fill(null);
    let pool = [...pieces];
    const used_ids = new Set();

    // Place hints first
    for (const [posStr, hint] of Object.entries(hints)) {
      const pos = parseInt(posStr);
      const piece = pieceMap[hint.id];
      if (piece) {
        newBoard[pos] = {
          id: piece.id,
          edges: rotate(piece.edges, hint.rotation),
          rotation: hint.rotation,
          isHint: true,
        };
        used_ids.add(piece.id);
      }
    }

    pool = pool.filter((p) => !used_ids.has(p.id));

    // Get the selected placement strategy
    const selectedStrategy = PLACEMENT_STRATEGIES[mlParams.placementStrategy] || PLACEMENT_STRATEGIES.optimized;
    const strategyOrder = selectedStrategy.order;

    // Follow the strategy order for placement
    let lastYield = performance.now();
    const YIELD_THRESHOLD = SOLVER_CONFIG.PERFORMANCE.YIELD_THRESHOLD;
    
    for (const pos of strategyOrder) {
      if (newBoard[pos] !== null) continue;

      // Yield control if we've been running too long
      if (performance.now() - lastYield > YIELD_THRESHOLD) {
        await yieldToMain();
        lastYield = performance.now();
      }

      const validPlacements = [];

      // Find all possible pieces and their rotations that fit
      for (const piece of pool) {
        for (const rotation of [0, 90, 180, 270]) {
          const rotatedEdges = rotate(piece.edges, rotation);
          if (fits(newBoard, pos, rotatedEdges)) {
            validPlacements.push({
              piece: piece,
              rotation: rotation,
              edges: rotatedEdges,
            });
          }
        }
      }

      // If any valid placements were found, pick one
      if (validPlacements.length > 0) {
        let chosenPlacement;

        // --- Weighted ML Selection for Hint-Adjacent spots ---
        const isWeightingActive =
          !mlParams.useCalibration || stats.totalRuns > CALIBRATION_RUNS;
        if (hintAdjacentPositions.has(pos) && isWeightingActive) {
          const weightedOptions = [];
          let totalWeight = 0;

          for (const p of validPlacements) {
            const pieceId = p.piece.id;
            const rotation = p.rotation;
            let weight = 1.0; // Default weight for exploration

            // Find performance stats for this specific piece and rotation
            // The `key` structure here is for identifying the specific hint-adjacent position
            const statsKey = Object.keys(hints)
              .map((hPos) =>
                Object.keys(directions).map((dir) => ({
                  pos: parseInt(hPos) + directions[dir],
                  key: `${hPos}-${dir}`,
                }))
              )
              .flat()
              .find((item) => item.pos === pos)?.key;

            if (
              statsKey &&
              hintAdjacencyStats[statsKey]?.[pieceId]?.[rotation]
            ) {
              const localAvgScore =
                hintAdjacencyStats[statsKey][pieceId][rotation].avgScore;
              const globalAvgScore = stats.avgScore;
              const scoreDelta = localAvgScore - globalAvgScore;
              weight = Math.exp(mlParams.weightingConstant * scoreDelta);
            }

            weightedOptions.push({ placement: p, weight: weight });
            totalWeight += weight;
          }

          // --- Weighted Random Choice ---
          let randomChoice = Math.random() * totalWeight;
          for (const option of weightedOptions) {
            randomChoice -= option.weight;
            if (randomChoice <= 0) {
              chosenPlacement = option.placement;
              break;
            }
          }
          if (!chosenPlacement)
            chosenPlacement =
              weightedOptions[weightedOptions.length - 1].placement; // Fallback
        } else {
          // --- Standard Random Selection ---
          chosenPlacement =
            validPlacements[Math.floor(Math.random() * validPlacements.length)];
        }

        newBoard[pos] = {
          id: chosenPlacement.piece.id,
          edges: chosenPlacement.edges,
          rotation: chosenPlacement.rotation,
        };

        used_ids.add(chosenPlacement.piece.id);
        pool = pool.filter((p) => p.id !== chosenPlacement.piece.id);
      }
    }

    const score = newBoard.filter((p) => p !== null).length;
    
    // Batch state updates to reduce re-renders
    const newTotalRuns = (stats.totalRuns || 0) + 1;
    const newAvgScore =
      ((stats.avgScore || 0) * (stats.totalRuns || 0) + score) / newTotalRuns;

    const newCurrentRun = { run: (currentRun.run || 0) + 1, score };
    const newStats = {
      totalRuns: newTotalRuns,
      bestScore: Math.max(stats.bestScore || 0, score),
      avgScore: newAvgScore,
      completedSolutions:
        (stats.completedSolutions || 0) + (score === SIZE * SIZE ? 1 : 0),
    };

    // Use React's batching by updating state synchronously
    setBoard(newBoard);
    setCurrentRun(newCurrentRun);
    setStats(newStats);

    // Update hint adjacency stats with rotation
    setHintAdjacencyStats((prevStats) => {
      const newStats = { ...prevStats };
      Object.keys(hints).forEach((hintPosStr) => {
        const hintPos = parseInt(hintPosStr);
        Object.entries(directions).forEach(([dirName, offset]) => {
          const adjPos = hintPos + offset;
          const row = Math.floor(adjPos / SIZE);
          const col = adjPos % SIZE;
          // Apply same boundary checks as in hintAdjacentPositions setup
          if (
            adjPos >= 0 &&
            adjPos < SIZE * SIZE &&
            !(offset === directions.east && col === 0) &&
            !(offset === directions.west && col === SIZE - 1)
          ) {
            const adjacentPiece = newBoard[adjPos];
            if (adjacentPiece && !adjacentPiece.isHint) {
              const { id: pieceId, rotation } = adjacentPiece;
              const key = `${hintPos}-${dirName}`;

              if (!newStats[key]) newStats[key] = {};
              if (!newStats[key][pieceId]) newStats[key][pieceId] = {};
              if (!newStats[key][pieceId][rotation]) {
                newStats[key][pieceId][rotation] = {
                  avgScore: 0,
                  count: 0,
                  bestScore: 0,
                };
              }

              const currentPieceStats = newStats[key][pieceId][rotation];
              const newCount = currentPieceStats.count + 1;
              // Update running average: Avg_n = Avg_{n-1} + (Value_n - Avg_{n-1}) / n
              const newAvgScore =
                currentPieceStats.avgScore +
                (score - currentPieceStats.avgScore) / newCount;

              currentPieceStats.avgScore = newAvgScore;
              currentPieceStats.count = newCount;
              currentPieceStats.bestScore = Math.max(
                currentPieceStats.bestScore || 0,
                score
              );
            }
          }
        });
      });
      return newStats;
    });
  }, [stats, currentRun, hintAdjacencyStats, mlParams]);

  useEffect(() => {
    let animationFrame;
    let lastRunTime = 0;
    const TARGET_INTERVAL = SOLVER_CONFIG.SOLVER_INTERVAL;

    const runWithTimeSlicing = (timestamp) => {
      if (!isRunning) return;

      // Only run if enough time has passed since last run
      if (timestamp - lastRunTime >= TARGET_INTERVAL) {
        const startTime = performance.now();
        
        // Run the solver with a time budget
        runSingleLayoutAsync().then(() => {
          const endTime = performance.now();
          const executionTime = endTime - startTime;
          
          // Log warning if still taking too long (for debugging)
          if (executionTime > SOLVER_CONFIG.PERFORMANCE.MAX_EXECUTION_TIME) {
            console.warn(`Solver execution took ${executionTime.toFixed(1)}ms`);
          }
          
          lastRunTime = timestamp;
        });
      }

      animationFrame = requestAnimationFrame(runWithTimeSlicing);
    };

    if (isRunning) {
      animationFrame = requestAnimationFrame(runWithTimeSlicing);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isRunning, runSingleLayoutAsync]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setBoard(Array(SIZE * SIZE).fill(null));
    const initialRunState = { run: 0, score: 0 };
    const initialStatsState = {
      totalRuns: 0,
      bestScore: 0,
      avgScore: 0,
      completedSolutions: 0,
    };
    const initialHintState = {};
    const initialMlParams = { weightingConstant: 0.1, useCalibration: true };

    setCurrentRun(initialRunState);
    setStats(initialStatsState);
    setHintAdjacencyStats(initialHintState);
    setMlParams(initialMlParams);

    localStorage.removeItem("solver-currentRun");
    localStorage.removeItem("solver-stats");
    localStorage.removeItem("solver-hintAdjacencyStats");
    localStorage.removeItem("solver-mlParams");
  };

  const loadBackupData = (data) => {
    if (data && data.solverState && data.hintAdjacencyStats) {
      setStats(
        data.solverState.stats || {
          totalRuns: 0,
          bestScore: 0,
          avgScore: 0,
          completedSolutions: 0,
        }
      );
      setCurrentRun(data.solverState.currentRun || { run: 0, score: 0 });
      setHintAdjacencyStats(data.hintAdjacencyStats || {});
      setMlParams(
        data.solverState.mlParams || {
          weightingConstant: 0.1,
          useCalibration: true,
        }
      );
      setBoard(Array(SIZE * SIZE).fill(null)); // Reset board view on load
    } else {
      console.error("Invalid backup file format");
      alert("Could not load data. The file format is invalid.");
    }
  };

  // Add function to calculate selection percentages
  const getSelectionPercentages = useCallback(
    (hintPos, direction) => {
      const key = `${hintPos}-${direction}`;
      const isWeightingActive =
        !mlParams.useCalibration || stats.totalRuns > CALIBRATION_RUNS;
      if (!hintAdjacencyStats[key] || !isWeightingActive) {
        return {};
      }

      const pieceStats = hintAdjacencyStats[key];
      const weights = {};
      let totalWeight = 0;

      // Calculate weights for all pieces/rotations
      for (const pieceId in pieceStats) {
        for (const rotation in pieceStats[pieceId]) {
          const localAvgScore = pieceStats[pieceId][rotation].avgScore;
          const globalAvgScore = stats.avgScore;
          const scoreDelta = localAvgScore - globalAvgScore;
          const weight = Math.exp(mlParams.weightingConstant * scoreDelta);

          if (!weights[pieceId]) weights[pieceId] = {};
          weights[pieceId][rotation] = weight;
          totalWeight += weight;
        }
      }

      // Convert to percentages
      const percentages = {};
      for (const pieceId in weights) {
        percentages[pieceId] = {};
        for (const rotation in weights[pieceId]) {
          percentages[pieceId][rotation] =
            (weights[pieceId][rotation] / totalWeight) * 100;
        }
      }

      return percentages;
    },
    [hintAdjacencyStats, stats, mlParams]
  );

  const value = {
    board,
    isRunning,
    currentRun,
    stats,
    hintAdjacencyStats,
    pieces,
    hints,
    mlParams,
    handleStart,
    handlePause,
    handleReset,
    loadBackupData,
    getSelectionPercentages,
    setMlParams,
    PLACEMENT_STRATEGIES,
  };

  return (
    <SolverContext.Provider value={value}>{children}</SolverContext.Provider>
  );
};
