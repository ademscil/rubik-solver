/**
 * src/puzzles/megaminx/MegaminxGeometry.js
 * 3D Geometry Generator for Megaminx (Regular Dodecahedron)
 * 
 * Anatomy:
 * - 12 regular pentagonal faces seamlessly meeting along 30 edges
 * - On each face: 1 center pentagon + 5 edge trapezoids + 5 corner kites = 11 stickers
 * - 12 faces * 11 stickers = exactly 132 stickers total
 * - Solid black dodecahedral plastic body with clean vinyl borders
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

const PLASTIC_COLOR = 0x16161e;

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

  // 5 lower tier faces surrounding D (rotated by 36° relative to upper tier)
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
  { id: 'BL2',name: 'Bottom-Left (Pink)',    colorHex: MEGAMINX_COLORS.PINK,        axisIndex: 7 },
  { id: 'BR2',name: 'Bottom-Right (L-Blue)', colorHex: MEGAMINX_COLORS.LIGHT_BLUE,  axisIndex: 8 },
  { id: 'B2', name: 'Back (Orange)',         colorHex: MEGAMINX_COLORS.ORANGE,      axisIndex: 9 },
  { id: 'FL2',name: 'Front-Left2 (L-Green)', colorHex: MEGAMINX_COLORS.LIGHT_GREEN, axisIndex: 10 },
  { id: 'F2', name: 'Front2 (Cream)',        colorHex: MEGAMINX_COLORS.CREAM,       axisIndex: 11 }
];

/**
 * Builds mathematically seamless Megaminx 3D model with 132 stickers across 12 faces
 * @param {Object} [options]
 * @returns {THREE.Group}
 */
export function buildMegaminxModel(options = {}) {
  const group = new THREE.Group();
  group.name = 'megaminx-model';
  group.userData = {
    puzzleType: 'megaminx',
    isMegaminx: true,
    facesCount: 12,
    stickersPerFace: 11,
    totalStickers: 132,
    pieces: []
  };

  const radius = options.radius || 2.2; // In-radius (distance from origin to face plane)
  const faceNormals = getMegaminxFaceNormals();
  const normalOffset = 0.015; // Elevation above black plastic body

  // Outer circumradius of pentagon face = radius * 0.7639
  const rPentagon = radius * 0.764;
  const rEdgeMid = rPentagon * Math.cos(Math.PI / 5); // 0.809 * rPentagon

  // Proportions of internal stickers
  const rCenter = rPentagon * 0.40;
  const rInner = rPentagon * 0.44;
  const rCornerOuter = rPentagon * 0.94;
  const rEdgeOuter = rEdgeMid * 0.94;
  const rSideMid = rEdgeMid * 0.85;

  // 1. Build solid black dodecahedral plastic body
  // Each pentagonal face is created from 3 triangles
  const bodyGeom = new THREE.BufferGeometry();
  const bodyPositions = [];
  const bodyNormals = [];

  faceNormals.forEach((faceNormal) => {
    let up = new THREE.Vector3(0, 1, 0);
    if (Math.abs(faceNormal.y) > 0.95) {
      up = new THREE.Vector3(0, 0, -1);
    }
    const tangentV = new THREE.Vector3().crossVectors(faceNormal, up).normalize();
    const tangentU = new THREE.Vector3().crossVectors(faceNormal, tangentV).normalize();
    const faceCenter = faceNormal.clone().multiplyScalar(radius);

    const pentVerts = [];
    for (let k = 0; k < 5; k++) {
      const angle = (2 * Math.PI * k) / 5 - Math.PI / 2;
      pentVerts.push(
        faceCenter.clone()
          .addScaledVector(tangentU, rPentagon * Math.cos(angle))
          .addScaledVector(tangentV, rPentagon * Math.sin(angle))
      );
    }

    // Triangulate pentagon (fan from v0)
    for (let k = 1; k < 4; k++) {
      bodyPositions.push(
        pentVerts[0].x, pentVerts[0].y, pentVerts[0].z,
        pentVerts[k].x, pentVerts[k].y, pentVerts[k].z,
        pentVerts[k + 1].x, pentVerts[k + 1].y, pentVerts[k + 1].z
      );
      for (let j = 0; j < 3; j++) {
        bodyNormals.push(faceNormal.x, faceNormal.y, faceNormal.z);
      }
    }
  });

  bodyGeom.setAttribute('position', new THREE.Float32BufferAttribute(bodyPositions, 3));
  bodyGeom.setAttribute('normal', new THREE.Float32BufferAttribute(bodyNormals, 3));

  const bodyMat = new THREE.MeshStandardMaterial({
    color: PLASTIC_COLOR,
    roughness: 0.85,
    metalness: 0.08
  });
  const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
  bodyMesh.name = 'megaminx-body';
  group.add(bodyMesh);

  // 2. Build 11 stickers per face on top of the black body
  MEGAMINX_FACE_SPECS.forEach((faceSpec, faceIdx) => {
    const faceNormal = faceNormals[faceIdx];
    const faceGroup = new THREE.Group();
    faceGroup.name = `face-${faceSpec.id}`;
    faceGroup.userData = { faceId: faceSpec.id, faceIndex: faceIdx };

    let up = new THREE.Vector3(0, 1, 0);
    if (Math.abs(faceNormal.y) > 0.95) {
      up = new THREE.Vector3(0, 0, -1);
    }
    const tangentV = new THREE.Vector3().crossVectors(faceNormal, up).normalize();
    const tangentU = new THREE.Vector3().crossVectors(faceNormal, tangentV).normalize();
    const faceCenter = faceNormal.clone().multiplyScalar(radius);

    const stickerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(faceSpec.colorHex),
      roughness: 0.28,
      metalness: 0.06,
      side: THREE.DoubleSide
    });

    // Helper: compute point on sticker plane with normalOffset
    const stPt = (r, angle) => {
      return faceCenter.clone()
        .addScaledVector(tangentU, r * Math.cos(angle))
        .addScaledVector(tangentV, r * Math.sin(angle))
        .addScaledVector(faceNormal, normalOffset);
    };

    // A. Center Regular Pentagon (1 piece)
    const centerVerts = [];
    for (let k = 0; k < 5; k++) {
      const angle = (2 * Math.PI * k) / 5 - Math.PI / 2;
      centerVerts.push(stPt(rCenter, angle));
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

    // B. 5 Edge Stickers (Trapezoids) & 5 Corner Stickers (Kites)
    for (let k = 0; k < 5; k++) {
      const a0 = (2 * Math.PI * k) / 5 - Math.PI / 2;
      const a1 = (2 * Math.PI * (k + 1)) / 5 - Math.PI / 2;
      const aMid = (a0 + a1) / 2;

      // Edge points: trapezoid between a0 and a1
      const eInner0 = stPt(rInner, a0 + 0.16);
      const eInner1 = stPt(rInner, a1 - 0.16);
      const eOuter0 = stPt(rEdgeOuter, a0 + 0.22);
      const eOuter1 = stPt(rEdgeOuter, a1 - 0.22);

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

      // Corner points: kite around vertex k at angle a0
      const cTip = stPt(rCornerOuter, a0);
      const cSideL = stPt(rSideMid, a0 - 0.18);
      const cSideR = stPt(rSideMid, a0 + 0.18);
      const cBase = stPt(rInner, a0);

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

  group.updateMatrixWorld(true);
  return group;
}
