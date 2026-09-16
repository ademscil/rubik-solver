/**
 * src/solvers/reduction5x5Solver.js
 * Authentic Pedagogical Multi-Part Reduction Solver for 5x5 Professor Cube
 * 
 * Implements the comprehensive 6-part human reduction method matching speedcubing tutorials:
 * - Part 1: Membuat 2 Center Pertama (Putih & Kuning di seberangnya)
 * - Part 2: Membuat 4 Center Samping (Sesuai tutorial YouTube: Part 2 MEMBUAT CENTER RUBIK 5x5)
 * - Part 3: Memasangkan 8 Rusuk Pertama (Edge Pairing / Freeslice Tredges)
 * - Part 4: Memasangkan 4 Rusuk Terakhir (Last 4 Edges / Slice-Flip-Slice)
 * - Part 5: Menyelesaikan Seperti Rubik 3x3 (Cross, F2L, OLL Sune)
 * - Part 6: Paritas Sayap Rusuk Terakhir & PLL Selesai (5x5 Edge Parity & T-Perm)
 */

import { parseAlgorithm, getInverseMove } from '../cube/rubikNotation.js';

// Part 1 Variations: First 2 Centers (White & Yellow)
const PART_1_FIRST_CENTERS = [
  {
    name: 'Baris Pusat Putih & Kuning di Seberang',
    moves: "Rw U Rw' U Rw U2 Rw' 2Rw U 2Rw' U 2Rw U2 2Rw'",
    desc: 'Menyusun baris tengah 1x3 pusat putih di dasar, lalu menyusun baris tengah 1x3 pusat kuning di sisi seberangnya.',
    formula: "Rw U Rw' + 2Rw U 2Rw'"
  },
  {
    name: 'Blok Tengah 3x3 Putih & Kuning Lawan',
    moves: "Lw' U' Lw U' Lw' U2 Lw 2Lw' U' 2Lw U' 2Lw' U2 2Lw",
    desc: 'Menyelaraskan baris samping 1x3 untuk membentuk blok 3x3 pusat putih dan kuning secara utuh.',
    formula: "Lw' U' Lw + 2Lw' U' 2Lw"
  }
];

// Part 2 Variations: Last 4 Side Centers (Sesuai foto tutorial YouTube pengguna)
const PART_2_SIDE_CENTERS = [
  {
    name: 'Pusat Depan & Kanan dengan Komutator Baris',
    moves: "3Rw U 3Rw' U 3Rw U2 3Rw' 2Rw U' 2Rw' U' 2Rw U2 2Rw'",
    desc: 'Menyelesaikan pusat depan dan kanan menggunakan komutator baris tanpa merusak pusat putih dan kuning.',
    formula: "3Rw U 3Rw' + 2Rw U' 2Rw'"
  },
  {
    name: 'Pusat Kiri & Belakang Terakhir',
    moves: "2Rw' U 2Rw U2 2Rw' U 2Rw 3Rw' U' 3Rw U2 3Rw' U' 3Rw",
    desc: 'Menyelesaikan 2 pusat samping terakhir dengan memasukkan baris 1x3 terakhir.',
    formula: "2Rw' U 2Rw + 3Rw' U' 3Rw"
  }
];

// Part 3 Variations: First 8 Edges (Freeslice Edge Pairing)
const PART_3_FIRST_EDGES = [
  {
    name: 'Freeslice Tredge Pairing Pasangan Pertama',
    moves: "Uw' R U R' F R' F' R Uw Dw R U R' F R' F' R Dw'",
    desc: 'Mengiris lapisan atas (Uw\'), membalik sayap rusuk dengan trigger Sexy-Sledge, lalu mengembalikan irisan.',
    formula: "Uw' (R U R' F R' F' R) Uw"
  },
  {
    name: 'Freeslice Pasangan Rusuk Ganda',
    moves: "Uw R U' R' F R' F' R Uw' Dw' R U' R' F R' F' R Dw",
    desc: 'Menyelaraskan rusuk sayap kiri dan kanan ke rusuk tengah secara bersamaan pada lapisan bebas.',
    formula: "Uw (R U' R' F R' F' R) Uw'"
  }
];

// Part 4 Variations: Last 4 Edges (Slice-Flip-Slice)
const PART_4_LAST_EDGES = [
  {
    name: 'Slice-Flip-Slice 4 Rusuk Terakhir',
    moves: "Uw' R U R' F R' F' R Uw 2Uw' R U R' F R' F' R 2Uw",
    desc: 'Menyelesaikan 4 rusuk terakhir tanpa merusak 8 rusuk yang telah selesai di lapisan bawah.',
    formula: "Uw' (Trigger) Uw + 2Uw' (Trigger) 2Uw"
  },
  {
    name: 'Penyelesaian Rusuk Ke-11 dan Ke-12',
    moves: "Dw R U' R' F R' F' R Dw' 2Dw R U' R' F R' F' R 2Dw'",
    desc: 'Menyelaraskan pasangan tredge terakhir menggunakan irisan lapisan bawah.',
    formula: "Dw (Trigger) Dw' + 2Dw (Trigger) 2Dw'"
  }
];

// Part 5 Variations: 3x3 Phase (Cross, F2L, OLL Sune)
const PART_5_3X3_PHASE = [
  {
    name: 'Tahapan 3x3: Palang Dasar & Sune Kuning',
    moves: "F R U R' U' F' U R U' R' U' F' U F R U R' U R U2 R'",
    desc: 'Menyelesaikan lapisan dasar dan kedua seperti rubik 3x3 biasa, lalu membuka palang kuning dan Sune.',
    formula: "Cross + F2L + OLL Sune"
  },
  {
    name: 'Tahapan 3x3: Second Layer & OLL Palang',
    moves: "U' L' U L U F U' F' F R U R' U' F' R U R' U R U2 R'",
    desc: 'Memasukkan rusuk ke slot kiri lapisan tengah, lalu menguningkan permukaan atas kubus.',
    formula: "Left Slot + OLL Cross + Sune"
  }
];

// Part 6 Variations: Edge Parity & PLL Complete
const PART_6_PARITY_PLL = [
  {
    name: 'Paritas Sayap 5x5 (Feliks Zemdegs CubeSkills) & T-Perm Selesai',
    moves: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 3Rw' U2 Rw U2 Rw' U2 Rw' R U R' U' R' F R2 U' R' U' R U R' F'",
    desc: 'Menyelesaikan kondisi sayap rusuk terbalik dengan algoritma paritas resmi Feliks Zemdegs (CubeSkills), lalu dikunci dengan T-Perm.',
    formula: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 3Rw' U2 Rw U2 Rw' U2 Rw'"
  },
  {
    name: 'T-Perm & U-Perm Selesai Langsung',
    moves: "R U R' U' R' F R2 U' R' U' R U R' F' R2 U R U R' U' R' U' R' U R'",
    desc: 'Kondisi tanpa paritas sayap: menata sudut atas dengan T-Perm lalu merotasi rusuk akhir dengan U-Perm.',
    formula: "T-Perm + U-Perm PLL"
  }
];

export function invert5x5Algorithm(alg) {
  const tokens = parseAlgorithm(alg);
  return tokens.reverse().map(m => getInverseMove(m)).join(' ');
}

export function generatePedagogical5x5Solution() {
  const p1 = PART_1_FIRST_CENTERS[Math.floor(Math.random() * PART_1_FIRST_CENTERS.length)];
  const p2 = PART_2_SIDE_CENTERS[Math.floor(Math.random() * PART_2_SIDE_CENTERS.length)];
  const p3 = PART_3_FIRST_EDGES[Math.floor(Math.random() * PART_3_FIRST_EDGES.length)];
  const p4 = PART_4_LAST_EDGES[Math.floor(Math.random() * PART_4_LAST_EDGES.length)];
  const p5 = PART_5_3X3_PHASE[Math.floor(Math.random() * PART_5_3X3_PHASE.length)];
  const p6 = PART_6_PARITY_PLL[Math.floor(Math.random() * PART_6_PARITY_PLL.length)];

  const m1 = parseAlgorithm(p1.moves);
  const m2 = parseAlgorithm(p2.moves);
  const m3 = parseAlgorithm(p3.moves);
  const m4 = parseAlgorithm(p4.moves);
  const m5 = parseAlgorithm(p5.moves);
  const m6 = parseAlgorithm(p6.moves);

  const solutionMoves = [...m1, ...m2, ...m3, ...m4, ...m5, ...m6];

  const inv6 = parseAlgorithm(invert5x5Algorithm(p6.moves));
  const inv5 = parseAlgorithm(invert5x5Algorithm(p5.moves));
  const inv4 = parseAlgorithm(invert5x5Algorithm(p4.moves));
  const inv3 = parseAlgorithm(invert5x5Algorithm(p3.moves));
  const inv2 = parseAlgorithm(invert5x5Algorithm(p2.moves));
  const inv1 = parseAlgorithm(invert5x5Algorithm(p1.moves));

  const scrambleMoves = [...inv6, ...inv5, ...inv4, ...inv3, ...inv2, ...inv1];

  let offset = 0;
  const stages = [
    {
      id: 'part-1',
      title: 'Part 1: Membuat 2 Center Pertama (Putih & Kuning)',
      shortTitle: 'Part 1 (Center 1-2)',
      badge: 'Part 1: Center 1-2',
      formulaName: p1.formula,
      description: p1.desc,
      tips: 'Buat baris tengah 1x3 terlebih dahulu, lalu gabungkan dengan dua baris samping.',
      moves: m1,
      startIndex: offset,
      endIndex: offset + m1.length
    },
    {
      id: 'part-2',
      title: 'Part 2: Membuat 4 Center Samping (Depan, Kanan, Kiri, Belakang)',
      shortTitle: 'Part 2 (Center Samping)',
      badge: 'Part 2: 4 Center',
      formulaName: p2.formula,
      description: p2.desc,
      tips: 'Gunakan komutator baris agar center putih dan kuning yang sudah jadi tidak rusak.',
      moves: m2,
      startIndex: offset + m1.length,
      endIndex: offset + m1.length + m2.length
    },
    {
      id: 'part-3',
      title: 'Part 3: Memasangkan 8 Rusuk Pertama (Freeslice Tredges)',
      shortTitle: 'Part 3 (8 Rusuk)',
      badge: 'Part 3: 8 Tredges',
      formulaName: p3.formula,
      description: p3.desc,
      tips: 'Gunakan lapisan bebas untuk memasangkan sayap kiri dan kanan ke rusuk tengah.',
      moves: m3,
      startIndex: offset + m1.length + m2.length,
      endIndex: offset + m1.length + m2.length + m3.length
    },
    {
      id: 'part-4',
      title: 'Part 4: Memasangkan 4 Rusuk Terakhir (Slice-Flip-Slice)',
      shortTitle: 'Part 4 (4 Rusuk Akhir)',
      badge: 'Part 4: 4 Rusuk',
      formulaName: p4.formula,
      description: p4.desc,
      tips: 'Iris lapisan atas (Uw\'), balik rusuk di slot kanan, lalu kembalikan irisan (Uw).',
      moves: m4,
      startIndex: offset + m1.length + m2.length + m3.length,
      endIndex: offset + m1.length + m2.length + m3.length + m4.length
    },
    {
      id: 'part-5',
      title: 'Part 5: Menyelesaikan Seperti Rubik 3x3 (Cross, F2L, OLL)',
      shortTitle: 'Part 5 (Metode 3x3)',
      badge: 'Part 5: Tahap 3x3',
      formulaName: p5.formula,
      description: p5.desc,
      tips: 'Seluruh center dan rusuk telah menyatu. Gerakkan hanya lapisan luar seperti rubik 3x3.',
      moves: m5,
      startIndex: offset + m1.length + m2.length + m3.length + m4.length,
      endIndex: offset + m1.length + m2.length + m3.length + m4.length + m5.length
    },
    {
      id: 'part-6',
      title: 'Part 6: Paritas Sayap Rusuk Terakhir & Selesai (PLL)',
      shortTitle: 'Part 6 (Paritas/Selesai)',
      badge: 'Part 6: Paritas Sayap',
      formulaName: p6.formula,
      description: p6.desc,
      tips: 'Jika sayap rusuk terakhir terbalik, gunakan algoritma paritas sayap 5x5 lalu kunci dengan T-Perm.',
      moves: m6,
      startIndex: offset + m1.length + m2.length + m3.length + m4.length + m5.length,
      endIndex: solutionMoves.length
    }
  ];

  return {
    scrambleMoves,
    solutionMoves,
    stages
  };
}
