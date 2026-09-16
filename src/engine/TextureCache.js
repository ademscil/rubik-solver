/**
 * src/engine/TextureCache.js
 * Universal Rubik & Twisty Puzzle 3D Platform
 * 
 * High-performance Singleton Canvas Texture & Material Cache.
 * Produces crisp, high-DPI photorealistic vinyl stickers with rounded borders,
 * glossy linear sheens, and zero redundant GPU allocations.
 */

import * as THREE from 'three';

// ---------------------------------------------------------------------------
// 1. Color Dictionaries & Standards
// ---------------------------------------------------------------------------

export const STICKER_COLORS = Object.freeze({
  WHITE: '#FFFFFF',
  YELLOW: '#FFD500',
  GREEN: '#009B48',
  BLUE: '#0046AD',
  RED: '#B71234',
  ORANGE: '#FF5800',
  CORE: '#121215',
});

export const MEGAMINX_COLORS = Object.freeze({
  WHITE: '#FFFFFF',      // Face 1 (Top / U)
  RED: '#B71234',        // Face 2 (F)
  DARK_BLUE: '#0046AD',  // Face 3 (BL)
  YELLOW: '#FFD500',     // Face 4 (BR)
  DARK_GREEN: '#009B48', // Face 5 (FL)
  PURPLE: '#7B1FA2',     // Face 6 (FR)
  GREY: '#9E9E9E',       // Face 7 (Down / D)
  PINK: '#FF80AB',       // Face 8 (Opposite FR)
  LIGHT_BLUE: '#40C4FF', // Face 9 (Opposite FL)
  ORANGE: '#FF5800',     // Face 10 (Opposite BR)
  LIGHT_GREEN: '#76FF03',// Face 11 (Opposite BL)
  CREAM: '#FFF9C4',      // Face 12 (Opposite F)
});

export const HIGHLIGHT_COLORS = Object.freeze({
  CYAN: '#38BDF8',
  AMBER: '#F59E0B',
  EMERALD: '#10B981',
  CRIMSON: '#EF4444',
});

export const DEFAULT_STICKER_OPTIONS = Object.freeze({
  size: 256,
  shape: 'square', // 'square' | 'triangle' | 'pentagon' | 'diamond'
  isHighlighted: false,
  highlightColor: HIGHLIGHT_COLORS.CYAN,
  plasticColor: '#121215',
  padRatio: 0.055,      // ~14px on 256px
  radiusRatio: 0.12,    // ~28px corner radius
  showGloss: true,
  showInnerBorder: true,
});

// ---------------------------------------------------------------------------
// 2. Cache Registries (Singleton Instances)
// ---------------------------------------------------------------------------

const textureCache = new Map();
const materialCache = new Map();

// ---------------------------------------------------------------------------
// 3. Helper Utilities: Color Normalization & Cache Key Generation
// ---------------------------------------------------------------------------

/**
 * Normalizes any hex string into standard 6-character uppercase format (#RRGGBB).
 * Fallback to #FFFFFF for invalid inputs.
 */
export function normalizeHexColor(hex) {
  if (typeof hex !== 'string') return '#FFFFFF';
  let clean = hex.trim().replace(/^#/, '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) {
    return '#FFFFFF';
  }
  return `#${clean.toUpperCase()}`;
}

/**
 * Computes a unique deterministic cache key for texture parameters.
 */
function buildTextureCacheKey(color, options) {
  const normColor = normalizeHexColor(color);
  const size = options.size || DEFAULT_STICKER_OPTIONS.size;
  const shape = options.shape || DEFAULT_STICKER_OPTIONS.shape;
  const hl = options.isHighlighted ? `hl:${normalizeHexColor(options.highlightColor || DEFAULT_STICKER_OPTIONS.highlightColor)}` : 'hl:0';
  const plastic = normalizeHexColor(options.plasticColor || DEFAULT_STICKER_OPTIONS.plasticColor);
  return `${normColor}_${shape}_s${size}_${hl}_p${plastic}`;
}

// ---------------------------------------------------------------------------
// 4. Canvas Drawing Routines (Cross-Platform / Cross-Engine Safe)
// ---------------------------------------------------------------------------

/**
 * Cross-environment rounded rectangle path helper.
 * Uses native ctx.roundRect when available, with bezier fallback.
 */
function drawRoundedRectPath(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Draws regular polygon path with rounded vertices.
 */
function drawRoundedPolygonPath(ctx, centerX, centerY, radius, sides, cornerRadius) {
  const angleStep = (Math.PI * 2) / sides;
  const startAngle = -Math.PI / 2;
  const points = [];

  for (let i = 0; i < sides; i++) {
    const a = startAngle + i * angleStep;
    points.push({
      x: centerX + radius * Math.cos(a),
      y: centerY + radius * Math.sin(a),
    });
  }

  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % sides];
    const p0 = points[(i + sides - 1) % sides];

    // Direction vectors
    const vPrev = { x: p0.x - p1.x, y: p0.y - p1.y };
    const vNext = { x: p2.x - p1.x, y: p2.y - p1.y };
    const lenPrev = Math.hypot(vPrev.x, vPrev.y);
    const lenNext = Math.hypot(vNext.x, vNext.y);

    const cDist = Math.min(cornerRadius, lenPrev * 0.35, lenNext * 0.35);
    const startX = p1.x + (vPrev.x / lenPrev) * cDist;
    const startY = p1.y + (vPrev.y / lenPrev) * cDist;
    const endX = p1.x + (vNext.x / lenNext) * cDist;
    const endY = p1.y + (vNext.y / lenNext) * cDist;

    if (i === 0) {
      ctx.moveTo(startX, startY);
    } else {
      ctx.lineTo(startX, startY);
    }
    ctx.quadraticCurveTo(p1.x, p1.y, endX, endY);
  }
  ctx.closePath();
}

/**
 * Creates and renders the sticker canvas using 2D rendering pipeline.
 */
function renderStickerCanvas(normColor, opts) {
  const size = opts.size || DEFAULT_STICKER_OPTIONS.size;
  let canvas;

  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    canvas = document.createElement('canvas');
  } else if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(size, size);
  } else {
    // Fallback for Node test environments without canvas
    return null;
  }

  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 1. Fill outer plastic body
  ctx.fillStyle = opts.plasticColor || DEFAULT_STICKER_OPTIONS.plasticColor;
  ctx.fillRect(0, 0, size, size);

  // 2. Geometry calculations
  const pad = Math.round(size * (opts.padRatio ?? DEFAULT_STICKER_OPTIONS.padRatio));
  const innerSize = size - 2 * pad;
  const radius = Math.round(innerSize * (opts.radiusRatio ?? DEFAULT_STICKER_OPTIONS.radiusRatio));
  const center = size / 2;

  // 3. Shape selection and path creation
  const shape = opts.shape || DEFAULT_STICKER_OPTIONS.shape;
  if (shape === 'triangle') {
    drawRoundedPolygonPath(ctx, center, center + pad * 0.4, (innerSize / 2) * 1.05, 3, radius * 0.8);
  } else if (shape === 'pentagon') {
    drawRoundedPolygonPath(ctx, center, center, innerSize / 2, 5, radius * 0.6);
  } else if (shape === 'diamond') {
    drawRoundedPolygonPath(ctx, center, center, innerSize / 2, 4, radius * 0.6);
  } else {
    // Standard 'square'
    drawRoundedRectPath(ctx, pad, pad, innerSize, innerSize, radius);
  }

  // 4. Fill base color
  ctx.fillStyle = normColor;
  ctx.fill();

  // 5. Apply subtle photorealistic gloss sheen
  if (opts.showGloss !== false) {
    const gloss = ctx.createLinearGradient(pad, pad, pad + innerSize, pad + innerSize);
    gloss.addColorStop(0.0, 'rgba(255, 255, 255, 0.28)');
    gloss.addColorStop(0.35, 'rgba(255, 255, 255, 0.08)');
    gloss.addColorStop(0.65, 'rgba(0, 0, 0, 0.02)');
    gloss.addColorStop(1.0, 'rgba(0, 0, 0, 0.22)');
    ctx.fillStyle = gloss;
    ctx.fill();
  }

  // 6. Apply inner emboss border (vinyl thickness)
  if (opts.showInnerBorder !== false) {
    const strokeGrad = ctx.createLinearGradient(pad, pad, pad + innerSize, pad + innerSize);
    strokeGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.35)');
    strokeGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.35)');
    ctx.lineWidth = Math.max(1, Math.round(size * 0.008));
    ctx.strokeStyle = strokeGrad;
    ctx.stroke();
  }

  // 7. Active focus / highlight glow ring
  if (opts.isHighlighted) {
    const hlColor = opts.highlightColor || DEFAULT_STICKER_OPTIONS.highlightColor;
    ctx.lineWidth = Math.max(3, Math.round(size * 0.04));
    ctx.strokeStyle = hlColor;
    ctx.shadowColor = hlColor;
    ctx.shadowBlur = Math.round(size * 0.05);
    ctx.stroke();
    // Reset shadow state
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  return canvas;
}

// ---------------------------------------------------------------------------
// 5. Public API: Texture & Material Providers
// ---------------------------------------------------------------------------

/**
 * Returns a shared, cached THREE.CanvasTexture for the specified color and options.
 * If an identical texture already exists, returns the cached instance immediately.
 * 
 * @param {string} hexColor - Color hex string (e.g. '#FFFFFF', '#009B48')
 * @param {Object} [options] - Custom sticker options
 * @returns {THREE.Texture}
 */
export function getStickerTexture(hexColor, options = {}) {
  const normColor = normalizeHexColor(hexColor);
  const opts = { ...DEFAULT_STICKER_OPTIONS, ...options };
  const cacheKey = buildTextureCacheKey(normColor, opts);

  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey);
  }

  const canvas = renderStickerCanvas(normColor, opts);

  // If running in headless environment without canvas, return mock texture
  if (!canvas) {
    const mockTexture = new THREE.Texture();
    mockTexture.name = `mock_${cacheKey}`;
    mockTexture.userData = { isShared: true, cacheKey };
    textureCache.set(cacheKey, mockTexture);
    return mockTexture;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 4;
  texture.name = `sticker_${cacheKey}`;
  texture.userData = {
    isShared: true,
    cacheKey,
    createdAt: Date.now(),
  };
  texture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Returns a shared THREE.MeshStandardMaterial using the cached sticker texture.
 * Reusing materials reduces WebGL draw calls and GPU state changes.
 * 
 * @param {string} hexColor
 * @param {Object} [stickerOptions]
 * @param {Object} [materialOptions]
 * @returns {THREE.MeshStandardMaterial}
 */
export function getStickerMaterial(hexColor, stickerOptions = {}, materialOptions = {}) {
  const texture = getStickerTexture(hexColor, stickerOptions);
  const roughness = materialOptions.roughness ?? 0.3;
  const metalness = materialOptions.metalness ?? 0.1;
  const matKey = `mat_${texture.userData.cacheKey}_r${roughness}_m${metalness}`;

  if (materialCache.has(matKey)) {
    return materialCache.get(matKey);
  }

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness,
    metalness,
    ...materialOptions,
  });
  material.name = matKey;
  material.userData = { isShared: true, cacheKey: matKey };

  materialCache.set(matKey, material);
  return material;
}

/**
 * Returns a shared material for internal unstickered plastic faces (black body).
 * 
 * @param {string} [coreHex]
 * @returns {THREE.MeshStandardMaterial}
 */
export function getInternalCoreMaterial(coreHex = STICKER_COLORS.CORE) {
  const key = `core_${normalizeHexColor(coreHex)}`;
  if (materialCache.has(key)) {
    return materialCache.get(key);
  }
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(coreHex),
    roughness: 0.6,
    metalness: 0.05,
  });
  mat.name = key;
  mat.userData = { isShared: true, cacheKey: key };
  materialCache.set(key, mat);
  return mat;
}

/**
 * Pre-allocates and warms up standard textures for all 6 WCA and 12 Megaminx colors.
 * Prevents frame drops during initial rendering and puzzle transitions.
 */
export function preloadStandardTextures() {
  // Preload standard 6 colors
  Object.values(STICKER_COLORS).forEach(c => getStickerTexture(c));
  // Preload Megaminx colors
  Object.values(MEGAMINX_COLORS).forEach(c => getStickerTexture(c));
  // Preload Megaminx pentagonal shapes
  Object.values(MEGAMINX_COLORS).forEach(c => getStickerTexture(c, { shape: 'pentagon' }));
}

/**
 * Disposes all cached textures and materials, releasing all GPU memory and DOM canvases.
 * 
 * @returns {{ disposedTextures: number, disposedMaterials: number }}
 */
export function disposeTextureCache() {
  let disposedTextures = 0;
  let disposedMaterials = 0;

  // 1. Dispose materials
  materialCache.forEach((mat) => {
    if (mat && typeof mat.dispose === 'function') {
      mat.dispose();
      disposedMaterials++;
    }
  });
  materialCache.clear();

  // 2. Dispose textures
  textureCache.forEach((tex) => {
    if (tex && typeof tex.dispose === 'function') {
      tex.dispose();
      if (tex.image) {
        if (typeof tex.image.width !== 'undefined') tex.image.width = 0;
        if (typeof tex.image.height !== 'undefined') tex.image.height = 0;
        tex.image = null;
      }
      disposedTextures++;
    }
  });
  textureCache.clear();

  return { disposedTextures, disposedMaterials };
}

/**
 * Telemetry and audit query returning cache utilization metrics.
 */
export function getTextureCacheStats() {
  return {
    textureCount: textureCache.size,
    materialCount: materialCache.size,
    textureKeys: Array.from(textureCache.keys()),
    materialKeys: Array.from(materialCache.keys()),
  };
}
