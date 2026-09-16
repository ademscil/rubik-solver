/**
 * src/puzzles/nxn/NxNKinematics.js
 * Universal Move Parser, Layer Slicer, and 60 FPS Pivot Tweening Engine
 * Supports orders N in {2, 3, 4, 5, 6, 7}.
 */

import * as THREE from 'three';
import { getLayerIndexFromPos, getLayerOffset, CUBIE_PITCH } from './NxNGeometry.js';

const NXN_MOVE_REGEX = /^([2-7])?([RLUDFBrludfbMESxyz])(w)?(['2])?$/;

/**
 * Parses an arbitrary NxN notation token into mechanical execution details.
 * 
 * @param {string} token - Raw notation token (e.g. "R", "Rw'", "3Uw2", "2R", "M", "x2")
 * @param {number} [order=3] - Cube order (2, 3, 4, 5, 6, 7)
 * @returns {{
 *   token: string,
 *   axis: 'x' | 'y' | 'z',
 *   layers: number[],
 *   dir: number,
 *   angle: number,
 *   layerCount: number,
 *   isWide: boolean,
 *   isSlice: boolean,
 *   isRotation: boolean
 * }}
 */
export function parseNxNMove(token, order = 3) {
  if (typeof token !== 'string') {
    throw new TypeError(`Move token must be a string. Received: ${token}`);
  }

  const clean = token.trim();
  const match = clean.match(NXN_MOVE_REGEX);
  if (!match) {
    throw new Error(`Invalid WCA notation token '${clean}' for order ${order}`);
  }

  const [, prefixNumStr, rawFace, wideSuffix, modifier] = match;
  const prefixNum = prefixNumStr ? parseInt(prefixNumStr, 10) : null;
  const isLower = rawFace === rawFace.toLowerCase() && !['x', 'y', 'z'].includes(rawFace);
  const isWide = wideSuffix === 'w' || isLower;
  const face = rawFace.toUpperCase();

  // Multiplier from modifier: '' -> 1, "'" -> -1, '2' -> 2
  let mult = 1;
  if (modifier === "'") mult = -1;
  else if (modifier === '2') mult = 2;

  // 1. Whole cube rotations (x, y, z)
  if (['X', 'Y', 'Z'].includes(face) && !prefixNum && !wideSuffix) {
    const allLayers = Array.from({ length: order }, (_, idx) => idx);
    const axis = face.toLowerCase();
    return {
      token: clean,
      axis,
      layers: allLayers,
      dir: -1 * mult,
      angle: (Math.PI / 2) * -1 * mult,
      layerCount: order,
      isWide: false,
      isSlice: false,
      isRotation: true
    };
  }

  // 2. Middle slice moves (M, E, S)
  if (['M', 'E', 'S'].includes(face)) {
    if (order < 3) {
      throw new Error(`Middle slice '${clean}' is invalid on order ${order}`);
    }
    const midLayer = Math.floor((order - 1) / 2);
    if (face === 'M') {
      return {
        token: clean,
        axis: 'x',
        layers: [midLayer],
        dir: 1 * mult, // M moves in direction of L (+1)
        angle: (Math.PI / 2) * 1 * mult,
        layerCount: 1,
        isWide: false,
        isSlice: true,
        isRotation: false
      };
    }
    if (face === 'E') {
      return {
        token: clean,
        axis: 'y',
        layers: [midLayer],
        dir: 1 * mult, // E moves in direction of D (+1)
        angle: (Math.PI / 2) * 1 * mult,
        layerCount: 1,
        isWide: false,
        isSlice: true,
        isRotation: false
      };
    }
    if (face === 'S') {
      return {
        token: clean,
        axis: 'z',
        layers: [midLayer],
        dir: -1 * mult, // S moves in direction of F (-1)
        angle: (Math.PI / 2) * -1 * mult,
        layerCount: 1,
        isWide: false,
        isSlice: true,
        isRotation: false
      };
    }
  }

  // 3. Standard Face, Wide, or Slice Turns (R, L, U, D, F, B)
  const axisMap = { R: 'x', L: 'x', U: 'y', D: 'y', F: 'z', B: 'z' };
  const baseDirMap = { R: -1, L: 1, U: -1, D: 1, F: -1, B: 1 };

  const axis = axisMap[face];
  const baseDir = baseDirMap[face];

  if (!axis) {
    throw new Error(`Unrecognized face '${face}' in token '${clean}'`);
  }

  let layers = [];
  let isSlice = false;
  let layerCount = 1;

  if (isWide) {
    // Wide turns: e.g. Rw, 2Rw, 3Rw
    const count = prefixNum ?? 2;
    if (count > order) {
      throw new Error(`Wide turn '${clean}' exceeds cube order ${order}`);
    }
    layerCount = count;
    if (['R', 'U', 'F'].includes(face)) {
      for (let l = order - count; l < order; l++) layers.push(l);
    } else {
      for (let l = 0; l < count; l++) layers.push(l);
    }
  } else if (prefixNum !== null) {
    // Inner slice moves: e.g. 2R, 3R
    isSlice = true;
    if (prefixNum > order) {
      throw new Error(`Slice move '${clean}' exceeds cube order ${order}`);
    }
    layerCount = prefixNum;
    if (['R', 'U', 'F'].includes(face)) {
      layers = [order - prefixNum];
    } else {
      layers = [prefixNum - 1];
    }
  } else {
    // Basic single outer face turn
    if (['R', 'U', 'F'].includes(face)) {
      layers = [order - 1];
    } else {
      layers = [0];
    }
  }

  return {
    token: clean,
    axis,
    layers,
    dir: baseDir * mult,
    angle: (Math.PI / 2) * baseDir * mult,
    layerCount,
    isWide,
    isSlice,
    isRotation: false
  };
}

/**
 * Filter all cubie meshes belonging to the active layers.
 * 
 * @param {THREE.Group} modelGroup
 * @param {'x' | 'y' | 'z'} axis
 * @param {number[]} targetLayers
 * @param {number} order
 * @param {number} [pitch=CUBIE_PITCH]
 * @returns {THREE.Mesh[]}
 */
export function getActiveCubies(modelGroup, axis, targetLayers, order, pitch = CUBIE_PITCH) {
  const active = [];
  if (!modelGroup || !modelGroup.children) return active;

  modelGroup.children.forEach(child => {
    if (!child || !child.isMesh) return;
    const pos = child.position[axis];
    const layerIdx = getLayerIndexFromPos(pos, order, pitch);
    if (targetLayers.includes(layerIdx)) {
      active.push(child);
    }
  });
  return active;
}

/**
 * Executes a smooth pivot tweened move with zero-drift orthogonal snapping.
 * Safe for both browser animation loops and headless Node execution.
 * 
 * @param {THREE.Group} modelGroup - Puzzle model root
 * @param {string} moveStr - Notation move string
 * @param {() => void} [onComplete] - Completion callback
 * @param {number} [duration=250] - Animation duration in ms (0 for instant)
 * @param {THREE.Group} [pivotGroup] - Optional reusable pivot group
 */
export function animateNxNMove(modelGroup, moveStr, onComplete, duration = 250, pivotGroup = null) {
  if (!modelGroup) {
    onComplete?.();
    return;
  }

  const order = modelGroup.userData.order || 3;
  const pitch = modelGroup.userData.pitch || CUBIE_PITCH;
  const moveInfo = parseNxNMove(moveStr, order);
  const { axis, layers, angle } = moveInfo;

  const activeCubies = getActiveCubies(modelGroup, axis, layers, order, pitch);
  if (activeCubies.length === 0) {
    onComplete?.();
    return;
  }

  // Finalize move helper: snaps positions and Euler rotations
  const finalizeMove = (pivot) => {
    const normalizeZero = (val) => (Object.is(val, -0) || Math.abs(val) < 1e-6 ? 0 : val);

    activeCubies.forEach(cubie => {
      modelGroup.attach(cubie);

      // Snap position to exact grid offsets
      const kx = getLayerIndexFromPos(cubie.position.x, order, pitch);
      const ky = getLayerIndexFromPos(cubie.position.y, order, pitch);
      const kz = getLayerIndexFromPos(cubie.position.z, order, pitch);

      const snapX = normalizeZero(getLayerOffset(kx, order, pitch));
      const snapY = normalizeZero(getLayerOffset(ky, order, pitch));
      const snapZ = normalizeZero(getLayerOffset(kz, order, pitch));

      cubie.position.set(snapX, snapY, snapZ);

      // Snap rotation to exact multiples of pi / 2
      const rotX = normalizeZero(Math.round(cubie.rotation.x / (Math.PI / 2)) * (Math.PI / 2));
      const rotY = normalizeZero(Math.round(cubie.rotation.y / (Math.PI / 2)) * (Math.PI / 2));
      const rotZ = normalizeZero(Math.round(cubie.rotation.z / (Math.PI / 2)) * (Math.PI / 2));

      cubie.rotation.set(rotX, rotY, rotZ);

      cubie.userData.layerX = kx;
      cubie.userData.layerY = ky;
      cubie.userData.layerZ = kz;
      cubie.userData.gridPos = {
        x: snapX / pitch,
        y: snapY / pitch,
        z: snapZ / pitch
      };

      cubie.updateMatrix();
      cubie.updateMatrixWorld(true);
    });

    // Preserve canonical scenegraph children ordering
    modelGroup.children.sort((a, b) => {
      if (a.userData?.cubieIndex !== undefined && b.userData?.cubieIndex !== undefined) {
        return a.userData.cubieIndex - b.userData.cubieIndex;
      }
      if (a.userData?.initialLayerX !== undefined && b.userData?.initialLayerX !== undefined) {
        if (a.userData.initialLayerX !== b.userData.initialLayerX) {
          return a.userData.initialLayerX - b.userData.initialLayerX;
        }
        if (a.userData.initialLayerY !== b.userData.initialLayerY) {
          return a.userData.initialLayerY - b.userData.initialLayerY;
        }
        return a.userData.initialLayerZ - b.userData.initialLayerZ;
      }
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    });

    if (pivot) {
      pivot.rotation.set(0, 0, 0);
      pivot.position.set(0, 0, 0);
      pivot.updateMatrix();
      pivot.updateMatrixWorld(true);
    }

    onComplete?.();
  };

  // Immediate completion if headless or zero duration
  if (typeof requestAnimationFrame === 'undefined' || duration <= 0) {
    const pivot = pivotGroup || new THREE.Group();
    pivot.rotation.set(0, 0, 0);
    pivot.position.set(0, 0, 0);
    pivot.updateMatrix();
    pivot.updateMatrixWorld(true);
    if (!pivot.parent && modelGroup.parent) {
      modelGroup.parent.add(pivot);
    }
    activeCubies.forEach(cubie => pivot.attach(cubie));
    pivot.rotation[axis] = angle;
    pivot.updateMatrixWorld(true);
    finalizeMove(pivot);
    return;
  }

  // Smooth browser animation loop
  const pivot = pivotGroup || new THREE.Group();
  pivot.rotation.set(0, 0, 0);
  pivot.position.set(0, 0, 0);
  pivot.updateMatrix();
  pivot.updateMatrixWorld(true);
  if (!pivot.parent && modelGroup.parent) {
    modelGroup.parent.add(pivot);
  }

  activeCubies.forEach(cubie => pivot.attach(cubie));

  const startTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const safeDuration = Math.max(50, duration);

  const step = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / safeDuration, 1.0);

    // Cubic ease-in-out
    const ease = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    pivot.rotation[axis] = angle * ease;

    if (progress < 1.0) {
      requestAnimationFrame(step);
    } else {
      pivot.rotation[axis] = angle;
      pivot.updateMatrixWorld(true);
      finalizeMove(pivot);
    }
  };

  requestAnimationFrame(step);
}
