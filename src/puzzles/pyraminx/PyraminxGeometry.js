/**
 * src/puzzles/pyraminx/PyraminxGeometry.js
 * 3D Geometry Generator for Pyraminx (Tetrahedron Puzzle)
 * 
 * Anatomy:
 * - Regular tetrahedron centered at origin (0, 0, 0)
 * - 4 triangular faces: F (Green), R (Blue), L (Yellow), D (Red)
 * - Exactly 9 triangular stickers per face (3 rows: 1, 3, 5) = 36 stickers total
 * - Mathematically exact barycentric subdivision without gaps or clipping
 */

import * as THREE from 'three';

// Face colors: Green (Front), Blue (Right), Yellow (Left), Red (Bottom)
export const PYRAMINX_COLORS = {
  F: { name: 'Hijau (Depan)', hex: '#00D800', code: 'F' },
  R: { name: 'Biru (Kanan)', hex: '#0051FF', code: 'R' },
  L: { name: 'Kuning (Kiri)', hex: '#FFD500', code: 'L' },
  D: { name: 'Merah (Bawah)', hex: '#FF0000', code: 'D' }
};

const COLOR_MAP = {
  F: 0x00D800,
  R: 0x0051FF,
  L: 0xFFD500,
  D: 0xFF0000
};

const PLASTIC_COLOR = 0x181820;

/**
 * Generates mathematically exact Pyraminx 3D model
 * @param {Object} [options]
 * @returns {THREE.Group}
 */
export function buildPyraminxModel(options = {}) {
  const group = new THREE.Group();
  group.name = 'pyraminx-model';
  group.userData = {
    puzzleType: 'pyraminx',
    isPyraminx: true,
    pieces: [],
    stickers: {}
  };

  const R = options.scale || 2.2; // Circumradius from origin to vertices

  // Exact vertices of a regular tetrahedron centered at (0, 0, 0)
  // V0: Top apex along +Y
  // V1: Front vertex (Z > 0)
  // V2: Back-left vertex
  // V3: Back-right vertex
  const yBase = -R / 3;
  const rBase = R * (Math.sqrt(8) / 3); // Distance from Y-axis to base vertices

  const V0 = new THREE.Vector3(0, R, 0);
  const V1 = new THREE.Vector3(0, yBase, rBase);
  const V2 = new THREE.Vector3(-rBase * Math.cos(Math.PI / 6), yBase, -rBase * Math.sin(Math.PI / 6));
  const V3 = new THREE.Vector3(rBase * Math.cos(Math.PI / 6), yBase, -rBase * Math.sin(Math.PI / 6));

  // 4 Faces with counter-clockwise vertex winding for outward-pointing normals
  const faces = [
    { id: 'F', name: 'Depan (Hijau)', color: COLOR_MAP.F, A: V0, B: V2, C: V1 },   // Front
    { id: 'R', name: 'Kanan (Biru)',  color: COLOR_MAP.R, A: V0, B: V1, C: V3 },   // Right
    { id: 'L', name: 'Kiri (Kuning)', color: COLOR_MAP.L, A: V0, B: V3, C: V2 },   // Left
    { id: 'D', name: 'Bawah (Merah)', color: COLOR_MAP.D, A: V1, B: V2, C: V3 }    // Bottom
  ];

  // 1. Build recessed inner core tetrahedron (stays inside, does not clip into moving outer shell)
  const coreScale = 0.35;
  const coreGeom = new THREE.BufferGeometry();
  const corePositions = [];
  const coreNormals = [];

  faces.forEach(f => {
    const cA = f.A.clone().multiplyScalar(coreScale);
    const cB = f.B.clone().multiplyScalar(coreScale);
    const cC = f.C.clone().multiplyScalar(coreScale);
    const e1 = new THREE.Vector3().subVectors(cB, cA);
    const e2 = new THREE.Vector3().subVectors(cC, cA);
    const norm = new THREE.Vector3().crossVectors(e1, e2).normalize();

    corePositions.push(
      cA.x, cA.y, cA.z,
      cB.x, cB.y, cB.z,
      cC.x, cC.y, cC.z
    );
    for (let k = 0; k < 3; k++) {
      coreNormals.push(norm.x, norm.y, norm.z);
    }
  });

  coreGeom.setAttribute('position', new THREE.Float32BufferAttribute(corePositions, 3));
  coreGeom.setAttribute('normal', new THREE.Float32BufferAttribute(coreNormals, 3));

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: PLASTIC_COLOR,
    roughness: 0.85,
    metalness: 0.1,
    side: THREE.DoubleSide
  });
  const coreMesh = new THREE.Mesh(coreGeom, bodyMaterial);
  coreMesh.name = 'pyraminx-core';
  group.add(coreMesh);

  // 2. Build 9 solid facets per face (each with plastic backing tile + colored vinyl sticker)
  const N = 3; // 3 subdivision rows
  const stickerInset = 0.88; // 12% black border around each sticker
  const normalOffset = 0.012; // Slight elevation above backing tile

  faces.forEach(face => {
    const faceGroup = new THREE.Group();
    faceGroup.name = `face-${face.id}`;

    const e1 = new THREE.Vector3().subVectors(face.B, face.A);
    const e2 = new THREE.Vector3().subVectors(face.C, face.A);
    const normal = new THREE.Vector3().crossVectors(e1, e2).normalize();

    // Helper: returns point on face given barycentric coordinates (i, j, k) with i+j+k=3
    const pt = (i, j, k) => {
      return new THREE.Vector3()
        .addScaledVector(face.A, i / N)
        .addScaledVector(face.B, j / N)
        .addScaledVector(face.C, k / N);
    };

    const stickers = [];
    let stickerIdx = 0;

    const stickerMat = new THREE.MeshStandardMaterial({
      color: face.color,
      roughness: 0.25,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    const addTriangleSticker = (p1, p2, p3, isUpward, row) => {
      const facetGroup = new THREE.Group();
      facetGroup.name = `facet-${face.id}-${stickerIdx}`;

      const center = new THREE.Vector3().add(p1).add(p2).add(p3).divideScalar(3);

      // A. Black plastic backing tile
      const baseGeom = new THREE.BufferGeometry();
      const basePos = new Float32Array([
        p1.x, p1.y, p1.z,
        p2.x, p2.y, p2.z,
        p3.x, p3.y, p3.z
      ]);
      baseGeom.setAttribute('position', new THREE.BufferAttribute(basePos, 3));
      baseGeom.computeVertexNormals();
      const baseMesh = new THREE.Mesh(baseGeom, bodyMaterial);
      baseMesh.name = `base-${face.id}-${stickerIdx}`;
      facetGroup.add(baseMesh);

      // B. Colored sticker inset towards center
      const v1 = new THREE.Vector3().lerpVectors(center, p1, stickerInset).addScaledVector(normal, normalOffset);
      const v2 = new THREE.Vector3().lerpVectors(center, p2, stickerInset).addScaledVector(normal, normalOffset);
      const v3 = new THREE.Vector3().lerpVectors(center, p3, stickerInset).addScaledVector(normal, normalOffset);

      const geom = new THREE.BufferGeometry();
      const pos = new Float32Array([
        v1.x, v1.y, v1.z,
        v2.x, v2.y, v2.z,
        v3.x, v3.y, v3.z
      ]);
      geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geom.computeVertexNormals();

      const mesh = new THREE.Mesh(geom, stickerMat);
      mesh.name = `sticker-${face.id}-${stickerIdx}`;
      mesh.userData = {
        faceId: face.id,
        stickerIndex: stickerIdx,
        row,
        isUpward,
        originalColor: face.color,
        center: center.clone()
      };

      facetGroup.add(mesh);
      facetGroup.userData = {
        faceId: face.id,
        stickerIndex: stickerIdx,
        center: center.clone(),
        isPyraminxFacet: true
      };

      group.add(facetGroup);
      stickers.push(mesh);
      stickerIdx++;
    };

    // Subdivide face into 3 rows (r = 0, 1, 2)
    // Upward triangles: i+j+k = 2
    for (let r = 0; r < N; r++) {
      const i = N - 1 - r;
      for (let j = 0; j <= r; j++) {
        const k = r - j;
        // Upward triangle: vertices at (i+1, j, k), (i, j+1, k), (i, j, k+1)
        const p1 = pt(i + 1, j, k);
        const p2 = pt(i, j + 1, k);
        const p3 = pt(i, j, k + 1);
        addTriangleSticker(p1, p2, p3, true, r);

        // Downward triangle: between upward ones (for r < N-1)
        if (r < N - 1 && j < r + 1) {
          const id = N - 2 - r;
          if (id >= 0) {
            const dp1 = pt(id, j + 1, k + 1);
            const dp2 = pt(id + 1, j, k + 1);
            const dp3 = pt(id + 1, j + 1, k);
            addTriangleSticker(dp1, dp2, dp3, false, r);
          }
        }
      }
    }

    group.userData.stickers[face.id] = stickers;
  });

  group.updateMatrixWorld(true);
  return group;
}
