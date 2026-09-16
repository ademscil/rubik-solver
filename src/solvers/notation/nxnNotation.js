/**
 * src/solvers/notation/nxnNotation.js
 * Universal WCA Notation Dictionary & Translator with Indonesian Explanations
 * Supports NxN Cubes N in {2, 3, 4, 5, 6, 7}.
 */

export const NXN_NOTATION_DICTIONARY = Object.freeze({
  // --- Outer Face Turns (Lapisan Terluar Tunggal) ---
  'R': { name: 'Right', desc: 'Putar 1 lapis sisi kanan searah jarum jam (ke atas)', axis: 'x', dir: -1 },
  "R'": { name: 'Right Prime', desc: 'Putar 1 lapis sisi kanan berlawanan arah jarum jam (ke bawah)', axis: 'x', dir: 1 },
  'R2': { name: 'Right Double', desc: 'Putar 1 lapis sisi kanan setengah putaran (180 derajat)', axis: 'x', dir: -2 },

  'L': { name: 'Left', desc: 'Putar 1 lapis sisi kiri searah jarum jam (ke bawah)', axis: 'x', dir: 1 },
  "L'": { name: 'Left Prime', desc: 'Putar 1 lapis sisi kiri berlawanan arah jarum jam (ke atas)', axis: 'x', dir: -1 },
  'L2': { name: 'Left Double', desc: 'Putar 1 lapis sisi kiri setengah putaran (180 derajat)', axis: 'x', dir: 2 },

  'U': { name: 'Up', desc: 'Putar 1 lapis sisi atas searah jarum jam (ke kiri)', axis: 'y', dir: -1 },
  "U'": { name: 'Up Prime', desc: 'Putar 1 lapis sisi atas berlawanan arah jarum jam (ke kanan)', axis: 'y', dir: 1 },
  'U2': { name: 'Up Double', desc: 'Putar 1 lapis sisi atas setengah putaran (180 derajat)', axis: 'y', dir: -2 },

  'D': { name: 'Down', desc: 'Putar 1 lapis sisi bawah searah jarum jam (ke kanan)', axis: 'y', dir: 1 },
  "D'": { name: 'Down Prime', desc: 'Putar 1 lapis sisi bawah berlawanan arah jarum jam (ke kiri)', axis: 'y', dir: -1 },
  'D2': { name: 'Down Double', desc: 'Putar 1 lapis sisi bawah setengah putaran (180 derajat)', axis: 'y', dir: 2 },

  'F': { name: 'Front', desc: 'Putar 1 lapis sisi depan searah jarum jam', axis: 'z', dir: -1 },
  "F'": { name: 'Front Prime', desc: 'Putar 1 lapis sisi depan berlawanan arah jarum jam', axis: 'z', dir: 1 },
  'F2': { name: 'Front Double', desc: 'Putar 1 lapis sisi depan setengah putaran (180 derajat)', axis: 'z', dir: -2 },

  'B': { name: 'Back', desc: 'Putar 1 lapis sisi belakang searah jarum jam (dilihat dari belakang)', axis: 'z', dir: 1 },
  "B'": { name: 'Back Prime', desc: 'Putar 1 lapis sisi belakang berlawanan arah jarum jam', axis: 'z', dir: -1 },
  'B2': { name: 'Back Double', desc: 'Putar 1 lapis sisi belakang setengah putaran (180 derajat)', axis: 'z', dir: 2 },

  // --- Wide Turns (2 Lapisan Luar) ---
  'Rw': { name: 'Right Wide', desc: 'Putar 2 lapisan kanan sekaligus ke atas', axis: 'x', dir: -1 },
  "Rw'": { name: 'Right Wide Prime', desc: 'Putar 2 lapisan kanan sekaligus ke bawah', axis: 'x', dir: 1 },
  'Rw2': { name: 'Right Wide Double', desc: 'Putar 2 lapisan kanan sekaligus 180 derajat', axis: 'x', dir: -2 },

  'Lw': { name: 'Left Wide', desc: 'Putar 2 lapisan kiri sekaligus ke bawah', axis: 'x', dir: 1 },
  "Lw'": { name: 'Left Wide Prime', desc: 'Putar 2 lapisan kiri sekaligus ke atas', axis: 'x', dir: -1 },
  'Lw2': { name: 'Left Wide Double', desc: 'Putar 2 lapisan kiri sekaligus 180 derajat', axis: 'x', dir: 2 },

  'Uw': { name: 'Up Wide', desc: 'Putar 2 lapisan atas sekaligus ke kiri', axis: 'y', dir: -1 },
  "Uw'": { name: 'Up Wide Prime', desc: 'Putar 2 lapisan atas sekaligus ke kanan', axis: 'y', dir: 1 },
  'Uw2': { name: 'Up Wide Double', desc: 'Putar 2 lapisan atas sekaligus 180 derajat', axis: 'y', dir: -2 },

  'Dw': { name: 'Down Wide', desc: 'Putar 2 lapisan bawah sekaligus ke kanan', axis: 'y', dir: 1 },
  "Dw'": { name: 'Down Wide Prime', desc: 'Putar 2 lapisan bawah sekaligus ke kiri', axis: 'y', dir: -1 },
  'Dw2': { name: 'Down Wide Double', desc: 'Putar 2 lapisan bawah sekaligus 180 derajat', axis: 'y', dir: 2 },

  'Fw': { name: 'Front Wide', desc: 'Putar 2 lapisan depan sekaligus searah jarum jam', axis: 'z', dir: -1 },
  "Fw'": { name: 'Front Wide Prime', desc: 'Putar 2 lapisan depan sekaligus berlawanan arah jarum jam', axis: 'z', dir: 1 },
  'Fw2': { name: 'Front Wide Double', desc: 'Putar 2 lapisan depan sekaligus 180 derajat', axis: 'z', dir: -2 },

  'Bw': { name: 'Back Wide', desc: 'Putar 2 lapisan belakang sekaligus searah jarum jam', axis: 'z', dir: 1 },
  "Bw'": { name: 'Back Wide Prime', desc: 'Putar 2 lapisan belakang sekaligus berlawanan arah jarum jam', axis: 'z', dir: -1 },
  'Bw2': { name: 'Back Wide Double', desc: 'Putar 2 lapisan belakang sekaligus 180 derajat', axis: 'z', dir: 2 },

  // Lowercase shorthand for wide turns (WCA compliant)
  'r': { name: 'Right Wide', desc: 'Putar 2 lapisan kanan sekaligus ke atas', axis: 'x', dir: -1 },
  "r'": { name: 'Right Wide Prime', desc: 'Putar 2 lapisan kanan sekaligus ke bawah', axis: 'x', dir: 1 },
  'r2': { name: 'Right Wide Double', desc: 'Putar 2 lapisan kanan sekaligus 180 derajat', axis: 'x', dir: -2 },

  'l': { name: 'Left Wide', desc: 'Putar 2 lapisan kiri sekaligus ke bawah', axis: 'x', dir: 1 },
  "l'": { name: 'Left Wide Prime', desc: 'Putar 2 lapisan kiri sekaligus ke atas', axis: 'x', dir: -1 },
  'l2': { name: 'Left Wide Double', desc: 'Putar 2 lapisan kiri sekaligus 180 derajat', axis: 'x', dir: 2 },

  'u': { name: 'Up Wide', desc: 'Putar 2 lapisan atas sekaligus ke kiri', axis: 'y', dir: -1 },
  "u'": { name: 'Up Wide Prime', desc: 'Putar 2 lapisan atas sekaligus ke kanan', axis: 'y', dir: 1 },
  'u2': { name: 'Up Wide Double', desc: 'Putar 2 lapisan atas sekaligus 180 derajat', axis: 'y', dir: -2 },

  'd': { name: 'Down Wide', desc: 'Putar 2 lapisan bawah sekaligus ke kanan', axis: 'y', dir: 1 },
  "d'": { name: 'Down Wide Prime', desc: 'Putar 2 lapisan bawah sekaligus ke kiri', axis: 'y', dir: -1 },
  'd2': { name: 'Down Wide Double', desc: 'Putar 2 lapisan bawah sekaligus 180 derajat', axis: 'y', dir: 2 },

  'f': { name: 'Front Wide', desc: 'Putar 2 lapisan depan sekaligus searah jarum jam', axis: 'z', dir: -1 },
  "f'": { name: 'Front Wide Prime', desc: 'Putar 2 lapisan depan sekaligus berlawanan arah jarum jam', axis: 'z', dir: 1 },
  'f2': { name: 'Front Wide Double', desc: 'Putar 2 lapisan depan sekaligus 180 derajat', axis: 'z', dir: -2 },

  'b': { name: 'Back Wide', desc: 'Putar 2 lapisan belakang sekaligus searah jarum jam', axis: 'z', dir: 1 },
  "b'": { name: 'Back Wide Prime', desc: 'Putar 2 lapisan belakang sekaligus berlawanan arah jarum jam', axis: 'z', dir: -1 },
  'b2': { name: 'Back Wide Double', desc: 'Putar 2 lapisan belakang sekaligus 180 derajat', axis: 'z', dir: 2 },

  // --- Multi-Layer Wide Turns (3 Lapisan untuk 5x5, 6x6, 7x7) ---
  '3Rw': { name: '3-Right Wide', desc: 'Putar 3 lapisan kanan sekaligus ke arah atas', axis: 'x', dir: -1 },
  "3Rw'": { name: '3-Right Wide Prime', desc: 'Putar 3 lapisan kanan sekaligus ke arah bawah', axis: 'x', dir: 1 },
  '3Rw2': { name: '3-Right Wide Double', desc: 'Putar 3 lapisan kanan sekaligus 180 derajat', axis: 'x', dir: -2 },

  '3Lw': { name: '3-Left Wide', desc: 'Putar 3 lapisan kiri sekaligus ke arah bawah', axis: 'x', dir: 1 },
  "3Lw'": { name: '3-Left Wide Prime', desc: 'Putar 3 lapisan kiri sekaligus ke arah atas', axis: 'x', dir: -1 },
  '3Lw2': { name: '3-Left Wide Double', desc: 'Putar 3 lapisan kiri sekaligus 180 derajat', axis: 'x', dir: 2 },

  '3Uw': { name: '3-Up Wide', desc: 'Putar 3 lapisan atas sekaligus ke arah kiri', axis: 'y', dir: -1 },
  "3Uw'": { name: '3-Up Wide Prime', desc: 'Putar 3 lapisan atas sekaligus ke arah kanan', axis: 'y', dir: 1 },
  '3Uw2': { name: '3-Up Wide Double', desc: 'Putar 3 lapisan atas sekaligus 180 derajat', axis: 'y', dir: -2 },

  '3Dw': { name: '3-Down Wide', desc: 'Putar 3 lapisan bawah sekaligus ke arah kanan', axis: 'y', dir: 1 },
  "3Dw'": { name: '3-Down Wide Prime', desc: 'Putar 3 lapisan bawah sekaligus ke arah kiri', axis: 'y', dir: -1 },
  '3Dw2': { name: '3-Down Wide Double', desc: 'Putar 3 lapisan bawah sekaligus 180 derajat', axis: 'y', dir: 2 },

  '3Fw': { name: '3-Front Wide', desc: 'Putar 3 lapisan depan sekaligus searah jarum jam', axis: 'z', dir: -1 },
  "3Fw'": { name: '3-Front Wide Prime', desc: 'Putar 3 lapisan depan sekaligus berlawanan arah jarum jam', axis: 'z', dir: 1 },
  '3Fw2': { name: '3-Front Wide Double', desc: 'Putar 3 lapisan depan sekaligus 180 derajat', axis: 'z', dir: -2 },

  '3Bw': { name: '3-Back Wide', desc: 'Putar 3 lapisan belakang sekaligus searah jarum jam', axis: 'z', dir: 1 },
  "3Bw'": { name: '3-Back Wide Prime', desc: 'Putar 3 lapisan belakang sekaligus berlawanan arah jarum jam', axis: 'z', dir: -1 },
  '3Bw2': { name: '3-Back Wide Double', desc: 'Putar 3 lapisan belakang sekaligus 180 derajat', axis: 'z', dir: 2 },

  // --- Slices & Inner Slice Turns (Irisan Dalam Tunggal) ---
  'M': { name: 'Middle Slice', desc: 'Lapisan tengah antara L dan R, berputar ke arah bawah (mengikuti L)', axis: 'x', dir: 1 },
  "M'": { name: 'Middle Slice Prime', desc: 'Lapisan tengah antara L dan R, berputar ke arah atas (mengikuti R)', axis: 'x', dir: -1 },
  'M2': { name: 'Middle Slice Double', desc: 'Lapisan tengah berputar 180 derajat', axis: 'x', dir: 2 },

  'E': { name: 'Equatorial Slice', desc: 'Lapisan tengah horizontal antara U dan D, berputar ke kanan (mengikuti D)', axis: 'y', dir: 1 },
  "E'": { name: 'Equatorial Slice Prime', desc: 'Lapisan tengah horizontal antara U dan D, berputar ke kiri (mengikuti U)', axis: 'y', dir: -1 },
  'E2': { name: 'Equatorial Slice Double', desc: 'Lapisan tengah horizontal berputar 180 derajat', axis: 'y', dir: 2 },

  'S': { name: 'Standing Slice', desc: 'Lapisan tengah vertikal antara F dan B, berputar searah jarum jam (mengikuti F)', axis: 'z', dir: -1 },
  "S'": { name: 'Standing Slice Prime', desc: 'Lapisan tengah vertikal antara F dan B, berputar berlawanan jarum jam', axis: 'z', dir: 1 },
  'S2': { name: 'Standing Slice Double', desc: 'Lapisan tengah vertikal berputar 180 derajat', axis: 'z', dir: -2 },

  '2R': { name: 'Inner Right Slice', desc: 'Hanya putar irisan dalam kanan lapisan ke-2 ke arah atas (sayap)', axis: 'x', dir: -1 },
  "2R'": { name: 'Inner Right Slice Prime', desc: 'Hanya putar irisan dalam kanan lapisan ke-2 ke arah bawah', axis: 'x', dir: 1 },
  '2R2': { name: 'Inner Right Slice Double', desc: 'Putar irisan dalam kanan lapisan ke-2 180 derajat', axis: 'x', dir: -2 },

  '2L': { name: 'Inner Left Slice', desc: 'Hanya putar irisan dalam kiri lapisan ke-2 ke arah bawah', axis: 'x', dir: 1 },
  "2L'": { name: 'Inner Left Slice Prime', desc: 'Hanya putar irisan dalam kiri lapisan ke-2 ke arah atas', axis: 'x', dir: -1 },
  '2L2': { name: 'Inner Left Slice Double', desc: 'Putar irisan dalam kiri lapisan ke-2 180 derajat', axis: 'x', dir: 2 },

  '2U': { name: 'Inner Up Slice', desc: 'Hanya putar irisan dalam atas lapisan ke-2 ke arah kiri', axis: 'y', dir: -1 },
  "2U'": { name: 'Inner Up Slice Prime', desc: 'Hanya putar irisan dalam atas lapisan ke-2 ke arah kanan', axis: 'y', dir: 1 },
  '2U2': { name: 'Inner Up Slice Double', desc: 'Putar irisan dalam atas lapisan ke-2 180 derajat', axis: 'y', dir: -2 },

  '2D': { name: 'Inner Down Slice', desc: 'Hanya putar irisan dalam bawah lapisan ke-2 ke arah kanan', axis: 'y', dir: 1 },
  "2D'": { name: 'Inner Down Slice Prime', desc: 'Hanya putar irisan dalam bawah lapisan ke-2 ke arah kiri', axis: 'y', dir: -1 },
  '2D2': { name: 'Inner Down Slice Double', desc: 'Putar irisan dalam bawah lapisan ke-2 180 derajat', axis: 'y', dir: 2 },

  '3R': { name: 'Third Layer Right Slice', desc: 'Hanya putar irisan dalam kanan lapisan ke-3 ke arah atas (pada 6x6 dan 7x7)', axis: 'x', dir: -1 },
  "3R'": { name: 'Third Layer Right Slice Prime', desc: 'Hanya putar irisan dalam kanan lapisan ke-3 ke arah bawah', axis: 'x', dir: 1 },
  '3R2': { name: 'Third Layer Right Slice Double', desc: 'Putar irisan dalam kanan lapisan ke-3 180 derajat', axis: 'x', dir: -2 },

  '3L': { name: 'Third Layer Left Slice', desc: 'Hanya putar irisan dalam kiri lapisan ke-3 ke arah bawah', axis: 'x', dir: 1 },
  "3L'": { name: 'Third Layer Left Slice Prime', desc: 'Hanya putar irisan dalam kiri lapisan ke-3 ke arah atas', axis: 'x', dir: -1 },
  '3L2': { name: 'Third Layer Left Slice Double', desc: 'Putar irisan dalam kiri lapisan ke-3 180 derajat', axis: 'x', dir: 2 },

  // --- Cube Rotations (Rotasi Seluruh Kubus) ---
  'x': { name: 'Rotate X', desc: 'Putar seluruh kubus mengikuti arah gerakan R (ke atas)', axis: 'x', dir: -1 },
  "x'": { name: 'Rotate X Prime', desc: 'Putar seluruh kubus mengikuti arah gerakan R\' (ke bawah)', axis: 'x', dir: 1 },
  'x2': { name: 'Rotate X Double', desc: 'Putar seluruh kubus 180 derajat pada sumbu X', axis: 'x', dir: -2 },

  'y': { name: 'Rotate Y', desc: 'Putar seluruh kubus mengikuti arah gerakan U (ke kiri)', axis: 'y', dir: -1 },
  "y'": { name: 'Rotate Y Prime', desc: 'Putar seluruh kubus mengikuti arah gerakan U\' (ke kanan)', axis: 'y', dir: 1 },
  'y2': { name: 'Rotate Y Double', desc: 'Putar seluruh kubus 180 derajat pada sumbu Y', axis: 'y', dir: -2 },

  'z': { name: 'Rotate Z', desc: 'Putar seluruh kubus mengikuti arah gerakan F (searah jarum jam)', axis: 'z', dir: -1 },
  "z'": { name: 'Rotate Z Prime', desc: 'Putar seluruh kubus mengikuti arah gerakan F\' (lawan arah jarum jam)', axis: 'z', dir: 1 },
  'z2': { name: 'Rotate Z Double', desc: 'Putar seluruh kubus 180 derajat pada sumbu Z', axis: 'z', dir: -2 }
});

/**
 * Inverts an individual WCA move token.
 * 180° moves are self-inverting (R2 -> R2).
 * Prime moves strip apostrophe (R' -> R).
 * Clockwise moves append apostrophe (R -> R').
 * 
 * @param {string} token
 * @returns {string} Inverted move token
 */
export function getInverseMove(token) {
  if (!token || typeof token !== 'string') return '';
  const t = token.trim();
  if (t === '') return '';

  if (t.endsWith('2')) {
    return t;
  }
  if (t.endsWith("'")) {
    return t.slice(0, -1);
  }
  return `${t}'`;
}

/**
 * Computes the complete inverse algorithm sequence.
 * Inverts the order of moves and inverts each token.
 * 
 * @param {string} algString
 * @returns {string} Inverted algorithm sequence
 */
export function invertAlgorithm(algString) {
  if (!algString || typeof algString !== 'string') return '';
  const cleaned = algString.replace(/[()[\]]/g, ' ').trim();
  if (!cleaned) return '';

  const tokens = cleaned.split(/\s+/).filter(Boolean);
  const inverted = tokens.map(getInverseMove).reverse();
  return inverted.join(' ');
}

/**
 * Splits an algorithm string into clean, valid tokens.
 * 
 * @param {string} algString
 * @returns {string[]} Array of move tokens
 */
export function parseAlgorithm(algString) {
  if (!algString || typeof algString !== 'string') return [];
  // Strip line comments, bracketed annotations [comment], and grouping symbols
  const withoutComments = algString
    .replace(/\/\/.*/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/[()[\]{}]/g, ' ');
  return withoutComments.trim().split(/\s+/).filter(t => t.length > 0);
}

/**
 * Retrieves Indonesian move information for UI tooltips and playback cues.
 * 
 * @param {string} move - Move notation token
 * @param {number} [order=3] - Optional cube order
 * @returns {{ name: string, desc: string, axis?: string, dir?: number }}
 */
export function getMoveInfo(move, order = 3) {
  if (!move || typeof move !== 'string') {
    return { name: '', desc: '' };
  }
  const clean = move.trim();
  if (NXN_NOTATION_DICTIONARY[clean]) {
    return NXN_NOTATION_DICTIONARY[clean];
  }

  // Dynamic fallback for arbitrary layer numbers (e.g. 4Rw, 5Rw)
  return {
    name: clean,
    desc: `Gerakan ${clean} pada kubus ${order}x${order}`
  };
}

/**
 * Provides Indonesian translation for WCA notation tokens.
 * 
 * @param {string} token
 * @param {string} [puzzleId='cube-3x3']
 * @returns {{ name: string, desc: string }}
 */
export function getIndonesianTranslation(token, puzzleId = 'cube-3x3') {
  return getMoveInfo(token, parseInt(puzzleId.replace(/\D/g, ''), 10) || 3);
}
