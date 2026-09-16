/**
 * src/puzzles/skewb/SkewbGeometry.js
 * 3D Geometry Generator for Skewb (Corner-Turning Cube)
 * 
 * Skewb is a deep-cut corner-turning cube with:
 * - 6 center pieces (one per face)
 * - 8 corner pieces
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

const CORE_COLOR = 0x1a1a2e;

/**
 * Build a Skewb 3D model
 * Represented as a cube with diagonal cuts through corners
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

  const size = options.size || 1.5;
  const gap = 0.03;

  // Build 6 faces, each with 5 pieces (1 center square + 4 corner triangles)
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

    const center = n.clone().multiplyScalar(size);
    const halfSize = size * 0.45;

    // Center diamond/square (rotated 45 degrees)
    const centerSize = halfSize * 0.7;
    const diamondVerts = [
      center.clone().add(u.clone().multiplyScalar(centerSize)),
      center.clone().add(r.clone().multiplyScalar(centerSize)),
      center.clone().add(u.clone().multiplyScalar(-centerSize)),
      center.clone().add(r.clone().multiplyScalar(-centerSize))
    ];

    const diamondGeom = new THREE.BufferGeometry();
    const dv = new Float32Array([
      ...diamondVerts[0].toArray(), ...diamondVerts[1].toArray(), ...diamondVerts[2].toArray(),
      ...diamondVerts[0].toArray(), ...diamondVerts[2].toArray(), ...diamondVerts[3].toArray()
    ]);
    diamondGeom.setAttribute('position', new THREE.BufferAttribute(dv, 3));
    diamondGeom.computeVertexNormals();

    const centerMat = new THREE.MeshStandardMaterial({
      color: face.color, roughness: 0.3, metalness: 0.1, side: THREE.DoubleSide
    });
    const centerMesh = new THREE.Mesh(diamondGeom, centerMat);
    centerMesh.name = `center-${face.id}`;
    centerMesh.userData = { faceId: face.id, pieceType: 'center' };
    faceGroup.add(centerMesh);

    // 4 corner triangles
    const corners = [
      { dir: [1, 1], verts: [0, 1] },   // Top-Right
      { dir: [-1, 1], verts: [1, 2] },   // Bottom-Right
      { dir: [-1, -1], verts: [2, 3] },  // Bottom-Left
      { dir: [1, -1], verts: [3, 0] }    // Top-Left
    ];

    corners.forEach((corner, idx) => {
      const cornerPoint = center.clone()
        .add(u.clone().multiplyScalar(halfSize * corner.dir[0]))
        .add(r.clone().multiplyScalar(halfSize * corner.dir[1]));

      const triGeom = new THREE.BufferGeometry();
      const tv = new Float32Array([
        ...diamondVerts[corner.verts[0]].toArray(),
        ...cornerPoint.toArray(),
        ...diamondVerts[corner.verts[1]].toArray()
      ]);
      triGeom.setAttribute('position', new THREE.BufferAttribute(tv, 3));
      triGeom.computeVertexNormals();

      const triMat = new THREE.MeshStandardMaterial({
        color: face.color, roughness: 0.3, metalness: 0.1, side: THREE.DoubleSide
      });
      const triMesh = new THREE.Mesh(triGeom, triMat);
      triMesh.name = `corner-${face.id}-${idx}`;
      triMesh.userData = { faceId: face.id, pieceType: 'corner', cornerIndex: idx };
      faceGroup.add(triMesh);
    });

    group.add(faceGroup);
  });

  // Core cube kept strictly inside facets
  const coreGeom = new THREE.BoxGeometry(size * 1.15, size * 1.15, size * 1.15);
  const coreMat = new THREE.MeshStandardMaterial({ color: CORE_COLOR, roughness: 0.85, metalness: 0.1 });
  const core = new THREE.Mesh(coreGeom, coreMat);
  core.name = 'skewb-core';
  group.add(core);

  group.updateMatrixWorld(true);
  return group;
}

