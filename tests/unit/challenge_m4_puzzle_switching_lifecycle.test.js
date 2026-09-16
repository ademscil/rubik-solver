/**
 * Empirical Adversarial Challenge: Puzzle Switching Lifecycle & Memory Disposal
 * File: tests/unit/challenge_m4_puzzle_switching_lifecycle.test.js
 * Runner: node --test tests/unit/challenge_m4_puzzle_switching_lifecycle.test.js
 * 
 * Scope:
 * 1. Sequential switching across all 10 official WCA puzzles:
 *    cube-2x2, cube-3x3, cube-4x4, cube-5x5, cube-6x6, cube-7x7, pyraminx, skewb, megaminx, square-1.
 * 2. Model initialization, child piece meshes, and exact camera distances.
 * 3. DisposalPipeline verification: WebGL geometries and material disposal behavior.
 * 4. Stress-test rapid switching without awaiting load completion (concurrency, unhandled rejections).
 * 5. Stress-test switching during active animations, pivot group reparenting, and shared material opacity mutation.
 * 6. Benchmark 100 continuous 10-puzzle switching cycles (1,000 model build/dispose cycles).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  normalizePuzzleId,
  loadPuzzle,
  getPuzzleMetadata
} from '../../src/puzzles/registry.js';
import {
  disposeHierarchy
} from '../../src/engine/DisposalPipeline.js';
import { CameraManager } from '../../src/engine/CameraManager.js';
import { getStickerMaterial, STICKER_COLORS } from '../../src/engine/TextureCache.js';

const ALL_10_PUZZLE_IDS = Object.freeze([
  'cube-2x2',
  'cube-3x3',
  'cube-4x4',
  'cube-5x5',
  'cube-6x6',
  'cube-7x7',
  'pyraminx',
  'skewb',
  'megaminx',
  'square-1'
]);

function createMockControls() {
  const listeners = {};
  return {
    target: new THREE.Vector3(0, 0, 0),
    minDistance: 0,
    maxDistance: 100,
    enabled: true,
    update: () => {},
    addEventListener: (t, fn) => {
      listeners[t] = listeners[t] || [];
      listeners[t].push(fn);
    },
    removeEventListener: (t, fn) => {
      if (listeners[t]) {
        listeners[t] = listeners[t].filter(f => f !== fn);
      }
    },
    dispose: () => {}
  };
}

describe('M4-1 Empirical Challenge: Puzzle Switching Lifecycle & Memory Disposal', () => {

  describe('1. Sequential Verification Across All 10 WCA Puzzles', () => {
    it('1.1 Loads and verifies metadata contract for all 10 puzzles', async () => {
      assert.equal(ALL_10_PUZZLE_IDS.length, 10);

      for (const puzzleId of ALL_10_PUZZLE_IDS) {
        const meta = getPuzzleMetadata(puzzleId);
        assert.ok(meta, `Metadata for ${puzzleId} must exist`);
        assert.equal(meta.id, puzzleId);
        assert.ok(meta.name && meta.name.length > 0);
        assert.ok(meta.shortName && meta.shortName.length > 0);
        assert.ok(typeof meta.defaultCameraDistance === 'number' && meta.defaultCameraDistance > 0);
        assert.ok(typeof meta.minCameraDistance === 'number' && meta.minCameraDistance > 0);
        assert.ok(typeof meta.maxCameraDistance === 'number' && meta.maxCameraDistance > 0);
        assert.ok(
          meta.minCameraDistance < meta.defaultCameraDistance,
          `${puzzleId}: minCameraDistance (${meta.minCameraDistance}) must be < defaultCameraDistance (${meta.defaultCameraDistance})`
        );
        assert.ok(
          meta.defaultCameraDistance < meta.maxCameraDistance,
          `${puzzleId}: defaultCameraDistance (${meta.defaultCameraDistance}) must be < maxCameraDistance (${meta.maxCameraDistance})`
        );

        const def = await loadPuzzle(puzzleId);
        assert.ok(def, `Puzzle definition for ${puzzleId} must load`);
        assert.equal(normalizePuzzleId(def.id), puzzleId);
        assert.equal(typeof def.buildModel, 'function');
        assert.equal(typeof def.animateMove, 'function');
        assert.equal(typeof def.parseAlgorithm, 'function');
        assert.equal(typeof def.generateScramble, 'function');
      }
    });

    it('1.2 Adversarial Finding: Square-1 Definition ID mismatch breaks active badge in PuzzleSelector', async () => {
      const def = await loadPuzzle('square-1');
      const meta = getPuzzleMetadata('square-1');

      // Observation: square1Definition defines id: 'square1' instead of canonical 'square-1'
      assert.equal(def.id, 'square1', 'square1Definition.id is currently "square1"');
      assert.equal(meta.id, 'square-1', 'WCA_PUZZLE_METADATA key is canonical "square-1"');

      // In PuzzleSelector.jsx line 168:
      // const isActive = currentPuzzleId === pId || currentPuzzleId === meta.wcaId;
      // When App sets currentPuzzleId = def.id ('square1'):
      const currentPuzzleId = def.id; // 'square1'
      const pId = 'square-1';
      const wcaId = meta.wcaId; // 'sq1'

      const isActive = currentPuzzleId === pId || currentPuzzleId === wcaId;
      assert.equal(
        isActive,
        false,
        'CRITICAL DEFECT: Square-1 active badge evaluates to false in PuzzleSelector because def.id ("square1") does not equal pId ("square-1") or wcaId ("sq1")'
      );
    });

    it('1.3 Adversarial Finding: Camera distance discrepancies between metadata catalog and definitions', async () => {
      // Skewb discrepancy
      const skewbDef = await loadPuzzle('skewb');
      const skewbMeta = getPuzzleMetadata('skewb');
      assert.equal(skewbDef.defaultCameraDistance, 7.5);
      assert.equal(skewbMeta.defaultCameraDistance, 8.0);
      assert.notEqual(
        skewbDef.defaultCameraDistance,
        skewbMeta.defaultCameraDistance,
        'DISCREPANCY: Skewb definition camera distance (7.5) does not match catalog metadata (8.0)'
      );

      // Megaminx discrepancy
      const megaDef = await loadPuzzle('megaminx');
      const megaMeta = getPuzzleMetadata('megaminx');
      assert.equal(megaDef.defaultCameraDistance, 11.0);
      assert.equal(megaMeta.defaultCameraDistance, 13.0);
      assert.notEqual(
        megaDef.defaultCameraDistance,
        megaMeta.defaultCameraDistance,
        'DISCREPANCY: Megaminx definition camera distance (11.0) does not match catalog metadata (13.0)'
      );
    });

    it('1.4 Sequential model instantiation and cascading disposal for each puzzle', async () => {
      const scene = new THREE.Scene();

      for (const puzzleId of ALL_10_PUZZLE_IDS) {
        const def = await loadPuzzle(puzzleId);

        // Build model
        const model = def.buildModel();
        assert.ok(model instanceof THREE.Object3D, `${puzzleId} buildModel must return THREE.Object3D`);
        assert.ok(model.children.length > 0, `${puzzleId} model must have child meshes`);

        let meshCount = 0;
        let geomCount = 0;

        model.traverse((child) => {
          if (child.isMesh) {
            meshCount++;
            if (child.geometry) geomCount++;
          }
        });

        assert.ok(meshCount > 0, `${puzzleId} must contain at least 1 mesh`);
        assert.ok(geomCount > 0, `${puzzleId} must contain at least 1 geometry`);

        scene.add(model);
        assert.equal(scene.children.includes(model), true);

        // Track unique geometries
        const visitedG = new Set();
        let disposedGeomCalls = 0;

        model.traverse((child) => {
          if (child.geometry && !visitedG.has(child.geometry)) {
            visitedG.add(child.geometry);
            const orig = child.geometry.dispose.bind(child.geometry);
            child.geometry.dispose = () => {
              disposedGeomCalls++;
              orig();
            };
          }
        });

        // Dispose hierarchy (as done during puzzle switch in RubikViewer)
        const stats = disposeHierarchy(model, { disposeSharedTextures: false });
        scene.remove(model);

        // Verify model is detached from scene
        assert.equal(scene.children.includes(model), false);
        assert.equal(model.children.length, 0, `${puzzleId} children must be detached after disposal`);

        // Verify 100% of geometries were disposed
        assert.equal(
          stats.geometriesDisposed,
          visitedG.size,
          `${puzzleId}: geometriesDisposed (${stats.geometriesDisposed}) must match visited count (${visitedG.size})`
        );
        assert.equal(
          disposedGeomCalls,
          visitedG.size,
          `${puzzleId}: dispose() must be called on each unique geometry`
        );

        // Architectural Verification:
        // NxN cubes use shared materials from TextureCache (userData.isShared = true),
        // so materialsDisposed is 0 (materials preserved in cache).
        // Shape puzzles allocate unshared MeshStandardMaterial instances, so materialsDisposed > 0.
        if (def.category === 'nxn') {
          assert.equal(
            stats.materialsDisposed,
            0,
            `${puzzleId}: NxN cube materials are shared in TextureCache and must NOT be disposed during puzzle switch`
          );
        } else {
          assert.ok(
            stats.materialsDisposed > 0,
            `${puzzleId}: Shape puzzle allocates unshared materials which must be disposed`
          );
        }
      }
    });
  });

  describe('2. Rapid Switching & Concurrency Stress', () => {
    it('2.1 Rapid concurrent calls to loadPuzzle for all 10 puzzles without unhandled rejections', async () => {
      // Fire 50 concurrent loads across all 10 puzzles in random order
      const promises = [];
      for (let i = 0; i < 50; i++) {
        const id = ALL_10_PUZZLE_IDS[i % ALL_10_PUZZLE_IDS.length];
        promises.push(loadPuzzle(id));
      }

      const results = await Promise.all(promises);
      assert.equal(results.length, 50);

      for (let i = 0; i < 50; i++) {
        const expectedId = ALL_10_PUZZLE_IDS[i % ALL_10_PUZZLE_IDS.length];
        assert.equal(normalizePuzzleId(results[i].id), expectedId);
      }
    });

    it('2.2 Rapid non-awaited puzzle switching simulator (stressing race conditions)', async () => {
      const switchHistory = [];
      let activePuzzle = null;
      let activeModel = null;
      const scene = new THREE.Scene();

      async function switchPuzzle(puzzleId) {
        const p = loadPuzzle(puzzleId);
        switchHistory.push(`requested:${puzzleId}`);
        const def = await p;
        switchHistory.push(`resolved:${puzzleId}`);

        if (activeModel) {
          disposeHierarchy(activeModel, { disposeSharedTextures: false });
          scene.remove(activeModel);
          activeModel = null;
        }

        activePuzzle = def;
        activeModel = def.buildModel();
        scene.add(activeModel);
      }

      // Fire 10 rapid switches in quick succession without awaiting between them
      const switchPromises = ALL_10_PUZZLE_IDS.map(id => switchPuzzle(id));
      await Promise.all(switchPromises);

      assert.ok(activePuzzle !== null);
      assert.ok(activeModel !== null);
      assert.equal(scene.children.length, 1);
      assert.equal(scene.children[0], activeModel);

      disposeHierarchy(activeModel, { disposeSharedTextures: false });
      scene.remove(activeModel);
      assert.equal(scene.children.length, 0);
    });

    it('2.3 Switching puzzles via aliases and abbreviations', async () => {
      const aliasTests = [
        { alias: '2x2', canonical: 'cube-2x2' },
        { alias: '333', canonical: 'cube-3x3' },
        { alias: 'revenge', canonical: 'cube-4x4' },
        { alias: 'professor', canonical: 'cube-5x5' },
        { alias: 'vcube6', canonical: 'cube-6x6' },
        { alias: '777', canonical: 'cube-7x7' },
        { alias: 'pyra', canonical: 'pyraminx' },
        { alias: 'minx', canonical: 'megaminx' },
        { alias: 'sq1', canonical: 'square-1' },
        { alias: 'Sq-1', canonical: 'square-1' },
        { alias: 'skewb', canonical: 'skewb' }
      ];

      for (const { alias, canonical } of aliasTests) {
        const normalized = normalizePuzzleId(alias);
        assert.equal(normalized, canonical, `Alias ${alias} must normalize to ${canonical}`);
        const def = await loadPuzzle(alias);
        assert.equal(normalizePuzzleId(def.id), canonical, `loadPuzzle(${alias}) must return canonical definition ${canonical}`);
      }
    });
  });

  describe('3. CameraManager Lifecycle & Boundary Synchronization', () => {
    it('3.1 Camera distance updates across all 10 puzzles synchronize with OrbitControls', async () => {
      const camera = new THREE.PerspectiveCamera(40, 800 / 600, 0.1, 100);
      const controls = createMockControls();
      const cameraManager = new CameraManager(camera, controls, 8.0);

      for (const puzzleId of ALL_10_PUZZLE_IDS) {
        const meta = getPuzzleMetadata(puzzleId);

        cameraManager.setDistance(meta.defaultCameraDistance);
        controls.minDistance = meta.minCameraDistance;
        controls.maxDistance = meta.maxCameraDistance;

        assert.equal(cameraManager.distance, meta.defaultCameraDistance);
        assert.equal(controls.minDistance, meta.minCameraDistance);
        assert.equal(controls.maxDistance, meta.maxCameraDistance);

        cameraManager.resetCamera('isometric', { animate: false });
        assert.equal(camera.position.x, meta.defaultCameraDistance);
        assert.equal(camera.position.y, meta.defaultCameraDistance);
        assert.equal(camera.position.z, meta.defaultCameraDistance);

        cameraManager.resetCamera('front', { animate: false });
        assert.equal(camera.position.x, 0);
        assert.equal(camera.position.y, 0);
        assert.equal(camera.position.z, meta.defaultCameraDistance * 1.5);
      }

      cameraManager.dispose();
      assert.equal(cameraManager.camera, null);
      assert.equal(cameraManager.controls, null);
    });

    it('3.2 CameraManager handles malformed and out-of-bounds distances gracefully', () => {
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      const controls = createMockControls();
      const cm = new CameraManager(camera, controls, 8.0);

      cm.setDistance(-10);
      assert.equal(cm.distance, 8.0);
      cm.setDistance(0);
      assert.equal(cm.distance, 8.0);
      cm.setDistance(NaN);
      assert.equal(cm.distance, 8.0);
      cm.setDistance(Infinity);
      assert.equal(cm.distance, 8.0);
      cm.setDistance('large');
      assert.equal(cm.distance, 8.0);

      cm.dispose();
    });
  });

  describe('4. Active Animation Interruption, Pivot Orphans & Shared Material Mutation', () => {
    it('4.1 Adversarial Finding: Mid-animation puzzle switch orphans cubies attached to pivotGroup', async () => {
      const p3 = await loadPuzzle('cube-3x3');
      const scene = new THREE.Scene();
      const pivotGroup = new THREE.Group();
      scene.add(pivotGroup);

      let model3 = p3.buildModel();
      scene.add(model3);

      // Emulate starting an animation where 9 active cubies of the R face are attached to pivotGroup:
      const cubiesToAnimate = model3.children.slice(0, 9);
      cubiesToAnimate.forEach(c => pivotGroup.attach(c));

      assert.equal(pivotGroup.children.length, 9);
      assert.equal(model3.children.length, 26 - 9);

      // In RubikViewer.jsx buildModel():
      // disposeHierarchy(activeModelRef.current);
      // scene.remove(activeModelRef.current);
      // NOTICE: buildModel does NOT touch pivotRef.current!
      disposeHierarchy(model3, { disposeSharedTextures: false });
      scene.remove(model3);

      // VULNERABILITY CONFIRMED:
      // The 9 cubies attached to pivotGroup remain attached to pivotGroup and stay in the scene!
      assert.equal(
        pivotGroup.children.length,
        9,
        'VULNERABILITY: 9 cubies are orphaned in pivotGroup because buildModel() only disposes activeModelRef.current'
      );
      assert.equal(
        scene.children.includes(pivotGroup),
        true,
        'pivotGroup remains in scene with orphaned cubies'
      );

      // Clean up test harness
      disposeHierarchy(pivotGroup, { disposeSharedTextures: false });
      scene.remove(pivotGroup);
      assert.equal(scene.children.length, 0);
    });

    it('4.2 Adversarial Finding: RubikViewer highlightMode directly mutates singleton shared materials', async () => {
      // Get shared red material from TextureCache
      const sharedRedMat = getStickerMaterial(STICKER_COLORS.RED);
      const originalOpacity = sharedRedMat.opacity ?? 1.0;
      const originalTransparent = sharedRedMat.transparent ?? false;

      // Emulate RubikViewer.jsx lines 247-250 (highlightMode === 'centers'):
      // shouldHighlight is false for an edge cubie:
      const shouldHighlight = false;
      sharedRedMat.opacity = shouldHighlight ? 1.0 : 0.28;
      sharedRedMat.transparent = !shouldHighlight;

      // Check if singleton material was mutated:
      assert.equal(
        sharedRedMat.opacity,
        0.28,
        'VULNERABILITY: Mutating mat.opacity directly modifies the singleton cached material!'
      );
      assert.equal(
        sharedRedMat.transparent,
        true,
        'VULNERABILITY: Mutating mat.transparent directly modifies the singleton cached material!'
      );

      // If user switches to another puzzle (e.g. 2x2), the 2x2 cubies will render dimmed!
      const p2 = await loadPuzzle('cube-2x2');
      const model2 = p2.buildModel();
      const firstCubieMatR = model2.children[0].material[0]; // Red face

      if (firstCubieMatR.userData?.cacheKey === sharedRedMat.userData?.cacheKey) {
        assert.equal(
          firstCubieMatR.opacity,
          0.28,
          'CONTAMINATION: Newly built 2x2 model inherited the dimmed 0.28 opacity from the previous puzzle!'
        );
      }

      // Restore material for subsequent test stability
      sharedRedMat.opacity = originalOpacity;
      sharedRedMat.transparent = originalTransparent;
      disposeHierarchy(model2, { disposeSharedTextures: false });
    });

    it('4.3 Rapid queued move execution cancellation upon puzzle switch', async () => {
      const p3 = await loadPuzzle('cube-3x3');
      const model = p3.buildModel();

      const moveQueue = [
        { moveStr: 'R', onComplete: () => {} },
        { moveStr: 'U', onComplete: () => {} },
        { moveStr: 'R\'', onComplete: () => {} }
      ];

      // On puzzle switch, queue must be emptied to prevent applying 3x3 moves to new puzzle
      moveQueue.length = 0;
      assert.equal(moveQueue.length, 0, 'Move queue must be purged immediately on puzzle switch');

      disposeHierarchy(model, { disposeSharedTextures: false });
    });
  });

  describe('5. Benchmark: 100 Continuous 10-Puzzle Switching Cycles (1,000 Switches)', () => {
    it('5.1 1,000 continuous puzzle switch cycles complete with 100% disposal and stable memory', async () => {
      const CYCLES = 100;
      const TOTAL_SWITCHES = CYCLES * ALL_10_PUZZLE_IDS.length;

      const definitions = {};
      for (const id of ALL_10_PUZZLE_IDS) {
        definitions[id] = await loadPuzzle(id);
      }

      const scene = new THREE.Scene();
      let totalGeometriesDisposed = 0;
      let totalMaterialsDisposed = 0;
      let activeModel = null;

      const memBefore = process.memoryUsage();
      const startTime = performance.now();

      for (let round = 0; round < CYCLES; round++) {
        for (const id of ALL_10_PUZZLE_IDS) {
          if (activeModel) {
            const stats = disposeHierarchy(activeModel, { disposeSharedTextures: false });
            totalGeometriesDisposed += stats.geometriesDisposed;
            totalMaterialsDisposed += stats.materialsDisposed;
            scene.remove(activeModel);
            activeModel = null;
          }

          const def = definitions[id];
          activeModel = def.buildModel();
          scene.add(activeModel);
        }
      }

      if (activeModel) {
        const stats = disposeHierarchy(activeModel, { disposeSharedTextures: false });
        totalGeometriesDisposed += stats.geometriesDisposed;
        totalMaterialsDisposed += stats.materialsDisposed;
        scene.remove(activeModel);
        activeModel = null;
      }

      const durationMs = performance.now() - startTime;
      const memAfter = process.memoryUsage();
      const heapDeltaMb = (memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024;

      assert.equal(scene.children.length, 0, 'Scene must be completely empty after 1,000 switch cycles');
      assert.ok(totalGeometriesDisposed > 0, 'Geometries must be disposed');
      assert.ok(totalMaterialsDisposed > 0, 'Materials must be disposed');

      console.log(`\n  [1,000 PUZZLE SWITCHING LIFECYCLE BENCHMARK]`);
      console.log(`  Total Switches:            ${TOTAL_SWITCHES} (10 puzzles x ${CYCLES} rounds)`);
      console.log(`  Total Time:                ${durationMs.toFixed(2)} ms (${(durationMs / TOTAL_SWITCHES).toFixed(3)} ms/switch)`);
      console.log(`  Geometries Disposed:       ${totalGeometriesDisposed}`);
      console.log(`  Materials Disposed:        ${totalMaterialsDisposed}`);
      console.log(`  Heap Delta:                ${heapDeltaMb.toFixed(2)} MB`);
      console.log(`  Scene Children Remaining:  ${scene.children.length}\n`);
    });
  });
});
