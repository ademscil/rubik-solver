/**
 * Empirical Kinematic & Layer Rotation Stress Test Suite
 * File: tests/unit/kinematicsStress.test.js
 * Runner: node --test
 * 
 * Verifies:
 * - 4-turn cycle identities (R4, U4, F4, etc. = identity) across all 6 cubes (2x2 to 7x7)
 * - Wide turns (Rw, Uw, Fw, etc.) and multi-layer turns (3Rw, 3Uw)
 * - Inner-slice turns (2R, 3R) and middle slice turns (M, E, S)
 * - Zero-drift snapping verification after 100 consecutive rotations
 * - Sequence inversion identity: Seq + Seq^-1 = Identity
 * - Commutator cycle identities (Sexy Move x6, R U x105)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';

import {
  buildNxNModel
} from '../../src/puzzles/nxn/NxNGeometry.js';

import {
  parseNxNMove,
  animateNxNMove
} from '../../src/puzzles/nxn/NxNKinematics.js';

import {
  getInverseMove
} from '../../src/solvers/notation/nxnNotation.js';

/**
 * Snapshot the state of all cubies in the model.
 */
function snapshotModel(model) {
  const map = new Map();
  model.children.forEach(child => {
    map.set(child.name, {
      name: child.name,
      position: child.position.clone(),
      rotation: child.rotation.clone(),
      quaternion: child.quaternion.clone(),
      matrix: child.matrix.clone(),
      layerX: child.userData.layerX,
      layerY: child.userData.layerY,
      layerZ: child.userData.layerZ
    });
  });
  return map;
}

/**
 * Compare current model state against a reference snapshot map.
 */
function assertModelEqualsSnapshot(model, snapshotMap, tolerance = 1e-5, label = '') {
  assert.equal(
    model.children.length,
    snapshotMap.size,
    `${label}: Piece count altered (expected ${snapshotMap.size}, got ${model.children.length})`
  );

  let maxPosDiff = 0;
  let maxMatDiff = 0;

  model.children.forEach(child => {
    const snap = snapshotMap.get(child.name);
    assert.ok(snap, `${label}: Missing snapshot for cubie ${child.name}`);

    const posDiff = child.position.distanceTo(snap.position);
    maxPosDiff = Math.max(maxPosDiff, posDiff);

    let matDiff = 0;
    for (let i = 0; i < 16; i++) {
      matDiff = Math.max(matDiff, Math.abs(child.matrix.elements[i] - snap.matrix.elements[i]));
    }
    maxMatDiff = Math.max(maxMatDiff, matDiff);

    assert.ok(
      posDiff < tolerance,
      `${label}: Cubie ${child.name} position drifted by ${posDiff} (max allowed ${tolerance})`
    );
    assert.ok(
      matDiff < tolerance,
      `${label}: Cubie ${child.name} matrix drifted by ${matDiff} (max allowed ${tolerance})`
    );
    assert.equal(child.userData.layerX, snap.layerX, `${label}: layerX mismatch on ${child.name}`);
    assert.equal(child.userData.layerY, snap.layerY, `${label}: layerY mismatch on ${child.name}`);
    assert.equal(child.userData.layerZ, snap.layerZ, `${label}: layerZ mismatch on ${child.name}`);
  });

  return { maxPosDiff, maxMatDiff };
}

describe('Challenger M2-1: 1. Cycle Identity Verification Across All Orders (2x2 to 7x7)', () => {
  const ORDERS = [2, 3, 4, 5, 6, 7];
  const FACES = ['R', 'L', 'U', 'D', 'F', 'B'];

  ORDERS.forEach(order => {
    describe(`Order ${order}x${order} 4-Turn Cycle Invariance`, () => {
      FACES.forEach(face => {
        it(`4x clockwise ${face} returns to exact identity on ${order}x${order}`, () => {
          const model = buildNxNModel(order);
          const initial = snapshotModel(model);

          for (let i = 0; i < 4; i++) {
            animateNxNMove(model, face, null, 0);
          }

          const { maxPosDiff, maxMatDiff } = assertModelEqualsSnapshot(
            model,
            initial,
            1e-5,
            `${order}x${order} 4x ${face}`
          );
          assert.ok(maxPosDiff < 1e-6);
          assert.ok(maxMatDiff < 1e-6);
        });

        it(`4x counter-clockwise ${face}' returns to exact identity on ${order}x${order}`, () => {
          const model = buildNxNModel(order);
          const initial = snapshotModel(model);

          for (let i = 0; i < 4; i++) {
            animateNxNMove(model, `${face}'`, null, 0);
          }

          assertModelEqualsSnapshot(model, initial, 1e-5, `${order}x${order} 4x ${face}'`);
        });

        it(`2x half-turn ${face}2 returns to exact identity on ${order}x${order}`, () => {
          const model = buildNxNModel(order);
          const initial = snapshotModel(model);

          for (let i = 0; i < 2; i++) {
            animateNxNMove(model, `${face}2`, null, 0);
          }

          assertModelEqualsSnapshot(model, initial, 1e-5, `${order}x${order} 2x ${face}2`);
        });

        it(`single move + inverse ${face} + ${face}' returns to identity on ${order}x${order}`, () => {
          const model = buildNxNModel(order);
          const initial = snapshotModel(model);

          animateNxNMove(model, face, null, 0);
          animateNxNMove(model, getInverseMove(face), null, 0);

          assertModelEqualsSnapshot(model, initial, 1e-5, `${order}x${order} ${face} + inv`);
        });
      });
    });
  });
});

describe('Challenger M2-1: 2. Wide Turns and Multi-Layer Turns (4x4 to 7x7)', () => {
  const BIG_ORDERS = [4, 5, 6, 7];
  const WIDE_FACES = ['Rw', 'Lw', 'Uw', 'Dw', 'Fw', 'Bw'];

  BIG_ORDERS.forEach(order => {
    describe(`Order ${order}x${order} Standard Wide Turns`, () => {
      WIDE_FACES.forEach(wideFace => {
        it(`4x ${wideFace} returns to identity on ${order}x${order}`, () => {
          const model = buildNxNModel(order);
          const initial = snapshotModel(model);

          for (let i = 0; i < 4; i++) {
            animateNxNMove(model, wideFace, null, 0);
          }

          assertModelEqualsSnapshot(model, initial, 1e-5, `${order}x${order} 4x ${wideFace}`);
        });

        it(`2x ${wideFace}2 returns to identity on ${order}x${order}`, () => {
          const model = buildNxNModel(order);
          const initial = snapshotModel(model);

          for (let i = 0; i < 2; i++) {
            animateNxNMove(model, `${wideFace}2`, null, 0);
          }

          assertModelEqualsSnapshot(model, initial, 1e-5, `${order}x${order} 2x ${wideFace}2`);
        });
      });
    });
  });

  describe('Order 6x6 & 7x7 Multi-Layer Wide Turns (3Rw, 3Uw, 3Fw)', () => {
    [6, 7].forEach(order => {
      const multiWides = ['3Rw', '3Lw', '3Uw', '3Dw', '3Fw', '3Bw'];
      multiWides.forEach(m => {
        it(`4x ${m} returns to identity on ${order}x${order}`, () => {
          const model = buildNxNModel(order);
          const initial = snapshotModel(model);

          for (let i = 0; i < 4; i++) {
            animateNxNMove(model, m, null, 0);
          }

          assertModelEqualsSnapshot(model, initial, 1e-5, `${order}x${order} 4x ${m}`);
        });

        it(`${m} + inverse ${m}' returns to identity on ${order}x${order}`, () => {
          const model = buildNxNModel(order);
          const initial = snapshotModel(model);

          animateNxNMove(model, m, null, 0);
          animateNxNMove(model, getInverseMove(m), null, 0);

          assertModelEqualsSnapshot(model, initial, 1e-5, `${order}x${order} ${m} + inv`);
        });
      });
    });
  });

  describe('Inner Slice Turns (2R, 3R) on 4x4, 5x5, 6x6, 7x7', () => {
    it('4x 2R on 4x4 returns to identity', () => {
      const model = buildNxNModel(4);
      const initial = snapshotModel(model);
      for (let i = 0; i < 4; i++) animateNxNMove(model, '2R', null, 0);
      assertModelEqualsSnapshot(model, initial, 1e-5, '4x4 4x 2R');
    });

    it('4x 2R and 4x 2U on 5x5 return to identity', () => {
      const model = buildNxNModel(5);
      const initial = snapshotModel(model);
      for (let i = 0; i < 4; i++) animateNxNMove(model, '2R', null, 0);
      assertModelEqualsSnapshot(model, initial, 1e-5, '5x5 4x 2R');

      for (let i = 0; i < 4; i++) animateNxNMove(model, '2U', null, 0);
      assertModelEqualsSnapshot(model, initial, 1e-5, '5x5 4x 2U');
    });

    it('4x 3R on 6x6 returns to identity', () => {
      const model = buildNxNModel(6);
      const initial = snapshotModel(model);
      for (let i = 0; i < 4; i++) animateNxNMove(model, '3R', null, 0);
      assertModelEqualsSnapshot(model, initial, 1e-5, '6x6 4x 3R');
    });

    it('4x 3R on 7x7 returns to identity', () => {
      const model = buildNxNModel(7);
      const initial = snapshotModel(model);
      for (let i = 0; i < 4; i++) animateNxNMove(model, '3R', null, 0);
      assertModelEqualsSnapshot(model, initial, 1e-5, '7x7 4x 3R');
    });
  });

  describe('Middle Slice Turns (M, E, S) on Odd Cubes (3x3, 5x5, 7x7)', () => {
    [3, 5, 7].forEach(order => {
      ['M', 'E', 'S'].forEach(slice => {
        it(`4x ${slice} returns to identity on ${order}x${order}`, () => {
          const model = buildNxNModel(order);
          const initial = snapshotModel(model);

          for (let i = 0; i < 4; i++) {
            animateNxNMove(model, slice, null, 0);
          }

          assertModelEqualsSnapshot(model, initial, 1e-5, `${order}x${order} 4x ${slice}`);
        });

        it(`2x ${slice}2 returns to identity on ${order}x${order}`, () => {
          const model = buildNxNModel(order);
          const initial = snapshotModel(model);

          for (let i = 0; i < 2; i++) {
            animateNxNMove(model, `${slice}2`, null, 0);
          }

          assertModelEqualsSnapshot(model, initial, 1e-5, `${order}x${order} 2x ${slice}2`);
        });
      });
    });

    it('rejects M on 2x2 with informative Error', () => {
      assert.throws(() => parseNxNMove('M', 2), /invalid on order 2/);
      assert.throws(() => parseNxNMove('E', 2), /invalid on order 2/);
      assert.throws(() => parseNxNMove('S', 2), /invalid on order 2/);
    });
  });
});

describe('Challenger M2-1: 3. Commutators and Multi-Turn Cycle Invariance', () => {
  it('6x Sexy Move (R U R\' U\') = 24 moves returns 2x2 and 3x3 to exact identity', () => {
    [2, 3].forEach(order => {
      const model = buildNxNModel(order);
      const initial = snapshotModel(model);
      const sexy = ['R', 'U', "R'", "U'"];

      for (let rep = 0; rep < 6; rep++) {
        for (const m of sexy) {
          animateNxNMove(model, m, null, 0);
        }
      }

      assertModelEqualsSnapshot(model, initial, 1e-5, `${order}x${order} 6x Sexy Move`);
    });
  });

  it('6x Wide Sexy Move (Rw Uw Rw\' Uw\') = 24 moves returns 4x4 and 5x5 to exact identity', () => {
    [4, 5].forEach(order => {
      const model = buildNxNModel(order);
      const initial = snapshotModel(model);
      const wideSexy = ['Rw', 'Uw', "Rw'", "Uw'"];

      for (let rep = 0; rep < 6; rep++) {
        for (const m of wideSexy) {
          animateNxNMove(model, m, null, 0);
        }
      }

      assertModelEqualsSnapshot(model, initial, 1e-5, `${order}x${order} 6x Wide Sexy Move`);
    });
  });

  it('6x (R2 U2) = 12 moves returns 3x3 to exact identity', () => {
    const model = buildNxNModel(3);
    const initial = snapshotModel(model);
    for (let rep = 0; rep < 6; rep++) {
      animateNxNMove(model, 'R2', null, 0);
      animateNxNMove(model, 'U2', null, 0);
    }
    assertModelEqualsSnapshot(model, initial, 1e-5, '3x3 6x (R2 U2)');
  });

  it('105x (R U) = 210 moves returns 3x3 positions and non-center matrices to exact identity', () => {
    const model = buildNxNModel(3);
    const initial = snapshotModel(model);

    for (let rep = 0; rep < 105; rep++) {
      animateNxNMove(model, 'R', null, 0);
      animateNxNMove(model, 'U', null, 0);
    }

    let maxPosDiff = 0;
    let maxNonCenterMatDiff = 0;
    model.children.forEach(child => {
      const snap = initial.get(child.name);
      assert.ok(snap, `Missing snapshot for cubie ${child.name}`);
      const posDiff = child.position.distanceTo(snap.position);
      maxPosDiff = Math.max(maxPosDiff, posDiff);
      assert.ok(posDiff < 1e-5, `Cubie ${child.name} position drifted by ${posDiff}`);

      // Non-centers return to exact matrix identity; centers rotate 90 deg because 105 % 4 === 1
      if (child.userData.pieceType !== 'center') {
        let matDiff = 0;
        for (let i = 0; i < 16; i++) {
          matDiff = Math.max(matDiff, Math.abs(child.matrix.elements[i] - snap.matrix.elements[i]));
        }
        maxNonCenterMatDiff = Math.max(maxNonCenterMatDiff, matDiff);
        assert.ok(matDiff < 1e-5, `Cubie ${child.name} matrix drifted by ${matDiff}`);
      }
    });
    assert.ok(maxPosDiff < 1e-6, `maxPosDiff ${maxPosDiff} should be virtually zero`);
    assert.ok(maxNonCenterMatDiff < 1e-6, `maxNonCenterMatDiff ${maxNonCenterMatDiff} should be virtually zero`);
  });

  it('420x (R U) = 840 moves returns 3x3 to exact matrix identity with zero drift (lcm(105, 4) supercube cycle)', () => {
    const model = buildNxNModel(3);
    const initial = snapshotModel(model);

    for (let rep = 0; rep < 420; rep++) {
      animateNxNMove(model, 'R', null, 0);
      animateNxNMove(model, 'U', null, 0);
    }

    const { maxPosDiff, maxMatDiff } = assertModelEqualsSnapshot(
      model,
      initial,
      1e-5,
      '3x3 420x (R U) [840 moves]'
    );
    assert.ok(maxPosDiff < 1e-6, `maxPosDiff ${maxPosDiff} should be virtually zero`);
    assert.ok(maxMatDiff < 1e-6, `maxMatDiff ${maxMatDiff} should be virtually zero`);
  });
});

describe('Challenger M2-1: 4. Zero-Drift Snapping Verification After 100 Consecutive Rotations', () => {
  const ORDERS = [2, 3, 4, 5, 6, 7];

  // Deterministic pseudo-random move generator for repeatability
  function getMovePool(order) {
    if (order === 2) {
      return ['R', "R'", 'R2', 'U', "U'", 'U2', 'F', "F'", 'F2', 'x', 'y', 'z'];
    }
    if (order === 3) {
      return ['R', "R'", 'R2', 'U', "U'", 'U2', 'F', "F'", 'F2', 'L', 'D', 'B', 'M', 'E', 'S', 'Rw', 'Uw', 'x', 'y', 'z'];
    }
    if (order === 4) {
      return ['R', "R'", 'R2', 'U', "U'", 'U2', 'F', 'Rw', "Rw'", '2R', 'Uw', '2U', 'Fw', '2F', 'x', 'y'];
    }
    if (order === 5) {
      return ['R', "R'", 'U', "U'", 'Rw', '2R', '3Rw', 'M', 'E', 'S', 'Fw', 'Dw', '2U', '2F'];
    }
    if (order === 6) {
      return ['R', "R'", 'U', "U'", 'Rw', '2R', '3R', '3Rw', 'Uw', '2U', '3U', 'Fw', '2F', '3F'];
    }
    // order 7
    return ['R', "R'", 'U', "U'", 'Rw', '2R', '3R', '3Rw', 'M', 'E', 'S', 'Uw', '2U', '3Uw', 'Fw', '3Fw'];
  }

  // Simple LCG PRNG for exact reproducible 100 moves
  function generate100Moves(order) {
    const pool = getMovePool(order);
    const moves = [];
    let seed = 42 + order * 17;
    for (let i = 0; i < 100; i++) {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      const idx = Math.abs(seed) % pool.length;
      moves.push(pool[idx]);
    }
    return moves;
  }

  ORDERS.forEach(order => {
    it(`executes 100 consecutive turns + 100 inverse turns on ${order}x${order} with zero cumulative drift`, () => {
      const model = buildNxNModel(order);
      const initial = snapshotModel(model);
      const moves = generate100Moves(order);

      assert.equal(moves.length, 100);

      // 1. Forward 100 moves
      for (let i = 0; i < moves.length; i++) {
        const m = moves[i];
        animateNxNMove(model, m, null, 0);

        // Sanity check grid positions at every step (no NaN, integers within bounds)
        for (let cIdx = 0; cIdx < model.children.length; cIdx++) {
          const c = model.children[cIdx];
          assert.ok(!Number.isNaN(c.position.x), `NaN X at step ${i} (${m}) on cubie ${c.name}`);
          assert.ok(!Number.isNaN(c.position.y), `NaN Y at step ${i} (${m}) on cubie ${c.name}`);
          assert.ok(!Number.isNaN(c.position.z), `NaN Z at step ${i} (${m}) on cubie ${c.name}`);

          // Layer index must be valid integer
          assert.ok(c.userData.layerX >= 0 && c.userData.layerX < order);
          assert.ok(c.userData.layerY >= 0 && c.userData.layerY < order);
          assert.ok(c.userData.layerZ >= 0 && c.userData.layerZ < order);
        }
      }

      // 2. Invert 100 moves in reverse order
      const inverseMoves = moves.slice().reverse().map(m => getInverseMove(m));
      assert.equal(inverseMoves.length, 100);

      for (let i = 0; i < inverseMoves.length; i++) {
        const invM = inverseMoves[i];
        animateNxNMove(model, invM, null, 0);
      }

      // 3. Compare with baseline: zero drift verification
      const { maxPosDiff, maxMatDiff } = assertModelEqualsSnapshot(
        model,
        initial,
        1e-5,
        `${order}x${order} 100 consecutive rotations + 100 inverse`
      );

      // Verify that coordinates snapped cleanly without floating point degradation
      assert.ok(maxPosDiff < 1e-6, `maxPosDiff was ${maxPosDiff}, expected < 1e-6`);
      assert.ok(maxMatDiff < 1e-6, `maxMatDiff was ${maxMatDiff}, expected < 1e-6`);
    });
  });
});

describe('Challenger M2-1: 5. Kinematic Boundary & Error Handling Stress', () => {
  it('rejects illegal move syntax and out-of-range layer indices', () => {
    // Non-string inputs
    assert.throws(() => parseNxNMove(null, 3), TypeError);
    assert.throws(() => parseNxNMove(undefined, 3), TypeError);
    assert.throws(() => parseNxNMove(123, 3), TypeError);

    // Invalid faces
    assert.throws(() => parseNxNMove('K', 3), /Invalid WCA notation/);
    assert.throws(() => parseNxNMove('Q2', 3), /Invalid WCA notation/);

    // Out-of-bounds layer prefixes
    assert.throws(() => parseNxNMove('5Rw', 4), /exceeds cube order 4/);
    assert.throws(() => parseNxNMove('5R', 4), /exceeds cube order 4/);
    assert.throws(() => parseNxNMove('8Rw', 7), /Invalid WCA notation/);
    assert.throws(() => parseNxNMove('8R', 7), /Invalid WCA notation/);
    assert.throws(() => parseNxNMove('3Rw', 2), /exceeds cube order 2/);
  });

  it('handles null or empty model gracefully in animateNxNMove', () => {
    let called = false;
    assert.doesNotThrow(() => {
      animateNxNMove(null, 'R', () => { called = true; }, 0);
    });
    assert.equal(called, true);
  });

  it('supports passing an external reusable pivotGroup', () => {
    const model = buildNxNModel(3);
    const parentScene = new THREE.Group();
    parentScene.add(model);

    const reusablePivot = new THREE.Group();
    parentScene.add(reusablePivot);

    const initial = snapshotModel(model);

    for (let i = 0; i < 4; i++) {
      animateNxNMove(model, 'R', null, 0, reusablePivot);
    }

    assertModelEqualsSnapshot(model, initial, 1e-5, 'reusablePivot test');
    // Ensure reusablePivot has 0 children after move finalization
    assert.equal(reusablePivot.children.length, 0, 'Pivot must release all cubies upon completion');
  });

  it('preserves hierarchy and ensures no dangling children attached to pivot after 100 turns', () => {
    const model = buildNxNModel(4);
    const parentScene = new THREE.Group();
    parentScene.add(model);

    const initialChildCount = model.children.length;

    for (let i = 0; i < 100; i++) {
      const move = i % 2 === 0 ? 'Rw' : 'Uw';
      animateNxNMove(model, move, null, 0);
    }

    assert.equal(model.children.length, initialChildCount);
  });
});
