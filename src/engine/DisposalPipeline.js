/**
 * src/engine/DisposalPipeline.js
 * Universal Rubik & Twisty Puzzle 3D Platform
 * 
 * Cascading WebGL resource disposal pipeline.
 * Recursively disposes geometries, materials (single and multi-material arrays),
 * textures, shadow maps, render lists, and renderers with zero GPU memory leaks.
 */

// Comprehensive list of Three.js texture property slots on materials
const TEXTURE_SLOTS = Object.freeze([
  'map',
  'alphaMap',
  'aoMap',
  'bumpMap',
  'displacementMap',
  'emissiveMap',
  'envMap',
  'lightMap',
  'metalnessMap',
  'normalMap',
  'roughnessMap',
  'specularMap',
  'clearcoatMap',
  'clearcoatNormalMap',
  'clearcoatRoughnessMap',
  'sheenColorMap',
  'sheenRoughnessMap',
  'transmissionMap',
  'thicknessMap',
]);

/**
 * Disposes a single THREE.BufferGeometry safely.
 * 
 * @param {import('three').BufferGeometry} geometry
 * @returns {boolean} True if disposed
 */
export function disposeGeometry(geometry) {
  if (geometry && typeof geometry.dispose === 'function') {
    geometry.dispose();
    return true;
  }
  return false;
}

/**
 * Disposes a single material and its associated non-shared textures.
 * 
 * @param {import('three').Material} material
 * @param {Object} [options]
 * @param {boolean} [options.disposeSharedTextures=false]
 * @param {boolean} [options.disposeSharedMaterials=false]
 * @param {Set} [visitedTextures]
 * @returns {{ materialsDisposed: number, texturesDisposed: number }}
 */
export function disposeMaterial(material, options = {}, visitedTextures = new Set()) {
  const result = { materialsDisposed: 0, texturesDisposed: 0 };
  if (!material || typeof material.dispose !== 'function') return result;

  const isSharedMat = Boolean(material.userData && material.userData.isShared);
  const allowMatDispose = !isSharedMat || options.disposeSharedMaterials === true;

  // 1. Dispose attached texture maps
  for (let i = 0; i < TEXTURE_SLOTS.length; i++) {
    const slot = TEXTURE_SLOTS[i];
    const texture = material[slot];

    if (texture && typeof texture.dispose === 'function' && !visitedTextures.has(texture)) {
      visitedTextures.add(texture);
      const isSharedTex = Boolean(texture.userData && texture.userData.isShared);

      if (!isSharedTex || options.disposeSharedTextures === true) {
        texture.dispose();
        result.texturesDisposed++;
      }
    }
  }

  // 2. Dispose material itself
  if (allowMatDispose) {
    material.dispose();
    result.materialsDisposed++;
  }

  return result;
}

/**
 * Recursively traverses an Object3D hierarchy and disposes all geometries,
 * materials, and unshared textures.
 * 
 * @param {import('three').Object3D} root - Target Object3D root (Mesh, Group, Model)
 * @param {Object} [options]
 * @param {boolean} [options.disposeGeometries=true]
 * @param {boolean} [options.disposeMaterials=true]
 * @param {boolean} [options.disposeSharedTextures=false]
 * @param {boolean} [options.disposeSharedMaterials=false]
 * @param {boolean} [options.removeFromParent=true]
 * @returns {{ geometriesDisposed: number, materialsDisposed: number, texturesDisposed: number, objectsProcessed: number }}
 */
export function disposeHierarchy(root, options = {}) {
  const stats = {
    geometriesDisposed: 0,
    materialsDisposed: 0,
    texturesDisposed: 0,
    objectsProcessed: 0,
  };

  if (!root || typeof root.traverse !== 'function') {
    return stats;
  }

  const visitedGeometries = new Set();
  const visitedMaterials = new Set();
  const visitedTextures = new Set();

  root.traverse((obj) => {
    stats.objectsProcessed++;

    // 1. Geometry Disposal
    if (options.disposeGeometries !== false && obj.geometry) {
      if (!visitedGeometries.has(obj.geometry)) {
        visitedGeometries.add(obj.geometry);
        if (disposeGeometry(obj.geometry)) {
          stats.geometriesDisposed++;
        }
      }
    }

    // 2. Material Disposal (Single or Array Material)
    if (options.disposeMaterials !== false && obj.material) {
      const matList = Array.isArray(obj.material) ? obj.material : [obj.material];

      matList.forEach((mat) => {
        if (mat && !visitedMaterials.has(mat)) {
          visitedMaterials.add(mat);
          const r = disposeMaterial(mat, options, visitedTextures);
          stats.materialsDisposed += r.materialsDisposed;
          stats.texturesDisposed += r.texturesDisposed;
        }
      });
    }

    // 3. Shadow Map Disposal on lights attached to hierarchy
    if (obj.isLight && obj.shadow && obj.shadow.map) {
      obj.shadow.map.dispose();
      obj.shadow.map = null;
    }
  });

  // 4. Remove all children
  while (root.children && root.children.length > 0) {
    const child = root.children[0];
    root.remove(child);
  }

  // 5. Detach root from its parent
  if (options.removeFromParent !== false && root.parent) {
    root.parent.remove(root);
  }

  return stats;
}

/**
 * Completely cleans up a Three.js scene, its lights, background, environment,
 * and optionally disposes the WebGLRenderer.
 * 
 * @param {import('three').Scene} scene
 * @param {import('three').WebGLRenderer} [renderer]
 * @param {Object} [options]
 * @param {boolean} [options.forceContextLoss=false]
 * @param {boolean} [options.removeDomElement=true]
 * @param {boolean} [options.disposeSharedTextures=false]
 * @returns {Object} Disposal summary stats
 */
export function disposeScene(scene, renderer = null, options = {}) {
  const stats = {
    hierarchy: { geometriesDisposed: 0, materialsDisposed: 0, texturesDisposed: 0, objectsProcessed: 0 },
    rendererDisposed: false,
    contextLost: false,
  };

  if (!scene) return stats;

  // 1. Dispose scene background texture if present
  if (scene.background) {
    if (scene.background.isTexture && (!scene.background.userData?.isShared || options.disposeSharedTextures)) {
      scene.background.dispose();
    }
    scene.background = null;
  }

  // 2. Dispose scene environment texture if present
  if (scene.environment) {
    if (scene.environment.isTexture && (!scene.environment.userData?.isShared || options.disposeSharedTextures)) {
      scene.environment.dispose();
    }
    scene.environment = null;
  }

  // 3. Dispose all hierarchy objects in scene
  stats.hierarchy = disposeHierarchy(scene, {
    ...options,
    removeFromParent: false,
  });

  // 4. Dispose WebGLRenderer if provided
  if (renderer && typeof renderer.dispose === 'function') {
    renderer.dispose();
    stats.rendererDisposed = true;

    // Dispose internal render lists
    if (renderer.renderLists && typeof renderer.renderLists.dispose === 'function') {
      renderer.renderLists.dispose();
    }

    // Remove DOM element from container
    if (options.removeDomElement !== false && renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }

    // Force context loss if requested
    if (options.forceContextLoss && typeof renderer.forceContextLoss === 'function') {
      renderer.forceContextLoss();
      stats.contextLost = true;
    }
  }

  return stats;
}

/**
 * Universal teardown helper for React component unmount (useEffect return function).
 * Cancels animation loops, removes window event listeners, disposes controls,
 * and clears the WebGL scene and renderer.
 * 
 * @param {Object} params
 * @param {import('three').Scene} params.scene
 * @param {import('three').WebGLRenderer} params.renderer
 * @param {Object} [params.controls] - OrbitControls instance
 * @param {number} [params.animId] - requestAnimationFrame ID
 * @param {Function} [params.resizeHandler] - Window resize listener callback
 * @param {Object} [params.options]
 */
export function teardownViewer({
  scene,
  renderer,
  controls,
  animId,
  resizeHandler,
  options = {},
}) {
  // 1. Cancel active animation frame
  if (animId && typeof cancelAnimationFrame === 'function') {
    cancelAnimationFrame(animId);
  }

  // 2. Remove window event listeners
  if (resizeHandler && typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
    window.removeEventListener('resize', resizeHandler);
  }

  // 3. Dispose camera controls
  if (controls && typeof controls.dispose === 'function') {
    controls.dispose();
  }

  // 4. Dispose scene & renderer
  if (scene) {
    disposeScene(scene, renderer, {
      forceContextLoss: options.forceContextLoss ?? false,
      removeDomElement: options.removeDomElement ?? true,
      disposeSharedTextures: options.disposeSharedTextures ?? false,
    });
  }
}
