/**
 * Automated Unit Tests for Puzzle Registry & Difficulty Tiers (Feature F01)
 * Location: tests/unit/puzzleRegistry.test.js
 * Runner: node --test
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  puzzleRegistry,
  normalizePuzzleId,
  getAllPuzzleMetadata,
  getPuzzleMetadata,
  getPuzzlesByCategory,
  getPuzzlesByDifficulty,
  getPuzzlesGroupedByDifficulty,
  loadPuzzle
} from '../../src/puzzles/registry.js';

describe('Feature F01: Universal Puzzle Registry, Metadata & Difficulty Tiers', () => {
  test('should index exactly all 10 official WCA puzzles in metadata catalog', () => {
    const allMeta = getAllPuzzleMetadata();
    assert.equal(allMeta.length, 10, 'Must have exactly 10 WCA puzzles');

    const expectedIds = [
      'cube-2x2', 'cube-3x3', 'cube-4x4', 'cube-5x5', 'cube-6x6', 'cube-7x7',
      'pyraminx', 'megaminx', 'skewb', 'square-1'
    ];

    const actualIds = allMeta.map(m => m.id);
    expectedIds.forEach(id => {
      assert.ok(actualIds.includes(id), `Missing expected puzzle ID: ${id}`);
    });
  });

  test('should correctly categorize all 10 puzzles into the 4 UX difficulty tiers', () => {
    const grouped = getPuzzlesGroupedByDifficulty();

    // 1. Pemula (Beginner): 2x2, 3x3, Pyraminx
    const beginnerIds = grouped.beginner.map(p => p.id);
    assert.equal(grouped.beginner.length, 3);
    assert.deepEqual(beginnerIds.sort(), ['cube-2x2', 'cube-3x3', 'pyraminx'].sort());

    // 2. Menengah (Intermediate): 4x4, Skewb
    const intermediateIds = grouped.intermediate.map(p => p.id);
    assert.equal(grouped.intermediate.length, 2);
    assert.deepEqual(intermediateIds.sort(), ['cube-4x4', 'skewb'].sort());

    // 3. Mahir (Advanced): 5x5, Megaminx
    const advancedIds = grouped.advanced.map(p => p.id);
    assert.equal(grouped.advanced.length, 2);
    assert.deepEqual(advancedIds.sort(), ['cube-5x5', 'megaminx'].sort());

    // 4. Master (Expert): 6x6, 7x7, Square-1
    const expertIds = grouped.expert.map(p => p.id);
    assert.equal(grouped.expert.length, 3);
    assert.deepEqual(expertIds.sort(), ['cube-6x6', 'cube-7x7', 'square-1'].sort());

    // Verify filter helper
    assert.equal(getPuzzlesByDifficulty('beginner').length, 3);
    assert.equal(getPuzzlesByDifficulty('intermediate').length, 2);
    assert.equal(getPuzzlesByDifficulty('advanced').length, 2);
    assert.equal(getPuzzlesByDifficulty('expert').length, 3);
  });

  test('should correctly normalize all aliases and abbreviations to canonical IDs', () => {
    assert.equal(normalizePuzzleId('3x3'), 'cube-3x3');
    assert.equal(normalizePuzzleId('333'), 'cube-3x3');
    assert.equal(normalizePuzzleId('rubik'), 'cube-3x3');

    assert.equal(normalizePuzzleId('2x2'), 'cube-2x2');
    assert.equal(normalizePuzzleId('pocket'), 'cube-2x2');

    assert.equal(normalizePuzzleId('444'), 'cube-4x4');
    assert.equal(normalizePuzzleId('revenge'), 'cube-4x4');

    assert.equal(normalizePuzzleId('555'), 'cube-5x5');
    assert.equal(normalizePuzzleId('professor'), 'cube-5x5');

    assert.equal(normalizePuzzleId('pyra'), 'pyraminx');
    assert.equal(normalizePuzzleId('pyram'), 'pyraminx');

    assert.equal(normalizePuzzleId('mega'), 'megaminx');
    assert.equal(normalizePuzzleId('minx'), 'megaminx');

    assert.equal(normalizePuzzleId('skewb'), 'skewb');

    assert.equal(normalizePuzzleId('sq1'), 'square-1');
    assert.equal(normalizePuzzleId('sq-1'), 'square-1');
    assert.equal(normalizePuzzleId('SQ-1'), 'square-1');
    assert.equal(normalizePuzzleId('Sq-1'), 'square-1');
    assert.equal(normalizePuzzleId('square1'), 'square-1');
    assert.equal(normalizePuzzleId('square-1'), 'square-1');
    assert.equal(normalizePuzzleId('square 1'), 'square-1');
    assert.equal(normalizePuzzleId('sq 1'), 'square-1');

    // NxNxN cubic forms and commercial names
    assert.equal(normalizePuzzleId('2x2x2'), 'cube-2x2');
    assert.equal(normalizePuzzleId('cube2x2'), 'cube-2x2');
    assert.equal(normalizePuzzleId('pocket-cube'), 'cube-2x2');
    assert.equal(normalizePuzzleId('3x3x3'), 'cube-3x3');
    assert.equal(normalizePuzzleId('cube3x3'), 'cube-3x3');
    assert.equal(normalizePuzzleId('rubiks'), 'cube-3x3');
    assert.equal(normalizePuzzleId('standard'), 'cube-3x3');
    assert.equal(normalizePuzzleId('4x4x4'), 'cube-4x4');
    assert.equal(normalizePuzzleId('cube4x4'), 'cube-4x4');
    assert.equal(normalizePuzzleId('rubiks-revenge'), 'cube-4x4');
    assert.equal(normalizePuzzleId('5x5x5'), 'cube-5x5');
    assert.equal(normalizePuzzleId('cube5x5'), 'cube-5x5');
    assert.equal(normalizePuzzleId('professors-cube'), 'cube-5x5');
    assert.equal(normalizePuzzleId('6x6x6'), 'cube-6x6');
    assert.equal(normalizePuzzleId('cube6x6'), 'cube-6x6');
    assert.equal(normalizePuzzleId('vcube-6x6'), 'cube-6x6');
    assert.equal(normalizePuzzleId('vcube6'), 'cube-6x6');
    assert.equal(normalizePuzzleId('7x7x7'), 'cube-7x7');
    assert.equal(normalizePuzzleId('cube7x7'), 'cube-7x7');
    assert.equal(normalizePuzzleId('vcube-7x7'), 'cube-7x7');
    assert.equal(normalizePuzzleId('vcube7'), 'cube-7x7');

    // Geometric shape aliases
    assert.equal(normalizePuzzleId('tetrahedron'), 'pyraminx');
    assert.equal(normalizePuzzleId('dodecahedron'), 'megaminx');
  });

  test('should support case-insensitive and aliased property access via Proxy', () => {
    // Unloaded puzzle definition returns null via Proxy lookup
    assert.equal(puzzleRegistry['SQ-1'], null);
    assert.equal(puzzleRegistry['sq-1'], null);
    assert.equal(puzzleRegistry['3X3'], null);
    assert.equal(puzzleRegistry['non-existent-prop'], undefined);

    // Register a mock definition to verify loaded property resolution
    const dummySq1 = { id: 'square-1', name: 'Square-1', category: 'shape' };
    puzzleRegistry.register('square-1', dummySq1);
    try {
      assert.equal(puzzleRegistry.has('SQ-1'), true);
      assert.equal(puzzleRegistry.has('sq-1'), true);
      assert.equal(puzzleRegistry['SQ-1'], dummySq1);
      assert.equal(puzzleRegistry['sq-1'], dummySq1);
      assert.equal(puzzleRegistry['Square 1'], dummySq1);
    } finally {
      puzzleRegistry.definitions.delete('square-1');
    }
  });

  test('should filter puzzles cleanly by category', () => {
    const nxnPuzzles = getPuzzlesByCategory('nxn');
    assert.equal(nxnPuzzles.length, 6, 'Must have 6 NxN cubes (2x2 to 7x7)');
    nxnPuzzles.forEach(p => assert.equal(p.category, 'nxn'));

    const shapePuzzles = getPuzzlesByCategory('shape');
    assert.equal(shapePuzzles.length, 4, 'Must have 4 shape puzzles');
    shapePuzzles.forEach(p => assert.equal(p.category, 'shape'));
  });

  test('should retrieve accurate metadata for each puzzle', () => {
    const megaminx = getPuzzleMetadata('megaminx');
    assert.ok(megaminx);
    assert.equal(megaminx.faceCount, 12);
    assert.equal(megaminx.wcaId, 'minx');
    assert.equal(megaminx.difficulty, 'advanced');
    assert.equal(megaminx.difficultyLabel, 'Mahir');

    const sq1 = getPuzzleMetadata('square-1');
    assert.ok(sq1);
    assert.equal(sq1.hasParity, true);
    assert.equal(sq1.difficulty, 'expert');
    assert.equal(sq1.difficultyLabel, 'Master');

    const pyra = getPuzzleMetadata('pyraminx');
    assert.ok(pyra);
    assert.equal(pyra.faceCount, 4);
    assert.equal(pyra.difficulty, 'beginner');
    assert.equal(pyra.difficultyLabel, 'Pemula');
  });

  test('should support dynamic registration and listener notification', () => {
    let notified = false;
    const unsubscribe = puzzleRegistry.subscribe(event => {
      if (event.type === 'registered' && event.puzzleId === 'mock-custom') {
        notified = true;
      }
    });

    const dummyCustom = {
      id: 'mock-custom',
      name: "Mock Custom",
      category: 'nxn',
      difficulty: 'beginner'
    };

    puzzleRegistry.register('mock-custom', dummyCustom);
    assert.ok(puzzleRegistry.has('mock-custom'));
    assert.ok(puzzleRegistry.isLoaded('mock-custom'));
    assert.equal(puzzleRegistry.get('mock-custom').name, "Mock Custom");
    assert.ok(notified, 'Listener must be triggered upon registration');

    unsubscribe();
  });

  test('should load cube-5x5 definition adapter successfully', async () => {
    const def = await loadPuzzle('cube-5x5');
    assert.ok(def, 'cube-5x5 definition must resolve');
    assert.equal(def.id, 'cube-5x5');
    assert.equal(def.order, 5);
    assert.equal(def.difficulty, 'advanced');
    assert.equal(def.difficultyLabel, 'Mahir');
    assert.equal(typeof def.buildModel, 'function');
    assert.equal(typeof def.parseAlgorithm, 'function');
    assert.equal(typeof def.getInverseMove, 'function');
  });
});
