/**
 * src/puzzles/nxn/NxNFactory.js
 * Universal Factory generating specification-compliant PuzzleDefinition instances for NxN cubes (N=2..7).
 */

import { buildNxNModel } from './NxNGeometry.js';
import { animateNxNMove } from './NxNKinematics.js';
import { createCubicNetLayout, applyNetStateToNxN, extractNetStateFromNxN } from './netLayout.js';
import {
  NXN_NOTATION_DICTIONARY,
  getInverseMove,
  parseAlgorithm,
  getMoveInfo
} from '../../solvers/notation/nxnNotation.js';
import { CUBE_COLORS, NXN_PRESETS, generateNxNScramble } from '../../solvers/presets/nxnPresets.js';
import { NXN_GUIDE_STAGES } from '../../solvers/guides/nxnGuides.js';
import { WCA_PUZZLE_METADATA } from '../registry.js';

/**
 * Creates a fully-populated PuzzleDefinition instance for any order N in {2, 3, 4, 5, 6, 7}.
 * 
 * @param {number} order - Cube order (2, 3, 4, 5, 6, 7)
 * @param {Object} [overrides] - Optional overrides
 * @returns {import('../types.js').PuzzleDefinition}
 */
export function createNxNDefinition(order, overrides = {}) {
  const id = `cube-${order}x${order}`;
  const meta = WCA_PUZZLE_METADATA[id] || {
    id,
    wcaId: `${order}${order}${order}`,
    name: `Rubik's Cube ${order}x${order}`,
    shortName: `${order}x${order}`,
    category: 'nxn',
    difficulty: order <= 3 ? 'beginner' : order === 4 ? 'intermediate' : order === 5 ? 'advanced' : 'expert',
    difficultyLabel: order <= 3 ? 'Pemula' : order === 4 ? 'Menengah' : order === 5 ? 'Mahir' : 'Master',
    order,
    faceCount: 6,
    defaultCameraDistance: order * 1.5 + 3.5,
    minCameraDistance: order + 2,
    maxCameraDistance: order * 3 + 9,
    description: `Kubus ${order}x${order}x${order}`,
    hasParity: order >= 4
  };

  const netLayout = createCubicNetLayout(order);
  const presets = NXN_PRESETS[id] || [];
  const guideStages = NXN_GUIDE_STAGES[id] || [];

  const tierMap = {
    beginner: 'pemula',
    intermediate: 'menengah',
    advanced: 'mahir',
    expert: 'master'
  };

  const beginnerMethodMap = {
    2: 'Ortega / LBL Pemula',
    3: 'Layer-By-Layer (LBL) Pemula / CFOP',
    4: 'Metode Reduksi (Reduction) Pemula',
    5: 'Reduksi Center-Bar & Free Slice Pemula',
    6: 'Reduksi Multi-Slice Pemula',
    7: 'Reduksi 5-Wing Edges Pemula'
  };

  return {
    id: meta.id,
    wcaId: meta.wcaId,
    name: meta.name,
    shortName: meta.shortName,
    category: 'nxn',
    difficulty: meta.difficulty,
    difficultyLabel: meta.difficultyLabel,
    difficultyTier: tierMap[meta.difficulty] || 'pemula',
    beginnerMethod: beginnerMethodMap[order] || 'Metode Pemula',
    order,
    faceCount: 6,
    defaultCameraDistance: meta.defaultCameraDistance,
    minCameraDistance: meta.minCameraDistance,
    maxCameraDistance: meta.maxCameraDistance,
    description: meta.description,
    hasParity: meta.hasParity,
    colorScheme: CUBE_COLORS,

    buildModel: (options) => buildNxNModel(order, options),

    animateMove: (moveStr, group, onComplete, duration, pivotGroup) => {
      animateNxNMove(group, moveStr, onComplete, duration, pivotGroup);
    },

    resetModel: (group) => {
      if (group && typeof group.rotation?.set === 'function') {
        group.rotation.set(0, 0, 0);
      }
    },

    parseAlgorithm: (algString) => parseAlgorithm(algString),

    getInverseMove: (move) => getInverseMove(move),

    getMoveInfo: (move) => getMoveInfo(move, order),

    generateScramble: (length) => generateNxNScramble(order, length),

    notation: NXN_NOTATION_DICTIONARY,
    guideStages,
    presets,
    netLayout,

    applyNetState: (group, netState) => applyNetStateToNxN(group, netState, order),
    extractNetState: (group) => extractNetStateFromNxN(group, order, CUBE_COLORS),

    ...overrides
  };
}
