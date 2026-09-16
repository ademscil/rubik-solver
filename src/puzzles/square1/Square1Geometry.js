/**
 * src/puzzles/square1/Square1Geometry.js
 * 3D Geometry Generator for Square-1 (Shape-Shifting Puzzle)
 * 
 * Anatomy:
 * - In solved state, Square-1 forms a perfect square prism (cube)
 * - 3 Layers: Top (U - White), Equator (Middle), Bottom (D - Yellow)
 * - 4 Corner pieces per layer (60° span, 2 side stickers each)
 * - 4 Edge pieces per layer (30° span, 1 side sticker each)
 * - 2 Equator pieces in middle layer
 * - 18 total pieces (8 top + 2 middle + 8 bottom)
 * - Side face colors: Front (Green), Back (Blue), Right (Red), Left (Orange)
 */

import * as THREE from 'three';

export const SQUARE1_COLORS = Object.freeze({
  U: '#FFFFFF', // White (Top)
  D: '#FFD500', // Yellow (Bottom)
  F: '#009B48', // Green (Front)
  B: '#0046AD', // Blue (Back)
  R: '#B71234', // Red (Right)
  L: '#FF5800'  // Orange (Left)
});

const COLOR_MAP = {
  U: 0xFFFFFF,
  D: 0xFFD500,
  F: 0x009B48,
  B: 0x0046AD,
  R: 0xB71234,
  L: 0xFF5800
};

const PLASTIC_COLOR = 0x181820;

/**
 * Computes intersection of ray from (0, 0) at angle theta with the square [-L, L] x [-L, L]
 * @param {number} theta - Angle in radians
 * @param {number} L - Half-width of square
 * @returns {THREE.Vector2}
 */
function raySquareIntersect(theta, L) {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const absCos = Math.abs(cos);
  const absSin = Math.abs(sin);

  let scale;
  if (absCos > absSin) {
    scale = L / absCos;
  } else {
    scale = L / absSin;
  }

  return new THREE.Vector2(scale * cos, scale * sin);
}

/**
 * Creates 3D solid piece mesh for Square-1 top or bottom layer
 */
function createSquare1PieceMesh({
  isTop,
  type, // 'kite' (corner) | 'triangle' (edge)
  startAngle,
  endAngle,
  L,
  yMin,
  yMax,
  capColor,
  sideColors
}) {
  const pieceGroup = new THREE.Group();
  pieceGroup.userData = { pieceType: type, isTop };

  const p0 = new THREE.Vector2(0, 0);
  const p1 = raySquareIntersect(startAngle, L);
  const p2 = raySquareIntersect(endAngle, L);

  // If corner kite (60°), add corner vertex in between
  const midAngle = (startAngle + endAngle) / 2;
  const isKite = type === 'kite';
  const midCorner = isKite ? raySquareIntersect(midAngle, L) : null;

  // 1. Solid black plastic piece body
  const outerVerts = isKite ? [p1, midCorner, p2] : [p1, p2];

  const bodyGeom = new THREE.BufferGeometry();
  const bPos = [];

  // Cap face (top if isTop, bottom if !isTop)
  const capY = isTop ? yMax : yMin;
  const baseY = isTop ? yMin : yMax;

  if (isKite) {
    // 2 triangles for cap
    bPos.push(
      0, capY, 0,  p1.x, capY, p1.y,  midCorner.x, capY, midCorner.y,
      0, capY, 0,  midCorner.x, capY, midCorner.y,  p2.x, capY, p2.y,
      // base face
      0, baseY, 0,  midCorner.x, baseY, midCorner.y,  p1.x, baseY, p1.y,
      0, baseY, 0,  p2.x, baseY, p2.y,  midCorner.x, baseY, midCorner.y
    );
  } else {
    // 1 triangle for cap
    bPos.push(
      0, capY, 0,  p1.x, capY, p1.y,  p2.x, capY, p2.y,
      // base face
      0, baseY, 0,  p2.x, baseY, p2.y,  p1.x, baseY, p1.y
    );
  }

  // Internal cut walls (from center 0,0 to p1 and p2)
  bPos.push(
    0, yMin, 0,  p1.x, yMin, p1.y,  p1.x, yMax, p1.y,
    0, yMin, 0,  p1.x, yMax, p1.y,  0, yMax, 0,
    0, yMin, 0,  0, yMax, 0,        p2.x, yMax, p2.y,
    0, yMin, 0,  p2.x, yMax, p2.y,  p2.x, yMin, p2.y
  );

  // Outer walls
  for (let s = 0; s < outerVerts.length - 1; s++) {
    const o0 = outerVerts[s];
    const o1 = outerVerts[s + 1];
    bPos.push(
      o0.x, yMin, o0.y,  o1.x, yMin, o1.y,  o1.x, yMax, o1.y,
      o0.x, yMin, o0.y,  o1.x, yMax, o1.y,  o0.x, yMax, o0.y
    );
  }

  bodyGeom.setAttribute('position', new THREE.Float32BufferAttribute(bPos, 3));
  bodyGeom.computeVertexNormals();

  const plasticMat = new THREE.MeshStandardMaterial({
    color: PLASTIC_COLOR,
    roughness: 0.82,
    metalness: 0.08
  });
  const bodyMesh = new THREE.Mesh(bodyGeom, plasticMat);
  pieceGroup.add(bodyMesh);

  // 2. Cap Sticker (White on top, Yellow on bottom)
  const capInset = 0.88;
  const capOffset = isTop ? 0.012 : -0.012;
  const stickerCapY = capY + capOffset;

  const capStickerGeom = new THREE.BufferGeometry();
  const csPos = [];

  const scalePt = (pt, center, factor) => {
    return new THREE.Vector2().lerpVectors(center, pt, factor);
  };

  if (isKite) {
    const cCenter = new THREE.Vector2().add(p0).add(p1).add(midCorner).add(p2).multiplyScalar(0.25);
    const sp0 = scalePt(p0, cCenter, capInset);
    const sp1 = scalePt(p1, cCenter, capInset);
    const spMid = scalePt(midCorner, cCenter, capInset);
    const sp2 = scalePt(p2, cCenter, capInset);

    csPos.push(
      sp0.x, stickerCapY, sp0.y,  sp1.x, stickerCapY, sp1.y,  spMid.x, stickerCapY, spMid.y,
      sp0.x, stickerCapY, sp0.y,  spMid.x, stickerCapY, spMid.y,  sp2.x, stickerCapY, sp2.y
    );
  } else {
    const eCenter = new THREE.Vector2().add(p0).add(p1).add(p2).divideScalar(3);
    const sp0 = scalePt(p0, eCenter, capInset);
    const sp1 = scalePt(p1, eCenter, capInset);
    const sp2 = scalePt(p2, eCenter, capInset);

    csPos.push(
      sp0.x, stickerCapY, sp0.y,  sp1.x, stickerCapY, sp1.y,  sp2.x, stickerCapY, sp2.y
    );
  }

  capStickerGeom.setAttribute('position', new THREE.Float32BufferAttribute(csPos, 3));
  capStickerGeom.computeVertexNormals();

  const capStickerMat = new THREE.MeshStandardMaterial({
    color: capColor,
    roughness: 0.28,
    metalness: 0.05,
    side: THREE.DoubleSide
  });
  const capStickerMesh = new THREE.Mesh(capStickerGeom, capStickerMat);
  pieceGroup.add(capStickerMesh);

  // 3. Side Stickers (Front, Back, Right, Left)
  for (let s = 0; s < outerVerts.length - 1; s++) {
    const o0 = outerVerts[s];
    const o1 = outerVerts[s + 1];
    const sideColor = sideColors[s] || COLOR_MAP.F;

    // Normal of this side segment
    const wallDir = new THREE.Vector2().subVectors(o1, o0).normalize();
    const wallNormal = new THREE.Vector2(-wallDir.y, wallDir.x);

    const insetW = 0.90;
    const midWall = new THREE.Vector2().addVectors(o0, o1).multiplyScalar(0.5);
    const sw0 = scalePt(o0, midWall, insetW);
    const sw1 = scalePt(o1, midWall, insetW);
    const wallOff = 0.012;

    const sYMin = yMin + 0.04;
    const sYMax = yMax - 0.04;

    const sideGeom = new THREE.BufferGeometry();
    const sidePos = [
      sw0.x + wallNormal.x * wallOff, sYMin, sw0.y + wallNormal.y * wallOff,
      sw1.x + wallNormal.x * wallOff, sYMin, sw1.y + wallNormal.y * wallOff,
      sw1.x + wallNormal.x * wallOff, sYMax, sw1.y + wallNormal.y * wallOff,

      sw0.x + wallNormal.x * wallOff, sYMin, sw0.y + wallNormal.y * wallOff,
      sw1.x + wallNormal.x * wallOff, sYMax, sw1.y + wallNormal.y * wallOff,
      sw0.x + wallNormal.x * wallOff, sYMax, sw0.y + wallNormal.y * wallOff
    ];
    sideGeom.setAttribute('position', new THREE.Float32BufferAttribute(sidePos, 3));
    sideGeom.computeVertexNormals();

    const sideMat = new THREE.MeshStandardMaterial({
      color: sideColor,
      roughness: 0.28,
      metalness: 0.05,
      side: THREE.DoubleSide
    });
    const sideMesh = new THREE.Mesh(sideGeom, sideMat);
    pieceGroup.add(sideMesh);
  }

  return pieceGroup;
}

/**
 * Builds authentic Square-1 cube 3D model with 18 pieces
 * @param {Object} [options]
 * @returns {THREE.Group}
 */
export function buildSquare1Model(options = {}) {
  const group = new THREE.Group();
  group.name = 'square1-model';
  group.userData = {
    puzzleType: 'square1',
    isSquare1: true,
    totalPieces: 18,
    kitesPerLayer: 4,
    trianglesPerLayer: 4,
    equatorPieces: 2
  };

  const L = options.radius || 1.35; // Half-size of the square profile
  const topYMin = 0.35;
  const topYMax = 1.05;
  const botYMin = -1.05;
  const botYMax = -0.35;
  const midYMin = -0.30;
  const midYMax = 0.30;

  // Layer groups required by kinematics
  const topLayer = new THREE.Group();
  topLayer.name = 'layer-top';
  const midLayer = new THREE.Group();
  midLayer.name = 'layer-middle';
  const botLayer = new THREE.Group();
  botLayer.name = 'layer-bottom';

  // 8 Pieces per layer alternating Kite (60°) and Edge Triangle (30°) around 360°:
  // Starts at -15° (Right/Front boundary)
  // 0: Right Edge: -15° to 15° (30°) -> Right (+X: Red)
  // 1: Top-Right Corner: 15° to 75° (60°) -> Right (+X: Red) and Front (+Z: Green)
  // 2: Front Edge: 75° to 105° (30°) -> Front (+Z: Green)
  // 3: Front-Left Corner: 105° to 165° (60°) -> Front (+Z: Green) and Left (-X: Orange)
  // 4: Left Edge: 165° to 195° (30°) -> Left (-X: Orange)
  // 5: Back-Left Corner: 195° to 255° (60°) -> Left (-X: Orange) and Back (-Z: Blue)
  // 6: Back Edge: 255° to 285° (30°) -> Back (-Z: Blue)
  // 7: Back-Right Corner: 285° to 345° (60°) -> Back (-Z: Blue) and Right (+X: Red)
  const pieceConfigs = [
    { type: 'triangle', span: 30, sideColors: [COLOR_MAP.R] },
    { type: 'kite',     span: 60, sideColors: [COLOR_MAP.R, COLOR_MAP.F] },
    { type: 'triangle', span: 30, sideColors: [COLOR_MAP.F] },
    { type: 'kite',     span: 60, sideColors: [COLOR_MAP.F, COLOR_MAP.L] },
    { type: 'triangle', span: 30, sideColors: [COLOR_MAP.L] },
    { type: 'kite',     span: 60, sideColors: [COLOR_MAP.L, COLOR_MAP.B] },
    { type: 'triangle', span: 30, sideColors: [COLOR_MAP.B] },
    { type: 'kite',     span: 60, sideColors: [COLOR_MAP.B, COLOR_MAP.R] }
  ];

  let currentAngle = -15;

  pieceConfigs.forEach((cfg, idx) => {
    const startRad = (currentAngle * Math.PI) / 180;
    const endRad = ((currentAngle + cfg.span) * Math.PI) / 180;

    // Top layer piece (White cap)
    const topPiece = createSquare1PieceMesh({
      isTop: true,
      type: cfg.type,
      startAngle: startRad,
      endAngle: endRad,
      L,
      yMin: topYMin,
      yMax: topYMax,
      capColor: COLOR_MAP.U,
      sideColors: cfg.sideColors
    });
    topPiece.name = `top-${cfg.type}-${idx}`;
    topLayer.add(topPiece);

    // Bottom layer piece (Yellow cap)
    const botPiece = createSquare1PieceMesh({
      isTop: false,
      type: cfg.type,
      startAngle: startRad,
      endAngle: endRad,
      L,
      yMin: botYMin,
      yMax: botYMax,
      capColor: COLOR_MAP.D,
      sideColors: cfg.sideColors
    });
    botPiece.name = `bottom-${cfg.type}-${idx}`;
    botLayer.add(botPiece);

    currentAngle += cfg.span;
  });

  // Middle Layer (Equator): 2 half-square blocks split along slice cutting plane
  const createEquatorHalf = (isRight) => {
    const halfGroup = new THREE.Group();
    halfGroup.name = isRight ? 'equator-right' : 'equator-left';

    const xMin = isRight ? 0 : -L;
    const xMax = isRight ? L : 0;
    const zMin = -L;
    const zMax = L;

    const bGeom = new THREE.BoxGeometry(xMax - xMin, midYMax - midYMin, zMax - zMin);
    const bMat = new THREE.MeshStandardMaterial({
      color: PLASTIC_COLOR,
      roughness: 0.85,
      metalness: 0.1
    });
    const bMesh = new THREE.Mesh(bGeom, bMat);
    bMesh.position.set((xMin + xMax) / 2, (midYMin + midYMax) / 2, (zMin + zMax) / 2);
    halfGroup.add(bMesh);

    // Front/Back/Side stickers for equator
    const stInset = 0.88;
    const stOff = 0.012;
    const sH = (midYMax - midYMin) * 0.85;

    // Front sticker
    const fW = (xMax - xMin) * stInset;
    const fGeom = new THREE.PlaneGeometry(fW, sH);
    const fMat = new THREE.MeshStandardMaterial({ color: COLOR_MAP.F, roughness: 0.28, side: THREE.DoubleSide });
    const fMesh = new THREE.Mesh(fGeom, fMat);
    fMesh.position.set((xMin + xMax) / 2, (midYMin + midYMax) / 2, zMax + stOff);
    halfGroup.add(fMesh);

    // Back sticker
    const bStGeom = new THREE.PlaneGeometry(fW, sH);
    const bStMat = new THREE.MeshStandardMaterial({ color: COLOR_MAP.B, roughness: 0.28, side: THREE.DoubleSide });
    const bStMesh = new THREE.Mesh(bStGeom, bStMat);
    bStMesh.position.set((xMin + xMax) / 2, (midYMin + midYMax) / 2, zMin - stOff);
    bStMesh.rotation.y = Math.PI;
    halfGroup.add(bStMesh);

    // Outer side sticker (Right or Left)
    const oColor = isRight ? COLOR_MAP.R : COLOR_MAP.L;
    const oW = (zMax - zMin) * stInset;
    const oGeom = new THREE.PlaneGeometry(oW, sH);
    const oMat = new THREE.MeshStandardMaterial({ color: oColor, roughness: 0.28, side: THREE.DoubleSide });
    const oMesh = new THREE.Mesh(oGeom, oMat);
    const sideX = isRight ? xMax + stOff : xMin - stOff;
    oMesh.position.set(sideX, (midYMin + midYMax) / 2, (zMin + zMax) / 2);
    oMesh.rotation.y = isRight ? Math.PI / 2 : -Math.PI / 2;
    halfGroup.add(oMesh);

    return halfGroup;
  };

  midLayer.add(createEquatorHalf(true));
  midLayer.add(createEquatorHalf(false));

  group.add(topLayer);
  group.add(midLayer);
  group.add(botLayer);

  group.updateMatrixWorld(true);
  return group;
}
