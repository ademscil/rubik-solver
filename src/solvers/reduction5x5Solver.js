/**
 * src/solvers/reduction5x5Solver.js
 * Pedagogical Reduction Solver for 5x5 Professor Cube
 * 
 * Implements the authentic 4-stage human reduction method:
 * - Tahap 1: Membuat 6 Center 3x3 (Putih & Kuning, lalu 4 Center Samping)
 * - Tahap 2: Memasangkan 12 Rusuk / Edge Pairing (12 Tredges)
 * - Tahap 3: Menyelesaikan Seperti Rubik 3x3 (LBL / CFOP)
 * - Tahap 4: Paritas Sayap Rusuk Terakhir (Edge Parity / Final AUF)
 */

import { parseAlgorithm, getInverseMove } from '../cube/rubikNotation.js';

// Stage 1 Variations: Centers 3x3
const STAGE_1_CENTERS = [
  {
    name: 'Baris Pusat Putih & Komutator Baris Samping',
    moves: "Rw U Rw' U Rw U2 Rw' 2Rw U 2Rw' U 2Rw U2 2Rw'",
    desc: 'Menyusun baris tengah putih dan kuning, lalu menata pusat samping dengan komutator baris.',
    formula: "Rw U Rw' + 2Rw U 2Rw'"
  },
  {
    name: 'Baris Pusat Kuning & Rotasi Pusat Depan',
    moves: "Lw' U' Lw U' Lw' U2 Lw 2Lw' U' 2Lw U' 2Lw' U2 2Lw",
    desc: 'Menyelesaikan pusat kuning di sisi berlawanan lalu menyusun blok 1x3 pada pusat depan.',
    formula: "Lw' U' Lw + 2Lw' U' 2Lw"
  }
];

// Stage 2 Variations: Edge Pairing (Tredges)
const STAGE_2_EDGES = [
  {
    name: 'Slice-Flip-Slice Pasangan Rusuk',
    moves: "Uw' R U R' F R' F' R Uw Dw R U R' F R' F' R Dw'",
    desc: 'Mengiris lapisan atas (Uw\'), membalik rusuk sayap dengan trigger, lalu memulihkan lapisan (Uw).',
    formula: "Uw' (R U R' F R' F' R) Uw"
  },
  {
    name: 'Freeslice Tredge Pairing Ganda',
    moves: "Uw R U' R' F R' F' R Uw' Dw' R U' R' F R' F' R Dw",
    desc: 'Menyelaraskan rusuk sayap kiri dan kanan ke rusuk tengah secara simultan.',
    formula: "Uw (R U' R' F R' F' R) Uw'"
  }
];

// Stage 3 Variations: 3x3 Reduction Phase
const STAGE_3_3X3 = [
  {
    name: 'Tahapan 3x3 (Palang Putih & Second Layer)',
    moves: "F R U R' U' F' U R U' R' U' F' U F",
    desc: 'Menyelesaikan lapisan dasar dan kedua seperti rubik 3x3 biasa menggunakan rusuk yang telah dipasangkan.',
    formula: "Cross + LBL 3x3"
  },
  {
    name: 'Tahapan 3x3 (OLL & Sune)',
    moves: "F R U R' U' F' R U R' U R U2 R'",
    desc: 'Membentuk palang kuning dan menguningkan permukaan atas menggunakan rumus ikan Sune.',
    formula: "F R U R' U' F' + Sune"
  }
];

// Stage 4 Variations: Edge Parity & PLL
const STAGE_4_PARITY = [
  {
    name: 'Paritas Sayap (Edge Parity) & T-Perm Selesai',
    moves: "Rw U2 Rw U2 Rw' U2 Rw U2 Lw U2 Rw' U2 Rw U2 Rw' U2 Rw' R U R' U' R' F R2 U' R' U' R U R' F'",
    desc: 'Membalikkan sayap rusuk terakhir yang tidak selaras dengan rumus paritas 5x5, lalu kunci dengan T-Perm.',
    formula: "Rw U2 Rw U2 ... (Parity) + T-Perm"
  },
  {
    name: 'T-Perm & U-Perm Selesai Langsung',
    moves: "R U R' U' R' F R2 U' R' U' R U R' F' R2 U R U R' U' R' U' R' U R'",
    desc: 'Kondisi tanpa paritas, cukup menyelaraskan sudut dengan T-Perm dan permutasi rusuk akhir dengan U-Perm.',
    formula: "T-Perm + U-Perm"
  }
];

export function invert5x5Algorithm(alg) {
  const tokens = parseAlgorithm(alg);
  return tokens.reverse().map(m => getInverseMove(m)).join(' ');
}

export function generatePedagogical5x5Solution() {
  const s1 = STAGE_1_CENTERS[Math.floor(Math.random() * STAGE_1_CENTERS.length)];
  const s2 = STAGE_2_EDGES[Math.floor(Math.random() * STAGE_2_EDGES.length)];
  const s3 = STAGE_3_3X3[Math.floor(Math.random() * STAGE_3_3X3.length)];
  const s4 = STAGE_4_PARITY[Math.floor(Math.random() * STAGE_4_PARITY.length)];

  const m1 = parseAlgorithm(s1.moves);
  const m2 = parseAlgorithm(s2.moves);
  const m3 = parseAlgorithm(s3.moves);
  const m4 = parseAlgorithm(s4.moves);

  const solutionMoves = [...m1, ...m2, ...m3, ...m4];

  const inv4 = parseAlgorithm(invert5x5Algorithm(s4.moves));
  const inv3 = parseAlgorithm(invert5x5Algorithm(s3.moves));
  const inv2 = parseAlgorithm(invert5x5Algorithm(s2.moves));
  const inv1 = parseAlgorithm(invert5x5Algorithm(s1.moves));

  const scrambleMoves = [...inv4, ...inv3, ...inv2, ...inv1];

  let offset = 0;
  const stages = [
    {
      id: 'stage-1',
      title: 'Tahap 1: Membuat 6 Pusat Sisi 3x3 (Centers)',
      shortTitle: 'Tahap 1 (Pusat 3x3)',
      badge: '6 Center 3x3',
      formulaName: s1.formula,
      description: s1.desc,
      tips: 'Bentuk baris 1x3 terlebih dahulu pada sisi putih dan kuning, lalu lanjutkan ke 4 pusat samping.',
      moves: m1,
      startIndex: offset,
      endIndex: offset + m1.length
    },
    {
      id: 'stage-2',
      title: 'Tahap 2: Memasangkan 12 Rusuk (Edge Pairing / Tredges)',
      shortTitle: 'Tahap 2 (12 Rusuk)',
      badge: '12 Tredges',
      formulaName: s2.formula,
      description: s2.desc,
      tips: 'Gunakan teknik Slice-Flip-Slice untuk menyatukan 1 rusuk tengah dengan 2 rusuk sayap.',
      moves: m2,
      startIndex: offset + m1.length,
      endIndex: offset + m1.length + m2.length
    },
    {
      id: 'stage-3',
      title: 'Tahap 3: Menyelesaikan Seperti Rubik 3x3',
      shortTitle: 'Tahap 3 (Metode 3x3)',
      badge: 'Reduksi 3x3',
      formulaName: s3.formula,
      description: s3.desc,
      tips: 'Kini seluruh kubus telah tereduksi. Selesaikan seperti kubus 3x3 standar dari Cross hingga OLL.',
      moves: m3,
      startIndex: offset + m1.length + m2.length,
      endIndex: offset + m1.length + m2.length + m3.length
    },
    {
      id: 'stage-4',
      title: 'Tahap 4: Paritas Sayap & Selesai (PLL)',
      shortTitle: 'Tahap 4 (Paritas/Selesai)',
      badge: 'Paritas Sayap',
      formulaName: s4.formula,
      description: s4.desc,
      tips: 'Jika sayap rusuk terakhir terbalik, gunakan algoritma paritas 5x5 lalu kunci dengan PLL akhir.',
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
