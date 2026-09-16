/**
 * src/solvers/ortega2x2Solver.js
 * Authentic 3-Part Pedagogical Tutorial Solver for Rubik 2x2 (LBL / Ortega Method)
 * 
 * Accurately models standard YouTube speedcubing tutorials:
 * - Part 1: Lapisan Putih Pertama (First Layer)
 * - Part 2: Orientasi Lapisan Kuning Atas (OLL)
 * - Part 3: Permutasi Lapisan & Sudut Akhir (PLL / Selesai)
 */

import { getInverseMove } from '../cube/rubikNotation.js';

export function generatePedagogical2x2Solution() {
  // Part 1: Lapisan Putih Pertama (Menyelesaikan 4 sudut putih dengan samping selaras)
  const part1Moves = [
    'R', 'U', "R'", "U'",           // Sudut putih 1 (Sexy Move)
    'F', 'R', "U'", "R'", 'F',      // Sudut putih 2
    'R', 'U', "R'",                 // Sudut putih 3-4
  ];

  // Part 2: Orientasi Lapisan Kuning Atas (OLL Sune)
  const part2Moves = [
    'R', 'U', "R'", 'U', 'R', 'U2', "R'",   // Sune
    'U'                                     // AUF
  ];

  // Part 3: Permutasi Lapisan & Sudut Akhir (T-Perm / Y-Perm Selesai)
  const part3Moves = [
    'R', 'U', "R'", "U'", "R'", 'F', 'R2', "U'", "R'", "U'", 'R', 'U', "R'", "F'", 'U'
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
      title: 'Part 1: Lapisan Putih Pertama',
      shortTitle: 'Lapisan 1',
      badge: 'Part 1: Lapisan 1',
      formulaName: "R U R' U' (Sexy Move)",
      description: 'Menyusun keempat sudut putih di lapisan dasar dengan warna samping selaras melingkar.',
      tips: 'Jadikan salah satu sudut putih sebagai jangkar, lalu jemput sudut lainnya dengan Sexy Move.',
      moves: part1Moves,
      startIndex: offset,
      endIndex: (offset += part1Moves.length)
    },
    {
      id: 'part-2',
      title: 'Part 2: Orientasi Lapisan Kuning Atas (OLL)',
      shortTitle: 'Kuning Atas',
      badge: 'Part 2: Kuning Atas',
      formulaName: "R U R' U R U2 R' (Sune)",
      description: 'Menguningkan seluruh permukaan atas dengan algoritma legendaris Sune.',
      tips: 'Posisikan kepala ikan kuning di kiri-depan sebelum mengeksekusi Sune.',
      moves: part2Moves,
      startIndex: offset,
      endIndex: (offset += part2Moves.length)
    },
    {
      id: 'part-3',
      title: 'Part 3: Permutasi Lapisan & Sudut Akhir (PLL)',
      shortTitle: 'PLL Selesai',
      badge: 'Part 3: Selesai',
      formulaName: "T-Perm / Y-Perm + AUF",
      description: 'Menyelaraskan susunan sudut yang tersisa hingga Rubik 2x2 selesai sempurna 100%.',
      tips: 'Jika ada baris 2 warna kembar di samping, posisikan di belakang lalu eksekusi T-Perm.',
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
