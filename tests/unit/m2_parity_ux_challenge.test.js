/**
 * tests/unit/m2_parity_ux_challenge.test.js
 * Empirical Challenge Harness for Milestone 2:
 * 1. UX Beginner Method Priority, Indonesian Visual Analogies, 4 Difficulty Tiers
 * 2. Parity Algorithms (4x4, 5x5, 6x6, 7x7): Syntax Parsing, Kinematic Execution, Piece Invariance
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  NXN_GUIDE_STAGES,
  GUIDE_STAGES_2X2,
  GUIDE_STAGES_3X3,
  GUIDE_STAGES_4X4
} from '../../src/solvers/guides/nxnGuides.js';

import {
  invertAlgorithm,
  parseAlgorithm
} from '../../src/solvers/notation/nxnNotation.js';

import {
  parseNxNMove,
  animateNxNMove
} from '../../src/puzzles/nxn/NxNKinematics.js';

import {
  buildNxNModel
} from '../../src/puzzles/nxn/NxNGeometry.js';

import {
  getPuzzlesByDifficulty
} from '../../src/puzzles/registry.js';

// Helper to snapshot all cubie positions and rotations in model
function getModelState(model) {
  return model.children.map(c => ({
    name: c.name,
    pos: { x: Number(c.position.x.toFixed(4)), y: Number(c.position.y.toFixed(4)), z: Number(c.position.z.toFixed(4)) },
    rot: { x: Number(c.rotation.x.toFixed(4)), y: Number(c.rotation.y.toFixed(4)), z: Number(c.rotation.z.toFixed(4)) },
    userData: { ...c.userData }
  }));
}

// Helper to check if two states are identical
function assertStatesEqual(stateA, stateB, tolerance = 1e-4) {
  assert.equal(stateA.length, stateB.length, 'Cubie counts must match');
  for (let i = 0; i < stateA.length; i++) {
    const a = stateA[i];
    const b = stateB[i];
    assert.ok(
      Math.abs(a.pos.x - b.pos.x) <= tolerance &&
      Math.abs(a.pos.y - b.pos.y) <= tolerance &&
      Math.abs(a.pos.z - b.pos.z) <= tolerance,
      `Cubie ${i} (${a.name}) position mismatch: got (${b.pos.x},${b.pos.y},${b.pos.z}), expected (${a.pos.x},${a.pos.y},${a.pos.z})`
    );
  }
}

// Helper to execute algorithm synchronously on model
function executeAlgorithm(model, algString) {
  const tokens = parseAlgorithm(algString);
  for (const token of tokens) {
    animateNxNMove(model, token, null, 0);
  }
}

describe('M2 Challenge 1: User UX Priority & Stage Ordering', () => {
  const ORDERS = [2, 3, 4, 5, 6, 7];

  it('verifies every single cube (2x2 to 7x7) provides a dedicated Beginner Method', () => {
    ORDERS.forEach(order => {
      const id = `cube-${order}x${order}`;
      const stages = NXN_GUIDE_STAGES[id];
      assert.ok(stages && stages.length > 0, `Guide stages missing for ${id}`);

      // Must have stage with 'Pemula' or 'Beginner'
      const pemulaStages = stages.filter(s =>
        s.title.toLowerCase().includes('pemula') || s.desc.toLowerCase().includes('pemula')
      );
      assert.ok(
        pemulaStages.length >= 1,
        `${id} must provide at least one dedicated Metode Pemula stage. Found: ${pemulaStages.length}`
      );
    });
  });

  it('verifies Beginner Method strictly precedes Advanced Method in stage ordering', () => {
    ORDERS.forEach(order => {
      const id = `cube-${order}x${order}`;
      const stages = NXN_GUIDE_STAGES[id];

      // Find first stage mentioning Pemula
      const firstPemulaIdx = stages.findIndex(s =>
        s.title.toLowerCase().includes('pemula') || s.desc.toLowerCase().includes('pemula')
      );
      assert.notEqual(firstPemulaIdx, -1, `${id} missing Pemula stage`);

      // Find first stage mentioning Mahir / Advanced
      const firstMahirIdx = stages.findIndex(s =>
        s.title.toLowerCase().includes('mahir') || s.desc.toLowerCase().includes('mahir') ||
        s.title.toLowerCase().includes('cfop') || s.title.toLowerCase().includes('ortega')
      );

      if (firstMahirIdx !== -1) {
        assert.ok(
          firstPemulaIdx < firstMahirIdx,
          `${id}: Beginner stage (index ${firstPemulaIdx}) must precede Mahir stage (index ${firstMahirIdx})`
        );
      }
    });
  });

  it('verifies pedagogical Indonesian visual analogies across beginner guides', () => {
    // 3x3 visual analogies
    const s3 = JSON.stringify(GUIDE_STAGES_3X3);
    assert.ok(s3.includes('Bunga Daisy'), '3x3 must include Bunga Daisy analogy');
    assert.ok(s3.includes('Penyelaman 180°'), '3x3 must include Penyelaman 180° analogy');
    assert.ok(s3.includes('Lift Penumpang') || s3.includes('Penumpang'), '3x3 must include Penumpang analogy');
    assert.ok(s3.includes('Buka Tirai Jendela') || s3.includes('Buka Tirai'), '3x3 must include Buka Tirai analogy');
    assert.ok(s3.includes('Rumus Ikan') || s3.includes('Ikan Sune'), '3x3 must include Ikan Sune analogy');
    assert.ok(s3.includes('Jangan Panik') || s3.includes('JANGAN PANIK'), '3x3 must include Jangan Panik warning');

    // 4x4 visual analogies
    const s4 = JSON.stringify(GUIDE_STAGES_4X4);
    assert.ok(s4.includes('Batang Korek Api'), '4x4 must include Batang Korek Api analogy');
    assert.ok(s4.includes('Dorong-Amankan-Tarik') || s4.includes('Push-Turn-Restore'), '4x4 must include Push-Turn-Restore analogy');
    assert.ok(s4.includes('Rel Kereta') || s4.includes('Pembalik Gerbong'), '4x4 must include Rel Kereta & Gerbong analogy');

    // 2x2 visual analogies
    const s2 = JSON.stringify(GUIDE_STAGES_2X2);
    assert.ok(s2.includes('Lift Penumpang') || s2.includes('penumpang'), '2x2 must include Lift Penumpang analogy');
    assert.ok(s2.includes('Rumus Ikan') || s2.includes('Ikan'), '2x2 must include Rumus Ikan analogy');
    assert.ok(s2.includes('Lampu Mobil Kembar') || s2.includes('Lampu Kembar'), '2x2 must include Lampu Mobil Kembar analogy');
  });

  it('verifies exact 4 difficulty tiers mapping across all 10 puzzles', () => {
    const expectedTiers = {
      beginner: ['cube-2x2', 'cube-3x3', 'pyraminx'],
      intermediate: ['cube-4x4', 'skewb'],
      advanced: ['cube-5x5', 'megaminx'],
      expert: ['cube-6x6', 'cube-7x7', 'square-1']
    };

    for (const [tier, expectedPuzzles] of Object.entries(expectedTiers)) {
      const actualPuzzles = getPuzzlesByDifficulty(tier).map(p => p.id);
      expectedPuzzles.forEach(id => {
        assert.ok(
          actualPuzzles.includes(id),
          `Tier '${tier}' must include puzzle '${id}'. Actual: ${actualPuzzles.join(', ')}`
        );
      });
    }
  });
});

describe('M2 Challenge 2: Parity Algorithm Parsing & Notation Dictionary', () => {
  const PARITY_ALGS = [
    {
      name: '4x4 Lucas OLL Parity',
      order: 4,
      alg: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 Rw' U2 Rw U2 Rw' U2 Rw'"
    },
    {
      name: '4x4 PLL Parity (Opposite)',
      order: 4,
      alg: '2R2 U2 2R2 Uw2 2R2 2U2'
    },
    {
      name: '4x4 PLL Parity (Adjacent)',
      order: 4,
      alg: "R' U R 2R2 U2 2R2 Uw2 2R2 2U2 R' U' R"
    },
    {
      name: '5x5 Wing Flip Parity',
      order: 5,
      alg: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 3Rw' U2 Rw U2 Rw' U2 Rw'"
    },
    {
      name: '6x6 Inner-Slice OLL Parity',
      order: 6,
      alg: "3Rw U2 x 3Rw U2 3Rw U2 3Rw' U2 3Lw U2 3Rw' U2 3Rw U2 3Rw' U2 3Rw'"
    },
    {
      name: '6x6 Outer-Slice OLL Parity',
      order: 6,
      alg: "2Rw U2 x 2Rw U2 2Rw U2 2Rw' U2 2Lw U2 2Rw' U2 2Rw U2 2Rw' U2 2Rw'"
    },
    {
      name: '6x6 Composite PLL Parity',
      order: 6,
      alg: '2Rw2 U2 2Rw2 Uw2 2Rw2 2Uw2'
    },
    {
      name: '7x7 Inner Wing Parity (Slice 3)',
      order: 7,
      alg: "3Rw U2 x 3Rw U2 3Rw U2 3Rw' U2 3Lw U2 3Rw' U2 3Rw U2 3Rw' U2 3Rw'"
    },
    {
      name: '7x7 Outer Wing Parity (Slice 2)',
      order: 7,
      alg: "2Rw U2 x 2Rw U2 2Rw U2 2Rw' U2 2Lw U2 2Rw' U2 2Rw U2 2Rw' U2 2Rw'"
    }
  ];

  it('all parity algorithm tokens parse cleanly without syntax errors in parseNxNMove', () => {
    PARITY_ALGS.forEach(({ name, order, alg }) => {
      const tokens = parseAlgorithm(alg);
      assert.ok(tokens.length > 0, `${name} has no tokens`);
      tokens.forEach(token => {
        assert.doesNotThrow(
          () => parseNxNMove(token, order),
          `${name}: token '${token}' failed to parse for order ${order}`
        );
        const parsed = parseNxNMove(token, order);
        assert.ok(parsed.layers.length > 0, `${name}: token '${token}' produced 0 layers`);
        parsed.layers.forEach(l => {
          assert.ok(l >= 0 && l < order, `${name}: token '${token}' produced out-of-bounds layer ${l} for order ${order}`);
        });
      });
    });
  });

  it('verifies algorithm inversion: Alg + Invert(Alg) === Identity on 3D models', () => {
    PARITY_ALGS.forEach(({ order, alg }) => {
      const model = buildNxNModel(order);
      const initial = getModelState(model);

      // Execute alg
      executeAlgorithm(model, alg);

      // Execute inverse
      const invAlg = invertAlgorithm(alg);
      executeAlgorithm(model, invAlg);

      const finalState = getModelState(model);
      assertStatesEqual(initial, finalState);
    });
  });
});
