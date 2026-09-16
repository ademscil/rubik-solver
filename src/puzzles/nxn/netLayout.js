/**
 * src/puzzles/nxn/netLayout.js
 * 2D Cross Net Layout Descriptors & Bidirectional State Synchronization for NxN Cubes (N=2..7)
 */

import { getStickerTexture, STICKER_COLORS } from '../../engine/TextureCache.js';

/**
 * Creates a specification-compliant NetLayoutConfig for any NxN cube.
 * 
 * @param {number} order - Cube dimension (2, 3, 4, 5, 6, 7)
 * @returns {import('../types.js').NetLayoutConfig}
 */
export function createCubicNetLayout(order) {
  const stickersPerFace = order * order;
  const isOdd = order % 2 !== 0;
  const centerIndex = isOdd ? Math.floor(stickersPerFace / 2) : null;

  const faceNames = {
    U: 'Atas (Putih)',
    L: 'Kiri (Oranye)',
    F: 'Depan (Hijau)',
    R: 'Kanan (Merah)',
    B: 'Belakang (Biru)',
    D: 'Bawah (Kuning)'
  };

  const facesConfig = {
    U: { id: 'U', name: faceNames.U, row: 0, col: 1, rows: order, cols: order, shape: 'square' },
    L: { id: 'L', name: faceNames.L, row: 1, col: 0, rows: order, cols: order, shape: 'square' },
    F: { id: 'F', name: faceNames.F, row: 1, col: 1, rows: order, cols: order, shape: 'square' },
    R: { id: 'R', name: faceNames.R, row: 1, col: 2, rows: order, cols: order, shape: 'square' },
    B: { id: 'B', name: faceNames.B, row: 1, col: 3, rows: order, cols: order, shape: 'square' },
    D: { id: 'D', name: faceNames.D, row: 2, col: 1, rows: order, cols: order, shape: 'square' }
  };

  // Dual-compatibility: Array with named keys
  const faceList = ['U', 'L', 'F', 'R', 'B', 'D'];
  Object.keys(facesConfig).forEach(k => {
    faceList[k] = facesConfig[k];
  });

  return Object.freeze({
    type: 'cubic-cross',
    gridDimension: order,
    stickersPerFace,
    hasFixedCenter: isOdd,
    centerIndex,
    gridWidth: 4,
    gridHeight: 3,
    faces: faceList
  });
}

/**
 * Updates a mesh face material with a new color, cloning if currently shared.
 * 
 * @param {THREE.Mesh} mesh
 * @param {number} faceIndex
 * @param {string} hexColor
 */
function updateMeshFaceColor(mesh, faceIndex, hexColor) {
  if (!mesh || !mesh.material) return;
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  let mat = materials[faceIndex];
  if (!mat) return;

  if (mat.userData && mat.userData.isShared) {
    mat = mat.clone();
    mat.userData = { ...mat.userData, isShared: false };
    materials[faceIndex] = mat;
    mesh.material = materials;
  }

  mat.map = getStickerTexture(hexColor);
  mat.userData.hexColor = hexColor;
  mat.userData.cacheKey = hexColor;
  mat.needsUpdate = true;
}

/**
 * Applies a 2D Net state dictionary onto a 3D Three.js cube model.
 * 
 * @param {THREE.Group} group
 * @param {Record<string, string[]>} netState
 * @param {number} order
 */
export function applyNetStateToNxN(group, netState, order) {
  if (!group || !netState) return;
  const half = (order - 1) / 2;

  group.traverse((child) => {
    if (child.isMesh && child.userData) {
      const x = child.userData.gridPos ? child.userData.gridPos.x : (child.position.x);
      const y = child.userData.gridPos ? child.userData.gridPos.y : (child.position.y);
      const z = child.userData.gridPos ? child.userData.gridPos.z : (child.position.z);

      // 0: +X (Right)
      if (Math.abs(x - half) < 0.001 && netState.R) {
        const c = Math.round(half - z);
        const r = Math.round(half - y);
        const hex = netState.R[r * order + c];
        if (hex) updateMeshFaceColor(child, 0, hex);
      }
      // 1: -X (Left)
      if (Math.abs(x - (-half)) < 0.001 && netState.L) {
        const c = Math.round(z + half);
        const r = Math.round(half - y);
        const hex = netState.L[r * order + c];
        if (hex) updateMeshFaceColor(child, 1, hex);
      }
      // 2: +Y (Up)
      if (Math.abs(y - half) < 0.001 && netState.U) {
        const c = Math.round(x + half);
        const r = Math.round(z + half);
        const hex = netState.U[r * order + c];
        if (hex) updateMeshFaceColor(child, 2, hex);
      }
      // 3: -Y (Down)
      if (Math.abs(y - (-half)) < 0.001 && netState.D) {
        const c = Math.round(x + half);
        const r = Math.round(half - z);
        const hex = netState.D[r * order + c];
        if (hex) updateMeshFaceColor(child, 3, hex);
      }
      // 4: +Z (Front)
      if (Math.abs(z - half) < 0.001 && netState.F) {
        const c = Math.round(x + half);
        const r = Math.round(half - y);
        const hex = netState.F[r * order + c];
        if (hex) updateMeshFaceColor(child, 4, hex);
      }
      // 5: -Z (Back)
      if (Math.abs(z - (-half)) < 0.001 && netState.B) {
        const c = Math.round(half - x);
        const r = Math.round(half - y);
        const hex = netState.B[r * order + c];
        if (hex) updateMeshFaceColor(child, 5, hex);
      }
    }
  });
}

/**
 * Extracts 2D Net sticker colors from a 3D Three.js cube model.
 * 
 * @param {THREE.Group} group
 * @param {number} order
 * @param {Record<string, { hex: string }>} defaultColors
 * @returns {Record<string, string[]>}
 */
export function extractNetStateFromNxN(group, order, defaultColors) {
  const stickersCount = order * order;
  const state = {
    U: Array(stickersCount).fill(defaultColors?.U?.hex || STICKER_COLORS.WHITE),
    D: Array(stickersCount).fill(defaultColors?.D?.hex || STICKER_COLORS.YELLOW),
    F: Array(stickersCount).fill(defaultColors?.F?.hex || STICKER_COLORS.GREEN),
    B: Array(stickersCount).fill(defaultColors?.B?.hex || STICKER_COLORS.BLUE),
    L: Array(stickersCount).fill(defaultColors?.L?.hex || STICKER_COLORS.ORANGE),
    R: Array(stickersCount).fill(defaultColors?.R?.hex || STICKER_COLORS.RED)
  };

  if (!group) return state;
  const half = (order - 1) / 2;

  group.traverse((child) => {
    if (child.isMesh && child.userData) {
      const x = child.userData.gridPos ? child.userData.gridPos.x : (child.position.x);
      const y = child.userData.gridPos ? child.userData.gridPos.y : (child.position.y);
      const z = child.userData.gridPos ? child.userData.gridPos.z : (child.position.z);
      const materials = Array.isArray(child.material) ? child.material : [child.material];

      if (Math.abs(x - half) < 0.001 && materials[0]?.userData?.hexColor) {
        const c = Math.round(half - z);
        const r = Math.round(half - y);
        state.R[r * order + c] = materials[0].userData.hexColor;
      }
      if (Math.abs(x - (-half)) < 0.001 && materials[1]?.userData?.hexColor) {
        const c = Math.round(z + half);
        const r = Math.round(half - y);
        state.L[r * order + c] = materials[1].userData.hexColor;
      }
      if (Math.abs(y - half) < 0.001 && materials[2]?.userData?.hexColor) {
        const c = Math.round(x + half);
        const r = Math.round(z + half);
        state.U[r * order + c] = materials[2].userData.hexColor;
      }
      if (Math.abs(y - (-half)) < 0.001 && materials[3]?.userData?.hexColor) {
        const c = Math.round(x + half);
        const r = Math.round(half - z);
        state.D[r * order + c] = materials[3].userData.hexColor;
      }
      if (Math.abs(z - half) < 0.001 && materials[4]?.userData?.hexColor) {
        const c = Math.round(x + half);
        const r = Math.round(half - y);
        state.F[r * order + c] = materials[4].userData.hexColor;
      }
      if (Math.abs(z - (-half)) < 0.001 && materials[5]?.userData?.hexColor) {
        const c = Math.round(half - x);
        const r = Math.round(half - y);
        state.B[r * order + c] = materials[5].userData.hexColor;
      }
    }
  });

  return state;
}
