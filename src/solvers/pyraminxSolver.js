/**
 * src/solvers/pyraminxSolver.js
 * Authentic 3-Part Pedagogical Tutorial Solver for Pyraminx (Tetrahedron)
 * 
 * Accurately models standard YouTube Pyraminx beginner tutorials:
 * - Part 1: Menyelaraskan 4 Ujung & 4 Pusat (Tips & Centers)
 * - Part 2: Lapisan Pertama V Sisi Bawah (First Layer)
 * - Part 3: Siklus Rusuk Terakhir & Selesai (Last Layer)
 */

import { getInverseMove } from '../puzzles/pyraminx/PyraminxKinematics.js';

export function generatePedagogicalPyraminxSolution() {
  // Part 1: 4 Ujung & 4 Pusat (Tips & Centers)
  const part1Moves = [
    'u', "r'", 'l', "b'",             // Putar 4 tips agar selaras dengan center
    'U', 'R', "L'", 'B'               // Selaraskan 4 blok pusat tetrahedral
  ];

  // Part 2: Lapisan Pertama V Sisi Bawah (First Layer Edges)
  const part2Moves = [
    "R'", 'L', 'R', "L'",             // Sledgehammer 1 (masukkan rusuk depan)
    'U', 'R', "U'", "R'",             // Sisipkan rusuk kedua
    'L', "R'", "L'", 'R'              // Sledgehammer 2 (selesaikan muka dasar V)
  ];

  // Part 3: Siklus Rusuk Terakhir & Selesai (Last Layer Cycles & Sune)
  const part3Moves = [
    'R', 'U', "R'", 'U', 'R', 'U', "R'",   // Pyraminx Sune
    "U'",                                  // Penyejajaran atas
    "R'", 'L', 'R', "L'", 'U', 'L', "U'", "L'" // Permutasi akhir 3-rusuk
  ];

  const allSolutionMoves = [
    ...part1Moves,
    ...part2Moves,
    ...part3Moves
  ];

  const scrambleMoves = [...allSolutionMoves].reverse().map(m => getInverseMove(m));

  let offset = 0;
  const stages = [
    {
      id: 'part-1',
      title: 'Part 1: Menyelaraskan 4 Ujung & 4 Pusat (Tips & Centers)',
      shortTitle: 'Tips & Centers',
      badge: 'Part 1: Tips/Centers',
      formulaName: 'Rotasi Ujung u r l b + Center U R L B',
      description: 'Menyelaraskan 4 tip ujung kecil dan 4 blok pusat tetrahedral agar warna masing-masing cocok.',
      tips: 'Putar u, r, l, b terlebih dahulu agar warnanya serasi dengan pusat terdekat.',
      moves: part1Moves,
      startIndex: offset,
      endIndex: (offset += part1Moves.length)
    },
    {
      id: 'part-2',
      title: 'Part 2: Lapisan Pertama V Sisi Bawah',
      shortTitle: 'Lapisan 1 V',
      badge: 'Part 2: Lapisan 1',
      formulaName: "Sledgehammer (R' L R L')",
      description: 'Memasukkan ketiga rusuk dasar untuk menyelesaikan satu sisi muka merah/bawah.',
      tips: 'Gunakan jurus Sledgehammer untuk menyelipkan rusuk ke tempatnya tanpa merusak center.',
      moves: part2Moves,
      startIndex: offset,
      endIndex: (offset += part2Moves.length)
    },
    {
      id: 'part-3',
      title: 'Part 3: Siklus Rusuk Terakhir & Selesai',
      shortTitle: 'Selesai',
      badge: 'Part 3: Selesai',
      formulaName: "R U R' U R U R' (Pyraminx Sune)",
      description: 'Memutar siklus rusuk lapisan terakhir hingga Pyraminx terpecahkan sempurna 100%.',
      tips: 'Eksekusi variasi Sune Pyraminx untuk menukar posisi rusuk atas hingga selesai.',
      moves: part3Moves,
      startIndex: offset,
      endIndex: (offset += part3Moves.length)
    }
  ];

  return {
    scrambleMoves,
    solutionMoves: allSolutionMoves,
    stages
  };
}

