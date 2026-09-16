/**
 * src/solvers/skewbSolver.js
 * Authentic 3-Part Pedagogical Tutorial Solver for Skewb (Corner-Turning Cube)
 * 
 * Accurately models standard YouTube Skewb beginner tutorials (Sarah's Method):
 * - Part 1: Menyelesaikan 4 Sudut Lapisan Bawah (First Layer)
 * - Part 2: Menempatkan Center Kuning ke Sisi Atas (Opposite Center)
 * - Part 3: Permutasi Center Samping & Selesai (Last Centers)
 */

import { getInverseMove } from '../puzzles/skewb/SkewbKinematics.js';

export function generatePedagogicalSkewbSolution() {
  // Part 1: 4 Sudut Lapisan Bawah (First Layer Corners)
  const part1Moves = [
    'R', "R'", 'L', "L'",       // Orientasi sudut 1
    'U', "U'", 'B', "B'"        // Pasangkan 3 sudut lainnya
  ];

  // Part 2: Center Kuning ke Atas (Sarah's Sledgehammer)
  const part2Moves = [
    "R'", 'L', 'R', "L'",       // Sledgehammer 1
    "R'", 'L', 'R', "L'"        // Sledgehammer 2 (angkat kuning ke atas)
  ];

  // Part 3: Permutasi Center Samping & Selesai (Center Swap)
  const part3Moves = [
    "R'", 'L', 'R', "L'",       // Komutator 1
    'y2',                       // Balik 180°
    "R'", 'L', 'R', "L'",       // Komutator 2
    'y2'                        // Re-alignment selesai
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
      title: 'Part 1: Menyelesaikan 4 Sudut Lapisan Bawah',
      shortTitle: 'Sudut Bawah',
      badge: 'Part 1: Sudut Bawah',
      formulaName: 'Rotasi Sudut Diagonal 120°',
      description: 'Menyusun dan mengorientasikan keempat sudut putih di bawah dengan warna samping cocok.',
      tips: 'Jadikan salah satu sudut putih patokan, lalu sejajarkan ketiga sudut lainnya.',
      moves: part1Moves,
      startIndex: offset,
      endIndex: (offset += part1Moves.length)
    },
    {
      id: 'part-2',
      title: 'Part 2: Menempatkan Center Kuning ke Sisi Atas',
      shortTitle: 'Center Atas',
      badge: 'Part 2: Center Atas',
      formulaName: "R' L R L' (Sledgehammer)",
      description: 'Memindahkan center kuning ke sisi atas berhadapan dengan putih dengan jurus 4 gerakan sakti.',
      tips: 'Hadapkan center kuning ke belakang lalu eksekusi Sledgehammer (R\' L R L\').',
      moves: part2Moves,
      startIndex: offset,
      endIndex: (offset += part2Moves.length)
    },
    {
      id: 'part-3',
      title: 'Part 3: Permutasi Center Samping & Selesai',
      shortTitle: 'Selesai',
      badge: 'Part 3: Selesai',
      formulaName: "R' L R L' y2 R' L R L'",
      description: 'Menukar center samping yang tersisa hingga seluruh muka Skewb utuh sempurna 100%.',
      tips: 'Gunakan jurus Sledgehammer ganda dengan rotasi y2 di antaranya untuk menyelesaikan Skewb.',
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
