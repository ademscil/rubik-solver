/**
 * Adversarial Challenge Tests: UI Playback, Notation Dictionary, and Modal Edge Cases
 * Tests:
 * 1. getMoveInfo across all 10 WCA puzzles for standard, wide, slice, rotation, and non-standard moves
 * 2. Playback state transitions: play, pause, step forward/backward, speed changing, reset while playing
 * 3. Notation modal dictionary & category generation for all 10 puzzles ensuring no undefined fields
 * 4. Stress tests on concurrency, boundary indices, and rapid state transitions
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { puzzleRegistry } from '../../src/puzzles/registry.js';
import { NOTATION_DICTIONARY as DEFAULT_NXN_DICTIONARY, getMoveInfo as defaultGetMoveInfo } from '../../src/cube/rubikNotation.js';

// Helper extracting NotationModal's category & dictionary builder logic verbatim
function buildNotationCategoriesAndDict(puzzle) {
  const pId = puzzle?.id || 'cube-3x3';
  const dict = {};

  // 1. Pyraminx
  if (pId === 'pyraminx') {
    const pNotation = puzzle?.notation || {};
    Object.assign(dict, pNotation);
    const mainKeys = ['U', "U'", 'R', "R'", 'L', "L'", 'B', "B'"].filter(k => dict[k]);
    const tipKeys = ['u', "u'", 'r', "r'", 'l', "l'", 'b', "b'"].filter(k => dict[k]);
    return {
      categories: {
        main: {
          name: 'Sisi Utama (120°)',
          desc: 'Memutar 3/4 bagian dari satu sudut tetrahedron',
          keys: mainKeys
        },
        tips: {
          name: 'Ujung / Tips',
          desc: 'Memutar hanya 1 potongan ujung tetrahedron secara independen',
          keys: tipKeys
        }
      },
      dictionary: dict
    };
  }

  // 2. Skewb
  if (pId === 'skewb') {
    const sNotation = puzzle?.notation || {};
    Object.assign(dict, sNotation);
    const cornerKeys = Object.keys(dict).filter(k => typeof dict[k] === 'object' && dict[k]?.name);
    return {
      categories: {
        corners: {
          name: 'Sudut Diagonal (120°)',
          desc: 'Putaran sudut deep-cut membelah separuh badan Skewb',
          keys: cornerKeys
        }
      },
      dictionary: dict
    };
  }

  // 3. Megaminx
  if (pId === 'megaminx') {
    const mNotation = puzzle?.notation || {};
    Object.assign(dict, mNotation);
    const faceKeys = ['U', "U'", 'F', "F'", 'R', "R'", 'L', "L'", 'D', "D'", 'B', "B'"].filter(k => dict[k]);
    const pochKeys = ['R++', 'R--', 'D++', 'D--'].filter(k => dict[k]);
    return {
      categories: {
        faces: {
          name: 'Putaran Sisi (72°)',
          desc: 'Putaran satu sisi pentagonal 72 derajat',
          keys: faceKeys
        },
        pochmann: {
          name: 'Pochmann Scramble',
          desc: 'Putaran dua lapis ganda 144 derajat (R++, R--, D++, D--)',
          keys: pochKeys
        }
      },
      dictionary: dict
    };
  }

  // 4. Square-1
  if (pId.startsWith('square')) {
    const sqNotation = puzzle?.notation || {};
    Object.assign(dict, sqNotation);
    const sliceKeys = ['/'].filter(k => dict[k]);
    const tupleKeys = Object.keys(dict).filter(k => k !== '/' && typeof dict[k] === 'object' && dict[k]?.name);
    return {
      categories: {
        slice: {
          name: 'Irisan Slice (/)',
          desc: 'Memutar irisan tengah belahan vertikal 180 derajat',
          keys: sliceKeys
        },
        tuples: {
          name: 'Putaran Lapisan (x, y)',
          desc: 'Putaran sudut atas (x) dan bawah (y) dalam kelipatan 30 derajat',
          keys: tupleKeys
        }
      },
      dictionary: dict
    };
  }

  // 5. Default NxN (2x2 to 7x7)
  Object.assign(dict, DEFAULT_NXN_DICTIONARY);
  if (puzzle?.notation) {
    Object.assign(dict, puzzle.notation);
  }

  const order = puzzle?.order || 3;
  const cats = {
    outer: {
      name: 'Sisi Luar',
      desc: 'Hanya memutar 1 lapisan terluar (R, L, U, D, F, B)',
      keys: ['R', "R'", 'R2', 'L', "L'", 'L2', 'U', "U'", 'U2', 'D', "D'", 'D2', 'F', "F'", 'F2', 'B', "B'", 'B2'].filter(k => dict[k])
    }
  };

  if (order >= 4) {
    cats.wide = {
      name: 'Lapisan Ganda (Rw, Uw)',
      desc: 'Memutar 2 atau lebih lapisan luar sekaligus',
      keys: ['Rw', "Rw'", 'Rw2', 'Lw', "Lw'", 'Uw', "Uw'", 'Dw', "Dw'", 'Fw', "Fw'", 'Bw', "Bw'", '3Rw', '3Uw'].filter(k => dict[k])
    };
    cats.slice = {
      name: 'Lapisan Dalam (Slice)',
      desc: 'Memutar hanya lapisan tertentu di dalam kubus',
      keys: ['2R', "2R'", '2R2', '2L', '2U', "2U'", '2D', '2F', 'M', "M'"].filter(k => dict[k])
    };
  } else {
    cats.slice = {
      name: 'Irisan Tengah (M)',
      desc: 'Memutar irisan tengah vertikal antara R dan L',
      keys: ['M', "M'", 'M2'].filter(k => dict[k])
    };
  }

  cats.cube = {
    name: 'Rotasi Kubus (x, y, z)',
    desc: 'Memutar orientasi seluruh kubus tanpa mengubah susunan potongan',
    keys: ['x', "x'", 'y', "y'", 'z', "z'"].filter(k => dict[k])
  };

  return {
    categories: cats,
    dictionary: dict
  };
}

// Helper replicating PlaybackBar's resolveMoveInfo
function resolveMoveInfo(token, puzzle) {
  if (!token) return { name: '', desc: '' };
  if (puzzle && typeof puzzle.getMoveInfo === 'function') {
    try {
      const info = puzzle.getMoveInfo(token);
      if (info) return info;
    } catch {
      // fallback
    }
  }
  return defaultGetMoveInfo(token) || { name: token, desc: `Putaran ${token}` };
}

const ALL_PUZZLE_IDS = [
  'cube-2x2',
  'cube-3x3',
  'cube-4x4',
  'cube-5x5',
  'cube-6x6',
  'cube-7x7',
  'pyraminx',
  'megaminx',
  'skewb',
  'square-1'
];

describe('Adversarial Challenge: getMoveInfo Across All 10 Puzzles', () => {
  it('1.1: getMoveInfo exists as a function on all 10 puzzle definitions', async () => {
    for (const pId of ALL_PUZZLE_IDS) {
      const def = await puzzleRegistry.load(pId);
      assert.ok(def, `Puzzle definition ${pId} failed to load`);
      assert.equal(typeof def.getMoveInfo, 'function', `Puzzle ${pId} must export getMoveInfo function`);
    }
  });

  it('1.2: getMoveInfo returns valid object with name and desc for standard face turns', async () => {
    const standardMoves = ['R', "R'", 'R2', 'L', 'U', 'D', 'F', 'B'];
    for (const pId of ALL_PUZZLE_IDS) {
      const def = await puzzleRegistry.load(pId);
      for (const m of standardMoves) {
        const info = def.getMoveInfo(m);
        assert.ok(info && typeof info === 'object', `Move ${m} on ${pId} returned non-object: ${info}`);
        assert.ok(typeof info.name === 'string' && info.name.length > 0, `Move ${m} on ${pId} missing name`);
        assert.ok(typeof info.desc === 'string' && info.desc.length > 0, `Move ${m} on ${pId} missing desc`);
      }
    }
  });

  it('1.3: getMoveInfo handles wide turns (Rw, 3Rw, 3Uw) across all puzzles without throwing', async () => {
    const wideMoves = ['Rw', "Rw'", 'Rw2', '3Rw', "3Rw'", '3Uw', '4Rw', '5Rw'];
    for (const pId of ALL_PUZZLE_IDS) {
      const def = await puzzleRegistry.load(pId);
      for (const m of wideMoves) {
        assert.doesNotThrow(() => {
          const info = def.getMoveInfo(m);
          assert.ok(info && typeof info === 'object', `Wide move ${m} on ${pId} must return object`);
          assert.ok(info.name, `Wide move ${m} on ${pId} must have name`);
          assert.ok(info.desc, `Wide move ${m} on ${pId} must have desc`);
        }, `Wide move ${m} threw on ${pId}`);
      }
    }
  });

  it('1.4: getMoveInfo handles slice turns (2R, 2L, M, M\') across all puzzles', async () => {
    const sliceMoves = ['2R', "2R'", '2L', '2U', '3R', 'M', "M'", 'M2'];
    for (const pId of ALL_PUZZLE_IDS) {
      const def = await puzzleRegistry.load(pId);
      for (const m of sliceMoves) {
        assert.doesNotThrow(() => {
          const info = def.getMoveInfo(m);
          assert.ok(info && typeof info === 'object');
          assert.ok(info.name, `Slice move ${m} on ${pId} must have name`);
        });
      }
    }
  });

  it('1.5: getMoveInfo handles whole puzzle rotations (x, y, z, y2, z\') across all puzzles', async () => {
    const rotationMoves = ['x', "x'", 'x2', 'y', "y'", 'y2', 'z', "z'", 'z2'];
    for (const pId of ALL_PUZZLE_IDS) {
      const def = await puzzleRegistry.load(pId);
      for (const m of rotationMoves) {
        const info = def.getMoveInfo(m);
        assert.ok(info && typeof info === 'object');
        assert.ok(info.name && info.name.length > 0);
        assert.ok(info.desc && info.desc.length > 0);
      }
    }
  });

  it('1.6: getMoveInfo handles non-cubic specific moves (Pyraminx tips, Megaminx Pochmann, Square-1 tuples)', async () => {
    const pyra = await puzzleRegistry.load('pyraminx');
    const pyraTips = ['u', "u'", 'r', "r'", 'l', "l'", 'b', "b'"];
    for (const tip of pyraTips) {
      const info = pyra.getMoveInfo(tip);
      assert.ok(info.name && info.desc);
      assert.ok(info.name.toLowerCase().includes('tip') || info.name.toLowerCase().includes('ujung'), `Pyraminx tip ${tip} should describe tip`);
    }

    const mega = await puzzleRegistry.load('megaminx');
    const megaMoves = ['R++', 'R--', 'D++', 'D--'];
    for (const m of megaMoves) {
      const info = mega.getMoveInfo(m);
      assert.ok(info.name && info.desc);
      assert.ok(info.name.includes('Pochmann') || info.desc.includes('144'), `Megaminx ${m} should describe Pochmann`);
    }

    const sq1 = await puzzleRegistry.load('square-1');
    const sq1Moves = ['/', '(1,0)', '(0,-1)', '(3,2)', '(-3,-3)', '(0,0)', '(6,6)'];
    for (const m of sq1Moves) {
      const info = sq1.getMoveInfo(m);
      assert.ok(info.name && info.desc);
      if (m === '/') {
        assert.ok(info.name.includes('Irisan') || info.name.includes('Slice'), `Square-1 slash should be slice`);
      } else {
        assert.ok(info.name.includes('Lapisan') || info.desc.includes('°'), `Square-1 tuple should mention degree or layer`);
      }
    }
  });

  it('1.7: getMoveInfo handles non-standard, empty, whitespace, and unknown moves gracefully without crashing', async () => {
    const adversarialInputs = [
      '',
      '   ',
      'UNKNOWN_TOKEN',
      'Q2',
      'F***',
      '// comment',
      '(99,99)'
    ];

    for (const pId of ALL_PUZZLE_IDS) {
      const def = await puzzleRegistry.load(pId);
      for (const input of adversarialInputs) {
        assert.doesNotThrow(() => {
          const info = def.getMoveInfo(input);
          assert.ok(info && typeof info === 'object', `Expected object for input '${input}' on ${pId}`);
        }, `getMoveInfo crashed on input '${input}' for puzzle ${pId}`);
      }
    }
  });

  it('1.8: PlaybackBar resolveMoveInfo helper never returns undefined fields for any puzzle and input', async () => {
    const testCases = [
      null,
      undefined,
      '',
      'R',
      'Rw',
      '3Rw',
      'M',
      'x',
      'y2',
      'u',
      'R++',
      '/',
      '(1,0)',
      'NON_EXISTENT'
    ];

    for (const pId of ALL_PUZZLE_IDS) {
      const puzzle = await puzzleRegistry.load(pId);
      for (const token of testCases) {
        const res = resolveMoveInfo(token, puzzle);
        assert.ok(res && typeof res === 'object', `resolveMoveInfo returned falsy for token '${token}' on ${pId}`);
        assert.equal(typeof res.name, 'string', `res.name must be string for token '${token}' on ${pId}`);
        assert.equal(typeof res.desc, 'string', `res.desc must be string for token '${token}' on ${pId}`);
      }
    }
  });
});

describe('Adversarial Challenge: Notation Modal Dictionary for All 10 Puzzles', () => {
  it('2.1: NotationModal generates valid category structures for all 10 puzzles', async () => {
    for (const pId of ALL_PUZZLE_IDS) {
      const puzzle = await puzzleRegistry.load(pId);
      const { categories, dictionary } = buildNotationCategoriesAndDict(puzzle);

      assert.ok(categories && typeof categories === 'object', `${pId} categories must be an object`);
      const catKeys = Object.keys(categories);
      assert.ok(catKeys.length > 0, `${pId} must define at least one category`);

      for (const catKey of catKeys) {
        const cat = categories[catKey];
        assert.ok(typeof cat.name === 'string' && cat.name.trim().length > 0, `${pId} category ${catKey} missing name`);
        assert.ok(typeof cat.desc === 'string' && cat.desc.trim().length > 0, `${pId} category ${catKey} missing desc`);
        assert.ok(Array.isArray(cat.keys), `${pId} category ${catKey} keys must be an array`);
        assert.ok(cat.keys.length > 0, `${pId} category ${catKey} keys array must not be empty`);

        // Every key listed must exist in dictionary with valid name and desc
        for (const k of cat.keys) {
          const dictEntry = dictionary[k];
          assert.ok(dictEntry, `Key '${k}' in category ${catKey} for puzzle ${pId} missing in dictionary`);
          assert.ok(typeof dictEntry.name === 'string' && dictEntry.name.trim().length > 0, `Dict entry '${k}' in ${pId} missing name`);
          assert.ok(typeof dictEntry.desc === 'string' && dictEntry.desc.trim().length > 0, `Dict entry '${k}' in ${pId} missing desc`);
        }
      }
    }
  });

  it('2.2: Modal categories correctly reflect puzzle type specifications', async () => {
    // Pyraminx must have main and tips
    const pyra = await puzzleRegistry.load('pyraminx');
    const pyraCats = buildNotationCategoriesAndDict(pyra).categories;
    assert.ok(pyraCats.main, 'Pyraminx must have main category');
    assert.ok(pyraCats.tips, 'Pyraminx must have tips category');
    assert.ok(pyraCats.tips.keys.includes('u') && pyraCats.tips.keys.includes('r'));

    // Megaminx must have faces and pochmann
    const mega = await puzzleRegistry.load('megaminx');
    const megaCats = buildNotationCategoriesAndDict(mega).categories;
    assert.ok(megaCats.faces, 'Megaminx must have faces category');
    assert.ok(megaCats.pochmann, 'Megaminx must have pochmann category');
    assert.ok(megaCats.pochmann.keys.includes('R++') && megaCats.pochmann.keys.includes('D--'));

    // Skewb must have corners category
    const skewb = await puzzleRegistry.load('skewb');
    const skewbCats = buildNotationCategoriesAndDict(skewb).categories;
    assert.ok(skewbCats.corners, 'Skewb must have corners category');
    assert.ok(skewbCats.corners.keys.length >= 4);

    // Square-1 must have slice and tuples categories
    const sq1 = await puzzleRegistry.load('square-1');
    const sq1Cats = buildNotationCategoriesAndDict(sq1).categories;
    assert.ok(sq1Cats.slice, 'Square-1 must have slice category');
    assert.ok(sq1Cats.tuples, 'Square-1 must have tuples category');
    assert.ok(sq1Cats.slice.keys.includes('/'));

    // High order NxN (4x4 to 7x7) must have outer, wide, slice, cube
    for (const id of ['cube-4x4', 'cube-5x5', 'cube-6x6', 'cube-7x7']) {
      const p = await puzzleRegistry.load(id);
      const cats = buildNotationCategoriesAndDict(p).categories;
      assert.ok(cats.outer, `${id} must have outer category`);
      assert.ok(cats.wide, `${id} must have wide category`);
      assert.ok(cats.slice, `${id} must have slice category`);
      assert.ok(cats.cube, `${id} must have cube category`);
    }

    // Standard 3x3 must have outer, slice (M), and cube, but NO wide category
    const c3 = await puzzleRegistry.load('cube-3x3');
    const c3Cats = buildNotationCategoriesAndDict(c3).categories;
    assert.ok(c3Cats.outer);
    assert.ok(c3Cats.slice);
    assert.ok(c3Cats.cube);
    assert.equal(c3Cats.wide, undefined, '3x3 standard must not have wide turns category');
  });

  it('2.3: Edge case audit: cube-2x2 category definitions vs physical mechanics', async () => {
    // Audit finding: In NotationModal, for order < 4 (which includes 2x2), cats.slice contains 'M', 'M\'', 'M2'
    const c2 = await puzzleRegistry.load('cube-2x2');
    const c2Result = buildNotationCategoriesAndDict(c2);
    // Observe: 2x2 has slice category because order < 4 defaults to cats.slice with M
    assert.ok(c2Result.categories.slice, 'cube-2x2 currently includes slice category in modal');
    assert.deepEqual(c2Result.categories.slice.keys, ['M', "M'", 'M2']);
  });
});

describe('Adversarial Challenge: Playback State Transitions', () => {
  // Comprehensive Playback State Machine Simulator testing React App.jsx logic
  class PlaybackSimulator {
    constructor(puzzle) {
      this.puzzle = puzzle;
      this.moves = [];
      this.currentIndex = 0;
      this.isPlaying = false;
      this.speed = 1.0;
      this.isBusy = false;
      this.executionLog = [];
      this.cubeResetCount = 0;
      this.confettiCount = 0;
    }

    loadMoves(algString) {
      this.isPlaying = false;
      const parseFn = this.puzzle?.parseAlgorithm || ((str) => str.split(/\s+/).filter(Boolean));
      this.moves = parseFn(algString);
      this.currentIndex = 0;
      this.executionLog = [];
    }

    playToggle() {
      if (this.moves.length === 0) return false;

      if (this.isPlaying) {
        this.isPlaying = false;
        return true;
      } else {
        if (this.currentIndex >= this.moves.length) {
          this.currentIndex = 0;
        }
        this.isPlaying = true;
        this.dispatchNextMove();
        return true;
      }
    }

    dispatchNextMove() {
      if (!this.isPlaying) return;
      if (this.currentIndex >= this.moves.length) {
        this.isPlaying = false;
        this.confettiCount++;
        return;
      }

      this.isBusy = true;
      const move = this.moves[this.currentIndex];
      this.executionLog.push({ type: 'forward', move, index: this.currentIndex });

      // Simulate animation completion
      this.isBusy = false;
      this.currentIndex++;

      if (this.currentIndex >= this.moves.length) {
        this.isPlaying = false;
        this.confettiCount++;
      } else if (this.isPlaying) {
        // next move
        this.dispatchNextMove();
      }
    }

    stepNext() {
      if (this.currentIndex >= this.moves.length) return false;
      if (this.isBusy || this.isPlaying) return false;

      this.isBusy = true;
      const move = this.moves[this.currentIndex];
      this.executionLog.push({ type: 'stepNext', move, index: this.currentIndex });
      this.currentIndex++;
      this.isBusy = false;

      if (this.currentIndex === this.moves.length) {
        this.confettiCount++;
      }
      return true;
    }

    stepPrev() {
      if (this.currentIndex <= 0) return false;
      if (this.isBusy || this.isPlaying) return false;

      this.isBusy = true;
      const prevMove = this.moves[this.currentIndex - 1];
      const inverseFn = this.puzzle?.getInverseMove || ((m) => m + "'");
      const inverse = inverseFn(prevMove);

      this.executionLog.push({ type: 'stepPrev', original: prevMove, inverse, index: this.currentIndex - 1 });
      this.currentIndex--;
      this.isBusy = false;
      return true;
    }

    setSpeed(newSpeed) {
      this.speed = newSpeed;
    }

    getAnimationDuration() {
      return Math.max(80, Math.round(240 / this.speed));
    }

    resetTimeline() {
      this.isPlaying = false;
      this.currentIndex = 0;
      this.isBusy = false;
      this.cubeResetCount++;
    }
  }

  it('3.1: Play with empty moves does not alter state or crash', async () => {
    const c3 = await puzzleRegistry.load('cube-3x3');
    const sim = new PlaybackSimulator(c3);
    const toggled = sim.playToggle();
    assert.equal(toggled, false);
    assert.equal(sim.isPlaying, false);
    assert.equal(sim.currentIndex, 0);
  });

  it('3.2: Play with algorithm plays all moves sequentially and stops at end with completion trigger', async () => {
    const c3 = await puzzleRegistry.load('cube-3x3');
    const sim = new PlaybackSimulator(c3);
    sim.loadMoves("R U R' U'");
    assert.equal(sim.moves.length, 4);

    sim.playToggle();
    assert.equal(sim.isPlaying, false); // finishes full sequence
    assert.equal(sim.currentIndex, 4);
    assert.equal(sim.executionLog.length, 4);
    assert.equal(sim.confettiCount, 1);
  });

  it('3.3: Play when at end wraps to index 0 and plays sequence again', async () => {
    const c3 = await puzzleRegistry.load('cube-3x3');
    const sim = new PlaybackSimulator(c3);
    sim.loadMoves("R U");
    sim.currentIndex = 2; // already at end

    sim.playToggle();
    // After wrap-around play:
    assert.equal(sim.currentIndex, 2);
    assert.equal(sim.executionLog.length, 2);
    assert.equal(sim.executionLog[0].move, 'R');
    assert.equal(sim.executionLog[1].move, 'U');
  });

  it('3.4: Pause while playing immediately halts further move dispatches and preserves index', async () => {
    const c3 = await puzzleRegistry.load('cube-3x3');
    const sim = new PlaybackSimulator(c3);
    sim.loadMoves("R U R' U'");
    sim.isPlaying = true;
    sim.currentIndex = 2; // mid-playback

    // Trigger pause
    sim.playToggle();
    assert.equal(sim.isPlaying, false);
    assert.equal(sim.currentIndex, 2);
  });

  it('3.5: Step forward advances index by 1; blocked when busy or playing or at end', async () => {
    const c3 = await puzzleRegistry.load('cube-3x3');
    const sim = new PlaybackSimulator(c3);
    sim.loadMoves("R U");

    // Normal step next
    assert.equal(sim.stepNext(), true);
    assert.equal(sim.currentIndex, 1);

    // Blocked if busy
    sim.isBusy = true;
    assert.equal(sim.stepNext(), false);
    sim.isBusy = false;

    // Blocked if playing
    sim.isPlaying = true;
    assert.equal(sim.stepNext(), false);
    sim.isPlaying = false;

    // Step to end
    assert.equal(sim.stepNext(), true);
    assert.equal(sim.currentIndex, 2);
    assert.equal(sim.confettiCount, 1);

    // Blocked at end
    assert.equal(sim.stepNext(), false);
    assert.equal(sim.currentIndex, 2);
  });

  it('3.6: Step backward decrements index by 1 and produces valid inverse; blocked at index 0', async () => {
    for (const pId of ALL_PUZZLE_IDS) {
      const puzzle = await puzzleRegistry.load(pId);
      const sim = new PlaybackSimulator(puzzle);
      // Load sample move for this puzzle
      let testMove = 'R';
      if (pId === 'pyraminx') testMove = 'u';
      if (pId === 'megaminx') testMove = 'R++';
      if (pId === 'square-1') testMove = '/';

      sim.moves = [testMove];
      sim.currentIndex = 1;

      const stepped = sim.stepPrev();
      assert.equal(stepped, true, `stepPrev failed on ${pId}`);
      assert.equal(sim.currentIndex, 0);
      assert.equal(sim.executionLog.length, 1);
      assert.ok(sim.executionLog[0].inverse, `Missing inverse for ${testMove} on ${pId}`);

      // At index 0, stepPrev must be blocked
      assert.equal(sim.stepPrev(), false);
      assert.equal(sim.currentIndex, 0);
    }
  });

  it('3.7: Speed changes correctly calculate duration and scale animations', () => {
    const sim = new PlaybackSimulator(null);
    const speedTable = [
      { speed: 0.5, expectedDuration: 480 },
      { speed: 1.0, expectedDuration: 240 },
      { speed: 1.5, expectedDuration: 160 },
      { speed: 2.0, expectedDuration: 120 }
    ];

    for (const { speed, expectedDuration } of speedTable) {
      sim.setSpeed(speed);
      assert.equal(sim.speed, speed);
      assert.equal(sim.getAnimationDuration(), expectedDuration);
    }

    // Boundary: extreme high speed is clamped to min duration 80ms
    sim.setSpeed(10.0);
    assert.equal(sim.getAnimationDuration(), 80);
  });

  it('3.8: Reset while playing immediately stops playback, resets index to 0, and triggers cube reset', async () => {
    const c4 = await puzzleRegistry.load('cube-4x4');
    const sim = new PlaybackSimulator(c4);
    sim.loadMoves("Rw U2 2R U2");
    sim.isPlaying = true;
    sim.currentIndex = 3;

    sim.resetTimeline();
    assert.equal(sim.isPlaying, false);
    assert.equal(sim.currentIndex, 0);
    assert.equal(sim.cubeResetCount, 1);
  });
});

describe('Adversarial Challenge: Failure Modes, Deadlocks & Edge Cases', () => {
  it('4.1: Robustness: Square1Kinematics getMoveInfo handles non-string truthy input safely', async () => {
    const sq1 = await puzzleRegistry.load('square-1');
    const infoNum = sq1.getMoveInfo(123);
    assert.ok(infoNum, 'square1 getMoveInfo returns info object for number input');
    assert.ok(infoNum.name || infoNum.title, 'square1 getMoveInfo has name or title for number input');

    const infoBool = sq1.getMoveInfo(true);
    assert.ok(infoBool, 'square1 getMoveInfo returns info object for boolean input');

    const infoObj = sq1.getMoveInfo({});
    assert.ok(infoObj, 'square1 getMoveInfo returns info object for object input');
  });

  it('4.2: Bug Discovery: Pyraminx & Skewb getMoveInfo return name: undefined when move is undefined', async () => {
    const pyra = await puzzleRegistry.load('pyraminx');
    const pyraInfo = pyra.getMoveInfo(undefined);
    assert.equal(pyraInfo.name, undefined, 'Pyraminx getMoveInfo returns literal undefined as name');

    const skewb = await puzzleRegistry.load('skewb');
    const skewbInfo = skewb.getMoveInfo(undefined);
    assert.equal(skewbInfo.name, undefined, 'Skewb getMoveInfo returns literal undefined as name');
  });

  it('4.3: Bug Discovery: NotationModal on 2x2 exposes M slice, triggering fatal kinematics error', async () => {
    const c2 = await puzzleRegistry.load('cube-2x2');
    const { categories } = buildNotationCategoriesAndDict(c2);

    // Modal exposes M slice moves for 2x2
    assert.ok(categories.slice, '2x2 incorrectly exposes slice category in modal');
    assert.ok(categories.slice.keys.includes('M'));

    // Executing M slice on 2x2 throws fatal kinematics exception
    const mockModel = { userData: { order: 2 } };
    assert.throws(
      () => c2.animateMove('M', mockModel, () => {}),
      /Middle slice 'M' is invalid on order 2/
    );
  });

  it('4.4: Vulnerability: Uncaught exception in RubikViewer executeMove causes permanent animation deadlock', async () => {
    // Emulate RubikViewer executeMove state machine
    let isAnimating = false;
    const moveQueue = [];
    const isBusy = () => isAnimating || moveQueue.length > 0;

    const executeMove = (moveStr, animateFn) => {
      if (isAnimating) {
        moveQueue.push(moveStr);
        return;
      }
      isAnimating = true;
      const handleDone = () => {
        isAnimating = false;
        if (moveQueue.length > 0) {
          const next = moveQueue.shift();
          executeMove(next, animateFn);
        }
      };

      // RubikViewer calls animateMove WITHOUT try-catch
      animateFn(moveStr, handleDone);
    };

    // A faulty move throws synchronously
    const faultyAnimate = (move, onDone) => {
      if (move === 'M') throw new Error("Middle slice 'M' is invalid on order 2");
      onDone();
    };

    assert.throws(() => executeMove('M', faultyAnimate));

    // Notice: isAnimating is now permanently stuck at true!
    assert.equal(isAnimating, true, 'isAnimating is permanently stuck at true');
    assert.equal(isBusy(), true, 'Viewer is permanently busy');

    // Subsequent legitimate moves are permanently queued and never processed
    executeMove('R', faultyAnimate);
    assert.equal(moveQueue.length, 1);
    assert.equal(moveQueue[0], 'R');
  });

  it('4.5: Ghost Move Vulnerability: RubikViewer resetCube does not flush move queue', () => {
    let isAnimating = false;
    let moveQueue = [];
    let modelVersion = 1;
    const executedOnModel = [];

    const executeMove = (moveStr) => {
      if (isAnimating) {
        moveQueue.push(moveStr);
        return;
      }
      isAnimating = true;
      const currentModel = modelVersion;
      // Simulate asynchronous tween completion
      setTimeout(() => {
        isAnimating = false;
        executedOnModel.push({ move: moveStr, model: currentModel });
        if (moveQueue.length > 0) {
          const next = moveQueue.shift();
          executeMove(next);
        }
      }, 10);
    };

    const resetCube = () => {
      modelVersion++; // rebuild model
      // Bug: RubikViewer fails to do:
      // isAnimating = false;
      // moveQueue = [];
    };

    // Start move 1, queue move 2
    executeMove('R');
    executeMove('U');

    // Reset occurs while move 1 is animating and move 2 is queued
    resetCube();
    assert.equal(modelVersion, 2);

    // Wait for async queue to drain
    return new Promise((resolve) => {
      setTimeout(() => {
        // Move 2 executed on model 2 (the new model) despite the reset!
        assert.equal(executedOnModel.length, 2);
        assert.equal(executedOnModel[0].model, 1);
        assert.equal(executedOnModel[1].model, 2, 'Ghost move executed on post-reset model');
        assert.equal(executedOnModel[1].move, 'U');
        resolve();
      }, 50);
    });
  });

  it('4.6: Comprehensive Audit: Verification that all 10 puzzles have 100% dictionary completeness', async () => {
    for (const pId of ALL_PUZZLE_IDS) {
      const puzzle = await puzzleRegistry.load(pId);
      const { categories, dictionary } = buildNotationCategoriesAndDict(puzzle);

      for (const [catName, cat] of Object.entries(categories)) {
        assert.ok(cat.keys.length > 0, `Category ${catName} in ${pId} has 0 keys`);
        for (const key of cat.keys) {
          const entry = dictionary[key];
          assert.ok(entry, `Key ${key} in ${pId} missing in dictionary`);
          assert.ok(entry.name && typeof entry.name === 'string', `Key ${key} in ${pId} has invalid name: ${entry.name}`);
          assert.ok(entry.desc && typeof entry.desc === 'string', `Key ${key} in ${pId} has invalid desc: ${entry.desc}`);
        }
      }
    }
  });
});

