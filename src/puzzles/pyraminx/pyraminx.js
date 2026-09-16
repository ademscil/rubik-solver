/**
 * src/puzzles/pyraminx/pyraminx.js
 * Complete PuzzleDefinition for Pyraminx
 */

import { buildPyraminxModel, PYRAMINX_COLORS } from './PyraminxGeometry.js';
import {
  animatePyraminxMove,
  parseAlgorithm,
  getInverseMove,
  generateScramble,
  getMoveInfo,
  PYRAMINX_NOTATION
} from './PyraminxKinematics.js';

const PYRAMINX_GUIDE_STAGES = [
  {
    id: 'stage-tips',
    title: '1. Menyelesaikan Tips (Ujung)',
    shortTitle: 'Tips',
    badge: 'Tahap 1',
    summary: 'Putar 4 ujung agar warnanya cocok dengan center masing-masing sisi.',
    description: 'Tips adalah bagian terkecil di setiap sudut Pyraminx. Masing-masing bisa diputar secara independen tanpa mempengaruhi piece lain. Langkah ini sangat mudah dan bisa diselesaikan kapan saja.',
    cases: [
      {
        id: 'tip-match',
        name: 'Cocokkan Ujung ke Center',
        summary: 'Putar setiap ujung sehingga warnanya cocok dengan center di sisinya.',
        algorithm: "u u' r r' l l' b b'",
        tips: 'Cukup putar setiap ujung sampai warnanya cocok. Tidak ada algoritma khusus yang diperlukan.'
      }
    ]
  },
  {
    id: 'stage-first-layer',
    title: '2. Layer Pertama (Dasar)',
    shortTitle: 'Layer 1',
    badge: 'Tahap 2',
    summary: 'Bangun satu sisi penuh dengan 3 edge yang cocok di bagian bawah.',
    description: 'Pilih satu warna sebagai dasar (biasanya merah/bawah). Tempatkan 3 edge sehingga seluruh sisi bawah berwarna sama dan edge-edge cocok dengan center samping.',
    cases: [
      {
        id: 'bl-edge-insert',
        name: 'Sisipkan Edge ke Dasar',
        summary: 'Putar edge yang benar ke posisi bawah.',
        algorithm: "R L' R' L",
        tips: 'Temukan edge yang memiliki warna dasar, lalu sisipkan dengan gerakan sederhana.'
      }
    ]
  },
  {
    id: 'stage-last-layer',
    title: '3. Layer Terakhir (Atas)',
    shortTitle: 'Layer Akhir',
    badge: 'Tahap 3',
    summary: 'Selesaikan sisi atas dengan mengatur 3 edge terakhir.',
    description: 'Setelah dasar selesai, tersisa 3 edge di layer atas. Gunakan algoritma untuk menukar dan membalik edge tanpa merusak dasar.',
    cases: [
      {
        id: 'll-3-cycle',
        name: '3 Edge Cycle (Putar 3 Edge)',
        summary: 'Tukar posisi 3 edge terakhir secara berurutan.',
        algorithm: "R U R' U R U R'",
        tips: 'Ulangi R U R\' U sampai ketiga edge berada di posisi yang benar.'
      },
      {
        id: 'll-flip',
        name: 'Balik Edge (Flip)',
        summary: 'Balik orientasi edge yang sudah di posisi benar tapi warnanya terbalik.',
        algorithm: "R U' L U R' U' L'",
        tips: 'Algoritma ini membalik edge tanpa mengubah posisi edge lainnya.'
      }
    ]
  }
];

const PYRAMINX_PRESETS = [
  {
    id: 'pyra-solved',
    name: 'Pyraminx Solved',
    category: 'Dasar',
    desc: 'Pyraminx dalam keadaan terselesaikan.',
    setupMoves: '',
    solutionMoves: ''
  },
  {
    id: 'pyra-3-cycle',
    name: '3-Edge Cycle',
    category: 'Kasus Umum',
    desc: '3 edge perlu ditukar posisinya.',
    setupMoves: "R U R' U R U R'",
    solutionMoves: "R U' R' U' R U' R'"
  },
  {
    id: 'pyra-niklas',
    name: 'Niklas (Commutator)',
    category: 'Algoritma Populer',
    desc: 'Commutator dasar untuk 3-cycle edge.',
    setupMoves: "R U' L' U R' U' L U",
    solutionMoves: "U' L' U R U' L U R'"
  }
];

export const pyraminxDefinition = {
  id: 'pyraminx',
  wcaId: 'pyram',
  name: 'Pyraminx (Tetrahedron)',
  shortName: 'Pyra',
  category: 'shape',
  difficulty: 'beginner',
  difficultyLabel: 'Pemula',
  faceCount: 4,
  defaultCameraDistance: 9.0,
  minCameraDistance: 5.0,
  maxCameraDistance: 20.0,
  description: 'Puzzle berbentuk tetrahedron beraturan dengan 4 sudut berputar 120°.',
  hasParity: false,
  colorScheme: PYRAMINX_COLORS,

  buildModel: (options) => buildPyraminxModel(options),

  animateMove: (moveStr, group, onComplete, duration) => {
    animatePyraminxMove(group, moveStr, onComplete, duration);
  },

  resetModel: (group) => {
    if (group && typeof group.quaternion?.set === 'function') {
      group.quaternion.set(0, 0, 0, 1);
      group.rotation.set(0, 0, 0);
    }
  },

  parseAlgorithm: (algString) => parseAlgorithm(algString),
  getInverseMove: (move) => getInverseMove(move),
  getMoveInfo: (move) => getMoveInfo(move),
  generateScramble: (length) => generateScramble(length),

  notation: PYRAMINX_NOTATION,
  guideStages: PYRAMINX_GUIDE_STAGES,
  presets: PYRAMINX_PRESETS,

  netLayout: {
    type: 'tetrahedron_net',
    gridWidth: 6,
    gridHeight: 4,
    faces: {
      F: { id: 'F', name: 'Depan', row: 1, col: 2, rows: 3, cols: 3, shape: 'triangle' },
      R: { id: 'R', name: 'Kanan', row: 1, col: 4, rows: 3, cols: 3, shape: 'triangle' },
      L: { id: 'L', name: 'Kiri', row: 1, col: 0, rows: 3, cols: 3, shape: 'triangle' },
      D: { id: 'D', name: 'Bawah', row: 2, col: 2, rows: 3, cols: 3, shape: 'triangle' }
    }
  }
};

