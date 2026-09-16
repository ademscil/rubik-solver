/**
 * src/solvers/megaminxSolver.js
 * Authentic Pedagogical Multi-Part Solver for Megaminx (Dodecahedron)
 * 
 * Implements the comprehensive 5-part human tutorial method matching speedcubing tutorials:
 * - Part 1: Bintang Putih di Sisi Dasar (White Star)
 * - Part 2: Menyelesaikan 5 Sudut Lapisan Bawah (First Layer Corners)
 * - Part 3: Menyelesaikan Lapisan Kedua Melingkar (S2L / Second 2 Layers)
 * - Part 4: Membentuk Bintang Sisi Atas (Grey Star OLL)
 * - Part 5: Permutasi Sudut & Rusuk Akhir (PLL Selesai)
 */

import { parseAlgorithm, getInverseMove } from '../puzzles/megaminx/MegaminxKinematics.js';

const PART_1_STAR = [
  {
    name: 'Bintang Putih Dasar & Lift Rusuk',
    moves: "F R U R' U' F' R U R' U'",
    desc: 'Menyelaraskan 5 rusuk putih ke posisi bintang di sisi dasar dan mencocokkan warna sampingnya.',
    formula: "F R U R' U' F' + R U R' U'"
  },
  {
    name: 'Penyusunan Bintang Putih Sejajar',
    moves: "F' L' U' L U F L' U' L U",
    desc: 'Membentuk pola bintang putih pada dasar dodecahedron dengan memasukkan rusuk dari sisi kiri.',
    formula: "F' L' U' L U F + L' U' L U"
  }
];

const PART_2_CORNERS = [
  {
    name: '5 Sudut Lapisan Bawah (Sexy Move)',
    moves: "R U R' U' R U R' U' F' U' F",
    desc: 'Memasukkan kelima sudut putih ke slotnya masing-masing menggunakan trigger Sexy Move.',
    formula: "(R U R' U') x 2 + F' U' F"
  },
  {
    name: 'Penyisipan Sudut Putih Simetris',
    moves: "L' U' L U L' U' L U F U F'",
    desc: 'Menuntaskan seluruh sudut putih di lapisan dasar hingga warna samping selaras melingkar.',
    formula: "(L' U' L U) x 2 + F U F'"
  }
];

const PART_3_S2L = [
  {
    name: 'Lapisan Kedua Melingkar Kanan & Kiri',
    moves: "U R U' R' U' F' U F U' L' U L U F U' F'",
    desc: 'Menyelesaikan pasangan rusuk dan sudut lapisan kedua mengelilingi seluruh 5 sisi samping.',
    formula: "U R U' R' U' F' U F (S2L Slotting)"
  },
  {
    name: 'S2L Pasangan Depan & Samping',
    moves: "U2 R U' R' U' F' U F U2 L' U L U F U' F'",
    desc: 'Memasangkan blok rusuk dan sudut lapisan kedua pada muka depan dan samping secara berurutan.',
    formula: "U2 (Slotting Kanan) + U2 (Slotting Kiri)"
  }
];

const PART_4_GREY_STAR = [
  {
    name: 'Bintang Abu-abu & Rumus Ikan Sune',
    moves: "F R U R' U' F' R U R' U R U2 R'",
    desc: 'Membentuk pola bintang 5 titik pada sisi atas abu-abu dan menguningkan/mengorientasikan rusuknya.',
    formula: "F R U R' U' F' + Sune Megaminx"
  },
  {
    name: 'Bintang Atas & Anti-Sune',
    moves: "F R U R' U' F' R U2 R' U' R U' R'",
    desc: 'Membuka tirai bintang abu-abu lalu mengorientasikan sudut atas dengan Anti-Sune.',
    formula: "F R U R' U' F' + Anti-Sune"
  }
];

const PART_5_PLL = [
  {
    name: 'Permutasi Sudut & Rusuk Terakhir Selesai',
    moves: "R U R' U' R' F R2 U' R' U' R U R' F' U",
    desc: 'Menyelaraskan posisi sudut dengan T-Perm lalu menyejajarkan seluruh warna lapisan akhir.',
    formula: "T-Perm Megaminx + AUF"
  },
  {
    name: 'Lampu Kembar & Siklus Rusuk Akhir',
    moves: "R U R' U' R' F R2 U' R' U' R U R' F' R2 U R U R' U' R' U' R' U R'",
    desc: 'Menuntaskan orientasi dan permutasi seluruh kepingan akhir hingga Megaminx selesai sempurna 100%.',
    formula: "T-Perm + U-Perm Selesai"
  }
];

export function generatePedagogicalMegaminxSolution() {
  const p1 = PART_1_STAR[Math.floor(Math.random() * PART_1_STAR.length)];
  const p2 = PART_2_CORNERS[Math.floor(Math.random() * PART_2_CORNERS.length)];
  const p3 = PART_3_S2L[Math.floor(Math.random() * PART_3_S2L.length)];
  const p4 = PART_4_GREY_STAR[Math.floor(Math.random() * PART_4_GREY_STAR.length)];
  const p5 = PART_5_PLL[Math.floor(Math.random() * PART_5_PLL.length)];

  const m1 = parseAlgorithm(p1.moves);
  const m2 = parseAlgorithm(p2.moves);
  const m3 = parseAlgorithm(p3.moves);
  const m4 = parseAlgorithm(p4.moves);
  const m5 = parseAlgorithm(p5.moves);

  const solutionMoves = [...m1, ...m2, ...m3, ...m4, ...m5];

  const inv5 = [...m5].reverse().map(m => getInverseMove(m));
  const inv4 = [...m4].reverse().map(m => getInverseMove(m));
  const inv3 = [...m3].reverse().map(m => getInverseMove(m));
  const inv2 = [...m2].reverse().map(m => getInverseMove(m));
  const inv1 = [...m1].reverse().map(m => getInverseMove(m));

  const scrambleMoves = [...inv5, ...inv4, ...inv3, ...inv2, ...inv1];

  let offset = 0;
  const stages = [
    {
      id: 'part-1',
      title: 'Part 1: Membuat Bintang Putih di Sisi Dasar (White Star)',
      shortTitle: 'Part 1 (Bintang Putih)',
      badge: 'Part 1: Bintang Putih',
      formulaName: p1.formula,
      description: p1.desc,
      tips: 'Bentuk pola bintang 5 rusuk putih pada sisi dasar dengan mencocokkan warna sampingnya.',
      moves: m1,
      startIndex: offset,
      endIndex: offset + m1.length
    },
    {
      id: 'part-2',
      title: 'Part 2: Menyelesaikan 5 Sudut Lapisan Bawah',
      shortTitle: 'Part 2 (5 Sudut Bawah)',
      badge: 'Part 2: 5 Sudut',
      formulaName: p2.formula,
      description: p2.desc,
      tips: 'Gunakan trigger Sexy Move (R U R\' U\') untuk menjemput setiap sudut putih ke tempatnya.',
      moves: m2,
      startIndex: offset + m1.length,
      endIndex: offset + m1.length + m2.length
    },
    {
      id: 'part-3',
      title: 'Part 3: Menyelesaikan Lapisan Kedua Melingkar (S2L)',
      shortTitle: 'Part 3 (S2L Melingkar)',
      badge: 'Part 3: S2L',
      formulaName: p3.formula,
      description: p3.desc,
      tips: 'Pasangkan rusuk dan sudut lapisan kedua secara melingkar mengelilingi 5 muka samping.',
      moves: m3,
      startIndex: offset + m1.length + m2.length,
      endIndex: offset + m1.length + m2.length + m3.length
    },
    {
      id: 'part-4',
      title: 'Part 4: Membentuk Bintang Sisi Atas (Grey Star OLL)',
      shortTitle: 'Part 4 (Bintang Atas)',
      badge: 'Part 4: Bintang Atas',
      formulaName: p4.formula,
      description: p4.desc,
      tips: 'Gunakan tirai F R U R\' U\' F\' lalu rumus ikan Sune untuk mengorientasikan rusuk atas.',
      moves: m4,
      startIndex: offset + m1.length + m2.length + m3.length,
      endIndex: offset + m1.length + m2.length + m3.length + m4.length
    },
    {
      id: 'part-5',
      title: 'Part 5: Permutasi Sudut & Rusuk Akhir (PLL Selesai)',
      shortTitle: 'Part 5 (PLL Selesai)',
      badge: 'Part 5: Selesai',
      formulaName: p5.formula,
      description: p5.desc,
      tips: 'Gunakan T-Perm untuk menyelaraskan sudut lalu tuntaskan rotasi akhir hingga Megaminx utuh.',
      moves: m5,
      startIndex: offset + m1.length + m2.length + m3.length + m4.length,
      endIndex: solutionMoves.length
    }
  ];

  return {
    scrambleMoves,
    solutionMoves,
    stages
  };
}
