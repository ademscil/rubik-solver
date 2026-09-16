/**
 * src/puzzles/skewb/SkewbKinematics.js
 * Skewb move parsing and animation engine
 * 
 * Skewb notation:
 * - R, L, U, B - 120 degree corner turns
 * - Modifiers: ' (inverse)
 */

import * as THREE from 'three';

const SKEWB_AXES = {
  R: new THREE.Vector3(1, 1, 1).normalize(),
  L: new THREE.Vector3(-1, 1, 1).normalize(),
  U: new THREE.Vector3(-1, 1, -1).normalize(),
  B: new THREE.Vector3(1, 1, -1).normalize(),
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1)
};

const MOVE_REGEX = /^(([RLUB][']?)|([xyz]['2]?))$/;

export function parseSkewbMove(token) {
  if (!token || typeof token !== 'string') {
    throw new Error(`Invalid Skewb notation: '${token}'`);
  }
  const clean = token.trim();
  const match = clean.match(MOVE_REGEX);
  if (!match) throw new Error(`Invalid Skewb notation: '${clean}'`);

  const face = clean[0];
  const modifier = clean.slice(1);
  const isCubeRotation = ['x', 'y', 'z'].includes(face);
  const dir = modifier === "'" ? -1 : 1;

  let angle;
  if (isCubeRotation) {
    angle = modifier === '2' ? Math.PI : (Math.PI / 2) * dir;
  } else {
    angle = (2 * Math.PI / 3) * dir;
  }

  return {
    token: clean,
    axis: SKEWB_AXES[face].clone(),
    face,
    modifier,
    dir,
    angle,
    isCubeRotation
  };
}

export function parseAlgorithm(algString) {
  if (!algString || typeof algString !== 'string') return [];
  return algString.trim().split(/\s+/).filter(Boolean);
}

export function getInverseMove(move) {
  if (!move || typeof move !== 'string') return '';
  if (move.endsWith('2')) return move;
  if (move.endsWith("'")) return move.slice(0, -1);
  return move + "'";
}

export function generateScramble(length = 7) {
  const faces = ['R', 'L', 'U', 'B'];
  const modifiers = ['', "'"];
  const moves = [];
  let last = '';
  for (let i = 0; i < length; i++) {
    let f;
    do { f = faces[Math.floor(Math.random() * faces.length)]; } while (f === last);
    last = f;
    moves.push(f + modifiers[Math.floor(Math.random() * modifiers.length)]);
  }
  return moves.join(' ');
}

export function animateSkewbMove(modelGroup, moveStr, onComplete, duration = 300, pivotGroup = null) {
  if (!modelGroup) { onComplete?.(); return; }

  const moveInfo = parseSkewbMove(moveStr);
  const { axis, angle, isCubeRotation } = moveInfo;

  // Whole cube rotations (x, y, z)
  if (isCubeRotation) {
    if (typeof requestAnimationFrame === 'undefined' || duration <= 0) {
      const q = new THREE.Quaternion().setFromAxisAngle(axis, angle);
      modelGroup.quaternion.premultiply(q);
      modelGroup.updateMatrixWorld?.(true);
      onComplete?.();
      return;
    }

    const startQ = modelGroup.quaternion.clone();
    const rotQ = new THREE.Quaternion().setFromAxisAngle(axis, angle);
    const targetQ = rotQ.clone().multiply(startQ);
    const startTime = performance.now();

    const step = (now) => {
      const t = Math.min((now - startTime) / duration, 1.0);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      modelGroup.quaternion.slerpQuaternions(startQ, targetQ, ease);
      if (t < 1.0) requestAnimationFrame(step);
      else {
        modelGroup.quaternion.copy(targetQ);
        modelGroup.updateMatrixWorld?.(true);
        onComplete?.();
      }
    };
    requestAnimationFrame(step);
    return;
  }

  // World axis transformed by model's current orientation
  const worldAxis = axis.clone().applyQuaternion(modelGroup.quaternion).normalize();

  // Corner turn: rotate the 4 corner pieces and 3 center pieces as solid units!
  const activePieces = [];
  modelGroup.children.forEach((child) => {
    if (child.name && (child.name.startsWith('corner-piece-') || child.name.startsWith('center-piece-'))) {
      const box = new THREE.Box3().setFromObject(child);
      const worldCenter = new THREE.Vector3();
      box.getCenter(worldCenter);
      const localCenter = modelGroup.worldToLocal(worldCenter.clone());
      if (localCenter.dot(axis) > 0.05) {
        activePieces.push(child);
      }
    }
  });

  // Fallback if pieces are direct mesh children
  if (activePieces.length === 0) {
    modelGroup.traverse((child) => {
      if (child.isMesh && (child.name.startsWith('center-') || child.name.startsWith('corner-') || child.name.startsWith('core-'))) {
        const box = new THREE.Box3().setFromObject(child);
        const worldCenter = new THREE.Vector3();
        box.getCenter(worldCenter);
        const localCenter = modelGroup.worldToLocal(worldCenter.clone());
        if (localCenter.dot(axis) > 0.05) {
          activePieces.push(child);
        }
      }
    });
  }

  if (activePieces.length === 0) {
    onComplete?.();
    return;
  }

  const pivot = pivotGroup || new THREE.Group();
  pivot.rotation.set(0, 0, 0);
  pivot.position.set(0, 0, 0);
  pivot.quaternion.identity();
  pivot.updateMatrix();
  pivot.updateMatrixWorld(true);
  if (!pivot.parent && modelGroup.parent) {
    modelGroup.parent.add(pivot);
  } else if (!pivot.parent) {
    modelGroup.add(pivot);
  }

  activePieces.forEach(mesh => pivot.attach(mesh));

  const finalize = () => {
    activePieces.forEach(mesh => modelGroup.attach(mesh));
    if (!pivotGroup && pivot.parent) pivot.parent.remove(pivot);
    modelGroup.updateMatrixWorld(true);
    onComplete?.();
  };

  if (typeof requestAnimationFrame === 'undefined' || duration <= 0) {
    pivot.rotateOnAxis(worldAxis, angle);
    pivot.updateMatrixWorld(true);
    finalize();
    return;
  }

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
    pivot.rotateOnAxis(worldAxis, delta);
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

export const SKEWB_NOTATION = {
  'R':  { name: 'Kanan', desc: 'Putar sudut kanan-depan-bawah 120° searah jarum jam' },
  "R'": { name: 'Kanan Balik', desc: 'Putar sudut kanan-depan-bawah 120° berlawanan arah jarum jam' },
  'L':  { name: 'Kiri', desc: 'Putar sudut kiri-depan-bawah 120° searah jarum jam' },
  "L'": { name: 'Kiri Balik', desc: 'Putar sudut kiri-depan-bawah 120° berlawanan arah jarum jam' },
  'U':  { name: 'Atas', desc: 'Putar sudut kiri-belakang-atas 120° searah jarum jam' },
  "U'": { name: 'Atas Balik', desc: 'Putar sudut kiri-belakang-atas 120° berlawanan arah jarum jam' },
  'B':  { name: 'Belakang', desc: 'Putar sudut kanan-belakang-atas 120° searah jarum jam' },
  "B'": { name: 'Belakang Balik', desc: 'Putar sudut kanan-belakang-atas 120° berlawanan arah jarum jam' },
  'x':  { name: 'Rotasi X', desc: 'Putar seluruh kubus 90° searah jarum jam pada sumbu X' },
  "x'": { name: 'Rotasi X Balik', desc: 'Putar seluruh kubus 90° berlawanan arah jarum jam pada sumbu X' },
  'x2': { name: 'Rotasi X2', desc: 'Putar seluruh kubus 180° pada sumbu X' },
  'y':  { name: 'Rotasi Y', desc: 'Putar seluruh kubus 90° searah jarum jam pada sumbu Y' },
  "y'": { name: 'Rotasi Y Balik', desc: 'Putar seluruh kubus 90° berlawanan arah jarum jam pada sumbu Y' },
  'y2': { name: 'Rotasi Y2', desc: 'Putar seluruh kubus 180° pada sumbu Y (vertikal)' },
  'z':  { name: 'Rotasi Z', desc: 'Putar seluruh kubus 90° searah jarum jam pada sumbu Z' },
  "z'": { name: 'Rotasi Z Balik', desc: 'Putar seluruh kubus 90° berlawanan arah jarum jam pada sumbu Z' },
  'z2': { name: 'Rotasi Z2', desc: 'Putar seluruh kubus 180° pada sumbu Z' }
};

export function getMoveInfo(move) {
  return SKEWB_NOTATION[move] || { name: move, desc: `Gerakan Skewb: ${move}` };
}

