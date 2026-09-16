/**
 * src/puzzles/megaminx/MegaminxKinematics.js
 * Megaminx move parsing, notation, and animation engine
 * 
 * Supports:
 * - Pochmann notation: R++, R--, D++, D-- (144° turns along R/D axes)
 * - Face turn notation: U, U', F, F', R, R', L, L', D, D', B, B' (72° turns)
 */

import * as THREE from 'three';
import { getMegaminxFaceNormals } from './MegaminxGeometry.js';

const normals = getMegaminxFaceNormals();

// Standard 72° single face turn angle (2 * PI / 5)
const FACE_ANGLE = (2 * Math.PI) / 5;
// Pochmann 144° double turn angle (4 * PI / 5)
const POCHMANN_ANGLE = (4 * Math.PI) / 5;

// Face turn axes map
const FACE_AXES = {
  U:  normals[0].clone(),
  F:  normals[1].clone(),
  FL: normals[2].clone(),
  BL: normals[3].clone(),
  BR: normals[4].clone(),
  FR: normals[5].clone(),
  D:  normals[6].clone(),
  B:  normals[7].clone(),
  DL: normals[8].clone(),
  UL: normals[9].clone(),
  UR: normals[10].clone(),
  DR: normals[11].clone(),
  // Standard aliases
  R: normals[5].clone(), // FR
  L: normals[2].clone()  // FL
};

// Pochmann scrambling axes
const POCHMANN_AXES = {
  R: normals[5].clone(), // R axis
  D: normals[6].clone()  // D axis
};

export function parseMegaminxMove(token) {
  if (!token || typeof token !== 'string') {
    throw new Error(`Invalid Megaminx notation token: '${token}'`);
  }
  const clean = token.trim();

  // 1. Pochmann turns
  if (clean === 'R++' || clean === 'R--' || clean === 'D++' || clean === 'D--') {
    const axisKey = clean[0];
    const isPlus = clean.slice(1) === '++';
    const direction = isPlus ? 2 : -2;
    const angle = isPlus ? POCHMANN_ANGLE : -POCHMANN_ANGLE;
    return {
      token: clean,
      type: 'pochmann',
      axisKey,
      axis: POCHMANN_AXES[axisKey].clone(),
      direction,
      angle
    };
  }

  // 2. Face turns: U, U', U2, U2', F, F', R, R', L, L', D, D', B, B', etc.
  const match = clean.match(/^([ULFRDBulfrdb]|FL|BL|BR|FR|DL|UL|UR|DR)(2'|'2|2|'|)$/);
  if (!match) {
    throw new Error(`Invalid Megaminx notation token: '${clean}'`);
  }

  const baseFace = match[1].toUpperCase();
  const modifier = match[2] || '';
  const isDouble = modifier.includes('2');
  const isPrime = modifier.includes("'");
  const axis = FACE_AXES[baseFace] || normals[0].clone();
  const angle = (isDouble ? 2 * FACE_ANGLE : FACE_ANGLE) * (isPrime ? -1 : 1);
  const direction = (isDouble ? 2 : 1) * (isPrime ? -1 : 1);

  return {
    token: clean,
    type: 'face',
    baseFace,
    modifier,
    isDouble,
    isPrime,
    axis: axis.clone(),
    direction,
    angle
  };
}

export function parseAlgorithm(algString) {
  if (!algString || typeof algString !== 'string') return [];
  const stripped = algString.replace(/\/\/.*/g, '').replace(/[()]/g, ' ');
  return stripped.trim().split(/\s+/).filter(Boolean);
}

export function getInverseMove(move) {
  if (!move || typeof move !== 'string') return '';
  const m = move.trim();
  if (m === 'R++') return 'R--';
  if (m === 'R--') return 'R++';
  if (m === 'D++') return 'D--';
  if (m === 'D--') return 'D++';
  if (m.endsWith("2'")) return m.slice(0, -2) + '2';
  if (m.endsWith("'2")) return m.slice(0, -2) + '2';
  if (m.endsWith('2')) return m + "'";
  if (m.endsWith("'")) return m.slice(0, -1);
  return m + "'";
}

export function generateScramble(length = 20) {
  const pochmannSteps = ['R++', 'R--', 'D++', 'D--'];
  const uSteps = ['U', "U'"];
  const moves = [];

  function isOpposite(m1, m2) {
    if (!m1 || !m2) return false;
    return (m1 === 'R++' && m2 === 'R--') ||
           (m1 === 'R--' && m2 === 'R++') ||
           (m1 === 'D++' && m2 === 'D--') ||
           (m1 === 'D--' && m2 === 'D++') ||
           (m1 === 'U' && m2 === "U'") ||
           (m1 === "U'" && m2 === 'U');
  }

  const blocks = Math.floor(length / 5);
  for (let i = 0; i < blocks; i++) {
    for (let j = 0; j < 4; j++) {
      let step;
      do {
        step = pochmannSteps[Math.floor(Math.random() * pochmannSteps.length)];
      } while (moves.length > 0 && isOpposite(step, moves[moves.length - 1]));
      moves.push(step);
    }
    let uTurn;
    do {
      uTurn = uSteps[Math.floor(Math.random() * uSteps.length)];
    } while (moves.length > 0 && isOpposite(uTurn, moves[moves.length - 1]));
    moves.push(uTurn);
  }

  return moves.join(' ');
}

export const MEGAMINX_NOTATION = {
  'R++': { name: 'Pochmann Kanan Turun 2x', desc: 'Geser kedua lapisan kanan ke bawah sejauh 144 derajat.' },
  'R--': { name: 'Pochmann Kanan Naik 2x', desc: 'Geser kedua lapisan kanan ke atas sejauh 144 derajat.' },
  'D++': { name: 'Pochmann Bawah Kanan 2x', desc: 'Geser kedua lapisan bawah ke kanan sejauh 144 derajat.' },
  'D--': { name: 'Pochmann Bawah Kiri 2x', desc: 'Geser kedua lapisan bawah ke kiri sejauh 144 derajat.' },

  'U':   { name: 'Atas', desc: 'Putar 1 lapis sisi atas searah jarum jam sejauh 72 derajat.' },
  "U'":  { name: 'Atas Lawan Arah', desc: 'Putar 1 lapis sisi atas berlawanan arah jarum jam sejauh 72 derajat.' },
  'U2':  { name: 'Atas 2x', desc: 'Putar 1 lapis sisi atas searah jarum jam sejauh 144 derajat (2 langkah).' },
  "U2'": { name: 'Atas Lawan Arah 2x', desc: 'Putar 1 lapis sisi atas berlawanan arah jarum jam sejauh 144 derajat.' },
  'F':   { name: 'Depan', desc: 'Putar 1 lapis sisi depan searah jarum jam sejauh 72 derajat.' },
  "F'":  { name: 'Depan Lawan Arah', desc: 'Putar 1 lapis sisi depan berlawanan arah jarum jam sejauh 72 derajat.' },
  'R':   { name: 'Kanan', desc: 'Putar 1 lapis sisi kanan searah jarum jam sejauh 72 derajat.' },
  "R'":  { name: 'Kanan Lawan Arah', desc: 'Putar 1 lapis sisi kanan berlawanan arah jarum jam sejauh 72 derajat.' },
  'L':   { name: 'Kiri', desc: 'Putar 1 lapis sisi kiri searah jarum jam sejauh 72 derajat.' },
  "L'":  { name: 'Kiri Lawan Arah', desc: 'Putar 1 lapis sisi kiri berlawanan arah jarum jam sejauh 72 derajat.' },
  'D':   { name: 'Bawah', desc: 'Putar 1 lapis sisi bawah searah jarum jam sejauh 72 derajat.' },
  "D'":  { name: 'Bawah Lawan Arah', desc: 'Putar 1 lapis sisi bawah berlawanan arah jarum jam sejauh 72 derajat.' },
  'B':   { name: 'Belakang', desc: 'Putar 1 lapis sisi belakang searah jarum jam sejauh 72 derajat.' },
  "B'":  { name: 'Belakang Lawan Arah', desc: 'Putar 1 lapis sisi belakang berlawanan arah jarum jam sejauh 72 derajat.' }
};

export function getMoveInfo(move) {
  if (MEGAMINX_NOTATION[move]) return MEGAMINX_NOTATION[move];
  if (typeof move === 'string' && move.includes('2')) {
    return {
      name: `Gerakan ${move}`,
      desc: `Putar lapis ${move} pada Megaminx sejauh 144 derajat.`
    };
  }
  return {
    name: `Gerakan ${move}`,
    desc: `Eksekusi manipulasi layer ${move} pada Megaminx.`
  };
}

export function animateMegaminxMove(modelGroup, moveStr, onComplete, duration = 300, pivotGroup = null) {
  if (!modelGroup) {
    onComplete?.();
    return;
  }

  const parsed = parseMegaminxMove(moveStr);
  const { axis, angle, type, axisKey } = parsed;
  const threshold = type === 'pochmann' ? 0.05 : 1.52;

  const activeMeshes = [];
  modelGroup.traverse((child) => {
    if (child.isMesh && child.name && child.name.startsWith('sticker-')) {
      const box = new THREE.Box3().setFromObject(child);
      const worldCenter = new THREE.Vector3();
      box.getCenter(worldCenter);
      const localCenter = modelGroup.worldToLocal(worldCenter.clone());

      if (type === 'pochmann') {
        // In Pochmann scrambling, top face U is strictly stationary
        if (child.name.startsWith('sticker-U-')) return;
        if (axisKey === 'R' && (child.name.startsWith('sticker-L-') || child.name.startsWith('sticker-FL-') || child.name.startsWith('sticker-BL-'))) return;
        if (localCenter.dot(axis) > threshold) {
          activeMeshes.push(child);
        }
      } else {
        if (localCenter.dot(axis) > threshold) {
          activeMeshes.push(child);
        }
      }
    }
  });

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
