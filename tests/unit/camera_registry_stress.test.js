/**
 * Empirical Stress Test Harness: CameraManager & Puzzle Registry
 * File: tests/unit/camera_registry_stress.test.js
 * Runner: node --test
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CameraManager, CAMERA_PRESETS } from '../../src/engine/CameraManager.js';
import {
  puzzleRegistry,
  PuzzleRegistry,
  normalizePuzzleId,
  DIFFICULTY_TIERS,
  getAllPuzzleMetadata,
  getPuzzleMetadata,
  getPuzzlesGroupedByDifficulty
} from '../../src/puzzles/registry.js';

// Headless mocks for Three.js camera and controls
function createCameraControlsMocks() {
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);

  const listeners = {};
  const controls = {
    target: new THREE.Vector3(0, 0, 0),
    updated: false,
    updateCount: 0,
    update() {
      this.updated = true;
      this.updateCount++;
    },
    listeners,
    addEventListener(type, fn) {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(fn);
    },
    removeEventListener(type, fn) {
      if (listeners[type]) {
        listeners[type] = listeners[type].filter(f => f !== fn);
      }
    },
    dispatch(type, event = {}) {
      if (listeners[type]) {
        listeners[type].forEach(fn => fn(event));
      }
    }
  };

  return { camera, controls };
}

describe('Challenger 1: CameraManager Empirical Stress Tests', () => {

  describe('1.1 Rapid View Switching & Animation Interruption', () => {
    test('Rapid synchronous view switches (1,000 calls across all presets)', () => {
      const { camera, controls } = createCameraControlsMocks();
      const cm = new CameraManager(camera, controls, 8);

      const presets = [
        CAMERA_PRESETS.ISOMETRIC,
        CAMERA_PRESETS.FRONT,
        CAMERA_PRESETS.TOP,
        CAMERA_PRESETS.RIGHT,
        'unknown_custom_angle'
      ];

      for (let i = 0; i < 1000; i++) {
        const preset = presets[i % presets.length];
        cm.resetCamera(preset, { animate: false });
        assert.ok(Number.isFinite(camera.position.x), `x must be finite at iter ${i}`);
        assert.ok(Number.isFinite(camera.position.y), `y must be finite at iter ${i}`);
        assert.ok(Number.isFinite(camera.position.z), `z must be finite at iter ${i}`);
      }

      // Final position should match the 1000th preset ('unknown_custom_angle' -> isometric fallback)
      assert.equal(camera.position.x, 8);
      assert.equal(camera.position.y, 8);
      assert.equal(camera.position.z, 8);
      assert.equal(controls.updateCount, 1000);
      cm.dispose();
    });

    test('Rapid animated view switches with simulated RAF interruption', () => {
      const { camera, controls } = createCameraControlsMocks();
      const cm = new CameraManager(camera, controls, 8);

      // Emulate requestAnimationFrame & cancelAnimationFrame
      let rafId = 0;
      const scheduledCallbacks = new Map();

      const originalRAF = globalThis.requestAnimationFrame;
      const originalCAF = globalThis.cancelAnimationFrame;

      globalThis.requestAnimationFrame = (cb) => {
        const id = ++rafId;
        scheduledCallbacks.set(id, cb);
        return id;
      };
      globalThis.cancelAnimationFrame = (id) => {
        scheduledCallbacks.delete(id);
      };

      try {
        // Trigger rapid transitions
        cm.resetCamera(CAMERA_PRESETS.FRONT, { animate: true, duration: 300 });
        assert.equal(cm.isAnimating, true);
        const firstAnimId = cm.animId;
        assert.ok(firstAnimId > 0);

        // Immediately interrupt with TOP
        cm.resetCamera(CAMERA_PRESETS.TOP, { animate: true, duration: 300 });
        assert.ok(!scheduledCallbacks.has(firstAnimId), 'Previous anim frame must be cancelled');
        assert.equal(cm.isAnimating, true);
        const secondAnimId = cm.animId;
        assert.ok(secondAnimId > firstAnimId);

        // Simulate advancing clock halfway on second animation
        const stepFn = scheduledCallbacks.get(secondAnimId);
        assert.ok(typeof stepFn === 'function');
        const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        stepFn(now + 150); // halfway

        // Intermediate position must be interpolated and finite
        assert.ok(Number.isFinite(camera.position.x));
        assert.ok(Number.isFinite(camera.position.y));
        assert.ok(Number.isFinite(camera.position.z));

        // Rapid user interaction interruption
        controls.dispatch('start');
        assert.equal(cm.isAnimating, false);
        assert.equal(cm.animId, null);
      } finally {
        globalThis.requestAnimationFrame = originalRAF;
        globalThis.cancelAnimationFrame = originalCAF;
        cm.dispose();
      }
    });

    test('Non-string preset input types (stress edge cases)', () => {
      const { camera, controls } = createCameraControlsMocks();
      const cm = new CameraManager(camera, controls, 8);

      // Strings and null/undefined should fall back gracefully
      assert.doesNotThrow(() => cm.getPresetPosition(null));
      assert.doesNotThrow(() => cm.getPresetPosition(undefined));
      assert.doesNotThrow(() => cm.getPresetPosition(''));

      // Non-string truthy types should fallback gracefully to isometric default without throwing
      const nonStringInputs = [123, true, {}, [], Symbol('preset')];
      for (const input of nonStringInputs) {
        assert.doesNotThrow(
          () => cm.getPresetPosition(input),
          `Expected graceful fallback when passing ${typeof input} to getPresetPosition`
        );
        const pos = cm.getPresetPosition(input);
        assert.deepEqual({ x: pos.x, y: pos.y, z: pos.z }, { x: 8, y: 8, z: 8 });
      }
      cm.dispose();
    });
  });

  describe('1.2 Top View Gimbal Singularity & Collinear Up-Vector Analysis', () => {
    test('Top view position.z = 0.001 avoids collinear singularity with camera.up = (0, 1, 0)', () => {
      const { camera, controls } = createCameraControlsMocks();
      const d = 8;
      const cm = new CameraManager(camera, controls, d);

      const topPos = cm.getPresetPosition(CAMERA_PRESETS.TOP);
      assert.equal(topPos.x, 0);
      assert.equal(topPos.y, d * 1.5);
      assert.equal(topPos.z, 0.001);

      // Verify mathematical basis:
      // If position is (0, 12, 0), vector to target is (0, -12, 0)
      // Vector up is (0, 1, 0)
      // up.cross(forward) = (0, 0, 0), which causes right-vector normalization to divide by 0!
      const target = new THREE.Vector3(0, 0, 0);
      const up = new THREE.Vector3(0, 1, 0);

      // Case A: Singular collinear position (0, 12, 0)
      const singularPos = new THREE.Vector3(0, 12, 0);
      const forwardSingular = new THREE.Vector3().subVectors(target, singularPos).normalize();
      const rightSingular = new THREE.Vector3().crossVectors(up, forwardSingular);
      assert.equal(rightSingular.length(), 0, 'Singular position produces zero-length right vector!');

      // Case B: Mitigated position (0, 12, 0.001)
      const forwardMitigated = new THREE.Vector3().subVectors(target, topPos).normalize();
      const rightMitigated = new THREE.Vector3().crossVectors(up, forwardMitigated);
      assert.ok(rightMitigated.length() > 0, 'Mitigated position produces strictly non-zero right vector');

      const normalizedRight = rightMitigated.clone().normalize();
      assert.ok(Number.isFinite(normalizedRight.x));
      assert.ok(Number.isFinite(normalizedRight.y));
      assert.ok(Number.isFinite(normalizedRight.z));

      // Test lookAt with Three.js camera
      camera.position.copy(topPos);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld(true);

      // Check all matrixWorld elements are valid finite numbers
      for (let i = 0; i < 16; i++) {
        assert.ok(Number.isFinite(camera.matrixWorld.elements[i]), `Matrix element ${i} must be finite`);
      }
      cm.dispose();
    });

    test('Spherical coordinates calculation for top view avoids polar singularity', () => {
      const topPos = new THREE.Vector3(0, 12, 0.001);
      const spherical = new THREE.Spherical().setFromVector3(topPos);

      // Polar angle phi must be slightly greater than 0
      assert.ok(spherical.phi > 0, `phi ${spherical.phi} must be > 0 to avoid pole lock`);
      // Azimuth angle theta must be 0 (looking down Z)
      assert.ok(Number.isFinite(spherical.theta));
      assert.ok(spherical.radius > 0);
    });
  });

  describe('1.3 Dynamic Distance Scaling & Boundary Inputs', () => {
    test('Boundary distance inputs to setDistance()', () => {
      const { camera, controls } = createCameraControlsMocks();
      const cm = new CameraManager(camera, controls, 8);

      // d = 0 should be rejected (distance remains 8)
      cm.setDistance(0);
      assert.equal(cm.distance, 8, 'setDistance(0) must not overwrite valid distance');

      // d < 0 should be rejected
      cm.setDistance(-5);
      assert.equal(cm.distance, 8, 'setDistance(-5) must not overwrite valid distance');

      // d = NaN should be rejected
      cm.setDistance(NaN);
      assert.equal(cm.distance, 8, 'setDistance(NaN) must not overwrite valid distance');

      // d = undefined should be rejected
      cm.setDistance(undefined);
      assert.equal(cm.distance, 8, 'setDistance(undefined) must not overwrite valid distance');

      // d = null should be rejected
      cm.setDistance(null);
      assert.equal(cm.distance, 8, 'setDistance(null) must not overwrite valid distance');

      // d = "10" string should be rejected
      cm.setDistance("10");
      assert.equal(cm.distance, 8, 'setDistance("10") must not overwrite valid distance');

      // Adversarial Check: d = Infinity and -Infinity must be rejected
      cm.setDistance(Infinity);
      assert.equal(cm.distance, 8, 'Infinity must be rejected; distance remains 8');
      cm.setDistance(-Infinity);
      assert.equal(cm.distance, 8, '-Infinity must be rejected; distance remains 8');
      cm.setDistance(0.005);
      assert.equal(cm.distance, 8, 'Distance below 0.01 must be rejected; distance remains 8');

      // Reset to valid distance
      cm.setDistance(10);
      assert.equal(cm.distance, 10);
      cm.dispose();
    });

    test('Constructor boundary inputs sanitize to safe default (8)', () => {
      const { camera, controls } = createCameraControlsMocks();

      // Passing 0 sanitizes to safe default 8
      const cmZero = new CameraManager(camera, controls, 0);
      assert.equal(cmZero.distance, 8, 'Constructor must sanitize 0 to default 8');

      // Passing -5 sanitizes to safe default 8
      const cmNeg = new CameraManager(camera, controls, -5);
      assert.equal(cmNeg.distance, 8, 'Constructor must sanitize negative to default 8');

      // Passing NaN sanitizes to safe default 8
      const cmNaN = new CameraManager(camera, controls, NaN);
      assert.equal(cmNaN.distance, 8, 'Constructor must sanitize NaN to default 8');

      // Passing Infinity sanitizes to safe default 8
      const cmInf = new CameraManager(camera, controls, Infinity);
      assert.equal(cmInf.distance, 8, 'Constructor must sanitize Infinity to default 8');

      cmZero.dispose();
      cmNeg.dispose();
      cmNaN.dispose();
      cmInf.dispose();
    });

    test('Explicit d override in getPresetPosition(preset, d)', () => {
      const { camera, controls } = createCameraControlsMocks();
      const cm = new CameraManager(camera, controls, 8);

      // d = 0 produces origin for isometric/front/right
      const zeroIso = cm.getPresetPosition(CAMERA_PRESETS.ISOMETRIC, 0);
      assert.deepEqual({ x: zeroIso.x, y: zeroIso.y, z: zeroIso.z }, { x: 0, y: 0, z: 0 });

      // d = NaN produces NaNs
      const nanIso = cm.getPresetPosition(CAMERA_PRESETS.ISOMETRIC, NaN);
      assert.ok(Number.isNaN(nanIso.x));

      // d = -10 produces negative coordinates
      const negFront = cm.getPresetPosition(CAMERA_PRESETS.FRONT, -10);
      assert.equal(negFront.z, -15);

      cm.dispose();
    });
  });
});

describe('Challenger 1: Puzzle Registry & Metadata Empirical Stress Tests', () => {

  describe('2.1 Alias Normalization & Edge Cases', () => {
    test('Whitespace and trim normalization', () => {
      assert.equal(normalizePuzzleId('   3x3   '), 'cube-3x3');
      assert.equal(normalizePuzzleId('\t2x2\n'), 'cube-2x2');
      assert.equal(normalizePuzzleId('  pyraminx  '), 'pyraminx');
      assert.equal(normalizePuzzleId('   skewb   '), 'skewb');
    });

    test('Case insensitivity normalization', () => {
      assert.equal(normalizePuzzleId('Pyraminx'), 'pyraminx');
      assert.equal(normalizePuzzleId('MEGAMINX'), 'megaminx');
      assert.equal(normalizePuzzleId('SKEWB'), 'skewb');
      assert.equal(normalizePuzzleId('3X3'), 'cube-3x3');
      assert.equal(normalizePuzzleId('4X4'), 'cube-4x4');
    });

    test('Square-1 alias normalization: "SQ-1" and "sq-1" normalize to canonical "square-1"', () => {
      const result = normalizePuzzleId('SQ-1');
      assert.equal(result, 'square-1', '"SQ-1" must normalize to canonical ID "square-1"');
      assert.equal(normalizePuzzleId('sq-1'), 'square-1', '"sq-1" must normalize to canonical ID "square-1"');
      assert.equal(normalizePuzzleId('Sq-1'), 'square-1', '"Sq-1" must normalize to canonical ID "square-1"');

      // Consequently, getPuzzleMetadata succeeds on 'SQ-1':
      const meta = getPuzzleMetadata('SQ-1');
      assert.ok(meta, 'getPuzzleMetadata("SQ-1") must return metadata');
      assert.equal(meta.id, 'square-1');
      assert.equal(meta.shortName, 'Sq-1');
    });

    test('Unknown puzzle normalization', () => {
      const unknown = normalizePuzzleId('unknown-puzzle');
      assert.equal(unknown, 'unknown-puzzle');
      assert.equal(getPuzzleMetadata('unknown-puzzle'), null);
      assert.equal(puzzleRegistry.has('unknown-puzzle'), false);
      assert.equal(puzzleRegistry.get('unknown-puzzle'), null);
    });

    test('Malformed/non-string inputs to normalizePuzzleId', () => {
      assert.equal(normalizePuzzleId(null), 'cube-3x3', 'null should fallback to default 3x3');
      assert.equal(normalizePuzzleId(undefined), 'cube-3x3', 'undefined should fallback to default 3x3');
      assert.equal(normalizePuzzleId(123), 'cube-3x3', 'number should fallback to default 3x3');
      assert.equal(normalizePuzzleId({}), 'cube-3x3', 'object should fallback to default 3x3');
      assert.equal(normalizePuzzleId([]), 'cube-3x3', 'array should fallback to default 3x3');
      assert.equal(normalizePuzzleId(''), 'cube-3x3', 'empty string should fallback to default 3x3');
    });
  });

  describe('2.2 Difficulty Groupings & Tier Integrity', () => {
    test('Every official WCA puzzle belongs to EXACTLY ONE difficulty tier', () => {
      const grouped = getPuzzlesGroupedByDifficulty();
      const allMeta = getAllPuzzleMetadata();

      assert.equal(allMeta.length, 10, 'Must have exactly 10 WCA puzzles');

      // Tiers count verification
      assert.equal(grouped.beginner.length, 3, 'Beginner must have 3 puzzles');
      assert.equal(grouped.intermediate.length, 2, 'Intermediate must have 2 puzzles');
      assert.equal(grouped.advanced.length, 2, 'Advanced must have 2 puzzles');
      assert.equal(grouped.expert.length, 3, 'Expert must have 3 puzzles');

      const sumTiers = grouped.beginner.length + grouped.intermediate.length +
                        grouped.advanced.length + grouped.expert.length;
      assert.equal(sumTiers, 10, 'Sum of all tier items must be 10');

      // Verify mutual exclusivity (no duplicate memberships)
      const seenIds = new Set();
      const tiers = ['beginner', 'intermediate', 'advanced', 'expert'];
      for (const tier of tiers) {
        for (const puzzle of grouped[tier]) {
          assert.ok(!seenIds.has(puzzle.id), `Puzzle ${puzzle.id} is duplicated across tiers!`);
          seenIds.add(puzzle.id);
          assert.equal(puzzle.difficulty, tier, `Puzzle ${puzzle.id} has mismatched difficulty property`);
        }
      }

      assert.equal(seenIds.size, 10, 'All 10 puzzles must be uniquely partitioned');
    });

    test('Exact puzzle assignments per tier match UX guidelines', () => {
      const grouped = getPuzzlesGroupedByDifficulty();

      const beginnerIds = grouped.beginner.map(p => p.id).sort();
      assert.deepEqual(beginnerIds, ['cube-2x2', 'cube-3x3', 'pyraminx'].sort());

      const intermediateIds = grouped.intermediate.map(p => p.id).sort();
      assert.deepEqual(intermediateIds, ['cube-4x4', 'skewb'].sort());

      const advancedIds = grouped.advanced.map(p => p.id).sort();
      assert.deepEqual(advancedIds, ['cube-5x5', 'megaminx'].sort());

      const expertIds = grouped.expert.map(p => p.id).sort();
      assert.deepEqual(expertIds, ['cube-6x6', 'cube-7x7', 'square-1'].sort());
    });

    test('Difficulty tiers order and labels', () => {
      assert.equal(DIFFICULTY_TIERS.beginner.order, 1);
      assert.equal(DIFFICULTY_TIERS.beginner.label, 'Pemula');

      assert.equal(DIFFICULTY_TIERS.intermediate.order, 2);
      assert.equal(DIFFICULTY_TIERS.intermediate.label, 'Menengah');

      assert.equal(DIFFICULTY_TIERS.advanced.order, 3);
      assert.equal(DIFFICULTY_TIERS.advanced.label, 'Mahir');

      assert.equal(DIFFICULTY_TIERS.expert.order, 4);
      assert.equal(DIFFICULTY_TIERS.expert.label, 'Master');
    });
  });

  describe('2.3 Pub/Sub Subscription & Unsubscription Stress Testing', () => {
    test('Rapid subscribe and unsubscribe with 1,000 listeners', () => {
      const registry = new PuzzleRegistry();
      const unsubs = [];
      let notificationCount = 0;

      // Subscribe 1,000 listeners
      for (let i = 0; i < 1000; i++) {
        const unsub = registry.subscribe((evt) => {
          if (evt.type === 'registered') notificationCount++;
        });
        unsubs.push(unsub);
      }

      assert.equal(registry.listeners.size, 1000);

      // Trigger one event
      registry.register('mock-p1', { id: 'mock-p1', name: 'Mock 1' });
      assert.equal(notificationCount, 1000, 'All 1,000 listeners must be notified');

      // Unsubscribe all 1,000 listeners
      unsubs.forEach(unsub => unsub());
      assert.equal(registry.listeners.size, 0, 'Listeners set must be empty after unsubs');

      // Trigger another event
      registry.register('mock-p2', { id: 'mock-p2', name: 'Mock 2' });
      assert.equal(notificationCount, 1000, 'No listeners should be notified after unsubs');
    });

    test('Double unsubscribe safety', () => {
      const registry = new PuzzleRegistry();
      const unsub = registry.subscribe(() => {});
      assert.equal(registry.listeners.size, 1);

      assert.doesNotThrow(() => {
        unsub();
        unsub(); // Calling twice should be idempotent
      });
      assert.equal(registry.listeners.size, 0);
    });

    test('Self-unsubscribing listener inside notification callback', () => {
      const registry = new PuzzleRegistry();
      let callCount = 0;
      let unsub;

      unsub = registry.subscribe(() => {
        callCount++;
        unsub(); // Self-unsubscribe on first event
      });

      registry.register('mock-self-1', { id: 'mock-self-1' });
      assert.equal(callCount, 1);
      assert.equal(registry.listeners.size, 0);

      registry.register('mock-self-2', { id: 'mock-self-2' });
      assert.equal(callCount, 1, 'Self-unsubscribed listener must not receive subsequent events');
    });

    test('Listener throwing exception does not interrupt other listeners', () => {
      const registry = new PuzzleRegistry();
      let healthyNotified = false;

      // Bad listener that throws
      registry.subscribe(() => {
        throw new Error('Explosion in listener');
      });

      // Healthy listener
      registry.subscribe((evt) => {
        if (evt.type === 'registered') healthyNotified = true;
      });

      // Suppress console.error during test
      const origError = console.error;
      console.error = () => {};
      try {
        assert.doesNotThrow(() => {
          registry.register('mock-healthy', { id: 'mock-healthy' });
        });
        assert.equal(healthyNotified, true, 'Healthy listener must still execute even if prior listener threw');
      } finally {
        console.error = origError;
      }
    });

    test('Non-function passed to subscribe (stress boundary)', () => {
      const registry = new PuzzleRegistry();
      registry.subscribe(null);
      registry.subscribe(123);

      const origError = console.error;
      console.error = () => {};
      try {
        // _notify has a try/catch, so non-function throws TypeError caught internally
        assert.doesNotThrow(() => {
          registry.register('mock-non-fn', { id: 'mock-non-fn' });
        });
      } finally {
        console.error = origError;
      }
    });
  });
});
