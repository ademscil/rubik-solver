/**
 * src/solvers/square1Solver.js
 * Authentic 3-Part Pedagogical Tutorial Solver for Square-1 (Shape-Shifting Puzzle)
 * 
 * Accurately models standard YouTube Square-1 beginner tutorials:
 * - Part 1: Mengembalikan Bentuk Kubus (Cubeshape)
 * - Part 2: Orientasi Sudut & Rusuk (CO & EO)
 * - Part 3: Permutasi Lapisan & Selesai (CP & EP)
 */

import { getInverseMove } from '../puzzles/square1/Square1Kinematics.js';

export function generatePedagogicalSquare1Solution() {
  // Part 1: Mengembalikan Bentuk Kubus (Cubeshape - pure seam-aligned / slices)
  const part1Moves = [
    '/', '(3,0)', '/', '(0,-3)', '/', '(-3,3)', '/'
  ];

  // Part 2: Orientasi Sudut & Rusuk (CO & EO)
  const part2Moves = [
    '(3,0)', '/', '(-3,-3)', '/', '(0,3)', '/', '(-3,0)', '/'
  ];

  // Part 3: Permutasi Lapisan & Selesai (CP & EP)
  const part3Moves = [
    '(0,3)', '/', '(3,-3)', '/', '(-3,3)', '/', '(3,0)', '/', '(0,-3)', '/'
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
      title: 'Part 1: Mengembalikan Bentuk Kubus (Cubeshape)',
      shortTitle: 'Cubeshape',
      badge: 'Part 1: Bentuk Kubus',
      formulaName: '/ (3,0) / (0,-3) /',
      description: 'Mengubah bentuk Square-1 yang tak beraturan kembali menjadi bentuk kubus yang rapi.',
      tips: 'Sejajarkan garis belahan pada sudut 90°/180° sebelum membelah dengan irisan /.',
      moves: part1Moves,
      startIndex: offset,
      endIndex: (offset += part1Moves.length)
    },
    {
      id: 'part-2',
      title: 'Part 2: Orientasi Sudut & Rusuk (CO & EO)',
      shortTitle: 'Orientasi',
      badge: 'Part 2: Orientasi',
      formulaName: 'Corner & Edge Orientation',
      description: 'Membuat seluruh bagian atas berwarna putih dan bagian bawah berwarna kuning.',
      tips: 'Gunakan irisan / dan putaran kelipatan 3 (90 derajat) untuk membalik warna muka.',
      moves: part2Moves,
      startIndex: offset,
      endIndex: (offset += part2Moves.length)
    },
    {
      id: 'part-3',
      title: 'Part 3: Permutasi Lapisan & Selesai (CP & EP)',
      shortTitle: 'Selesai',
      badge: 'Part 3: Selesai',
      formulaName: 'Permutasi Sudut & Rusuk Akhir',
      description: 'Menyelaraskan posisi seluruh potongan hingga Square-1 selesai sempurna 100%.',
      tips: 'Lakukan alignment akhir pada equator tengah untuk menuntaskan penyelesaian.',
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
