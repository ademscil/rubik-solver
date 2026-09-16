/**
 * src/solvers/reduction5x5Analyzer.js
 * Intelligent 5x5 Reduction State Analyzer & Curriculum Navigator
 * 
 * Inspects any 2D net layout or 3D sticker state on a 5x5 Professor Cube
 * to determine the exact reduction stage:
 * 1. 6 Center Blocks (3x3 core within each 5x5 face)
 * 2. First 8 Edges (Free Slice pairing)
 * 3. Last 4 Edges (L4E Slice-Flip-Slice)
 * 4. 3x3 Reduction Stage (Outer face moves)
 * 5. Wing Parity & PLL Completion
 */

// In a 5x5 face (25 stickers, 0..24), the 9 center stickers forming the 3x3 block are:
// Row 1: 6, 7, 8
// Row 2: 11, 12, 13 (12 is the fixed center)
// Row 3: 16, 17, 18
export const CENTER_INDICES_5X5 = Object.freeze([6, 7, 8, 11, 12, 13, 16, 17, 18]);
export const FIXED_CENTER_INDEX_5X5 = 12;

/**
 * Checks if the 3x3 center block on a single face is completely solved
 * (all 9 stickers match the fixed center at index 12).
 * 
 * @param {string[]} faceStickers - 25 color hexes for the face
 * @returns {boolean}
 */
export function isFaceCenterSolved5x5(faceStickers) {
  if (!Array.isArray(faceStickers) || faceStickers.length < 25) return false;
  const fixedColor = faceStickers[FIXED_CENTER_INDEX_5X5];
  if (!fixedColor) return false;

  return CENTER_INDICES_5X5.every(idx => faceStickers[idx] === fixedColor);
}

/**
 * Checks if all 6 face centers on a 5x5 cube are solved (forming 6 solid 3x3 center blocks).
 * 
 * @param {Record<string, string[]>} netState
 * @returns {{
 *   solvedFaces: Record<string, boolean>,
 *   allCentersSolved: boolean,
 *   uDComplete: boolean,
 *   sideCentersComplete: boolean
 * }}
 */
export function analyzeCenters5x5(netState) {
  const faces = ['U', 'D', 'F', 'B', 'L', 'R'];
  const solvedFaces = {};

  faces.forEach(f => {
    solvedFaces[f] = isFaceCenterSolved5x5(netState?.[f]);
  });

  const uDComplete = !!(solvedFaces.U && solvedFaces.D);
  const sideCentersComplete = !!(solvedFaces.F && solvedFaces.B && solvedFaces.L && solvedFaces.R);
  const allCentersSolved = uDComplete && sideCentersComplete;

  return {
    solvedFaces,
    allCentersSolved,
    uDComplete,
    sideCentersComplete
  };
}

/**
 * Checks if an edge triplet (wing-midge-wing) on two adjacent faces is paired.
 * A 5x5 edge consists of 3 stickers on Face A and 3 corresponding stickers on Face B.
 */
function isEdgeTripletPaired(stickersA, indicesA, stickersB, indicesB) {
  if (!stickersA || !stickersB) return false;
  const colA = stickersA[indicesA[1]]; // midge color
  const colB = stickersB[indicesB[1]]; // midge color

  const wingsMatchA = (stickersA[indicesA[0]] === colA && stickersA[indicesA[2]] === colA);
  const wingsMatchB = (stickersB[indicesB[0]] === colB && stickersB[indicesB[2]] === colB);

  return wingsMatchA && wingsMatchB;
}

/**
 * Analyzes the 12 composite tredges of a 5x5 cube.
 * 
 * @param {Record<string, string[]>} netState
 * @returns {{ pairedCount: number, allEdgesPaired: boolean }}
 */
export function analyzeEdges5x5(netState) {
  if (!netState) return { pairedCount: 0, allEdgesPaired: false };

  // 12 edges defined by their 3 facelet indices on adjacent faces
  // Top layer edges:
  // UF: U row 4 (21,22,23) with F row 0 (1,2,3)
  // UB: U row 0 (1,2,3) with B row 0 (1,2,3)
  // UL: U col 0 (5,10,15) with L row 0 (1,2,3)
  // UR: U col 4 (9,14,19) with R row 0 (1,2,3)
  // Bottom layer edges:
  // DF: D row 0 (1,2,3) with F row 4 (21,22,23)
  // DB: D row 4 (21,22,23) with B row 4 (21,22,23)
  // DL: D col 0 (5,10,15) with L row 4 (21,22,23)
  // DR: D col 4 (9,14,19) with R row 4 (21,22,23)
  // Middle layer edges:
  // FL: F col 0 (5,10,15) with L col 4 (9,14,19)
  // FR: F col 4 (9,14,19) with R col 0 (5,10,15)
  // BL: B col 4 (9,14,19) with L col 0 (5,10,15)
  // BR: B col 0 (5,10,15) with R col 4 (9,14,19)

  const edges = [
    { a: 'U', ia: [21, 22, 23], b: 'F', ib: [1, 2, 3] },
    { a: 'U', ia: [1, 2, 3], b: 'B', ib: [1, 2, 3] },
    { a: 'U', ia: [5, 10, 15], b: 'L', ib: [1, 2, 3] },
    { a: 'U', ia: [9, 14, 19], b: 'R', ib: [1, 2, 3] },
    { a: 'D', ia: [1, 2, 3], b: 'F', ib: [21, 22, 23] },
    { a: 'D', ia: [21, 22, 23], b: 'B', ib: [21, 22, 23] },
    { a: 'D', ia: [5, 10, 15], b: 'L', ib: [21, 22, 23] },
    { a: 'D', ia: [9, 14, 19], b: 'R', ib: [21, 22, 23] },
    { a: 'F', ia: [5, 10, 15], b: 'L', ib: [9, 14, 19] },
    { a: 'F', ia: [9, 14, 19], b: 'R', ib: [5, 10, 15] },
    { a: 'B', ia: [9, 14, 19], b: 'L', ib: [5, 10, 15] },
    { a: 'B', ia: [5, 10, 15], b: 'R', ib: [9, 14, 19] }
  ];

  let pairedCount = 0;
  edges.forEach(e => {
    if (isEdgeTripletPaired(netState[e.a], e.ia, netState[e.b], e.ib)) {
      pairedCount++;
    }
  });

  return {
    pairedCount,
    allEdgesPaired: pairedCount === 12
  };
}

/**
 * Performs a comprehensive reduction state analysis of a 5x5 Rubik's Cube.
 * 
 * @param {Record<string, string[]>} netState
 * @returns {{
 *   stageIndex: number,
 *   stageId: string,
 *   stageTitle: string,
 *   stageBadge: string,
 *   formulaName: string,
 *   summary: string,
 *   tips: string,
 *   highlightMode: 'centers' | 'edges' | 'parity' | 'all',
 *   suggestedCaseIds: string[]
 * }}
 */
export function analyze5x5ReductionState(netState) {
  const centers = analyzeCenters5x5(netState);
  const edges = analyzeEdges5x5(netState);

  // Stage 1: First 2 Centers (White & Yellow)
  if (!centers.uDComplete) {
    return {
      stageIndex: 0,
      stageId: '5x5-stage-centers',
      stageTitle: 'Tahap 1: Membangun 2 Pusat Pertama (Putih & Kuning)',
      stageBadge: 'Tahap 1: 2 Pusat',
      formulaName: "Rw U Rw' + 2Rw U 2Rw'",
      summary: 'Susun baris 1x3 pusat putih di dasar, lalu susun baris 1x3 pusat kuning di sisi seberangnya.',
      tips: 'Buat garis tengah 1x3 terlebih dahulu dengan irisan Rw / 2Rw, lalu gabungkan kedua garis samping.',
      highlightMode: 'centers',
      suggestedCaseIds: ['5x5-c-barswap', '5x5-c-corner']
    };
  }

  // Stage 2: Last 4 Side Centers
  if (!centers.sideCentersComplete) {
    return {
      stageIndex: 0,
      stageId: '5x5-stage-centers',
      stageTitle: 'Tahap 2: Membangun 4 Pusat Samping (Membentuk 6 Blok 3x3 Dalam)',
      stageBadge: 'Tahap 2: 4 Pusat',
      formulaName: "3Rw U 3Rw' + 2Rw U' 2Rw'",
      summary: 'Selesaikan pusat depan, kanan, kiri, dan belakang menggunakan komutator bar 1x3.',
      tips: 'Gunakan komutator push-turn-restore agar pusat putih dan kuning yang sudah jadi tidak rusak.',
      highlightMode: 'centers',
      suggestedCaseIds: ['5x5-c-barswap', '5x5-c-corner']
    };
  }

  // Stage 3: First 8 Edges (Free Slice pairing)
  if (edges.pairedCount < 8) {
    return {
      stageIndex: 1,
      stageId: '5x5-stage-edges-first8',
      stageTitle: `Tahap 3: Memasangkan 8 Rusuk Pertama (${edges.pairedCount}/8 Selesai)`,
      stageBadge: `Tahap 3: Rusuk (${edges.pairedCount}/8)`,
      formulaName: "(Dd) R F' U R' F (Dd)'",
      summary: 'Pasangkan rusuk sayap luar ke rusuk tengah (midge) menggunakan teknik Free Slice.',
      tips: 'Gunakan Kasus 3 untuk memasukkan sayap ke slot kanan dan Kasus 4 untuk slot kiri.',
      highlightMode: 'edges',
      suggestedCaseIds: ['5x5-case-3', '5x5-case-4', '5x5-case-5', '5x5-flipping-trigger']
    };
  }

  // Stage 4: Last 4 Edges (L4E Slice-Flip-Slice)
  if (edges.pairedCount < 12) {
    return {
      stageIndex: 2,
      stageId: '5x5-stage-edges-last4',
      stageTitle: `Tahap 4: Memasangkan 4 Rusuk Terakhir (${edges.pairedCount}/12 Selesai)`,
      stageBadge: `Tahap 4: L4E (${edges.pairedCount}/12)`,
      formulaName: "(Uu)2 (Rr)2 F2 u2 F2 (Rr)2 (Uu)2 / L2E",
      summary: 'Selesaikan 4 rusuk terakhir tanpa merusak 8 rusuk bawah menggunakan rumus Kasus 6, 7, 8, 9, 10.',
      tips: 'Jika dua sayap tertukar di lapisan atas, gunakan rumus Kasus 6 atau komutator Kasus 8.',
      highlightMode: 'edges',
      suggestedCaseIds: ['5x5-case-6', '5x5-case-7', '5x5-case-8', '5x5-case-9', '5x5-case-10']
    };
  }

  // Stage 5: 3x3 Phase or Parity
  return {
    stageIndex: 3,
    stageId: '5x5-stage-3x3',
    stageTitle: 'Tahap 5: Seluruh Rusuk & Pusat Telah Menjadi Kubus 3x3!',
    stageBadge: 'Tahap 5: Fase 3x3',
    formulaName: "CFOP / LBL 3x3 Standar + Kasus 1 Paritas",
    summary: '6 Pusat dan 12 Rusuk telah tereduksi menjadi kubus 3x3. Selesaikan hanya dengan memutar lapisan luar 1 lapis.',
    tips: 'Jika pada lapisan terakhir sayap rusuk terbalik sendirian, gunakan rumus Kasus 1 Paritas Sayap.',
    highlightMode: 'all',
    suggestedCaseIds: ['5x5-3x3-step', '5x5-case-1', '5x5-case-2']
  };
}
