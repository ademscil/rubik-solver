/**
 * Automated Unit Tests for TextureCache and DisposalPipeline (Features F02, F03)
 * Location: tests/unit/textureDisposal.test.js
 * Runner: node --test
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  getStickerTexture,
  getStickerMaterial,
  getInternalCoreMaterial,
  normalizeHexColor,
  disposeTextureCache,
  getTextureCacheStats,
  STICKER_COLORS,
  MEGAMINX_COLORS
} from '../../src/engine/TextureCache.js';
import {
  disposeGeometry,
  disposeMaterial,
  disposeHierarchy,
  disposeScene
} from '../../src/engine/DisposalPipeline.js';

describe('Feature F02: Shared Texture Atlas & Cache', () => {
  beforeEach(() => {
    disposeTextureCache();
  });

  test('normalizeHexColor formats valid 6-char, 3-char, and handles invalid inputs gracefully', () => {
    assert.equal(normalizeHexColor('#009b48'), '#009B48');
    assert.equal(normalizeHexColor('009b48'), '#009B48');
    assert.equal(normalizeHexColor('#fff'), '#FFFFFF');
    assert.equal(normalizeHexColor('123'), '#112233');
    assert.equal(normalizeHexColor('invalid'), '#FFFFFF');
    assert.equal(normalizeHexColor(null), '#FFFFFF');
    assert.equal(normalizeHexColor(undefined), '#FFFFFF');
  });

  test('returns identical texture instance when requesting identical color and options', () => {
    const tex1 = getStickerTexture(STICKER_COLORS.GREEN);
    const tex2 = getStickerTexture('#009B48');
    assert.equal(tex1, tex2, 'Texture instances must be shared and identical');
    assert.equal(tex1.userData.isShared, true);

    const stats = getTextureCacheStats();
    assert.equal(stats.textureCount, 1);
  });

  test('creates separate textures for different shapes and highlight states', () => {
    const squareTex = getStickerTexture(STICKER_COLORS.RED, { shape: 'square' });
    const pentagonTex = getStickerTexture(STICKER_COLORS.RED, { shape: 'pentagon' });
    const highlightedTex = getStickerTexture(STICKER_COLORS.RED, { shape: 'square', isHighlighted: true });

    assert.notEqual(squareTex, pentagonTex);
    assert.notEqual(squareTex, highlightedTex);

    const stats = getTextureCacheStats();
    assert.equal(stats.textureCount, 3);
  });

  test('material caching reuses MeshStandardMaterial instances', () => {
    const mat1 = getStickerMaterial(STICKER_COLORS.BLUE);
    const mat2 = getStickerMaterial('#0046AD');
    assert.equal(mat1, mat2);
    assert.equal(mat1.userData.isShared, true);

    const core1 = getInternalCoreMaterial();
    const core2 = getInternalCoreMaterial(STICKER_COLORS.CORE);
    assert.equal(core1, core2);
  });

  test('disposeTextureCache purges all textures and materials cleanly', () => {
    getStickerTexture(STICKER_COLORS.WHITE);
    getStickerTexture(MEGAMINX_COLORS.PURPLE);
    getStickerMaterial(STICKER_COLORS.YELLOW);

    const before = getTextureCacheStats();
    assert.ok(before.textureCount >= 2);
    assert.ok(before.materialCount >= 1);

    const result = disposeTextureCache();
    assert.ok(result.disposedTextures >= 2);
    assert.ok(result.disposedMaterials >= 1);

    const after = getTextureCacheStats();
    assert.equal(after.textureCount, 0);
    assert.equal(after.materialCount, 0);
  });
});

describe('Feature F03: WebGL Resource Disposal Pipeline', () => {
  test('null-safe execution for null or undefined arguments', () => {
    assert.equal(disposeGeometry(null), false);
    assert.equal(disposeGeometry(undefined), false);

    const matResult = disposeMaterial(null);
    assert.equal(matResult.materialsDisposed, 0);

    const hierResult = disposeHierarchy(null);
    assert.equal(hierResult.objectsProcessed, 0);

    const sceneResult = disposeScene(null);
    assert.equal(sceneResult.rendererDisposed, false);
  });

  test('disposes geometry and unshared materials in a hierarchy', () => {
    let geomDisposed = false;
    let matDisposed = false;

    const geom = new THREE.BufferGeometry();
    geom.dispose = () => { geomDisposed = true; };

    const mat = new THREE.MeshStandardMaterial();
    mat.dispose = () => { matDisposed = true; };

    const mesh = new THREE.Mesh(geom, mat);
    const group = new THREE.Group();
    group.add(mesh);

    const stats = disposeHierarchy(group, { disposeSharedMaterials: true });
    assert.equal(stats.geometriesDisposed, 1);
    assert.equal(stats.materialsDisposed, 1);
    assert.equal(geomDisposed, true);
    assert.equal(matDisposed, true);
    assert.equal(group.children.length, 0, 'Children must be detached');
  });

  test('protects shared textures from disposal during normal puzzle switching', () => {
    let textureDisposed = false;
    const sharedTex = new THREE.Texture();
    sharedTex.userData = { isShared: true };
    sharedTex.dispose = () => { textureDisposed = true; };

    const mat = new THREE.MeshStandardMaterial({ map: sharedTex });
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);

    // Standard switch: disposeSharedTextures = false (default)
    disposeHierarchy(mesh, { disposeSharedTextures: false });
    assert.equal(textureDisposed, false, 'Shared texture must NOT be disposed during puzzle switch');

    // Forced teardown: disposeSharedTextures = true
    disposeHierarchy(mesh, { disposeSharedTextures: true });
    assert.equal(textureDisposed, true, 'Shared texture should be disposed when explicitly requested');
  });

  test('disposes multi-material arrays attached to cubie meshes', () => {
    let disposedCount = 0;
    const materials = Array.from({ length: 6 }, () => {
      const m = new THREE.MeshStandardMaterial();
      m.dispose = () => { disposedCount++; };
      return m;
    });

    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), materials);
    const stats = disposeHierarchy(mesh);

    assert.equal(stats.materialsDisposed, 6);
    assert.equal(disposedCount, 6);
  });
});
