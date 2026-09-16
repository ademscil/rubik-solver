# Project: Universal Rubik & Twisty Puzzle Solver 3D Platform

## Architecture
A decoupled, registry-driven 3D platform built on React 19, Vite, Tailwind CSS, and Three.js.

### Core Modules
1. **Engine Layer (`src/engine/`)**:
   - `TextureCache.js`: Shared canvas texture atlas for all standard and auxiliary vinyl colors. Prevents per-cubie canvas allocations.
   - `DisposalPipeline.js`: Cascading disposal of Three.js geometries, materials, textures, and scene hierarchies to prevent WebGL memory leaks and context loss.
   - `TwistyScene.js`: Three.js scene setup with studio 4-point lighting, OrbitControls, responsive resizing, and camera view presets (Isometric, Front, Top, Right).
   - `PivotAnimator.js`: Group-based layer rotation engine executing smooth tweened rotations and maintaining 60 FPS.

2. **Puzzle Registry & Definitions (`src/puzzles/`)**:
   - `types.js`: `PuzzleDefinition` interface contract.
   - `registry.js`: Central catalog indexing all 10 official WCA puzzles.
   - Puzzle Implementations:
     - `nxn/`: Unified NxN engine generating 2x2, 3x3, 4x4, 5x5, 6x6, 7x7 cubes, slicing coordinates, and rotations.
     - `pyraminx/`: Regular tetrahedron geometry (4 vertices, 4 faces, 6 edges), tetrahedral cutting planes, tip/vertex rotation mechanics.
     - `megaminx/`: Regular dodecahedron geometry (12 pentagonal faces, 20 corners, 30 edges), 12 cutting axes derived from icosahedral dual.
     - `skewb/`: Deep-cut corner-turning cube with 4 diagonal body axes at 120°.
     - `square1/`: Shape-shifting puzzle with kite-edges and triangular corners, variable 30°/60° layer turns, and 180° slice (`/`).

3. **Solvers, Guides & Notations (`src/solvers/`)**:
   - `notation/`: Standard WCA notation dictionary with comprehensive Indonesian translations and inverse move calculator (`getInverseMove`).
   - `guides/`: Structured step-by-step learning modules for all 10 puzzles (CFOP, Ortega, Reduction, Parity algorithms, Vandenbergh, Sarah's method, etc.).
   - `presets/`: Popular stuck presets, parity cases (OLL/PLL/Wing/Odd), and iconic patterns (Checkerboard, Superflip) per puzzle.

4. **UI & State Customizer (`src/components/`)**:
   - `PuzzleSelector.jsx`: Zero-reload selector with 4 clear difficulty tiers:
     - **Pemula (Beginner)**: 2x2, 3x3, Pyraminx
     - **Menengah (Intermediate)**: 4x4, Skewb
     - **Mahir (Advanced)**: 5x5, Megaminx
     - **Master (Expert)**: 6x6, 7x7, Square-1
   - `PlaybackTimeline.jsx`: Play, Pause, Step Next, Step Prev (via inverse moves), Speed Slider, and move synchronizer with mutex locking. Accessible speed buttons (0.5x, 1x, 2x) and visual move cues.
   - `StateCustomizerModal.jsx`: Universal 2D Net visualizer supporting cubic cross nets, triangular nets, pentagonal flowers, and Square-1 circular discs.
   - `SidebarGuide.jsx`: Progressive learning system (Metode Pemula / intuitive LBL first, followed by intermediate/advanced techniques), with friendly Indonesian visual analogies and clear active step badges. Highlight visual cues on targeted pieces in the 3D viewport.

5. **E2E & Unit Test Harness (`tests/`)**:
   - `tests/unit/`: Automated tests for notation parsing, move execution, inverse moves, and puzzle state integrity.
   - `tests/e2e/`: Requirement-driven test suite (Tiers 1-4) covering all 10 puzzles, UI controls, and WebGL lifecycle.

---

## Feature Inventory
Every feature identified during survey mapped to a specific milestone:
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F01 | Universal Puzzle Registry | Pluggable architecture registering all 10 WCA puzzle definitions | M1 | Survey E1 |
| F02 | Shared Texture Atlas & Cache | Singleton vinyl color texture generator eliminating per-cubie canvas leak | M1 | Survey E2 |
| F03 | WebGL Disposal Pipeline | Cascading buffer, geometry, material disposal on puzzle switch | M1 | Survey E2 |
| F04 | Camera Preset Controller | Fix `resetCamera` runtime crash; support Isometric, Front, Top, Right | M1 | Survey E1 |
| F05 | Build & Rollup Optimization | Configure manual chunks (`vendor-three`, `vendor-react`) to eliminate >500kB warning | M1 | Survey E1 |
| F06 | Test Infrastructure & Scripts | Configure `npm test` runner via Node native test runner / Vitest | M1 | Survey E1 |
| F07 | 2x2 Pocket Cube Engine | Accurate 8-corner geometry, quarter turns, Ortega/LBL guide & presets | M2 | Survey E2, E3 |
| F08 | 3x3 Standard Cube Engine | 26 cubies, standard face/slice turns, CFOP/LBL guide & presets | M2 | Survey E2, E3 |
| F09 | 4x4 Revenge Cube Engine | 56 cubies, slice/wide turns, Reduction guide, Lucas OLL & PLL Parity | M2 | Survey E2, E3 |
| F10 | 5x5 Professor Cube Engine | 98 cubies, multi-layer slices, Reduction guide, L2C/L2E & Wing Parity | M2 | Survey E2, E3 |
| F11 | 6x6 Cube Engine | 152 cubies, multi-slice turns, Reduction guide, inner-slice parities | M2 | Survey E2, E3 |
| F12 | 7x7 Cube Engine | 218 cubies, 60 FPS optimized grouping, Reduction guide & parities | M2 | Survey E2, E3 |
| F13 | Pyraminx Engine | Regular tetrahedron geometry, 4 axes, tip turns, LBL/Polish Flip guide | M3 | Survey E2, E3 |
| F14 | Megaminx Engine | Regular dodecahedron geometry, 12 pentagonal faces, Star/F2L guide | M3 | Survey E2, E3 |
| F15 | Skewb Engine | Deep-cut corner-turning geometry, 4 diagonal axes, Sarah's Method guide | M3 | Survey E2, E3 |
| F16 | Square-1 Engine | Shape-shifting kite/triangle geometry, 30°/60° turns, slice `/`, Vandenbergh guide | M3 | Survey E2, E3 |
| F17 | WCA Indonesian Notation Dictionary | Full move terminology with Indonesian explanations for all 10 puzzles | M2, M3 | Survey E3 |
| F18 | Universal Puzzle Selector UI | Top navigation component enabling seamless puzzle transitions without page reload | M4 | Survey E1, E3 |
| F19 | Playback Timeline with Mutex & Inverse | Step forward with lock, step backward via inverse moves, speed slider | M4 | Survey E3 |
| F20 | Universal 2D Net Customizer | Interactive 2D net for cubic, tetrahedral, dodecahedral, and Square-1 layouts | M4 | Survey E3 |
| F21 | Popular Stuck Presets Catalog | Preset collection (parities, scrambles, patterns) for each puzzle | M4 | Survey E3 |
| F22 | Dual-Track E2E Test Suite Pass | 100% pass of Tiers 1-4 tests published in TEST_READY.md | M5 | R4, Track A |
| F23 | 60 FPS WebGL Performance & Memory Audit | Zero memory leaks, buffer cleanup verification, DPR clamping | M6 | Survey E1, E2 |
| F24 | Deployment & SDLC Attestation | Clean `npm run build`, 0 oxlint warnings, Vercel & Netlify readiness | M6 | R4, Acceptance Criteria |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Core Engine & Architecture | F01, F02, F03, F04, F05, F06 (Registry, TextureCache, Disposal, Camera fix, Rollup chunks, Test runner) | none | DONE (Passed Gate 2: 272 tests pass, build clean, 0 leak) |
| M2 | NxN Puzzles Suite | F07, F08, F09, F10, F11, F12, F17 (2x2 to 7x7 geometry, rotations, solvers, parity guides, Indonesian dictionary) | M1 | IN_PROGRESS |
| M3 | Shape Puzzles Suite | F13, F14, F15, F16, F17 (Pyraminx, Megaminx, Skewb, Square-1 geometry, cutting planes, solvers, guides) | M1 | PLANNED |
| M4 | Universal UI/UX & Timeline | F18, F19, F20, F21 (Puzzle Selector, Playback Timeline with inverse steps, 2D Net customizer, Presets) | M2, M3 | PLANNED |
| M5 | E2E Integration & Verification | F22 (100% pass rate on E2E Test Suite Tiers 1-4 published in TEST_READY.md) | M4, Track A | PLANNED |
| M6 | Performance Hardening & Audit | F23, F24 (Adversarial Tier 5 testing, 60 FPS benchmark, zero leaks, 0 lint warnings, Vercel/Netlify readiness) | M5 | PLANNED |

---

## Interface Contracts

### `PuzzleDefinition` (`src/puzzles/types.js`)
```javascript
/**
 * @typedef {Object} PuzzleDefinition
 * @property {string} id - Unique identifier (e.g. 'cube-3x3', 'megaminx')
 * @property {string} name - Display name (e.g. "Rubik's Cube 3x3")
 * @property {string} category - 'nxn' | 'shape'
 * @property {number} defaultCameraDistance - Camera distance for optimal viewport framing
 * @property {() => THREE.Group} buildModel - Generates the 3D puzzle mesh hierarchy
 * @property {(moveStr: string, group: THREE.Group, onComplete: () => void, duration: number) => void} animateMove
 * @property {(moveStr: string) => string} getInverseMove - Returns inverse move notation
 * @property {Record<string, { name: string, desc: string }>} notation - Notation dictionary with Indonesian descriptions
 * @property {Array<{ id: string, title: string, desc: string, cases: Array<{ id: string, name: string, setup?: string, algorithm: string, description: string }> }>} guideStages
 * @property {Array<{ id: string, name: string, stateDescription: string, algorithm: string }>} presets
 * @property {Object} netLayout - 2D net layout descriptor for state customization
 */
```

### `TextureCache` (`src/engine/TextureCache.js`)
```javascript
export function getStickerTexture(hexColor: string): THREE.Texture;
export function disposeTextureCache(): void;
```

### `DisposalPipeline` (`src/engine/DisposalPipeline.js`)
```javascript
export function disposeHierarchy(root: THREE.Object3D): void;
export function disposeScene(scene: THREE.Scene, renderer: THREE.WebGLRenderer): void;
```

---

## Code Layout
```
d:\aplikasi\rubik solver/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── netlify.toml
├── vercel.json
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── engine/                # Core 3D engine, textures, camera, disposal
│   │   ├── TextureCache.js
│   │   ├── DisposalPipeline.js
│   │   ├── CameraManager.js
│   │   └── TwistyScene.js
│   ├── puzzles/               # Puzzle registry & geometric implementations
│   │   ├── types.js
│   │   ├── registry.js
│   │   ├── nxn/               # 2x2, 3x3, 4x4, 5x5, 6x6, 7x7
│   │   ├── pyraminx/          # Tetrahedron
│   │   ├── megaminx/          # Dodecahedron
│   │   ├── skewb/             # Corner-turning
│   │   └── square1/           # Shape-shifting
│   ├── solvers/               # Notation dictionaries, guides, presets
│   │   ├── notationDict.js
│   │   ├── guideStages.js
│   │   └── presets.js
│   └── components/            # UI components
│       ├── RubikViewer.jsx     # Universal 3D viewport
│       ├── PuzzleSelector.jsx  # Zero-reload puzzle selector
│       ├── PlaybackTimeline.jsx# Timeline controls
│       ├── CustomLayoutModal.jsx # Universal 2D net customizer
│       └── SidebarGuide.jsx    # Step-by-step learning guide
├── tests/                     # Unit and E2E test suites
│   ├── unit/
│   └── e2e/
└── .agents/                   # Agent orchestration metadata
```
