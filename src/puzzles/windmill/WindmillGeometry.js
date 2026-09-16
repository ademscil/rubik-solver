/**
 * src/puzzles/windmill/WindmillGeometry.js
 * 3D Geometry and Model Generator for Windmill Cube (Katsuhiko Okamoto 2003)
 * 
 * Anatomy:
 * - 3x3x3 shape modification where the vertical cuts are rotated by arctan(1/2) ≈ 26.565° around Y.
 * - Produces 26 solid sculpted prisms in 9 vertical columns:
 *   - 1 rotated square center column (diamond on U/D)
 *   - 4 skewed trapezoidal edge columns
 *   - 4 triangular corner columns
 * - Total 54 outer stickers (9 per face on U, D, F, B, R, L)
 * - Uses standard NxN kinematics for smooth 60 FPS shape-shifting layer rotations
 */

import * as THREE from 'three';
import { getStickerMaterial, getInternalCoreMaterial, STICKER_COLORS } from '../../engine/TextureCache.js';

export const WINDMILL_COLORS = {
  U: { name: 'Putih (Atas)', hex: '#FFFFFF', code: 'U' },
  D: { name: 'Kuning (Bawah)', hex: '#FFD500', code: 'D' },
  F: { name: 'Hijau (Depan)', hex: '#00D800', code: 'F' },
  B: { name: 'Biru (Belakang)', hex: '#0051FF', code: 'B' },
  R: { name: 'Merah (Kanan)', hex: '#FF0000', code: 'R' },
  L: { name: 'Oranye (Kiri)', hex: '#FF8C00', code: 'L' }
};

const W = 1.44; // Half-width of outer cube envelope
const H = 0.94; // Height of each layer
const THETA = Math.atan(0.5); // 26.565° Okamoto rotation
const COS_T = Math.cos(THETA);
const SIN_T = Math.sin(THETA);
const CUT_OFFSET = 0.48; // Boundary offset of inner cuts

function toWorld(u, v) {
  return { x: COS_T * u - SIN_T * v, z: SIN_T * u + COS_T * v };
}

function clipPolygon(poly, nx, nz, dVal) {
  const out = [];
  const len = poly.length;
  for (let i = 0; i < len; i++) {
    const curr = poly[i];
    const prev = poly[(i + len - 1) % len];
    const currIn = (nx * curr.x + nz * curr.z) <= dVal + 1e-7;
    const prevIn = (nx * prev.x + nz * prev.z) <= dVal + 1e-7;

    if (currIn) {
      if (!prevIn) {
        const d1 = (nx * prev.x + nz * prev.z) - dVal;
        const d2 = (nx * curr.x + nz * curr.z) - dVal;
        const t = d1 / (d1 - d2);
        out.push({
          x: prev.x + t * (curr.x - prev.x),
          z: prev.z + t * (curr.z - prev.z)
        });
      }
      out.push(curr);
    } else if (prevIn) {
      const d1 = (nx * prev.x + nz * prev.z) - dVal;
      const d2 = (nx * curr.x + nz * curr.z) - dVal;
      const t = d1 / (d1 - d2);
      out.push({
        x: prev.x + t * (curr.x - prev.x),
        z: prev.z + t * (curr.z - prev.z)
      });
    }
  }
  return out;
}

/**
 * Precomputes the 2D cross-section polygons for all 9 vertical columns of the Windmill Cube.
 */
function computeColumnPolygons() {
  const big = 4.0;
  const columnMap = {};

  for (let iu = -1; iu <= 1; iu++) {
    for (let iv = -1; iv <= 1; iv++) {
      const uMin = iu === -1 ? -big : iu === 0 ? -CUT_OFFSET : CUT_OFFSET;
      const uMax = iu === -1 ? -CUT_OFFSET : iu === 0 ? CUT_OFFSET : big;
      const vMin = iv === -1 ? -big : iv === 0 ? -CUT_OFFSET : CUT_OFFSET;
      const vMax = iv === -1 ? -CUT_OFFSET : iv === 0 ? CUT_OFFSET : big;

      let poly = [
        toWorld(uMin, vMin),
        toWorld(uMax, vMin),
        toWorld(uMax, vMax),
        toWorld(uMin, vMax)
      ];

      // Clip against outer cube boundaries
      poly = clipPolygon(poly, 1, 0, W);
      poly = clipPolygon(poly, -1, 0, W);
      poly = clipPolygon(poly, 0, 1, W);
      poly = clipPolygon(poly, 0, -1, W);

      let cx = 0;
      let cz = 0;
      poly.forEach(p => { cx += p.x; cz += p.z; });
      cx /= poly.length;
      cz /= poly.length;
      const gx = Math.round(cx);
      const gz = Math.round(cz);

      columnMap[`${gx}_${gz}`] = poly;
    }
  }
  return columnMap;
}

const COLUMN_POLYGONS = computeColumnPolygons();

/**
 * Builds a solid extruded 3D prism BufferGeometry with correct material groups for a Windmill cubie.
 * 
 * Material index mapping:
 * 0: Right (Red)
 * 1: Left (Orange)
 * 2: Up (White)
 * 3: Down (Yellow)
 * 4: Front (Green)
 * 5: Back (Blue)
 * 6: Internal Plastic Core (#181820)
 */
function buildPrismGeometry(worldPoly, gx, gy, gz) {
  const geom = new THREE.BufferGeometry();
  const N = worldPoly.length;
  const localPoly = worldPoly.map(p => ({ x: p.x - gx, z: p.z - gz }));

  const positions = [];
  const normals = [];
  const indices = [];

  const halfH = H / 2;

  // 1. Top cap (pointing +Y)
  const topStartIdx = positions.length / 3;
  localPoly.forEach(p => {
    positions.push(p.x, halfH, p.z);
    normals.push(0, 1, 0);
  });
  const topIndexStart = indices.length;
  for (let i = 1; i < N - 1; i++) {
    indices.push(topStartIdx, topStartIdx + i, topStartIdx + i + 1);
  }
  const topCount = indices.length - topIndexStart;
  geom.addGroup(topIndexStart, topCount, gy === 1 ? 2 : 6);

  // 2. Bottom cap (pointing -Y)
  const botStartIdx = positions.length / 3;
  localPoly.forEach(p => {
    positions.push(p.x, -halfH, p.z);
    normals.push(0, -1, 0);
  });
  const botIndexStart = indices.length;
  for (let i = 1; i < N - 1; i++) {
    indices.push(botStartIdx, botStartIdx + i + 1, botStartIdx + i);
  }
  const botCount = indices.length - botIndexStart;
  geom.addGroup(botIndexStart, botCount, gy === -1 ? 3 : 6);

  // 3. Side walls
  for (let i = 0; i < N; i++) {
    const p1 = localPoly[i];
    const p2 = localPoly[(i + 1) % N];
    const wp1 = worldPoly[i];
    const wp2 = worldPoly[(i + 1) % N];

    const midX = (wp1.x + wp2.x) / 2;
    const midZ = (wp1.z + wp2.z) / 2;

    let matIdx = 6;
    if (Math.abs(midX - W) < 0.01) matIdx = 0;
    else if (Math.abs(midX - (-W)) < 0.01) matIdx = 1;
    else if (Math.abs(midZ - W) < 0.01) matIdx = 4;
    else if (Math.abs(midZ - (-W)) < 0.01) matIdx = 5;

    const dx = p2.x - p1.x;
    const dz = p2.z - p1.z;
    const len = Math.hypot(dx, dz) || 1;
    const nx = dz / len;
    const nz = -dx / len;

    const baseIdx = positions.length / 3;
    positions.push(p1.x, halfH, p1.z); normals.push(nx, 0, nz);
    positions.push(p2.x, halfH, p2.z); normals.push(nx, 0, nz);
    positions.push(p2.x, -halfH, p2.z); normals.push(nx, 0, nz);
    positions.push(p1.x, -halfH, p1.z); normals.push(nx, 0, nz);

    const sideIndexStart = indices.length;
    indices.push(baseIdx, baseIdx + 1, baseIdx + 2);
    indices.push(baseIdx, baseIdx + 2, baseIdx + 3);
    geom.addGroup(sideIndexStart, 6, matIdx);
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geom.setIndex(indices);
  return geom;
}

/**
 * Builds the complete 3D Three.js Windmill Cube model group with 26 sculpted pieces.
 * 
 * @param {Object} [options]
 * @returns {THREE.Group}
 */
export function buildWindmillModel(options = {}) {
  const group = new THREE.Group();
  group.name = 'windmill-model';
  group.userData = {
    order: 3,
    pitch: 1.0,
    size: 0.94,
    isNxN: true,
    isWindmill: true,
    puzzleType: 'windmill'
  };

  const matR = getStickerMaterial(STICKER_COLORS.RED);
  const matL = getStickerMaterial(STICKER_COLORS.ORANGE);
  const matU = getStickerMaterial(STICKER_COLORS.WHITE);
  const matD = getStickerMaterial(STICKER_COLORS.YELLOW);
  const matF = getStickerMaterial(STICKER_COLORS.GREEN);
  const matB = getStickerMaterial(STICKER_COLORS.BLUE);
  const matCore = getInternalCoreMaterial();

  const materials = [matR, matL, matU, matD, matF, matB, matCore];
  const cubies = [];

  for (let gx = -1; gx <= 1; gx++) {
    for (let gy = -1; gy <= 1; gy++) {
      for (let gz = -1; gz <= 1; gz++) {
        // Skip hidden internal core
        if (gx === 0 && gy === 0 && gz === 0) continue;

        const poly = COLUMN_POLYGONS[`${gx}_${gz}`];
        if (!poly) continue;

        const geom = buildPrismGeometry(poly, gx, gy, gz);
        const mesh = new THREE.Mesh(geom, materials);

        mesh.position.set(gx, gy, gz);
        mesh.name = `cubie_${gx + 1}_${gy + 1}_${gz + 1}`;
        mesh.userData = {
          order: 3,
          cubieIndex: cubies.length,
          initialLayerX: gx + 1,
          initialLayerY: gy + 1,
          initialLayerZ: gz + 1,
          layerX: gx + 1,
          layerY: gy + 1,
          layerZ: gz + 1,
          gridPos: { x: gx, y: gy, z: gz }
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
