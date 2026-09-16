/**
 * Universal Rubik & Twisty Puzzle Solver 3D - Camera Manager
 * Location: src/engine/CameraManager.js
 * 
 * Provides camera preset positioning, smooth cubic ease-out interpolation,
 * gimbal-lock singularity protection on top view, and OrbitControls synchronization.
 */

import * as THREE from 'three';

export const CAMERA_PRESETS = Object.freeze({
  ISOMETRIC: 'isometric',
  FRONT: 'front',
  TOP: 'top',
  RIGHT: 'right'
});

export class CameraManager {
  /**
   * @param {THREE.PerspectiveCamera} camera - Active Three.js perspective camera
   * @param {Object} controls - Active OrbitControls instance
   * @param {number} [defaultDistance=8] - Base distance unit for bounding box framing
   */
  constructor(camera, controls, defaultDistance = 8) {
    this.camera = camera;
    this.controls = controls;
    this.distance = (Number.isFinite(defaultDistance) && defaultDistance >= 0.01) ? defaultDistance : 8;
    this.animId = null;
    this.isAnimating = false;

    // Bound listener to cancel animation on user manual interaction
    this._onUserInteraction = this._onUserInteraction.bind(this);
    if (this.controls && typeof this.controls.addEventListener === 'function') {
      this.controls.addEventListener('start', this._onUserInteraction);
    }
  }

  /**
   * Updates base framing distance when switching puzzles.
   * @param {number} distance
   */
  setDistance(distance) {
    if (Number.isFinite(distance) && distance >= 0.01) {
      this.distance = distance;
    }
  }

  /**
   * Computes target coordinates for a given preset.
   * @param {string} presetName
   * @param {number} [d] - Optional distance override
   * @returns {THREE.Vector3}
   */
  getPresetPosition(presetName, d = this.distance) {
    const key = String(presetName || '').toLowerCase().trim();
    switch (key) {
      case 'front':
        return new THREE.Vector3(0, 0, d * 1.5);
      case 'top':
        // Tiny 0.001 Z offset prevents collinear up-vector gimbal lock with (0, 1, 0)
        return new THREE.Vector3(0, d * 1.5, 0.001);
      case 'right':
        return new THREE.Vector3(d * 1.5, 0, 0);
      case 'isometric':
      default:
        return new THREE.Vector3(d, d, d);
    }
  }

  /**
   * Resets camera to preset position.
   * @param {string} [presetName='isometric']
   * @param {Object} [options]
   * @param {boolean} [options.animate=true]
   * @param {number} [options.duration=400] - Duration in ms
   * @param {() => void} [options.onComplete]
   */
  resetCamera(presetName = 'isometric', options = {}) {
    const {
      animate = true,
      duration = 400,
      onComplete
    } = options || {};

    this.cancelAnimation();

    if (!this.camera || !this.controls) return;

    const targetPos = this.getPresetPosition(presetName);
    const targetLookAt = new THREE.Vector3(0, 0, 0);

    if (!animate || duration <= 0 || typeof requestAnimationFrame === 'undefined') {
      if (this.camera.position && typeof this.camera.position.copy === 'function') {
        this.camera.position.copy(targetPos);
      }
      if (this.controls.target && typeof this.controls.target.copy === 'function') {
        this.controls.target.copy(targetLookAt);
      }
      if (typeof this.camera.lookAt === 'function') {
        this.camera.lookAt(targetLookAt);
      }
      if (typeof this.controls.update === 'function') {
        this.controls.update();
      }
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    const startPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const startTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    this.isAnimating = true;

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Cubic ease-out: 1 - (1 - t)^3
      const ease = 1 - Math.pow(1 - progress, 3);

      this.camera.position.lerpVectors(startPos, targetPos, ease);
      this.controls.target.lerpVectors(startTarget, targetLookAt, ease);
      this.controls.update();

      if (progress < 1) {
        this.animId = requestAnimationFrame(step);
      } else {
        this.camera.position.copy(targetPos);
        this.controls.target.copy(targetLookAt);
        this.controls.update();
        this.isAnimating = false;
        this.animId = null;
        if (typeof onComplete === 'function') onComplete();
      }
    };

    this.animId = requestAnimationFrame(step);
  }

  /**
   * Cancels in-flight camera transition.
   */
  cancelAnimation() {
    if (this.animId !== null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.isAnimating = false;
  }

  _onUserInteraction() {
    this.cancelAnimation();
  }

  /**
   * Cleans up event listeners and animation frames.
   */
  dispose() {
    this.cancelAnimation();
    if (this.controls && typeof this.controls.removeEventListener === 'function') {
      this.controls.removeEventListener('start', this._onUserInteraction);
    }
    this.camera = null;
    this.controls = null;
  }
}
