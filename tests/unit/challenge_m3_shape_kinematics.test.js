/**
 * tests/unit/challenge_m3_shape_kinematics.test.js
 * 
 * Adversarial Challenger Suite for Milestone 3 Shape Puzzles:
 * - Skewb, Megaminx, and Square-1 Kinematics & Notation
 * 
 * Focus Areas:
 * 1. Adversarial Notation Parsing (whitespace, case, invalid tokens, empty algorithms, negative coords, Pochmann)
 * 2. Inverse Symmetry Invariance: getInverseMove(getInverseMove(m)) === m
 * 3. Scramble Generator Randomness, Distribution & Validity
 * 4. Mathematical Kinematic Cycle Invariance (Quaternion / Group Theory Identities)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';

// Skewb imports
import {
  parseSkewbMove,
  parseAlgorithm as parseSkewbAlgorithm,
  getInverseMove as getInverseSkewbMove,
  generateScramble as generateSkewbScramble,
  animateSkewbMove,
  SKEWB_NOTATION,
  getMoveInfo as getSkewbMoveInfo
} from '../../src/puzzles/skewb/SkewbKinematics.js';
import { buildSkewbModel } from '../../src/puzzles/skewb/SkewbGeometry.js';

// Megaminx imports
import {
  parseMegaminxMove,
  parseAlgorithm as parseMegaminxAlgorithm,
  getInverseMove as getInverseMegaminxMove,
  generateScramble as generateMegaminxScramble,
  animateMegaminxMove,
  MEGAMINX_NOTATION,
  getMoveInfo as getMegaminxMoveInfo
} from '../../src/puzzles/megaminx/MegaminxKinematics.js';
import { buildMegaminxModel } from '../../src/puzzles/megaminx/MegaminxGeometry.js';

// Square-1 imports
import {
  parseSquare1Move,
  parseAlgorithm as parseSquare1Algorithm,
  getInverseMove as getInverseSquare1Move,
  generateScramble as generateSquare1Scramble,
  animateSquare1Move,
  SQUARE1_NOTATION,
  getMoveInfo as getSquare1MoveInfo
} from '../../src/puzzles/square1/Square1Kinematics.js';
import { buildSquare1Model } from '../../src/puzzles/square1/Square1Geometry.js';

// Helper: compare quaternion against identity considering double cover (q and -q represent same SO(3) rotation)
function assertQuaternionIsIdentity(q, tolerance = 1e-5, msg = '') {
  const isIdentity = (
    (Math.abs(q.x) < tolerance && Math.abs(q.y) < tolerance && Math.abs(q.z) < tolerance && Math.abs(q.w - 1) < tolerance) ||
    (Math.abs(q.x) < tolerance && Math.abs(q.y) < tolerance && Math.abs(q.z) < tolerance && Math.abs(q.w + 1) < tolerance)
  );
  assert.ok(isIdentity, `${msg} - Quaternion [${q.x.toFixed(6)}, ${q.y.toFixed(6)}, ${q.z.toFixed(6)}, ${q.w.toFixed(6)}] is not identity`);
}

describe('Challenger M3-1: 1. Adversarial Notation Parsing Edge Cases', () => {

  describe('1.1. Skewb Notation Parsing Edge Cases', () => {
    it('parses valid Skewb moves with irregular whitespace (leading, trailing, tabs, newlines)', () => {
      const moves = ['  R ', '\tL\t', ' U \n', '  B\'\t', '  R\'  '];
      moves.forEach(m => {
        const parsed = parseSkewbMove(m);
        assert.ok(parsed);
        assert.equal(parsed.token, m.trim());
        assert.ok(Math.abs(parsed.axis.length() - 1.0) < 1e-6);
        assert.ok(Math.abs(Math.abs(parsed.angle) - (2 * Math.PI / 3)) < 1e-6);
      });
    });

    it('rejects lowercase tokens strictly (WCA Skewb notation is uppercase R, L, U, B)', () => {
      const lowerMoves = ['r', 'l', 'u', 'b', "r'", "l'", "u'", "b'"];
      lowerMoves.forEach(m => {
        assert.throws(() => parseSkewbMove(m), /Invalid Skewb notation/);
      });
    });

    it('rejects invalid face letters, double turns, double primes, and cube slice moves', () => {
      const invalid = ['F', 'D', 'M', 'E', 'S', 'R2', 'L2', 'U2', 'B2', "R''", "U''", 'R3', 'Rw', 'Uw', '1', '/', '(1,0)'];
      invalid.forEach(token => {
        assert.throws(() => parseSkewbMove(token), /Invalid Skewb notation/);
      });
    });

    it('parses valid whole-cube rotations (x, y, z, x2, y2, z2, x\', y\', z\')', () => {
      const cubeRotations = ['x', "x'", 'x2', 'y', "y'", 'y2', 'z', "z'", 'z2'];
      cubeRotations.forEach(token => {
        const parsed = parseSkewbMove(token);
        assert.ok(parsed.isCubeRotation);
        assert.equal(parsed.token, token);
      });
    });

    it('handles empty algorithm strings, whitespace-only, null and undefined in parseAlgorithm', () => {
      assert.deepEqual(parseSkewbAlgorithm(''), []);
      assert.deepEqual(parseSkewbAlgorithm('   '), []);
      assert.deepEqual(parseSkewbAlgorithm('\t\n\r'), []);
      assert.deepEqual(parseSkewbAlgorithm(null), []);
      assert.deepEqual(parseSkewbAlgorithm(undefined), []);
      assert.deepEqual(parseSkewbAlgorithm(123), []);
    });

    it('tokenizes multi-line algorithms with erratic multi-whitespace without dropped tokens', () => {
      const alg = "  R   L' \t\t  U \n\n  B'   R'  ";
      const tokens = parseSkewbAlgorithm(alg);
      assert.deepEqual(tokens, ['R', "L'", 'U', "B'", "R'"]);
      tokens.forEach(t => assert.doesNotThrow(() => parseSkewbMove(t)));
    });

    it('verifies getMoveInfo returns valid Indonesian descriptors for all 8 moves and fallback for unknown', () => {
      const valid = ['R', "R'", 'L', "L'", 'U', "U'", 'B', "B'"];
      valid.forEach(m => {
        const info = getSkewbMoveInfo(m);
        assert.ok(info.name, `Missing name for ${m}`);
        assert.ok(info.desc, `Missing desc for ${m}`);
        assert.ok(info.desc.includes('120°') || info.desc.includes('120 derajat'));
      });
      const unknown = getSkewbMoveInfo('UNKNOWN');
      assert.equal(unknown.name, 'UNKNOWN');
    });
  });

  describe('1.2. Megaminx Notation Parsing Edge Cases', () => {
    it('parses Pochmann moves (R++, R--, D++, D--) with exact 144° angles and whitespace tolerance', () => {
      const turns = [
        { raw: '  R++ ', key: 'R', dir: 2, angle: (4 * Math.PI) / 5 },
        { raw: '\tR--\t', key: 'R', dir: -2, angle: -(4 * Math.PI) / 5 },
        { raw: '\nD++\n', key: 'D', dir: 2, angle: (4 * Math.PI) / 5 },
        { raw: '  D--  ', key: 'D', dir: -2, angle: -(4 * Math.PI) / 5 }
      ];

      turns.forEach(({ raw, key, dir, angle }) => {
        const parsed = parseMegaminxMove(raw);
        assert.equal(parsed.type, 'pochmann');
        assert.equal(parsed.axisKey, key);
        assert.equal(parsed.direction, dir);
        assert.ok(Math.abs(parsed.angle - angle) < 1e-6);
        assert.ok(Math.abs(parsed.axis.length() - 1.0) < 1e-6);
      });
    });

    it('strictly rejects malformed or unauthorized Pochmann tokens', () => {
      const badPochmann = [
        'r++', 'r--', 'd++', 'd--',  // lowercase Pochmann
        'R+', 'R-', 'D+', 'D-',      // single plus/minus
        'R+++', 'D---', 'R+-', 'D-+',// improper signs
        'U++', 'U--', 'F++', 'F--',  // non-R/D Pochmann
        'B++', 'L++', "R++'", "D--'" // primes on Pochmann
      ];
      badPochmann.forEach(token => {
        assert.throws(() => parseMegaminxMove(token), /Invalid Megaminx notation token/);
      });
    });

    it('parses all 12 WCA face turn notations with and without prime modifiers', () => {
      const faces = ['U', 'F', 'FL', 'BL', 'BR', 'FR', 'D', 'B', 'DL', 'UL', 'UR', 'DR', 'R', 'L'];
      faces.forEach(f => {
        const cw = parseMegaminxMove(f);
        assert.equal(cw.type, 'face');
        assert.equal(cw.direction, 1);
        assert.ok(Math.abs(cw.angle - (2 * Math.PI / 5)) < 1e-6);

        const ccw = parseMegaminxMove(`${f}'`);
        assert.equal(ccw.type, 'face');
        assert.equal(ccw.direction, -1);
        assert.ok(Math.abs(ccw.angle + (2 * Math.PI / 5)) < 1e-6);
      });
    });

    it('rejects double primes (U\'\') and invalid face characters', () => {
      const invalid = ["U''", "F''", 'X', 'Y', 'Z', 'M', 'E', 'S', '3Rw', '/'];
      invalid.forEach(token => {
        assert.throws(() => parseMegaminxMove(token), /Invalid Megaminx notation token/);
      });
    });

    it('parses double face turns (U2, F2, R2, U2\') with 144° angle', () => {
      const doubleTurns = ['U2', "U2'", 'F2', "F2'", 'R2', "R2'"];
      doubleTurns.forEach(token => {
        const parsed = parseMegaminxMove(token);
        assert.equal(parsed.type, 'face');
        assert.equal(parsed.isDouble, true);
        assert.ok(Math.abs(Math.abs(parsed.angle) - ((4 * Math.PI) / 5)) < 1e-6);
      });
    });

    it('rejects non-string and empty inputs gracefully in parseMegaminxMove', () => {
      [null, undefined, '', '   ', 123, {}].forEach(bad => {
        assert.throws(() => parseMegaminxMove(bad), /Invalid Megaminx notation token/);
      });
    });

    it('parseAlgorithm strips comments and parentheses and handles empty algorithms cleanly', () => {
      assert.deepEqual(parseMegaminxAlgorithm(''), []);
      assert.deepEqual(parseMegaminxAlgorithm('   '), []);
      assert.deepEqual(parseMegaminxAlgorithm(null), []);
      assert.deepEqual(parseMegaminxAlgorithm(undefined), []);

      const algWithComments = `
        // White Star Setup
        (R U R' U') // Sexy move
        R++ D++ R-- D-- U'
      `;
      const parsed = parseMegaminxAlgorithm(algWithComments);
      assert.deepEqual(parsed, ['R', 'U', "R'", "U'", 'R++', 'D++', 'R--', 'D--', "U'"]);
      parsed.forEach(t => assert.doesNotThrow(() => parseMegaminxMove(t)));
    });

    it('verifies getMoveInfo provides descriptive Indonesian translations for Pochmann & face turns', () => {
      const pochmanns = ['R++', 'R--', 'D++', 'D--'];
      pochmanns.forEach(p => {
        const info = getMegaminxMoveInfo(p);
        assert.ok(info.name.includes('Pochmann'));
        assert.ok(info.desc.includes('144 derajat'));
      });
      const faces = ['U', "U'", 'F', "F'", 'R', "R'"];
      faces.forEach(f => {
        const info = getMegaminxMoveInfo(f);
        assert.ok(info.name);
        assert.ok(info.desc.includes('72 derajat'));
      });
    });
  });

  describe('1.3. Square-1 Notation Parsing Edge Cases', () => {
    it('parses slice move / with whitespace and confirms 180° angle', () => {
      ['/', ' / ', '\t/\n'].forEach(token => {
        const parsed = parseSquare1Move(token);
        assert.equal(parsed.token, '/');
        assert.equal(parsed.type, 'slice');
        assert.ok(Math.abs(parsed.angle - Math.PI) < 1e-6);
      });
    });

    it('parses layer turns (x,y) with whitespace, negative coordinates, and handles zero normalization', () => {
      const testCases = [
        { input: '(1,0)', top: 1, bot: 0 },
        { input: '( 1 , 0 )', top: 1, bot: 0 },
        { input: '(-1,0)', top: -1, bot: 0 },
        { input: '(0,1)', top: 0, bot: 1 },
        { input: '(0,-1)', top: 0, bot: -1 },
        { input: '(-3,3)', top: -3, bot: 3 },
        { input: '(3,-3)', top: 3, bot: -3 },
        { input: '(-6,6)', top: -6, bot: 6 },
        { input: '(6,-6)', top: 6, bot: -6 },
        { input: '(0,0)', top: 0, bot: 0 }
      ];

      testCases.forEach(({ input, top, bot }) => {
        const parsed = parseSquare1Move(input);
        assert.equal(parsed.type, 'layer_turn');
        assert.equal(parsed.top, top);
        assert.equal(parsed.bottom, bot);
        assert.ok(Math.abs(parsed.topAngle - top * (Math.PI / 6)) < 1e-6);
        assert.ok(Math.abs(parsed.bottomAngle - bot * (Math.PI / 6)) < 1e-6);
      });
    });

    it('verifies parseSquare1Move normalizes -0 IEEE float to +0 when input is (-0, 0)', () => {
      const parsed = parseSquare1Move('( -0 , 0 )');
      assert.equal(Object.is(parsed.top, 0), true);
      assert.equal(Object.is(parsed.top, -0), false);
    });

    it('strictly enforces [-6, 6] coordinate bounds on both top and bottom layers', () => {
      const outOfBounds = [
        '(-7, 0)', '(7, 0)', '(0, -7)', '(0, 7)',
        '(-7, -7)', '(7, 7)', '(12, 0)', '(-12, -6)',
        '(100, -100)', '(-10, 5)'
      ];
      outOfBounds.forEach(token => {
        assert.throws(() => parseSquare1Move(token), /out of range \[-6, 6\]/);
      });
    });

    it('rejects malformed Square-1 syntax (missing parens, missing comma, extra numbers, non-integers)', () => {
      const malformed = [
        '1, 0', '(1 0)', '(1, 0', '1, 0)', '(1, 2, 3)',
        '(a, b)', '(1.5, 0)', '(1, -2.5)', '()', '(,)',
        'R', "U'", 'M', '2R', 'x'
      ];
      malformed.forEach(token => {
        assert.throws(() => parseSquare1Move(token), /Invalid Square-1 notation/);
      });
    });

    it('rejects null, undefined, empty, and non-string inputs in parseSquare1Move', () => {
      [null, undefined, '', '   ', 123, {}].forEach(bad => {
        assert.throws(() => parseSquare1Move(bad), /Invalid Square-1 notation/);
      });
    });

    it('parseAlgorithm tokenizes clean sequences with slashes and tuples', () => {
      assert.deepEqual(parseSquare1Algorithm(''), []);
      assert.deepEqual(parseSquare1Algorithm('   '), []);
      assert.deepEqual(parseSquare1Algorithm(null), []);
      assert.deepEqual(parseSquare1Algorithm(undefined), []);

      const alg1 = '/ (1,0) / (-3,0) / (0,3) /';
      assert.deepEqual(parseSquare1Algorithm(alg1), ['/', '(1,0)', '/', '(-3,0)', '/', '(0,3)', '/']);

      const algCompact = '/(1,0)/(-3,0)/(0,3)/';
      assert.deepEqual(parseSquare1Algorithm(algCompact), ['/', '(1,0)', '/', '(-3,0)', '/', '(0,3)', '/']);
    });

    it('verifies parseAlgorithm cleanly strips line comments // and parses moves', () => {
      const algWithComments = '// Vandenbergh Step 1\n/ (1,0) /';
      const parsed = parseSquare1Algorithm(algWithComments);
      assert.deepEqual(parsed, ['/', '(1,0)', '/']);
    });

    it('parseAlgorithm throws on invalid characters or corrupted syntax within algorithm', () => {
      assert.throws(() => parseSquare1Algorithm('/ (1,0) BAD /'), /Invalid Square-1 notation syntax/);
      assert.throws(() => parseSquare1Algorithm('/ (1,0) / trailing_junk'), /Invalid trailing characters/);
    });

    it('verifies getMoveInfo provides accurate Indonesian descriptions for slice, tuples, and negative coordinates', () => {
      assert.ok(getSquare1MoveInfo('/').name.includes('Irisan Belahan Tengah 180°'));
      assert.ok(getSquare1MoveInfo('(1,0)').desc.includes('30°'));
      assert.ok(getSquare1MoveInfo('(-3,0)').desc.includes('90° lawan arah'));

      const custom = getSquare1MoveInfo('(4,-2)');
      assert.ok(custom.name.includes('(4, -2)'));
      assert.ok(custom.desc.includes('120°'));
      assert.ok(custom.desc.includes('-60°'));
    });
  });
});

describe('Challenger M3-1: 2. Inverse Symmetry Invariance: getInverseMove(getInverseMove(m)) === m', () => {

  describe('2.1. Skewb Inverse Symmetry', () => {
    it('verifies getInverseMove(getInverseMove(m)) === m for all 8 standard Skewb moves', () => {
      const validMoves = ['R', "R'", 'L', "L'", 'U', "U'", 'B', "B'"];
      validMoves.forEach(m => {
        const inv = getInverseSkewbMove(m);
        assert.notEqual(inv, m, `Skewb move ${m} should not equal its inverse`);
        const invInv = getInverseSkewbMove(inv);
        assert.equal(invInv, m, `Double inverse failed for Skewb move ${m}`);
      });
    });

    it('verifies mutual cancellation of Skewb move and its inverse', () => {
      assert.equal(getInverseSkewbMove('R'), "R'");
      assert.equal(getInverseSkewbMove("R'"), 'R');
      assert.equal(getInverseSkewbMove('L'), "L'");
      assert.equal(getInverseSkewbMove("L'"), 'L');
      assert.equal(getInverseSkewbMove('U'), "U'");
      assert.equal(getInverseSkewbMove("U'"), 'U');
      assert.equal(getInverseSkewbMove('B'), "B'");
      assert.equal(getInverseSkewbMove("B'"), 'B');
    });
  });

  describe('2.2. Megaminx Inverse Symmetry', () => {
    it('verifies getInverseMove(getInverseMove(m)) === m for all Pochmann moves', () => {
      const pochmannMoves = ['R++', 'R--', 'D++', 'D--'];
      pochmannMoves.forEach(m => {
        const inv = getInverseMegaminxMove(m);
        assert.notEqual(inv, m);
        const invInv = getInverseMegaminxMove(inv);
        assert.equal(invInv, m, `Pochmann double inverse failed for ${m}`);
      });
    });

    it('verifies mutual Pochmann cancellation pairings', () => {
      assert.equal(getInverseMegaminxMove('R++'), 'R--');
      assert.equal(getInverseMegaminxMove('R--'), 'R++');
      assert.equal(getInverseMegaminxMove('D++'), 'D--');
      assert.equal(getInverseMegaminxMove('D--'), 'D++');
    });

    it('verifies getInverseMove(getInverseMove(m)) === m for all 14 face notations', () => {
      const faces = ['U', 'F', 'FL', 'BL', 'BR', 'FR', 'D', 'B', 'DL', 'UL', 'UR', 'DR', 'R', 'L'];
      faces.forEach(f => {
        // Clockwise turn
        const inv = getInverseMegaminxMove(f);
        assert.equal(inv, `${f}'`);
        const invInv = getInverseMegaminxMove(inv);
        assert.equal(invInv, f);

        // Counter-clockwise turn
        const invPrime = getInverseMegaminxMove(`${f}'`);
        assert.equal(invPrime, f);
        const invInvPrime = getInverseMegaminxMove(invPrime);
        assert.equal(invInvPrime, `${f}'`);
      });
    });

    it('handles non-string and empty inputs gracefully in getInverseMegaminxMove', () => {
      assert.equal(getInverseMegaminxMove(''), '');
      assert.equal(getInverseMegaminxMove(null), '');
      assert.equal(getInverseMegaminxMove(undefined), '');
      assert.equal(getInverseMegaminxMove(123), '');
    });
  });

  describe('2.3. Square-1 Inverse Symmetry', () => {
    it('verifies slice move / is self-inverting and satisfies double inverse identity', () => {
      const inv = getInverseSquare1Move('/');
      assert.equal(inv, '/');
      const invInv = getInverseSquare1Move(inv);
      assert.equal(invInv, '/');
    });

    it('exhaustively verifies getInverseMove(getInverseMove(m)) === m across ALL 169 layer combinations [-6, 6] x [-6, 6]', () => {
      let count = 0;
      for (let top = -6; top <= 6; top++) {
        for (let bot = -6; bot <= 6; bot++) {
          const move = `(${top},${bot})`;
          const inv = getInverseSquare1Move(move);

          // Expected inverse is (-top, -bot), with -0 normalized to 0
          const expectedTop = top === 0 ? 0 : -top;
          const expectedBot = bot === 0 ? 0 : -bot;
          assert.equal(inv, `(${expectedTop},${expectedBot})`);

          // Double inverse must return to exact original normalized token
          const invInv = getInverseSquare1Move(inv);
          assert.equal(invInv, move, `Double inverse failed on Square-1 move ${move}`);
          count++;
        }
      }
      assert.equal(count, 169, 'Must test all 169 combinations in [-6, 6] x [-6, 6]');
    });

    it('properly normalizes negative zero to positive zero preventing (-0, 0) anomalies', () => {
      const zeroCases = ['(0,0)', '(0,1)', '(-0,0)', '(0,-0)'];
      zeroCases.forEach(zc => {
        const inv = getInverseSquare1Move(zc);
        assert.ok(!inv.includes('-0'), `Negative zero leak detected in ${inv}`);
        const invInv = getInverseSquare1Move(inv);
        assert.ok(!invInv.includes('-0'), `Negative zero leak in double inverse ${invInv}`);
      });
    });

    it('throws informative Error on empty or malformed tokens in getInverseSquare1Move', () => {
      [null, undefined, '', '   ', 123, 'bad', '(1)'].forEach(bad => {
        assert.throws(() => getInverseSquare1Move(bad));
      });
    });
  });
});

describe('Challenger M3-1: 3. Scramble Generator Randomness, Distribution & Validity', () => {

  describe('3.1. Skewb Scrambler Randomness & Validity', () => {
    it('generates valid Skewb moves that all parse cleanly', () => {
      for (let trial = 0; trial < 50; trial++) {
        const scramble = generateSkewbScramble(10);
        const tokens = scramble.split(' ').filter(Boolean);
        assert.equal(tokens.length, 10);
        tokens.forEach(token => {
          assert.doesNotThrow(() => parseSkewbMove(token));
        });
      }
    });

    it('strictly guarantees no two consecutive moves share the same face (consecutive move cancellation prevention)', () => {
      for (let trial = 0; trial < 100; trial++) {
        const scramble = generateSkewbScramble(20);
        const tokens = scramble.split(' ').filter(Boolean);
        for (let i = 1; i < tokens.length; i++) {
          const prevFace = tokens[i - 1][0];
          const currFace = tokens[i][0];
          assert.notEqual(
            currFace,
            prevFace,
            `Consecutive repeat face '${currFace}' found at indices ${i-1} and ${i} in scramble: "${scramble}"`
          );
        }
      }
    });

    it('demonstrates uniform pseudo-random face distribution across 1000 generated moves', () => {
      const counts = { R: 0, L: 0, U: 0, B: 0 };
      const totalMoves = 1000;
      const scramble = generateSkewbScramble(totalMoves);
      const tokens = scramble.split(' ').filter(Boolean);

      tokens.forEach(t => {
        counts[t[0]]++;
      });

      // Expected ~250 per face. Allow generous statistical bound [180, 320]
      ['R', 'L', 'U', 'B'].forEach(f => {
        assert.ok(
          counts[f] >= 180 && counts[f] <= 320,
          `Face ${f} frequency ${counts[f]} outside expected range [180, 320]`
        );
      });
    });

    it('handles boundary length parameters gracefully (length = 0, 1, negative)', () => {
      assert.equal(generateSkewbScramble(0), '');
      assert.equal(generateSkewbScramble(-5), '');
      const single = generateSkewbScramble(1);
      assert.equal(single.split(' ').length, 1);
      assert.doesNotThrow(() => parseSkewbMove(single));
    });
  });

  describe('3.2. Megaminx Scrambler Randomness & Validity', () => {
    it('generates valid Megaminx tokens that all parse cleanly with parseMegaminxMove', () => {
      for (let trial = 0; trial < 30; trial++) {
        const scramble = generateMegaminxScramble(20);
        const tokens = scramble.split(' ').filter(Boolean);
        assert.ok(tokens.length >= 15, `Expected at least 15 tokens, got ${tokens.length}`);
        tokens.forEach(t => {
          assert.doesNotThrow(() => parseMegaminxMove(t));
        });
      }
    });

    it('conforms to standard Pochmann block structure: blocks of 4 Pochmann + 1 U turn', () => {
      const scramble = generateMegaminxScramble(20);
      const tokens = scramble.split(' ').filter(Boolean);
      assert.equal(tokens.length, 20);

      for (let b = 0; b < 4; b++) {
        const block = tokens.slice(b * 5, (b + 1) * 5);
        // First 4 must be Pochmann
        for (let p = 0; p < 4; p++) {
          const move = parseMegaminxMove(block[p]);
          assert.equal(move.type, 'pochmann', `Token ${block[p]} in block ${b} position ${p} must be Pochmann`);
        }
        // 5th must be U or U'
        const uTurn = parseMegaminxMove(block[4]);
        assert.equal(uTurn.type, 'face');
        assert.equal(uTurn.baseFace, 'U');
      }
    });

    it('demonstrates distribution across all 4 Pochmann moves and both U directions over 500 blocks', () => {
      const pochmannCounts = { 'R++': 0, 'R--': 0, 'D++': 0, 'D--': 0 };
      const uCounts = { 'U': 0, "U'": 0 };

      // Generate 100 scrambles of length 25 = 500 blocks = 2000 Pochmann moves + 500 U turns
      for (let i = 0; i < 100; i++) {
        const sc = generateMegaminxScramble(25);
        const tokens = sc.split(' ').filter(Boolean);
        tokens.forEach(t => {
          if (pochmannCounts[t] !== undefined) pochmannCounts[t]++;
          if (uCounts[t] !== undefined) uCounts[t]++;
        });
      }

      // Check all 4 Pochmann moves have healthy frequency (expected ~500 each, allow [350, 650])
      Object.entries(pochmannCounts).forEach(([move, count]) => {
        assert.ok(count >= 350 && count <= 650, `Pochmann move ${move} count ${count} outside [350, 650]`);
      });

      // Check U / U' have healthy frequency (expected ~250 each, allow [180, 320])
      Object.entries(uCounts).forEach(([move, count]) => {
        assert.ok(count >= 180 && count <= 320, `U turn ${move} count ${count} outside [180, 320]`);
      });
    });

    it('handles boundary length parameters (length = 0, 4, 5, negative)', () => {
      assert.equal(generateMegaminxScramble(0), '');
      assert.equal(generateMegaminxScramble(-10), '');
      assert.equal(generateMegaminxScramble(4), ''); // Math.floor(4/5) === 0
      const s5 = generateMegaminxScramble(5);
      assert.equal(s5.split(' ').length, 5);
    });
  });

  describe('3.3. Square-1 Scrambler Randomness & Validity', () => {
    it('generates valid alternating (top,bot) and / tokens that all parse cleanly', () => {
      for (let trial = 0; trial < 30; trial++) {
        const scramble = generateSquare1Scramble(10);
        const tokens = scramble.split(' ').filter(Boolean);
        assert.equal(tokens.length, 20); // 10 pairs of (top,bot) and /

        for (let i = 0; i < tokens.length; i++) {
          if (i % 2 === 0) {
            const parsed = parseSquare1Move(tokens[i]);
            assert.equal(parsed.type, 'layer_turn');
            assert.ok(parsed.top >= -6 && parsed.top <= 6);
            assert.ok(parsed.bottom >= -6 && parsed.bottom <= 6);
          } else {
            assert.equal(tokens[i], '/');
            const parsed = parseSquare1Move(tokens[i]);
            assert.equal(parsed.type, 'slice');
          }
        }
      }
    });

    it('verifies generated coordinates strictly respect [-6, 6] range and cover full spectrum', () => {
      const topValues = new Set();
      const botValues = new Set();

      // Over 200 scrambles of length 15 = 3000 pairs
      for (let trial = 0; trial < 200; trial++) {
        const sc = generateSquare1Scramble(15);
        const tokens = sc.split(' ').filter(Boolean);
        for (let i = 0; i < tokens.length; i += 2) {
          const parsed = parseSquare1Move(tokens[i]);
          assert.ok(parsed.top >= -6 && parsed.top <= 6);
          assert.ok(parsed.bottom >= -6 && parsed.bottom <= 6);
          topValues.add(parsed.top);
          botValues.add(parsed.bottom);
        }
      }

      // All 13 discrete values [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6] must be sampled
      assert.equal(topValues.size, 13, `Expected all 13 values in top layer, got ${topValues.size}`);
      assert.equal(botValues.size, 13, `Expected all 13 values in bottom layer, got ${botValues.size}`);
    });

    it('handles boundary length parameters (length = 0, 1, negative)', () => {
      assert.equal(generateSquare1Scramble(0), '');
      assert.equal(generateSquare1Scramble(-5), '');
      const s1 = generateSquare1Scramble(1);
      const tokens = s1.split(' ').filter(Boolean);
      assert.equal(tokens.length, 2);
      assert.equal(tokens[1], '/');
    });
  });
});

describe('Challenger M3-1: 4. Mathematical Kinematic Rotation Identities (Empirical 3D Rotations)', () => {

  describe('4.1. Skewb 3D Rotations & Cycle Invariance', () => {
    it('3x 120° corner turn on each axis returns to exact 360° identity quaternion (3 x 120° = 360°)', () => {
      const faces = ['R', 'L', 'U', 'B'];
      faces.forEach(face => {
        const model = buildSkewbModel();
        assert.ok(model);

        for (let rep = 0; rep < 3; rep++) {
          animateSkewbMove(model, face, null, 0);
        }

        assertQuaternionIsIdentity(model.quaternion, 1e-5, `Skewb 3x ${face} cycle`);
      });
    });

    it('single move + inverse move returns Skewb model to exact identity', () => {
      const faces = ['R', 'L', 'U', 'B'];
      faces.forEach(face => {
        const model = buildSkewbModel();
        animateSkewbMove(model, face, null, 0);
        animateSkewbMove(model, getInverseSkewbMove(face), null, 0);
        assertQuaternionIsIdentity(model.quaternion, 1e-5, `Skewb ${face} + inv`);
      });
    });

    it('handles null modelGroup in animateSkewbMove safely without throwing', () => {
      let callbackFired = false;
      assert.doesNotThrow(() => {
        animateSkewbMove(null, 'R', () => { callbackFired = true; }, 0);
      });
      assert.equal(callbackFired, true);
    });
  });

  describe('4.2. Megaminx 3D Rotations & Cycle Invariance', () => {
    it('5x 72° face turn on regular pentagon returns to 360° identity (5 x 72° = 360°)', () => {
      const faces = ['U', 'F', 'R', 'L', 'D', 'B'];
      faces.forEach(face => {
        const model = buildMegaminxModel();
        assert.ok(model);

        for (let rep = 0; rep < 5; rep++) {
          animateMegaminxMove(model, face, null, 0);
        }

        assertQuaternionIsIdentity(model.quaternion, 1e-5, `Megaminx 5x ${face} cycle`);
      });
    });

    it('5x 144° Pochmann turn returns to 720° (2 full revolutions = identity)', () => {
      const pochmanns = ['R++', 'R--', 'D++', 'D--'];
      pochmanns.forEach(p => {
        const model = buildMegaminxModel();
        for (let rep = 0; rep < 5; rep++) {
          animateMegaminxMove(model, p, null, 0);
        }
        assertQuaternionIsIdentity(model.quaternion, 1e-5, `Megaminx 5x ${p} (720°)`);
      });
    });

    it('Pochmann move + inverse move returns model to exact identity', () => {
      ['R++', 'D++'].forEach(p => {
        const model = buildMegaminxModel();
        animateMegaminxMove(model, p, null, 0);
        animateMegaminxMove(model, getInverseMegaminxMove(p), null, 0);
        assertQuaternionIsIdentity(model.quaternion, 1e-5, `Megaminx ${p} + inv`);
      });
    });

    it('handles null modelGroup in animateMegaminxMove safely', () => {
      let called = false;
      assert.doesNotThrow(() => {
        animateMegaminxMove(null, 'U', () => { called = true; }, 0);
      });
      assert.equal(called, true);
    });
  });

  describe('4.3. Square-1 3D Rotations & Cycle Invariance', () => {
    it('2x slice / equals 360° middle slice rotation returning model to identity', () => {
      const model = buildSquare1Model();
      for (let rep = 0; rep < 2; rep++) {
        animateSquare1Move(model, '/', null, 0);
      }
      assertQuaternionIsIdentity(model.quaternion, 1e-5, 'Square-1 2x / slice cycle');
    });

    it('12x (1, 0) returns top layer to exact identity (12 x 30° = 360°)', () => {
      const model = buildSquare1Model();
      const topLayer = model.getObjectByName('layer-top');
      assert.ok(topLayer);

      for (let rep = 0; rep < 12; rep++) {
        animateSquare1Move(model, '(1,0)', null, 0);
      }
      assertQuaternionIsIdentity(topLayer.quaternion, 1e-5, 'Square-1 12x (1,0) top layer');
    });

    it('12x (0, 1) returns bottom layer to exact identity (12 x 30° = 360°)', () => {
      const model = buildSquare1Model();
      const botLayer = model.getObjectByName('layer-bottom');
      assert.ok(botLayer);

      for (let rep = 0; rep < 12; rep++) {
        animateSquare1Move(model, '(0,1)', null, 0);
      }
      assertQuaternionIsIdentity(botLayer.quaternion, 1e-5, 'Square-1 12x (0,1) bottom layer');
    });

    it('layer turn (x, y) + inverse (-x, -y) returns both layers to exact identity', () => {
      const testCases = ['(1,0)', '(0,1)', '(-3,2)', '(6,-6)', '(-1,-1)'];
      testCases.forEach(token => {
        const model = buildSquare1Model();
        const topLayer = model.getObjectByName('layer-top');
        const botLayer = model.getObjectByName('layer-bottom');

        animateSquare1Move(model, token, null, 0);
        animateSquare1Move(model, getInverseSquare1Move(token), null, 0);

        assertQuaternionIsIdentity(topLayer.quaternion, 1e-5, `Square-1 top ${token} + inv`);
        assertQuaternionIsIdentity(botLayer.quaternion, 1e-5, `Square-1 bot ${token} + inv`);
      });
    });

    it('handles null modelGroup in animateSquare1Move safely', () => {
      let called = false;
      assert.doesNotThrow(() => {
        animateSquare1Move(null, '/', () => { called = true; }, 0);
      });
      assert.equal(called, true);
    });
  });
});
