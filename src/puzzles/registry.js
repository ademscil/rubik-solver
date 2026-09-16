/**
 * Universal Puzzle Registry
 * Location: src/puzzles/registry.js
 * 
 * Central registry indexing all 10 official WCA puzzles.
 * Safe to import in headless Node environments without DOM or WebGL.
 */

/**
 * 4 Difficulty tiers dictionary
 * @type {Record<import('./types.js').PuzzleDifficulty, { id: import('./types.js').PuzzleDifficulty, label: string, order: number }>}
 */
export const DIFFICULTY_TIERS = Object.freeze({
  beginner: { id: 'beginner', label: 'Pemula', order: 1 },
  intermediate: { id: 'intermediate', label: 'Menengah', order: 2 },
  advanced: { id: 'advanced', label: 'Mahir', order: 3 },
  expert: { id: 'expert', label: 'Master', order: 4 }
});

/**
 * Static metadata catalog for all 10 official WCA puzzles.
 * Safe to import in headless Node environments without Three.js or DOM.
 * @type {Record<string, import('./types.js').PuzzleMetadata>}
 */
export const WCA_PUZZLE_METADATA = {
  'cube-2x2': {
    id: 'cube-2x2',
    wcaId: '222',
    name: "Rubik's Cube 2x2 (Pocket)",
    shortName: '2x2',
    category: 'nxn',
    difficulty: 'beginner',
    difficultyLabel: 'Pemula',
    order: 2,
    faceCount: 6,
    defaultCameraDistance: 6.5,
    minCameraDistance: 4.0,
    maxCameraDistance: 15.0,
    description: 'Kubus saku 2x2x2 dengan 8 sudut tanpa center atau edge.',
    hasParity: false,
    loaded: false
  },
  'cube-3x3': {
    id: 'cube-3x3',
    wcaId: '333',
    name: "Rubik's Cube 3x3 (Standard)",
    shortName: '3x3',
    category: 'nxn',
    difficulty: 'beginner',
    difficultyLabel: 'Pemula',
    order: 3,
    faceCount: 6,
    defaultCameraDistance: 8.0,
    minCameraDistance: 5.0,
    maxCameraDistance: 20.0,
    description: "Kubus standar Erno Rubik dengan metode populer CFOP dan LBL.",
    hasParity: false,
    loaded: false
  },
  'cube-4x4': {
    id: 'cube-4x4',
    wcaId: '444',
    name: "Rubik's Revenge 4x4",
    shortName: '4x4',
    category: 'nxn',
    difficulty: 'intermediate',
    difficultyLabel: 'Menengah',
    order: 4,
    faceCount: 6,
    defaultCameraDistance: 9.5,
    minCameraDistance: 6.0,
    maxCameraDistance: 22.0,
    description: 'Kubus 4x4x4 dengan center bergerak dan tantangan OLL/PLL Parity.',
    hasParity: true,
    loaded: false
  },
  'cube-5x5': {
    id: 'cube-5x5',
    wcaId: '555',
    name: "Professor's Cube 5x5",
    shortName: '5x5',
    category: 'nxn',
    difficulty: 'advanced',
    difficultyLabel: 'Mahir',
    order: 5,
    faceCount: 6,
    defaultCameraDistance: 11.0,
    minCameraDistance: 7.0,
    maxCameraDistance: 25.0,
    description: "Kubus 5x5x5 dengan 98 potongan luar diselesaikan via Metode Reduksi.",
    hasParity: true,
    loaded: false
  },
  'cube-6x6': {
    id: 'cube-6x6',
    wcaId: '666',
    name: 'V-Cube 6x6',
    shortName: '6x6',
    category: 'nxn',
    difficulty: 'expert',
    difficultyLabel: 'Master',
    order: 6,
    faceCount: 6,
    defaultCameraDistance: 12.5,
    minCameraDistance: 8.0,
    maxCameraDistance: 28.0,
    description: 'Kubus genap 6x6x6 tingkat lanjut dengan reduksi center 4x4.',
    hasParity: true,
    loaded: false
  },
  'cube-7x7': {
    id: 'cube-7x7',
    wcaId: '777',
    name: 'V-Cube 7x7',
    shortName: '7x7',
    category: 'nxn',
    difficulty: 'expert',
    difficultyLabel: 'Master',
    order: 7,
    faceCount: 6,
    defaultCameraDistance: 14.0,
    minCameraDistance: 9.0,
    maxCameraDistance: 32.0,
    description: 'Kubus ganjil terbesar dalam kompetisi WCA dengan 218 potongan.',
    hasParity: true,
    loaded: false
  },
  'pyraminx': {
    id: 'pyraminx',
    wcaId: 'pyram',
    name: 'Pyraminx (Tetrahedron)',
    shortName: 'Pyra',
    category: 'shape',
    difficulty: 'beginner',
    difficultyLabel: 'Pemula',
    faceCount: 4,
    defaultCameraDistance: 9.0,
    minCameraDistance: 5.0,
    maxCameraDistance: 20.0,
    description: 'Puzzle berbentuk tetrahedron beraturan dengan 4 sudut berputar 120°.',
    hasParity: false,
    loaded: false
  },
  'megaminx': {
    id: 'megaminx',
    wcaId: 'minx',
    name: 'Megaminx (Dodecahedron)',
    shortName: 'Mega',
    category: 'shape',
    difficulty: 'advanced',
    difficultyLabel: 'Mahir',
    faceCount: 12,
    defaultCameraDistance: 13.0,
    minCameraDistance: 8.0,
    maxCameraDistance: 30.0,
    description: 'Puzzle dodecahedron 12 sisi dengan putaran pentagonal 72°.',
    hasParity: false,
    loaded: false
  },
  'skewb': {
    id: 'skewb',
    wcaId: 'skewb',
    name: 'Skewb (Corner-Turning)',
    shortName: 'Skewb',
    category: 'shape',
    difficulty: 'intermediate',
    difficultyLabel: 'Menengah',
    faceCount: 6,
    defaultCameraDistance: 8.0,
    minCameraDistance: 5.0,
    maxCameraDistance: 20.0,
    description: 'Puzzle kubus deep-cut berputar pada 4 sumbu diagonal sudut 120°.',
    hasParity: false,
    loaded: false
  },
  'square-1': {
    id: 'square-1',
    wcaId: 'sq1',
    name: 'Square-1 (Shape-Shifting)',
    shortName: 'Sq-1',
    category: 'shape',
    difficulty: 'expert',
    difficultyLabel: 'Master',
    faceCount: 6,
    defaultCameraDistance: 8.5,
    minCameraDistance: 5.0,
    maxCameraDistance: 20.0,
    description: 'Puzzle perubahan bentuk dengan putaran 30°/60° dan potongan slice 180°.',
    hasParity: true,
    loaded: false
  }
};

/**
 * Mapping of alternate IDs, abbreviations, and WCA codes to canonical IDs
 * @type {Record<string, string>}
 */
export const PUZZLE_ALIASES = Object.freeze({
  // 1. 2x2 Pocket Cube
  '2x2': 'cube-2x2',
  '222': 'cube-2x2',
  'cube-2x2': 'cube-2x2',
  'pocket': 'cube-2x2',
  '2x2x2': 'cube-2x2',
  'cube2x2': 'cube-2x2',
  'pocket-cube': 'cube-2x2',

  // 2. 3x3 Rubik's Cube
  '3x3': 'cube-3x3',
  '333': 'cube-3x3',
  'cube-3x3': 'cube-3x3',
  'rubik': 'cube-3x3',
  'rubiks': 'cube-3x3',
  '3x3x3': 'cube-3x3',
  'cube3x3': 'cube-3x3',
  'standard': 'cube-3x3',

  // 3. 4x4 Revenge Cube
  '4x4': 'cube-4x4',
  '444': 'cube-4x4',
  'cube-4x4': 'cube-4x4',
  'revenge': 'cube-4x4',
  '4x4x4': 'cube-4x4',
  'cube4x4': 'cube-4x4',
  'rubiks-revenge': 'cube-4x4',

  // 4. 5x5 Professor's Cube
  '5x5': 'cube-5x5',
  '555': 'cube-5x5',
  'cube-5x5': 'cube-5x5',
  'professor': 'cube-5x5',
  '5x5x5': 'cube-5x5',
  'cube5x5': 'cube-5x5',
  'professors-cube': 'cube-5x5',

  // 5. 6x6 Cube
  '6x6': 'cube-6x6',
  '666': 'cube-6x6',
  'cube-6x6': 'cube-6x6',
  '6x6x6': 'cube-6x6',
  'cube6x6': 'cube-6x6',
  'vcube-6x6': 'cube-6x6',
  'vcube6': 'cube-6x6',

  // 6. 7x7 Cube
  '7x7': 'cube-7x7',
  '777': 'cube-7x7',
  'cube-7x7': 'cube-7x7',
  '7x7x7': 'cube-7x7',
  'cube7x7': 'cube-7x7',
  'vcube-7x7': 'cube-7x7',
  'vcube7': 'cube-7x7',

  // 7. Pyraminx (Tetrahedron)
  'pyra': 'pyraminx',
  'pyram': 'pyraminx',
  'pyraminx': 'pyraminx',
  'tetrahedron': 'pyraminx',

  // 8. Megaminx (Dodecahedron)
  'mega': 'megaminx',
  'minx': 'megaminx',
  'megaminx': 'megaminx',
  'dodecahedron': 'megaminx',

  // 9. Skewb (Corner-turning)
  'skewb': 'skewb',

  // 10. Square-1 (Shape-shifting)
  'sq1': 'square-1',
  'sq-1': 'square-1',
  'square1': 'square-1',
  'square-1': 'square-1',
  'square 1': 'square-1',
  'sq 1': 'square-1'
});

/**
 * Normalizes any puzzle ID or alias to canonical ID
 * @param {string} id
 * @returns {string} canonical ID or input string if unknown
 */
export function normalizePuzzleId(id) {
  if (!id || typeof id !== 'string') return 'cube-3x3';
  const clean = id.toLowerCase().trim();
  return PUZZLE_ALIASES[clean] || clean;
}

/**
 * Universal Puzzle Registry Class
 */
export class PuzzleRegistry {
  constructor() {
    /** @type {Map<string, import('./types.js').PuzzleDefinition>} */
    this.definitions = new Map();

    /** @type {Map<string, () => Promise<import('./types.js').PuzzleDefinition>>} */
    this.loaders = new Map();

    /** @type {Set<(event: { type: string, puzzleId: string }) => void>} */
    this.listeners = new Set();

    /** @type {string} */
    this.defaultPuzzleId = 'cube-5x5'; // Default to 5x5 in M1
  }

  /**
   * Registers a puzzle definition or dynamic loader
   * @param {string} id - Puzzle ID or alias
   * @param {import('./types.js').PuzzleDefinition | (() => Promise<import('./types.js').PuzzleDefinition>)} defOrLoader
   */
  register(id, defOrLoader) {
    const canonicalId = normalizePuzzleId(id);
    if (typeof defOrLoader === 'function') {
      this.loaders.set(canonicalId, defOrLoader);
    } else if (defOrLoader && typeof defOrLoader === 'object') {
      this.definitions.set(canonicalId, defOrLoader);
      if (WCA_PUZZLE_METADATA[canonicalId]) {
        WCA_PUZZLE_METADATA[canonicalId].loaded = true;
      }
    } else {
      throw new TypeError(`Invalid puzzle definition or loader provided for ID: ${id}`);
    }
    this._notify('registered', canonicalId);
  }

  /**
   * Checks if a puzzle ID is registered (either definition or loader)
   * @param {string} id
   * @returns {boolean}
   */
  has(id) {
    const canonicalId = normalizePuzzleId(id);
    return this.definitions.has(canonicalId) || this.loaders.has(canonicalId);
  }

  /**
   * Checks if a puzzle definition is currently loaded in memory
   * @param {string} id
   * @returns {boolean}
   */
  isLoaded(id) {
    const canonicalId = normalizePuzzleId(id);
    return this.definitions.has(canonicalId);
  }

  /**
   * Synchronously retrieves a loaded puzzle definition.
   * Returns null if not yet loaded.
   * @param {string} id
   * @returns {import('./types.js').PuzzleDefinition | null}
   */
  get(id) {
    const canonicalId = normalizePuzzleId(id);
    return this.definitions.get(canonicalId) || null;
  }

  /**
   * Asynchronously loads and returns a puzzle definition.
   * Resolves lazy loader if not yet instantiated.
   * @param {string} id
   * @returns {Promise<import('./types.js').PuzzleDefinition>}
   */
  async load(id) {
    const canonicalId = normalizePuzzleId(id);
    if (this.definitions.has(canonicalId)) {
      return this.definitions.get(canonicalId);
    }

    const loader = this.loaders.get(canonicalId);
    if (loader) {
      const def = await loader();
      this.definitions.set(canonicalId, def);
      if (WCA_PUZZLE_METADATA[canonicalId]) {
        WCA_PUZZLE_METADATA[canonicalId].loaded = true;
      }
      this._notify('loaded', canonicalId);
      return def;
    }

    // Fallback: If not registered, check if default puzzle is available
    if (canonicalId !== this.defaultPuzzleId && this.has(this.defaultPuzzleId)) {
      console.warn(`Puzzle '${id}' is not implemented yet. Falling back to '${this.defaultPuzzleId}'.`);
      return this.load(this.defaultPuzzleId);
    }

    throw new Error(`Puzzle definition '${canonicalId}' not found in registry and no loader registered.`);
  }

  /**
   * Returns metadata for all 10 WCA puzzles without instantiating 3D meshes
   * @returns {import('./types.js').PuzzleMetadata[]}
   */
  getAllMetadata() {
    return Object.values(WCA_PUZZLE_METADATA).map(meta => ({
      ...meta,
      loaded: this.definitions.has(meta.id)
    }));
  }

  /**
   * Returns metadata for a single puzzle ID
   * @param {string} id
   * @returns {import('./types.js').PuzzleMetadata | null}
   */
  getMetadata(id) {
    const canonicalId = normalizePuzzleId(id);
    const meta = WCA_PUZZLE_METADATA[canonicalId];
    if (!meta) return null;
    return {
      ...meta,
      loaded: this.definitions.has(canonicalId)
    };
  }

  /**
   * Filter puzzle metadata by category ('nxn' | 'shape')
   * @param {import('./types.js').PuzzleCategory} category
   * @returns {import('./types.js').PuzzleMetadata[]}
   */
  getByCategory(category) {
    return this.getAllMetadata().filter(m => m.category === category);
  }

  /**
   * Filter puzzle metadata by difficulty tier ('beginner' | 'intermediate' | 'advanced' | 'expert')
   * @param {import('./types.js').PuzzleDifficulty} difficulty
   * @returns {import('./types.js').PuzzleMetadata[]}
   */
  getByDifficulty(difficulty) {
    return this.getAllMetadata().filter(m => m.difficulty === difficulty);
  }

  /**
   * Returns puzzle metadata grouped by the 4 difficulty tiers
   * @returns {Record<import('./types.js').PuzzleDifficulty, import('./types.js').PuzzleMetadata[]>}
   */
  getGroupedByDifficulty() {
    const all = this.getAllMetadata();
    return {
      beginner: all.filter(m => m.difficulty === 'beginner'),
      intermediate: all.filter(m => m.difficulty === 'intermediate'),
      advanced: all.filter(m => m.difficulty === 'advanced'),
      expert: all.filter(m => m.difficulty === 'expert')
    };
  }

  /**
   * Sets default puzzle ID
   * @param {string} id
   */
  setDefaultPuzzleId(id) {
    this.defaultPuzzleId = normalizePuzzleId(id);
  }

  /**
   * Gets default puzzle ID
   * @returns {string}
   */
  getDefaultPuzzleId() {
    return this.defaultPuzzleId;
  }

  /**
   * Subscribe to registry events ('registered', 'loaded')
   * @param {(event: { type: string, puzzleId: string }) => void} listener
   * @returns {() => void} unsubscribe function
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * @private
   */
  _notify(type, puzzleId) {
    this.listeners.forEach(fn => {
      try {
        fn({ type, puzzleId });
      } catch (err) {
        console.error('PuzzleRegistry listener error:', err);
      }
    });
  }
}

// Global Singleton Instance wrapped in a Proxy to support object-style property access e.g. registry[puzzleId]
const rawRegistry = new PuzzleRegistry();

export const puzzleRegistry = new Proxy(rawRegistry, {
  get(target, prop, receiver) {
    if (typeof prop === 'string' && !(prop in target)) {
      const clean = prop.toLowerCase().trim();
      if (clean in PUZZLE_ALIASES || clean in WCA_PUZZLE_METADATA) {
        return target.get(clean);
      }
    }
    return Reflect.get(target, prop, receiver);
  }
});

// Pre-register all 6 NxN cubes dynamic loaders
puzzleRegistry.register('cube-2x2', async () => {
  const mod = await import('./nxn/cube2x2.js');
  return mod.cube2x2Definition;
});

puzzleRegistry.register('cube-3x3', async () => {
  const mod = await import('./nxn/cube3x3.js');
  return mod.cube3x3Definition;
});

puzzleRegistry.register('cube-4x4', async () => {
  const mod = await import('./nxn/cube4x4.js');
  return mod.cube4x4Definition;
});

puzzleRegistry.register('cube-5x5', async () => {
  const mod = await import('./nxn/cube5x5.js');
  return mod.cube5x5Definition;
});

puzzleRegistry.register('cube-6x6', async () => {
  const mod = await import('./nxn/cube6x6.js');
  return mod.cube6x6Definition;
});

puzzleRegistry.register('cube-7x7', async () => {
  const mod = await import('./nxn/cube7x7.js');
  return mod.cube7x7Definition;
});

// Shape Puzzles dynamic loaders
puzzleRegistry.register('pyraminx', async () => {
  const mod = await import('./pyraminx/pyraminx.js');
  const def = { ...mod.pyraminxDefinition };
  const presets = def.presets.map(p => {
    const isSolved = p.id === 'solved' || p.id === 'pyra-solved';
    return {
      ...p,
      id: isSolved ? 'solved' : p.id,
      algorithm: isSolved ? '' : (p.algorithm || p.setupMoves || '')
    };
  });
  if (!presets.some(p => p.id === 'polish-flip')) {
    presets.push({
      id: 'polish-flip',
      name: 'Polish Two-Edge Flip',
      category: 'Algoritma Populer',
      desc: 'Dua rusuk pada posisi yang benar tetapi warna terbalik.',
      stateDescription: 'Dua rusuk pada posisi yang benar tetapi warna terbalik.',
      setupMoves: "R' L R L' U L' U' L",
      algorithm: "R' L R L' U L' U' L"
    });
  }
  def.presets = presets;
  def.guideStages = def.guideStages.map(s => ({
    ...s,
    desc: s.desc || s.description || s.summary || 'Metode Pemula',
    title: s.title && s.title.includes('Pemula') ? s.title : `${s.title} (Metode Pemula)`
  }));
  return def;
});

puzzleRegistry.register('skewb', async () => {
  const mod = await import('./skewb/skewb.js');
  return mod.skewbDefinition;
});

puzzleRegistry.register('megaminx', async () => {
  const mod = await import('./megaminx/megaminx.js');
  return mod.megaminxDefinition;
});

puzzleRegistry.register('square-1', async () => {
  const mod = await import('./square1/square1.js');
  return mod.square1Definition;
});

puzzleRegistry.register('square1', async () => {
  const mod = await import('./square1/square1.js');
  return mod.square1Definition;
});

// Export convenience helpers
export const getAllPuzzleMetadata = () => puzzleRegistry.getAllMetadata();
export const getPuzzleMetadata = (id) => puzzleRegistry.getMetadata(id);
export const getPuzzlesByCategory = (cat) => puzzleRegistry.getByCategory(cat);
export const getPuzzlesByDifficulty = (diff) => puzzleRegistry.getByDifficulty(diff);
export const getPuzzlesGroupedByDifficulty = () => puzzleRegistry.getGroupedByDifficulty();
export const getPuzzle = (id) => puzzleRegistry.get(id);
export const loadPuzzle = (id) => puzzleRegistry.load(id);
export const registerPuzzle = (id, defOrLoader) => puzzleRegistry.register(id, defOrLoader);
