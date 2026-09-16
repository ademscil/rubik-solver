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
export const PART_1_FIRST_CENTERS = [
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
export const PART_2_SIDE_CENTERS = [
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
export const PART_3_FIRST_EDGES = [
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
export const PART_4_LAST_EDGES = [
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
export const PART_5_3X3_PHASE = [
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
export const PART_6_PARITY_PLL = [
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

export const REDUCTION_5X5_CASES = Object.freeze({
  case1: {
    id: 'case-1',
    num: 1,
    name: "Kasus 1: Paritas Sayap Rusuk Terbalik (OLL Parity)",
    rawFormula: "(Rr)2 B2 U2 (Ll) U2 (Rr)' U2 (Rr) U2 F2 (Rr) F2 (Ll)' B2 (Rr)2",
    moves: "2R2 B2 U2 2L U2 2R' U2 2R U2 F2 2R F2 2L' B2 2R2",
    desc: 'Membalik sepasang sayap luar pada rusuk depan-atas (UF) tanpa merusak midge tengah.'
  },
  case2: {
    id: 'case-2',
    num: 2,
    name: "Kasus 2: Menukar Sepasang Sayap Bersebelahan",
    rawFormula: "(Ll)' U2 (Ll)' U2 F2 (Ll)' F2 (Rr) U2 (Rr)' U2 (Ll)2",
    moves: "2L' U2 2L' U2 F2 2L' F2 2R U2 2R' U2 2L2",
    desc: 'Menukar dua pasang sayap rusuk yang bersebelahan.'
  },
  case3: {
    id: 'case-3',
    num: 3,
    name: "Kasus 3: Memasukkan Sayap Bawah ke Depan-Kanan",
    rawFormula: "(Dd) R F' U R' F (Dd)'",
    moves: "Dw R F' U R' F Dw'",
    desc: 'Mengambil sayap rusuk dari bawah ke kanan-depan.'
  },
  case4: {
    id: 'case-4',
    num: 4,
    name: "Kasus 4: Memasukkan Sayap Bawah ke Depan-Kiri",
    rawFormula: "(Dd)' L' U' L F' L F L' (Dd)",
    moves: "Dw' L' U' L F' L F L' Dw",
    desc: 'Mengambil sayap rusuk dari bawah ke kiri-depan.'
  },
  case5: {
    id: 'case-5',
    num: 5,
    name: "Kasus 5: Memasangkan Dua Sayap Sekaligus",
    rawFormula: "(Dd) (Uu)' R F' U R' F (Dd)' (Uu)",
    moves: "Dw Uw' R F' U R' F Dw' Uw",
    desc: 'Memasangkan dua sayap rusuk sekaligus menggunakan irisan ganda.'
  },
  case6: {
    id: 'case-6',
    num: 6,
    name: "Kasus 6: Menukar Dua Sayap di Baris Atas",
    rawFormula: "(Uu)2 (Rr)2 F2 u2 F2 (Rr)2 (Uu)2",
    moves: "Uw2 2R2 F2 2U2 F2 2R2 Uw2",
    desc: 'Menukar dua stiker sayap di baris atas tanpa merusak pusat.'
  },
  case7: {
    id: 'case-7',
    num: 7,
    name: "Kasus 7: Membalik Sayap Terbalik pada Rusuk Sama",
    rawFormula: "F2 (Rr) D2 (Rr)' F2 U2 F2 (Ll) B2 (Ll)'",
    moves: "F2 2R D2 2R' F2 U2 F2 2L B2 2L'",
    desc: 'Membalikkan sayap yang terbalik orientasinya pada rusuk yang sama.'
  },
  case8: {
    id: 'case-8',
    num: 8,
    name: "Kasus 8: Komutator Dua Rusuk Terakhir (L2E)",
    rawFormula: "(Rr)2 B2 (Rr)' U2 (Rr)' U2 B2 (Rr)' B2 (Rr) B2 (Rr)' B2 (Rr)2",
    moves: "2R2 B2 2R' U2 2R' U2 B2 2R' B2 2R B2 2R' B2 2R2",
    desc: 'Komutator penyelesaian dua rusuk terakhir untuk menyelaraskan kedua sayap sekaligus.'
  },
  case9: {
    id: 'case-9',
    num: 9,
    name: "Kasus 9: Siklus 3 Sayap Sisi Kiri",
    rawFormula: "(Ll) U2 (Ll)2 U2 (Ll)' U2 (Ll) U2 (Ll)' U2 (Ll)2 U2 (Ll)",
    moves: "2L U2 2L2 U2 2L' U2 2L U2 2L' U2 2L2 U2 2L",
    desc: 'Memutar 3 sayap rusuk di sisi kiri secara siklis.'
  },
  case10: {
    id: 'case-10',
    num: 10,
    name: "Kasus 10: Siklus 3 Sayap Sisi Kanan",
    rawFormula: "(Rr)' U2 (Rr)2 U2 (Rr) U2 (Rr)' U2 (Rr) U2 (Rr)2 U2 (Rr)'",
    moves: "2R' U2 2R2 U2 2R U2 2R' U2 2R U2 2R2 U2 2R'",
    desc: 'Memutar 3 sayap rusuk di sisi kanan secara siklis.'
  }
});

export function invert5x5Algorithm(alg) {
  const tokens = parseAlgorithm(alg);
  return tokens.reverse().map(m => getInverseMove(m)).join(' ');
}

export function generatePedagogical5x5Solution() {
  const p1Moves = "Rw U Rw' U Rw U2 Rw' 2Rw U 2Rw' U 2Rw U2 2Rw'";
  const p2Moves = "3Rw U 3Rw' U 3Rw U2 3Rw' 2Rw U' 2Rw' U' 2Rw U2 2Rw'";
  const p3Moves = `${REDUCTION_5X5_CASES.case3.moves} ${REDUCTION_5X5_CASES.case4.moves}`;
  const p4Moves = `${REDUCTION_5X5_CASES.case6.moves} ${REDUCTION_5X5_CASES.case8.moves}`;
  const p5Moves = "F R U R' U' F' U R U' R' U' F' U F R U R' U R U2 R'";
  const p6Moves = `${REDUCTION_5X5_CASES.case1.moves} R U R' U' R' F R2 U' R' U' R U R' F'`;

  const m1 = parseAlgorithm(p1Moves);
  const m2 = parseAlgorithm(p2Moves);
  const m3 = parseAlgorithm(p3Moves);
  const m4 = parseAlgorithm(p4Moves);
  const m5 = parseAlgorithm(p5Moves);
  const m6 = parseAlgorithm(p6Moves);

  const solutionMoves = [...m1, ...m2, ...m3, ...m4, ...m5, ...m6];

  const inv6 = parseAlgorithm(invert5x5Algorithm(p6Moves));
  const inv5 = parseAlgorithm(invert5x5Algorithm(p5Moves));
  const inv4 = parseAlgorithm(invert5x5Algorithm(p4Moves));
  const inv3 = parseAlgorithm(invert5x5Algorithm(p3Moves));
  const inv2 = parseAlgorithm(invert5x5Algorithm(p2Moves));
  const inv1 = parseAlgorithm(invert5x5Algorithm(p1Moves));

  const scrambleMoves = [...inv6, ...inv5, ...inv4, ...inv3, ...inv2, ...inv1];

  let offset = 0;
  const stages = [
    {
      id: 'part-1',
      title: 'Part 1: Membuat 2 Center Pertama (Putih & Kuning)',
      shortTitle: 'Part 1 (Center 1-2)',
      badge: 'Part 1: Center 1-2',
      formulaName: "Rw U Rw' + 2Rw U 2Rw'",
      description: 'Menyusun baris tengah 1x3 pusat putih di dasar, lalu menyusun baris tengah 1x3 pusat kuning di sisi seberangnya.',
      tips: 'Buat baris tengah 1x3 terlebih dahulu, lalu gabungkan dengan dua baris samping.',
      moves: m1,
      startIndex: offset,
      endIndex: offset + m1.length
    },
    {
      id: 'part-2',
      title: 'Part 2: Membuat 4 Center Samping (Membentuk Blok 3x3 Dalam)',
      shortTitle: 'Part 2 (Center Samping)',
      badge: 'Part 2: 4 Center',
      formulaName: "3Rw U 3Rw' + 2Rw U' 2Rw'",
      description: 'Menyelesaikan pusat depan, kanan, kiri, dan belakang menggunakan komutator baris.',
      tips: 'Gunakan komutator baris agar center putih dan kuning yang sudah jadi tidak rusak.',
      moves: m2,
      startIndex: offset + m1.length,
      endIndex: offset + m1.length + m2.length
    },
    {
      id: 'part-3',
      title: 'Part 3: Memasangkan 8 Rusuk Pertama (Kasus 3, 4, 5)',
      shortTitle: 'Part 3 (8 Rusuk)',
      badge: 'Part 3: 8 Tredges',
      formulaName: "(Dd) R F' U R' F (Dd)'",
      description: 'Memasangkan sayap luar ke rusuk tengah (midge) membentuk triplet pada lapisan bebas (Free Slice).',
      tips: 'Gunakan rumus Kasus 3 dan Kasus 4 untuk memasukkan sayap dari lapisan bawah ke slot FR/FL.',
      moves: m3,
      startIndex: offset + m1.length + m2.length,
      endIndex: offset + m1.length + m2.length + m3.length
    },
    {
      id: 'part-4',
      title: 'Part 4: Memasangkan 4 Rusuk Terakhir (Kasus 6, 7, 8, 9, 10)',
      shortTitle: 'Part 4 (4 Rusuk Akhir)',
      badge: 'Part 4: 4 Rusuk',
      formulaName: "(Uu)2 (Rr)2 F2 u2 F2 (Rr)2 (Uu)2",
      description: 'Menyelesaikan 4 rusuk terakhir tanpa merusak 8 rusuk yang telah selesai di lapisan bawah.',
      tips: 'Gunakan rumus Kasus 6 untuk menukar sayap atas dan Kasus 8 untuk komutator L2E.',
      moves: m4,
      startIndex: offset + m1.length + m2.length + m3.length,
      endIndex: offset + m1.length + m2.length + m3.length + m4.length
    },
    {
      id: 'part-5',
      title: 'Part 5: Menyelesaikan Seperti Rubik 3x3 (Cross, F2L, OLL Sune)',
      shortTitle: 'Part 5 (Tahap 3x3)',
      badge: 'Part 5: Reduksi 3x3',
      formulaName: "Cross + F2L + OLL Sune",
      description: 'Seluruh center dan rusuk telah menyatu membentuk kubus 3x3. Gerakkan hanya lapisan luar 1 lapis.',
      tips: 'Gunakan teknik 3x3 standar: palang putih, dua lapis pertama, dan menguningkan sisi atas.',
      moves: m5,
      startIndex: offset + m1.length + m2.length + m3.length + m4.length,
      endIndex: offset + m1.length + m2.length + m3.length + m4.length + m5.length
    },
    {
      id: 'part-6',
      title: 'Part 6: Paritas Rusuk 5x5 & PLL Selesai (Kasus 1 & 2)',
      shortTitle: 'Part 6 (Paritas & Selesai)',
      badge: 'Part 6: Paritas Sayap',
      formulaName: "(Rr)2 B2 U2 (Ll) U2 (Rr)' U2 (Rr) U2 F2 (Rr) F2 (Ll)' B2 (Rr)2",
      description: 'Menyelesaikan kondisi sayap rusuk terbalik dengan rumus Kasus 1, lalu menyelesaikan PLL dengan T-Perm.',
      tips: 'Jika sayap rusuk terakhir terbalik, eksekusi rumus Kasus 1 dari posisi muka terbalik di Depan-Atas (UF).',
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
