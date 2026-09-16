/**
 * src/puzzles/megaminx/MegaminxGeometry.js
 * 3D Geometry Generator for Megaminx (Regular Dodecahedron)
 * 
 * Anatomy:
 * - 12 regular pentagonal faces seamlessly aligned with Dodecahedron body
 * - 11 stickers per face = 132 total stickers (1 center, 5 edges, 5 corners)
 * - Zero floating stickers, zero tilt distortion, mathematically exact
 */

import * as THREE from 'three';

export const MEGAMINX_COLORS = Object.freeze({
  WHITE: '#FFFFFF',      // Face 0 (Top / U)
  RED: '#B71234',        // Face 1 (Front / F)
  DARK_GREEN: '#009B48', // Face 2 (Front-Left / FL)
  DARK_BLUE: '#0046AD',  // Face 3 (Back-Left / BL)
  YELLOW: '#FFD500',     // Face 4 (Back-Right / BR)
  PURPLE: '#7B1FA2',     // Face 5 (Front-Right / FR)
  GREY: '#9E9E9E',       // Face 6 (Bottom / D)
  PINK: '#FF80AB',       // Face 7 (Back / B)
  LIGHT_BLUE: '#40C4FF', // Face 8 (Down-Left / DL)
  LIGHT_GREEN: '#76FF03',// Face 9 (Up-Left / UL)
  CREAM: '#FFF9C4',      // Face 10 (Up-Right / UR)
  ORANGE: '#FF5800'      // Face 11 (Down-Right / DR)
});

const PLASTIC_COLOR = 0x181820;

export const MEGAMINX_FACE_SPECS = [
  { id: 'U',  name: 'Top (White)',            colorHex: MEGAMINX_COLORS.WHITE },
  { id: 'F',  name: 'Front (Red)',            colorHex: MEGAMINX_COLORS.RED },
  { id: 'FL', name: 'Front-Left (Dark Green)', colorHex: MEGAMINX_COLORS.DARK_GREEN },
  { id: 'BL', name: 'Back-Left (Dark Blue)',   colorHex: MEGAMINX_COLORS.DARK_BLUE },
  { id: 'BR', name: 'Back-Right (Yellow)',    colorHex: MEGAMINX_COLORS.YELLOW },
  { id: 'FR', name: 'Front-Right (Purple)',   colorHex: MEGAMINX_COLORS.PURPLE },
  { id: 'D',  name: 'Bottom (Grey)',          colorHex: MEGAMINX_COLORS.GREY },
  { id: 'B',  name: 'Back (Pink)',            colorHex: MEGAMINX_COLORS.PINK },
  { id: 'DL', name: 'Down-Left (Light Blue)', colorHex: MEGAMINX_COLORS.LIGHT_BLUE },
  { id: 'UL', name: 'Up-Left (Light Green)',  colorHex: MEGAMINX_COLORS.LIGHT_GREEN },
  { id: 'UR', name: 'Up-Right (Cream)',       colorHex: MEGAMINX_COLORS.CREAM },
  { id: 'DR', name: 'Down-Right (Orange)',    colorHex: MEGAMINX_COLORS.ORANGE }
];

/**
 * Returns the 12 unit face normals of the Megaminx dodecahedron.
 * Face 0 is U (0, 1, 0), Face 6 is D (0, -1, 0).
 * @returns {THREE.Vector3[]}
 */
export function getMegaminxFaceNormals() {
  const normals = [];

  // Top face U (along +Y)
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

/**
 * Computes the 20 vertices of a regular dodecahedron with given face distance (radius).
 * @param {THREE.Vector3[]} normals - The 12 unit face normals
 * @param {number} radius - Inradius (distance from origin to each face plane)
 * @returns {THREE.Vector3[]}
 */
function computeDodecahedronVertices(normals, radius) {
  const verts = [];
  for (let i = 0; i < 12; i++) {
    for (let j = i + 1; j < 12; j++) {
      for (let k = j + 1; k < 12; k++) {
        const m = new THREE.Matrix3().set(
          normals[i].x, normals[i].y, normals[i].z,
          normals[j].x, normals[j].y, normals[j].z,
          normals[k].x, normals[k].y, normals[k].z
        );
        if (Math.abs(m.determinant()) < 1e-4) continue;
        const inv = m.clone().invert();
        const v = new THREE.Vector3(radius, radius, radius).applyMatrix3(inv);
        let inside = true;
        for (let n = 0; n < 12; n++) {
          if (normals[n].dot(v) > radius + 1e-4) {
            inside = false;
            break;
          }
        }
        if (inside && !verts.some(u => u.distanceTo(v) < 1e-4)) {
          verts.push(v);
        }
      }
    }
  }
  return verts;
}

/**
 * Builds mathematically seamless Megaminx 3D model
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

  const radius = options.radius || 2.2;
  const normalOffset = 0.012;
  const normals = getMegaminxFaceNormals();
  const allVerts = computeDodecahedronVertices(normals, radius);

  // 1. Build the solid black dodecahedral plastic body directly from the 12 faces
  const bodyGeom = new THREE.BufferGeometry();
  const bodyPositions = [];
  const bodyNormals = [];

  // Prepare each face's ordered vertices and center
  const faces = normals.map((normal, faceIdx) => {
    const center = normal.clone().multiplyScalar(radius);
    const faceVerts = allVerts.filter(v => Math.abs(normal.dot(v) - radius) < 1e-4);

    if (faceVerts.length >= 5) {
      const refDir = new THREE.Vector3().subVectors(faceVerts[0], center).normalize();
      const orthoDir = new THREE.Vector3().crossVectors(normal, refDir).normalize();

      faceVerts.sort((a, b) => {
        const da = new THREE.Vector3().subVectors(a, center);
        const db = new THREE.Vector3().subVectors(b, center);
        const angA = Math.atan2(da.dot(orthoDir), da.dot(refDir));
        const angB = Math.atan2(db.dot(orthoDir), db.dot(refDir));
        return angA - angB;
      });
    }

    // Triangulate pentagonal face into 3 triangles: (v0, v1, v2), (v0, v2, v3), (v0, v3, v4)
    if (faceVerts.length === 5) {
      for (let k = 1; k < 4; k++) {
        bodyPositions.push(
          faceVerts[0].x, faceVerts[0].y, faceVerts[0].z,
          faceVerts[k].x, faceVerts[k].y, faceVerts[k].z,
          faceVerts[k + 1].x, faceVerts[k + 1].y, faceVerts[k + 1].z
        );
        for (let j = 0; j < 3; j++) {
          bodyNormals.push(normal.x, normal.y, normal.z);
        }
      }
    }

    return { faceIdx, center, normal, verts: faceVerts };
  });

  bodyGeom.setAttribute('position', new THREE.Float32BufferAttribute(bodyPositions, 3));
  bodyGeom.setAttribute('normal', new THREE.Float32BufferAttribute(bodyNormals, 3));

  const bodyMat = new THREE.MeshStandardMaterial({
    color: PLASTIC_COLOR,
    roughness: 0.85,
    metalness: 0.1
  });
  const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
  bodyMesh.name = 'megaminx-body';
  group.add(bodyMesh);

  // 2. Build 11 stickers per face on top of the black body
  faces.forEach((faceData) => {
    const { faceIdx, center, normal, verts } = faceData;
    const faceSpec = MEGAMINX_FACE_SPECS[faceIdx] || MEGAMINX_FACE_SPECS[0];

    const faceGroup = new THREE.Group();
    faceGroup.name = `face-${faceSpec.id}`;
    faceGroup.userData = { faceId: faceSpec.id, faceIndex: faceIdx };

    const stickerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(faceSpec.colorHex),
      roughness: 0.28,
      metalness: 0.06,
      side: THREE.DoubleSide
    });

    if (verts.length !== 5) {
      group.add(faceGroup);
      return;
    }

    // 2D orthonormal basis on the face plane
    const e1 = new THREE.Vector3().subVectors(verts[0], center).normalize();
    const e2 = new THREE.Vector3().crossVectors(normal, e1).normalize();

    const to2D = (v) => {
      const d = new THREE.Vector3().subVectors(v, center);
      return { x: d.dot(e1), y: d.dot(e2) };
    };

    const to3D = (p2d, offset = normalOffset) => {
      return center.clone()
        .addScaledVector(e1, p2d.x)
        .addScaledVector(e2, p2d.y)
        .addScaledVector(normal, offset);
    };

    function lineIntersect(p1, p2, p3, p4) {
      const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
      if (Math.abs(denom) < 1e-6) return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
      return { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) };
    }

    function insetPoly(pts, factor = 0.94) {
      const gx = pts.reduce((sum, p) => sum + p.x, 0) / pts.length;
      const gy = pts.reduce((sum, p) => sum + p.y, 0) / pts.length;
      return pts.map(p => ({
        x: gx + factor * (p.x - gx),
        y: gy + factor * (p.y - gy)
      }));
    }

    const V = verts.map(to2D);
    const alpha = 0.44; // Proportional scale for center pentagon
    const P = V.map(v => ({ x: alpha * v.x, y: alpha * v.y }));

    // 5 straight cut lines extending the 5 edges of the center pentagon
    const cuts = [];
    for (let k = 0; k < 5; k++) {
      const p0 = P[k];
      const p1 = P[(k + 1) % 5];
      const vPrev = V[(k + 4) % 5];
      const v0 = V[k];
      const v1 = V[(k + 1) % 5];
      const vNext = V[(k + 2) % 5];
      const qLeft = lineIntersect(p0, p1, vPrev, v0);
      const qRight = lineIntersect(p0, p1, v1, vNext);
      cuts.push({ qLeft, qRight });
    }

    // A. Center Regular Pentagon (1 piece)
    const c2D = insetPoly(P, 0.94);
    const c3D = c2D.map(p => to3D(p));
    const centerGeom = new THREE.BufferGeometry();
    const cv = [
      ...c3D[0].toArray(), ...c3D[1].toArray(), ...c3D[2].toArray(),
      ...c3D[0].toArray(), ...c3D[2].toArray(), ...c3D[3].toArray(),
      ...c3D[0].toArray(), ...c3D[3].toArray(), ...c3D[4].toArray()
    ];
    centerGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cv), 3));
    centerGeom.computeVertexNormals();

    const centerMesh = new THREE.Mesh(centerGeom, stickerMat);
    centerMesh.name = `sticker-${faceSpec.id}-center`;
    centerMesh.userData = { faceId: faceSpec.id, pieceType: 'center', faceIndex: faceIdx };
    faceGroup.add(centerMesh);

    // B. 5 Edge Stickers (Trapezoids) & 5 Corner Stickers (Kites)
    for (let k = 0; k < 5; k++) {
      // Corner Kite at vertex V[k]
      const prevCut = cuts[(k + 4) % 5];
      const thisCut = cuts[k];
      const corner2D = insetPoly([V[k], prevCut.qRight, P[k], thisCut.qLeft], 0.94);
      const corner3D = corner2D.map(p => to3D(p));

      const cornerGeom = new THREE.BufferGeometry();
      const cov = [
        ...corner3D[0].toArray(), ...corner3D[1].toArray(), ...corner3D[2].toArray(),
        ...corner3D[0].toArray(), ...corner3D[2].toArray(), ...corner3D[3].toArray()
      ];
      cornerGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cov), 3));
      cornerGeom.computeVertexNormals();

      const cornerMesh = new THREE.Mesh(cornerGeom, stickerMat);
      cornerMesh.name = `sticker-${faceSpec.id}-corner-${k}`;
      cornerMesh.userData = { faceId: faceSpec.id, pieceType: 'corner', faceIndex: faceIdx, cornerIndex: k };
      faceGroup.add(cornerMesh);

      // Edge Trapezoid along outer edge V[k] -> V[k+1]
      const nextCut = cuts[(k + 1) % 5];
      const edge2D = insetPoly([prevCut.qRight, nextCut.qLeft, P[(k + 1) % 5], P[k]], 0.94);
      const edge3D = edge2D.map(p => to3D(p));

      const edgeGeom = new THREE.BufferGeometry();
      const ev = [
        ...edge3D[0].toArray(), ...edge3D[1].toArray(), ...edge3D[2].toArray(),
        ...edge3D[0].toArray(), ...edge3D[2].toArray(), ...edge3D[3].toArray()
      ];
      edgeGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ev), 3));
      edgeGeom.computeVertexNormals();

      const edgeMesh = new THREE.Mesh(edgeGeom, stickerMat);
      edgeMesh.name = `sticker-${faceSpec.id}-edge-${k}`;
      edgeMesh.userData = { faceId: faceSpec.id, pieceType: 'edge', faceIndex: faceIdx, edgeIndex: k };
      faceGroup.add(edgeMesh);
    }

    group.add(faceGroup);
  });

  group.updateMatrixWorld(true);
  return group;
}
