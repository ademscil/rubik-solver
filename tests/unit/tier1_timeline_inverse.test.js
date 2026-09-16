/**
 * Tier 1 Tests: Timeline & Inverse Stepping (Features 13 & 14)
 * Covers: Playback Timeline (Play/Pause/Step/Mutex) & Inverse Move Generator
 * >= 5 tests per feature (10+ tests)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TimelineEmulator } from '../helpers/timelineEmulator.js';
import { getInverseMove, invertSequence } from '../helpers/puzzleOracles.js';

describe('Tier 1: Feature 13 - Playback Timeline (Play/Pause/Step)', () => {
  it('F13.1: loads algorithm and initializes timeline to index 0', () => {
    const timeline = new TimelineEmulator({ puzzleId: 'cube-3x3' });
    timeline.loadAlgorithm("R U R' U'");
    assert.equal(timeline.moves.length, 4);
    assert.equal(timeline.currentIndex, 0);
    assert.equal(timeline.isPlaying, false);
    assert.equal(timeline.isBusy, false);
  });

  it('F13.2: steps forward cleanly incrementing index and tracking move', () => {
    const timeline = new TimelineEmulator({ puzzleId: 'cube-3x3' });
    timeline.loadAlgorithm("R U R' U'");
    const step1 = timeline.stepNext();
    assert.equal(step1.success, true);
    assert.equal(step1.move, 'R');
    assert.equal(step1.newIndex, 1);
    assert.equal(timeline.currentIndex, 1);
  });

  it('F13.3: steps backward via inverse move decrementing index', () => {
    const timeline = new TimelineEmulator({ puzzleId: 'cube-3x3' });
    timeline.loadAlgorithm("R U R' U'");
    timeline.stepNext(); // R -> index 1
    timeline.stepNext(); // U -> index 2

    const backStep = timeline.stepPrev();
    assert.equal(backStep.success, true);
    assert.equal(backStep.originalMove, 'U');
    assert.equal(backStep.inverseMove, "U'");
    assert.equal(backStep.newIndex, 1);
    assert.equal(timeline.currentIndex, 1);
  });

  it('F13.4: enforces mutex locking during busy tween execution', () => {
    const timeline = new TimelineEmulator({ puzzleId: 'cube-3x3' });
    timeline.loadAlgorithm("R U");
    timeline.isBusy = true; // simulate active Three.js tween

    const attempt = timeline.stepNext();
    assert.equal(attempt.success, false);
    assert.equal(attempt.reason, 'BUSY_MUTEX_LOCKED');
    assert.equal(timeline.currentIndex, 0); // index unmoved
  });

  it('F13.5: clamps playback speed to valid bounds [0.25x, 2.5x]', () => {
    const timeline = new TimelineEmulator();
    timeline.setSpeed(0.5);
    assert.equal(timeline.speed, 0.5);

    timeline.setSpeed(0.1); // below min
    assert.equal(timeline.speed, 0.25);

    timeline.setSpeed(5.0); // above max
    assert.equal(timeline.speed, 2.5);
  });
});

describe('Tier 1: Feature 14 - Inverse Move Generator', () => {
  it('F14.1: inverts basic face moves: X <-> X\' and preserves double turns X2', () => {
    assert.equal(getInverseMove('R', 'cube-3x3'), "R'");
    assert.equal(getInverseMove("R'", 'cube-3x3'), 'R');
    assert.equal(getInverseMove('R2', 'cube-3x3'), 'R2');
    assert.equal(getInverseMove('U', 'cube-3x3'), "U'");
    assert.equal(getInverseMove("U'", 'cube-3x3'), 'U');
  });

  it('F14.2: inverts wide moves (Rw <-> Rw\') and inner slices (M <-> M\')', () => {
    assert.equal(getInverseMove('Rw', 'cube-4x4'), "Rw'");
    assert.equal(getInverseMove("Rw'", 'cube-4x4'), 'Rw');
    assert.equal(getInverseMove('3Rw', 'cube-5x5'), "3Rw'");
    assert.equal(getInverseMove('M', 'cube-3x3'), "M'");
    assert.equal(getInverseMove("M'", 'cube-3x3'), 'M');
  });

  it('F14.3: inverts Pyraminx tips and vertex moves', () => {
    assert.equal(getInverseMove('u', 'pyraminx'), "u'");
    assert.equal(getInverseMove("u'", 'pyraminx'), 'u');
    assert.equal(getInverseMove('L', 'pyraminx'), "L'");
    assert.equal(getInverseMove("L'", 'pyraminx'), 'L');
  });

  it('F14.4: inverts Square-1 angle tuples (x,y) -> (-x,-y) and slash / -> /', () => {
    assert.equal(getInverseMove('(1,0)', 'square1'), '(-1,0)');
    assert.equal(getInverseMove('(-3,2)', 'square1'), '(3,-2)');
    assert.equal(getInverseMove('/', 'square1'), '/');
  });

  it('F14.5: inverts full sequence reversing order and inverting each move', () => {
    const original = "R U R' U'";
    const inverted = invertSequence(original, 'cube-3x3');
    assert.equal(inverted, "U R U' R'");

    const sq1Seq = '/ (3,0) / (-3,0) /';
    const sq1Inv = invertSequence(sq1Seq, 'square1');
    assert.equal(sq1Inv, '/ (3,0) / (-3,0) /');
  });
});
