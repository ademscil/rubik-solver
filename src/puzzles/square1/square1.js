/**
 * src/puzzles/square1/square1.js
 * Complete PuzzleDefinition for Square-1 (Shape-Shifting Disc/Cube)
 */

import { buildSquare1Model, SQUARE1_COLORS } from './Square1Geometry.js';
import {
  animateSquare1Move,
  parseAlgorithm,
  getInverseMove,
  generateScramble,
  getMoveInfo,
  SQUARE1_NOTATION
} from './Square1Kinematics.js';

const SQUARE1_GUIDE_STAGES = [
  {
    id: 'sq1-stage-1',
    title: '1. Cube Shape (Bentuk Kubus) Pemula',
    shortTitle: 'Cube Shape',
    badge: 'Tahap 1',
    desc: 'Panduan metode pemula Vandenbergh untuk mengembalikan bentuk Square-1 menjadi kubus sempurna.',
    summary: 'Kumpulkan semua 8 edge menjadi bentuk scallop-kite atau star sebelum kembali ke kubus.',
    description: 'Tantangan unik Square-1 adalah bentuknya yang berubah ketika diputar. Langkah pertama metode pemula adalah mengembalikan seluruh potongan ke bentuk kubus standar.',
    cases: [
      {
        id: 'sq1-scallop-kite',
        name: 'Pola Scallop-Kite ke Kubus',
        summary: 'Ubah bentuk scallop dan kite menjadi kubus simetris.',
        algorithm: '(-2,-4) / (-1,-2) / (-3,-3) /',
        description: 'Transisi dari bentuk scallop-kite kembali ke kubus.',
        tips: 'Pastikan garis potong lurus vertikal sejajar sebelum melakukan slice /.'
      }
    ]
  },
  {
    id: 'sq1-stage-2',
    title: '2. Orientasi & Permutasi Sudut (CO & CP)',
    shortTitle: 'Sudut (CO/CP)',
    badge: 'Tahap 2',
    desc: 'Menyelaraskan dan menempatkan sudut layer atas dan bawah.',
    summary: 'Orientasikan seluruh sudut putih ke atas dan kuning ke bawah, lalu tukar ke posisi yang benar.',
    description: 'Setelah bentuk kubus tercapai, susun orientasi sudut atas dan bawah (Corner Orientation), lalu permutasikan sudut yang belum pada tempatnya (Corner Permutation).',
    cases: [
      {
        id: 'sq1-co-adj',
        name: 'Pertukaran Sudut CO/CP',
        summary: 'Tukar orientasi dan posisi dua pasang sudut.',
        algorithm: '/ (3,-3) / (3,0) / (-3,0) / (0,3) / (-3,0) /',
        description: 'Algoritma komutator sudut Square-1.',
        tips: 'Gunakan gerakan (3, 0) untuk memutar layer atas 90° searah jarum jam.'
      }
    ]
  },
  {
    id: 'sq1-stage-3',
    title: '3. Orientasi & Permutasi Rusuk (EO & EP)',
    shortTitle: 'Rusuk (EO/EP)',
    badge: 'Tahap 3',
    desc: 'Menyusun posisi dan orientasi seluruh rusuk layer atas dan bawah.',
    summary: 'Kelompokkan warna edge atas dan bawah, lalu tukar edge hingga warna samping cocok.',
    description: 'Selesaikan Edge Orientation (EO) untuk mengumpulkan rusuk yang sesuai, kemudian lakukan Edge Permutation (EP) untuk menyelesaikan layer.',
    cases: [
      {
        id: 'sq1-ep-adj',
        name: 'Permutasi Rusuk Berdampingan',
        summary: 'Tukar dua pasang edge berdampingan.',
        algorithm: '(1,0) / (-1,-1) / (0,1)',
        description: 'Pertukaran posisi rusuk atas dan bawah secara bersamaan.',
        tips: 'Perhatikan angka positif untuk searah jarum jam dan negatif untuk lawan arah.'
      }
    ]
  },
  {
    id: 'sq1-stage-parity',
    title: 'Tahap Khusus: Square-1 Odd Parity',
    shortTitle: 'Odd Parity',
    badge: 'Paritas',
    desc: 'Penanganan anomali matematis pertukaran satu pasang rusuk (Square-1 Odd Parity).',
    summary: 'Selesaikan kasus macet paritas di mana hanya 2 edge yang tertukar posisinya.',
    description: 'Kasus paritas ganjil (Odd Parity) terjadi karena permutasi ganjil pada struktur internal Square-1. Membutuhkan algoritma khusus 13 irisan untuk menyelesaikannya.',
    cases: [
      {
        id: 'sq1-odd-parity-alg',
        name: 'Square-1 Odd Parity Algoritma',
        summary: 'Tukar 2 edge atas yang tertukar tanpa merusak bagian lainnya.',
        algorithm: '/ (-3,0) / (0,3) / (-3,0) / (3,0) / (-2,0) / (0,2) / (-4,2) / (4,0) / (0,-2) / (0,2) / (-1,4) / (0,-3) / (0,3)',
        description: 'Algoritma paritas standar WCA untuk Square-1.',
        tips: 'Eksekusi secara teliti langkah demi langkah mengikuti urutan slice / dan tuple.'
      }
    ]
  }
];

const SQUARE1_PRESETS = [
  {
    id: 'solved',
    name: 'Kondisi Selesai (Solved)',
    category: 'Dasar',
    desc: 'Square-1 dalam keadaan kubus terselesaikan.',
    stateDescription: 'Seluruh stiker berada pada muka warna yang tepat.',
    algorithm: '',
    setupMoves: '',
    solutionMoves: ''
  },
  {
    id: 'odd-parity',
    name: 'Square-1 Odd Parity',
    category: 'Kasus Macet & Paritas',
    desc: 'Dua rusuk atas saling bertukar sementara seluruh bagian lain selesai.',
    stateDescription: 'Dua rusuk atas saling bertukar sementara seluruh bagian lain selesai.',
    algorithm: '/ (-3,0) / (0,3) / (-3,0) / (3,0) / (-2,0) / (0,2) / (-4,2) / (4,0) / (0,-2) / (0,2) / (-1,4) / (0,-3) / (0,3)',
    setupMoves: '/ (-3,0) / (0,3) / (-3,0) / (3,0) / (-2,0) / (0,2) / (-4,2) / (4,0) / (0,-2) / (0,2) / (-1,4) / (0,-3) / (0,3)',
    solutionMoves: '/ (-3,0) / (0,3) / (-3,0) / (3,0) / (-2,0) / (0,2) / (-4,2) / (4,0) / (0,-2) / (0,2) / (-1,4) / (0,-3) / (0,3)'
  },
  {
    id: 'scallop-kite',
    name: 'Scallop-Kite Cube Shape',
    category: 'Bentuk Shape-Shifting',
    desc: 'Pola bentuk shape-shifting scallop dan kite sebelum kembali ke kubus.',
    stateDescription: 'Pola bentuk shape-shifting scallop dan kite sebelum kembali ke kubus.',
    algorithm: '(-2,-4) / (-1,-2) / (-3,-3) /',
    setupMoves: '(-2,-4) / (-1,-2) / (-3,-3) /',
    solutionMoves: '(-3,-3) / (1,2) / (2,4) /'
  }
];

const enrichedNotation = {
  ...SQUARE1_NOTATION,
  parse: (str) => parseAlgorithm(str),
  getIndonesian: (token) => getMoveInfo(token)
};

export const square1Definition = {
  id: 'square1',
  wcaId: 'sq1',
  name: 'Square-1 (Shape-Shifting)',
  shortName: 'Sq-1',
  category: 'shape',
  difficulty: 'expert',
  difficultyLabel: 'Master',
  faceCount: 6,
  defaultCameraDistance: 8.5,
  minCameraDistance: 5.0,
  maxCameraDistance: 20.0,
  description: 'Puzzle perubahan bentuk dengan putaran 30°/60° dan potongan slice 180°.',
  hasParity: true,
  colorScheme: Object.values(SQUARE1_COLORS),

  buildModel: (options) => buildSquare1Model(options),

  animateMove: (moveStr, group, onComplete, duration) => {
    animateSquare1Move(group, moveStr, onComplete, duration);
  },

  resetModel: (group) => {
    if (group && typeof group.quaternion?.set === 'function') {
      group.quaternion.set(0, 0, 0, 1);
      group.rotation.set(0, 0, 0);
      const top = typeof group.getObjectByName === 'function' ? group.getObjectByName('layer-top') : null;
      if (top && typeof top.quaternion?.set === 'function') {
        top.quaternion.set(0, 0, 0, 1);
        if (typeof top.rotation?.set === 'function') {
          top.rotation.set(0, 0, 0);
        }
      }
      const bot = typeof group.getObjectByName === 'function' ? group.getObjectByName('layer-bottom') : null;
      if (bot && typeof bot.quaternion?.set === 'function') {
        bot.quaternion.set(0, 0, 0, 1);
        if (typeof bot.rotation?.set === 'function') {
          bot.rotation.set(0, 0, 0);
        }
      }
    }
  },

  parseAlgorithm: (algString) => parseAlgorithm(algString),
  getInverseMove: (move) => getInverseMove(move),
  getMoveInfo: (move) => getMoveInfo(move),
  generateScramble: (length) => generateScramble(length),

  notation: enrichedNotation,
  guideStages: SQUARE1_GUIDE_STAGES,
  presets: SQUARE1_PRESETS,

  netLayout: {
    type: 'dual-disc-equator',
    discs: ['top', 'bottom'],
    equator: 'middle',
    totalStickers: 18
  }
};
