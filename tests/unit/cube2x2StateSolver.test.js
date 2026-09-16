/**
 * tests/unit/cube2x2StateSolver.test.js
 * Unit test suite for 2x2 Pocket Cube State-Based Group Solver & Move Simplifier
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildNxNModel } from '../../src/puzzles/nxn/NxNGeometry.js';
import { animateNxNMove } from '../../src/puzzles/nxn/NxNKinematics.js';
import {
  extract2x2StickerState,
  is2x2Solved,
  solve2x2State,
  solve2x2FromModel
} from '../../src/solvers/cube2x2StateSolver.js';
import { simplifyMoves, parseTurn, formatTurn } from '../../src/solvers/moveSimplifier.js';

describe('Tier 1: Feature 20 - 2x2 State-Based Group Solver & Simplifier', () => {
  it('F20.1: extract2x2StickerState extracts 24 stickers on solved 2x2', () => {
    const model = buildNxNModel(2);
    const state = extract2x2StickerState(model);

    assert.ok(state);
    assert.equal(state.length, 24);
    assert.equal(is2x2Solved(state), true);
  });

  it('F20.2: solve2x2FromModel returns isSolved: true for already solved cube', () => {
    const model = buildNxNModel(2);
    const res = solve2x2FromModel(model);

    assert.ok(res);
    assert.equal(res.isSolved, true);
    assert.equal(res.solutionMoves.length, 0);
  });

  it('F20.3: solves arbitrary manual scramble into authentic solution moves', () => {
    const model = buildNxNModel(2);
    const scramble = ['R', 'U', 'R2', 'F', 'U2', 'R'];
    scramble.forEach((m) => animateNxNMove(model, m, null, 0));

    const stateBefore = extract2x2StickerState(model);
    assert.equal(is2x2Solved(stateBefore), false);

    const res = solve2x2FromModel(model);
    assert.ok(res);
    assert.ok(res.solutionMoves.length > 0);
    assert.ok(res.stages.length >= 2);

    // Apply solution to model
    res.solutionMoves.forEach((m) => animateNxNMove(model, m, null, 0));
    const stateAfter = extract2x2StickerState(model);
    assert.equal(is2x2Solved(stateAfter), true);
  });

  it('F20.4: simplifyMoves cancels inverse turns and merges quarter turns', () => {
    assert.deepEqual(simplifyMoves(['R', 'R']), ['R2']);
    assert.deepEqual(simplifyMoves(['R', "R'"]), []);
    assert.deepEqual(simplifyMoves(['U2', 'U']), ["U'"]);
    assert.deepEqual(simplifyMoves(['R', 'L', 'R']), ['L', 'R2']);
    assert.deepEqual(simplifyMoves(['R', 'U', "R'", 'R', 'U']), ['R', 'U2']);
  });

  it('F20.5: parseTurn and formatTurn adhere to modulo 4 turn metric', () => {
    assert.deepEqual(parseTurn('R2'), { base: 'R', count: 2 });
    assert.deepEqual(parseTurn("U'"), { base: 'U', count: 3 });
    assert.equal(formatTurn('R', 4), '');
    assert.equal(formatTurn('F', 2), 'F2');
    assert.equal(formatTurn('U', 3), "U'");
  });
});

