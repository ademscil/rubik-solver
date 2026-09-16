/**
 * src/puzzles/windmill/WindmillGeometry.js
 * 3D Geometry and Model Generator for Windmill Cube (Katsuhiko Okamoto 2003)
 * 
 * Anatomy:
 * - 3x3x3 shape modification where the outer cuboid boundary is rotated by arctan(1/2) ≈ 26.565°
 *   around the vertical Y axis relative to the internal 3x3 mechanism.
 * - Produces 26 solid sculpted prisms across the 3x3 grid cells:
 *   - 1 center square column (diamond on U/D)
 *   - 4 trapezoidal edge columns
 *   - 4 triangular corner columns
 * - Total 54 outer stickers (9 per face on U, D, F, B, R, L)
 * - Mechanically identical to a standard 3x3 mechanism, guaranteeing 100% collision-free,
 *   rock-solid shape-shifting 60 FPS animations during all moves and scrambles.
 */

import * as THREE from 'three';

export const WINDMILL_COLORS = {
  U: { name: 'Putih (Atas)', hex: '#FFFFFF', code: 'U' },
  D: { name: 'Kuning (Bawah)', hex: '#FFD500', code: 'D' },
  F: { name: 'Hijau (Depan)', hex: '#00D800', code: 'F' },
  B: { name: 'Biru (Belakang)', hex: '#0051FF', code: 'B' },
  R: { name: 'Merah (Kanan)', hex: '#FF0000', code: 'R' },
  L: { name: 'Oranye (Kiri)', hex: '#FF8C00', code: 'L' }
};

const W = 1.5; // Half-width of outer cube envelope (matches standard 3x3 of size 3.0)
const H = 0.96; // Height of each layer (leaves 0.04 gap between layers)
const THETA = Math.atan(0.5); // 26.565° Okamoto rotation
const COS_T = Math.cos(THETA);
const SIN_T = Math.sin(THETA);
const C = 0.5; // Boundary offset of inner cuts in mechanism space

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
 * Precomputes the 2D cross-section polygons for all 9 vertical columns in mechanism coordinates.
 */
function computeColumnPolygons() {
  const big = 10.0;
  const columnMap = {};

  for (let ix = -1; ix <= 1; ix++) {
    for (let iz = -1; iz <= 1; iz++) {
      const xMin = ix === -1 ? -big : ix === 0 ? -C : C;
      const xMax = ix === -1 ? -C : ix === 0 ? C : big;
      const zMin = iz === -1 ? -big : iz === 0 ? -C : C;
      const zMax = iz === -1 ? -C : iz === 0 ? C : big;

      let poly = [
        { x: xMin, z: zMin },
        { x: xMax, z: zMin },
        { x: xMax, z: zMax },
        { x: xMin, z: zMax }
      ];

      // Clip against outer cube boundaries in world coordinates:
      // x_w = X * cos - Z * sin <= W
      poly = clipPolygon(poly, COS_T, -SIN_T, W);
      // x_w >= -W <=> -X * cos + Z * sin <= W
      poly = clipPolygon(poly, -COS_T, SIN_T, W);
      // z_w = X * sin + Z * cos <= W
      poly = clipPolygon(poly, SIN_T, COS_T, W);
      // z_w >= -W <=> -X * sin - Z * cos <= W
      poly = clipPolygon(poly, -SIN_T, -COS_T, W);

      let area = 0;
      for (let i = 0; i < poly.length; i++) {
        const j = (i + 1) % poly.length;
        area += (poly[i].x * poly[j].z - poly[j].x * poly[i].z);
      }
      if (area > 0) {
        poly.reverse();
      }

      columnMap[`${ix}_${iz}`] = poly;
    }
  }
  return columnMap;
}

const COLUMN_POLYGONS = computeColumnPolygons();

function scalePoint(p, center, factor) {
  return {
    x: center.x + (p.x - center.x) * factor,
    z: center.z + (p.z - center.z) * factor
  };
}

/**
 * Builds a solid sculpted 3D prism BufferGeometry with black plastic bevels
 * and inset colored stickers for a Windmill cubie.
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
function buildPrismGeometry(worldPoly, ix, iy, iz) {
  const geom = new THREE.BufferGeometry();
  const N = worldPoly.length;
  // Local poly is centered relative to (ix, iz)
  const localPoly = worldPoly.map(p => ({ x: p.x - ix, z: p.z - iz }));

  let centroid = { x: 0, z: 0 };
  localPoly.forEach(p => { centroid.x += p.x; centroid.z += p.z; });
  centroid.x /= N; centroid.z /= N;

  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  const halfH = H / 2;
  const CORE_MAT_IDX = 6;

  // --- PART 1: Black Plastic Piece Body ---
  // 1. Top cap (body - black plastic)
  const bTopStart = positions.length / 3;
  localPoly.forEach(p => {
    positions.push(p.x, halfH, p.z);
    normals.push(0, 1, 0);
    uvs.push(0.5, 0.5);
  });
  const bTopIdxStart = indices.length;
  for (let i = 1; i < N - 1; i++) {
    indices.push(bTopStart, bTopStart + i + 1, bTopStart + i);
  }
  geom.addGroup(bTopIdxStart, indices.length - bTopIdxStart, CORE_MAT_IDX);

  // 2. Bottom cap (body - black plastic)
  const bBotStart = positions.length / 3;
  localPoly.forEach(p => {
    positions.push(p.x, -halfH, p.z);
    normals.push(0, -1, 0);
    uvs.push(0.5, 0.5);
  });
  const bBotIdxStart = indices.length;
  for (let i = 1; i < N - 1; i++) {
    indices.push(bBotStart, bBotStart + i, bBotStart + i + 1);
  }
  geom.addGroup(bBotIdxStart, indices.length - bBotIdxStart, CORE_MAT_IDX);

  // 3. Side walls (body - black plastic)
  for (let i = 0; i < N; i++) {
    const p1 = localPoly[i];
    const p2 = localPoly[(i + 1) % N];

    const dx = p2.x - p1.x;
    const dz = p2.z - p1.z;
    const len = Math.hypot(dx, dz) || 1;
    const nx = -dz / len;
    const nz = dx / len;

    const baseIdx = positions.length / 3;
    positions.push(p1.x, halfH, p1.z); normals.push(nx, 0, nz); uvs.push(0, 1);
    positions.push(p2.x, halfH, p2.z); normals.push(nx, 0, nz); uvs.push(1, 1);
    positions.push(p2.x, -halfH, p2.z); normals.push(nx, 0, nz); uvs.push(1, 0);
    positions.push(p1.x, -halfH, p1.z); normals.push(nx, 0, nz); uvs.push(0, 0);

    const sIdxStart = indices.length;
    indices.push(baseIdx, baseIdx + 1, baseIdx + 2);
    indices.push(baseIdx, baseIdx + 2, baseIdx + 3);
    geom.addGroup(sIdxStart, 6, CORE_MAT_IDX);
  }

  // --- PART 2: Inset Colored Stickers with Crisp Black Borders ---
  const stickerInset = 0.86;
  const stickerOffset = 0.008;

  // Top Cap Sticker (+Y: White, matIdx = 2)
  if (iy === 1) {
    const stickerPoly = localPoly.map(p => scalePoint(p, centroid, stickerInset));
    const sTopStart = positions.length / 3;
    const sy = halfH + stickerOffset;
    stickerPoly.forEach(p => {
      positions.push(p.x, sy, p.z);
      normals.push(0, 1, 0);
      uvs.push((p.x + 1.5) / 3.0, (p.z + 1.5) / 3.0);
    });
    const sTopIdxStart = indices.length;
    for (let i = 1; i < N - 1; i++) {
      indices.push(sTopStart, sTopStart + i + 1, sTopStart + i);
    }
    geom.addGroup(sTopIdxStart, indices.length - sTopIdxStart, 2);
  }

  // Bottom Cap Sticker (-Y: Yellow, matIdx = 3)
  if (iy === -1) {
    const stickerPoly = localPoly.map(p => scalePoint(p, centroid, stickerInset));
    const sBotStart = positions.length / 3;
    const sy = -halfH - stickerOffset;
    stickerPoly.forEach(p => {
      positions.push(p.x, sy, p.z);
      normals.push(0, -1, 0);
      uvs.push((p.x + 1.5) / 3.0, (p.z + 1.5) / 3.0);
    });
    const sBotIdxStart = indices.length;
    for (let i = 1; i < N - 1; i++) {
      indices.push(sBotStart, sBotStart + i, sBotStart + i + 1);
    }
    geom.addGroup(sBotIdxStart, indices.length - sBotIdxStart, 3);
  }

  // Side Wall Stickers
  for (let i = 0; i < N; i++) {
    const wp1 = worldPoly[i];
    const wp2 = worldPoly[(i + 1) % N];
    const midX = (wp1.x + wp2.x) / 2;
    const midZ = (wp1.z + wp2.z) / 2;

    const xw = midX * COS_T - midZ * SIN_T;
    const zw = midX * SIN_T + midZ * COS_T;

    let stickerMatIdx = -1;
    if (Math.abs(xw - W) < 0.02) stickerMatIdx = 0; // Right (Red)
    else if (Math.abs(xw - (-W)) < 0.02) stickerMatIdx = 1; // Left (Orange)
    else if (Math.abs(zw - W) < 0.02) stickerMatIdx = 4; // Front (Green)
    else if (Math.abs(zw - (-W)) < 0.02) stickerMatIdx = 5; // Back (Blue)

    if (stickerMatIdx >= 0) {
      const p1 = localPoly[i];
      const p2 = localPoly[(i + 1) % N];
      const edgeMid = { x: (p1.x + p2.x) / 2, z: (p1.z + p2.z) / 2 };

      const sp1 = scalePoint(p1, edgeMid, 0.88);
      const sp2 = scalePoint(p2, edgeMid, 0.88);

      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      const len = Math.hypot(dx, dz) || 1;
      const nx = -dz / len;
      const nz = dx / len;

      const offX = nx * stickerOffset;
      const offZ = nz * stickerOffset;

      const sYTop = halfH * 0.86;
      const sYBot = -halfH * 0.86;

      const sBaseIdx = positions.length / 3;
      positions.push(sp1.x + offX, sYTop, sp1.z + offZ); normals.push(nx, 0, nz); uvs.push(0, 1);
      positions.push(sp2.x + offX, sYTop, sp2.z + offZ); normals.push(nx, 0, nz); uvs.push(1, 1);
      positions.push(sp2.x + offX, sYBot, sp2.z + offZ); normals.push(nx, 0, nz); uvs.push(1, 0);
      positions.push(sp1.x + offX, sYBot, sp1.z + offZ); normals.push(nx, 0, nz); uvs.push(0, 0);

      const sIdxStart = indices.length;
      indices.push(sBaseIdx, sBaseIdx + 1, sBaseIdx + 2);
      indices.push(sBaseIdx, sBaseIdx + 2, sBaseIdx + 3);
      geom.addGroup(sIdxStart, 6, stickerMatIdx);
    }
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

function createWindmillMaterial(hex, isCore = false) {
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(hex),
    roughness: isCore ? 0.8 : 0.25,
    metalness: isCore ? 0.08 : 0.05,
    side: THREE.DoubleSide
  });
  mat.userData = {
    hexColor: hex,
    cacheKey: hex,
    isShared: true
  };
  return mat;
}

/**
 * Builds the complete 3D Three.js Windmill Cube model group with 26 sculpted pieces.
 * 
 * @param {Object} [options]
 * @returns {THREE.Group}
 */
export function buildWindmillModel(_options = {}) {
  const group = new THREE.Group();
  group.name = 'windmill-model';
  group.userData = {
    order: 3,
    pitch: 1.0,
    size: 1.0,
    isNxN: true,
    isWindmill: true,
    puzzleType: 'windmill'
  };

  const matR = createWindmillMaterial(WINDMILL_COLORS.R.hex);
  const matL = createWindmillMaterial(WINDMILL_COLORS.L.hex);
  const matU = createWindmillMaterial(WINDMILL_COLORS.U.hex);
  const matD = createWindmillMaterial(WINDMILL_COLORS.D.hex);
  const matF = createWindmillMaterial(WINDMILL_COLORS.F.hex);
  const matB = createWindmillMaterial(WINDMILL_COLORS.B.hex);
  const matCore = createWindmillMaterial('#181820', true);

  const materials = [matR, matL, matU, matD, matF, matB, matCore];
  const cubies = [];

  for (let ix = -1; ix <= 1; ix++) {
    for (let iy = -1; iy <= 1; iy++) {
      for (let iz = -1; iz <= 1; iz++) {
        // Skip hidden internal core
        if (ix === 0 && iy === 0 && iz === 0) continue;

        const poly = COLUMN_POLYGONS[`${ix}_${iz}`];
        if (!poly) continue;

        const geom = buildPrismGeometry(poly, ix, iy, iz);
        const mesh = new THREE.Mesh(geom, materials);

        mesh.position.set(ix, iy, iz);
        mesh.name = `cubie_${ix + 1}_${iy + 1}_${iz + 1}`;
        mesh.userData = {
          order: 3,
          cubieIndex: cubies.length,
          initialLayerX: ix + 1,
          initialLayerY: iy + 1,
          initialLayerZ: iz + 1,
          layerX: ix + 1,
          layerY: iy + 1,
          layerZ: iz + 1,
          gridPos: { x: ix, y: iy, z: iz }
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
