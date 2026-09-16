/**
 * Tier 1 Tests: Notation & Translation (Features 11 & 12)
 * Covers: WCA Notation Parser & Indonesian Translation
 * >= 5 tests per feature (10+ tests)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseNotation, getIndonesianTranslation } from '../helpers/puzzleOracles.js';

describe('Tier 1: Feature 11 - WCA Notation Parser', () => {
  it('F11.1: parses basic single, prime, and double face turns', () => {
    const parsed = parseNotation("R L' U2 D F' B2", 'cube-3x3');
    assert.equal(parsed.length, 6);
    assert.deepEqual(parsed.map(p => p.token), ['R', "L'", 'U2', 'D', "F'", 'B2']);
  });

  it('F11.2: parses wide turns (Rw, Lw, Uw) and multi-layer wide turns (3Rw)', () => {
    const parsed = parseNotation("Rw Lw' Uw2 3Rw 3Uw'", 'cube-5x5');
    assert.equal(parsed.length, 5);
    assert.equal(parsed[0].isWide, true);
    assert.equal(parsed[0].layerCount, 2);
    assert.equal(parsed[3].layerCount, 3);
  });

  it('F11.3: parses inner slice turns (M, E, S, 2R) and cube rotations (x, y, z)', () => {
    const parsed = parseNotation("M E S 2R x y z", 'cube-4x4');
    assert.equal(parsed.length, 7);
    assert.equal(parsed[0].token, 'M');
    assert.equal(parsed[3].layerCount, 2);
    assert.equal(parsed[4].token, 'x');
  });

  it('F11.4: normalizes whitespace, ignores linebreaks, and strips comment annotations', () => {
    const input = `
      // T-Perm setup
      R U R' U' // sexy move
      R' F R2 U' (R' U')
    `;
    const parsed = parseNotation(input, 'cube-3x3');
    assert.equal(parsed.length, 10);
    assert.equal(parsed[0].token, 'R');
    assert.equal(parsed[9].token, "U'");
  });

  it('F11.5: parses non-cubic syntax: Pyraminx tips and Square-1 tuples with slashes', () => {
    const pyra = parseNotation("u l' r b'", 'pyraminx');
    assert.equal(pyra.length, 4);
    assert.equal(pyra[0].isTip, true);

    const sq1 = parseNotation('/ (-3,0) / (0,3) /', 'square1');
    assert.equal(sq1.length, 5);
    assert.equal(sq1[0].token, '/');
    assert.equal(sq1[1].token, '(-3,0)');
  });
});

describe('Tier 1: Feature 12 - Indonesian Translation', () => {
  it('F12.1: translates standard face turns to clear Indonesian descriptions', () => {
    const rTrans = getIndonesianTranslation('R', 'cube-3x3');
    assert.equal(rTrans.name, 'Kanan');
    assert.ok(rTrans.desc.includes('searah jarum jam'));

    const rPrimeTrans = getIndonesianTranslation("R'", 'cube-3x3');
    assert.equal(rPrimeTrans.name, 'Kanan Lawan Arah');
    assert.ok(rPrimeTrans.desc.includes('berlawanan'));
  });

  it('F12.2: translates wide turns with layer count explanations', () => {
    const rwTrans = getIndonesianTranslation('Rw', 'cube-4x4');
    assert.equal(rwTrans.name, 'Kanan Dua Lapis');
    assert.ok(rwTrans.desc.includes('2 lapisan'));

    const threeRw = getIndonesianTranslation('3Rw', 'cube-5x5');
    assert.equal(threeRw.name, 'Kanan Tiga Lapis');
    assert.ok(threeRw.desc.includes('3 lapisan'));
  });

  it('F12.3: translates slice turns and cube rotations with pedagogical clarity', () => {
    const mTrans = getIndonesianTranslation('M', 'cube-3x3');
    assert.equal(mTrans.name, 'Irisan Tengah Vertikal');

    const xTrans = getIndonesianTranslation('x', 'cube-3x3');
    assert.equal(xTrans.name, 'Rotasi Kubus Sumbu X');
  });

  it('F12.4: translates Pyraminx tip rotations and Megaminx Pochmann steps', () => {
    const uTip = getIndonesianTranslation('u', 'pyraminx');
    assert.equal(uTip.name, 'Ujung Atas');
    assert.ok(uTip.desc.includes('120 derajat'));

    const pochR = getIndonesianTranslation('R++', 'megaminx');
    assert.equal(pochR.name, 'Pochmann Kanan Turun 2x');
    assert.ok(pochR.desc.includes('144 derajat'));
  });

  it('F12.5: translates Square-1 angle tuples and slice with exact degree notation', () => {
    const sliceTrans = getIndonesianTranslation('/', 'square1');
    assert.equal(sliceTrans.name, 'Irisan Belahan Tengah 180°');

    const tupleTrans = getIndonesianTranslation('(3,-3)', 'square1');
    assert.ok(tupleTrans.desc.includes('90°'));
    assert.ok(tupleTrans.desc.includes('-90°'));
  });
});
