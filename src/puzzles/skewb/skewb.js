/**
 * src/puzzles/skewb/skewb.js
 * Complete PuzzleDefinition for Skewb (Corner-Turning Cube)
 */

import { buildSkewbModel, SKEWB_COLORS } from './SkewbGeometry.js';
import {
  animateSkewbMove,
  parseAlgorithm,
  getInverseMove,
  generateScramble,
  getMoveInfo,
  SKEWB_NOTATION
} from './SkewbKinematics.js';

const SKEWB_GUIDE_STAGES = [
  {
    id: 'skewb-stage-1',
    title: '1. Menyelesaikan Layer Pertama (Metode Pemula)',
    shortTitle: 'Layer 1',
    badge: 'Tahap 1',
    desc: "Panduan metode pemula Sarah's Beginner Method untuk menyusun 4 sudut putih pada layer dasar.",
    summary: 'Susun keempat sudut warna putih di layer dasar dengan orientasi yang benar.',
    description: 'Pilih warna dasar putih. Tempatkan dan orientasikan keempat sudut putih sehingga membentuk layer pertama yang rapi dan warna sampingnya selaras.',
    cases: [
      {
        id: 'skewb-fl-insert',
        name: 'Penyusunan Sudut Layer Dasar',
        summary: 'Posisikan sudut putih ke dasar secara intuitif.',
        algorithm: "R' L R L'",
        description: 'Komutator dasar untuk mengorientasikan sudut ke lapisan bawah.',
        tips: 'Perhatikan warna samping dari sudut yang dipasang agar cocok dengan sudut tetangga.'
      }
    ]
  },
  {
    id: 'skewb-stage-2',
    title: '2. Menyelesaikan Center Kuning (Sledgehammer)',
    shortTitle: 'Center Kuning',
    badge: 'Tahap 2',
    desc: 'Menggunakan algoritma Sledgehammer untuk membalik center kuning ke sisi atas.',
    summary: 'Pindahkan center kuning ke sisi atas berlawanan dengan putih.',
    description: 'Posisikan sisi kuning di atas atau depan, lalu gunakan rumus Sledgehammer (R\' L R L\') untuk menempatkan center kuning tanpa merusak layer pertama.',
    cases: [
      {
        id: 'skewb-sledgehammer',
        name: 'Sledgehammer (Sarah Commutator)',
        summary: 'Putar 4 gerakan untuk memindahkan center kuning ke atas.',
        algorithm: "R' L R L'",
        description: 'Putar R\' L R L\' untuk menukar center atas dan depan.',
        tips: 'Pegang Skewb dengan center kuning menghadap depan atau atas sebelum mengeksekusi.'
      }
    ]
  },
  {
    id: 'skewb-stage-3',
    title: '3. Permutasi Center Terakhir (Center-Swap)',
    shortTitle: 'Center Terakhir',
    badge: 'Tahap 3',
    desc: 'Menyelesaikan 3 atau 4 center terakhir dengan komutator center-swap.',
    summary: 'Tukar posisi center yang tersisa hingga seluruh puzzle terselesaikan.',
    description: 'Gunakan kombinasi Sledgehammer ganda dengan rotasi y2 untuk menukar center yang tersisa hingga seluruh Skewb selesai.',
    cases: [
      {
        id: 'skewb-center-swap',
        name: 'Pertukaran Center (Center Swap)',
        summary: 'Tukar center atas dan depan tanpa merusak susunan sudut.',
        algorithm: "R' L R L' y2 R' L R L'",
        description: 'Tukar center atas dan depan tanpa merusak sudut yang telah tersusun.',
        tips: 'Pastikan layer bawah tetap berada di bawah saat melakukan rotasi y2.'
      }
    ]
  }
];

const SKEWB_PRESETS = [
  {
    id: 'solved',
    name: 'Kondisi Selesai (Solved)',
    category: 'Dasar',
    desc: 'Skewb dalam keadaan terselesaikan.',
    stateDescription: 'Seluruh stiker berada pada muka warna yang tepat.',
    algorithm: '',
    setupMoves: '',
    solutionMoves: ''
  },
  {
    id: 'sledgehammer',
    name: 'Sledgehammer Cycle',
    category: 'Algoritma Populer',
    desc: 'Rotasi sudut komutator Sarah.',
    stateDescription: 'Rotasi sudut komutator Sarah.',
    algorithm: "R' L R L'",
    setupMoves: "R' L R L'",
    solutionMoves: "L R' L' R"
  },
  {
    id: 'center-swap',
    name: 'Center Commutator y2',
    category: 'Kasus Khusus',
    desc: 'Menukar center atas dan depan tanpa mengubah orientasi sudut.',
    stateDescription: 'Menukar center atas dan depan tanpa mengubah orientasi sudut.',
    algorithm: "R' L R L' y2 R' L R L'",
    setupMoves: "R' L R L' y2 R' L R L'",
    solutionMoves: "R' L R L' y2 R' L R L'"
  }
];

const enrichedNotation = {
  ...SKEWB_NOTATION,
  parse: (str) => parseAlgorithm(str),
  getIndonesian: (token) => getMoveInfo(token)
};

export const skewbDefinition = {
  id: 'skewb',
  wcaId: 'skewb',
  name: 'Skewb (Corner-Turning)',
  shortName: 'Skewb',
  category: 'shape',
  difficulty: 'intermediate',
  difficultyLabel: 'Menengah',
  faceCount: 6,
  defaultCameraDistance: 7.5,
  minCameraDistance: 5.0,
  maxCameraDistance: 20.0,
  description: 'Puzzle kubus deep-cut berputar pada 4 sumbu diagonal sudut 120°.',
  hasParity: false,
  colorScheme: Object.values(SKEWB_COLORS).map(c => c.hex),

  buildModel: (options) => buildSkewbModel(options),

  animateMove: (moveStr, group, onComplete, duration, pivotGroup) => {
    animateSkewbMove(group, moveStr, onComplete, duration, pivotGroup);
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

  notation: enrichedNotation,
  guideStages: SKEWB_GUIDE_STAGES,
  presets: SKEWB_PRESETS,

  netLayout: {
    type: 'diamond-corner-cross',
    faces: ['U', 'L', 'F', 'R', 'B', 'D'],
    facetsPerFace: 5,
    totalStickers: 30
  }
};
