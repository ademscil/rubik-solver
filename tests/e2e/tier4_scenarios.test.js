/**
 * Tier 4 Tests: Real-World Application Scenarios (S1 - S8)
 * Covers:
 * - S1: 3x3 CFOP Full Sequence Walkthrough
 * - S2: 4x4 Lucas OLL Parity & PLL Parity Resolution
 * - S3: 5x5 Wing Flip Parity & L2C Commutator
 * - S4: Pyraminx Polish Two-Edge Flip
 * - S5: Megaminx Star & Pochmann Scramble
 * - S6: Skewb Sarah's Method Sledgehammer
 * - S7: Square-1 Vandenbergh Shape Recovery & Parity
 * - S8: Rapid 10-Puzzle Transition & Zero-Leaks Memory Audit
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { WCA_PUZZLES, PUZZLE_SPECS } from '../helpers/constants.js';
import { getPuzzleDefinition } from '../helpers/puzzleRegistryAdapter.js';
import {
  parseNotation,
  invertSequence,
  getIndonesianTranslation
} from '../helpers/puzzleOracles.js';
import { TimelineEmulator } from '../helpers/timelineEmulator.js';
import {
  disposeHierarchy,
  buildMockPuzzleMesh
} from '../helpers/webglMocks.js';

describe('Tier 4: Real-World Application Scenarios', () => {
  it('Scenario S1: Full 3x3 CFOP Walkthrough (Cross, F2L, OLL, PLL)', async () => {
    const puzzle = await getPuzzleDefinition('cube-3x3');
    assert.equal(puzzle.id, 'cube-3x3');
    const timeline = new TimelineEmulator({ puzzleId: 'cube-3x3' });

    // Step 1: White Cross
    const crossMoves = 'F2 R2 B2 L2';
    // Step 2: F2L Triggers (Sexy move & Sledgehammer)
    const f2lMoves = "R U R' U' R' F R F'";
    // Step 3: OLL Sune
    const ollMoves = "R U R' U R U2 R'";
    // Step 4: PLL T-Perm
    const pllMoves = "R U R' U' R' F R2 U' R' U' R U R' F'";

    const fullSequence = `${crossMoves} ${f2lMoves} ${ollMoves} ${pllMoves}`;
    timeline.loadAlgorithm(fullSequence);
    assert.equal(timeline.moves.length, 33);

    // Step through first 10 moves
    for (let i = 0; i < 10; i++) {
      const res = timeline.stepNext();
      assert.equal(res.success, true);
      const token = res.move;
      const indonesian = getIndonesianTranslation(token, 'cube-3x3');
      assert.ok(indonesian.name.length > 0);
      assert.ok(indonesian.desc.length > 0);
    }
    assert.equal(timeline.currentIndex, 10);

    // Step back 10 moves via inverse stepping
    for (let i = 0; i < 10; i++) {
      const res = timeline.stepPrev();
      assert.equal(res.success, true);
    }
    assert.equal(timeline.currentIndex, 0);

    // Jump directly to end of PLL
    timeline.jumpTo(33);
    assert.equal(timeline.currentIndex, 33);
  });

  it('Scenario S2: 4x4 Lucas OLL Parity & PLL Parity Resolution', async () => {
    const puzzle = await getPuzzleDefinition('cube-4x4');
    const timeline = new TimelineEmulator({ puzzleId: 'cube-4x4' });

    // 1. Load Lucas OLL Parity
    const ollPreset = puzzle.presets.find(p => p.id === 'oll-parity');
    assert.ok(ollPreset);
    timeline.loadAlgorithm(ollPreset.algorithm);
    assert.equal(timeline.moves.length, 18);

    // Verify presence of wide and cube rotation tokens
    const parsedOll = parseNotation(ollPreset.algorithm, 'cube-4x4');
    assert.ok(parsedOll.some(t => t.isWide && t.baseFace === 'R'));
    assert.ok(parsedOll.some(t => t.isWide && t.baseFace === 'L'));
    assert.ok(parsedOll.some(t => t.token === 'x'));

    // Step through entire OLL Parity
    while (timeline.currentIndex < timeline.moves.length) {
      const step = timeline.stepNext();
      assert.equal(step.success, true);
    }
    assert.equal(timeline.currentIndex, 18);

    // 2. Load PLL Parity
    const pllPreset = puzzle.presets.find(p => p.id === 'pll-parity');
    assert.ok(pllPreset);
    timeline.loadAlgorithm(pllPreset.algorithm);
    assert.equal(timeline.moves.length, 6);

    const parsedPll = parseNotation(pllPreset.algorithm, 'cube-4x4');
    assert.equal(parsedPll[0].token, '2R2');
    assert.equal(parsedPll[0].layerCount, 2);
    assert.equal(parsedPll[3].token, 'Uw2');
    assert.equal(parsedPll[3].isWide, true);
  });

  it('Scenario S3: 5x5 Wing Flip Parity & L2C Commutator Resolution', async () => {
    const puzzle = await getPuzzleDefinition('cube-5x5');
    const timeline = new TimelineEmulator({ puzzleId: 'cube-5x5' });

    // Load Wing Parity preset
    const wingPreset = puzzle.presets.find(p => p.id === 'wing-parity');
    assert.ok(wingPreset);
    timeline.loadAlgorithm(wingPreset.algorithm);
    assert.equal(timeline.moves.length, 18);

    const parsedWing = parseNotation(wingPreset.algorithm, 'cube-5x5');
    // Verify 3Rw' inner slice manipulation
    const threeRwPrime = parsedWing.find(t => t.token === "3Rw'");
    assert.ok(threeRwPrime);
    assert.equal(threeRwPrime.layerCount, 3);
    assert.equal(threeRwPrime.isWide, true);

    // Step forward 5 steps then step backward 5 steps
    for (let i = 0; i < 5; i++) timeline.stepNext();
    assert.equal(timeline.currentIndex, 5);
    for (let i = 0; i < 5; i++) timeline.stepPrev();
    assert.equal(timeline.currentIndex, 0);

    // Verify 5x5 L2C Bar Swap
    const l2cPreset = puzzle.presets.find(p => p.id === 'l2c-barswap');
    assert.ok(l2cPreset);
    const l2cTokens = parseNotation(l2cPreset.algorithm, 'cube-5x5');
    assert.equal(l2cTokens.length, 7);
  });

  it('Scenario S4: Pyraminx Tip & Edge Cycle (Polish Two-Edge Flip)', async () => {
    const puzzle = await getPuzzleDefinition('pyraminx');
    assert.equal(puzzle.id, 'pyraminx');
    const timeline = new TimelineEmulator({ puzzleId: 'pyraminx' });

    // Tip turns followed by Polish Two-Edge Flip
    const fullPyraAlg = "u l' r b' R' L R L' U L' U' L";
    timeline.loadAlgorithm(fullPyraAlg);
    assert.equal(timeline.moves.length, 12);

    // Step through 4 tips
    for (let i = 0; i < 4; i++) {
      const step = timeline.stepNext();
      assert.equal(step.success, true);
      const isTip = step.move === step.move.toLowerCase();
      assert.equal(isTip, true);
      const trans = getIndonesianTranslation(step.move, 'pyraminx');
      assert.ok(trans.name.includes('Ujung'));
    }

    // Step through Polish Flip
    for (let i = 4; i < 12; i++) {
      const step = timeline.stepNext();
      assert.equal(step.success, true);
    }
    assert.equal(timeline.currentIndex, 12);

    // Invert full sequence and verify symmetry
    const inverted = invertSequence(fullPyraAlg, 'pyraminx');
    assert.ok(inverted.includes("L' U"));
  });

  it('Scenario S5: Megaminx Star & Pochmann Scramble Walkthrough', async () => {
    const puzzle = await getPuzzleDefinition('megaminx');
    assert.equal(puzzle.id, 'megaminx');
    const timeline = new TimelineEmulator({ puzzleId: 'megaminx' });

    // Official Pochmann Scramble Line
    const pochmannScramble = 'R++ D++ R-- D-- R++ D++ U R++ D++ R-- D-- U\'';
    timeline.loadAlgorithm(pochmannScramble);
    assert.equal(timeline.moves.length, 12);

    // Verify Pochmann token directions
    const parsed = parseNotation(pochmannScramble, 'megaminx');
    assert.equal(parsed[0].direction, 2);  // R++
    assert.equal(parsed[2].direction, -2); // R--
    assert.equal(parsed[6].type, 'face');  // U

    // Step through all 12 moves
    timeline.jumpTo(12);
    assert.equal(timeline.currentIndex, 12);

    // Sune orientation on Gray face
    const suneAlg = "R U R' U R U''' R'";
    timeline.loadAlgorithm(suneAlg);
    assert.equal(timeline.moves.length, 7);
  });

  it('Scenario S6: Skewb Sarah\'s Beginner Method Sledgehammer Walkthrough', async () => {
    const puzzle = await getPuzzleDefinition('skewb');
    assert.equal(puzzle.id, 'skewb');
    const timeline = new TimelineEmulator({ puzzleId: 'skewb' });

    // Sledgehammer + y2 rotation + Sledgehammer (Center Commutator)
    const centerCommutator = "R' L R L' y2 R' L R L'";
    timeline.loadAlgorithm(centerCommutator);
    assert.equal(timeline.moves.length, 9);

    // Step through first Sledgehammer
    for (let i = 0; i < 4; i++) {
      timeline.stepNext();
    }
    assert.equal(timeline.currentIndex, 4);

    // Step through y2 rotation
    const y2Step = timeline.stepNext();
    assert.equal(y2Step.move, 'y2');

    // Complete second Sledgehammer
    for (let i = 0; i < 4; i++) {
      timeline.stepNext();
    }
    assert.equal(timeline.currentIndex, 9);

    // Step backward to index 0
    while (timeline.currentIndex > 0) {
      timeline.stepPrev();
    }
    assert.equal(timeline.currentIndex, 0);
  });

  it('Scenario S7: Square-1 Vandenbergh Shape Recovery & Official Parity Walkthrough', async () => {
    const puzzle = await getPuzzleDefinition('square1');
    assert.equal(puzzle.id, 'square1');
    const timeline = new TimelineEmulator({ puzzleId: 'square1' });

    // 1. Scallop-Kite to Cube Shape
    const csAlg = '(-2,-4) / (-1,-2) / (-3,-3) /';
    timeline.loadAlgorithm(csAlg);
    assert.equal(timeline.moves.length, 6);

    // 2. Square-1 Odd Parity Algorithm
    const parityAlg = '/ (-3,0) / (0,3) / (-3,0) / (3,0) / (-2,0) / (0,2) / (-4,2) / (4,0) / (0,-2) / (0,2) / (-1,4) / (0,-3) / (0,3)';
    const parsedParity = parseNotation(parityAlg, 'square1');
    assert.equal(parsedParity.length, 26);

    // Count slashes and tuples
    const slashes = parsedParity.filter(p => p.type === 'slice');
    const tuples = parsedParity.filter(p => p.type === 'layer_turn');
    assert.equal(slashes.length, 13);
    assert.equal(tuples.length, 13);

    // Verify sequence inversion of Square-1 parity
    const invParity = invertSequence(parityAlg, 'square1');
    assert.ok(invParity.startsWith('(0,-3) /'));
    assert.ok(invParity.endsWith('/'));
  });

  it('Scenario S8: Rapid 10-Puzzle Transition & Zero-Leaks WebGL Memory Audit', async () => {
    let totalGeometriesDisposed = 0;
    let totalMaterialsDisposed = 0;
    let totalTexturesDisposed = 0;

    // Simulate switching across all 10 WCA puzzles in sequence
    for (let i = 0; i < WCA_PUZZLES.length; i++) {
      const puzzleId = WCA_PUZZLES[i];
      const spec = PUZZLE_SPECS[puzzleId];
      const puzzle = await getPuzzleDefinition(puzzleId);

      // 1. Mount puzzle mesh
      const pieceCount = spec.cubiesCount || spec.totalPieces || 26;
      const mesh = buildMockPuzzleMesh(pieceCount, 6);
      assert.equal(mesh.children.length, pieceCount);

      // 2. Check camera positioning and distance
      const camDist = puzzle.defaultCameraDistance;
      assert.ok(camDist > 0);

      // 3. Initialize and step timeline
      const timeline = new TimelineEmulator({ puzzleId });
      if (puzzle.presets.length > 1 && puzzle.presets[1].algorithm) {
        timeline.loadAlgorithm(puzzle.presets[1].algorithm);
        timeline.stepNext();
        timeline.stepPrev();
      }

      // 4. Dispose scene hierarchy before switching to next puzzle
      const stats = disposeHierarchy(mesh);
      totalGeometriesDisposed += stats.geometries;
      totalMaterialsDisposed += stats.materials;
      totalTexturesDisposed += stats.textures;

      // Verify zero remaining children in scene node
      assert.equal(mesh.children.length, 0);
    }

    // Cumulative disposal verification
    assert.ok(totalGeometriesDisposed >= 650);
    assert.ok(totalMaterialsDisposed >= 3900);
    assert.ok(totalTexturesDisposed >= 3900);
  });
});
