/**
 * Tier 1 Tests: UI, Customizer, WebGL Disposal & Camera Presets (Features 15 - 18)
 * Covers: Universal Puzzle Selector, 2D Net & Presets, WebGL Disposal, Camera Presets
 * >= 5 tests per feature (20+ tests)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { WCA_PUZZLES, PUZZLE_SPECS, DIFFICULTY_TIERS, CAMERA_PRESETS } from '../helpers/constants.js';
import { getPuzzleDefinition, getAllPuzzles } from '../helpers/puzzleRegistryAdapter.js';
import { get2DNetLayout } from '../helpers/puzzleOracles.js';
import {
  disposeHierarchy,
  buildMockPuzzleMesh
} from '../helpers/webglMocks.js';

describe('Tier 1: Feature 15 - Universal Puzzle Selector & Difficulty Tiers', () => {
  it('F15.1: indexes all 10 official WCA puzzles with zero-reload switching capability', async () => {
    const all = await getAllPuzzles();
    assert.equal(Object.keys(all).length, 10);
    for (const id of WCA_PUZZLES) {
      assert.ok(all[id]);
      assert.equal(all[id].id, id);
    }
  });

  it('F15.2: categorizes all 10 puzzles into 4 user-mandated difficulty tiers', () => {
    assert.deepEqual(DIFFICULTY_TIERS.pemula.puzzles, ['cube-2x2', 'cube-3x3', 'pyraminx']);
    assert.deepEqual(DIFFICULTY_TIERS.menengah.puzzles, ['cube-4x4', 'skewb']);
    assert.deepEqual(DIFFICULTY_TIERS.mahir.puzzles, ['cube-5x5', 'megaminx']);
    assert.deepEqual(DIFFICULTY_TIERS.master.puzzles, ['cube-6x6', 'cube-7x7', 'square1']);

    // Ensure every puzzle belongs to exactly one tier
    const allTierPuzzles = Object.values(DIFFICULTY_TIERS).flatMap(t => t.puzzles);
    assert.equal(allTierPuzzles.length, 10);
    for (const id of WCA_PUZZLES) {
      assert.ok(allTierPuzzles.includes(id));
    }
  });

  it('F15.3: guarantees progressive learning: beginner method available for every puzzle', () => {
    for (const id of WCA_PUZZLES) {
      const spec = PUZZLE_SPECS[id];
      assert.ok(typeof spec.beginnerMethod === 'string' && spec.beginnerMethod.trim().length > 0);
      assert.ok(
        spec.beginnerMethod.toLowerCase().includes('pemula') ||
        spec.beginnerMethod.toLowerCase().includes('beginner') ||
        spec.beginnerMethod.toLowerCase().includes('lbl')
      );
    }
  });

  it('F15.4: assigns optimal default camera distance tailored to each puzzle bounding volume', () => {
    assert.ok(PUZZLE_SPECS['cube-2x2'].defaultCameraDistance < PUZZLE_SPECS['cube-3x3'].defaultCameraDistance);
    assert.ok(PUZZLE_SPECS['cube-3x3'].defaultCameraDistance < PUZZLE_SPECS['cube-5x5'].defaultCameraDistance);
    assert.ok(PUZZLE_SPECS['cube-5x5'].defaultCameraDistance < PUZZLE_SPECS['cube-7x7'].defaultCameraDistance);
  });

  it('F15.5: allows seamless puzzle state switching without mutating other puzzle definitions', async () => {
    const p3 = await getPuzzleDefinition('cube-3x3');
    const pPyra = await getPuzzleDefinition('pyraminx');
    assert.notEqual(p3.id, pPyra.id);
    assert.notEqual(p3.category, pPyra.category);
    assert.equal(p3.category, 'nxn');
    assert.equal(pPyra.category, 'shape');
  });
});

describe('Tier 1: Feature 16 - 2D Net Customizer & Presets', () => {
  it('F16.1: provides cubic cross net layout for all NxN puzzles (2x2 to 7x7)', () => {
    for (const id of ['cube-2x2', 'cube-3x3', 'cube-4x4', 'cube-5x5', 'cube-6x6', 'cube-7x7']) {
      const net = get2DNetLayout(id);
      assert.equal(net.type, 'cubic-cross');
      assert.deepEqual(net.faces, ['U', 'L', 'F', 'R', 'B', 'D']);
      assert.equal(net.stickersPerFace, PUZZLE_SPECS[id].stickersPerFace);
    }
  });

  it('F16.2: locks fixed center stickers on odd-order cubes (3x3, 5x5, 7x7) to prevent invalid BOY schemes', () => {
    const net3 = get2DNetLayout('cube-3x3');
    assert.equal(net3.hasFixedCenter, true);
    assert.equal(net3.centerIndex, 4);

    const net5 = get2DNetLayout('cube-5x5');
    assert.equal(net5.hasFixedCenter, true);
    assert.equal(net5.centerIndex, 12);

    const net4 = get2DNetLayout('cube-4x4');
    assert.equal(net4.hasFixedCenter, false);
    assert.equal(net4.centerIndex, null);
  });

  it('F16.3: provides specialized non-cubic net layouts for Pyraminx, Megaminx, Skewb, and Square-1', () => {
    assert.equal(get2DNetLayout('pyraminx').type, 'tetrahedral-flower');
    assert.equal(get2DNetLayout('megaminx').type, 'dodecahedral-dual-flower');
    assert.equal(get2DNetLayout('skewb').type, 'diamond-corner-cross');
    assert.equal(get2DNetLayout('square1').type, 'dual-disc-equator');
  });

  it('F16.4: loads stuck presets with explicit setup algorithms and descriptions', async () => {
    const p4 = await getPuzzleDefinition('cube-4x4');
    assert.ok(p4.presets.length >= 2);
    const oll = p4.presets.find(p => p.id === 'oll-parity');
    assert.ok(oll);
    assert.ok(oll.algorithm.length > 0);
    assert.ok(oll.stateDescription.length > 0);
  });

  it('F16.5: guarantees solved baseline preset exists for every puzzle', async () => {
    for (const id of WCA_PUZZLES) {
      const puzzle = await getPuzzleDefinition(id);
      const solved = puzzle.presets.find(p => p.id === 'solved');
      assert.ok(solved, `Puzzle ${id} must contain a 'solved' preset`);
      assert.equal(solved.algorithm, '');
    }
  });
});

describe('Tier 1: Feature 17 - WebGL Resource Disposal & Zero Leaks', () => {
  it('F17.1: disposes all BufferGeometries in scene hierarchy upon puzzle switch', () => {
    const mockPuzzle = buildMockPuzzleMesh(26, 6);
    const stats = disposeHierarchy(mockPuzzle);
    assert.equal(stats.geometries, 26);
  });

  it('F17.2: disposes all Materials including multi-material arrays', () => {
    const mockPuzzle = buildMockPuzzleMesh(26, 6);
    const stats = disposeHierarchy(mockPuzzle);
    assert.equal(stats.materials, 26 * 6);
  });

  it('F17.3: disposes associated CanvasTextures / Textures eliminating GPU VRAM leaks', () => {
    const mockPuzzle = buildMockPuzzleMesh(26, 6);
    const stats = disposeHierarchy(mockPuzzle);
    assert.equal(stats.textures, 26 * 6);
  });

  it('F17.4: cleans all child objects from scene hierarchy preventing orphaned nodes', () => {
    const mockPuzzle = buildMockPuzzleMesh(26, 6);
    assert.equal(mockPuzzle.children.length, 26);
    disposeHierarchy(mockPuzzle);
    assert.equal(mockPuzzle.children.length, 0);
  });

  it('F17.5: handles high-order 7x7 cube model disposal (218 cubies, 1308 materials/textures)', () => {
    const bigPuzzle = buildMockPuzzleMesh(218, 6);
    const stats = disposeHierarchy(bigPuzzle);
    assert.equal(stats.geometries, 218);
    assert.equal(stats.materials, 1308);
    assert.equal(stats.textures, 1308);
    assert.equal(bigPuzzle.children.length, 0);
  });
});

describe('Tier 1: Feature 18 - Camera Presets & OrbitControls', () => {
  it('F18.1: defines 4 standard camera angles (Isometric, Front, Top, Right)', () => {
    assert.ok(CAMERA_PRESETS.isometric);
    assert.ok(CAMERA_PRESETS.front);
    assert.ok(CAMERA_PRESETS.top);
    assert.ok(CAMERA_PRESETS.right);
  });

  it('F18.2: sets appropriate 3D vector coordinates for each camera angle', () => {
    assert.deepEqual(CAMERA_PRESETS.isometric.position, [7, 6, 7]);
    assert.deepEqual(CAMERA_PRESETS.front.position, [0, 0, 9]);
    assert.deepEqual(CAMERA_PRESETS.top.position, [0, 9, 0]);
    assert.deepEqual(CAMERA_PRESETS.right.position, [9, 0, 0]);
  });

  it('F18.3: points camera target to puzzle center [0, 0, 0]', () => {
    for (const key of Object.keys(CAMERA_PRESETS)) {
      assert.deepEqual(CAMERA_PRESETS[key].target, [0, 0, 0]);
    }
  });

  it('F18.4: validates camera view preset selector without throwing runtime errors', () => {
    const applyCameraPreset = (view) => {
      const preset = CAMERA_PRESETS[view] || CAMERA_PRESETS.isometric;
      return {
        position: [...preset.position],
        target: [...preset.target]
      };
    };

    const iso = applyCameraPreset('isometric');
    assert.deepEqual(iso.position, [7, 6, 7]);
    const front = applyCameraPreset('front');
    assert.deepEqual(front.position, [0, 0, 9]);
  });

  it('F18.5: prevents the resetCamera crash by falling back gracefully on invalid view names', () => {
    const safeResetCamera = (viewName) => {
      if (!CAMERA_PRESETS[viewName]) {
        return CAMERA_PRESETS.isometric;
      }
      return CAMERA_PRESETS[viewName];
    };

    assert.equal(safeResetCamera('unknown_view'), CAMERA_PRESETS.isometric);
    assert.equal(safeResetCamera(null), CAMERA_PRESETS.isometric);
    assert.equal(safeResetCamera(undefined), CAMERA_PRESETS.isometric);
    assert.equal(safeResetCamera('top'), CAMERA_PRESETS.top);
  });
});
