/**
 * src/puzzles/skewb/SkewbGeometry.js
 * 3D Geometry Generator for Skewb (Corner-Turning Cube)
 * 
 * Anatomy:
 * - Exactly 14 solid pieces filling the cube [-L, L]^3:
 *   - 6 Center pieces (each with a black plastic core and 1 colored diamond sticker)
 *   - 8 Corner pieces (each with a black plastic core and 3 colored triangle stickers)
 * - Total 30 outer sticker facets (6 centers + 24 corners)
 * - Zero gaps, zero tearing, 100% solid physical pieces
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

export function buildSkewbModel(options = {}) {
  const group = new THREE.Group();
  group.name = 'skewb-model';
  group.userData = {
    puzzleType: 'skewb',
    isSkewb: true,
    pieces: []
  };

  const L = options.size || 1.35; // Half-size of the cube
  const normalOffset = 0.012;     // Elevation of stickers above plastic
  const insetFactor = 0.94;       // Slight inset for vinyl groove

  const plasticMat = new THREE.MeshStandardMaterial({
    color: PLASTIC_COLOR,
    roughness: 0.85,
    metalness: 0.1
  });

  const getStickerMat = (colorHex) => new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.28,
    metalness: 0.08,
    side: THREE.DoubleSide
  });

  const origin = new THREE.Vector3(0, 0, 0);

  // 1. Build 6 Center Pieces
  const centerConfigs = [
    { id: 'U', normal: [0, 1, 0], u: [0, 0, -1], color: COLOR_HEX.U },
    { id: 'D', normal: [0, -1, 0], u: [0, 0, 1], color: COLOR_HEX.D },
    { id: 'F', normal: [0, 0, 1], u: [0, 1, 0], color: COLOR_HEX.F },
    { id: 'B', normal: [0, 0, -1], u: [0, 1, 0], color: COLOR_HEX.B },
    { id: 'R', normal: [1, 0, 0], u: [0, 1, 0], color: COLOR_HEX.R },
    { id: 'L', normal: [-1, 0, 0], u: [0, 1, 0], color: COLOR_HEX.L }
  ];

  centerConfigs.forEach(cfg => {
    const centerGroup = new THREE.Group();
    centerGroup.name = `center-piece-${cfg.id}`;
    centerGroup.userData = { type: 'center', faceId: cfg.id };

    const n = new THREE.Vector3(...cfg.normal);
    const u = new THREE.Vector3(...cfg.u);
    const r = new THREE.Vector3().crossVectors(n, u).normalize();
    if (cfg.id === 'B' || cfg.id === 'D') r.negate();

    const faceCenter = n.clone().multiplyScalar(L);

    // 4 Midpoints of the face edges
    const M0 = faceCenter.clone().add(u.clone().multiplyScalar(L));
    const M1 = faceCenter.clone().add(r.clone().multiplyScalar(L));
    const M2 = faceCenter.clone().add(u.clone().multiplyScalar(-L));
    const M3 = faceCenter.clone().add(r.clone().multiplyScalar(-L));

    // Plastic pyramid: base M0, M1, M2, M3 connecting to origin
    const pyrGeom = new THREE.BufferGeometry();
    const pv = [
      // Base (2 triangles)
      ...M0.toArray(), ...M1.toArray(), ...M2.toArray(),
      ...M0.toArray(), ...M2.toArray(), ...M3.toArray(),
      // 4 sides to origin
      ...origin.toArray(), ...M1.toArray(), ...M0.toArray(),
      ...origin.toArray(), ...M2.toArray(), ...M1.toArray(),
      ...origin.toArray(), ...M3.toArray(), ...M2.toArray(),
      ...origin.toArray(), ...M0.toArray(), ...M3.toArray()
    ];
    pyrGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pv), 3));
    pyrGeom.computeVertexNormals();
    const pyrMesh = new THREE.Mesh(pyrGeom, plasticMat);
    pyrMesh.name = `core-center-${cfg.id}`;
    centerGroup.add(pyrMesh);

    // Diamond Sticker
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

    const centerMesh = new THREE.Mesh(diamondGeom, getStickerMat(cfg.color));
    centerMesh.name = `center-${cfg.id}`;
    centerMesh.userData = { faceId: cfg.id, pieceType: 'center' };
    centerGroup.add(centerMesh);

    group.add(centerGroup);
  });

  // 2. Build 8 Corner Pieces
  const cornerConfigs = [
    { id: 'UFR', signs: [1, 1, 1],   faces: [{ face: 'U', n: [0, 1, 0], c: COLOR_HEX.U, idx: 0 }, { face: 'F', n: [0, 0, 1], c: COLOR_HEX.F, idx: 0 }, { face: 'R', n: [1, 0, 0], c: COLOR_HEX.R, idx: 0 }] },
    { id: 'UFL', signs: [-1, 1, 1],  faces: [{ face: 'U', n: [0, 1, 0], c: COLOR_HEX.U, idx: 3 }, { face: 'F', n: [0, 0, 1], c: COLOR_HEX.F, idx: 3 }, { face: 'L', n: [-1, 0, 0], c: COLOR_HEX.L, idx: 1 }] },
    { id: 'UBL', signs: [-1, 1, -1], faces: [{ face: 'U', n: [0, 1, 0], c: COLOR_HEX.U, idx: 2 }, { face: 'B', n: [0, 0, -1], c: COLOR_HEX.B, idx: 2 }, { face: 'L', n: [-1, 0, 0], c: COLOR_HEX.L, idx: 2 }] },
    { id: 'UBR', signs: [1, 1, -1],  faces: [{ face: 'U', n: [0, 1, 0], c: COLOR_HEX.U, idx: 1 }, { face: 'B', n: [0, 0, -1], c: COLOR_HEX.B, idx: 1 }, { face: 'R', n: [1, 0, 0], c: COLOR_HEX.R, idx: 3 }] },
    { id: 'DFR', signs: [1, -1, 1],  faces: [{ face: 'D', n: [0, -1, 0], c: COLOR_HEX.D, idx: 0 }, { face: 'F', n: [0, 0, 1], c: COLOR_HEX.F, idx: 1 }, { face: 'R', n: [1, 0, 0], c: COLOR_HEX.R, idx: 1 }] },
    { id: 'DFL', signs: [-1, -1, 1], faces: [{ face: 'D', n: [0, -1, 0], c: COLOR_HEX.D, idx: 3 }, { face: 'F', n: [0, 0, 1], c: COLOR_HEX.F, idx: 2 }, { face: 'L', n: [-1, 0, 0], c: COLOR_HEX.L, idx: 0 }] },
    { id: 'DBL', signs: [-1, -1, -1],faces: [{ face: 'D', n: [0, -1, 0], c: COLOR_HEX.D, idx: 2 }, { face: 'B', n: [0, 0, -1], c: COLOR_HEX.B, idx: 3 }, { face: 'L', n: [-1, 0, 0], c: COLOR_HEX.L, idx: 3 }] },
    { id: 'DBR', signs: [1, -1, -1], faces: [{ face: 'D', n: [0, -1, 0], c: COLOR_HEX.D, idx: 1 }, { face: 'B', n: [0, 0, -1], c: COLOR_HEX.B, idx: 0 }, { face: 'R', n: [1, 0, 0], c: COLOR_HEX.R, idx: 2 }] }
  ];

  cornerConfigs.forEach(cfg => {
    const cornerGroup = new THREE.Group();
    cornerGroup.name = `corner-piece-${cfg.id}`;
    cornerGroup.userData = { type: 'corner', cornerId: cfg.id };

    const [sx, sy, sz] = cfg.signs;
    const C = new THREE.Vector3(sx * L, sy * L, sz * L);
    const Mx = new THREE.Vector3(0, sy * L, sz * L);
    const My = new THREE.Vector3(sx * L, 0, sz * L);
    const Mz = new THREE.Vector3(sx * L, sy * L, 0);

    // Plastic core connecting C, Mx, My, Mz to origin
    const coreGeom = new THREE.BufferGeometry();
    const cv = [
      // 3 Outer faces
      ...C.toArray(), ...Mx.toArray(), ...Mz.toArray(),
      ...C.toArray(), ...My.toArray(), ...Mx.toArray(),
      ...C.toArray(), ...Mz.toArray(), ...My.toArray(),
      // 3 Inner cut faces to origin
      ...origin.toArray(), ...Mz.toArray(), ...Mx.toArray(),
      ...origin.toArray(), ...Mx.toArray(), ...My.toArray(),
      ...origin.toArray(), ...My.toArray(), ...Mz.toArray()
    ];
    coreGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cv), 3));
    coreGeom.computeVertexNormals();
    const coreMesh = new THREE.Mesh(coreGeom, plasticMat);
    coreMesh.name = `core-corner-${cfg.id}`;
    cornerGroup.add(coreMesh);

    // 3 Colored Corner Stickers
    cfg.faces.forEach(f => {
      const fn = new THREE.Vector3(...f.n);
      let v1, v2;
      if (Math.abs(fn.y) > 0.5) {
        v1 = Mx; v2 = Mz;
      } else if (Math.abs(fn.z) > 0.5) {
        v1 = My; v2 = Mx;
      } else {
        v1 = Mz; v2 = My;
      }

      const triCenter = new THREE.Vector3().add(C).add(v1).add(v2).divideScalar(3);
      const t0 = new THREE.Vector3().lerpVectors(triCenter, C, insetFactor).addScaledVector(fn, normalOffset);
      const t1 = new THREE.Vector3().lerpVectors(triCenter, v1, insetFactor).addScaledVector(fn, normalOffset);
      const t2 = new THREE.Vector3().lerpVectors(triCenter, v2, insetFactor).addScaledVector(fn, normalOffset);

      const triGeom = new THREE.BufferGeometry();
      const tv = new Float32Array([
        t0.x, t0.y, t0.z,
        t1.x, t1.y, t1.z,
        t2.x, t2.y, t2.z
      ]);
      triGeom.setAttribute('position', new THREE.BufferAttribute(tv, 3));
      triGeom.computeVertexNormals();

      const triMesh = new THREE.Mesh(triGeom, getStickerMat(f.c));
      triMesh.name = `corner-${f.face}-${f.idx}`;
      triMesh.userData = { faceId: f.face, pieceType: 'corner', cornerIndex: f.idx };
      cornerGroup.add(triMesh);
    });

    group.add(cornerGroup);
  });

  group.updateMatrixWorld(true);
  return group;
}
