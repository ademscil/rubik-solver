/**
 * Constants & Authoritative Specifications for Universal Rubik & Twisty Puzzle Solver 3D
 * Source: ORIGINAL_REQUEST.md (R1-R4), PROJECT.md, TEST_INFRA.md, WCA Regulations
 */

export const WCA_PUZZLES = [
  'cube-2x2',
  'cube-3x3',
  'cube-4x4',
  'cube-5x5',
  'cube-6x6',
  'cube-7x7',
  'pyraminx',
  'megaminx',
  'skewb',
  'square1'
];

export const DIFFICULTY_TIERS = {
  pemula: {
    name: 'Pemula',
    level: 1,
    puzzles: ['cube-2x2', 'cube-3x3', 'pyraminx'],
    description: 'Varian dasar ramah pemula dengan konsep lapis demi lapis sederhana.'
  },
  menengah: {
    name: 'Menengah',
    level: 2,
    puzzles: ['cube-4x4', 'skewb'],
    description: 'Varian tingkat menengah dengan pengenalan paritas dan perputaran sudut mendalam.'
  },
  mahir: {
    name: 'Mahir',
    level: 3,
    puzzles: ['cube-5x5', 'megaminx'],
    description: 'Varian bertingkat tinggi dengan banyak lapisan dan geometri dodecahedron.'
  },
  master: {
    name: 'Master',
    level: 4,
    puzzles: ['cube-6x6', 'cube-7x7', 'square1'],
    description: 'Varian master dengan multi-layer parity kompleks dan shape-shifting non-kubus.'
  }
};

export const PUZZLE_SPECS = {
  'cube-2x2': {
    id: 'cube-2x2',
    name: "Pocket Cube 2x2",
    category: 'nxn',
    order: 2,
    difficultyTier: 'pemula',
    beginnerMethod: 'Ortega / LBL Pemula',
    cubiesCount: 8,
    facesCount: 6,
    stickersPerFace: 4,
    totalStickers: 24,
    defaultCameraDistance: 5.5,
    hasFixedCenter: false,
    colorScheme: ['#FFFFFF', '#FFD500', '#009B48', '#0046AD', '#B71234', '#FF5800'] // U, D, F, B, R, L
  },
  'cube-3x3': {
    id: 'cube-3x3',
    name: "Rubik's Cube 3x3",
    category: 'nxn',
    order: 3,
    difficultyTier: 'pemula',
    beginnerMethod: 'Layer-By-Layer (LBL) Pemula / CFOP',
    cubiesCount: 26,
    facesCount: 6,
    stickersPerFace: 9,
    totalStickers: 54,
    defaultCameraDistance: 7.0,
    hasFixedCenter: true,
    colorScheme: ['#FFFFFF', '#FFD500', '#009B48', '#0046AD', '#B71234', '#FF5800']
  },
  'cube-4x4': {
    id: 'cube-4x4',
    name: "Rubik's Revenge 4x4",
    category: 'nxn',
    order: 4,
    difficultyTier: 'menengah',
    beginnerMethod: 'Metode Reduksi (Reduction) Pemula',
    cubiesCount: 56,
    facesCount: 6,
    stickersPerFace: 16,
    totalStickers: 96,
    defaultCameraDistance: 8.5,
    hasFixedCenter: false,
    colorScheme: ['#FFFFFF', '#FFD500', '#009B48', '#0046AD', '#B71234', '#FF5800']
  },
  'cube-5x5': {
    id: 'cube-5x5',
    name: "Professor's Cube 5x5",
    category: 'nxn',
    order: 5,
    difficultyTier: 'mahir',
    beginnerMethod: 'Reduksi Center-Bar & Free Slice Pemula',
    cubiesCount: 98,
    facesCount: 6,
    stickersPerFace: 25,
    totalStickers: 150,
    defaultCameraDistance: 10.0,
    hasFixedCenter: true,
    colorScheme: ['#FFFFFF', '#FFD500', '#009B48', '#0046AD', '#B71234', '#FF5800']
  },
  'cube-6x6': {
    id: 'cube-6x6',
    name: "V-Cube 6x6",
    category: 'nxn',
    order: 6,
    difficultyTier: 'master',
    beginnerMethod: 'Reduksi Multi-Slice Pemula',
    cubiesCount: 152,
    facesCount: 6,
    stickersPerFace: 36,
    totalStickers: 216,
    defaultCameraDistance: 11.5,
    hasFixedCenter: false,
    colorScheme: ['#FFFFFF', '#FFD500', '#009B48', '#0046AD', '#B71234', '#FF5800']
  },
  'cube-7x7': {
    id: 'cube-7x7',
    name: "V-Cube 7x7",
    category: 'nxn',
    order: 7,
    difficultyTier: 'master',
    beginnerMethod: 'Reduksi 5-Wing Edges Pemula',
    cubiesCount: 218,
    facesCount: 6,
    stickersPerFace: 49,
    totalStickers: 294,
    defaultCameraDistance: 13.0,
    hasFixedCenter: true,
    colorScheme: ['#FFFFFF', '#FFD500', '#009B48', '#0046AD', '#B71234', '#FF5800']
  },
  'pyraminx': {
    id: 'pyraminx',
    name: "Pyraminx",
    category: 'shape',
    geometryType: 'tetrahedron',
    difficultyTier: 'pemula',
    beginnerMethod: 'Tips & First Layer (LBL) Pemula',
    axialAxes: 4,
    tipsCount: 4,
    centersCount: 4,
    edgesCount: 6,
    facesCount: 4,
    stickersPerFace: 9,
    totalStickers: 36,
    defaultCameraDistance: 7.5,
    colorScheme: ['#FFD500', '#009B48', '#B71234', '#0046AD'] // Yellow, Green, Red, Blue
  },
  'megaminx': {
    id: 'megaminx',
    name: "Megaminx",
    category: 'shape',
    geometryType: 'dodecahedron',
    difficultyTier: 'mahir',
    beginnerMethod: 'White Star & S2L Pemula',
    facesCount: 12,
    cornersCount: 20,
    edgesCount: 30,
    centersCount: 12,
    stickersPerFace: 11,
    totalStickers: 132,
    defaultCameraDistance: 11.0,
    colorScheme: [
      '#FFFFFF', '#FFD500', '#009B48', '#0046AD', '#B71234', '#FF5800',
      '#808080', '#A0E0A0', '#A0A0FF', '#FFA0A0', '#FFD0A0', '#D0A0FF'
    ]
  },
  'skewb': {
    id: 'skewb',
    name: "Skewb",
    category: 'shape',
    geometryType: 'deep-cut-cube',
    difficultyTier: 'menengah',
    beginnerMethod: "Sarah's Beginner Method (Sledgehammer)",
    diagonalAxes: 4,
    facesCount: 6,
    centersCount: 6,
    cornersCount: 8,
    stickersPerFace: 5, // 1 diamond center + 4 corner facets
    totalStickers: 30,
    defaultCameraDistance: 7.0,
    colorScheme: ['#FFFFFF', '#FFD500', '#009B48', '#0046AD', '#B71234', '#FF5800']
  },
  'square1': {
    id: 'square1',
    name: "Square-1",
    category: 'shape',
    geometryType: 'shape-shifting-disc',
    difficultyTier: 'master',
    beginnerMethod: 'Vandenbergh Cube Shape & CO/EO Pemula',
    kitesPerLayer: 4,
    trianglesPerLayer: 4,
    equatorPieces: 2,
    totalPieces: 18,
    totalStickers: 18, // 8 top + 8 bottom + 2 equator
    defaultCameraDistance: 8.0,
    colorScheme: ['#FFFFFF', '#FFD500', '#009B48', '#0046AD', '#B71234', '#FF5800']
  }
};

export const CAMERA_PRESETS = {
  isometric: { position: [7, 6, 7], target: [0, 0, 0] },
  front: { position: [0, 0, 9], target: [0, 0, 0] },
  top: { position: [0, 9, 0], target: [0, 0, 0] },
  right: { position: [9, 0, 0], target: [0, 0, 0] }
};
