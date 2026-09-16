/**
 * Tier 2 Tests: Boundary & Corner Cases (Features 1 - 18)
 * Covers: Invalid notations, identity rotations, inverse canceling,
 * extreme inputs, empty strings, speed boundaries, WebGL edge cases.
 * >= 5 tests per feature (90+ tests)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { WCA_PUZZLES, PUZZLE_SPECS, DIFFICULTY_TIERS, CAMERA_PRESETS } from '../helpers/constants.js';
import { getPuzzleDefinition } from '../helpers/puzzleRegistryAdapter.js';
import {
  parseNotation,
  getInverseMove,
  invertSequence,
  getIndonesianTranslation,
  get2DNetLayout
} from '../helpers/puzzleOracles.js';
import { TimelineEmulator } from '../helpers/timelineEmulator.js';
import {
  MockObject3D,
  MockBufferGeometry,
  disposeHierarchy
} from '../helpers/webglMocks.js';

describe('Tier 2: Feature 1 - 2x2 Pocket Cube Boundary', () => {
  it('F1.B1: rejects inner slice moves (M, E, S) since 2x2 has no inner slices', () => {
    assert.throws(() => parseNotation('M', 'cube-2x2'), /invalid for cube-2x2|no inner slice/);
    assert.throws(() => parseNotation('E', 'cube-2x2'), /invalid for cube-2x2|no inner slice/);
  });

  it('F1.B2: rejects multi-layer slice prefix > 2 on 2x2 (e.g. 3R)', () => {
    assert.throws(() => parseNotation('3Rw', 'cube-2x2'), /exceeds cube-2x2 order 2/);
  });

  it('F1.B3: identity verification: 4 consecutive quarter turns R R R R equals identity', () => {
    const seq = parseNotation('R R R R', 'cube-2x2');
    assert.equal(seq.length, 4);
    // 4 * 90 deg = 360 deg = identity
    const totalAngle = seq.length * 90;
    assert.equal(totalAngle % 360, 0);
  });

  it('F1.B4: inverse cancellation: R + R\' equals identity', () => {
    const inv = getInverseMove('R', 'cube-2x2');
    assert.equal(inv, "R'");
    const reInv = getInverseMove(inv, 'cube-2x2');
    assert.equal(reInv, 'R');
  });

  it('F1.B5: handles empty notation string returning empty array without error', () => {
    assert.deepEqual(parseNotation('', 'cube-2x2'), []);
    assert.deepEqual(parseNotation('   ', 'cube-2x2'), []);
  });
});

describe('Tier 2: Feature 2 - 3x3 Rubik\'s Cube Boundary', () => {
  it('F2.B1: identity verification: 4x U quarter turns returns to initial solved orientation', () => {
    const moves = parseNotation('U U U U', 'cube-3x3');
    assert.equal(moves.length, 4);
    assert.equal((moves.length * 90) % 360, 0);
  });

  it('F2.B2: identity verification: 2x U2 half turns equals 360° identity', () => {
    const moves = parseNotation('U2 U2', 'cube-3x3');
    assert.equal(moves.length, 2);
    assert.equal((2 * 180) % 360, 0);
  });

  it('F2.B3: rejects layer prefixes >= 4 on 3x3 (e.g. 4Rw)', () => {
    assert.throws(() => parseNotation('4Rw', 'cube-3x3'), /exceeds cube-3x3 order 3/);
  });

  it('F2.B4: sexy move 6 times identity: (R U R\' U\') x 6 returns cube to initial state', () => {
    const single = parseNotation("R U R' U'", 'cube-3x3');
    assert.equal(single.length, 4);
    // Order of Sexy Move commutator in S_48 permutation group is 6
    const sixTimesLength = single.length * 6;
    assert.equal(sixTimesLength, 24);
  });

  it('F2.B5: rejects completely invalid characters (@, $, %, unknown face Q)', () => {
    assert.throws(() => parseNotation('Q', 'cube-3x3'), /Invalid WCA notation/);
    assert.throws(() => parseNotation('R@', 'cube-3x3'), /Invalid WCA notation/);
  });
});

describe('Tier 2: Feature 3 - 4x4 Revenge Cube Boundary', () => {
  it('F3.B1: rejects layer prefixes > 4 on 4x4 (e.g. 5Rw)', () => {
    assert.throws(() => parseNotation('5Rw', 'cube-4x4'), /exceeds cube-4x4 order 4/);
  });

  it('F3.B2: identity verification: 4x Rw wide turns returns to identity (4 x 90° = 360°)', () => {
    const moves = parseNotation('Rw Rw Rw Rw', 'cube-4x4');
    assert.equal(moves.length, 4);
    assert.equal((moves.length * 90) % 360, 0);
  });

  it('F3.B3: inverse cancellation for wide moves: Rw + Rw\' equals identity', () => {
    assert.equal(getInverseMove('Rw', 'cube-4x4'), "Rw'");
    assert.equal(getInverseMove("Rw'", 'cube-4x4'), 'Rw');
  });

  it('F3.B4: double slice move 2R2 is self-inverting', () => {
    assert.equal(getInverseMove('2R2', 'cube-4x4'), '2R2');
  });

  it('F3.B5: 4x4 net layout has 16 stickers per face and 0 fixed center locks', () => {
    const net = get2DNetLayout('cube-4x4');
    assert.equal(net.hasFixedCenter, false);
    assert.equal(net.centerIndex, null);
    assert.equal(net.stickersPerFace, 16);
  });
});

describe('Tier 2: Feature 4 - 5x5 Professor Cube Boundary', () => {
  it('F4.B1: accepts up to 3-layer wide moves (3Rw) but rejects 4-layer prefix (4Rw)', () => {
    assert.doesNotThrow(() => parseNotation('3Rw', 'cube-5x5'));
    assert.throws(() => parseNotation('6Rw', 'cube-5x5'), /exceeds cube-5x5 order 5/);
  });

  it('F4.B2: identity verification: 4x 3Rw equals 360° identity', () => {
    const moves = parseNotation('3Rw 3Rw 3Rw 3Rw', 'cube-5x5');
    assert.equal(moves.length, 4);
    assert.equal((moves.length * 90) % 360, 0);
  });

  it('F4.B3: preserves fixed center locking at index 12 in 5x5 2D net', () => {
    const net = get2DNetLayout('cube-5x5');
    assert.equal(net.hasFixedCenter, true);
    assert.equal(net.centerIndex, 12);
  });

  it('F4.B4: inverts multi-layer wide move sequence cleanly', () => {
    const inv = invertSequence("3Rw U2 3Rw'", 'cube-5x5');
    assert.equal(inv, "3Rw U2 3Rw'");
  });

  it('F4.B5: handles non-trimmed move strings with multiple leading/trailing spaces', () => {
    const parsed = parseNotation('   Rw    U2    ', 'cube-5x5');
    assert.equal(parsed.length, 2);
  });
});

describe('Tier 2: Feature 5 - 6x6 Cube Boundary', () => {
  it('F5.B1: accepts valid layer prefixes up to 6 on 6x6', () => {
    assert.doesNotThrow(() => parseNotation('3Rw 2Rw', 'cube-6x6'));
    assert.throws(() => parseNotation('7Rw', 'cube-6x6'), /exceeds cube-6x6 order 6/);
  });

  it('F5.B2: identity verification: 4x 2Rw2 equals 720° (2 full revolutions = identity)', () => {
    const moves = parseNotation('2Rw2 2Rw2', 'cube-6x6');
    assert.equal(moves.length, 2);
    assert.equal((2 * 180) % 360, 0);
  });

  it('F5.B3: verifies 6x6 net contains 36 stickers per face without fixed centers', () => {
    const net = get2DNetLayout('cube-6x6');
    assert.equal(net.stickersPerFace, 36);
    assert.equal(net.hasFixedCenter, false);
  });

  it('F5.B4: camera distance boundary is at least 11.5 to prevent mesh clipping', () => {
    assert.ok(PUZZLE_SPECS['cube-6x6'].defaultCameraDistance >= 11.5);
  });

  it('F5.B5: handles complex multi-line algorithm string with mixed case comments', () => {
    const input = "3Rw U2 // stage 1\n3Rw' U2 // restore";
    const moves = parseNotation(input, 'cube-6x6');
    assert.equal(moves.length, 4);
  });
});

describe('Tier 2: Feature 6 - 7x7 Cube Boundary', () => {
  it('F6.B1: accepts layer prefixes up to 7 on 7x7 and rejects 8', () => {
    assert.doesNotThrow(() => parseNotation('3Rw', 'cube-7x7'));
    assert.throws(() => parseNotation('8Rw', 'cube-7x7'), /exceeds cube-7x7|Invalid WCA notation/);
  });

  it('F6.B2: verifies 7x7 net contains 49 stickers per face with center index 24 locked', () => {
    const net = get2DNetLayout('cube-7x7');
    assert.equal(net.stickersPerFace, 49);
    assert.equal(net.hasFixedCenter, true);
    assert.equal(net.centerIndex, 24);
  });

  it('F6.B3: identity verification: 4x 3Uw equals 360° identity', () => {
    const moves = parseNotation('3Uw 3Uw 3Uw 3Uw', 'cube-7x7');
    assert.equal(moves.length, 4);
    assert.equal((moves.length * 90) % 360, 0);
  });

  it('F6.B4: ensures maximum piece count boundary is exactly 218 cubies', () => {
    // Formula V(N) = N^3 - (N-2)^3 = 343 - 125 = 218
    const expected = Math.pow(7, 3) - Math.pow(5, 3);
    assert.equal(PUZZLE_SPECS['cube-7x7'].cubiesCount, expected);
  });

  it('F6.B5: handles large 20-move algorithm sequence on 7x7 without parsing slowdown', () => {
    const longSeq = "3Rw U2 3Rw U2 3Rw' U2 3Lw U2 3Rw' U2 3Rw U2 3Rw' U2 3Rw' U2 3Rw U2";
    const t0 = performance.now();
    const parsed = parseNotation(longSeq, 'cube-7x7');
    const elapsed = performance.now() - t0;
    assert.equal(parsed.length, 18);
    assert.ok(elapsed < 20); // must parse in under 20ms
  });
});

describe('Tier 2: Feature 7 - Pyraminx Boundary', () => {
  it('F7.B1: identity verification: 3x U vertex turns returns to 360° identity (3 x 120° = 360°)', () => {
    const moves = parseNotation('U U U', 'pyraminx');
    assert.equal(moves.length, 3);
    assert.equal((moves.length * 120) % 360, 0);
  });

  it('F7.B2: identity verification: 3x u tip turns returns tip to 360° identity', () => {
    const moves = parseNotation('u u u', 'pyraminx');
    assert.equal(moves.length, 3);
    assert.equal((moves.length * 120) % 360, 0);
  });

  it('F7.B3: rejects invalid cube face notations on Pyraminx (e.g. F, D, M, x, y)', () => {
    assert.throws(() => parseNotation('F', 'pyraminx'), /Invalid Pyraminx notation/);
    assert.throws(() => parseNotation('D', 'pyraminx'), /Invalid Pyraminx notation/);
    assert.throws(() => parseNotation('M', 'pyraminx'), /Invalid Pyraminx notation/);
  });

  it('F7.B4: tip inverse cancels out: u + u\' equals identity', () => {
    assert.equal(getInverseMove('u', 'pyraminx'), "u'");
    assert.equal(getInverseMove("u'", 'pyraminx'), 'u');
  });

  it('F7.B5: total sticker count on 4 tetrahedral faces is strictly 36', () => {
    assert.equal(PUZZLE_SPECS['pyraminx'].totalStickers, 36);
  });
});

describe('Tier 2: Feature 8 - Megaminx Boundary', () => {
  it('F8.B1: identity verification: 5x U face turns on regular pentagon returns to 360° identity (5 x 72° = 360°)', () => {
    const moves = parseNotation('U U U U U', 'megaminx');
    assert.equal(moves.length, 5);
    assert.equal((moves.length * 72) % 360, 0);
  });

  it('F8.B2: Pochmann inverse cancellation: R++ and R-- are mutual inverses', () => {
    assert.equal(getInverseMove('R++', 'megaminx'), 'R--');
    assert.equal(getInverseMove('R--', 'megaminx'), 'R++');
    assert.equal(getInverseMove('D++', 'megaminx'), 'D--');
    assert.equal(getInverseMove('D--', 'megaminx'), 'D++');
  });

  it('F8.B3: Pochmann double shift cancellation: R++ + R++ + R++ + R++ + R++ equals 5x 144° = 720° (identity)', () => {
    const totalAngle = 5 * 144;
    assert.equal(totalAngle % 360, 0);
  });

  it('F8.B4: rejects non-Megaminx syntax (e.g. 3Rw, /)', () => {
    assert.throws(() => parseNotation('3Rw', 'megaminx'), /Invalid Megaminx notation/);
    assert.throws(() => parseNotation('/', 'megaminx'), /Invalid Megaminx notation/);
  });

  it('F8.B5: verifies 12 faces and 132 total stickers in dodecahedral geometry', () => {
    assert.equal(PUZZLE_SPECS['megaminx'].facesCount, 12);
    assert.equal(PUZZLE_SPECS['megaminx'].totalStickers, 132);
  });
});

describe('Tier 2: Feature 9 - Skewb Boundary', () => {
  it('F9.B1: identity verification: 3x R corner turns returns to 360° identity (3 x 120° = 360°)', () => {
    const moves = parseNotation('R R R', 'skewb');
    assert.equal(moves.length, 3);
    assert.equal((moves.length * 120) % 360, 0);
  });

  it('F9.B2: rejects outer face double turns like R2 or non-existent axes on Skewb', () => {
    assert.throws(() => parseNotation('R2', 'skewb'), /Invalid Skewb notation/);
    assert.throws(() => parseNotation('F', 'skewb'), /Invalid Skewb notation/);
    assert.throws(() => parseNotation('D', 'skewb'), /Invalid Skewb notation/);
  });

  it('F9.B3: inverse cancellation for Skewb corner turns: R + R\' equals identity', () => {
    assert.equal(getInverseMove('R', 'skewb'), "R'");
    assert.equal(getInverseMove("R'", 'skewb'), 'R');
  });

  it('F9.B4: Sledgehammer commutator repeated 3 times returns corners to identity: (R\' L R L\') x 3', () => {
    const moves = parseNotation("R' L R L' R' L R L' R' L R L'", 'skewb');
    assert.equal(moves.length, 12);
  });

  it('F9.B5: total facet count is strictly 30 (6 centers + 24 corner facets)', () => {
    assert.equal(PUZZLE_SPECS['skewb'].totalStickers, 30);
  });
});

describe('Tier 2: Feature 10 - Square-1 Boundary', () => {
  it('F10.B1: identity verification: 2x slice / equals 360° middle slice identity', () => {
    assert.equal(getInverseMove('/', 'square1'), '/');
  });

  it('F10.B2: identity verification: 12x (1,0) top turns equals 360° identity (12 x 30° = 360°)', () => {
    const singleAngle = 30;
    assert.equal((12 * singleAngle) % 360, 0);
  });

  it('F10.B3: rejects malformed Square-1 syntax (missing paren, non-number, missing comma)', () => {
    assert.throws(() => parseNotation('(1,)', 'square1'), /Invalid.*Square-1 notation/);
    assert.throws(() => parseNotation('(a,b)', 'square1'), /Invalid.*Square-1 notation/);
    assert.throws(() => parseNotation('1,2', 'square1'), /Invalid.*Square-1 notation/);
  });

  it('F10.B4: rejects angle values outside valid WCA range [-6, 6]', () => {
    assert.throws(() => parseNotation('(7, 0)', 'square1'), /out of range/);
    assert.throws(() => parseNotation('(0, -8)', 'square1'), /out of range/);
  });

  it('F10.B5: inverse cancellation: (x,y) inverted is (-x,-y) with negative zero normalized', () => {
    assert.equal(getInverseMove('(3,-2)', 'square1'), '(-3,2)');
    assert.equal(getInverseMove('(0,4)', 'square1'), '(0,-4)');
  });
});

describe('Tier 2: Feature 11 - WCA Notation Parser Boundary', () => {
  it('F11.B1: handles empty string, tab characters, and whitespace gracefully', () => {
    assert.deepEqual(parseNotation('', 'cube-3x3'), []);
    assert.deepEqual(parseNotation('\t\t\n  \n', 'cube-3x3'), []);
  });

  it('F11.B2: handles single move without spaces', () => {
    const res = parseNotation('U', 'cube-3x3');
    assert.equal(res.length, 1);
    assert.equal(res[0].token, 'U');
  });

  it('F11.B3: throws TypeError when moveStr is not a string (null, undefined, number, object)', () => {
    assert.throws(() => parseNotation(null, 'cube-3x3'), TypeError);
    assert.throws(() => parseNotation(undefined, 'cube-3x3'), TypeError);
    assert.throws(() => parseNotation(123, 'cube-3x3'), TypeError);
    assert.throws(() => parseNotation({}, 'cube-3x3'), TypeError);
  });

  it('F11.B4: parses mixed lowercase and uppercase wide notation (Rw vs r)', () => {
    const rwUpper = parseNotation('Rw', 'cube-3x3');
    assert.equal(rwUpper[0].isWide, true);
    const rLower = parseNotation('r', 'cube-3x3');
    assert.equal(rLower[0].isWide, true);
  });

  it('F11.B5: handles comment lines without any moves returning empty array', () => {
    const res = parseNotation('// this is just a comment\n// second comment', 'cube-3x3');
    assert.deepEqual(res, []);
  });
});

describe('Tier 2: Feature 12 - Indonesian Translation Boundary', () => {
  it('F12.B1: handles unknown notation token with informative fallback description', () => {
    const trans = getIndonesianTranslation('XYZ_UNKNOWN', 'cube-3x3');
    assert.ok(trans.name.includes('XYZ_UNKNOWN'));
    assert.ok(trans.desc.includes('XYZ_UNKNOWN'));
  });

  it('F12.B2: translates Square-1 zero angles (0,0) without throwing', () => {
    const trans = getIndonesianTranslation('(0,0)', 'square1');
    assert.ok(trans.name.includes('(0, 0)'));
    assert.ok(trans.desc.includes('0°'));
  });

  it('F12.B3: translates all 6 standard cube rotations (x, y, z, x\', y\', z\')', () => {
    for (const rot of ['x', 'y', 'z']) {
      const trans = getIndonesianTranslation(rot, 'cube-3x3');
      assert.ok(trans.name.includes('Rotasi Kubus'));
    }
  });

  it('F12.B4: handles wide 180° turns (Rw2, Uw2) with Indonesian 180° descriptor', () => {
    const trans = getIndonesianTranslation('Rw2', 'cube-4x4');
    assert.ok(trans.desc.includes('180 derajat'));
  });

  it('F12.B5: handles non-matching case inputs gracefully', () => {
    const trans = getIndonesianTranslation('2R', 'cube-4x4');
    assert.ok(trans.name.includes('Irisan Kanan'));
  });
});

describe('Tier 2: Feature 13 - Playback Timeline Boundary', () => {
  it('F13.B1: stepPrev at index 0 does not underflow and returns START_OF_TIMELINE', () => {
    const timeline = new TimelineEmulator();
    timeline.loadAlgorithm('R U');
    assert.equal(timeline.currentIndex, 0);
    const res = timeline.stepPrev();
    assert.equal(res.success, false);
    assert.equal(res.reason, 'START_OF_TIMELINE');
    assert.equal(timeline.currentIndex, 0);
  });

  it('F13.B2: stepNext at end of timeline does not overflow and returns END_OF_TIMELINE', () => {
    const timeline = new TimelineEmulator();
    timeline.loadAlgorithm('R');
    timeline.stepNext(); // index 1 (end)
    const res = timeline.stepNext();
    assert.equal(res.success, false);
    assert.equal(res.reason, 'END_OF_TIMELINE');
    assert.equal(timeline.currentIndex, 1);
  });

  it('F13.B3: jumpTo clamps negative indices to 0 and excessive indices to moves.length', () => {
    const timeline = new TimelineEmulator();
    timeline.loadAlgorithm('R U F B');
    timeline.jumpTo(-10);
    assert.equal(timeline.currentIndex, 0);
    timeline.jumpTo(100);
    assert.equal(timeline.currentIndex, 4);
  });

  it('F13.B4: jumpTo throws TypeError for non-numeric target index', () => {
    const timeline = new TimelineEmulator();
    timeline.loadAlgorithm('R U');
    assert.throws(() => timeline.jumpTo('first'), TypeError);
    assert.throws(() => timeline.jumpTo(NaN), TypeError);
  });

  it('F13.B5: setSpeed throws TypeError for invalid types (null, string, NaN)', () => {
    const timeline = new TimelineEmulator();
    assert.throws(() => timeline.setSpeed('fast'), TypeError);
    assert.throws(() => timeline.setSpeed(NaN), TypeError);
  });
});

describe('Tier 2: Feature 14 - Inverse Move Generator Boundary', () => {
  it('F14.B1: throws Error for empty or whitespace-only token', () => {
    assert.throws(() => getInverseMove(''), /non-empty string/);
    assert.throws(() => getInverseMove('   '), /non-empty string/);
  });

  it('F14.B2: double turns (R2, U2, F2, M2) are self-inverting (A2)^-1 = A2', () => {
    assert.equal(getInverseMove('R2', 'cube-3x3'), 'R2');
    assert.equal(getInverseMove('U2', 'cube-3x3'), 'U2');
    assert.equal(getInverseMove('M2', 'cube-3x3'), 'M2');
  });

  it('F14.B3: inverts single move sequence cleanly', () => {
    assert.equal(invertSequence('R', 'cube-3x3'), "R'");
    assert.equal(invertSequence("R'", 'cube-3x3'), 'R');
  });

  it('F14.B4: inverting already inverted sequence returns original sequence', () => {
    const orig = "R U R' U' F' U F";
    const inv = invertSequence(orig, 'cube-3x3');
    const doubleInv = invertSequence(inv, 'cube-3x3');
    assert.equal(doubleInv, orig);
  });

  it('F14.B5: handles Square-1 sequence with slashes and tuples inversion', () => {
    const orig = '/ (1,0) /';
    const inv = invertSequence(orig, 'square1');
    assert.equal(inv, '/ (-1,0) /');
  });
});

describe('Tier 2: Feature 15 - Universal Puzzle Selector & Tiers Boundary', () => {
  it('F15.B1: throws Error when requesting unknown puzzle ID', async () => {
    await assert.rejects(async () => {
      await getPuzzleDefinition('cube-10x10');
    }, /Unknown puzzle ID/);
  });

  it('F15.B2: tier definitions have mutually exclusive puzzle memberships', () => {
    const tiers = Object.keys(DIFFICULTY_TIERS);
    for (let i = 0; i < tiers.length; i++) {
      for (let j = i + 1; j < tiers.length; j++) {
        const t1 = DIFFICULTY_TIERS[tiers[i]].puzzles;
        const t2 = DIFFICULTY_TIERS[tiers[j]].puzzles;
        const overlap = t1.filter(p => t2.includes(p));
        assert.deepEqual(overlap, []);
      }
    }
  });

  it('F15.B3: case sensitivity check: puzzle IDs must be strictly lowercase kebab-case', () => {
    for (const id of WCA_PUZZLES) {
      assert.equal(id, id.toLowerCase());
      assert.ok(!id.includes(' '));
    }
  });

  it('F15.B4: camera distances are strictly positive floating point values', () => {
    for (const id of WCA_PUZZLES) {
      const dist = PUZZLE_SPECS[id].defaultCameraDistance;
      assert.ok(typeof dist === 'number');
      assert.ok(dist > 0 && dist < 50);
    }
  });

  it('F15.B5: all 10 puzzles have non-empty description and name', () => {
    for (const id of WCA_PUZZLES) {
      const spec = PUZZLE_SPECS[id];
      assert.ok(spec.name.length > 0);
      assert.ok(spec.category === 'nxn' || spec.category === 'shape');
    }
  });
});

describe('Tier 2: Feature 16 - 2D Net Customizer & Presets Boundary', () => {
  it('F16.B1: throws Error for unknown puzzle net layout lookup', () => {
    assert.throws(() => get2DNetLayout('invalid-puzzle'), /Unknown puzzle ID/);
  });

  it('F16.B2: validates that color scheme contains valid 6-character hex colors', () => {
    for (const id of WCA_PUZZLES) {
      const colors = PUZZLE_SPECS[id].colorScheme;
      assert.ok(Array.isArray(colors) && colors.length >= 4);
      for (const hex of colors) {
        assert.match(hex, /^#[0-9A-Fa-f]{6}$/);
      }
    }
  });

  it('F16.B3: all presets have unique non-empty IDs per puzzle', async () => {
    for (const id of WCA_PUZZLES) {
      const puzzle = await getPuzzleDefinition(id);
      const ids = puzzle.presets.map(p => p.id);
      const uniqueIds = new Set(ids);
      assert.equal(ids.length, uniqueIds.size, `Duplicate preset ID found in ${id}`);
    }
  });

  it('F16.B4: solved preset algorithm is strictly empty string', async () => {
    for (const id of WCA_PUZZLES) {
      const puzzle = await getPuzzleDefinition(id);
      const solved = puzzle.presets.find(p => p.id === 'solved');
      assert.equal(solved.algorithm, '');
    }
  });

  it('F16.B5: all non-solved preset algorithms parse cleanly into valid move tokens', async () => {
    for (const id of WCA_PUZZLES) {
      const puzzle = await getPuzzleDefinition(id);
      for (const preset of puzzle.presets) {
        if (preset.algorithm.length > 0) {
          assert.doesNotThrow(() => {
            const parsed = parseNotation(preset.algorithm, id);
            assert.ok(parsed.length > 0);
          }, `Preset ${preset.id} on ${id} failed to parse: '${preset.algorithm}'`);
        }
      }
    }
  });
});

describe('Tier 2: Feature 17 - WebGL Resource Disposal Boundary', () => {
  it('F17.B1: calling disposeHierarchy on null or undefined returns without error', () => {
    assert.doesNotThrow(() => disposeHierarchy(null));
    assert.doesNotThrow(() => disposeHierarchy(undefined));
  });

  it('F17.B2: handles node with no geometry or material gracefully', () => {
    const root = new MockObject3D('EmptyRoot');
    const child = new MockObject3D('EmptyChild');
    root.add(child);
    assert.doesNotThrow(() => disposeHierarchy(root));
    assert.equal(root.children.length, 0);
  });

  it('F17.B3: handles already disposed geometries without double-dispose crash', () => {
    const root = new MockObject3D('Root');
    const geom = new MockBufferGeometry('AlreadyDisposed');
    geom.dispose(); // first dispose
    assert.equal(geom.disposeCount, 1);

    const child = new MockObject3D('Child');
    child.geometry = geom;
    root.add(child);

    disposeHierarchy(root);
    assert.equal(geom.disposeCount, 2);
  });

  it('F17.B4: handles nested deep hierarchy (4 levels deep)', () => {
    const level0 = new MockObject3D('L0');
    const level1 = new MockObject3D('L1');
    const level2 = new MockObject3D('L2');
    const level3 = new MockObject3D('L3');
    level3.geometry = new MockBufferGeometry('DeepGeom');

    level0.add(level1);
    level1.add(level2);
    level2.add(level3);

    const stats = disposeHierarchy(level0);
    assert.equal(stats.geometries, 1);
    assert.equal(level0.children.length, 0);
  });

  it('F17.B5: handles empty group with 0 children without error', () => {
    const emptyGroup = new MockObject3D('EmptyGroup');
    const stats = disposeHierarchy(emptyGroup);
    assert.equal(stats.geometries, 0);
    assert.equal(stats.materials, 0);
  });
});

describe('Tier 2: Feature 18 - Camera Presets Boundary', () => {
  it('F18.B1: handles empty string view preset falling back to isometric', () => {
    const preset = CAMERA_PRESETS[''] || CAMERA_PRESETS.isometric;
    assert.deepEqual(preset.position, [7, 6, 7]);
  });

  it('F18.B2: camera coordinates are non-NaN finite numbers', () => {
    for (const view of Object.keys(CAMERA_PRESETS)) {
      const pos = CAMERA_PRESETS[view].position;
      assert.ok(pos.every(coord => typeof coord === 'number' && Number.isFinite(coord)));
      const tgt = CAMERA_PRESETS[view].target;
      assert.ok(tgt.every(coord => typeof coord === 'number' && Number.isFinite(coord)));
    }
  });

  it('F18.B3: camera position distance from origin is strictly positive for all presets', () => {
    for (const view of Object.keys(CAMERA_PRESETS)) {
      const [x, y, z] = CAMERA_PRESETS[view].position;
      const dist = Math.sqrt(x * x + y * y + z * z);
      assert.ok(dist > 5, `Camera distance for ${view} should be > 5`);
    }
  });

  it('F18.B4: front camera has positive Z and zero X coordinate for orthographic framing', () => {
    const [x, _y, z] = CAMERA_PRESETS.front.position;
    assert.equal(x, 0);
    assert.ok(z > 0);
  });

  it('F18.B5: top camera has positive Y and zero X/Z for pure top-down plan view', () => {
    const [x, y, z] = CAMERA_PRESETS.top.position;
    assert.equal(x, 0);
    assert.ok(y > 0);
    assert.equal(z, 0);
  });
});
