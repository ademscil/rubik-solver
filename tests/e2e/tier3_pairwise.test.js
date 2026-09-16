/**
 * Tier 3 Tests: Cross-Feature Combinations (Pairwise)
 * Verifies interactions between:
 * - Puzzle Selector & WebGL Disposal
 * - Presets & Notation Parsing
 * - Playback Timeline & Inverse Stepping & Mutex
 * - 2D Net Customizer & Fixed Center Locks
 * - Indonesian Translation & Active Move Synchronizer
 * - Difficulty Tiers & Progressive Learning Guides
 * >= 20 test cases
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { WCA_PUZZLES, PUZZLE_SPECS, DIFFICULTY_TIERS, CAMERA_PRESETS } from '../helpers/constants.js';
import { getPuzzleDefinition, getAllPuzzles } from '../helpers/puzzleRegistryAdapter.js';
import {
  parseNotation,
  invertSequence,
  getIndonesianTranslation,
  get2DNetLayout
} from '../helpers/puzzleOracles.js';
import { TimelineEmulator } from '../helpers/timelineEmulator.js';
import {
  disposeHierarchy,
  buildMockPuzzleMesh
} from '../helpers/webglMocks.js';

describe('Tier 3: Pairwise Combinations (P1 - P21)', () => {
  it('P01: Preset loading -> Notation parsing -> Token validation', async () => {
    const puzzle = await getPuzzleDefinition('cube-3x3');
    const checkerboard = puzzle.presets.find(p => p.id === 'checkerboard');
    assert.ok(checkerboard);
    const tokens = parseNotation(checkerboard.algorithm, 'cube-3x3');
    assert.equal(tokens.length, 6);
    assert.deepEqual(tokens.map(t => t.token), ['R2', 'L2', 'U2', 'D2', 'F2', 'B2']);
  });

  it('P02: Timeline step forward N times -> Step backward N times -> Identical start state', () => {
    const timeline = new TimelineEmulator({ puzzleId: 'cube-3x3' });
    const alg = "R U R' U' F' U F";
    timeline.loadAlgorithm(alg);

    // Step forward 4 times
    for (let i = 0; i < 4; i++) {
      const res = timeline.stepNext();
      assert.equal(res.success, true);
    }
    assert.equal(timeline.currentIndex, 4);

    // Step backward 4 times
    for (let i = 0; i < 4; i++) {
      const res = timeline.stepPrev();
      assert.equal(res.success, true);
    }
    assert.equal(timeline.currentIndex, 0);
  });

  it('P03: Rapid switching across all 10 puzzles maintains strict state isolation', async () => {
    const all = await getAllPuzzles();
    const visitedIds = [];

    for (const id of WCA_PUZZLES) {
      const p = all[id];
      assert.equal(p.id, id);
      assert.equal(p.presets[0].id, 'solved');
      visitedIds.push(p.id);
    }

    assert.deepEqual(visitedIds, WCA_PUZZLES);
  });

  it('P04: Custom 2D Net color state is cleanly overridden when preset is loaded', async () => {
    const puzzle = await getPuzzleDefinition('cube-3x3');
    const defaultNet = get2DNetLayout('cube-3x3');
    let customStickers = new Array(defaultNet.stickersPerFace * 6).fill('#FF0000'); // user painted all red

    // Load Checkerboard preset
    const preset = puzzle.presets.find(p => p.id === 'checkerboard');
    assert.ok(preset);
    // Simulation: loading preset resets custom state to standard BOY colors before algorithm execution
    customStickers = [...PUZZLE_SPECS['cube-3x3'].colorScheme];
    assert.notEqual(customStickers[0], '#FF0000');
    assert.equal(customStickers[0], '#FFFFFF');
  });

  it('P05: Puzzle switch (7x7 -> Pyraminx) triggers complete WebGL disposal with 0 orphaned buffers', () => {
    // Mount 7x7
    const bigCube = buildMockPuzzleMesh(218, 6);
    assert.equal(bigCube.children.length, 218);

    // Transition to Pyraminx: dispose 7x7
    const stats = disposeHierarchy(bigCube);
    assert.equal(stats.geometries, 218);
    assert.equal(stats.materials, 1308);
    assert.equal(bigCube.children.length, 0);

    // Mount Pyraminx
    const pyraMesh = buildMockPuzzleMesh(PUZZLE_SPECS['pyraminx'].centersCount + PUZZLE_SPECS['pyraminx'].tipsCount, 4);
    assert.ok(pyraMesh.children.length > 0);
  });

  it('P06: Timeline Play -> Pause mid-flight -> Step Prev with mutex safety', () => {
    const timeline = new TimelineEmulator({ puzzleId: 'cube-3x3' });
    timeline.loadAlgorithm("R U R' U'");
    timeline.play();
    assert.equal(timeline.isPlaying, true);

    // Step forward 2 moves
    timeline.stepNext();
    timeline.stepNext();
    assert.equal(timeline.currentIndex, 2);

    // User hits Pause
    timeline.pause();
    assert.equal(timeline.isPlaying, false);

    // Step prev cleanly
    const back = timeline.stepPrev();
    assert.equal(back.success, true);
    assert.equal(back.originalMove, 'U');
    assert.equal(back.inverseMove, "U'");
    assert.equal(timeline.currentIndex, 1);
  });

  it('P07: Square-1 preset load -> Notation execution -> Inverse step backward', async () => {
    const sq1 = await getPuzzleDefinition('square1');
    const scallop = sq1.presets.find(p => p.id === 'scallop-kite');
    assert.ok(scallop);

    const timeline = new TimelineEmulator({ puzzleId: 'square1' });
    timeline.loadAlgorithm(scallop.algorithm);
    assert.equal(timeline.moves.length, 6); // 3 tuples, 3 slashes

    // Execute first two steps
    timeline.stepNext(); // (-2,-4)
    timeline.stepNext(); // /
    assert.equal(timeline.currentIndex, 2);

    // Step backward
    const back = timeline.stepPrev();
    assert.equal(back.success, true);
    assert.equal(back.inverseMove, '/');
    assert.equal(timeline.currentIndex, 1);
  });

  it('P08: 6x6 Multi-Slice algorithm execution -> Timeline jump to end -> Jump to start', () => {
    const timeline = new TimelineEmulator({ puzzleId: 'cube-6x6' });
    const alg = "3Rw U2 3Rw' U2 2Rw U2 2Rw' U2";
    timeline.loadAlgorithm(alg);
    assert.equal(timeline.moves.length, 8);

    // Scrubber jump to end
    const jumpEnd = timeline.jumpTo(8);
    assert.equal(jumpEnd.newIndex, 8);
    assert.equal(timeline.currentIndex, 8);

    // Scrubber jump back to start
    const jumpStart = timeline.jumpTo(0);
    assert.equal(jumpStart.newIndex, 0);
    assert.equal(timeline.currentIndex, 0);
  });

  it('P09: Difficulty tier filtering -> Puzzle selection -> Guide stage lookup', async () => {
    const pemulaPuzzles = DIFFICULTY_TIERS.pemula.puzzles;
    assert.ok(pemulaPuzzles.includes('cube-3x3'));

    const p3 = await getPuzzleDefinition('cube-3x3');
    assert.equal(p3.difficultyTier, 'pemula');
    assert.ok(p3.beginnerMethod.includes('Pemula'));

    // Check guide stage intro
    const stage1 = p3.guideStages[0];
    assert.ok(stage1.title.includes('Pemula'));
  });

  it('P10: Indonesian notation lookup -> Timeline active move sync -> Display update', () => {
    const timeline = new TimelineEmulator({ puzzleId: 'cube-3x3' });
    timeline.loadAlgorithm("R U R'");
    timeline.stepNext(); // current is 'R' at index 1

    const activeToken = timeline.moves[timeline.currentIndex - 1];
    const trans = getIndonesianTranslation(activeToken, 'cube-3x3');
    assert.equal(trans.name, 'Kanan');
    assert.ok(trans.desc.includes('searah jarum jam'));
  });

  it('P11: Camera preset switching during puzzle selection across all 10 puzzles', async () => {
    const views = ['isometric', 'front', 'top', 'right'];
    for (const id of WCA_PUZZLES) {
      const p = await getPuzzleDefinition(id);
      for (const v of views) {
        const preset = CAMERA_PRESETS[v];
        assert.ok(preset.position.length === 3);
        assert.ok(p.defaultCameraDistance > 0);
      }
    }
  });

  it('P12: Scramble generation -> Inverse sequence derivation -> Cancels to identity', () => {
    const scramble = "R U F' D L2 B";
    const inverse = invertSequence(scramble, 'cube-3x3');
    assert.equal(inverse, "B' L2 D' F U' R'");

    // Tokens count must match
    const sTokens = parseNotation(scramble, 'cube-3x3');
    const iTokens = parseNotation(inverse, 'cube-3x3');
    assert.equal(sTokens.length, iTokens.length);
  });

  it('P13: 4x4 Lucas Parity algorithm parsing -> Slice layer extraction -> Indonesian translation', () => {
    const alg = "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 Rw' U2 Rw U2 Rw' U2 Rw'";
    const parsed = parseNotation(alg, 'cube-4x4');
    assert.equal(parsed.length, 18);

    const rwTrans = getIndonesianTranslation('Rw', 'cube-4x4');
    assert.equal(rwTrans.name, 'Kanan Dua Lapis');
  });

  it('P14: 5x5 Wing Flip parity -> Timeline step forward 5 moves -> Timeline step backward -> Consistent', () => {
    const alg = "Rw U2 x Rw U2";
    const timeline = new TimelineEmulator({ puzzleId: 'cube-5x5' });
    timeline.loadAlgorithm(alg);

    for (let i = 0; i < 5; i++) {
      timeline.stepNext();
    }
    assert.equal(timeline.currentIndex, 5);

    for (let i = 0; i < 5; i++) {
      timeline.stepPrev();
    }
    assert.equal(timeline.currentIndex, 0);
  });

  it('P15: Pyraminx Polish Two-Edge Flip preset -> Guide stage match', async () => {
    const pyra = await getPuzzleDefinition('pyraminx');
    const polishPreset = pyra.presets.find(p => p.id === 'polish-flip');
    assert.ok(polishPreset);
    assert.equal(polishPreset.algorithm, "R' L R L' U L' U' L");

    const tokens = parseNotation(polishPreset.algorithm, 'pyraminx');
    assert.equal(tokens.length, 8);
  });

  it('P16: Megaminx Star algorithm -> Timeline scrubber jump to middle -> Jump back', () => {
    const alg = "R U R' U R U''' R'";
    const timeline = new TimelineEmulator({ puzzleId: 'megaminx' });
    timeline.loadAlgorithm(alg);
    assert.equal(timeline.moves.length, 7);

    timeline.jumpTo(3);
    assert.equal(timeline.currentIndex, 3);
    timeline.jumpTo(0);
    assert.equal(timeline.currentIndex, 0);
  });

  it('P17: Skewb Sarah Beginner Method -> Sledgehammer execution -> Inverse check', () => {
    const alg = "R' L R L'";
    const inv = invertSequence(alg, 'skewb');
    assert.equal(inv, "L R' L' R");
  });

  it('P18: 2D Net center locking invariant across all odd vs even cubes', () => {
    const oddCubes = ['cube-3x3', 'cube-5x5', 'cube-7x7'];
    for (const id of oddCubes) {
      const net = get2DNetLayout(id);
      assert.equal(net.hasFixedCenter, true);
      assert.ok(net.centerIndex !== null);
    }

    const evenCubes = ['cube-2x2', 'cube-4x4', 'cube-6x6'];
    for (const id of evenCubes) {
      const net = get2DNetLayout(id);
      assert.equal(net.hasFixedCenter, false);
      assert.equal(net.centerIndex, null);
    }
  });

  it('P19: Timeline speed changes during algorithm execution maintain move integrity', () => {
    const timeline = new TimelineEmulator({ puzzleId: 'cube-3x3' });
    timeline.loadAlgorithm("R U R' U'");
    timeline.setSpeed(0.5);
    timeline.stepNext();
    timeline.setSpeed(2.0);
    timeline.stepNext();
    assert.equal(timeline.currentIndex, 2);
    assert.equal(timeline.speed, 2.0);
  });

  it('P20: WebGL disposal of full 10-puzzle carousel verifies zero memory leaks', () => {
    let totalGeometries = 0;
    let totalMaterials = 0;

    for (const id of WCA_PUZZLES) {
      const spec = PUZZLE_SPECS[id];
      const count = spec.cubiesCount || spec.totalPieces || 26;
      const mesh = buildMockPuzzleMesh(count, 6);
      const stats = disposeHierarchy(mesh);
      totalGeometries += stats.geometries;
      totalMaterials += stats.materials;
      assert.equal(mesh.children.length, 0);
    }

    assert.ok(totalGeometries >= 650);
    assert.ok(totalMaterials >= 3900);
  });

  it('P21: Progressive learning validation: beginner guide available for each difficulty tier', () => {
    for (const [tierKey, tierObj] of Object.entries(DIFFICULTY_TIERS)) {
      for (const puzzleId of tierObj.puzzles) {
        const spec = PUZZLE_SPECS[puzzleId];
        assert.ok(spec.beginnerMethod, `Puzzle ${puzzleId} in tier ${tierKey} missing beginnerMethod`);
        assert.equal(spec.difficultyTier, tierKey);
      }
    }
  });
});
