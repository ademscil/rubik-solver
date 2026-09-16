/**
 * Automated Unit Tests for CameraManager (Feature F04)
 * Location: tests/unit/cameraManager.test.js
 * Runner: node --test
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { CameraManager, CAMERA_PRESETS } from '../../src/engine/CameraManager.js';

describe('Feature F04 - CameraManager Mathematical Specifications & Controls', () => {
  // Mock camera and controls for headless Node environment
  function createMocks() {
    const mockCamera = {
      position: {
        x: 0,
        y: 0,
        z: 0,
        set(x, y, z) { this.x = x; this.y = y; this.z = z; },
        copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; },
        clone() { return { x: this.x, y: this.y, z: this.z }; }
      },
      lookAt(_target) {}
    };

    const mockControls = {
      target: {
        x: 0,
        y: 0,
        z: 0,
        set(x, y, z) { this.x = x; this.y = y; this.z = z; },
        copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; },
        clone() { return { x: this.x, y: this.y, z: this.z }; }
      },
      updated: false,
      update() { this.updated = true; },
      listeners: {},
      addEventListener(type, fn) {
        this.listeners[type] = fn;
      },
      removeEventListener(type, fn) {
        if (this.listeners[type] === fn) delete this.listeners[type];
      }
    };

    return { mockCamera, mockControls };
  }

  test('Preset Coordinates with d=8', () => {
    const { mockCamera, mockControls } = createMocks();
    const cm = new CameraManager(mockCamera, mockControls, 8);

    const iso = cm.getPresetPosition(CAMERA_PRESETS.ISOMETRIC);
    assert.equal(iso.x, 8);
    assert.equal(iso.y, 8);
    assert.equal(iso.z, 8);

    const front = cm.getPresetPosition(CAMERA_PRESETS.FRONT);
    assert.equal(front.x, 0);
    assert.equal(front.y, 0);
    assert.equal(front.z, 12); // 8 * 1.5

    const top = cm.getPresetPosition(CAMERA_PRESETS.TOP);
    assert.equal(top.x, 0);
    assert.equal(top.y, 12);   // 8 * 1.5
    assert.equal(top.z, 0.001); // Singularity offset to avoid gimbal lock with up vector (0, 1, 0)

    const right = cm.getPresetPosition(CAMERA_PRESETS.RIGHT);
    assert.equal(right.x, 12); // 8 * 1.5
    assert.equal(right.y, 0);
    assert.equal(right.z, 0);
  });

  test('Default fallback for unknown preset', () => {
    const { mockCamera, mockControls } = createMocks();
    const cm = new CameraManager(mockCamera, mockControls, 6);
    const fallback = cm.getPresetPosition('non-existent');
    assert.equal(fallback.x, 6);
    assert.equal(fallback.y, 6);
    assert.equal(fallback.z, 6);
  });

  test('Dynamic distance adjustment via setDistance', () => {
    const { mockCamera, mockControls } = createMocks();
    const cm = new CameraManager(mockCamera, mockControls, 7);
    cm.setDistance(10);
    const front = cm.getPresetPosition(CAMERA_PRESETS.FRONT);
    assert.equal(front.z, 15); // 10 * 1.5

    const iso = cm.getPresetPosition(CAMERA_PRESETS.ISOMETRIC);
    assert.equal(iso.x, 10);
  });

  test('Synchronous resetCamera without animation copies positions and updates controls', () => {
    const { mockCamera, mockControls } = createMocks();
    const cm = new CameraManager(mockCamera, mockControls, 8);

    let completed = false;
    cm.resetCamera(CAMERA_PRESETS.FRONT, {
      animate: false,
      onComplete: () => { completed = true; }
    });

    assert.equal(mockCamera.position.z, 12);
    assert.equal(mockControls.target.x, 0);
    assert.equal(mockControls.target.y, 0);
    assert.equal(mockControls.target.z, 0);
    assert.equal(mockControls.updated, true);
    assert.equal(completed, true);
  });

  test('Cancel animation and dispose cleans up listeners cleanly', () => {
    const { mockCamera, mockControls } = createMocks();
    const cm = new CameraManager(mockCamera, mockControls, 8);

    assert.ok(mockControls.listeners['start'], 'Listener for user interaction should be registered');
    cm.dispose();
    assert.equal(mockControls.listeners['start'], undefined, 'Listener should be removed on dispose');
  });

  test('Safe handling of non-string and malformed preset names', () => {
    const { mockCamera, mockControls } = createMocks();
    const cm = new CameraManager(mockCamera, mockControls, 8);

    const testCases = [123, true, false, {}, [], Symbol('test'), null, undefined, ''];
    for (const tc of testCases) {
      const pos = cm.getPresetPosition(tc);
      assert.equal(pos.x, 8);
      assert.equal(pos.y, 8);
      assert.equal(pos.z, 8);
    }
    cm.dispose();
  });

  test('Boundary distance validation in constructor and setDistance', () => {
    const { mockCamera, mockControls } = createMocks();

    // Constructor rejects non-finite or < 0.01 and falls back to 8
    assert.equal(new CameraManager(mockCamera, mockControls, 0).distance, 8);
    assert.equal(new CameraManager(mockCamera, mockControls, -1).distance, 8);
    assert.equal(new CameraManager(mockCamera, mockControls, NaN).distance, 8);
    assert.equal(new CameraManager(mockCamera, mockControls, Infinity).distance, 8);
    assert.equal(new CameraManager(mockCamera, mockControls, 10).distance, 10);

    // setDistance rejects non-finite or < 0.01
    const cm = new CameraManager(mockCamera, mockControls, 8);
    cm.setDistance(Infinity);
    assert.equal(cm.distance, 8);
    cm.setDistance(-Infinity);
    assert.equal(cm.distance, 8);
    cm.setDistance(0);
    assert.equal(cm.distance, 8);
    cm.setDistance(-5);
    assert.equal(cm.distance, 8);
    cm.setDistance(NaN);
    assert.equal(cm.distance, 8);
    cm.setDistance(0.009);
    assert.equal(cm.distance, 8);
    cm.setDistance(12);
    assert.equal(cm.distance, 12);
    cm.dispose();
  });

  test('resetCamera handles null options safely without throwing', () => {
    const { mockCamera, mockControls } = createMocks();
    const cm = new CameraManager(mockCamera, mockControls, 8);

    assert.doesNotThrow(() => {
      cm.resetCamera(CAMERA_PRESETS.ISOMETRIC, null);
    });
    cm.dispose();
  });
});

