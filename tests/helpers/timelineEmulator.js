/**
 * Playback Timeline State Machine Emulator
 * Tests timeline mutex locking, step forward, step backward via inverse moves,
 * speed clamping, and scrubber navigation.
 */

import { parseNotation, getInverseMove } from './puzzleOracles.js';

export class TimelineEmulator {
  constructor(options = {}) {
    this.puzzleId = options.puzzleId || 'cube-3x3';
    this.moves = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.speed = 1.0;
    this.isBusy = false;
    this.history = []; // tracks executed moves
  }

  loadAlgorithm(algorithmStr) {
    const parsed = parseNotation(algorithmStr, this.puzzleId);
    this.moves = parsed.map(p => p.token);
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isBusy = false;
    this.history = [];
  }

  setSpeed(val) {
    if (typeof val !== 'number' || Number.isNaN(val)) {
      throw new TypeError('Speed must be a valid number');
    }
    // Clamp to valid range [0.25, 2.5]
    this.speed = Math.max(0.25, Math.min(2.5, val));
    return this.speed;
  }

  stepNext() {
    if (this.isBusy) {
      // Mutex lock prevents race conditions
      return { success: false, reason: 'BUSY_MUTEX_LOCKED' };
    }

    if (this.currentIndex >= this.moves.length) {
      this.isPlaying = false;
      return { success: false, reason: 'END_OF_TIMELINE' };
    }

    this.isBusy = true;
    const move = this.moves[this.currentIndex];
    this.currentIndex++;
    this.history.push({ action: 'forward', move });
    this.isBusy = false;

    return { success: true, move, newIndex: this.currentIndex };
  }

  stepPrev() {
    if (this.isBusy) {
      return { success: false, reason: 'BUSY_MUTEX_LOCKED' };
    }

    if (this.currentIndex <= 0) {
      return { success: false, reason: 'START_OF_TIMELINE' };
    }

    this.isBusy = true;
    const originalMove = this.moves[this.currentIndex - 1];
    const inverseMove = getInverseMove(originalMove, this.puzzleId);
    this.currentIndex--;
    this.history.push({ action: 'backward', originalMove, inverseMove });
    this.isBusy = false;

    return { success: true, inverseMove, originalMove, newIndex: this.currentIndex };
  }

  jumpTo(targetIndex) {
    if (this.isBusy) {
      return { success: false, reason: 'BUSY_MUTEX_LOCKED' };
    }

    if (typeof targetIndex !== 'number' || Number.isNaN(targetIndex)) {
      throw new TypeError('targetIndex must be a number');
    }

    // Clamp targetIndex between 0 and moves.length
    const clamped = Math.max(0, Math.min(this.moves.length, Math.round(targetIndex)));
    const executed = [];

    if (clamped > this.currentIndex) {
      while (this.currentIndex < clamped) {
        const move = this.moves[this.currentIndex];
        this.currentIndex++;
        executed.push({ action: 'forward', move });
      }
    } else if (clamped < this.currentIndex) {
      while (this.currentIndex > clamped) {
        const originalMove = this.moves[this.currentIndex - 1];
        const inverseMove = getInverseMove(originalMove, this.puzzleId);
        this.currentIndex--;
        executed.push({ action: 'backward', originalMove, inverseMove });
      }
    }

    this.history.push(...executed);
    return { success: true, newIndex: this.currentIndex, executed };
  }

  play() {
    if (this.currentIndex >= this.moves.length) {
      this.currentIndex = 0;
    }
    this.isPlaying = true;
  }

  pause() {
    this.isPlaying = false;
  }

  reset() {
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isBusy = false;
    this.history = [];
  }
}
