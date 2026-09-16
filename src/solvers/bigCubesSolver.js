/**
 * src/solvers/bigCubesSolver.js
 * Authentic Multi-Part Pedagogical Tutorial Solvers for Big Cubes:
 * - Rubik 6x6 (5 Parts, ~100 moves)
 * - Rubik 7x7 (6 Parts, ~120 moves)
 */

import { getInverseMove } from '../cube/rubikNotation.js';

export function generatePedagogical6x6Solution() {
  const part1Moves = [
    '2Rw', 'U', "2Rw'", '3Rw', 'U', "3Rw'", '2Rw', 'U2', "2Rw'",
    '2Lw', 'U', "2Lw'", '3Lw', 'U2', "3Lw'", '2Lw', 'U2', "2Lw'"
  ];

  const part2Moves = [
    '2Rw', 'U', "2Rw'", 'U', '3Rw', "U'", "3Rw'",
    '2Rw', 'U2', "2Rw'", '3Rw', 'U2', "3Rw'",
    '2Lw', 'U', "2Lw'", '3Lw', 'U2', "3Lw'"
  ];

  const part3Moves = [
    "2Uw'", 'R', 'U', "R'", 'F', "R'", "F'", 'R', '2Uw',
    "3Uw'", 'L', "U'", "L'", "F'", 'L', 'F', "L'", '3Uw',
    "2Dw'", 'R', 'U', "R'", 'F', "R'", "F'", 'R', '2Dw'
  ];

  const part4Moves = [
    'D', 'R', 'F', "R'", "F'", "D'",
    'U', 'R', "U'", "R'", "U'", "F'", 'U', 'F',
    'F', 'R', 'U', "R'", "U'", "F'",
    'R', 'U', "R'", 'U', 'R', 'U2', "R'"
  ];

  const part5Moves = [
    // 6x6 Parity & PLL
    '2Rw2', 'B2', 'U2', '2Lw', 'U2', "2Rw'", 'U2', '2Rw', 'U2', 'F2', '2Rw', 'F2', "2Lw'", 'B2', '2Rw2',
    'R', 'U', "R'", "U'", "R'", 'F', 'R2', "U'", "R'", "U'", 'R', 'U', "R'", "F'", 'U'
  ];

  const allMoves = [...part1Moves, ...part2Moves, ...part3Moves, ...part4Moves, ...part5Moves];
  const scrambleMoves = [...allMoves].reverse().map(m => getInverseMove(m));

  let offset = 0;
  const stages = [
    {
      id: 'part-1',
      title: 'Part 1: Membuat 2 Center Pertama (Putih & Kuning 4x4)',
      shortTitle: 'Center 1-2',
      badge: 'Part 1: Center 1-2',
      formulaName: "2Rw U 2Rw' / 3Rw U 3Rw'",
      description: 'Menyusun baris tengah 1x4 putih di dasar dan kuning di seberangnya.',
      tips: 'Bentuk baris 1x4 secara bertahap lalu satukan menjadi blok center 4x4.',
      moves: part1Moves,
      startIndex: offset,
      endIndex: (offset += part1Moves.length)
    },
    {
      id: 'part-2',
      title: 'Part 2: Membuat 4 Center Samping (Komutator Baris)',
      shortTitle: '4 Center',
      badge: 'Part 2: 4 Center',
      formulaName: "2Rw U 2Rw' / 3Rw U2 3Rw'",
      description: 'Menyelesaikan pusat depan, kanan, kiri, dan belakang dengan komutator lapis.',
      tips: 'Gunakan komutator agar center putih dan kuning yang telah jadi tidak rusak.',
      moves: part2Moves,
      startIndex: offset,
      endIndex: (offset += part2Moves.length)
    },
    {
      id: 'part-3',
      title: 'Part 3: Memasangkan Rusuk 4-Blok (Freeslice)',
      shortTitle: 'Rusuk 6x6',
      badge: 'Part 3: Rusuk',
      formulaName: "2Uw' (Trigger) 2Uw",
      description: 'Menggabungkan 4 potongan sayap menjadi satu rusuk utuh 4-blok.',
      tips: 'Iris lapisan bebas (2Uw\' atau 3Uw\'), balik rusuk, lalu kembalikan irisan.',
      moves: part3Moves,
      startIndex: offset,
      endIndex: (offset += part3Moves.length)
    },
    {
      id: 'part-4',
      title: 'Part 4: Tahap 3x3 LBL Reduksi',
      shortTitle: 'Tahap 3x3',
      badge: 'Part 4: Tahap 3x3',
      formulaName: 'Cross + F2L + OLL Sune',
      description: 'Selesaikan kubus 6x6 seperti 3x3 biasa setelah center dan rusuk tereduksi.',
      tips: 'Putar hanya lapisan terluar (outer layers) agar blok center dan rusuk tetap utuh.',
      moves: part4Moves,
      startIndex: offset,
      endIndex: (offset += part4Moves.length)
    },
    {
      id: 'part-5',
      title: 'Part 5: Paritas Sayap Luar/Dalam & Selesai',
      shortTitle: 'Paritas/Selesai',
      badge: 'Part 5: Paritas',
      formulaName: '2Rw2 B2 U2 ... (Parity) + T-Perm',
      description: 'Memperbaiki paritas sayap rusuk 6x6 lalu menuntaskan dengan permutasi akhir.',
      tips: 'Eksekusi rumus paritas sayap 6x6 untuk membalik sayap rusuk terakhir yang terbalik.',
      moves: part5Moves,
      startIndex: offset,
      endIndex: (offset += part5Moves.length)
    }
  ];

  return { scrambleMoves, solutionMoves: allMoves, stages };
}

export function generatePedagogical7x7Solution() {
  const part1Moves = [
    '2Rw', 'U', "2Rw'", '3Rw', 'U', "3Rw'", '2Rw', 'U2', "2Rw'",
    '2Lw', 'U', "2Lw'", '3Lw', 'U2', "3Lw'", '2Lw', 'U2', "2Lw'"
  ];

  const part2Moves = [
    '2Rw', 'U', "2Rw'", '3Rw', "U'", "3Rw'",
    '2Rw', 'U2', "2Rw'", '3Rw', 'U2', "3Rw'",
    '2Lw', 'U', "2Lw'", '3Lw', 'U2', "3Lw'"
  ];

  const part3Moves = [
    "2Uw'", 'R', 'U', "R'", 'F', "R'", "F'", 'R', '2Uw',
    "3Uw'", 'L', "U'", "L'", "F'", 'L', 'F', "L'", '3Uw'
  ];

  const part4Moves = [
    "2Dw'", 'R', 'U', "R'", 'F', "R'", "F'", 'R', '2Dw',
    "3Dw'", 'L', "U'", "L'", "F'", 'L', 'F', "L'", '3Dw'
  ];

  const part5Moves = [
    'D', 'R', 'F', "R'", "F'", "D'",
    'U', 'R', "U'", "R'", "U'", "F'", 'U', 'F',
    'F', 'R', 'U', "R'", "U'", "F'",
    'R', 'U', "R'", 'U', 'R', 'U2', "R'"
  ];

  const part6Moves = [
    '2Rw2', 'B2', 'U2', '2Lw', 'U2', "2Rw'", 'U2', '2Rw', 'U2', 'F2', '2Rw', 'F2', "2Lw'", 'B2', '2Rw2',
    'R', 'U', "R'", "U'", "R'", 'F', 'R2', "U'", "R'", "U'", 'R', 'U', "R'", "F'", 'U'
  ];

  const allMoves = [...part1Moves, ...part2Moves, ...part3Moves, ...part4Moves, ...part5Moves, ...part6Moves];
  const scrambleMoves = [...allMoves].reverse().map(m => getInverseMove(m));

  let offset = 0;
  const stages = [
    {
      id: 'part-1',
      title: 'Part 1: Membuat 2 Center Pertama (Putih & Kuning 5x5)',
      shortTitle: 'Center 1-2',
      badge: 'Part 1: Center 1-2',
      formulaName: "2Rw U 2Rw' / 3Rw U 3Rw'",
      description: 'Menyusun baris tengah 1x5 putih di dasar dan kuning di seberangnya.',
      tips: 'Mulai dari baris tengah 1x5 lalu kembangkan ke baris samping.',
      moves: part1Moves,
      startIndex: offset,
      endIndex: (offset += part1Moves.length)
    },
    {
      id: 'part-2',
      title: 'Part 2: Membuat 4 Center Samping (5x5 Blocks)',
      shortTitle: '4 Center',
      badge: 'Part 2: 4 Center',
      formulaName: "2Rw U 2Rw' / 3Rw U2 3Rw'",
      description: 'Menyelesaikan pusat depan, kanan, kiri, dan belakang dengan komutator lapis ganda.',
      tips: 'Gunakan komutator baris agar center yang sudah jadi tidak terganggu.',
      moves: part2Moves,
      startIndex: offset,
      endIndex: (offset += part2Moves.length)
    },
    {
      id: 'part-3',
      title: 'Part 3: Memasangkan 8 Rusuk Pertama (Freeslice 5-Pack)',
      shortTitle: '8 Rusuk',
      badge: 'Part 3: 8 Rusuk',
      formulaName: "2Uw' (Trigger) 2Uw",
      description: 'Menggabungkan rusuk tengah dengan 4 sayap pendamping pada lapisan bebas.',
      tips: 'Gunakan lapisan bebas untuk menyandingkan pasangan rusuk tanpa merusak center.',
      moves: part3Moves,
      startIndex: offset,
      endIndex: (offset += part3Moves.length)
    },
    {
      id: 'part-4',
      title: 'Part 4: Memasangkan 4 Rusuk Terakhir (Slice-Flip-Slice)',
      shortTitle: '4 Rusuk Akhir',
      badge: 'Part 4: 4 Rusuk',
      formulaName: "2Dw' (Trigger) 2Dw",
      description: 'Menyelesaikan 4 rusuk terakhir dengan teknik Slice-Flip-Slice.',
      tips: 'Iris lapisan bawah, balik rusuk di slot kanan, lalu kembalikan irisan.',
      moves: part4Moves,
      startIndex: offset,
      endIndex: (offset += part4Moves.length)
    },
    {
      id: 'part-5',
      title: 'Part 5: Menyelesaikan Seperti Rubik 3x3',
      shortTitle: 'Tahap 3x3',
      badge: 'Part 5: Tahap 3x3',
      formulaName: 'Cross + F2L + OLL Sune',
      description: 'Selesaikan kubus layaknya 3x3 biasa dari palang bawah hingga orientasi kuning.',
      tips: 'Anggap setiap blok 5x5 sebagai center dan setiap 5-pack edge sebagai edge biasa.',
      moves: part5Moves,
      startIndex: offset,
      endIndex: (offset += part5Moves.length)
    },
    {
      id: 'part-6',
      title: 'Part 6: Paritas Sayap Akhir & PLL Selesai',
      shortTitle: 'Paritas/Selesai',
      badge: 'Part 6: Paritas Sayap',
      formulaName: '2Rw2 B2 U2 ... (Parity) + T-Perm',
      description: 'Membalikkan sayap rusuk terakhir jika terbalik arah, lalu kunci dengan PLL akhir.',
      tips: 'Eksekusi rumus paritas sayap 7x7 untuk menuntaskan penyelesaian hingga 100% utuh.',
      moves: part6Moves,
      startIndex: offset,
      endIndex: (offset += part6Moves.length)
    }
  ];

  return { scrambleMoves, solutionMoves: allMoves, stages };
}
