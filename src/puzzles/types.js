/**
 * Universal Puzzle Engine Type Contracts
 * Location: src/puzzles/types.js
 * 
 * Defines JSDoc types and contracts for all twisty puzzles, metadata,
 * color schemes, notation, guides, presets, and 2D net customization.
 */

/**
 * @typedef {'nxn' | 'shape'} PuzzleCategory
 */

/**
 * Difficulty tiers for user learning progression
 * @typedef {'beginner' | 'intermediate' | 'advanced' | 'expert'} PuzzleDifficulty
 */

/**
 * Single color facelet descriptor
 * @typedef {Object} ColorDefinition
 * @property {string} name - Indonesian / English color name (e.g. "Putih (Atas)")
 * @property {string} hex - Standard 6-digit hex color code (e.g. "#FFFFFF")
 * @property {string} code - Single letter face/color identifier (e.g. "W", "Y", "U", "D")
 * @property {string} [symbol] - Optional text symbol for accessibility
 */

/**
 * Color scheme mapping for a puzzle
 * @typedef {Record<string, ColorDefinition>} ColorScheme
 */

/**
 * Notation movement detail with Indonesian explanation
 * @typedef {Object} MoveInfo
 * @property {string} name - Friendly name (e.g. "Right Wide", "U Turn", "Slice Cut")
 * @property {string} desc - Comprehensive Indonesian explanation of what turns and how
 * @property {'x' | 'y' | 'z' | string} [axis] - Axis of rotation
 * @property {number[]} [layers] - Active coordinate layers participating in rotation
 * @property {number} [dir] - Direction multiplier (-1, 1, -2, 2)
 * @property {number} [angle] - Angle in radians or degrees (e.g. for Pyraminx 120°, Megaminx 72°, Sq-1 30°)
 */

/**
 * Dictionary of valid notation tokens for a puzzle
 * @typedef {Record<string, MoveInfo>} NotationDictionary
 */

/**
 * A single learning case within a guide stage
 * @typedef {Object} GuideCase
 * @property {string} id - Unique case identifier (e.g. "c-first-white", "oll-parity")
 * @property {string} name - Descriptive case title in Indonesian
 * @property {string} [summary] - Brief explanation of the case situation
 * @property {string} [setup] - Move sequence that reproduces this case from solved
 * @property {string} algorithm - Move sequence that solves this case
 * @property {string} [tips] - Tactical execution tips or mnemonics
 * @property {string} [description] - Detailed markdown explanation
 */

/**
 * A major learning stage in a puzzle's solving curriculum
 * @typedef {Object} GuideStage
 * @property {string} id - Unique stage ID (e.g. "stage-centers", "stage-f2l")
 * @property {string} title - Full stage title (e.g. "1. Pengenalan & Anatomi 5x5")
 * @property {string} [shortTitle] - Compact sidebar badge title (e.g. "Centers")
 * @property {string} [badge] - Level or category badge (e.g. "Tahap 1", "Parity")
 * @property {string} summary - One-line summary
 * @property {string} [description] - In-depth markdown explanation of stage strategy
 * @property {GuideCase[]} cases - Array of individual cases in this stage
 */

/**
 * Preset case for quick setup or common stuck state
 * @typedef {Object} PresetCase
 * @property {string} id - Unique preset identifier
 * @property {string} name - Preset display name
 * @property {string} category - Category grouping (e.g. "Parity", "Pola Cantik", "Dasar")
 * @property {string} desc - Case explanation
 * @property {string} setupMoves - Scramble/setup algorithm
 * @property {string} solutionMoves - Resolution algorithm
 * @property {string} [stage] - Target highlight stage ('centers' | 'edges' | 'parity' | 'all')
 * @property {string} [tips] - Additional tips
 */

/**
 * 2D Net layout specification for state customization
 * @typedef {Object} NetFaceLayout
 * @property {string} id - Face identifier matching colorScheme key (e.g. "U", "F")
 * @property {string} name - Human readable face name
 * @property {number} row - Grid row coordinate in the 2D Net canvas
 * @property {number} col - Grid column coordinate in the 2D Net canvas
 * @property {number} rows - Number of sticker rows on this face
 * @property {number} cols - Number of sticker columns on this face
 * @property {'square' | 'triangle' | 'pentagon' | 'kite' | 'disc'} [shape] - Shape geometry type
 */

/**
 * @typedef {Object} NetLayoutConfig
 * @property {'cube_cross' | 'tetrahedron_net' | 'dodecahedron_net' | 'skewb_net' | 'square1_net'} type
 * @property {number} gridWidth - Total grid width in units
 * @property {number} gridHeight - Total grid height in units
 * @property {Record<string, NetFaceLayout>} faces - Face position definitions
 */

/**
 * Lightweight puzzle metadata queryable without loading 3D meshes
 * @typedef {Object} PuzzleMetadata
 * @property {string} id - Canonical ID (e.g. 'cube-3x3', 'megaminx')
 * @property {string} wcaId - Official WCA event identifier ('333', 'minx')
 * @property {string} name - Full human-friendly name
 * @property {string} shortName - Abbreviated badge name
 * @property {PuzzleCategory} category - 'nxn' | 'shape'
 * @property {PuzzleDifficulty} difficulty - 'beginner' | 'intermediate' | 'advanced' | 'expert'
 * @property {string} difficultyLabel - 'Pemula' | 'Menengah' | 'Mahir' | 'Master'
 * @property {number} [order] - Grid order (2 for 2x2, 3 for 3x3, etc.)
 * @property {number} faceCount - Number of outer faces (4, 6, 12)
 * @property {number} defaultCameraDistance - Optimal initial distance
 * @property {number} minCameraDistance - Minimum zoom threshold
 * @property {number} maxCameraDistance - Maximum zoom threshold
 * @property {string} description - Summary of the puzzle
 * @property {boolean} hasParity - True if parity algorithms are required
 * @property {boolean} loaded - True if full 3D definition is currently in memory
 */

/**
 * The Comprehensive Universal Puzzle Definition Contract
 * @typedef {Object} PuzzleDefinition
 * @property {string} id - Canonical puzzle identifier
 * @property {string} wcaId - Official WCA event ID
 * @property {string} name - Display name
 * @property {string} shortName - Short badge name
 * @property {PuzzleCategory} category - 'nxn' | 'shape'
 * @property {PuzzleDifficulty} difficulty - 'beginner' | 'intermediate' | 'advanced' | 'expert'
 * @property {string} difficultyLabel - 'Pemula' | 'Menengah' | 'Mahir' | 'Master'
 * @property {number} [order] - Order for NxN cubes
 * @property {number} faceCount - Number of faces
 * @property {number} defaultCameraDistance - Initial camera distance
 * @property {number} minCameraDistance - Minimum zoom
 * @property {number} maxCameraDistance - Maximum zoom
 * @property {string} description - Puzzle summary
 * @property {boolean} hasParity - Whether parity applies
 * @property {ColorScheme} colorScheme - Puzzle color definitions
 * 
 * // 3D Geometry & Scene Building
 * @property {(options?: { textureCache?: any }) => import('three').Group} buildModel - Instantiates the 3D puzzle mesh
 * @property {(group: import('three').Group) => void} [disposeModel] - Optional puzzle-specific teardown hook
 * @property {(group: import('three').Group) => void} [resetModel] - Resets puzzle to solved state
 * 
 * // Rotation Mechanics & Timeline
 * @property {(moveStr: string, group: import('three').Group, onComplete: () => void, duration?: number) => void} animateMove - Executes a single move animation
 * @property {(algString: string) => string[]} parseAlgorithm - Parses algorithm string into normalized move tokens
 * @property {(moveStr: string) => string} getInverseMove - Computes mathematical inverse of a move
 * @property {(moveStr: string) => MoveInfo} getMoveInfo - Retrieves Indonesian move metadata
 * @property {(length?: number) => string} generateScramble - Produces valid random scramble string
 * 
 * // Educational Guides & Presets
 * @property {NotationDictionary} notation - Complete notation dictionary with Indonesian descriptions
 * @property {GuideStage[]} guideStages - Step-by-step solving guide stages
 * @property {PresetCase[]} presets - Popular stuck cases and parities
 * 
 * // 2D Net Customization
 * @property {NetLayoutConfig} netLayout - Layout descriptor for the 2D Net editor
 * @property {(group: import('three').Group, netState: Record<string, string[]>) => void} [applyNetState] - Loads colors from 2D net onto 3D model
 * @property {(group: import('three').Group) => Record<string, string[]>} [extractNetState] - Reads colors from 3D model into 2D net
 */

export {};
