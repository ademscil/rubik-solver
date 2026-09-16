/**
 * src/puzzles/square1/Square1Kinematics.js
 * Square-1 move parsing, notation, and animation engine
 * 
 * Supports:
 * - 180° middle slice: /
 * - Angle tuples: (x, y) where x (top) and y (bottom) are 30° increments in range [-6, 6]
 */

import * as THREE from 'three';

export function parseSquare1Move(token) {
  if (!token || typeof token !== 'string') {
    throw new Error(`Invalid Square-1 notation token: '${token}'`);
  }
  const clean = token.trim();

  if (clean === '/') {
    return {
      token: '/',
      type: 'slice',
      angle: Math.PI
    };
  }

  const tupleMatch = clean.match(/^\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)$/);
  if (!tupleMatch) {
    throw new Error(`Invalid Square-1 notation syntax: '${clean}'`);
  }

  const rawTop = parseInt(tupleMatch[1], 10);
  const rawBottom = parseInt(tupleMatch[2], 10);
  const top = rawTop === 0 ? 0 : rawTop;
  const bottom = rawBottom === 0 ? 0 : rawBottom;

  if (top < -6 || top > 6 || bottom < -6 || bottom > 6) {
    throw new Error(`Square-1 turn out of range [-6, 6]: (${top}, ${bottom})`);
  }

  return {
    token: `(${top},${bottom})`,
    type: 'layer_turn',
    top,
    bottom,
    topAngle: top * (Math.PI / 6),
    bottomAngle: bottom * (Math.PI / 6)
  };
}

export function parseAlgorithm(algString) {
  if (!algString || typeof algString !== 'string') return [];
  const stripped = algString.replace(/\/\/.*/g, '');
  const regex = /(\/|\(\s*-?\d+\s*,\s*-?\d+\s*\))/g;
  let match;
  let lastIndex = 0;
  const parsed = [];

  while ((match = regex.exec(stripped)) !== null) {
    const skipped = stripped.slice(lastIndex, match.index).trim();
    if (skipped.length > 0) {
      throw new Error(`Invalid Square-1 notation syntax: '${skipped}'`);
    }
    lastIndex = regex.lastIndex;
    const token = match[1].replace(/\s+/g, '');
    parsed.push(token);
  }

  const trailing = stripped.slice(lastIndex).trim();
  if (trailing.length > 0) {
    throw new Error(`Invalid trailing characters in Square-1 notation: '${trailing}'`);
  }

  return parsed;
}

export function getInverseMove(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Token must be a non-empty string');
  }
  const t = token.trim();
  if (t === '/') return '/';

  const match = t.match(/\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/);
  if (!match) {
    throw new Error(`Cannot invert malformed Square-1 token '${t}'`);
  }

  const x = parseInt(match[1], 10);
  const y = parseInt(match[2], 10);
  const invX = x === 0 ? 0 : -x;
  const invY = y === 0 ? 0 : -y;
  return `(${invX},${invY})`;
}

export function generateScramble(length = 15) {
  const moves = [];
  for (let i = 0; i < length; i++) {
    const top = Math.floor(Math.random() * 13) - 6;
    const bot = Math.floor(Math.random() * 13) - 6;
    moves.push(`(${top},${bot})`);
    moves.push('/');
  }
  return moves.join(' ');
}

export const SQUARE1_NOTATION = {
  '/': { name: 'Irisan Belahan Tengah 180°', desc: 'Iris belahan sisi kanan Square-1 180 derajat.' },
  '(1,0)': { name: 'Putaran Lapisan (1, 0)', desc: 'Putar lapisan atas 30° searah jarum jam.' },
  '(-1,0)': { name: 'Putaran Lapisan (-1, 0)', desc: 'Putar lapisan atas 30° lawan arah jarum jam.' },
  '(0,1)': { name: 'Putaran Lapisan (0, 1)', desc: 'Putar lapisan bawah 30° searah jarum jam.' },
  '(0,-1)': { name: 'Putaran Lapisan (0, -1)', desc: 'Putar lapisan bawah 30° lawan arah jarum jam.' },
  '(3,0)': { name: 'Putaran Lapisan (3, 0)', desc: 'Putar lapisan atas 90° searah jarum jam.' },
  '(-3,0)': { name: 'Putaran Lapisan (-3, 0)', desc: 'Putar lapisan atas 90° lawan arah jarum jam.' },
  '(0,3)': { name: 'Putaran Lapisan (0, 3)', desc: 'Putar lapisan bawah 90° searah jarum jam.' },
  '(0,-3)': { name: 'Putaran Lapisan (0, -3)', desc: 'Putar lapisan bawah 90° lawan arah jarum jam.' },
  '(-3,3)': { name: 'Putaran Lapisan (-3, 3)', desc: 'Putar lapisan atas -90° dan bawah 90°.' },
  '(3,-3)': { name: 'Putaran Lapisan (3, -3)', desc: 'Putar lapisan atas 90° dan bawah -90°.' }
};

export function getMoveInfo(token) {
  if (!token || typeof token !== 'string') return { title: 'Unknown Move', description: 'Gerakan tidak dikenal' };
  if (SQUARE1_NOTATION[token]) return SQUARE1_NOTATION[token];

  if (token && token.startsWith('(') && token.endsWith(')')) {
    const match = token.match(/\((-?\d+),(-?\d+)\)/);
    if (match) {
      const top = parseInt(match[1], 10);
      const bottom = parseInt(match[2], 10);
      return {
        name: `Putaran Lapisan (${top}, ${bottom})`,
        desc: `Putar lapisan atas ${top * 30}° dan lapisan bawah ${bottom * 30}°.`
      };
    }
  }

  return {
    name: `Gerakan ${token}`,
    desc: `Manipulasi lapisan Square-1 untuk token ${token}.`
  };
}

export function animateSquare1Move(modelGroup, moveStr, onComplete, duration = 300) {
  if (!modelGroup) {
    onComplete?.();
    return;
  }

  const parsed = parseSquare1Move(moveStr);

  const topLayer = modelGroup.getObjectByName('layer-top');
  const botLayer = modelGroup.getObjectByName('layer-bottom');

  if (parsed.type === 'slice') {
    // 180° slice of the right half
    const sliceAxis = new THREE.Vector3(0, 0, 1);
    const qSlice = new THREE.Quaternion().setFromAxisAngle(sliceAxis, Math.PI);

    if (typeof requestAnimationFrame === 'undefined' || duration <= 0) {
      modelGroup.quaternion.premultiply(qSlice);
      modelGroup.updateMatrixWorld(true);
      onComplete?.();
      return;
    }

    const startQ = modelGroup.quaternion.clone();
    const targetQ = qSlice.clone().multiply(startQ);
    const startTime = performance.now();

    const step = (now) => {
      const t = Math.min((now - startTime) / duration, 1.0);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      modelGroup.quaternion.slerpQuaternions(startQ, targetQ, ease);
      if (t < 1.0) {
        requestAnimationFrame(step);
      } else {
        modelGroup.quaternion.copy(targetQ);
        modelGroup.updateMatrixWorld(true);
        onComplete?.();
      }
    };
    requestAnimationFrame(step);
    return;
  }

  // parsed.type === 'layer_turn': rotate top and/or bottom layer around Y axis
  const yAxis = new THREE.Vector3(0, 1, 0);
  const qTop = new THREE.Quaternion().setFromAxisAngle(yAxis, parsed.topAngle);
  const qBot = new THREE.Quaternion().setFromAxisAngle(yAxis, parsed.bottomAngle);

  if (typeof requestAnimationFrame === 'undefined' || duration <= 0) {
    if (topLayer && parsed.top !== 0) {
      topLayer.quaternion.premultiply(qTop);
    }
    if (botLayer && parsed.bottom !== 0) {
      botLayer.quaternion.premultiply(qBot);
    }
    modelGroup.updateMatrixWorld(true);
    onComplete?.();
    return;
  }

  const startQTop = topLayer ? topLayer.quaternion.clone() : new THREE.Quaternion();
  const targetQTop = qTop.clone().multiply(startQTop);
  const startQBot = botLayer ? botLayer.quaternion.clone() : new THREE.Quaternion();
  const targetQBot = qBot.clone().multiply(startQBot);
  const startTime = performance.now();

  const step = (now) => {
    const t = Math.min((now - startTime) / duration, 1.0);
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    if (topLayer && parsed.top !== 0) {
      topLayer.quaternion.slerpQuaternions(startQTop, targetQTop, ease);
    }
    if (botLayer && parsed.bottom !== 0) {
      botLayer.quaternion.slerpQuaternions(startQBot, targetQBot, ease);
    }

    if (t < 1.0) {
      requestAnimationFrame(step);
    } else {
      if (topLayer && parsed.top !== 0) topLayer.quaternion.copy(targetQTop);
      if (botLayer && parsed.bottom !== 0) botLayer.quaternion.copy(targetQBot);
      modelGroup.updateMatrixWorld(true);
      onComplete?.();
    }
  };
  requestAnimationFrame(step);
}
