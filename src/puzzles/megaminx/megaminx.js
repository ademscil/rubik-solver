/**
 * src/puzzles/megaminx/megaminx.js
 * Complete PuzzleDefinition for Megaminx (Regular Dodecahedron)
 */

import { buildMegaminxModel, MEGAMINX_COLORS } from './MegaminxGeometry.js';
import {
  animateMegaminxMove,
  parseAlgorithm,
  getInverseMove,
  generateScramble,
  getMoveInfo,
  MEGAMINX_NOTATION
} from './MegaminxKinematics.js';

const MEGAMINX_GUIDE_STAGES = [
  {
    id: 'megaminx-stage-1',
    title: '1. White Star (Bintang Putih) Pemula',
    shortTitle: 'White Star',
    badge: 'Tahap 1',
    desc: 'Panduan metode pemula White Star untuk membentuk bintang putih di sisi atas Megaminx.',
    summary: 'Bentuk pola bintang putih pada sisi atas dengan mencocokkan 5 edge putih ke center samping.',
    description: 'Langkah awal metode pemula Megaminx mirip dengan cross pada 3x3, namun terdiri dari 5 rusuk putih yang harus dicocokkan dengan warna center samping masing-masing.',
    cases: [
      {
        id: 'white-star-edge',
        name: 'Penyusunan Rusuk Bintang Putih',
        summary: 'Bawa edge putih ke sisi atas yang selaras dengan center samping.',
        algorithm: "F R U R' U' F'",
        description: 'Penyusunan intuitif rusuk bintang putih ke posisi yang tepat.',
        tips: 'Selesaikan satu per satu dari rusuk putih-merah, putih-hijau, putih-kuning, putih-ungu, dan putih-biru.'
      }
    ]
  },
  {
    id: 'megaminx-stage-2',
    title: '2. Sisi Bawah & S2L (Second 2 Layers)',
    shortTitle: 'S2L',
    badge: 'Tahap 2',
    desc: 'Menyelesaikan lapisan kedua dan ketiga di sekeliling bintang putih.',
    summary: 'Pasangkan sudut dan edge untuk menyelesaikan 5 sisi di sekitar bintang putih.',
    description: 'Setelah bintang putih selesai, masukkan sudut putih dan edge lapisan kedua, lalu lanjutkan ke second two layers (S2L).',
    cases: [
      {
        id: 's2l-pair-insert',
        name: 'Penyisipan Pasangan Sudut & Edge',
        summary: 'Sisipkan pasangan corner-edge ke slot yang sesuai.',
        algorithm: "R U R' U' R U R'",
        description: 'Masukkan pasangan sudut dan tepi tanpa merusak bintang putih yang telah terbentuk.',
        tips: 'Gunakan komutator slotting untuk memasukkan bagian tanpa merusak blok sebelumnya.'
      }
    ]
  },
  {
    id: 'megaminx-stage-3',
    title: '3. Layer Terakhir (Last Layer - Abu-abu)',
    shortTitle: 'Last Layer',
    badge: 'Tahap 3',
    desc: 'Orientasi dan permutasi bintang dan sudut pada sisi abu-abu.',
    summary: 'Bentuk bintang abu-abu, orientasikan sudut, dan lakukan permutasi akhir.',
    description: 'Selesaikan lapisan terakhir (sisi abu-abu) dengan orientasi edge, permutasi edge, orientasi sudut, dan permutasi sudut.',
    cases: [
      {
        id: 'll-grey-star',
        name: 'Bintang Abu-abu (Grey Star)',
        summary: 'Orientasikan 5 edge abu-abu.',
        algorithm: "F R U R' U' F'",
        description: 'Membentuk bintang abu-abu pada lapisan atas.',
        tips: 'Posisikan dua edge yang sudah berorientasi benar di sisi kiri dan belakang sebelum memutar rumus.'
      },
      {
        id: 'll-corner-cycle',
        name: 'Siklus Sudut Last Layer',
        summary: 'Tukar posisi sudut yang belum pada tempatnya.',
        algorithm: "R U R' U R U2 R'",
        description: 'Permutasi sudut lapisan terakhir.',
        tips: 'Ulangi algoritma hingga kelima sudut berada pada tempat yang tepat.'
      }
    ]
  }
];

const MEGAMINX_PRESETS = [
  {
    id: 'solved',
    name: 'Kondisi Selesai (Solved)',
    category: 'Dasar',
    desc: 'Megaminx dalam keadaan terselesaikan.',
    stateDescription: 'Seluruh stiker berada pada muka warna yang tepat.',
    algorithm: '',
    setupMoves: '',
    solutionMoves: ''
  },
  {
    id: 'white-star',
    name: 'White Star Pattern',
    category: 'Pola Dasar',
    desc: 'Bintang putih terbentuk di sisi atas.',
    stateDescription: 'Bintang putih terbentuk di sisi atas.',
    algorithm: 'R++ D++ R-- D-- U',
    setupMoves: 'R++ D++ R-- D-- U',
    solutionMoves: "U' D++ R++ D-- R--"
  },
  {
    id: 'last-layer',
    name: 'Last Layer Edges',
    category: 'Tahap Akhir',
    desc: 'Kasus layer terakhir sisi abu-abu.',
    stateDescription: 'Kasus layer terakhir sisi abu-abu.',
    algorithm: "R U R' U R U R'",
    setupMoves: "R U R' U R U R'",
    solutionMoves: "R U' R' U' R U' R'"
  }
];

const enrichedNotation = {
  ...MEGAMINX_NOTATION,
  parse: (str) => parseAlgorithm(str),
  getIndonesian: (token) => getMoveInfo(token)
};

export const megaminxDefinition = {
  id: 'megaminx',
  wcaId: 'minx',
  name: 'Megaminx (Dodecahedron)',
  shortName: 'Mega',
  category: 'shape',
  difficulty: 'advanced',
  difficultyLabel: 'Mahir',
  faceCount: 12,
  defaultCameraDistance: 11.0,
  minCameraDistance: 8.0,
  maxCameraDistance: 30.0,
  description: 'Puzzle dodecahedron 12 sisi dengan putaran pentagonal 72°.',
  hasParity: false,
  colorScheme: Object.values(MEGAMINX_COLORS),

  buildModel: (options) => buildMegaminxModel(options),

  animateMove: (moveStr, group, onComplete, duration, pivotGroup) => {
    animateMegaminxMove(group, moveStr, onComplete, duration, pivotGroup);
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
  guideStages: MEGAMINX_GUIDE_STAGES,
  presets: MEGAMINX_PRESETS,

  netLayout: {
    type: 'dodecahedral-dual-flower',
    clusters: ['top-flower', 'bottom-flower'],
    facesCount: 12,
    stickersPerFace: 11,
    totalStickers: 132
  }
};
