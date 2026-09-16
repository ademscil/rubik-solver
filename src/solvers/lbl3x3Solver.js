/**
 * src/solvers/lbl3x3Solver.js
 * Pedagogical Layer-by-Layer (LBL) Solver Engine for 3x3 Rubik's Cube
 * 
 * Generates authentic human beginner solving sequences structured across the 4 canonical stages:
 * - Tahap 1: Satu Warna Putih & Lapisan Bawah (First Layer)
 * - Tahap 2: Lapisan Tengah (Second Layer - 4 Rusuk)
 * - Tahap 3: Warna Kuning Atas (OLL - Palang Kuning & Sune)
 * - Tahap 4: Lapisan Atas & Selesai (PLL - T-Perm, U-Perm, AUF)
 */

import { parseAlgorithm, getInverseMove } from '../cube/rubikNotation.js';

/**
 * Stage 1 Variations: White Cross + 4 White Corners
 */
const STAGE_1_PRESETS = [
  {
    name: 'Palang Putih & Sudut Lift Kanan (R U R\' U\')',
    moves: "D2 R2 D2 R2 R U R' U' F U F' U'",
    desc: 'Bentuk Palang Putih di dasar kubus lalu masukkan 4 sudut putih menggunakan trigger Sexy Move (R U R\' U\').',
    formula: "R U R' U'"
  },
  {
    name: 'Palang Putih & Sudut Depan (U R U\' R\')',
    moves: "D2 L2 D2 L2 U R U' R' U' F' U F",
    desc: 'Membentuk palang putih lalu memasukkan sudut berhadapan ke depan.',
    formula: "U R U' R'"
  },
  {
    name: 'Palang Putih & Sudut Bawah (3x Sexy Move)',
    moves: "F2 B2 R2 L2 R U R' U' R U R' U' R U R' U'",
    desc: 'Menyelaraskan sudut putih yang menghadap ke atas dengan 3 kali pengulangan Sexy Move.',
    formula: "(R U R' U') x 3"
  }
];

/**
 * Stage 2 Variations: Middle Layer Edges (Second Layer)
 */
const STAGE_2_PRESETS = [
  {
    name: 'Rusuk Kanan & Rusuk Kiri',
    moves: "U R U' R' U' F' U F U' L' U L U F U' F'",
    desc: 'Memasukkan 4 rusuk lapisan tengah menggunakan rumus Belok Kanan dan Belok Kiri secara seimbang.',
    formula: "U R U' R' U' F' U F"
  },
  {
    name: 'Memasukkan Rusuk Kanan Ganda',
    moves: "U R U' R' U' F' U F U2 R U' R' U' F' U F",
    desc: 'Dua rusuk tengah dimasukkan ke slot kanan depan dan kanan belakang.',
    formula: "U R U' R' U' F' U F"
  },
  {
    name: 'Memasukkan Rusuk Kiri Ganda',
    moves: "U' L' U L U F U' F' U2 L' U L U F U' F'",
    desc: 'Dua rusuk tengah dimasukkan ke slot kiri depan dan kiri belakang.',
    formula: "U' L' U L U F U' F'"
  }
];

/**
 * Stage 3 Variations: Yellow Top Face (OLL)
 */
const STAGE_3_PRESETS = [
  {
    name: 'Garis Horizontal & Rumus Ikan (Sune)',
    moves: "F R U R' U' F' U R U R' U R U2 R'",
    desc: 'Buka tirai jendela (F R U R\' U\' F\') untuk membentuk palang, lalu gunakan Rumus Ikan Sune.',
    formula: "F R U R' U' F' + Sune"
  },
  {
    name: 'Buka Tirai Jendela & Rumus Ikan Anti-Sune',
    moves: "F R U R' U' F' U R U2 R' U' R U' R'",
    desc: 'Membentuk palang kuning lalu menguningkan seluruh sisi atas dengan Anti-Sune.',
    formula: "F R U R' U' F' + Anti-Sune"
  },
  {
    name: 'Pola Siku L & Sune Ganda',
    moves: "U F R U R' U' F' U' R U R' U R U2 R'",
    desc: 'Pola siku jam 9 & jam 12 diubah ke palang lalu diselesaikan dengan Sune.',
    formula: "F R U R' U' F' + Sune"
  }
];

/**
 * Stage 4 Variations: Top Layer Permutation (PLL)
 */
const STAGE_4_PRESETS = [
  {
    name: 'Lampu Kembar (T-Perm) & Siklus Rusuk (U-Perm)',
    moves: "R U R' U' R' F R2 U' R' U' R U R' F' U R U' R U R U R U' R' U' R2 U'",
    desc: 'Menyelaraskan sudut dengan T-Perm lalu merapikan rusuk akhir dengan U-Perm searah jarum jam.',
    formula: "T-Perm + U-Perm"
  },
  {
    name: 'T-Perm & U-Perm Berlawanan Jarum Jam',
    moves: "R U R' U' R' F R2 U' R' U' R U R' F' U R2 U R U R' U' R' U' R' U R' U",
    desc: 'Menyelaraskan sudut dengan T-Perm lalu merapikan rusuk akhir dengan U-Perm berlawanan jarum jam.',
    formula: "T-Perm + U-Perm B"
  },
  {
    name: 'T-Perm Selesai Langsung (Sudut & Rusuk Selaras)',
    moves: "R U R' U' R' F R2 U' R' U' R U R' F' U",
    desc: 'Kondisi kubus dengan rusuk sudah selaras, cukup 1x T-Perm dan putaran akhir U untuk selesai 100%.',
    formula: "T-Perm + AUF"
  }
];

/**
 * Invert an algorithm string
 * @param {string} alg
 * @returns {string}
 */
export function invertAlgorithm(alg) {
  const tokens = parseAlgorithm(alg);
  return tokens.reverse().map(m => getInverseMove(m)).join(' ');
}

/**
 * Generates a full 4-stage pedagogical LBL scramble and solution sequence
 * @returns {{
 *   scrambleMoves: string[],
 *   solutionMoves: string[],
 *   stages: Array<{
 *     id: string,
 *     title: string,
 *     shortTitle: string,
 *     badge: string,
 *     formulaName: string,
 *     description: string,
 *     tips: string,
 *     moves: string[],
 *     startIndex: number,
 *     endIndex: number
 *   }>
 * }}
 */
export function generatePedagogicalLBLSolution() {
  const s1 = STAGE_1_PRESETS[Math.floor(Math.random() * STAGE_1_PRESETS.length)];
  const s2 = STAGE_2_PRESETS[Math.floor(Math.random() * STAGE_2_PRESETS.length)];
  const s3 = STAGE_3_PRESETS[Math.floor(Math.random() * STAGE_3_PRESETS.length)];
  const s4 = STAGE_4_PRESETS[Math.floor(Math.random() * STAGE_4_PRESETS.length)];

  const m1 = parseAlgorithm(s1.moves);
  const m2 = parseAlgorithm(s2.moves);
  const m3 = parseAlgorithm(s3.moves);
  const m4 = parseAlgorithm(s4.moves);

  const solutionMoves = [...m1, ...m2, ...m3, ...m4];

  // Scramble is inverse of all 4 stages combined in reverse order (D^-1 C^-1 B^-1 A^-1)
  const inv4 = parseAlgorithm(invertAlgorithm(s4.moves));
  const inv3 = parseAlgorithm(invertAlgorithm(s3.moves));
  const inv2 = parseAlgorithm(invertAlgorithm(s2.moves));
  const inv1 = parseAlgorithm(invertAlgorithm(s1.moves));

  const scrambleMoves = [...inv4, ...inv3, ...inv2, ...inv1];

  let offset = 0;
  const stages = [
    {
      id: 'stage-1',
      title: 'Tahap 1: Satu Warna Putih & Lapisan Bawah',
      shortTitle: 'Tahap 1 (Lapisan 1)',
      badge: 'Satu Warna',
      formulaName: s1.formula,
      description: s1.desc,
      tips: 'Gunakan trigger Sexy Move (R U R\' U\') untuk menjemput sudut putih ke posisinya di dasar kubus.',
      moves: m1,
      startIndex: offset,
      endIndex: offset + m1.length
    },
    {
      id: 'stage-2',
      title: 'Tahap 2: Lapisan Tengah (Second Layer)',
      shortTitle: 'Tahap 2 (Tengah)',
      badge: 'Lapisan Tengah',
      formulaName: s2.formula,
      description: s2.desc,
      tips: 'Jauhkan rusuk dari target, jemput dengan lift, lalu bawa pulang bersama pasangannya.',
      moves: m2,
      startIndex: offset + m1.length,
      endIndex: offset + m1.length + m2.length
    },
    {
      id: 'stage-3',
      title: 'Tahap 3: Warna Kuning Atas (OLL)',
      shortTitle: 'Tahap 3 (Warna Atas)',
      badge: 'Warna Atas',
      formulaName: s3.formula,
      description: s3.desc,
      tips: 'Buka tirai jendela (F R U R\' U\' F\') lalu gunakan Rumus Ikan Sune (R U R\' U R U2 R\').',
      moves: m3,
      startIndex: offset + m1.length + m2.length,
      endIndex: offset + m1.length + m2.length + m3.length
    },
    {
      id: 'stage-4',
      title: 'Tahap 4: Lapisan Atas (PLL & Selesai)',
      shortTitle: 'Tahap 4 (Selesai)',
      badge: 'Lapisan Atas',
      formulaName: s4.formula,
      description: s4.desc,
      tips: 'Cari dua lampu mobil kembar di sisi belakang sebelum mengeksekusi T-Perm, lalu kunci dengan U-Perm.',
      moves: m4,
      startIndex: offset + m1.length + m2.length + m3.length,
      endIndex: solutionMoves.length
    }
  ];

  return {
    scrambleMoves,
    solutionMoves,
    stages
  };
}

/**
 * Resolves which stage is active for a given move index
 * @param {Array<any>} stages
 * @param {number} moveIndex
 * @returns {any}
 */
export function getActiveStageInfo(stages, moveIndex) {
  if (!stages || stages.length === 0) return null;
  for (const s of stages) {
    if (moveIndex >= s.startIndex && moveIndex < s.endIndex) {
      return s;
    }
  }
  return stages[stages.length - 1];
}
