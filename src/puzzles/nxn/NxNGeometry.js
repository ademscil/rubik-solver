/**
 * src/puzzles/nxn/NxNGeometry.js
 * Universal NxN 3D Geometry Generator
 * 
 * Supports orders N in {2, 3, 4, 5, 6, 7}.
 * Produces exactly N^3 - (N-2)^3 visible cubies with shared geometry and materials.
 */

import * as THREE from 'three';
import { getStickerMaterial, getInternalCoreMaterial, STICKER_COLORS } from '../../engine/TextureCache.js';

export const CUBIE_PITCH = 1.0;
export const CUBIE_SIZE = 0.94;

/**
 * Validates whether an NxN order is supported.
 * @param {number} order
 */
export function validateOrder(order) {
  if (!Number.isInteger(order) || order < 2 || order > 7) {
    throw new RangeError(`NxN order must be an integer between 2 and 7. Received: ${order}`);
  }
}

/**
 * Computes the continuous 3D offset for layer index k in {0, ..., N-1}.
 * @param {number} k - Integer layer index
 * @param {number} N - Order of the cube
 * @param {number} [pitch=CUBIE_PITCH]
 * @returns {number}
 */
export function getLayerOffset(k, N, pitch = CUBIE_PITCH) {
  return (k - (N - 1) / 2) * pitch;
}

/**
 * Converts a continuous spatial position along an axis back to discrete layer index k in {0, ..., N-1}.
 * @param {number} pos - Position along the axis
 * @param {number} N - Order of the cube
 * @param {number} [pitch=CUBIE_PITCH]
 * @returns {number}
 */
export function getLayerIndexFromPos(pos, N, pitch = CUBIE_PITCH) {
  const half = (N - 1) / 2;
  const k = Math.round(pos / pitch + half);
  return Math.max(0, Math.min(N - 1, k));
}

/**
 * Determines if cubie (i, j, k) is internal and should be culled.
 * @param {number} i - X layer index
 * @param {number} j - Y layer index
 * @param {number} k - Z layer index
 * @param {number} N - Order of the cube
 * @returns {boolean}
 */
export function isInternalCubie(i, j, k, N) {
  return (
    i > 0 && i < N - 1 &&
    j > 0 && j < N - 1 &&
    k > 0 && k < N - 1
  );
}

/**
 * Classifies a cubie into 'corner', 'edge' (wing), or 'center'.
 * @param {number} i
 * @param {number} j
 * @param {number} k
 * @param {number} N
 * @returns {'corner' | 'edge' | 'center' | 'internal'}
 */
export function classifyCubie(i, j, k, N) {
  if (isInternalCubie(i, j, k, N)) return 'internal';
  const boundaryCount =
    (i === 0 || i === N - 1 ? 1 : 0) +
    (j === 0 || j === N - 1 ? 1 : 0) +
    (k === 0 || k === N - 1 ? 1 : 0);

  if (boundaryCount === 3) return 'corner';
  if (boundaryCount === 2) return 'edge';
  return 'center';
}

/**
 * Generates the unified 3D mesh hierarchy for any NxN cube.
 * 
 * @param {number} order - Cube order (2, 3, 4, 5, 6, 7)
 * @param {Object} [options]
 * @param {number} [options.pitch=CUBIE_PITCH]
 * @param {number} [options.size=CUBIE_SIZE]
 * @returns {THREE.Group}
 */
export function buildNxNModel(order, options = {}) {
  validateOrder(order);
  const pitch = options.pitch ?? CUBIE_PITCH;
  const size = options.size ?? CUBIE_SIZE;

  const group = new THREE.Group();
  group.name = `cube-${order}x${order}-model`;
  group.userData = {
    order,
    pitch,
    size,
    isNxN: true
  };

  // 1. Singleton shared geometry buffer for all cubies in this model
  const sharedGeometry = new THREE.BoxGeometry(size, size, size);

  // 2. Shared standard vinyl materials pool (userData.isShared = true)
  const matR = getStickerMaterial(STICKER_COLORS.RED);
  const matL = getStickerMaterial(STICKER_COLORS.ORANGE);
  const matU = getStickerMaterial(STICKER_COLORS.WHITE);
  const matD = getStickerMaterial(STICKER_COLORS.YELLOW);
  const matF = getStickerMaterial(STICKER_COLORS.GREEN);
  const matB = getStickerMaterial(STICKER_COLORS.BLUE);
  const matCore = getInternalCoreMaterial();

  const cubies = [];

  for (let i = 0; i < order; i++) {
    for (let j = 0; j < order; j++) {
      for (let k = 0; k < order; k++) {
        // Cull internal pieces: N^3 - (N-2)^3 visible pieces
        if (isInternalCubie(i, j, k, order)) {
          continue;
        }

        // Materials: [+X: R, -X: L, +Y: U, -Y: D, +Z: F, -Z: B]
        const materials = [
          i === order - 1 ? matR : matCore,
          i === 0 ? matL : matCore,
          j === order - 1 ? matU : matCore,
          j === 0 ? matD : matCore,
          k === order - 1 ? matF : matCore,
          k === 0 ? matB : matCore
        ];

        const mesh = new THREE.Mesh(sharedGeometry, materials);
        const posX = getLayerOffset(i, order, pitch);
        const posY = getLayerOffset(j, order, pitch);
        const posZ = getLayerOffset(k, order, pitch);

        mesh.position.set(posX, posY, posZ);
        mesh.name = `cubie_${i}_${j}_${k}`;
        mesh.userData = {
          order,
          cubieIndex: cubies.length,
          initialLayerX: i,
          initialLayerY: j,
          initialLayerZ: k,
          layerX: i,
          layerY: j,
          layerZ: k,
          gridPos: {
            x: posX / pitch,
            y: posY / pitch,
            z: posZ / pitch
          },
          pieceType: classifyCubie(i, j, k, order)
        };

        group.add(mesh);
        cubies.push(mesh);
      }
    }
  }

  group.userData.cubies = cubies;
  group.updateMatrixWorld(true);
  return group;
}
