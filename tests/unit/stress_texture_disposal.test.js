/**
/**
 * Empirical Stress Test Harness: TextureCache & DisposalPipeline
 * File: tests/unit/stress_texture_disposal.test.js
 * Runner: node --test tests/unit/stress_texture_disposal.test.js
 * 
 * Verifies:
 * 1. TextureCache deduplication across thousands of color calls.
 * 2. Shared textures (userData.isShared = true) are NEVER disposed during standard puzzle switching.
 * 3. BufferGeometries and MeshStandardMaterials are 100% disposed.
 * 4. 1,000 rapid rebuild cycles produce zero geometry or material memory leaks.
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';

import {
  getStickerTexture,
  getStickerMaterial,
  getInternalCoreMaterial,
  disposeTextureCache,
  getTextureCacheStats,
  preloadStandardTextures,
  STICKER_COLORS,
  MEGAMINX_COLORS,
} from '../../src/engine/TextureCache.js';

import {
  disposeHierarchy,
  disposeScene,
  teardownViewer,
} from '../../src/engine/DisposalPipeline.js';

describe('Empirical Stress: TextureCache Deduplication & Memory Management', () => {
  beforeEach(() => {
    disposeTextureCache();
  });

  test('STRESS-TC-1: 1,000 rapid texture requests with varied casing and formatting map to exact singleton instances', () => {
    const colorVariations = [
      // White variations
      ['#FFFFFF', '#ffffff', 'FFFFFF', 'ffffff', '#fff', '#FFF', 'fff', '   #ffffff   '],
      // Green variations
      ['#009B48', '#009b48', '009B48', '009b48', '   #009B48  '],
      // Blue variations
      ['#0046AD', '#0046ad', '0046AD', '0046ad'],
      // Red variations
      ['#B71234', '#b71234', 'B71234', 'b71234'],
      // Yellow variations
      ['#FFD500', '#ffd500', 'FFD500', 'ffd500'],
      // Orange variations
      ['#FF5800', '#ff5800', 'FF5800', 'ff5800'],
    ];

    const referenceTextures = colorVariations.map(vars => getStickerTexture(vars[0]));

    // Perform 1,000 calls across variations
    for (let i = 0; i < 1000; i++) {
      const groupIdx = i % colorVariations.length;
      const variations = colorVariations[groupIdx];
      const selectedStr = variations[i % variations.length];

      const tex = getStickerTexture(selectedStr);
      assert.strictEqual(
        tex,
        referenceTextures[groupIdx],
        `Call ${i} for "${selectedStr}" must return the identical texture instance (===)`
      );
      assert.strictEqual(tex.userData.isShared, true);
    }

    const stats = getTextureCacheStats();
    assert.strictEqual(
      stats.textureCount,
      6,
      'TextureCache must contain exactly 6 unique textures despite 1,000 requests'
    );
  });

  test('STRESS-TC-2: All 12 Megaminx colors across multiple shapes maintain strict singleton identity', () => {
    const megaminxColorsList = Object.values(MEGAMINX_COLORS);
    assert.strictEqual(megaminxColorsList.length, 12);

    const shapes = ['square', 'pentagon', 'triangle', 'diamond'];

    // Warm up and record references
    const textureMap = new Map();
    for (const color of megaminxColorsList) {
      for (const shape of shapes) {
        const key = `${color}_${shape}`;
        textureMap.set(key, getStickerTexture(color, { shape }));
      }
    }

    // Stress test with 1,200 repeated calls
    for (let i = 0; i < 1200; i++) {
      const color = megaminxColorsList[i % megaminxColorsList.length];
      const shape = shapes[i % shapes.length];
      const key = `${color}_${shape}`;

      const retrieved = getStickerTexture(color, { shape });
      assert.strictEqual(
        retrieved,
        textureMap.get(key),
        `Megaminx texture for ${key} must return exact cached singleton`
      );
    }

    const stats = getTextureCacheStats();
    assert.strictEqual(
      stats.textureCount,
      12 * shapes.length,
      `Expected ${12 * shapes.length} total textures in cache`
    );
  });

  test('STRESS-TC-3: Malformed, invalid, and boundary color inputs safely fallback to #FFFFFF without memory leaks', () => {
    const invalidInputs = [
      null,
      undefined,
      12345,
      NaN,
      {},
      [],
      '',
      '   ',
      '#ZZZZZZ',
      '#12',
      '#12345',
      '#1234567',
      'invalid-color-string',
      'rgba(255,0,0,1)',
    ];

    const fallbackTexture = getStickerTexture('#FFFFFF');

    for (const input of invalidInputs) {
      const tex = getStickerTexture(input);
      assert.strictEqual(
        tex,
        fallbackTexture,
        `Input ${JSON.stringify(input)} must safely fallback to #FFFFFF singleton`
      );
    }

    const stats = getTextureCacheStats();
    assert.strictEqual(stats.textureCount, 1, 'Only the single fallback texture must exist in cache');
  });

  test('STRESS-TC-4: Material caching and internal core material reuse', () => {
    const mat1 = getStickerMaterial(STICKER_COLORS.RED);
    const mat2 = getStickerMaterial('#B71234');
    assert.strictEqual(mat1, mat2, 'Identical color must return identical MeshStandardMaterial');
    assert.strictEqual(mat1.userData.isShared, true);

    const core1 = getInternalCoreMaterial();
    const core2 = getInternalCoreMaterial(STICKER_COLORS.CORE);
    const core3 = getInternalCoreMaterial('#121215');
    assert.strictEqual(core1, core2);
    assert.strictEqual(core2, core3);
    assert.strictEqual(core1.userData.isShared, true);

    const stats = getTextureCacheStats();
    assert.strictEqual(stats.materialCount, 2);
  });

  test('STRESS-TC-5: disposeTextureCache completely purges GPU resources and DOM images', () => {
    // Populate with multiple colors and shapes
    preloadStandardTextures();
    getStickerMaterial(STICKER_COLORS.WHITE);
    getStickerMaterial(STICKER_COLORS.RED);
    getInternalCoreMaterial();

    const before = getTextureCacheStats();
    assert.ok(before.textureCount >= 18, `Expected >= 18 textures, got ${before.textureCount}`);
    assert.ok(before.materialCount >= 3, `Expected >= 3 materials, got ${before.materialCount}`);

    // Spy on texture disposal
    let textureDisposalCount = 0;

    // Collect references
    const textures = before.textureKeys.map(k => getStickerTexture(k.split('_')[0]));
    textures.forEach(t => {
      const origDispose = t.dispose.bind(t);
      t.dispose = () => {
        textureDisposalCount++;
        origDispose();
      };
    });
    assert.strictEqual(textureDisposalCount, 0);

    const result = disposeTextureCache();
    assert.strictEqual(result.disposedTextures, before.textureCount);
    assert.strictEqual(result.disposedMaterials, before.materialCount);

    const after = getTextureCacheStats();
    assert.strictEqual(after.textureCount, 0, 'All textures must be purged');
    assert.strictEqual(after.materialCount, 0, 'All materials must be purged');
    assert.strictEqual(after.textureKeys.length, 0);
    assert.strictEqual(after.materialKeys.length, 0);

    // Verify cache can be freshly populated after purge
    const freshTex = getStickerTexture(STICKER_COLORS.BLUE);
    assert.ok(freshTex, 'Cache must smoothly recreate textures after purge');
    assert.strictEqual(getTextureCacheStats().textureCount, 1);
  });
});

describe('Empirical Stress: DisposalPipeline Cascading Cleanup & Shared Texture Preservation', () => {
  beforeEach(() => {
    disposeTextureCache();
  });

  test('STRESS-DP-1: Ultra-deep 25-tier nested hierarchy completely disposes all geometries and materials', () => {
    let geometriesDisposed = 0;
    let materialsDisposed = 0;

    const root = new THREE.Group();
    root.name = 'root_tier_0';
    let currentParent = root;

    // Build 25 levels deep
    for (let depth = 1; depth <= 25; depth++) {
      const tierGroup = new THREE.Group();
      tierGroup.name = `tier_${depth}`;

      // Attach 2 meshes at each depth
      for (let m = 0; m < 2; m++) {
        const geom = new THREE.BufferGeometry();
        geom.dispose = () => { geometriesDisposed++; };

        const mat = new THREE.MeshStandardMaterial();
        mat.dispose = () => { materialsDisposed++; };

        const mesh = new THREE.Mesh(geom, mat);
        mesh.name = `mesh_d${depth}_m${m}`;
        tierGroup.add(mesh);
      }

      currentParent.add(tierGroup);
      currentParent = tierGroup;
    }

    // 25 levels * 2 meshes = 50 meshes, 50 geometries, 50 materials
    const stats = disposeHierarchy(root);
    assert.strictEqual(stats.geometriesDisposed, 50);
    assert.strictEqual(stats.materialsDisposed, 50);
    assert.strictEqual(geometriesDisposed, 50);
    assert.strictEqual(materialsDisposed, 50);
    assert.strictEqual(root.children.length, 0, 'Root group children must be detached');
  });

  test('STRESS-DP-2: Shared textures are NEVER disposed during standard puzzle switching', () => {
    let sharedDisposedCalls = 0;
    let unsharedDisposedCalls = 0;

    // Create shared texture via TextureCache
    const sharedTex = getStickerTexture(STICKER_COLORS.GREEN);
    assert.strictEqual(sharedTex.userData.isShared, true);

    const origSharedDispose = sharedTex.dispose.bind(sharedTex);
    sharedTex.dispose = () => {
      sharedDisposedCalls++;
      origSharedDispose();
    };

    // Create unshared texture
    const unsharedTex = new THREE.Texture();
    unsharedTex.userData = { isShared: false };
    unsharedTex.dispose = () => {
      unsharedDisposedCalls++;
    };

    // Create complex group with 50 meshes using sharedTex and 50 meshes using unsharedTex
    const puzzleGroup = new THREE.Group();

    for (let i = 0; i < 50; i++) {
      // Mesh with shared texture
      const matShared = new THREE.MeshStandardMaterial({ map: sharedTex });
      const meshShared = new THREE.Mesh(new THREE.BufferGeometry(), matShared);
      puzzleGroup.add(meshShared);

      // Mesh with unshared texture
      const matUnshared = new THREE.MeshStandardMaterial({ map: unsharedTex });
      const meshUnshared = new THREE.Mesh(new THREE.BufferGeometry(), matUnshared);
      puzzleGroup.add(meshUnshared);
    }

    // Standard puzzle switch: disposeSharedTextures = false (default)
    const stats = disposeHierarchy(puzzleGroup, { disposeSharedTextures: false });

    assert.strictEqual(
      sharedDisposedCalls,
      0,
      'CRITICAL: Shared texture must NEVER be disposed during standard puzzle switch'
    );
    assert.strictEqual(
      unsharedDisposedCalls,
      1,
      'Unshared texture must be disposed exactly once across all meshes'
    );
    assert.strictEqual(stats.geometriesDisposed, 100);
    assert.strictEqual(stats.materialsDisposed, 100);
  });

  test('STRESS-DP-3: Multi-slot textures (19 Three.js material map slots) correctly filtered and disposed', () => {
    let sharedDisposed = 0;
    let unsharedDisposed = 0;

    const sharedTex = getStickerTexture(STICKER_COLORS.BLUE);
    sharedTex.dispose = () => { sharedDisposed++; };

    const unsharedTex1 = new THREE.Texture();
    unsharedTex1.dispose = () => { unsharedDisposed++; };

    const unsharedTex2 = new THREE.Texture();
    unsharedTex2.dispose = () => { unsharedDisposed++; };

    const mat = new THREE.MeshStandardMaterial({
      map: sharedTex,             // slot 0: shared
      roughnessMap: unsharedTex1, // slot 10: unshared
      normalMap: unsharedTex2,    // slot 9: unshared
    });

    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
    const stats = disposeHierarchy(mesh, { disposeSharedTextures: false });

    assert.strictEqual(sharedDisposed, 0, 'Shared map must not be disposed');
    assert.strictEqual(unsharedDisposed, 2, 'Both unshared roughnessMap and normalMap must be disposed');
    assert.strictEqual(stats.texturesDisposed, 2);
    assert.strictEqual(stats.materialsDisposed, 1);
  });

  test('STRESS-DP-4: Multi-material array cubies (6 materials per box) correctly dispose all materials', () => {
    let disposedMats = 0;
    const materials = Array.from({ length: 6 }, (_, idx) => {
      const m = new THREE.MeshStandardMaterial({
        map: idx % 2 === 0 ? getStickerTexture(STICKER_COLORS.YELLOW) : null,
      });
      m.dispose = () => { disposedMats++; };
      return m;
    });

    const cubieMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), materials);
    const stats = disposeHierarchy(cubieMesh);

    assert.strictEqual(stats.materialsDisposed, 6);
    assert.strictEqual(disposedMats, 6);
    assert.strictEqual(stats.geometriesDisposed, 1);
  });

  test('STRESS-DP-5: Lights with shadow maps have shadow maps disposed and nulled', () => {
    let shadowDisposed = false;
    const light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.castShadow = true;
    light.shadow.map = {
      dispose: () => { shadowDisposed = true; },
    };

    const group = new THREE.Group();
    group.add(light);

    disposeHierarchy(group);
    assert.strictEqual(shadowDisposed, true, 'Shadow map must be disposed');
    assert.strictEqual(light.shadow.map, null, 'Shadow map reference must be nulled');
  });

  test('STRESS-DP-6: Full Scene & WebGLRenderer disposal and context loss handling', () => {
    const scene = new THREE.Scene();

    let bgDisposed = false;
    const bgTex = new THREE.Texture();
    bgTex.dispose = () => { bgDisposed = true; };
    scene.background = bgTex;

    let envDisposed = false;
    const envTex = new THREE.Texture();
    envTex.dispose = () => { envDisposed = true; };
    scene.environment = envTex;

    let rendererDisposed = false;
    let renderListsDisposed = false;
    let contextForcedLost = false;
    let domRemoved = false;

    const mockParent = {
      removeChild: (child) => {
        if (child === mockDomElement) domRemoved = true;
      }
    };
    const mockDomElement = { parentNode: mockParent };

    const mockRenderer = {
      domElement: mockDomElement,
      dispose: () => { rendererDisposed = true; },
      renderLists: {
        dispose: () => { renderListsDisposed = true; },
      },
      forceContextLoss: () => { contextForcedLost = true; },
    };

    const stats = disposeScene(scene, mockRenderer, {
      forceContextLoss: true,
      removeDomElement: true,
    });

    assert.strictEqual(bgDisposed, true, 'Unshared scene background must be disposed');
    assert.strictEqual(envDisposed, true, 'Unshared scene environment must be disposed');
    assert.strictEqual(scene.background, null);
    assert.strictEqual(scene.environment, null);
    assert.strictEqual(stats.rendererDisposed, true);
    assert.strictEqual(stats.contextLost, true);
    assert.strictEqual(rendererDisposed, true);
    assert.strictEqual(renderListsDisposed, true);
    assert.strictEqual(contextForcedLost, true);
    assert.strictEqual(domRemoved, true);
  });

  test('STRESS-DP-7: teardownViewer executes complete clean unmount without throwing', () => {
    let animCanceled = false;
    let listenerRemoved = false;
    let controlsDisposed = false;

    // Mock global functions if in test environment
    const origCancelAnim = globalThis.cancelAnimationFrame;
    globalThis.cancelAnimationFrame = (id) => {
      if (id === 999) animCanceled = true;
    };

    const mockResizeHandler = () => {};
    const origWindow = globalThis.window;
    globalThis.window = {
      removeEventListener: (event, handler) => {
        if (event === 'resize' && handler === mockResizeHandler) {
          listenerRemoved = true;
        }
      }
    };

    const mockControls = {
      dispose: () => { controlsDisposed = true; }
    };

    const scene = new THREE.Scene();

    try {
      teardownViewer({
        scene,
        renderer: null,
        controls: mockControls,
        animId: 999,
        resizeHandler: mockResizeHandler,
      });

      assert.strictEqual(animCanceled, true, 'cancelAnimationFrame must be called');
      assert.strictEqual(listenerRemoved, true, 'Window resize listener must be removed');
      assert.strictEqual(controlsDisposed, true, 'OrbitControls must be disposed');
    } finally {
      globalThis.cancelAnimationFrame = origCancelAnim;
      globalThis.window = origWindow;
    }
  });
});

describe('Empirical Benchmark: 1,000 Rapid Puzzle Rebuild Cycles (Zero Leaks)', () => {
  beforeEach(() => {
    disposeTextureCache();
  });

  test('STRESS-BENCHMARK-1: 1,000 5x5 Cube rebuild cycles produce 0 geometry/material leaks and 0 shared texture disposal', () => {
    const CUBIES_PER_5X5 = 98; // 5x5 outer cubies (125 - 27 inner)
    const MATERIALS_PER_CUBIE = 6;
    const TOTAL_MATERIALS_PER_CYCLE = CUBIES_PER_5X5 * MATERIALS_PER_CUBIE; // 588 materials

    const CYCLES = 1000;

    let totalGeometriesDisposed = 0;
    let totalMaterialsDisposed = 0;
    let sharedTexturesDisposed = 0;

    // Track shared textures
    const standardColors = Object.values(STICKER_COLORS);
    standardColors.forEach(c => {
      const tex = getStickerTexture(c);
      const orig = tex.dispose.bind(tex);
      tex.dispose = () => {
        sharedTexturesDisposed++;
        orig();
      };
    });

    const initialCacheStats = getTextureCacheStats();
    assert.strictEqual(initialCacheStats.textureCount, standardColors.length);

    let currentCubeGroup = null;

    const memBefore = process.memoryUsage();
    const startTime = performance.now();

    for (let cycle = 0; cycle < CYCLES; cycle++) {
      // 1. Dispose previous cube if exists
      if (currentCubeGroup) {
        const stats = disposeHierarchy(currentCubeGroup, { disposeSharedTextures: false });
        totalGeometriesDisposed += stats.geometriesDisposed;
        totalMaterialsDisposed += stats.materialsDisposed;
      }

      // 2. Build new 5x5 cube
      currentCubeGroup = new THREE.Group();
      currentCubeGroup.name = `cube_5x5_cycle_${cycle}`;

      // Shared BoxGeometry across cubies in the same cube model
      const geom = new THREE.BoxGeometry(0.94, 0.94, 0.94);

      for (let i = 0; i < CUBIES_PER_5X5; i++) {
        // 6 materials per cubie with shared textures
        const materials = [
          new THREE.MeshStandardMaterial({ map: getStickerTexture(STICKER_COLORS.RED) }),
          new THREE.MeshStandardMaterial({ map: getStickerTexture(STICKER_COLORS.ORANGE) }),
          new THREE.MeshStandardMaterial({ map: getStickerTexture(STICKER_COLORS.WHITE) }),
          new THREE.MeshStandardMaterial({ map: getStickerTexture(STICKER_COLORS.YELLOW) }),
          new THREE.MeshStandardMaterial({ map: getStickerTexture(STICKER_COLORS.GREEN) }),
          new THREE.MeshStandardMaterial({ map: getStickerTexture(STICKER_COLORS.BLUE) }),
        ];

        const cubie = new THREE.Mesh(geom, materials);
        currentCubeGroup.add(cubie);
      }
    }

    // Dispose the final 1,000th cube
    if (currentCubeGroup) {
      const stats = disposeHierarchy(currentCubeGroup, { disposeSharedTextures: false });
      totalGeometriesDisposed += stats.geometriesDisposed;
      totalMaterialsDisposed += stats.materialsDisposed;
      currentCubeGroup = null;
    }

    const durationMs = performance.now() - startTime;
    const memAfter = process.memoryUsage();

    // VERIFICATIONS:
    // 1. Shared textures must NEVER be disposed across 1,000 cycles
    assert.strictEqual(
      sharedTexturesDisposed,
      0,
      'CRITICAL FAILURE: Shared textures were disposed during rebuild cycles!'
    );

    // 2. Exactly 1,000 geometries must be disposed (1 per cycle)
    assert.strictEqual(
      totalGeometriesDisposed,
      CYCLES,
      `Expected exactly ${CYCLES} geometries disposed, got ${totalGeometriesDisposed}`
    );

    // 3. Exactly 588,000 materials must be disposed (588 * 1,000)
    const expectedMaterialsDisposed = CYCLES * TOTAL_MATERIALS_PER_CYCLE;
    assert.strictEqual(
      totalMaterialsDisposed,
      expectedMaterialsDisposed,
      `Expected ${expectedMaterialsDisposed} materials disposed, got ${totalMaterialsDisposed}`
    );

    // 4. TextureCache count must remain strictly constant
    const finalCacheStats = getTextureCacheStats();
    assert.strictEqual(
      finalCacheStats.textureCount,
      initialCacheStats.textureCount,
      'Texture cache count must not balloon or leak during 1,000 rebuild cycles'
    );

    console.log(`\n  [STRESS BENCHMARK RESULTS - 5x5 Cube Rebuild]`);
    console.log(`  Cycles Completed:          ${CYCLES}`);
    console.log(`  Elapsed Time:              ${durationMs.toFixed(2)} ms (${(durationMs / CYCLES).toFixed(3)} ms/cycle)`);
    console.log(`  Geometries Disposed:       ${totalGeometriesDisposed} / ${CYCLES} (100.0%)`);
    console.log(`  Materials Disposed:        ${totalMaterialsDisposed} / ${expectedMaterialsDisposed} (100.0%)`);
    console.log(`  Shared Textures Disposed:  ${sharedTexturesDisposed} (0.0% - Perfectly Preserved)`);
    console.log(`  Cache Textures Count:      ${finalCacheStats.textureCount} (Constant)`);
    console.log(`  Heap Used Delta:           ${((memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024).toFixed(2)} MB\n`);
  });

  test('STRESS-BENCHMARK-2: 1,000 Megaminx rebuild cycles (12 pentagonal faces) produce 0 leaks', () => {
    const MEGAMINX_STICKERS = 132; // 12 faces * 11 stickers
    const CYCLES = 1000;

    let totalGeometriesDisposed = 0;
    let totalMaterialsDisposed = 0;
    let sharedTexturesDisposed = 0;

    const megaminxColors = Object.values(MEGAMINX_COLORS);
    // Warm up pentagonal textures
    megaminxColors.forEach(c => {
      const tex = getStickerTexture(c, { shape: 'pentagon' });
      const orig = tex.dispose.bind(tex);
      tex.dispose = () => {
        sharedTexturesDisposed++;
        orig();
      };
    });

    const initialCache = getTextureCacheStats();
    assert.strictEqual(initialCache.textureCount, 12);

    let currentMegaminx = null;
    const startTime = performance.now();

    for (let cycle = 0; cycle < CYCLES; cycle++) {
      if (currentMegaminx) {
        const stats = disposeHierarchy(currentMegaminx, { disposeSharedTextures: false });
        totalGeometriesDisposed += stats.geometriesDisposed;
        totalMaterialsDisposed += stats.materialsDisposed;
      }

      currentMegaminx = new THREE.Group();
      currentMegaminx.name = `megaminx_cycle_${cycle}`;

      // Shared pentagonal prism geometry per model
      const geom = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 5);

      for (let s = 0; s < MEGAMINX_STICKERS; s++) {
        const color = megaminxColors[s % megaminxColors.length];
        const mat = new THREE.MeshStandardMaterial({
          map: getStickerTexture(color, { shape: 'pentagon' }),
        });
        const mesh = new THREE.Mesh(geom, mat);
        currentMegaminx.add(mesh);
      }
    }

    // Dispose final Megaminx
    if (currentMegaminx) {
      const stats = disposeHierarchy(currentMegaminx, { disposeSharedTextures: false });
      totalGeometriesDisposed += stats.geometriesDisposed;
      totalMaterialsDisposed += stats.materialsDisposed;
    }

    const durationMs = performance.now() - startTime;

    assert.strictEqual(sharedTexturesDisposed, 0, 'Megaminx shared textures must not be disposed');
    assert.strictEqual(totalGeometriesDisposed, CYCLES);
    assert.strictEqual(totalMaterialsDisposed, CYCLES * MEGAMINX_STICKERS);
    assert.strictEqual(getTextureCacheStats().textureCount, 12);

    console.log(`\n  [STRESS BENCHMARK RESULTS - Megaminx Rebuild]`);
    console.log(`  Cycles Completed:          ${CYCLES}`);
    console.log(`  Elapsed Time:              ${durationMs.toFixed(2)} ms (${(durationMs / CYCLES).toFixed(3)} ms/cycle)`);
    console.log(`  Geometries Disposed:       ${totalGeometriesDisposed} / ${CYCLES} (100.0%)`);
    console.log(`  Materials Disposed:        ${totalMaterialsDisposed} / ${CYCLES * MEGAMINX_STICKERS} (100.0%)`);
    console.log(`  Shared Textures Disposed:  ${sharedTexturesDisposed} (0.0% - Perfectly Preserved)`);
    console.log(`  Cache Textures Count:      ${getTextureCacheStats().textureCount} (Constant)\n`);
  });

  test('STRESS-BENCHMARK-3: 1,000 7x7 Cube rebuild cycles (218 cubies, 1,308 materials per cycle) produce 0 leaks', () => {
    const CUBIES_7X7 = 218; // 343 total - 125 inner
    const MATERIALS_PER_CUBIE = 6;
    const TOTAL_MATERIALS_PER_CYCLE = CUBIES_7X7 * MATERIALS_PER_CUBIE; // 1,308 materials
    const CYCLES = 1000;

    let totalGeometriesDisposed = 0;
    let totalMaterialsDisposed = 0;
    let sharedTexturesDisposed = 0;

    const colors = Object.values(STICKER_COLORS);
    colors.forEach(c => {
      const tex = getStickerTexture(c);
      const orig = tex.dispose.bind(tex);
      tex.dispose = () => {
        sharedTexturesDisposed++;
        orig();
      };
    });

    let currentCube = null;
    const memBefore = process.memoryUsage();
    const startTime = performance.now();

    for (let cycle = 0; cycle < CYCLES; cycle++) {
      if (currentCube) {
        const stats = disposeHierarchy(currentCube, { disposeSharedTextures: false });
        totalGeometriesDisposed += stats.geometriesDisposed;
        totalMaterialsDisposed += stats.materialsDisposed;
      }

      currentCube = new THREE.Group();
      currentCube.name = `cube_7x7_cycle_${cycle}`;
      const geom = new THREE.BoxGeometry(0.94, 0.94, 0.94);

      for (let i = 0; i < CUBIES_7X7; i++) {
        const materials = [
          new THREE.MeshStandardMaterial({ map: getStickerTexture(STICKER_COLORS.RED) }),
          new THREE.MeshStandardMaterial({ map: getStickerTexture(STICKER_COLORS.ORANGE) }),
          new THREE.MeshStandardMaterial({ map: getStickerTexture(STICKER_COLORS.WHITE) }),
          new THREE.MeshStandardMaterial({ map: getStickerTexture(STICKER_COLORS.YELLOW) }),
          new THREE.MeshStandardMaterial({ map: getStickerTexture(STICKER_COLORS.GREEN) }),
          new THREE.MeshStandardMaterial({ map: getStickerTexture(STICKER_COLORS.BLUE) }),
        ];
        const cubie = new THREE.Mesh(geom, materials);
        currentCube.add(cubie);
      }
    }

    if (currentCube) {
      const stats = disposeHierarchy(currentCube, { disposeSharedTextures: false });
      totalGeometriesDisposed += stats.geometriesDisposed;
      totalMaterialsDisposed += stats.materialsDisposed;
    }

    const durationMs = performance.now() - startTime;
    const memAfter = process.memoryUsage();

    assert.strictEqual(sharedTexturesDisposed, 0, 'Shared textures must not be disposed during 7x7 rebuilds');
    assert.strictEqual(totalGeometriesDisposed, CYCLES);
    assert.strictEqual(totalMaterialsDisposed, CYCLES * TOTAL_MATERIALS_PER_CYCLE);
    assert.strictEqual(getTextureCacheStats().textureCount, colors.length);

    console.log(`\n  [STRESS BENCHMARK RESULTS - 7x7 Cube Rebuild]`);
    console.log(`  Cycles Completed:          ${CYCLES}`);
    console.log(`  Elapsed Time:              ${durationMs.toFixed(2)} ms (${(durationMs / CYCLES).toFixed(3)} ms/cycle)`);
    console.log(`  Geometries Disposed:       ${totalGeometriesDisposed} / ${CYCLES} (100.0%)`);
    console.log(`  Materials Disposed:        ${totalMaterialsDisposed} / ${CYCLES * TOTAL_MATERIALS_PER_CYCLE} (100.0%)`);
    console.log(`  Shared Textures Disposed:  ${sharedTexturesDisposed} (0.0% - Perfectly Preserved)`);
    console.log(`  Cache Textures Count:      ${getTextureCacheStats().textureCount} (Constant)`);
    console.log(`  Heap Used Delta:           ${((memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024).toFixed(2)} MB\n`);
  });

  test('STRESS-ADVERSARIAL-1: Mock Canvas 2D rendering pipeline exercises all shape, sheen, and disposal branches', () => {
    // Create mock 2D canvas context recording drawing calls
    const calls = [];
    const mockGradient = {
      addColorStop: (stop, color) => calls.push({ method: 'addColorStop', stop, color })
    };
    const mockCtx = {
      fillRect: (x, y, w, h) => calls.push({ method: 'fillRect', x, y, w, h }),
      beginPath: () => calls.push({ method: 'beginPath' }),
      closePath: () => calls.push({ method: 'closePath' }),
      moveTo: (x, y) => calls.push({ method: 'moveTo', x, y }),
      lineTo: (x, y) => calls.push({ method: 'lineTo', x, y }),
      quadraticCurveTo: (cpx, cpy, x, y) => calls.push({ method: 'quadraticCurveTo', cpx, cpy, x, y }),
      roundRect: (x, y, w, h, r) => calls.push({ method: 'roundRect', x, y, w, h, r }),
      fill: () => calls.push({ method: 'fill' }),
      stroke: () => calls.push({ method: 'stroke' }),
      createLinearGradient: (x0, y0, x1, y1) => {
        calls.push({ method: 'createLinearGradient', x0, y0, x1, y1 });
        return mockGradient;
      },
    };

    let createdCanvas = null;
    class MockOffscreenCanvas {
      constructor(w, h) {
        this.width = w;
        this.height = h;
        this.style = {};
        createdCanvas = this;
      }
      getContext(type) {
        return type === '2d' ? mockCtx : null;
      }
    }

    const origOffscreen = globalThis.OffscreenCanvas;
    globalThis.OffscreenCanvas = MockOffscreenCanvas;

    try {
      disposeTextureCache();

      // 1. Square shape with gloss and inner border
      const squareTex = getStickerTexture(STICKER_COLORS.WHITE, { shape: 'square' });
      assert.ok(squareTex);
      assert.ok(squareTex.image === createdCanvas, 'Texture should use canvas');
      assert.ok(calls.some(c => c.method === 'roundRect'), 'Should use roundRect');
      assert.ok(calls.some(c => c.method === 'createLinearGradient'), 'Should draw gloss sheen');

      // 2. Pentagon shape
      const pentagonTex = getStickerTexture(STICKER_COLORS.RED, { shape: 'pentagon' });
      assert.ok(pentagonTex);

      // 3. Triangle shape
      const triangleTex = getStickerTexture(STICKER_COLORS.BLUE, { shape: 'triangle' });
      assert.ok(triangleTex);

      // 4. Diamond shape
      const diamondTex = getStickerTexture(STICKER_COLORS.YELLOW, { shape: 'diamond' });
      assert.ok(diamondTex);

      // 5. Highlighted texture
      const hlTex = getStickerTexture(STICKER_COLORS.GREEN, { isHighlighted: true });
      assert.ok(hlTex);

      // 6. Test disposeTextureCache sets image width and height to 0 and clears image
      const purgeResult = disposeTextureCache();
      assert.strictEqual(purgeResult.disposedTextures, 5);
      assert.strictEqual(squareTex.image, null, 'Texture image reference must be nulled on disposal');
      assert.strictEqual(createdCanvas.width, 0, 'Canvas width must be zeroed on disposal');
      assert.strictEqual(createdCanvas.height, 0, 'Canvas height must be zeroed on disposal');
    } finally {
      globalThis.OffscreenCanvas = origOffscreen;
      disposeTextureCache();
    }
  });

  test('STRESS-ADVERSARIAL-2: Sparse material arrays and shared material preservation', () => {
    // 1. Sparse material array
    const mat1 = new THREE.MeshStandardMaterial();
    const mat2 = new THREE.MeshStandardMaterial();
    let mat1Disposed = false;
    let mat2Disposed = false;
    mat1.dispose = () => { mat1Disposed = true; };
    mat2.dispose = () => { mat2Disposed = true; };

    const sparseMesh = new THREE.Mesh(new THREE.BufferGeometry(), [mat1, null, undefined, mat2]);
    const stats1 = disposeHierarchy(sparseMesh);
    assert.strictEqual(mat1Disposed, true);
    assert.strictEqual(mat2Disposed, true);
    assert.strictEqual(stats1.materialsDisposed, 2);

    // 2. Shared material with userData.isShared = true
    const sharedMat = new THREE.MeshStandardMaterial();
    sharedMat.userData = { isShared: true };
    let sharedMatDisposed = false;
    sharedMat.dispose = () => { sharedMatDisposed = true; };

    const sharedMesh = new THREE.Mesh(new THREE.BufferGeometry(), sharedMat);

    // Default: disposeSharedMaterials = false -> must NOT dispose sharedMat
    const stats2 = disposeHierarchy(sharedMesh, { disposeSharedMaterials: false });
    assert.strictEqual(sharedMatDisposed, false, 'Shared material must not be disposed by default');
    assert.strictEqual(stats2.materialsDisposed, 0);

    // Forced: disposeSharedMaterials = true -> must dispose sharedMat
    const stats3 = disposeHierarchy(sharedMesh, { disposeSharedMaterials: true });
    assert.strictEqual(sharedMatDisposed, true, 'Shared material must be disposed when explicitly requested');
    assert.strictEqual(stats3.materialsDisposed, 1);
  });
});

