/**
 * src/puzzles/megaminx/MegaminxGeometry.js
 * 3D Geometry Generator for Megaminx (Regular Dodecahedron)
 * 
 * Anatomy:
 * - 12 regular pentagonal faces
 * - 20 corners, 30 edges, 12 centers (62 pieces)
 * - 11 stickers per face = 132 total stickers
 * - Golden ratio phi based face normals & vertices
 */

import * as THREE from 'three';

export const MEGAMINX_COLORS = Object.freeze({
  WHITE: '#FFFFFF',      // Face 1 (Top / U)
  RED: '#B71234',        // Face 2 (F)
  DARK_BLUE: '#0046AD',  // Face 3 (BL)
  YELLOW: '#FFD500',     // Face 4 (BR)
  DARK_GREEN: '#009B48', // Face 5 (FL)
  PURPLE: '#7B1FA2',     // Face 6 (FR)
  GREY: '#9E9E9E',       // Face 7 (Down / D)
  PINK: '#FF80AB',       // Face 8 (Opposite FR)
  LIGHT_BLUE: '#40C4FF', // Face 9 (Opposite FL)
  ORANGE: '#FF5800',     // Face 10 (Opposite BR)
  LIGHT_GREEN: '#76FF03',// Face 11 (Opposite BL)
  CREAM: '#FFF9C4',      // Face 12 (Opposite F)
});

const CORE_COLOR = 0x121215;

/** Golden ratio phi = (1 + sqrt(5)) / 2 */
const PHI = (1 + Math.sqrt(5)) / 2;

/**
 * Generates the 12 face normal unit vectors for a regular dodecahedron
 * with the top face (U) pointing strictly UP along the +Y axis [0, 1, 0].
 */
export function getMegaminxFaceNormals() {
  const normals = [];
  // Top face U
  normals.push(new THREE.Vector3(0, 1, 0));

  // Dihedral angle cosine for adjacent faces = 1 / sqrt(5)
  const cosAlpha = 1 / Math.sqrt(5);
  const sinAlpha = 2 / Math.sqrt(5);

  // 5 upper tier faces surrounding U at 72° increments
  for (let i = 0; i < 5; i++) {
    const theta = (2 * Math.PI * i) / 5 - Math.PI / 2;
    normals.push(new THREE.Vector3(
      sinAlpha * Math.cos(theta),
      cosAlpha,
      sinAlpha * Math.sin(theta)
    ));
  }

  // Bottom face D (opposite U)
  normals.push(new THREE.Vector3(0, -1, 0));

  // 5 lower tier faces surrounding D (opposite to upper tier rotated by 36°)
  for (let i = 0; i < 5; i++) {
    const theta = (2 * Math.PI * i) / 5 - Math.PI / 2 + Math.PI / 5;
    normals.push(new THREE.Vector3(
      sinAlpha * Math.cos(theta),
      -cosAlpha,
      sinAlpha * Math.sin(theta)
    ));
  }

  return normals;
}

export const MEGAMINX_FACE_SPECS = [
  { id: 'U',  name: 'Top (White)',           colorHex: MEGAMINX_COLORS.WHITE,       axisIndex: 0 },
  { id: 'F',  name: 'Front (Red)',           colorHex: MEGAMINX_COLORS.RED,         axisIndex: 1 },
  { id: 'FL', name: 'Front-Left (Green)',    colorHex: MEGAMINX_COLORS.DARK_GREEN,  axisIndex: 2 },
  { id: 'BL', name: 'Back-Left (Blue)',      colorHex: MEGAMINX_COLORS.DARK_BLUE,   axisIndex: 3 },
  { id: 'BR', name: 'Back-Right (Yellow)',   colorHex: MEGAMINX_COLORS.YELLOW,      axisIndex: 4 },
  { id: 'FR', name: 'Front-Right (Purple)',  colorHex: MEGAMINX_COLORS.PURPLE,      axisIndex: 5 },
  { id: 'D',  name: 'Bottom (Grey)',         colorHex: MEGAMINX_COLORS.GREY,        axisIndex: 6 },
  { id: 'B',  name: 'Back (Pink)',           colorHex: MEGAMINX_COLORS.PINK,        axisIndex: 7 },
  { id: 'DL', name: 'Down-Left (Light Blue)',colorHex: MEGAMINX_COLORS.LIGHT_BLUE, axisIndex: 8 },
  { id: 'UL', name: 'Up-Left (Light Green)', colorHex: MEGAMINX_COLORS.LIGHT_GREEN,axisIndex: 9 },
  { id: 'UR', name: 'Up-Right (Cream)',      colorHex: MEGAMINX_COLORS.CREAM,       axisIndex: 10 },
  { id: 'DR', name: 'Down-Right (Orange)',   colorHex: MEGAMINX_COLORS.ORANGE,      axisIndex: 11 }
];

/**
 * Builds a 3D model of Megaminx with 12 faces and 11 stickers per face (132 stickers total).
 * @param {Object} [options]
 * @returns {THREE.Group}
 */
export function buildMegaminxModel(options = {}) {
  const group = new THREE.Group();
  group.name = 'megaminx-model';
  group.userData = {
    puzzleType: 'megaminx',
    faceCount: 12,
    totalStickers: 132,
    phi: PHI
  };

  const radius = options.radius || 2.2;
  const normals = getMegaminxFaceNormals();

  MEGAMINX_FACE_SPECS.forEach((faceSpec, faceIdx) => {
    const faceNormal = normals[faceSpec.axisIndex];
    const faceGroup = new THREE.Group();
    faceGroup.name = `megaminx-face-${faceSpec.id}`;
    faceGroup.userData = { faceId: faceSpec.id, faceIndex: faceIdx };

    // Orthonormal basis on the face tangent plane
    let up = new THREE.Vector3(0, 1, 0);
    if (Math.abs(faceNormal.y) > 0.95) {
      up = new THREE.Vector3(0, 0, -1);
    }
    const tangentV = new THREE.Vector3().crossVectors(faceNormal, up).normalize();
    const tangentU = new THREE.Vector3().crossVectors(faceNormal, tangentV).normalize();

    const faceCenter = faceNormal.clone().multiplyScalar(radius);
    const stickerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(faceSpec.colorHex),
      roughness: 0.35,
      metalness: 0.08,
      side: THREE.DoubleSide
    });

    // 1. Center Pentagon Sticker
    const rCenter = 0.42;
    const centerVerts = [];
    for (let k = 0; k < 5; k++) {
      const angle = (2 * Math.PI * k) / 5 - Math.PI / 2;
      const pt = faceCenter.clone()
        .add(tangentU.clone().multiplyScalar(rCenter * Math.cos(angle)))
        .add(tangentV.clone().multiplyScalar(rCenter * Math.sin(angle)));
      centerVerts.push(pt);
    }

    const centerGeom = new THREE.BufferGeometry();
    const cv = [];
    for (let k = 1; k < 4; k++) {
      cv.push(...centerVerts[0].toArray(), ...centerVerts[k].toArray(), ...centerVerts[k + 1].toArray());
    }
    centerGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cv), 3));
    centerGeom.computeVertexNormals();

    const centerMesh = new THREE.Mesh(centerGeom, stickerMat);
    centerMesh.name = `sticker-${faceSpec.id}-center`;
    centerMesh.userData = { faceId: faceSpec.id, pieceType: 'center', faceIndex: faceIdx };
    faceGroup.add(centerMesh);

    // 2. 5 Edge Stickers (Trapezoids) & 3. 5 Corner Stickers (Kites)
    const rInner = 0.46;
    const rOuter = 0.95;
    const rEdgeMid = 0.76;

    for (let k = 0; k < 5; k++) {
      const a0 = (2 * Math.PI * k) / 5 - Math.PI / 2;
      const a1 = (2 * Math.PI * (k + 1)) / 5 - Math.PI / 2;
      const aMid = (a0 + a1) / 2;

      // Edge points
      const eInner0 = faceCenter.clone()
        .add(tangentU.clone().multiplyScalar(rInner * Math.cos(a0 + 0.15)))
        .add(tangentV.clone().multiplyScalar(rInner * Math.sin(a0 + 0.15)));
      const eInner1 = faceCenter.clone()
        .add(tangentU.clone().multiplyScalar(rInner * Math.cos(a1 - 0.15)))
        .add(tangentV.clone().multiplyScalar(rInner * Math.sin(a1 - 0.15)));
      const eOuter0 = faceCenter.clone()
        .add(tangentU.clone().multiplyScalar(rEdgeMid * Math.cos(a0 + 0.22)))
        .add(tangentV.clone().multiplyScalar(rEdgeMid * Math.sin(a0 + 0.22)));
      const eOuter1 = faceCenter.clone()
        .add(tangentU.clone().multiplyScalar(rEdgeMid * Math.cos(a1 - 0.22)))
        .add(tangentV.clone().multiplyScalar(rEdgeMid * Math.sin(a1 - 0.22)));

      const edgeGeom = new THREE.BufferGeometry();
      const ev = [
        ...eInner0.toArray(), ...eOuter0.toArray(), ...eOuter1.toArray(),
        ...eInner0.toArray(), ...eOuter1.toArray(), ...eInner1.toArray()
      ];
      edgeGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ev), 3));
      edgeGeom.computeVertexNormals();

      const edgeMesh = new THREE.Mesh(edgeGeom, stickerMat);
      edgeMesh.name = `sticker-${faceSpec.id}-edge-${k}`;
      edgeMesh.userData = { faceId: faceSpec.id, pieceType: 'edge', faceIndex: faceIdx, edgeIndex: k };
      faceGroup.add(edgeMesh);

      // Corner points (Kite around vertex k)
      const cTip = faceCenter.clone()
        .add(tangentU.clone().multiplyScalar(rOuter * Math.cos(a0)))
        .add(tangentV.clone().multiplyScalar(rOuter * Math.sin(a0)));
      const cSideL = faceCenter.clone()
        .add(tangentU.clone().multiplyScalar(rEdgeMid * Math.cos(a0 - 0.20)))
        .add(tangentV.clone().multiplyScalar(rEdgeMid * Math.sin(a0 - 0.20)));
      const cSideR = faceCenter.clone()
        .add(tangentU.clone().multiplyScalar(rEdgeMid * Math.cos(a0 + 0.20)))
        .add(tangentV.clone().multiplyScalar(rEdgeMid * Math.sin(a0 + 0.20)));
      const cBase = faceCenter.clone()
        .add(tangentU.clone().multiplyScalar(rInner * Math.cos(a0)))
        .add(tangentV.clone().multiplyScalar(rInner * Math.sin(a0)));

      const cornerGeom = new THREE.BufferGeometry();
      const cov = [
        ...cBase.toArray(), ...cSideL.toArray(), ...cTip.toArray(),
        ...cBase.toArray(), ...cTip.toArray(), ...cSideR.toArray()
      ];
      cornerGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cov), 3));
      cornerGeom.computeVertexNormals();

      const cornerMesh = new THREE.Mesh(cornerGeom, stickerMat);
      cornerMesh.name = `sticker-${faceSpec.id}-corner-${k}`;
      cornerMesh.userData = { faceId: faceSpec.id, pieceType: 'corner', faceIndex: faceIdx, cornerIndex: k };
      faceGroup.add(cornerMesh);
    }

    group.add(faceGroup);
  });

  // Internal Core Dodecahedral Body kept strictly inside face in-radius
  const coreGeom = new THREE.DodecahedronGeometry(radius * 0.72, 0);
  const coreMat = new THREE.MeshStandardMaterial({ color: CORE_COLOR, roughness: 0.85, metalness: 0.05 });
  const coreMesh = new THREE.Mesh(coreGeom, coreMat);
  coreMesh.name = 'megaminx-core';
  group.add(coreMesh);

  group.updateMatrixWorld(true);
  return group;
}
