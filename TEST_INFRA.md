# E2E Test Infra: Universal Rubik & Twisty Puzzle Solver 3D

## Test Philosophy
- Opaque-box, requirement-driven. Derived from user requirements (R1, R2, R3, R4) in `ORIGINAL_REQUEST.md`, not implementation internals.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial Testing + Real-World Workload Testing.
- Progressive testability: verification operates via programmatic API or headless test runner with clean exit codes (0 for pass, non-zero for fail).

---

## Feature Inventory
| # | Feature | Source | Tier 1 (Happy) | Tier 2 (Boundary) | Tier 3 (Pairwise) | Tier 4 (Scenario) |
|---|---------|--------|:--------------:|:-----------------:|:-----------------:|:-----------------:|
| 1 | 2x2 Pocket Cube | R1 | ≥5 | ≥5 | ✓ | ✓ |
| 2 | 3x3 Rubik's Cube | R1 | ≥5 | ≥5 | ✓ | ✓ |
| 3 | 4x4 Revenge Cube | R1 | ≥5 | ≥5 | ✓ | ✓ |
| 4 | 5x5 Professor Cube | R1 | ≥5 | ≥5 | ✓ | ✓ |
| 5 | 6x6 Cube | R1 | ≥5 | ≥5 | ✓ | ✓ |
| 6 | 7x7 Cube | R1 | ≥5 | ≥5 | ✓ | ✓ |
| 7 | Pyraminx | R1 | ≥5 | ≥5 | ✓ | ✓ |
| 8 | Megaminx | R1 | ≥5 | ≥5 | ✓ | ✓ |
| 9 | Skewb | R1 | ≥5 | ≥5 | ✓ | ✓ |
| 10 | Square-1 | R1 | ≥5 | ≥5 | ✓ | ✓ |
| 11 | WCA Notation Parser | R2 | ≥5 | ≥5 | ✓ | ✓ |
| 12 | Indonesian Translation | R2 | ≥5 | ≥5 | ✓ | ✓ |
| 13 | Playback Timeline (Play/Pause/Step) | R2 | ≥5 | ≥5 | ✓ | ✓ |
| 14 | Inverse Move Generator | R2 | ≥5 | ≥5 | ✓ | ✓ |
| 15 | Universal Puzzle Selector | R3 | ≥5 | ≥5 | ✓ | ✓ |
| 16 | 2D Net Customizer & Presets | R3 | ≥5 | ≥5 | ✓ | ✓ |
| 17 | WebGL Resource Disposal & Zero Leaks | R4 | ≥5 | ≥5 | ✓ | ✓ |
| 18 | Camera Presets & OrbitControls | R1, R4 | ≥5 | ≥5 | ✓ | ✓ |

---

## Test Architecture
- Test Runner: Node native test runner (`node --test tests/**/*.test.js`) and Vitest.
- Invocation: `npm test`
- Pass/Fail Semantics: Exit code 0 indicates all tests passed. Non-zero indicates failure.
- Directory Layout:
  - `tests/unit/`: Pure algorithmic, notation, inverse move, and state tests.
  - `tests/e2e/`: Requirement validation across all 10 puzzles, presets, timeline stepping, and lifecycle disposal.

---

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| S1 | Full 3x3 CFOP Walkthrough | 3x3 geometry, notation parser, playback timeline, step next/prev, Indonesian guide | High |
| S2 | 4x4 OLL & PLL Parity Resolution | 4x4 geometry, wide/slice moves, parity algorithms, preset loading | High |
| S3 | Pyraminx Tip & Edge Cycle | Pyraminx tetrahedral rotation, notation (`U, L, R, B, u, l, r, b`), guide | Medium |
| S4 | Megaminx Star & First Layer | Megaminx dodecahedron geometry, face turning, Pochmann notation | High |
| S5 | Skewb Sarah's Method Sledgehammer | Skewb corner turning, 120° diagonal slicing, inverse move stepping | Medium |
| S6 | Square-1 Shape Recovery & Parity | Square-1 shape-shifting, angle tuples `(x,y)`, slice `/`, parity algorithm | Very High |
| S7 | Rapid 10-Puzzle Switch & Memory Audit | Puzzle selector, WebGL disposal, TextureCache reuse, zero memory leaks | High |

---

## Coverage Thresholds
- Tier 1: ≥5 per feature (≥90 test cases)
- Tier 2: ≥5 per feature (boundary values, invalid notations, edge cases; ≥90 test cases)
- Tier 3: Pairwise combinations across features (≥20 test cases)
- Tier 4: ≥7 realistic application scenarios
- **Total Target**: ≥200 comprehensive automated test assertions.

