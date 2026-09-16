/**
 * Tier 1 Tests: NxN Puzzles Suite (Features 1 - 6)
 * Covers: 2x2, 3x3, 4x4, 5x5, 6x6, 7x7
 * >= 5 tests per feature (30+ tests)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PUZZLE_SPECS } from '../helpers/constants.js';
import { getPuzzleDefinition } from '../helpers/puzzleRegistryAdapter.js';
import { validatePuzzleContract, parseNotation } from '../helpers/puzzleOracles.js';

describe('Tier 1: Feature 1 - 2x2 Pocket Cube', () => {
  it('F1.1: conforms to PuzzleDefinition interface contract', async () => {
    const puzzle = await getPuzzleDefinition('cube-2x2');
    assert.equal(validatePuzzleContract(puzzle), true);
    assert.equal(puzzle.id, 'cube-2x2');
    assert.equal(puzzle.category, 'nxn');
  });

  it('F1.2: defines correct 8-corner piece anatomy and 24 sticker count', () => {
    const spec = PUZZLE_SPECS['cube-2x2'];
    assert.equal(spec.cubiesCount, 8);
    assert.equal(spec.facesCount, 6);
    assert.equal(spec.stickersPerFace, 4);
    assert.equal(spec.totalStickers, 24);
    assert.equal(spec.hasFixedCenter, false);
  });

  it('F1.3: generates 3D model hierarchy with correct mesh children', async () => {
    const puzzle = await getPuzzleDefinition('cube-2x2');
    const model = puzzle.buildModel();
    assert.ok(model);
    assert.equal(model.children.length, 8);
  });

  it('F1.4: accepts standard 2x2 WCA move notations', () => {
    const moves = parseNotation("R U R' U' R F2 R' U'", 'cube-2x2');
    assert.equal(moves.length, 8);
    assert.equal(moves[0].token, 'R');
    assert.equal(moves[2].modifier, "'");
    assert.equal(moves[5].modifier, '2');
  });

  it('F1.5: provides beginner-friendly Ortega / LBL guide stages', async () => {
    const puzzle = await getPuzzleDefinition('cube-2x2');
    assert.ok(puzzle.guideStages.length >= 2);
    const hasBeginnerGuide = puzzle.guideStages.some(s =>
      s.title.toLowerCase().includes('pemula') || s.desc.toLowerCase().includes('pemula')
    );
    assert.equal(hasBeginnerGuide, true);
  });
});

describe('Tier 1: Feature 2 - 3x3 Rubik\'s Cube', () => {
  it('F2.1: conforms to PuzzleDefinition interface contract', async () => {
    const puzzle = await getPuzzleDefinition('cube-3x3');
    assert.equal(validatePuzzleContract(puzzle), true);
    assert.equal(puzzle.id, 'cube-3x3');
    assert.equal(puzzle.category, 'nxn');
  });

  it('F2.2: defines standard 26 cubies with 6 fixed centers and 54 stickers', () => {
    const spec = PUZZLE_SPECS['cube-3x3'];
    assert.equal(spec.cubiesCount, 26);
    assert.equal(spec.facesCount, 6);
    assert.equal(spec.stickersPerFace, 9);
    assert.equal(spec.totalStickers, 54);
    assert.equal(spec.hasFixedCenter, true);
  });

  it('F2.3: generates 3D model hierarchy with 26 cubie meshes', async () => {
    const puzzle = await getPuzzleDefinition('cube-3x3');
    const model = puzzle.buildModel();
    assert.ok(model);
    assert.equal(model.children.length, 26);
  });

  it('F2.4: parses standard CFOP move notations including slice M and cube rotations', () => {
    const moves = parseNotation("M2 U M U2 M' U M2 x y z", 'cube-3x3');
    assert.equal(moves.length, 10);
    assert.equal(moves[0].token, 'M2');
    assert.equal(moves[7].token, 'x');
    assert.equal(moves[8].token, 'y');
    assert.equal(moves[9].token, 'z');
  });

  it('F2.5: includes iconic presets (Checkerboard, Superflip)', async () => {
    const puzzle = await getPuzzleDefinition('cube-3x3');
    const ids = puzzle.presets.map(p => p.id);
    assert.ok(ids.includes('checkerboard'));
    assert.ok(ids.includes('superflip'));
  });
});

describe('Tier 1: Feature 3 - 4x4 Revenge Cube', () => {
  it('F3.1: conforms to PuzzleDefinition interface contract', async () => {
    const puzzle = await getPuzzleDefinition('cube-4x4');
    assert.equal(validatePuzzleContract(puzzle), true);
    assert.equal(puzzle.id, 'cube-4x4');
    assert.equal(puzzle.category, 'nxn');
  });

  it('F3.2: defines 56 cubies (24 centers, 24 wings, 8 corners) without fixed centers', () => {
    const spec = PUZZLE_SPECS['cube-4x4'];
    assert.equal(spec.cubiesCount, 56);
    assert.equal(spec.hasFixedCenter, false);
    assert.equal(spec.stickersPerFace, 16);
    assert.equal(spec.totalStickers, 96);
  });

  it('F3.3: generates 3D model hierarchy with 56 pieces', async () => {
    const puzzle = await getPuzzleDefinition('cube-4x4');
    const model = puzzle.buildModel();
    assert.ok(model);
    assert.equal(model.children.length, 56);
  });

  it('F3.4: parses wide moves (Rw, Uw) and inner slices (2R, 2U) correctly', () => {
    const moves = parseNotation('Rw U2 2R2 Uw2 2R2 2U2', 'cube-4x4');
    assert.equal(moves.length, 6);
    assert.equal(moves[0].isWide, true);
    assert.equal(moves[2].layerCount, 2);
  });

  it('F3.5: provides dedicated OLL & PLL Parity guides and presets', async () => {
    const puzzle = await getPuzzleDefinition('cube-4x4');
    const presetIds = puzzle.presets.map(p => p.id);
    assert.ok(presetIds.includes('oll-parity'));
    assert.ok(presetIds.includes('pll-parity'));
  });
});

describe('Tier 1: Feature 4 - 5x5 Professor Cube', () => {
  it('F4.1: conforms to PuzzleDefinition interface contract', async () => {
    const puzzle = await getPuzzleDefinition('cube-5x5');
    assert.equal(validatePuzzleContract(puzzle), true);
    assert.equal(puzzle.id, 'cube-5x5');
    assert.equal(puzzle.category, 'nxn');
  });

  it('F4.2: defines 98 cubies with 6 fixed centers and 150 stickers', () => {
    const spec = PUZZLE_SPECS['cube-5x5'];
    assert.equal(spec.cubiesCount, 98);
    assert.equal(spec.hasFixedCenter, true);
    assert.equal(spec.stickersPerFace, 25);
    assert.equal(spec.totalStickers, 150);
  });

  it('F4.3: generates 3D model hierarchy with 98 cubies', async () => {
    const puzzle = await getPuzzleDefinition('cube-5x5');
    const model = puzzle.buildModel();
    assert.ok(model);
    assert.equal(model.children.length, 98);
  });

  it('F4.4: parses multi-slice notations (3Rw, 3Uw, 2R)', () => {
    const moves = parseNotation("Rw U2 3Rw' U2 Rw U2", 'cube-5x5');
    assert.equal(moves.length, 6);
    assert.equal(moves[2].layerCount, 3);
    assert.equal(moves[2].isWide, true);
  });

  it('F4.5: includes 5x5 Wing Flip parity and L2C bar swap algorithms', async () => {
    const puzzle = await getPuzzleDefinition('cube-5x5');
    const presetIds = puzzle.presets.map(p => p.id);
    assert.ok(presetIds.includes('wing-parity'));
    assert.ok(presetIds.includes('l2c-barswap'));
  });
});

describe('Tier 1: Feature 5 - 6x6 Cube', () => {
  it('F5.1: conforms to PuzzleDefinition interface contract', async () => {
    const puzzle = await getPuzzleDefinition('cube-6x6');
    assert.equal(validatePuzzleContract(puzzle), true);
    assert.equal(puzzle.id, 'cube-6x6');
    assert.equal(puzzle.category, 'nxn');
  });

  it('F5.2: defines 152 cubies without fixed centers and 216 stickers', () => {
    const spec = PUZZLE_SPECS['cube-6x6'];
    assert.equal(spec.cubiesCount, 152);
    assert.equal(spec.hasFixedCenter, false);
    assert.equal(spec.stickersPerFace, 36);
    assert.equal(spec.totalStickers, 216);
  });

  it('F5.3: generates 3D model hierarchy with 152 pieces', async () => {
    const puzzle = await getPuzzleDefinition('cube-6x6');
    const model = puzzle.buildModel();
    assert.ok(model);
    assert.equal(model.children.length, 152);
  });

  it('F5.4: parses 6x6 high-order layer moves up to layer 6', () => {
    const moves = parseNotation('3Rw U2 3Rw U2 2Rw U2', 'cube-6x6');
    assert.equal(moves.length, 6);
    assert.equal(moves[0].layerCount, 3);
    assert.equal(moves[4].layerCount, 2);
  });

  it('F5.5: configures camera distance appropriately for 6x6 framing', () => {
    const spec = PUZZLE_SPECS['cube-6x6'];
    assert.ok(spec.defaultCameraDistance >= 11.0);
  });
});

describe('Tier 1: Feature 6 - 7x7 Cube', () => {
  it('F6.1: conforms to PuzzleDefinition interface contract', async () => {
    const puzzle = await getPuzzleDefinition('cube-7x7');
    assert.equal(validatePuzzleContract(puzzle), true);
    assert.equal(puzzle.id, 'cube-7x7');
    assert.equal(puzzle.category, 'nxn');
  });

  it('F6.2: defines 218 cubies with 6 fixed centers and 294 stickers', () => {
    const spec = PUZZLE_SPECS['cube-7x7'];
    assert.equal(spec.cubiesCount, 218);
    assert.equal(spec.hasFixedCenter, true);
    assert.equal(spec.stickersPerFace, 49);
    assert.equal(spec.totalStickers, 294);
  });

  it('F6.3: generates 3D model hierarchy with 218 cubie meshes', async () => {
    const puzzle = await getPuzzleDefinition('cube-7x7');
    const model = puzzle.buildModel();
    assert.ok(model);
    assert.equal(model.children.length, 218);
  });

  it('F6.4: parses multi-layer slices up to 3Rw on 7x7', () => {
    const moves = parseNotation("3Rw U2 3Rw' U2", 'cube-7x7');
    assert.equal(moves.length, 4);
    assert.equal(moves[0].token, '3Rw');
    assert.equal(moves[2].token, "3Rw'");
  });

  it('F6.5: configures camera distance >= 12.0 for wide bounding radius', () => {
    const spec = PUZZLE_SPECS['cube-7x7'];
    assert.ok(spec.defaultCameraDistance >= 12.0);
  });
});
