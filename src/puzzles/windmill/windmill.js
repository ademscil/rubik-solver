/**
 * src/puzzles/windmill/windmill.js
 * Windmill Cube (Katsuhiko Okamoto 2003) Definition Adapter
 */

import { buildWindmillModel, WINDMILL_COLORS } from './WindmillGeometry.js';
import { animateNxNMove } from '../nxn/NxNKinematics.js';
import { parseAlgorithm, getInverseMove } from '../../cube/rubikNotation.js';
import { generateNxNScramble, CUBE_COLORS } from '../../solvers/presets/nxnPresets.js';
import { createCubicNetLayout, applyNetStateToNxN, extractNetStateFromNxN } from '../nxn/netLayout.js';

export const WINDMILL_GUIDE_STAGES = [
  {
    id: 'wm-stage-1',
    title: 'Part 1: Palang Putih & Penyelarasan Center Samping',
    shortTitle: 'Part 1: Cross & Center',
    badge: 'Part 1: Cross',
    formulaName: "F R U R' U' F' / Sledge",
    description: 'Menyusun palang putih di dasar sekaligus menyelaraskan kemiringan center samping.',
    tips: 'Karena center samping memiliki kemiringan 26.5°, pastikan rusuk putih rata dan sejajar dengan center samping.',
    cases: [
      {
        id: 'wm-c1',
        name: 'Penyelarasan Rusuk Putih dengan Center Miring',
        algorithm: "F R U R' U' F'",
        description: 'Memasukkan rusuk putih agar sejajar dengan orientasi center samping.'
      }
    ]
  },
  {
    id: 'wm-stage-2',
    title: 'Part 2: Lapisan Bawah & Tengah (F2L Bentuk Miring)',
    shortTitle: 'Part 2: F2L',
    badge: 'Part 2: F2L',
    formulaName: "R U R' U' / U' L' U L",
    description: 'Memasangkan sudut segitiga bawah dan rusuk miring tengah membentuk dua lapisan rata.',
    tips: 'Perhatikan ketebalan potongan sudut segitiga agar tidak terbalik saat dimasukkan ke slot.',
    cases: [
      {
        id: 'wm-c2',
        name: 'Memasukkan Sudut Segitiga ke Slot F2L',
        algorithm: "R U R' U'",
        description: 'Trigger Sexy-Move untuk menenggelamkan sudut segitiga ke lapisan bawah.'
      }
    ]
  },
  {
    id: 'wm-stage-3',
    title: 'Part 3: Lapisan Atas Datar (OLL Windmill)',
    shortTitle: 'Part 3: OLL Datar',
    badge: 'Part 3: OLL',
    formulaName: "R U R' U R U2 R' (Sune)",
    description: 'Mengorientasikan seluruh stiker kuning ke atas sehingga permukaan atas menjadi rata sepenuhnya.',
    tips: 'Kuningkan seluruh sisi atas menggunakan formula Sune hingga tidak ada sudut yang mencuat keluar.',
    cases: [
      {
        id: 'wm-c3',
        name: 'OLL Sune Meratakan Lapisan Atas',
        algorithm: "R U R' U R U2 R'",
        description: 'Meratakan seluruh rusuk dan sudut kuning ke permukaan atas.'
      }
    ]
  },
  {
    id: 'wm-stage-4',
    title: 'Part 4: Permutasi Sudut & Rusuk (PLL Windmill)',
    shortTitle: 'Part 4: PLL',
    badge: 'Part 4: PLL',
    formulaName: "R U R' U' R' F R2 U' R' U' R U R' F' (T-Perm)",
    description: 'Menyelaraskan posisi sudut dan rusuk kuning hingga seluruh sisi samping rapi.',
    tips: 'Gunakan T-Perm untuk menukar sudut yang belum sejajar dengan pola samping.',
    cases: [
      {
        id: 'wm-c4',
        name: 'T-Perm Penyelaras Sudut dan Rusuk',
        algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",
        description: 'Formula kunci penataan lapisan akhir Windmill Cube.'
      }
    ]
  },
  {
    id: 'wm-stage-5',
    title: 'Part 5: Koreksi Orientasi Center Samping 90°/180°',
    shortTitle: 'Part 5: Supercube Fix',
    badge: 'Part 5: Center Fix',
    formulaName: "(R U R' U) x 5 / (M' U M U') x 2",
    description: 'Memutar center samping yang terputar 90° atau 180° (masalah khas puzzle shape mod).',
    tips: 'Pada Windmill Cube, center samping memiliki arah. Gunakan komutator putar center jika center melintang.',
    cases: [
      {
        id: 'wm-c5',
        name: 'Putar Center Atas/Depan 180 Derajat',
        algorithm: "R U R' U R U R' U R U R' U R U R' U R U R' U",
        description: 'Memutar center 180 derajat tanpa mengubah posisi potongan lainnya.'
      }
    ]
  }
];

export const WINDMILL_PRESETS = [
  {
    id: 'solved',
    name: 'Kondisi Selesai (Solved)',
    category: 'Solved',
    desc: 'Bentuk kubus sempurna dengan seluruh warna selaras.',
    stateDescription: 'Windmill Cube dalam kondisi terpecahkan sempurna.',
    setupMoves: '',
    solutionMoves: '',
    algorithm: '',
    stage: 'all',
    tips: 'Kubus dalam keadaan terselesaikan sempurna.'
  },
  {
    id: 'shape-shift-star',
    name: 'Bentuk Kincir Mencuat (Shape-Shifted)',
    category: 'Bentuk Dinamis',
    desc: 'Bentuk kincir angin dengan sudut-sudut mencuat keluar dari kubus.',
    stateDescription: 'Bentuk kincir angin khas dengan potongan mencuat.',
    setupMoves: "U R U' R' U F U' F' U2",
    solutionMoves: "U2 F U F' U' R U R' U'",
    algorithm: "U2 F U F' U' R U R' U'",
    stage: 'all',
    tips: 'Menampilkan keunikan bentuk kincir angin yang tidak beraturan saat diputar.'
  },
  {
    id: 'center-180',
    name: 'Center Terbalik 180° (Supercube Parity)',
    category: 'Kasus Unik',
    desc: 'Center samping terputar 180 derajat pada sumbu putar miring.',
    stateDescription: 'Center samping terbalik 180 derajat.',
    setupMoves: "R U R' U R U R' U R U R' U R U R' U R U R' U",
    solutionMoves: "R U R' U R U R' U R U R' U R U R' U R U R' U",
    algorithm: "R U R' U R U R' U R U R' U R U R' U R U R' U",
    stage: 'all',
    tips: 'Gunakan komutator (R U R\' U) 5x untuk membetulkan orientasi center.'
  },
  {
    id: 'checkerboard-windmill',
    name: 'Papan Catur Kincir Angin',
    category: 'Pola Seni',
    desc: 'Pola papan catur geometris pada Windmill Cube.',
    stateDescription: 'Pola artistik papan catur pada bentuk kincir.',
    setupMoves: 'R2 L2 U2 D2 F2 B2',
    solutionMoves: 'R2 L2 U2 D2 F2 B2',
    algorithm: 'R2 L2 U2 D2 F2 B2',
    stage: 'all',
    tips: 'Putaran 180 derajat di ketiga sumbu menghasilkan kontras warna berselang-seling.'
  }
];

export const windmillDefinition = {
  id: 'windmill',
  wcaId: 'wind',
  name: 'Windmill Cube (Katsuhiko Okamoto)',
  shortName: 'Windmill',
  category: 'shape',
  difficulty: 'intermediate',
  difficultyLabel: 'Menengah',
  difficultyTier: 'menengah',
  beginnerMethod: 'LBL Shape-Mod & Supercube Center Fix',
  order: 3,
  faceCount: 6,
  defaultCameraDistance: 8.0,
  minCameraDistance: 5.0,
  maxCameraDistance: 20.0,
  description: 'Modifikasi bentuk 3x3x3 karya Katsuhiko Okamoto (2003) dengan sumbu potong terotasi 26.56° dan perubahan bentuk dinamis (shape-shifting).',
  hasParity: true,
  colorScheme: WINDMILL_COLORS,

  buildModel: (options) => buildWindmillModel(options),

  animateMove: (moveStr, group, onComplete, duration, pivotGroup) => {
    animateNxNMove(group, moveStr, onComplete, duration, pivotGroup);
  },

  resetModel: (group) => {
    if (group && typeof group.rotation?.set === 'function') {
      group.rotation.set(0, 0, 0);
    }
  },

  parseAlgorithm: (algString) => parseAlgorithm(algString),
  getInverseMove: (move) => getInverseMove(move),
  generateScramble: (length) => generateNxNScramble(3, length),

  guideStages: WINDMILL_GUIDE_STAGES,
  presets: WINDMILL_PRESETS,
  netLayout: createCubicNetLayout(3),

  applyNetState: (group, netState) => applyNetStateToNxN(group, netState, 3),
  extractNetState: (group) => extractNetStateFromNxN(group, 3, CUBE_COLORS)
};

export default windmillDefinition;

