/**
 * src/puzzles/pyraminx/PyraminxKinematics.js
 * Pyraminx move parsing and animation engine
 * 
 * Pyraminx notation:
 * - Tips: u, r, l, b (lowercase) - 120 degree tip rotations
 * - Layers: U, R, L, B (uppercase) - 120 degree layer rotations
 * - Modifiers: ' (inverse/counter-clockwise)
 */

import * as THREE from 'three';

const R = 2.2;
const yBase = -R / 3;
const rBase = R * (Math.sqrt(8) / 3);

// Pyraminx axes - each vertex defines a rotation axis
export const PYRAMINX_AXES = {
  U: new THREE.Vector3(0, 1, 0),
  B: new THREE.Vector3(0, yBase, rBase).normalize(),
  L: new THREE.Vector3(-rBase * Math.cos(Math.PI / 6), yBase, -rBase * Math.sin(Math.PI / 6)).normalize(),
  R: new THREE.Vector3(rBase * Math.cos(Math.PI / 6), yBase, -rBase * Math.sin(Math.PI / 6)).normalize()
};

const MOVE_REGEX = /^([URLBurlb])([''])?$/;

/**
 * Parse a Pyraminx notation token
 * @param {string} token
 * @returns {{ token: string, axis: THREE.Vector3, face: string, isTip: boolean, dir: number, angle: number }}
 */
export function parsePyraminxMove(token) {
  const clean = token.trim();
  const match = clean.match(MOVE_REGEX);
  if (!match) {
    throw new Error(`Invalid Pyraminx notation: '${clean}'`);
  }

  const [, rawFace, modifier] = match;
  const isTip = rawFace === rawFace.toLowerCase();
  const face = rawFace.toUpperCase();
  const dir = modifier ? -1 : 1;
  const angle = (2 * Math.PI / 3) * dir; // 120 degrees

  return {
    token: clean,
    axis: PYRAMINX_AXES[face].clone(),
    face,
    isTip,
    dir,
    angle
  };
}

/**
 * Parse algorithm string into move tokens
 * @param {string} algString
 * @returns {string[]}
 */
export function parseAlgorithm(algString) {
  if (!algString || typeof algString !== 'string') return [];
  return algString.trim().split(/\s+/).filter(Boolean);
}

/**
 * Get the inverse of a Pyraminx move
 * @param {string} move
 * @returns {string}
 */
export function getInverseMove(move) {
  if (move.endsWith("'")) return move.slice(0, -1);
  return move + "'";
}

/**
 * Generate a random Pyraminx scramble
 * @param {number} [length=8]
 * @returns {string}
 */
export function generateScramble(length = 8) {
  const faces = ['U', 'R', 'L', 'B'];
  const tips = ['u', 'r', 'l', 'b'];
  const modifiers = ['', "'"];
  const moves = [];
  let lastFace = '';

  // Layer moves
  const layerCount = Math.max(4, length - 4);
  for (let i = 0; i < layerCount; i++) {
    let face;
    do {
      face = faces[Math.floor(Math.random() * faces.length)];
    } while (face === lastFace);
    lastFace = face;
    moves.push(face + modifiers[Math.floor(Math.random() * modifiers.length)]);
  }

  // Tip moves (0-4 random tips at the end)
  const tipCount = Math.min(4, length - layerCount);
  for (let i = 0; i < tipCount; i++) {
    moves.push(tips[i] + modifiers[Math.floor(Math.random() * modifiers.length)]);
  }

  return moves.join(' ');
}


/**
 * Animate a Pyraminx move by rotating only the selected layer or tip piece
 * @param {THREE.Group} modelGroup
 * @param {string} moveStr
 * @param {() => void} [onComplete]
 * @param {number} [duration=300]
 * @param {THREE.Group} [pivotGroup]
 */
export function animatePyraminxMove(modelGroup, moveStr, onComplete, duration = 300, pivotGroup = null) {
  if (!modelGroup) {
    onComplete?.();
    return;
  }

  const moveInfo = parsePyraminxMove(moveStr);
  const { axis, angle, isTip } = moveInfo;
  const threshold = isTip ? 0.70 * R : 0.30 * R;

  // Find active solid facet groups belonging to this vertex / layer
  const activeMeshes = [];
  modelGroup.children.forEach((child) => {
    if (child.name && (child.name.startsWith('facet-') || child.userData?.isPyraminxFacet)) {
      const box = new THREE.Box3().setFromObject(child);
      const worldCenter = new THREE.Vector3();
      box.getCenter(worldCenter);
      const localCenter = modelGroup.worldToLocal(worldCenter.clone());
      if (localCenter.dot(axis) > threshold) {
        activeMeshes.push(child);
      }
    }
  });

  // Fallback for direct sticker meshes
  if (activeMeshes.length === 0) {
    modelGroup.traverse((child) => {
      if (child.isMesh && child.name && child.name.startsWith('sticker-')) {
        const box = new THREE.Box3().setFromObject(child);
        const worldCenter = new THREE.Vector3();
        box.getCenter(worldCenter);
        const localCenter = modelGroup.worldToLocal(worldCenter.clone());
        if (localCenter.dot(axis) > threshold) {
          activeMeshes.push(child);
        }
      }
    });
  }

  if (activeMeshes.length === 0) {
    onComplete?.();
    return;
  }

  const pivot = pivotGroup || new THREE.Group();
  pivot.rotation.set(0, 0, 0);
  pivot.position.set(0, 0, 0);
  pivot.updateMatrix();
  pivot.updateMatrixWorld(true);
  if (!pivot.parent && modelGroup.parent) {
    modelGroup.parent.add(pivot);
  } else if (!pivot.parent) {
    modelGroup.add(pivot);
  }

  activeMeshes.forEach(mesh => pivot.attach(mesh));

  const finalize = () => {
    activeMeshes.forEach(mesh => modelGroup.attach(mesh));
    if (pivot.parent) pivot.parent.remove(pivot);
    modelGroup.updateMatrixWorld(true);
    onComplete?.();
  };

  // Instant mode
  if (typeof requestAnimationFrame === 'undefined' || duration <= 0) {
    pivot.rotateOnAxis(axis, angle);
    pivot.updateMatrixWorld(true);
    finalize();
    return;
  }

  // Smooth easing animation
  const startTime = performance.now();
  let currentAngle = 0;

  const step = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1.0);
    const ease = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    const targetAngle = angle * ease;
    const delta = targetAngle - currentAngle;
    pivot.rotateOnAxis(axis, delta);
    pivot.updateMatrixWorld(true);
    currentAngle = targetAngle;

    if (progress < 1.0) {
      requestAnimationFrame(step);
    } else {
      finalize();
    }
  };

  requestAnimationFrame(step);
}

/**
 * Notation dictionary with Indonesian descriptions
 */
export const PYRAMINX_NOTATION = {
  'U':  { name: 'Atas', desc: 'Putar layer atas 120° searah jarum jam' },
  "U'": { name: 'Atas Balik', desc: 'Putar layer atas 120° berlawanan arah jarum jam' },
  'R':  { name: 'Kanan', desc: 'Putar layer kanan 120° searah jarum jam' },
  "R'": { name: 'Kanan Balik', desc: 'Putar layer kanan 120° berlawanan arah jarum jam' },
  'L':  { name: 'Kiri', desc: 'Putar layer kiri 120° searah jarum jam' },
  "L'": { name: 'Kiri Balik', desc: 'Putar layer kiri 120° berlawanan arah jarum jam' },
  'B':  { name: 'Belakang', desc: 'Putar layer belakang 120° searah jarum jam' },
  "B'": { name: 'Belakang Balik', desc: 'Putar layer belakang 120° berlawanan arah jarum jam' },
  'u':  { name: 'Tip Atas', desc: 'Putar ujung atas saja 120° searah jarum jam' },
  "u'": { name: 'Tip Atas Balik', desc: 'Putar ujung atas saja 120° berlawanan arah jarum jam' },
  'r':  { name: 'Tip Kanan', desc: 'Putar ujung kanan saja 120° searah jarum jam' },
  "r'": { name: 'Tip Kanan Balik', desc: 'Putar ujung kanan saja 120° berlawanan arah jarum jam' },
  'l':  { name: 'Tip Kiri', desc: 'Putar ujung kiri saja 120° searah jarum jam' },
  "l'": { name: 'Tip Kiri Balik', desc: 'Putar ujung kiri saja 120° berlawanan arah jarum jam' },
  'b':  { name: 'Tip Belakang', desc: 'Putar ujung belakang saja 120° searah jarum jam' },
  "b'": { name: 'Tip Belakang Balik', desc: 'Putar ujung belakang saja 120° berlawanan arah jarum jam' }
};

/**
 * Get move info for a Pyraminx notation token
 * @param {string} move
 * @returns {import('../types.js').MoveInfo}
 */
export function getMoveInfo(move) {
  const info = PYRAMINX_NOTATION[move];
  if (info) return info;
  return { name: move, desc: `Gerakan Pyraminx: ${move}` };
}

