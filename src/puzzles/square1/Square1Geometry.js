/**
 * src/puzzles/square1/Square1Geometry.js
 * 3D Geometry Generator for Square-1 (Shape-Shifting Disc/Cube)
 * 
 * Anatomy:
 * - 3 Layers: Top (U), Equator (Middle), Bottom (D)
 * - Top Layer: 4 corner kites (60°) + 4 triangular edges (30°) = 360°
 * - Bottom Layer: 4 corner kites (60°) + 4 triangular edges (30°) = 360°
 * - Middle Layer: 2 equator pieces split along cutting plane
 * - Total pieces: 8 + 2 + 8 = 18 pieces
 */

import * as THREE from 'three';

export const SQUARE1_COLORS = Object.freeze({
  U: '#FFFFFF', // White
  D: '#FFD500', // Yellow
  F: '#009B48', // Green
  B: '#0046AD', // Blue
  R: '#B71234', // Red
  L: '#FF5800'  // Orange
});

const CORE_COLOR = 0x141419;

/**
 * Creates a wedge mesh for top or bottom layer (kite or triangle).
 */
function createWedgeGeometry(startAngle, endAngle, yMin, yMax, radius = 1.35) {
  const geom = new THREE.BufferGeometry();
  const span = endAngle - startAngle;
  const segments = span > Math.PI / 4 ? 4 : 2;
  const dTheta = span / segments;

  const positions = [];

  // Top and bottom arc points
  for (let s = 0; s < segments; s++) {
    const t0 = startAngle + s * dTheta;
    const t1 = startAngle + (s + 1) * dTheta;

    const x0 = radius * Math.cos(t0);
    const z0 = radius * Math.sin(t0);
    const x1 = radius * Math.cos(t1);
    const z1 = radius * Math.sin(t1);

    // Top face triangle (Y = yMax)
    positions.push(
      0, yMax, 0,
      x0, yMax, z0,
      x1, yMax, z1
    );

    // Bottom face triangle (Y = yMin)
    positions.push(
      0, yMin, 0,
      x1, yMin, z1,
      x0, yMin, z0
    );

    // Outer curved/faceted wall
    positions.push(
      x0, yMin, z0,
      x1, yMin, z1,
      x1, yMax, z1,

      x0, yMin, z0,
      x1, yMax, z1,
      x0, yMax, z0
    );
  }

  // Side cut walls from center to outer arc endpoints
  const cos0 = Math.cos(startAngle);
  const sin0 = Math.sin(startAngle);
  positions.push(
    0, yMin, 0,
    0, yMax, 0,
    radius * cos0, yMax, radius * sin0,

    0, yMin, 0,
    radius * cos0, yMax, radius * sin0,
    radius * cos0, yMin, radius * sin0
  );

  const cos1 = Math.cos(endAngle);
  const sin1 = Math.sin(endAngle);
  positions.push(
    0, yMin, 0,
    radius * cos1, yMax, radius * sin1,
    0, yMax, 0,

    0, yMin, 0,
    radius * cos1, yMin, radius * sin1,
    radius * cos1, yMax, radius * sin1
  );

  geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geom.computeVertexNormals();
  return geom;
}

/**
 * Builds the 3D Square-1 model with 18 pieces across 3 layers.
 * @param {Object} [options]
 * @returns {THREE.Group}
 */
export function buildSquare1Model(options = {}) {
  const group = new THREE.Group();
  group.name = 'square1-model';
  group.userData = {
    puzzleType: 'square1',
    totalPieces: 18,
    kitesPerLayer: 4,
    trianglesPerLayer: 4,
    equatorPieces: 2
  };

  const radius = options.radius || 1.4;
  const topYMin = 0.35;
  const topYMax = 1.05;
  const botYMin = -1.05;
  const botYMax = -0.35;
  const midYMin = -0.30;
  const midYMax = 0.30;

  // Layer groups
  const topLayer = new THREE.Group();
  topLayer.name = 'layer-top';
  const midLayer = new THREE.Group();
  midLayer.name = 'layer-middle';
  const botLayer = new THREE.Group();
  botLayer.name = 'layer-bottom';

  // Materials
  const uMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(SQUARE1_COLORS.U), roughness: 0.35 });
  const dMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(SQUARE1_COLORS.D), roughness: 0.35 });
  const fMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(SQUARE1_COLORS.F), roughness: 0.35 });
  const bMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(SQUARE1_COLORS.B), roughness: 0.35 });
  const rMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(SQUARE1_COLORS.R), roughness: 0.35 });
  const lMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(SQUARE1_COLORS.L), roughness: 0.35 });
  const coreMat = new THREE.MeshStandardMaterial({ color: CORE_COLOR, roughness: 0.75 });

  // Helper to pick primary color for piece based on angle
  const getWedgeMat = (midAngle, isTop) => {
    const deg = ((midAngle * 180 / Math.PI) % 360 + 360) % 360;
    if (isTop) return uMat;
    return dMat;
  };

  // Top & Bottom piece definitions: 4 kites (60° each) and 4 edges (30° each)
  // Total 8 pieces: alternating kite and triangle around 360°
  const pieceSpans = [
    { type: 'kite',     span: Math.PI / 3 },     // 60°
    { type: 'triangle', span: Math.PI / 6 },     // 30°
    { type: 'kite',     span: Math.PI / 3 },     // 60°
    { type: 'triangle', span: Math.PI / 6 },     // 30°
    { type: 'kite',     span: Math.PI / 3 },     // 60°
    { type: 'triangle', span: Math.PI / 6 },     // 30°
    { type: 'kite',     span: Math.PI / 3 },     // 60°
    { type: 'triangle', span: Math.PI / 6 }      // 30°
  ];

  // Build Top Layer (8 pieces)
  let currentAngle = 0;
  pieceSpans.forEach((spec, idx) => {
    const endAngle = currentAngle + spec.span;
    const geom = createWedgeGeometry(currentAngle, endAngle, topYMin, topYMax, radius);
    const mat = getWedgeMat((currentAngle + endAngle) / 2, true);
    const mesh = new THREE.Mesh(geom, mat);
    mesh.name = `top-${spec.type}-${idx}`;
    mesh.userData = {
      layer: 'top',
      pieceType: spec.type,
      index: idx,
      startAngle: currentAngle,
      endAngle: endAngle
    };
    topLayer.add(mesh);
    currentAngle = endAngle;
  });

  // Build Bottom Layer (8 pieces)
  currentAngle = 0;
  pieceSpans.forEach((spec, idx) => {
    const endAngle = currentAngle + spec.span;
    const geom = createWedgeGeometry(currentAngle, endAngle, botYMin, botYMax, radius);
    const mat = getWedgeMat((currentAngle + endAngle) / 2, false);
    const mesh = new THREE.Mesh(geom, mat);
    mesh.name = `bottom-${spec.type}-${idx}`;
    mesh.userData = {
      layer: 'bottom',
      pieceType: spec.type,
      index: idx,
      startAngle: currentAngle,
      endAngle: endAngle
    };
    botLayer.add(mesh);
    currentAngle = endAngle;
  });

  // Build Middle Layer (2 equator pieces split along X = 0)
  // Left piece (X <= 0, angle PI/2 to 3PI/2)
  const eqGeomLeft = createWedgeGeometry(Math.PI / 2, (3 * Math.PI) / 2, midYMin, midYMax, radius * 0.98);
  const eqMeshLeft = new THREE.Mesh(eqGeomLeft, lMat);
  eqMeshLeft.name = 'middle-equator-left';
  eqMeshLeft.userData = { layer: 'middle', pieceType: 'equator', side: 'left' };
  midLayer.add(eqMeshLeft);

  // Right piece (X >= 0, angle -PI/2 to PI/2)
  const eqGeomRight = createWedgeGeometry(-Math.PI / 2, Math.PI / 2, midYMin, midYMax, radius * 0.98);
  const eqMeshRight = new THREE.Mesh(eqGeomRight, rMat);
  eqMeshRight.name = 'middle-equator-right';
  eqMeshRight.userData = { layer: 'middle', pieceType: 'equator', side: 'right' };
  midLayer.add(eqMeshRight);

  group.add(topLayer);
  group.add(midLayer);
  group.add(botLayer);

  group.updateMatrixWorld(true);
  return group;
}
