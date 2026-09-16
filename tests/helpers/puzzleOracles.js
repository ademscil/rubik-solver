/**
 * Reference Oracle & Contract Validator for Twisty Puzzles
 * Grounded in PROJECT.md, ORIGINAL_REQUEST.md, WCA Regulations, and survey analysis.
 */

import { WCA_PUZZLES, PUZZLE_SPECS } from './constants.js';

/**
 * Validates that an object satisfies the PuzzleDefinition interface contract
 * defined in PROJECT.md § Interface Contracts.
 */
export function validatePuzzleContract(puzzle) {
  if (!puzzle || typeof puzzle !== 'object') {
    throw new Error('Puzzle definition must be a non-null object');
  }

  const requiredFields = [
    'id',
    'name',
    'category',
    'defaultCameraDistance',
    'buildModel',
    'animateMove',
    'getInverseMove',
    'notation',
    'guideStages',
    'presets',
    'netLayout'
  ];

  for (const field of requiredFields) {
    if (!(field in puzzle)) {
      throw new Error(`Missing required field '${field}' in PuzzleDefinition for '${puzzle.id || 'unknown'}'`);
    }
  }

  if (typeof puzzle.id !== 'string' || puzzle.id.trim() === '') {
    throw new Error(`Field 'id' must be a non-empty string`);
  }
  if (!WCA_PUZZLES.includes(puzzle.id)) {
    throw new Error(`Puzzle ID '${puzzle.id}' is not one of the 10 official WCA puzzles`);
  }
  if (typeof puzzle.name !== 'string' || puzzle.name.trim() === '') {
    throw new Error(`Field 'name' must be a non-empty string`);
  }
  if (!['nxn', 'shape'].includes(puzzle.category)) {
    throw new Error(`Field 'category' must be 'nxn' or 'shape'`);
  }
  if (typeof puzzle.defaultCameraDistance !== 'number' || puzzle.defaultCameraDistance <= 0) {
    throw new Error(`Field 'defaultCameraDistance' must be a positive number`);
  }
  if (typeof puzzle.buildModel !== 'function') {
    throw new Error(`Field 'buildModel' must be a function`);
  }
  if (typeof puzzle.animateMove !== 'function') {
    throw new Error(`Field 'animateMove' must be a function`);
  }
  if (typeof puzzle.getInverseMove !== 'function') {
    throw new Error(`Field 'getInverseMove' must be a function`);
  }
  if (typeof puzzle.notation !== 'object' || puzzle.notation === null) {
    throw new Error(`Field 'notation' must be a dictionary object`);
  }
  if (!Array.isArray(puzzle.guideStages) || puzzle.guideStages.length === 0) {
    throw new Error(`Field 'guideStages' must be a non-empty array`);
  }
  if (!Array.isArray(puzzle.presets) || puzzle.presets.length === 0) {
    throw new Error(`Field 'presets' must be a non-empty array`);
  }
  if (typeof puzzle.netLayout !== 'object' || puzzle.netLayout === null) {
    throw new Error(`Field 'netLayout' must be a non-null object`);
  }

  return true;
}

/**
 * Tokenizes and parses move strings for any WCA puzzle.
 * Throws an error or returns invalid flags for malformed inputs.
 */
export function parseNotation(moveStr, puzzleId = 'cube-3x3') {
  if (typeof moveStr !== 'string') {
    throw new TypeError('moveStr must be a string');
  }

  const cleaned = moveStr.trim();
  if (cleaned === '') return [];

  // Square-1 has specific syntax: (x, y) and /
  if (puzzleId === 'square1') {
    return parseSquare1Notation(cleaned);
  }

  // Megaminx Pochmann notation contains R++, R--, D++, D--, U, U'
  if (puzzleId === 'megaminx') {
    return parseMegaminxNotation(cleaned);
  }

  // Standard NxN, Pyraminx, and Skewb tokenization
  // Strip parentheses and comments
  const stripped = cleaned.replace(/\/\/.*/g, '').replace(/[()]/g, ' ');
  const rawTokens = stripped.split(/\s+/).filter(t => t.length > 0);

  const parsed = [];
  for (const token of rawTokens) {
    const meta = validateAndClassifyToken(token, puzzleId);
    parsed.push(meta);
  }

  return parsed;
}

/**
 * Validates and classifies a single token for NxN, Pyraminx, or Skewb.
 */
function validateAndClassifyToken(token, puzzleId) {
  if (puzzleId.startsWith('cube-')) {
    const order = PUZZLE_SPECS[puzzleId].order;
    // NxN patterns:
    // Outer: [RLUDFB]['2]?
    // Wide: [rludfb]['2]? or [RLUDFB]w['2]?
    // Multi-wide: [2-7][RLUDFB]w['2]?
    // Slice: [MES]['2]? or 2[RLUDFB]['2]? or [2-7][RLUDFB]['2]?
    // Cube rotation: [xyz]['2]?
    const nxnRegex = /^([2-7])?([RLUDFBrludfbMESxyz])(w)?(['2])?$/;
    const match = token.match(nxnRegex);
    if (!match) {
      throw new Error(`Invalid WCA notation token '${token}' for ${puzzleId}`);
    }

    const [, prefixNum, baseFace, wideSuffix, modifier] = match;
    const upperFace = baseFace.toUpperCase();
    if (['M', 'E', 'S'].includes(upperFace) && order < 3) {
      throw new Error(`Slice move '${token}' is invalid for ${puzzleId} because order ${order} has no inner slice`);
    }

    const isWide = wideSuffix === 'w' || (baseFace === baseFace.toLowerCase() && !['x', 'y', 'z'].includes(baseFace));
    const layerCount = prefixNum ? parseInt(prefixNum, 10) : (isWide ? 2 : 1);

    if (layerCount > order) {
      throw new Error(`Token '${token}' addresses layer ${layerCount} which exceeds ${puzzleId} order ${order}`);
    }

    return {
      token,
      baseFace: upperFace,
      modifier: modifier || '',
      isWide,
      layerCount,
      puzzleId
    };
  }

  if (puzzleId === 'pyraminx') {
    // Pyraminx: U, L, R, B, u, l, r, b with optional '
    const pyraRegex = /^([ULRBurlb])(['])?$/;
    const match = token.match(pyraRegex);
    if (!match) {
      throw new Error(`Invalid Pyraminx notation token '${token}'`);
    }
    const isTip = token[0] === token[0].toLowerCase();
    return {
      token,
      baseFace: token[0].toUpperCase(),
      isTip,
      modifier: match[2] || '',
      puzzleId
    };
  }

  if (puzzleId === 'skewb') {
    // Skewb: corner turns R, L, U, B with optional ' OR cube rotations x, y, z with optional ' or 2
    const skewbRegex = /^(([RLUB][']?)|([xyz]['2]?))$/;
    const match = token.match(skewbRegex);
    if (!match) {
      throw new Error(`Invalid Skewb notation token '${token}'`);
    }
    return {
      token,
      baseFace: token[0].toUpperCase(),
      modifier: token.slice(1),
      puzzleId: 'skewb'
    };
  }

  throw new Error(`Unsupported puzzle ID '${puzzleId}' in token validation`);
}

/**
 * Parses Megaminx Pochmann and face turn notation.
 */
function parseMegaminxNotation(str) {
  // Megaminx: R++, R--, D++, D--, U, U', F, F', etc.
  const stripped = str.replace(/\/\/.*/g, '').replace(/[()]/g, ' ');
  const rawTokens = stripped.split(/\s+/).filter(t => t.length > 0);
  const parsed = [];

  for (const token of rawTokens) {
    if (token === 'R++' || token === 'R--' || token === 'D++' || token === 'D--') {
      parsed.push({
        token,
        type: 'pochmann',
        axis: token[0],
        direction: token.slice(1) === '++' ? 2 : -2,
        puzzleId: 'megaminx'
      });
    } else if (/^[ULFRDBulfrdb][']?$/.test(token) || token === "U'''") {
      parsed.push({
        token,
        type: 'face',
        baseFace: token[0].toUpperCase(),
        modifier: token.slice(1),
        puzzleId: 'megaminx'
      });
    } else {
      throw new Error(`Invalid Megaminx notation token '${token}'`);
    }
  }

  return parsed;
}

/**
 * Parses Square-1 tuples `(x, y)` and slice `/`.
 */
function parseSquare1Notation(str) {
  const parsed = [];
  // Tokenize slash and tuples
  const regex = /(\/|\(\s*-?\d+\s*,\s*-?\d+\s*\))/g;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(str)) !== null) {
    // Check if there was unrecognized garbage between matches
    const skipped = str.slice(lastIndex, match.index).trim();
    if (skipped.length > 0) {
      throw new Error(`Invalid Square-1 notation syntax: '${skipped}'`);
    }
    lastIndex = regex.lastIndex;

    const token = match[1].replace(/\s+/g, '');
    if (token === '/') {
      parsed.push({
        token: '/',
        type: 'slice',
        puzzleId: 'square1'
      });
    } else {
      // Extract x and y
      const tupleMatch = token.match(/\((-?\d+),(-?\d+)\)/);
      if (!tupleMatch) {
        throw new Error(`Malformed Square-1 tuple: '${token}'`);
      }
      const topAngle = parseInt(tupleMatch[1], 10);
      const bottomAngle = parseInt(tupleMatch[2], 10);

      // WCA limits: angles in units of 30 deg, typical range -6 to 6
      if (topAngle < -6 || topAngle > 6 || bottomAngle < -6 || bottomAngle > 6) {
        throw new Error(`Square-1 turn out of range [-6, 6]: (${topAngle}, ${bottomAngle})`);
      }

      parsed.push({
        token,
        type: 'layer_turn',
        top: topAngle,
        bottom: bottomAngle,
        puzzleId: 'square1'
      });
    }
  }

  const trailing = str.slice(lastIndex).trim();
  if (trailing.length > 0) {
    throw new Error(`Invalid trailing characters in Square-1 notation: '${trailing}'`);
  }

  return parsed;
}

/**
 * Computes the inverse move for a single notation token.
 */
export function getInverseMove(token, puzzleId = 'cube-3x3') {
  if (typeof token !== 'string' || token.trim() === '') {
    throw new Error('Token must be a non-empty string');
  }

  const t = token.trim();

  // Square-1 inverse:
  // / stays / (180 slice inverted is itself)
  // (x, y) becomes (-x, -y)
  if (puzzleId === 'square1' || t === '/' || t.startsWith('(')) {
    if (t === '/') return '/';
    const match = t.match(/\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/);
    if (!match) throw new Error(`Cannot invert malformed Square-1 token '${t}'`);
    const x = parseInt(match[1], 10);
    const y = parseInt(match[2], 10);
    const invX = x === 0 ? 0 : -x;
    const invY = y === 0 ? 0 : -y;
    return `(${invX},${invY})`;
  }

  // Megaminx Pochmann:
  if (t === 'R++') return 'R--';
  if (t === 'R--') return 'R++';
  if (t === 'D++') return 'D--';
  if (t === 'D--') return 'D++';

  // Double moves (180°) are their own inverse in standard WCA
  if (t.endsWith('2')) {
    return t;
  }

  // Prime moves: remove the prime
  if (t.endsWith("'")) {
    return t.slice(0, -1);
  }

  // Clockwise 90° or 120° moves: append prime
  return `${t}'`;
}

/**
 * Inverts a full sequence of moves: (A B C)^-1 = C^-1 B^-1 A^-1
 */
export function invertSequence(seqStr, puzzleId = 'cube-3x3') {
  const tokens = parseNotation(seqStr, puzzleId);
  const invertedTokens = tokens.map(t => getInverseMove(t.token, puzzleId)).reverse();
  return invertedTokens.join(' ');
}

/**
 * Indonesian pedagogical translation oracle for WCA notations.
 */
export function getIndonesianTranslation(token, puzzleId = 'cube-3x3') {
  const dictionary = {
    // Outer faces
    'R': { name: 'Kanan', desc: 'Putar 1 lapis sisi kanan searah jarum jam (ke arah atas).' },
    "R'": { name: 'Kanan Lawan Arah', desc: 'Putar 1 lapis sisi kanan berlawanan arah jarum jam (ke arah bawah).' },
    'R2': { name: 'Kanan Ganda', desc: 'Putar 1 lapis sisi kanan 180 derajat.' },
    'L': { name: 'Kiri', desc: 'Putar 1 lapis sisi kiri searah jarum jam (ke arah bawah).' },
    "L'": { name: 'Kiri Lawan Arah', desc: 'Putar 1 lapis sisi kiri berlawanan arah jarum jam (ke arah atas).' },
    'L2': { name: 'Kiri Ganda', desc: 'Putar 1 lapis sisi kiri 180 derajat.' },
    'U': { name: 'Atas', desc: 'Putar 1 lapis sisi atas searah jarum jam (ke arah kiri).' },
    "U'": { name: 'Atas Lawan Arah', desc: 'Putar 1 lapis sisi atas berlawanan arah jarum jam (ke arah kanan).' },
    'U2': { name: 'Atas Ganda', desc: 'Putar 1 lapis sisi atas 180 derajat.' },
    'D': { name: 'Bawah', desc: 'Putar 1 lapis sisi bawah searah jarum jam (ke arah kanan).' },
    "D'": { name: 'Bawah Lawan Arah', desc: 'Putar 1 lapis sisi bawah berlawanan arah jarum jam (ke arah kiri).' },
    'D2': { name: 'Bawah Ganda', desc: 'Putar 1 lapis sisi bawah 180 derajat.' },
    'F': { name: 'Depan', desc: 'Putar 1 lapis sisi depan searah jarum jam.' },
    "F'": { name: 'Depan Lawan Arah', desc: 'Putar 1 lapis sisi depan berlawanan arah jarum jam.' },
    'F2': { name: 'Depan Ganda', desc: 'Putar 1 lapis sisi depan 180 derajat.' },
    'B': { name: 'Belakang', desc: 'Putar 1 lapis sisi belakang searah jarum jam.' },
    "B'": { name: 'Belakang Lawan Arah', desc: 'Putar 1 lapis sisi belakang berlawanan arah jarum jam.' },
    'B2': { name: 'Belakang Ganda', desc: 'Putar 1 lapis sisi belakang 180 derajat.' },

    // Wide moves
    'Rw': { name: 'Kanan Dua Lapis', desc: 'Putar 2 lapisan kanan sekaligus ke arah atas.' },
    "Rw'": { name: 'Kanan Dua Lapis Lawan Arah', desc: 'Putar 2 lapisan kanan sekaligus ke arah bawah.' },
    'Rw2': { name: 'Kanan Dua Lapis 180°', desc: 'Putar 2 lapisan kanan sekaligus 180 derajat.' },
    'Lw': { name: 'Kiri Dua Lapis', desc: 'Putar 2 lapisan kiri sekaligus ke arah bawah.' },
    "Lw'": { name: 'Kiri Dua Lapis Lawan Arah', desc: 'Putar 2 lapisan kiri sekaligus ke arah atas.' },
    'Uw': { name: 'Atas Dua Lapis', desc: 'Putar 2 lapisan atas sekaligus ke arah kiri.' },
    "Uw'": { name: 'Atas Dua Lapis Lawan Arah', desc: 'Putar 2 lapisan atas sekaligus ke arah kanan.' },
    'Dw': { name: 'Bawah Dua Lapis', desc: 'Putar 2 lapisan bawah sekaligus ke arah kanan.' },
    "Dw'": { name: 'Bawah Dua Lapis Lawan Arah', desc: 'Putar 2 lapisan bawah sekaligus ke arah kiri.' },
    'Fw': { name: 'Depan Dua Lapis', desc: 'Putar 2 lapisan depan sekaligus searah jarum jam.' },
    "Fw'": { name: 'Depan Dua Lapis Lawan Arah', desc: 'Putar 2 lapisan depan sekaligus berlawanan arah jarum jam.' },
    'Bw': { name: 'Belakang Dua Lapis', desc: 'Putar 2 lapisan belakang sekaligus searah jarum jam.' },
    "Bw'": { name: 'Belakang Dua Lapis Lawan Arah', desc: 'Putar 2 lapisan belakang sekaligus berlawanan arah jarum jam.' },

    // Multi-wide & slices
    '3Rw': { name: 'Kanan Tiga Lapis', desc: 'Putar 3 lapisan kanan sekaligus ke arah atas.' },
    "3Rw'": { name: 'Kanan Tiga Lapis Lawan Arah', desc: 'Putar 3 lapisan kanan sekaligus ke arah bawah.' },
    '3Uw': { name: 'Atas Tiga Lapis', desc: 'Putar 3 lapisan atas sekaligus ke arah kiri.' },
    'M': { name: 'Irisan Tengah Vertikal', desc: 'Lapisan tengah antara L dan R berputar ke arah bawah.' },
    "M'": { name: 'Irisan Tengah Lawan Arah', desc: 'Lapisan tengah antara L dan R berputar ke arah atas.' },
    'M2': { name: 'Irisan Tengah Ganda', desc: 'Putar irisan tengah 180 derajat.' },
    'E': { name: 'Irisan Khatulistiwa', desc: 'Lapisan tengah horizontal antara U dan D berputar ke kanan.' },
    'S': { name: 'Irisan Berdiri', desc: 'Lapisan tengah vertikal antara F dan B berputar searah jarum jam.' },
    '2R': { name: 'Irisan Kanan Lapisan Kedua', desc: 'Hanya putar irisan dalam kanan lapisan ke-2 ke arah atas.' },
    '2R2': { name: 'Irisan Kanan Lapisan Kedua 180°', desc: 'Putar irisan dalam kanan lapisan ke-2 180 derajat.' },

    // Cube rotations
    'x': { name: 'Rotasi Kubus Sumbu X', desc: 'Putar seluruh kubus mengikuti arah gerakan R.' },
    'y': { name: 'Rotasi Kubus Sumbu Y', desc: 'Putar seluruh kubus mengikuti arah gerakan U.' },
    'z': { name: 'Rotasi Kubus Sumbu Z', desc: 'Putar seluruh kubus mengikuti arah gerakan F.' },

    // Pyraminx tips
    'u': { name: 'Ujung Atas', desc: 'Putar 1 sudut mini atas 120 derajat searah jarum jam.' },
    "u'": { name: 'Ujung Atas Lawan Arah', desc: 'Putar 1 sudut mini atas 120 derajat lawan arah jarum jam.' },
    'l': { name: 'Ujung Kiri', desc: 'Putar 1 sudut mini kiri 120 derajat searah jarum jam.' },
    "l'": { name: 'Ujung Kiri Lawan Arah', desc: 'Putar 1 sudut mini kiri 120 derajat lawan arah jarum jam.' },
    'r': { name: 'Ujung Kanan', desc: 'Putar 1 sudut mini kanan 120 derajat searah jarum jam.' },
    "r'": { name: 'Ujung Kanan Lawan Arah', desc: 'Putar 1 sudut mini kanan 120 derajat lawan arah jarum jam.' },
    'b': { name: 'Ujung Belakang', desc: 'Putar 1 sudut mini belakang 120 derajat searah jarum jam.' },
    "b'": { name: 'Ujung Belakang Lawan Arah', desc: 'Putar 1 sudut mini belakang 120 derajat lawan arah jarum jam.' },

    // Megaminx Pochmann
    'R++': { name: 'Pochmann Kanan Turun 2x', desc: 'Geser kedua lapisan kanan ke bawah sejauh 144 derajat.' },
    'R--': { name: 'Pochmann Kanan Naik 2x', desc: 'Geser kedua lapisan kanan ke atas sejauh 144 derajat.' },
    'D++': { name: 'Pochmann Bawah Kanan 2x', desc: 'Geser kedua lapisan bawah ke kanan sejauh 144 derajat.' },
    'D--': { name: 'Pochmann Bawah Kiri 2x', desc: 'Geser kedua lapisan bawah ke kiri sejauh 144 derajat.' },

    // Square-1
    '/': { name: 'Irisan Belahan Tengah 180°', desc: 'Iris belahan sisi kanan Square-1 180 derajat.' }
  };

  if (dictionary[token]) {
    return dictionary[token];
  }

  // Handle Square-1 tuples dynamically
  if (token.startsWith('(') && token.endsWith(')')) {
    const match = token.match(/\((-?\d+),(-?\d+)\)/);
    if (match) {
      const top = parseInt(match[1], 10);
      const bottom = parseInt(match[2], 10);
      return {
        name: `Putaran Lapisan (${top}, ${bottom})`,
        desc: `Putar lapisan atas ${top * 30}° dan lapisan bawah ${bottom * 30}°.`
      };
    }
  }

  // Fallback generic translation
  return {
    name: `Gerakan ${token}`,
    desc: `Eksekusi manipulasi layer notasi ${token} pada puzzle ${puzzleId}.`
  };
}

/**
 * Returns structured learning guide stages for a puzzle.
 */
export function getGuideStages(puzzleId) {
  const spec = PUZZLE_SPECS[puzzleId];
  if (!spec) throw new Error(`Unknown puzzle ID '${puzzleId}'`);

  const commonStages = [
    {
      id: `${puzzleId}-stage-1`,
      title: 'Tahap 1: Pengenalan & Metode Pemula',
      desc: `Pengenalan anatomi ${spec.name} dan panduan ${spec.beginnerMethod} yang ramah pemula.`,
      cases: [
        {
          id: `${puzzleId}-c1`,
          name: 'Pola Dasar Sisi Pertama',
          algorithm: puzzleId === 'cube-3x3' ? 'R U R\' U\'' : (puzzleId === 'pyraminx' ? 'u l r b' : 'R U R\''),
          description: 'Langkah pertama menyusun orientasi lapisan dasar secara intuitif.'
        }
      ]
    },
    {
      id: `${puzzleId}-stage-2`,
      title: 'Tahap 2: Penyelesaian Lapisan / Reduksi',
      desc: 'Pengembangan struktur puzzle menuju tahap akhir.',
      cases: [
        {
          id: `${puzzleId}-c2`,
          name: 'Algoritma Orientasi & Permutasi',
          algorithm: puzzleId === 'cube-4x4' ? 'Rw U2 x Rw U2' : 'R U R\' U R U2 R\'',
          description: 'Penyelarasan potongan sudut dan rusuk.'
        }
      ]
    },
    {
      id: `${puzzleId}-stage-parity`,
      title: 'Tahap Khusus: Kasus Macet & Paritas',
      desc: 'Penanganan anomali matematis dan algoritma paritas khusus.',
      cases: [
        {
          id: `${puzzleId}-parity-c`,
          name: puzzleId.includes('4x4') ? 'Lucas OLL Parity' : (puzzleId === 'square1' ? 'Square-1 Odd Parity' : 'Kasus Macet Terakhir'),
          algorithm: puzzleId === 'cube-4x4'
            ? 'Rw U2 x Rw U2 Rw U2 Rw\' U2 Lw U2 Rw\' U2 Rw U2 Rw\' U2 Rw\''
            : (puzzleId === 'square1' ? '/ (-3,0) / (0,3) / (-3,0) / (3,0) /' : 'R\' L R L\''),
          description: 'Solusi matematis untuk menyelesaikan permutasi ganjil.'
        }
      ]
    }
  ];

  return commonStages;
}

/**
 * Returns popular stuck presets catalog for a puzzle.
 */
export function getPresets(puzzleId) {
  const basePresets = [
    {
      id: 'solved',
      name: 'Kondisi Selesai (Solved)',
      stateDescription: 'Seluruh stiker berada pada muka warna yang tepat.',
      algorithm: ''
    }
  ];

  if (puzzleId === 'cube-3x3') {
    return [
      ...basePresets,
      {
        id: 'checkerboard',
        name: 'Papan Catur (Checkerboard)',
        stateDescription: 'Pola artistik papan catur saling silang pada seluruh 6 sisi.',
        algorithm: 'R2 L2 U2 D2 F2 B2'
      },
      {
        id: 'superflip',
        name: 'Superflip (12 Rusuk Terbalik)',
        stateDescription: 'Seluruh 12 rusuk terbalik orientasinya di tempat masing-masing.',
        algorithm: 'U R2 F B R B2 R U2 L B2 R U\' D\' R2 F R\' L B2 U2 F2'
      },
      {
        id: 'cube-in-cube',
        name: 'Kubus di dalam Kubus',
        stateDescription: 'Pola estetika blok 2x2 terputar di dalam kubus 3x3.',
        algorithm: 'F L F U\' R U F2 L2 U\' L\' B D\' B\' L2 U'
      }
    ];
  }

  if (puzzleId === 'cube-4x4') {
    return [
      ...basePresets,
      {
        id: 'oll-parity',
        name: '4x4 Lucas OLL Parity',
        stateDescription: 'Satu pasang sayap terbalik pada lapisan atas.',
        algorithm: 'Rw U2 x Rw U2 Rw U2 Rw\' U2 Lw U2 Rw\' U2 Rw U2 Rw\' U2 Rw\''
      },
      {
        id: 'pll-parity',
        name: '4x4 PLL Parity (Opposite Edges)',
        stateDescription: 'Dua pasang rusuk komposit saling tertukar di lapisan terakhir.',
        algorithm: '2R2 U2 2R2 Uw2 2R2 2U2'
      }
    ];
  }

  if (puzzleId === 'cube-5x5') {
    return [
      ...basePresets,
      {
        id: 'wing-parity',
        name: '5x5 Wing Flip Parity',
        stateDescription: 'Sepasang sayap luar terbalik relatif terhadap midge tengah.',
        algorithm: 'Rw U2 x Rw U2 Rw U2 Rw\' U2 Lw U2 3Rw\' U2 Rw U2 Rw\' U2 Rw\''
      },
      {
        id: 'l2c-barswap',
        name: '5x5 Last 2 Centers Bar Swap',
        stateDescription: 'Pertukaran bar 1x3 antara center atas dan depan.',
        algorithm: 'Rw U Rw\' U Rw U2 Rw\''
      }
    ];
  }

  if (puzzleId === 'pyraminx') {
    return [
      ...basePresets,
      {
        id: 'polish-flip',
        name: 'Polish Two-Edge Flip',
        stateDescription: 'Dua rusuk pada posisi yang benar tetapi warna terbalik.',
        algorithm: 'R\' L R L\' U L\' U\' L'
      }
    ];
  }

  if (puzzleId === 'skewb') {
    return [
      ...basePresets,
      {
        id: 'sledgehammer',
        name: 'Sledgehammer Cycle',
        stateDescription: 'Rotasi sudut komutator Sarah.',
        algorithm: 'R\' L R L\''
      },
      {
        id: 'center-swap',
        name: 'Center Commutator y2',
        stateDescription: 'Menukar center atas dan depan tanpa mengubah orientasi sudut.',
        algorithm: 'R\' L R L\' y2 R\' L R L\''
      }
    ];
  }

  if (puzzleId === 'square1') {
    return [
      ...basePresets,
      {
        id: 'odd-parity',
        name: 'Square-1 Odd Parity',
        stateDescription: 'Dua rusuk atas saling bertukar sementara seluruh bagian lain selesai.',
        algorithm: '/ (-3,0) / (0,3) / (-3,0) / (3,0) / (-2,0) / (0,2) / (-4,2) / (4,0) / (0,-2) / (0,2) / (-1,4) / (0,-3) / (0,3)'
      },
      {
        id: 'scallop-kite',
        name: 'Scallop-Kite Cube Shape',
        stateDescription: 'Pola bentuk shape-shifting scallop dan kite sebelum kembali ke kubus.',
        algorithm: '(-2,-4) / (-1,-2) / (-3,-3) /'
      }
    ];
  }

  return basePresets;
}

/**
 * Returns 2D Net layout specification for state customizer.
 */
export function get2DNetLayout(puzzleId) {
  const spec = PUZZLE_SPECS[puzzleId];
  if (!spec) throw new Error(`Unknown puzzle ID '${puzzleId}'`);

  if (spec.category === 'nxn') {
    return {
      type: 'cubic-cross',
      faces: ['U', 'L', 'F', 'R', 'B', 'D'],
      gridDimension: spec.order,
      stickersPerFace: spec.stickersPerFace,
      hasFixedCenter: spec.hasFixedCenter,
      centerIndex: spec.hasFixedCenter ? Math.floor(spec.stickersPerFace / 2) : null
    };
  }

  if (puzzleId === 'pyraminx') {
    return {
      type: 'tetrahedral-flower',
      faces: ['D', 'F', 'L', 'R'],
      stickersPerFace: 9,
      totalStickers: 36
    };
  }

  if (puzzleId === 'megaminx') {
    return {
      type: 'dodecahedral-dual-flower',
      clusters: ['top-flower', 'bottom-flower'],
      facesCount: 12,
      stickersPerFace: 11,
      totalStickers: 132
    };
  }

  if (puzzleId === 'skewb') {
    return {
      type: 'diamond-corner-cross',
      faces: ['U', 'L', 'F', 'R', 'B', 'D'],
      facetsPerFace: 5,
      totalStickers: 30
    };
  }

  if (puzzleId === 'square1') {
    return {
      type: 'dual-disc-equator',
      discs: ['top', 'bottom'],
      equator: 'middle',
      totalStickers: 18
    };
  }

  throw new Error(`Unsupported net layout for '${puzzleId}'`);
}
