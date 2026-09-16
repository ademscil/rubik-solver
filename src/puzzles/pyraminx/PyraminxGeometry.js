/**
 * src/puzzles/pyraminx/PyraminxGeometry.js
 * 3D Geometry Generator for Pyraminx (Tetrahedron Puzzle)
 * 
 * Creates a tetrahedron composed of 14 visible pieces:
 * - 4 tips (axial corners)
 * - 6 edges
 * - 4 centers
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

const CORE_COLOR = 0x1a1a2e;

/**
 * Helper to create a triangular sticker mesh
 */
function createTriangleSticker(size, color, isInverted = false) {
  const shape = new THREE.Shape();
  const h = size * Math.sqrt(3) / 2;
  
  if (isInverted) {
    shape.moveTo(0, -h * 0.6);
    shape.lineTo(-size / 2, h * 0.4);
    shape.lineTo(size / 2, h * 0.4);
    shape.closePath();
  } else {
    shape.moveTo(0, h * 0.6);
    shape.lineTo(-size / 2, -h * 0.4);
    shape.lineTo(size / 2, -h * 0.4);
    shape.closePath();
  }

  const geometry = new THREE.ShapeGeometry(shape);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.3,
    metalness: 0.1,
    side: THREE.DoubleSide
  });
  return new THREE.Mesh(geometry, material);
}

/**
 * Build Pyraminx 3D model
 * Uses a simplified representation with 4 large triangular faces,
 * each subdivided into 9 smaller triangular stickers arranged in a 3-row pattern.
 * 
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

  const scale = options.scale || 1.8;
  
  // Tetrahedron vertices
  const sqrt2 = Math.sqrt(2);
  const sqrt6 = Math.sqrt(6);
  const a = scale;
  
  const vertices = [
    new THREE.Vector3(0, a * sqrt2 / sqrt6 * 2, 0),          // Top
    new THREE.Vector3(-a, -a * sqrt2 / sqrt6, a * sqrt2 / Math.sqrt(3)),   // Front-Left
    new THREE.Vector3(a, -a * sqrt2 / sqrt6, a * sqrt2 / Math.sqrt(3)),    // Front-Right
    new THREE.Vector3(0, -a * sqrt2 / sqrt6, -a * 2 * sqrt2 / sqrt6)      // Back
  ];

  // 4 faces of the tetrahedron: [v0, v1, v2] with face color
  const faces = [
    { verts: [0, 1, 2], color: COLOR_MAP.F, id: 'F', name: 'Depan' },   // Front
    { verts: [0, 2, 3], color: COLOR_MAP.R, id: 'R', name: 'Kanan' },   // Right
    { verts: [0, 3, 1], color: COLOR_MAP.L, id: 'L', name: 'Kiri' },    // Left
    { verts: [1, 3, 2], color: COLOR_MAP.D, id: 'D', name: 'Bawah' }    // Bottom
  ];

  // Build each face with 9 triangular stickers (rows: 1, 3, 5 from top)
  faces.forEach(face => {
    const [i0, i1, i2] = face.verts;
    const v0 = vertices[i0].clone();
    const v1 = vertices[i1].clone();
    const v2 = vertices[i2].clone();

    const faceStickers = [];
    const faceGroup = new THREE.Group();
    faceGroup.name = `face-${face.id}`;

    // Normal for face
    const edge1 = new THREE.Vector3().subVectors(v1, v0);
    const edge2 = new THREE.Vector3().subVectors(v2, v0);
    const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();

    // Subdivide into 3 rows of triangles
    const rows = 3;
    let stickerIdx = 0;

    for (let row = 0; row < rows; row++) {
      // Number of triangles in this row: 2*row + 1
      const triCount = 2 * row + 1;

      for (let col = 0; col < triCount; col++) {
        const isUpward = (col % 2 === 0);
        
        // Barycentric subdivision
        const t0 = row / rows;
        const t1 = (row + 1) / rows;
        
        let p0, p1, p2;
        
        if (isUpward) {
          // Upward pointing triangle
          const colHalf = Math.floor(col / 2);
          const s0 = colHalf / (row + 1);
          const s1 = (colHalf + 1) / (row + 1);
          const s0t = row > 0 ? colHalf / row : 0;
          
          p0 = new THREE.Vector3().lerpVectors(
            new THREE.Vector3().lerpVectors(v0, v1, t0),
            new THREE.Vector3().lerpVectors(v0, v2, t0),
            row > 0 ? s0t : 0
          );
          p1 = new THREE.Vector3().lerpVectors(
            new THREE.Vector3().lerpVectors(v0, v1, t1),
            new THREE.Vector3().lerpVectors(v0, v2, t1),
            s0
          );
          p2 = new THREE.Vector3().lerpVectors(
            new THREE.Vector3().lerpVectors(v0, v1, t1),
            new THREE.Vector3().lerpVectors(v0, v2, t1),
            s1
          );
        } else {
          // Downward pointing triangle
          const colHalf = Math.floor(col / 2);
          const s0 = colHalf / row;
          const s1 = (colHalf + 1) / row;
          const s0b = (colHalf + 1) / (row + 1);
          
          p0 = new THREE.Vector3().lerpVectors(
            new THREE.Vector3().lerpVectors(v0, v1, t0),
            new THREE.Vector3().lerpVectors(v0, v2, t0),
            s0
          );
          p1 = new THREE.Vector3().lerpVectors(
            new THREE.Vector3().lerpVectors(v0, v1, t0),
            new THREE.Vector3().lerpVectors(v0, v2, t0),
            s1
          );
          p2 = new THREE.Vector3().lerpVectors(
            new THREE.Vector3().lerpVectors(v0, v1, t1),
            new THREE.Vector3().lerpVectors(v0, v2, t1),
            s0b
          );
        }

        // Create sticker geometry
        const geometry = new THREE.BufferGeometry();
        const verts = new Float32Array([
          p0.x, p0.y, p0.z,
          p1.x, p1.y, p1.z,
          p2.x, p2.y, p2.z
        ]);
        geometry.setAttribute('position', new THREE.BufferAttribute(verts, 3));
        geometry.computeVertexNormals();

        // Slight offset along normal to prevent z-fighting
        const center = new THREE.Vector3().addVectors(p0, p1).add(p2).divideScalar(3);
        
        const material = new THREE.MeshStandardMaterial({
          color: face.color,
          roughness: 0.3,
          metalness: 0.1,
          side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = `sticker-${face.id}-${stickerIdx}`;
        mesh.userData = {
          faceId: face.id,
          stickerIndex: stickerIdx,
          row,
          col,
          isUpward,
          originalColor: face.color,
          center: center.clone()
        };

        faceGroup.add(mesh);
        faceStickers.push(mesh);
        stickerIdx++;
      }
    }

    group.add(faceGroup);
    group.userData.stickers[face.id] = faceStickers;
  });

  // Build core tetrahedron body (dark)
  const coreGeometry = new THREE.TetrahedronGeometry(scale * 0.95);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: CORE_COLOR,
    roughness: 0.8,
    metalness: 0
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  core.name = 'pyraminx-core';
  group.add(core);

  group.updateMatrixWorld(true);
  return group;
}

