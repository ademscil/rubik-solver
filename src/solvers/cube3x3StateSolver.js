/**
 * src/solvers/cube3x3StateSolver.js
 * Algorithmic State-Based CFOP/LBL Solver for 3x3 Rubik's Cube
 * 
 * Computes authentic formula-based solutions from ANY arbitrary scrambled 3D state
 * without relying on recorded scramble move history.
 * 
 * Structured into canonical speedcubing pedagogical stages:
 * - Tahap 1: Palang Putih (White Cross)
 * - Tahap 2: Lapisan Bawah & Tengah (First Two Layers / F2L)
 * - Tahap 3: Warna Kuning Atas (Orientation of Last Layer / OLL)
 * - Tahap 4: Lapisan Atas & Selesai (Permutation of Last Layer / PLL)
 */

import * as THREE from 'three';
import solver from 'rubiks-cube-solver';

/**
 * Extracts the 6-face sticker colors from a 3x3 Three.js model in world space,
 * properly handling cubie rotations via matrix world normals.
 * 
 * @param {THREE.Group} modelGroup
 * @returns {Record<'U'|'D'|'F'|'B'|'L'|'R', string[]>}
 */
export function extract3x3StickerState(modelGroup) {
  const order = 3;
  const half = 1.0;
  const state = {
    U: Array(9).fill(null),
    D: Array(9).fill(null),
    F: Array(9).fill(null),
    B: Array(9).fill(null),
    L: Array(9).fill(null),
    R: Array(9).fill(null)
  };

  if (!modelGroup || !modelGroup.children) return state;
  modelGroup.updateMatrixWorld(true);

  const localNormals = [
    new THREE.Vector3(1, 0, 0),  // 0: +X (Right)
    new THREE.Vector3(-1, 0, 0), // 1: -X (Left)
    new THREE.Vector3(0, 1, 0),  // 2: +Y (Up)
    new THREE.Vector3(0, -1, 0), // 3: -Y (Down)
    new THREE.Vector3(0, 0, 1),  // 4: +Z (Front)
    new THREE.Vector3(0, 0, -1)  // 5: -Z (Back)
  ];

  modelGroup.children.forEach((child) => {
    if (!child || !child.isMesh) return;
    const x = child.position.x;
    const y = child.position.y;
    const z = child.position.z;
    const materials = Array.isArray(child.material) ? child.material : [child.material];

    for (let faceIdx = 0; faceIdx < 6; faceIdx++) {
      const mat = materials[faceIdx];
      const match = mat?.userData?.cacheKey?.match(/#[0-9A-Fa-f]{6}/);
      const hex = match ? match[0].toUpperCase() : null;
      if (!hex || hex === '#121215') continue; // Skip unstickered core body

      const worldNorm = localNormals[faceIdx].clone().applyQuaternion(child.quaternion);

      if (worldNorm.x > 0.8 && Math.abs(x - half) < 0.001) {
        // Right face (+X)
        const c = Math.round(half - z);
        const r = Math.round(half - y);
        state.R[r * order + c] = hex;
      } else if (worldNorm.x < -0.8 && Math.abs(x - (-half)) < 0.001) {
        // Left face (-X)
        const c = Math.round(z + half);
        const r = Math.round(half - y);
        state.L[r * order + c] = hex;
      } else if (worldNorm.y > 0.8 && Math.abs(y - half) < 0.001) {
        // Up face (+Y)
        const c = Math.round(x + half);
        const r = Math.round(z + half);
        state.U[r * order + c] = hex;
      } else if (worldNorm.y < -0.8 && Math.abs(y - (-half)) < 0.001) {
        // Down face (-Y)
        const c = Math.round(x + half);
        const r = Math.round(half - z);
        state.D[r * order + c] = hex;
      } else if (worldNorm.z > 0.8 && Math.abs(z - half) < 0.001) {
        // Front face (+Z)
        const c = Math.round(x + half);
        const r = Math.round(half - y);
        state.F[r * order + c] = hex;
      } else if (worldNorm.z < -0.8 && Math.abs(z - (-half)) < 0.001) {
        // Back face (-Z)
        const c = Math.round(half - x);
        const r = Math.round(half - y);
        state.B[r * order + c] = hex;
      }
    }
  });

  return state;
}

/**
 * Converts 6-face sticker colors into the 54-char string format expected by rubiks-cube-solver.
 * Order: front, right, up, down, left, back
 * 
 * @param {Record<'U'|'D'|'F'|'B'|'L'|'R', string[]>} netState
 * @returns {string}
 */
export function stickerStateToSolverString(netState) {
  const hexToChar = {
    [netState.F[4]]: 'f',
    [netState.R[4]]: 'r',
    [netState.U[4]]: 'u',
    [netState.D[4]]: 'd',
    [netState.L[4]]: 'l',
    [netState.B[4]]: 'b'
  };

  const fStr = netState.F.map((h) => hexToChar[h] || 'f').join('');
  const rStr = netState.R.map((h) => hexToChar[h] || 'r').join('');
  const uStr = netState.U.map((h) => hexToChar[h] || 'u').join('');
  const dStr = netState.D.map((h) => hexToChar[h] || 'd').join('');
  const lStr = netState.L.map((h) => hexToChar[h] || 'l').join('');
  const bStr = netState.B.map((h) => hexToChar[h] || 'b').join('');

  return fStr + rStr + uStr + dStr + lStr + bStr;
}

/**
 * Normalizes algorithm strings from solver format to standard WCA notation tokens.
 * Converts 'prime' (case-insensitive) to "'" (e.g. Uprime -> U', SPRIME -> S').
 * 
 * @param {string|string[]} raw
 * @returns {string[]}
 */
export function normalizeSolverTokens(raw) {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  const tokens = [];

  list.forEach((chunk) => {
    if (!chunk || typeof chunk !== 'string') return;
    const cleanChunk = chunk
      .replace(/prime/gi, "'")
      .trim();

    if (!cleanChunk) return;
    cleanChunk.split(/\s+/).forEach((tok) => {
      if (tok) tokens.push(tok);
    });
  });

  return tokens;
}

/**
 * Solves a 3x3 Rubik's cube from its 3D model state using genuine speedcubing formulas.
 * 
 * @param {THREE.Group} modelGroup
 * @returns {{
 *   solutionMoves: string[],
 *   stages: Array<{
 *     id: string,
 *     title: string,
 *     shortTitle: string,
 *     badge: string,
 *     formulaName: string,
 *     description: string,
 *     tips: string,
 *     moves: string[],
 *     startIndex: number,
 *     endIndex: number
 *   }>,
 *   isSolved: boolean
 * }}
 */
export function solve3x3FromModel(modelGroup) {
  try {
    const stickerState = extract3x3StickerState(modelGroup);
    const solverStr = stickerStateToSolverString(stickerState);

    // If all faces already have uniform colors, cube is solved
    const isAlreadySolved = solverStr === 'fffffffffrrrrrrrrruuuuuuuuudddddddddlllllllllbbbbbbbbb';
    if (isAlreadySolved) {
      return {
        solutionMoves: [],
        stages: [],
        isSolved: true
      };
    }

    const rawSolution = solver(solverStr, { partitioned: true });

    const crossMoves = normalizeSolverTokens(rawSolution.cross);
    const f2lMoves = normalizeSolverTokens(rawSolution.f2l);
    const ollMoves = normalizeSolverTokens(rawSolution.oll);
    const pllMoves = normalizeSolverTokens(rawSolution.pll);

    const solutionMoves = [...crossMoves, ...f2lMoves, ...ollMoves, ...pllMoves];

    let offset = 0;
    const stages = [];

    if (crossMoves.length > 0) {
      stages.push({
        id: 'stage-1-cross',
        title: 'Tahap 1: Palang Dasar (White Cross)',
        shortTitle: 'Palang Dasar',
        badge: 'Tahap 1: Palang',
        formulaName: 'Palang Bawah (Cross Alignment)',
        description: 'Membentuk palang putih di dasar kubus dengan rusuk selaras ke masing-masing center.',
        tips: 'Bentuk palang terlebih dahulu agar dasar kubus kokoh sebelum menyusun lapisan berikutnya.',
        moves: crossMoves,
        startIndex: offset,
        endIndex: offset + crossMoves.length
      });
      offset += crossMoves.length;
    }

    if (f2lMoves.length > 0) {
      stages.push({
        id: 'stage-2-f2l',
        title: 'Tahap 2: Lapisan Bawah & Tengah (F2L)',
        shortTitle: 'Lapisan 1-2 (F2L)',
        badge: 'Tahap 2: F2L',
        formulaName: "U R U' R' U' F' U F / Sexy Move",
        description: 'Menyelesaikan 4 pasangan sudut bawah dan rusuk tengah secara presisi ke dalam slotnya.',
        tips: 'Pasangkan sudut dan rusuk di lapisan atas sebelum memasukkannya bersama ke slot target.',
        moves: f2lMoves,
        startIndex: offset,
        endIndex: offset + f2lMoves.length
      });
      offset += f2lMoves.length;
    }

    if (ollMoves.length > 0) {
      stages.push({
        id: 'stage-3-oll',
        title: 'Tahap 3: Warna Kuning Atas (OLL)',
        shortTitle: 'Warna Atas (OLL)',
        badge: 'Tahap 3: OLL',
        formulaName: "F R U R' U' F' + Sune",
        description: 'Menguningkan seluruh sisi atas menggunakan rumus pembentuk palang dan rumus orientasi sudut.',
        tips: 'Buka tirai jendela (F R U R\' U\' F\') untuk membentuk palang, lalu gunakan rumus ikan.',
        moves: ollMoves,
        startIndex: offset,
        endIndex: offset + ollMoves.length
      });
      offset += ollMoves.length;
    }

    if (pllMoves.length > 0) {
      stages.push({
        id: 'stage-4-pll',
        title: 'Tahap 4: Lapisan Atas & Selesai (PLL)',
        shortTitle: 'Selesai (PLL)',
        badge: 'Tahap 4: PLL',
        formulaName: 'T-Perm + U-Perm + AUF',
        description: 'Menyelaraskan seluruh sudut dan rusuk lapisan atas hingga kubus 100% utuh sempurna.',
        tips: 'Gunakan lampu kembar untuk menyamakan sudut, lalu selesaikan rusuk terakhir dengan U-Perm.',
        moves: pllMoves,
        startIndex: offset,
        endIndex: offset + pllMoves.length
      });
    }

    return {
      solutionMoves,
      stages,
      isSolved: solutionMoves.length === 0
    };
  } catch (err) {
    console.warn('[cube3x3StateSolver] State solver error:', err);
    return null;
  }
}

