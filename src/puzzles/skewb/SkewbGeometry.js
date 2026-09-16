/**
 * src/puzzles/skewb/SkewbGeometry.js
 * 3D Geometry Generator for Skewb (Corner-Turning Cube)
 * 
 * Anatomy:
 * - 6 square faces covering the entire cube $[-L, L]^3$
 * - On each face: 1 center square/diamond + 4 corner triangles = 5 facets per face
 * - 6 faces * 5 facets = exactly 30 facets total
 * - Solid black plastic body beneath stickers with crisp, uniform borders
 */

import * as THREE from 'three';

export const SKEWB_COLORS = {
  U: { name: 'Putih (Atas)', hex: '#FFFFFF', code: 'U' },
  D: { name: 'Kuning (Bawah)', hex: '#FFD500', code: 'D' },
  F: { name: 'Hijau (Depan)', hex: '#00D800', code: 'F' },
  B: { name: 'Biru (Belakang)', hex: '#0051FF', code: 'B' },
  R: { name: 'Merah (Kanan)', hex: '#FF0000', code: 'R' },
  L: { name: 'Oranye (Kiri)', hex: '#FF8C00', code: 'L' }
};

const COLOR_HEX = {
  U: 0xFFFFFF, D: 0xFFD500, F: 0x00D800,
  B: 0x0051FF, R: 0xFF0000, L: 0xFF8C00
};

const PLASTIC_COLOR = 0x181820;

/**
 * Build mathematically exact Skewb 3D model
 * @param {Object} [options]
 * @returns {THREE.Group}
 */
export function buildSkewbModel(options = {}) {
  const group = new THREE.Group();
  group.name = 'skewb-model';
  group.userData = {
    puzzleType: 'skewb',
    isSkewb: true,
    pieces: []
  };

  const L = options.size || 1.35; // Half-size of the cube
  const normalOffset = 0.012;     // Elevation above black plastic body to prevent z-fighting
  const insetFactor = 0.91;       // Inset stickers slightly for realistic black vinyl grooves

  // 1. Build solid black plastic cube body
  const bodyGeom = new THREE.BoxGeometry(L * 2, L * 2, L * 2);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: PLASTIC_COLOR,
    roughness: 0.85,
    metalness: 0.1
  });
  const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
  bodyMesh.name = 'skewb-body';
  group.add(bodyMesh);

  // 2. Build 6 faces with 1 center diamond + 4 corner triangles per face
  const faceConfigs = [
    { id: 'U', normal: [0, 1, 0], up: [0, 0, -1], color: COLOR_HEX.U },
    { id: 'D', normal: [0, -1, 0], up: [0, 0, 1], color: COLOR_HEX.D },
    { id: 'F', normal: [0, 0, 1], up: [0, 1, 0], color: COLOR_HEX.F },
    { id: 'B', normal: [0, 0, -1], up: [0, 1, 0], color: COLOR_HEX.B },
    { id: 'R', normal: [1, 0, 0], up: [0, 1, 0], color: COLOR_HEX.R },
    { id: 'L', normal: [-1, 0, 0], up: [0, 1, 0], color: COLOR_HEX.L }
  ];

  faceConfigs.forEach(face => {
    const faceGroup = new THREE.Group();
    faceGroup.name = `face-${face.id}`;

    const n = new THREE.Vector3(...face.normal);
    const u = new THREE.Vector3(...face.up);
    const r = new THREE.Vector3().crossVectors(n, u).normalize();
    if (face.id === 'B' || face.id === 'D') {
      r.negate();
    }

    const faceCenter = n.clone().multiplyScalar(L);
    const stickerMat = new THREE.MeshStandardMaterial({
      color: face.color,
      roughness: 0.28,
      metalness: 0.08,
      side: THREE.DoubleSide
    });

    // 4 Midpoints of the face edges (connect to form center diamond)
    const M0 = faceCenter.clone().add(u.clone().multiplyScalar(L));
    const M1 = faceCenter.clone().add(r.clone().multiplyScalar(L));
    const M2 = faceCenter.clone().add(u.clone().multiplyScalar(-L));
    const M3 = faceCenter.clone().add(r.clone().multiplyScalar(-L));

    // 4 Corners of the face
    const C0 = faceCenter.clone().add(u.clone().multiplyScalar(L)).add(r.clone().multiplyScalar(L));
    const C1 = faceCenter.clone().add(u.clone().multiplyScalar(-L)).add(r.clone().multiplyScalar(L));
    const C2 = faceCenter.clone().add(u.clone().multiplyScalar(-L)).add(r.clone().multiplyScalar(-L));
    const C3 = faceCenter.clone().add(u.clone().multiplyScalar(L)).add(r.clone().multiplyScalar(-L));

    // 1. Center Diamond Sticker
    const dCenter = faceCenter.clone().addScaledVector(n, normalOffset);
    const d0 = new THREE.Vector3().lerpVectors(faceCenter, M0, insetFactor).addScaledVector(n, normalOffset);
    const d1 = new THREE.Vector3().lerpVectors(faceCenter, M1, insetFactor).addScaledVector(n, normalOffset);
    const d2 = new THREE.Vector3().lerpVectors(faceCenter, M2, insetFactor).addScaledVector(n, normalOffset);
    const d3 = new THREE.Vector3().lerpVectors(faceCenter, M3, insetFactor).addScaledVector(n, normalOffset);

    const diamondGeom = new THREE.BufferGeometry();
    const dv = new Float32Array([
      d0.x, d0.y, d0.z,  d1.x, d1.y, d1.z,  d2.x, d2.y, d2.z,
      d0.x, d0.y, d0.z,  d2.x, d2.y, d2.z,  d3.x, d3.y, d3.z
    ]);
    diamondGeom.setAttribute('position', new THREE.BufferAttribute(dv, 3));
    diamondGeom.computeVertexNormals();

    const centerMesh = new THREE.Mesh(diamondGeom, stickerMat);
    centerMesh.name = `center-${face.id}`;
    centerMesh.userData = { faceId: face.id, pieceType: 'center' };
    faceGroup.add(centerMesh);

    // 2. 4 Corner Triangles
    const cornerDefs = [
      { corner: C0, e1: M0, e2: M1, idx: 0 }, // Top-Right
      { corner: C1, e1: M1, e2: M2, idx: 1 }, // Bottom-Right
      { corner: C2, e1: M2, e2: M3, idx: 2 }, // Bottom-Left
      { corner: C3, e1: M3, e2: M0, idx: 3 }  // Top-Left
    ];

    cornerDefs.forEach(({ corner, e1, e2, idx }) => {
      const triCenter = new THREE.Vector3().add(corner).add(e1).add(e2).divideScalar(3);

      const t0 = new THREE.Vector3().lerpVectors(triCenter, corner, insetFactor).addScaledVector(n, normalOffset);
      const t1 = new THREE.Vector3().lerpVectors(triCenter, e1, insetFactor).addScaledVector(n, normalOffset);
      const t2 = new THREE.Vector3().lerpVectors(triCenter, e2, insetFactor).addScaledVector(n, normalOffset);

      const triGeom = new THREE.BufferGeometry();
      const tv = new Float32Array([
        t0.x, t0.y, t0.z,
        t1.x, t1.y, t1.z,
        t2.x, t2.y, t2.z
      ]);
      triGeom.setAttribute('position', new THREE.BufferAttribute(tv, 3));
      triGeom.computeVertexNormals();

      const triMesh = new THREE.Mesh(triGeom, stickerMat);
      triMesh.name = `corner-${face.id}-${idx}`;
      triMesh.userData = { faceId: face.id, pieceType: 'corner', cornerIndex: idx };
      faceGroup.add(triMesh);
    });

    group.add(faceGroup);
  });

  group.updateMatrixWorld(true);
  return group;
}
