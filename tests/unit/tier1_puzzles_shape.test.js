/**
 * Tier 1 Tests: Shape Puzzles Suite (Features 7 - 10)
 * Covers: Pyraminx, Megaminx, Skewb, Square-1
 * >= 5 tests per feature (20+ tests)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PUZZLE_SPECS } from '../helpers/constants.js';
import { getPuzzleDefinition } from '../helpers/puzzleRegistryAdapter.js';
import { validatePuzzleContract, parseNotation } from '../helpers/puzzleOracles.js';

describe('Tier 1: Feature 7 - Pyraminx (Tetrahedron)', () => {
  it('F7.1: conforms to PuzzleDefinition interface contract', async () => {
    const puzzle = await getPuzzleDefinition('pyraminx');
    assert.equal(validatePuzzleContract(puzzle), true);
    assert.equal(puzzle.id, 'pyraminx');
    assert.equal(puzzle.category, 'shape');
  });

  it('F7.2: defines tetrahedral geometry with 4 tips, 4 centers, 6 edges, 36 stickers', () => {
    const spec = PUZZLE_SPECS['pyraminx'];
    assert.equal(spec.geometryType, 'tetrahedron');
    assert.equal(spec.tipsCount, 4);
    assert.equal(spec.centersCount, 4);
    assert.equal(spec.edgesCount, 6);
    assert.equal(spec.facesCount, 4);
    assert.equal(spec.totalStickers, 36);
  });

  it('F7.3: builds 3D tetrahedral model with proper piece hierarchy', async () => {
    const puzzle = await getPuzzleDefinition('pyraminx');
    const model = puzzle.buildModel();
    assert.ok(model);
    assert.ok(model.children.length > 0);
  });

  it('F7.4: parses both axial vertex turns (U, L, R, B) and mini tips (u, l, r, b)', () => {
    const moves = parseNotation("U L' R B u l' r b'", 'pyraminx');
    assert.equal(moves.length, 8);
    assert.equal(moves[0].isTip, false);
    assert.equal(moves[4].isTip, true);
    assert.equal(moves[5].modifier, "'");
  });

  it('F7.5: includes Polish Two-Edge Flip preset and LBL beginner guide', async () => {
    const puzzle = await getPuzzleDefinition('pyraminx');
    const presetIds = puzzle.presets.map(p => p.id);
    assert.ok(presetIds.includes('polish-flip'));
    const hasBeginnerGuide = puzzle.guideStages.some(s =>
      s.title.toLowerCase().includes('pemula') || s.desc.toLowerCase().includes('pemula')
    );
    assert.equal(hasBeginnerGuide, true);
  });
});

describe('Tier 1: Feature 8 - Megaminx (Dodecahedron)', () => {
  it('F8.1: conforms to PuzzleDefinition interface contract', async () => {
    const puzzle = await getPuzzleDefinition('megaminx');
    assert.equal(validatePuzzleContract(puzzle), true);
    assert.equal(puzzle.id, 'megaminx');
    assert.equal(puzzle.category, 'shape');
  });

  it('F8.2: defines dodecahedral geometry with 12 faces, 62 pieces, 132 stickers', () => {
    const spec = PUZZLE_SPECS['megaminx'];
    assert.equal(spec.geometryType, 'dodecahedron');
    assert.equal(spec.facesCount, 12);
    assert.equal(spec.cornersCount, 20);
    assert.equal(spec.edgesCount, 30);
    assert.equal(spec.centersCount, 12);
    assert.equal(spec.totalStickers, 132);
    assert.equal(spec.colorScheme.length, 12);
  });

  it('F8.3: builds 3D dodecahedral model hierarchy', async () => {
    const puzzle = await getPuzzleDefinition('megaminx');
    const model = puzzle.buildModel();
    assert.ok(model);
    assert.ok(model.children.length > 0);
  });

  it('F8.4: parses Pochmann scrambling notation (R++, R--, D++, D--) and face turns', () => {
    const moves = parseNotation("R++ D++ R-- D-- U U'", 'megaminx');
    assert.equal(moves.length, 6);
    assert.equal(moves[0].type, 'pochmann');
    assert.equal(moves[0].direction, 2);
    assert.equal(moves[2].direction, -2);
    assert.equal(moves[4].type, 'face');
  });

  it('F8.5: provides White Star and S2L progressive learning stages', async () => {
    const puzzle = await getPuzzleDefinition('megaminx');
    assert.ok(puzzle.guideStages.length >= 2);
    assert.equal(PUZZLE_SPECS['megaminx'].beginnerMethod.includes('Star'), true);
  });
});

describe('Tier 1: Feature 9 - Skewb (Corner-Turning)', () => {
  it('F9.1: conforms to PuzzleDefinition interface contract', async () => {
    const puzzle = await getPuzzleDefinition('skewb');
    assert.equal(validatePuzzleContract(puzzle), true);
    assert.equal(puzzle.id, 'skewb');
    assert.equal(puzzle.category, 'shape');
  });

  it('F9.2: defines deep-cut cube anatomy with 4 diagonal axes, 6 centers, 8 corners, 30 facets', () => {
    const spec = PUZZLE_SPECS['skewb'];
    assert.equal(spec.geometryType, 'deep-cut-cube');
    assert.equal(spec.diagonalAxes, 4);
    assert.equal(spec.centersCount, 6);
    assert.equal(spec.cornersCount, 8);
    assert.equal(spec.totalStickers, 30);
  });

  it('F9.3: builds 3D Skewb model hierarchy', async () => {
    const puzzle = await getPuzzleDefinition('skewb');
    const model = puzzle.buildModel();
    assert.ok(model);
    assert.ok(model.children.length > 0);
  });

  it('F9.4: parses 120° corner turns (R, L, U, B) with prime modifiers', () => {
    const moves = parseNotation("R' L R L' U B'", 'skewb');
    assert.equal(moves.length, 6);
    assert.equal(moves[0].token, "R'");
    assert.equal(moves[0].modifier, "'");
    assert.equal(moves[1].token, "L");
  });

  it('F9.5: provides Sarah\'s Beginner Method and Sledgehammer presets', async () => {
    const puzzle = await getPuzzleDefinition('skewb');
    const presetIds = puzzle.presets.map(p => p.id);
    assert.ok(presetIds.includes('sledgehammer'));
    assert.ok(presetIds.includes('center-swap'));
  });
});

describe('Tier 1: Feature 10 - Square-1 (Shape-Shifting)', () => {
  it('F10.1: conforms to PuzzleDefinition interface contract', async () => {
    const puzzle = await getPuzzleDefinition('square1');
    assert.equal(validatePuzzleContract(puzzle), true);
    assert.equal(puzzle.id, 'square1');
    assert.equal(puzzle.category, 'shape');
  });

  it('F10.2: defines shape-shifting anatomy with kites, triangular corners, and equator', () => {
    const spec = PUZZLE_SPECS['square1'];
    assert.equal(spec.geometryType, 'shape-shifting-disc');
    assert.equal(spec.kitesPerLayer, 4);
    assert.equal(spec.trianglesPerLayer, 4);
    assert.equal(spec.equatorPieces, 2);
    assert.equal(spec.totalPieces, 18);
  });

  it('F10.3: builds 3D Square-1 model hierarchy', async () => {
    const puzzle = await getPuzzleDefinition('square1');
    const model = puzzle.buildModel();
    assert.ok(model);
    assert.ok(model.children.length > 0);
  });

  it('F10.4: parses angle tuples (x,y) and 180° middle slice /', () => {
    const moves = parseNotation('/ (1,0) / (3,0) / (-1,-1) /', 'square1');
    assert.equal(moves.length, 7);
    assert.equal(moves[0].type, 'slice');
    assert.equal(moves[1].type, 'layer_turn');
    assert.equal(moves[1].top, 1);
    assert.equal(moves[1].bottom, 0);
    assert.equal(moves[5].top, -1);
    assert.equal(moves[5].bottom, -1);
  });

  it('F10.5: provides Vandenbergh Cube Shape guide and Odd Parity preset', async () => {
    const puzzle = await getPuzzleDefinition('square1');
    const presetIds = puzzle.presets.map(p => p.id);
    assert.ok(presetIds.includes('odd-parity'));
    assert.ok(presetIds.includes('scallop-kite'));
  });
});
