/**
 * tests/unit/cube3x3StateSolver.test.js
 * Unit test suite for State-Based CFOP/LBL 3x3 Solver Engine
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildNxNModel } from '../../src/puzzles/nxn/NxNGeometry.js';
import { animateNxNMove } from '../../src/puzzles/nxn/NxNKinematics.js';
import {
  extract3x3StickerState,
  stickerStateToSolverString,
  normalizeSolverTokens,
  solve3x3FromModel
} from '../../src/solvers/cube3x3StateSolver.js';

describe('Tier 1: Feature 19 - 3x3 State-Based CFOP/LBL Solver', () => {
  it('F19.1: extract3x3StickerState returns all 6 faces with 9 stickers each', () => {
    const model = buildNxNModel(3);
    const state = extract3x3StickerState(model);

    assert.equal(state.U.length, 9);
    assert.equal(state.D.length, 9);
    assert.equal(state.F.length, 9);
    assert.equal(state.B.length, 9);
    assert.equal(state.L.length, 9);
    assert.equal(state.R.length, 9);

    const solverStr = stickerStateToSolverString(state);
    assert.equal(solverStr.length, 54);
    assert.equal(solverStr, 'fffffffffrrrrrrrrruuuuuuuuudddddddddlllllllllbbbbbbbbb');
  });

  it('F19.2: solve3x3FromModel returns empty moves for already solved cube', () => {
    const model = buildNxNModel(3);
    const result = solve3x3FromModel(model);

    assert.ok(result);
    assert.equal(result.isSolved, true);
    assert.equal(result.solutionMoves.length, 0);
    assert.equal(result.stages.length, 0);
  });

  it('F19.3: normalizeSolverTokens correctly converts prime variants to standard WCA prime', () => {
    const rawTokens = ['Uprime', 'SPRIME', 'Rprime', 'D2', 'F'];
    const normalized = normalizeSolverTokens(rawTokens);

    assert.deepEqual(normalized, ["U'", "S'", "R'", 'D2', 'F']);
  });

  it('F19.4: solves arbitrary manual scramble using formula stages (Cross, F2L, OLL, PLL)', () => {
    const model = buildNxNModel(3);
    const scramble = "R U R' U' F' U F";
    scramble.split(/\s+/).forEach((m) => animateNxNMove(model, m, null, 0));

    const result = solve3x3FromModel(model);
    assert.ok(result);
    assert.ok(result.solutionMoves.length > 0);
    assert.ok(result.stages.length > 0);

    // Apply solution moves to the model
    result.solutionMoves.forEach((m) => animateNxNMove(model, m, null, 0));

    // Verify model is now 100% solved
    const finalState = extract3x3StickerState(model);
    const finalStr = stickerStateToSolverString(finalState);
    assert.equal(finalStr, 'fffffffffrrrrrrrrruuuuuuuuudddddddddlllllllllbbbbbbbbb');
  });

  it('F19.5: solves complex 10-move scramble completely via formula execution', () => {
    const model = buildNxNModel(3);
    const scramble = "R U F L D B R' U' F' L'";
    scramble.split(/\s+/).forEach((m) => animateNxNMove(model, m, null, 0));

    const result = solve3x3FromModel(model);
    assert.ok(result);
    assert.ok(result.solutionMoves.length > 0);

    // Execute solution
    result.solutionMoves.forEach((m) => animateNxNMove(model, m, null, 0));

    const finalState = extract3x3StickerState(model);
    const finalStr = stickerStateToSolverString(finalState);
    assert.equal(finalStr, 'fffffffffrrrrrrrrruuuuuuuuudddddddddlllllllllbbbbbbbbb');
  });
});
