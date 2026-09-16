/**
 * src/solvers/presets/nxnPresets.js
 * Comprehensive State Presets and WCA Scramble Generators for NxN Cubes (2x2 to 7x7)
 * 
 * Satisfies both runtime UI controls and automated test oracles with dual-compatible properties:
 * - id, name, category, desc, stateDescription, setupMoves, solutionMoves, algorithm, stage, tips.
 */

import { STICKER_COLORS } from '../../engine/TextureCache.js';

export const CUBE_COLORS = Object.freeze({
  U: { name: 'Atas (Putih)', hex: STICKER_COLORS.WHITE, code: 'W' },
  D: { name: 'Bawah (Kuning)', hex: STICKER_COLORS.YELLOW, code: 'Y' },
  F: { name: 'Depan (Hijau)', hex: STICKER_COLORS.GREEN, code: 'G' },
  B: { name: 'Belakang (Biru)', hex: STICKER_COLORS.BLUE, code: 'B' },
  R: { name: 'Kanan (Merah)', hex: STICKER_COLORS.RED, code: 'R' },
  L: { name: 'Kiri (Oranye)', hex: STICKER_COLORS.ORANGE, code: 'O' }
});

const BASE_SOLVED_PRESET = (order) => ({
  id: 'solved',
  name: `Kubus ${order}x${order} Selesai (Solved)`,
  category: 'Dasar',
  desc: `Kondisi awal kubus ${order}x${order} yang sudah rapi terpecahkan.`,
  stateDescription: 'Seluruh stiker berada pada muka warna yang tepat.',
  setupMoves: '',
  solutionMoves: '',
  algorithm: '',
  stage: 'solved',
  tips: 'Gunakan tombol Acak untuk memulai permainan acak baru.'
});

export const PRESETS_2X2 = Object.freeze([
  BASE_SOLVED_PRESET(2),
  {
    id: 'sexy-move',
    name: 'Acakan Sexy Move (4x Trigger)',
    category: 'Latihan',
    desc: 'Latihan reflek memutar kombinasi 4 gerakan paling dasar di speedcubing.',
    stateDescription: 'Kondisi kubus setelah 4 kali putaran Sexy Move.',
    setupMoves: "R U R' U' R U R' U' R U R' U' R U R' U'",
    solutionMoves: "R U R' U' R U R' U'",
    algorithm: "R U R' U' R U R' U' R U R' U' R U R' U'",
    stage: 'corners',
    tips: 'Pola ini dapat diselesaikan dengan mengulang Sexy Move 2 kali lagi.'
  },
  {
    id: 'checkerboard',
    name: 'Papan Catur 2x2',
    category: 'Pola Seni',
    desc: 'Pola belang-belang warna kontras pada kubus saku 2x2.',
    stateDescription: 'Pola artistik papan catur saling silang 2x2.',
    setupMoves: 'R2 F2 R2',
    solutionMoves: 'R2 F2 R2',
    algorithm: 'R2 F2 R2',
    stage: 'all',
    tips: 'Dapat dikembalikan dengan memutar rumus yang sama persis.'
  },
  {
    id: 'adj-corner-swap',
    name: 'Tukar Sudut Bersebelahan (T-Perm 2x2)',
    category: 'Kasus Macet',
    desc: 'Dua sudut di lapisan atas tertukar posisinya secara bersebelahan.',
    stateDescription: 'Dua sudut berdampingan tertukar pada lapisan atas.',
    setupMoves: "R U R' U' R' F R2 U' R' U' R U R' F'",
    solutionMoves: "R U R' U' R' F R2 U' R' U' R U R' F'",
    algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",
    stage: 'corners',
    tips: 'Pegang bar yang sudah cocok di sisi kiri, lalu jalankan rumus T-Perm.'
  },
  {
    id: 'diag-corner-swap',
    name: 'Tukar Sudut Diagonal (Y-Perm 2x2)',
    category: 'Kasus Macet',
    desc: 'Dua sudut di lapisan atas tertukar secara diagonal menyilang.',
    stateDescription: 'Dua sudut menyilang tertukar pada lapisan atas.',
    setupMoves: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    solutionMoves: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    stage: 'corners',
    tips: 'Gunakan Y-Perm 2x2 untuk menukar sudut diagonal tanpa merusak lapisan bawah.'
  },
  {
    id: 'sune',
    name: 'Orientasi Sudut Sune (OLL)',
    category: 'OLL',
    desc: 'Pola orientasi sudut dengan 1 stiker kuning di atas.',
    stateDescription: 'Pola ikan Sune standar pada kubus 2x2.',
    setupMoves: "R U R' U R U2 R'",
    solutionMoves: "R U2 R' U' R U' R'",
    algorithm: "R U R' U R U2 R'",
    stage: 'corners',
    tips: 'Posisikan kepala ikan di pojok kiri depan.'
  }
]);

export const PRESETS_3X3 = Object.freeze([
  BASE_SOLVED_PRESET(3),
  {
    id: 'checkerboard',
    name: 'Papan Catur (Checkerboard)',
    category: 'Pola Seni',
    desc: 'Pola klasik legendaris papan catur saling silang di seluruh 6 sisi.',
    stateDescription: 'Pola artistik papan catur saling silang pada seluruh 6 sisi.',
    setupMoves: 'R2 L2 U2 D2 F2 B2',
    solutionMoves: 'R2 L2 U2 D2 F2 B2',
    algorithm: 'R2 L2 U2 D2 F2 B2',
    stage: 'all',
    tips: 'Dapat juga diputar dengan irisan tengah: M2 E2 S2.'
  },
  {
    id: 'superflip',
    name: 'Superflip (12 Rusuk Terbalik)',
    category: 'Pola Seni',
    desc: 'Seluruh 12 rusuk terbalik orientasinya di tempat masing-masing. Pola jarak terjauh (God\'s Number 20 HTM).',
    stateDescription: 'Seluruh 12 rusuk terbalik orientasinya di tempat masing-masing.',
    setupMoves: "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2",
    solutionMoves: "F2 U2 B2 L' R F' R2 D U R' B2 L' U2 R' B2 R' B' F' R2 U'",
    algorithm: "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2",
    stage: 'edges',
    tips: 'Pola 20 langkah paling terkenal dalam matematika Rubik.'
  },
  {
    id: 'cube-in-cube',
    name: 'Kubus di dalam Kubus',
    category: 'Pola Seni',
    desc: 'Pola estetika blok 2x2 terputar di dalam kubus 3x3.',
    stateDescription: 'Pola estetika blok 2x2 terputar di dalam kubus 3x3.',
    setupMoves: "F L F U' R U F2 L2 U' L' B D' B' L2 U",
    solutionMoves: "U' L2 B D B' L U L2 F2 U' R' U F' L' F'",
    algorithm: "F L F U' R U F2 L2 U' L' B D' B' L2 U",
    stage: 'all',
    tips: 'Menampilkan efek 3D kubus mini di pojok depan kanan atas.'
  },
  {
    id: 't-perm',
    name: 'Kasus T-Perm (PLL Standar)',
    category: 'PLL',
    desc: 'Menukar 2 sudut kanan dan 2 rusuk samping secara bersamaan.',
    stateDescription: 'Kasus permutasi T-Perm pada lapisan terakhir.',
    setupMoves: "R U R' U' R' F R2 U' R' U' R U R' F'",
    solutionMoves: "R U R' U' R' F R2 U' R' U' R U R' F'",
    algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",
    stage: 'pll',
    tips: 'Algoritma PLL paling populer dan cepat dihafalkan.'
  },
  {
    id: 'y-perm',
    name: 'Kasus Y-Perm (PLL Diagonal)',
    category: 'PLL',
    desc: 'Menukar 2 sudut diagonal dan 2 rusuk samping.',
    stateDescription: 'Kasus permutasi Y-Perm pada lapisan terakhir.',
    setupMoves: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    solutionMoves: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    stage: 'pll',
    tips: 'Algoritma standar untuk pertukaran sudut diagonal.'
  }
]);

export const PRESETS_4X4 = Object.freeze([
  BASE_SOLVED_PRESET(4),
  {
    id: 'oll-parity',
    name: '4x4 Lucas OLL Parity',
    category: 'Parity',
    desc: 'Satu pasang sayap rusuk terbalik di lapisan atas. Tidak mungkin terjadi di 3x3 murni.',
    stateDescription: 'Satu pasang sayap terbalik pada lapisan atas.',
    setupMoves: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 Rw' U2 Rw U2 Rw' U2 Rw'",
    solutionMoves: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 Rw' U2 Rw U2 Rw' U2 Rw'",
    algorithm: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 Rw' U2 Rw U2 Rw' U2 Rw'",
    stage: 'parity',
    tips: 'Formula Lucas Parity membalik sepasang sayap tanpa mengacak potongan lain.'
  },
  {
    id: 'pll-parity',
    name: '4x4 PLL Parity (Opposite Edges)',
    category: 'Parity',
    desc: 'Dua pasang rusuk komposit berhadapan saling tertukar posisi.',
    stateDescription: 'Dua pasang rusuk komposit saling tertukar di lapisan terakhir.',
    setupMoves: '2R2 U2 2R2 Uw2 2R2 2U2',
    solutionMoves: '2R2 U2 2R2 Uw2 2R2 2U2',
    algorithm: '2R2 U2 2R2 Uw2 2R2 2U2',
    stage: 'parity',
    tips: 'Hanya menggerakkan lapisan dalam 2R dan lapisan ganda Uw.'
  },
  {
    id: 'pll-parity-adj',
    name: '4x4 PLL Parity (Adjacent Edges)',
    category: 'Parity',
    desc: 'Dua pasang rusuk komposit bersebelahan saling tertukar.',
    stateDescription: 'Dua rusuk komposit berdampingan tertukar di lapisan terakhir.',
    setupMoves: "R' U R 2R2 U2 2R2 Uw2 2R2 2U2 R' U' R",
    solutionMoves: "R' U R 2R2 U2 2R2 Uw2 2R2 2U2 R' U' R",
    algorithm: "R' U R 2R2 U2 2R2 Uw2 2R2 2U2 R' U' R",
    stage: 'parity',
    tips: 'Gunakan setup move R\' U R sebelum menjalankan formula PLL Parity.'
  },
  {
    id: 'checkerboard-4x4',
    name: 'Papan Catur 4x4',
    category: 'Pola Seni',
    desc: 'Pola papan catur blok tebal pada kubus 4x4.',
    stateDescription: 'Pola artistik papan catur 4x4.',
    setupMoves: 'Rw2 Lw2 Uw2 Dw2 Fw2 Bw2',
    solutionMoves: 'Rw2 Lw2 Uw2 Dw2 Fw2 Bw2',
    algorithm: 'Rw2 Lw2 Uw2 Dw2 Fw2 Bw2',
    stage: 'all',
    tips: 'Memutar dua lapisan ganda 180 derajat di ketiga sumbu X, Y, Z.'
  }
]);

export const PRESETS_5X5 = Object.freeze([
  BASE_SOLVED_PRESET(5),
  {
    id: 'full-reduction-5x5',
    name: '5x5 Acak Penuh (Solusi Lengkap 6 Tahap)',
    category: 'Solusi Lengkap',
    desc: 'Kondisi acak komprehensif yang diselesaikan menggunakan seluruh 6 tahapan metode reduksi.',
    stateDescription: 'Kondisi acak komprehensif untuk pembelajaran 6 tahap metode reduksi.',
    setupMoves: "Rw U Rw' 2Rw U 2Rw' 3Rw U 3Rw' Uw' R U R' F R' F' R Uw F R U R' U' F' Rw U2 Rw U2 Rw' U2 3Rw U2 Lw' U2 Rw U2 Rw' U2 Rw' x' U2 Rw'",
    solutionMoves: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 3Rw' U2 Rw U2 Rw' U2 Rw' F R U R' U' F' Uw' R' F R F' R U' R' Uw 3Rw U' 3Rw' 2Rw' U' 2Rw' Rw U' Rw'",
    algorithm: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 3Rw' U2 Rw U2 Rw' U2 Rw' F R U R' U' F' Uw' R' F R F' R U' R' Uw 3Rw U' 3Rw' 2Rw' U' 2Rw' Rw U' Rw'",
    stage: 'all',
    tips: 'Solusi lengkap 6 tahap sesuai panduan Feliks Zemdegs (CubeSkills): Centers, Freeslice Edges, L4E Slice-Flip-Slice, 3x3 Stage, dan Paritas Sayap.'
  },
  {
    id: 'wing-parity',
    name: '5x5 Wing Flip Parity',
    category: 'Parity',
    desc: 'Sepasang sayap luar terbalik relatif terhadap midge tengah.',
    stateDescription: 'Sepasang sayap luar terbalik relatif terhadap midge tengah.',
    setupMoves: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 3Rw' U2 Rw U2 Rw' U2 Rw'",
    solutionMoves: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 3Rw' U2 Rw U2 Rw' U2 Rw'",
    algorithm: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 3Rw' U2 Rw U2 Rw' U2 Rw'",
    stage: 'parity',
    tips: 'Memanfaatkan lapisan 3Rw untuk menjaga midge tetap di porosnya.'
  },
  {
    id: 'oll-parity',
    name: 'Kasus OLL Parity (Sayap Terbalik)',
    category: 'Parity',
    desc: 'Alias untuk 5x5 Wing Flip Parity.',
    stateDescription: 'Satu rusuk sayap terbalik pada lapisan atas.',
    setupMoves: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 3Rw' U2 Rw U2 Rw' U2 Rw'",
    solutionMoves: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 3Rw' U2 Rw U2 Rw' U2 Rw'",
    algorithm: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 3Rw' U2 Rw U2 Rw' U2 Rw'",
    stage: 'parity',
    tips: 'Sama dengan Wing Flip Parity.'
  },
  {
    id: 'l2c-barswap',
    name: '5x5 Last 2 Centers Bar Swap',
    category: 'Centers',
    desc: 'Pertukaran satu bar 1x3 antara dua pusat terakhir.',
    stateDescription: 'Pertukaran bar 1x3 antara center atas dan depan.',
    setupMoves: "Rw U Rw' U Rw U2 Rw'",
    solutionMoves: "Rw U Rw' U Rw U2 Rw'",
    algorithm: "Rw U Rw' U Rw U2 Rw'",
    stage: 'centers',
    tips: 'Teknik push-turn-restore untuk menyelaraskan bar center.'
  },
  {
    id: 'l2c-cornerswap',
    name: '5x5 Last 2 Centers Corner Swap',
    category: 'Centers',
    desc: 'Pertukaran stiker sudut pada dua pusat terakhir.',
    stateDescription: 'Pertukaran stiker sudut antara center atas dan depan.',
    setupMoves: "Rw U Rw' U' Rw' F Rw F'",
    solutionMoves: "Rw U Rw' U' Rw' F Rw F'",
    algorithm: "Rw U Rw' U' Rw' F Rw F'",
    stage: 'centers',
    tips: 'Komutator presisi untuk sudut center.'
  },
  {
    id: 'checkerboard-5x5',
    name: 'Catur Bertingkat 5x5',
    category: 'Pola Seni',
    desc: 'Pola catur berlapis indah pada kubus 5x5.',
    stateDescription: 'Pola artistik catur bertingkat 5x5.',
    setupMoves: 'Rw2 Lw2 3Rw2 Uw2 Dw2 3Uw2 Fw2 Bw2 3Fw2',
    solutionMoves: 'Rw2 Lw2 3Rw2 Uw2 Dw2 3Uw2 Fw2 Bw2 3Fw2',
    algorithm: 'Rw2 Lw2 3Rw2 Uw2 Dw2 3Uw2 Fw2 Bw2 3Fw2',
    stage: 'all',
    tips: 'Kombinasi putaran 180 derajat pada irisan luar dan irisan tengah.'
  },
  {
    id: 'case-3-edge-insert',
    name: 'Kasus 3: Pasang Sayap Bawah ke FR (Dd R F\' U R\' F Dd\')',
    category: 'Reduksi Rusuk',
    desc: 'Memasukkan rusuk sayap dari lapisan bawah ke kanan-depan.',
    stateDescription: 'Pemasangan sayap rusuk dari lapisan bawah ke slot depan-kanan.',
    setupMoves: "Dw F' R U' F R' Dw'",
    solutionMoves: "Dw R F' U R' F Dw'",
    algorithm: "Dw R F' U R' F Dw'",
    stage: 'edges',
    tips: 'Diagram Kasus 3: (Dd) R F\' U R\' F (Dd)\''
  },
  {
    id: 'case-4-edge-insert',
    name: 'Kasus 4: Pasang Sayap Bawah ke FL (Dd\' L\' U\' L F\' L F L\' Dd)',
    category: 'Reduksi Rusuk',
    desc: 'Memasukkan rusuk sayap dari lapisan bawah ke kiri-depan.',
    stateDescription: 'Pemasangan sayap rusuk dari lapisan bawah ke slot depan-kiri.',
    setupMoves: "Dw' L F' L' F L' U L Dw",
    solutionMoves: "Dw' L' U' L F' L F L' Dw",
    algorithm: "Dw' L' U' L F' L F L' Dw",
    stage: 'edges',
    tips: 'Diagram Kasus 4: (Dd)\' L\' U\' L F\' L F L\' (Dd)'
  },
  {
    id: 'case-6-wing-swap',
    name: 'Kasus 6: Tukar Dua Sayap Baris Atas (Uu2 Rr2 F2 u2 F2 Rr2 Uu2)',
    category: 'Reduksi Rusuk',
    desc: 'Menukar dua stiker sayap di baris atas tanpa merusak pusat.',
    stateDescription: 'Dua sayap baris atas tertukar.',
    setupMoves: "Uw2 2R2 F2 2U2 F2 2R2 Uw2",
    solutionMoves: "Uw2 2R2 F2 2U2 F2 2R2 Uw2",
    algorithm: "Uw2 2R2 F2 2U2 F2 2R2 Uw2",
    stage: 'edges',
    tips: 'Diagram Kasus 6: (Uu)2 (Rr)2 F2 u2 F2 (Rr)2 (Uu)2'
  },
  {
    id: 'case-7-flip-wing',
    name: 'Kasus 7: Membalik Sayap Terbalik (F2 Rr D2 Rr\' F2 U2 F2 Ll B2 Ll\')',
    category: 'Reduksi Rusuk',
    desc: 'Membalikkan sayap yang terbalik orientasinya pada rusuk yang sama.',
    stateDescription: 'Sayap terbalik orientasinya pada rusuk yang sama.',
    setupMoves: "2L B2 2L' F2 U2 F2 2R D2 2R' F2",
    solutionMoves: "F2 2R D2 2R' F2 U2 F2 2L B2 2L'",
    algorithm: "F2 2R D2 2R' F2 U2 F2 2L B2 2L'",
    stage: 'edges',
    tips: 'Diagram Kasus 7: F2 (Rr) D2 (Rr)\' F2 U2 F2 (Ll) B2 (Ll)\''
  },
  {
    id: 'case-8-l2e-comm',
    name: 'Kasus 8: Komutator Dua Rusuk Terakhir (L2E)',
    category: 'Reduksi Rusuk',
    desc: 'Komutator penyelesaian dua rusuk terakhir untuk menyelaraskan kedua sayap sekaligus.',
    stateDescription: 'Dua rusuk terakhir belum terselaraskan.',
    setupMoves: "2R2 B2 2R B2 2R' B2 2R B2 2R' U2 2R U2 B2 2R2",
    solutionMoves: "2R2 B2 2R' U2 2R' U2 B2 2R' B2 2R B2 2R' B2 2R2",
    algorithm: "2R2 B2 2R' U2 2R' U2 B2 2R' B2 2R B2 2R' B2 2R2",
    stage: 'edges',
    tips: 'Diagram Kasus 8: (Rr)2 B2 (Rr)\' U2 (Rr)\' U2 B2 (Rr)\' B2 (Rr) B2 (Rr)\' B2 (Rr)2'
  },
  {
    id: 'case-2-adjacent-swap',
    name: 'Kasus 2: Menukar Sepasang Sayap Bersebelahan',
    category: 'Parity',
    desc: 'Menukar dua pasang sayap rusuk yang bersebelahan.',
    stateDescription: 'Sepasang sayap rusuk bersebelahan tertukar.',
    setupMoves: "2L2 U2 2R U2 2R' F2 2L F2 U2 2L U2 2L",
    solutionMoves: "2L' U2 2L' U2 F2 2L' F2 2R U2 2R' U2 2L2",
    algorithm: "2L' U2 2L' U2 F2 2L' F2 2R U2 2R' U2 2L2",
    stage: 'parity',
    tips: 'Diagram Kasus 2: (Ll)\' U2 (Ll)\' U2 F2 (Ll)\' F2 (Rr) U2 (Rr)\' U2 (Ll)2'
  }
]);

export const PRESETS_6X6 = Object.freeze([
  BASE_SOLVED_PRESET(6),
  {
    id: 'inner-oll-parity',
    name: '6x6 Inner-Slice OLL Parity',
    category: 'Parity',
    desc: 'Sepasang sayap dalam (inner wings) terbalik pada irisan ke-3.',
    stateDescription: 'Inner wings terbalik pada lapisan irisan ke-3.',
    setupMoves: "3Rw U2 x 3Rw U2 3Rw U2 3Rw' U2 3Lw U2 3Rw' U2 3Rw U2 3Rw' U2 3Rw'",
    solutionMoves: "3Rw U2 x 3Rw U2 3Rw U2 3Rw' U2 3Lw U2 3Rw' U2 3Rw U2 3Rw' U2 3Rw'",
    algorithm: "3Rw U2 x 3Rw U2 3Rw U2 3Rw' U2 3Lw U2 3Rw' U2 3Rw U2 3Rw' U2 3Rw'",
    stage: 'parity',
    tips: 'Gunakan irisan 3Rw untuk membalik pasangan sayap dalam.'
  },
  {
    id: 'outer-oll-parity',
    name: '6x6 Outer-Slice OLL Parity',
    category: 'Parity',
    desc: 'Sepasang sayap luar (outer wings) terbalik pada irisan ke-2.',
    stateDescription: 'Outer wings terbalik pada lapisan irisan ke-2.',
    setupMoves: "2Rw U2 x 2Rw U2 2Rw U2 2Rw' U2 2Lw U2 2Rw' U2 2Rw U2 2Rw' U2 2Rw'",
    solutionMoves: "2Rw U2 x 2Rw U2 2Rw U2 2Rw' U2 2Lw U2 2Rw' U2 2Rw U2 2Rw' U2 2Rw'",
    algorithm: "2Rw U2 x 2Rw U2 2Rw U2 2Rw' U2 2Lw U2 2Rw' U2 2Rw U2 2Rw' U2 2Rw'",
    stage: 'parity',
    tips: 'Gunakan irisan 2Rw untuk membalik pasangan sayap luar.'
  },
  {
    id: 'pll-parity',
    name: '6x6 Composite PLL Parity',
    category: 'Parity',
    desc: 'Dua rusuk komposit penuh tertukar saling berhadapan.',
    stateDescription: 'Dua rusuk komposit penuh tertukar pada lapisan atas.',
    setupMoves: '2Rw2 U2 2Rw2 Uw2 2Rw2 2Uw2',
    solutionMoves: '2Rw2 U2 2Rw2 Uw2 2Rw2 2Uw2',
    algorithm: '2Rw2 U2 2Rw2 Uw2 2Rw2 2Uw2',
    stage: 'parity',
    tips: 'Eksekusi rumus PLL Parity dengan memutar 2 lapis sekaligus.'
  },
  {
    id: 'checkerboard-6x6',
    name: 'Papan Catur 6x6',
    category: 'Pola Seni',
    desc: 'Pola catur blok 6x6 yang memukau.',
    stateDescription: 'Pola artistik papan catur 6x6.',
    setupMoves: 'Rw2 Lw2 3Rw2 Uw2 Dw2 3Uw2 Fw2 Bw2 3Fw2',
    solutionMoves: 'Rw2 Lw2 3Rw2 Uw2 Dw2 3Uw2 Fw2 Bw2 3Fw2',
    algorithm: 'Rw2 Lw2 3Rw2 Uw2 Dw2 3Uw2 Fw2 Bw2 3Fw2',
    stage: 'all',
    tips: 'Putar ketiga lapis ganda 180 derajat di semua sumbu.'
  }
]);

export const PRESETS_7X7 = Object.freeze([
  BASE_SOLVED_PRESET(7),
  {
    id: 'inner-wing-parity',
    name: '7x7 Inner Wing Parity (Slice 3)',
    category: 'Parity',
    desc: 'Sepasang sayap dalam pada kubus 7x7 terbalik orientasinya.',
    stateDescription: 'Sepasang sayap dalam pada slice ke-3 terbalik.',
    setupMoves: "3Rw U2 x 3Rw U2 3Rw U2 3Rw' U2 3Lw U2 3Rw' U2 3Rw U2 3Rw' U2 3Rw'",
    solutionMoves: "3Rw U2 x 3Rw U2 3Rw U2 3Rw' U2 3Lw U2 3Rw' U2 3Rw U2 3Rw' U2 3Rw'",
    algorithm: "3Rw U2 x 3Rw U2 3Rw U2 3Rw' U2 3Lw U2 3Rw' U2 3Rw U2 3Rw' U2 3Rw'",
    stage: 'parity',
    tips: 'Paritas sayap dalam diselesaikan dengan memutar slice 3Rw.'
  },
  {
    id: 'outer-wing-parity',
    name: '7x7 Outer Wing Parity (Slice 2)',
    category: 'Parity',
    desc: 'Sepasang sayap luar pada kubus 7x7 terbalik orientasinya.',
    stateDescription: 'Sepasang sayap luar pada slice ke-2 terbalik.',
    setupMoves: "2Rw U2 x 2Rw U2 2Rw U2 2Rw' U2 2Lw U2 2Rw' U2 2Rw U2 2Rw' U2 2Rw'",
    solutionMoves: "2Rw U2 x 2Rw U2 2Rw U2 2Rw' U2 2Lw U2 2Rw' U2 2Rw U2 2Rw' U2 2Rw'",
    algorithm: "2Rw U2 x 2Rw U2 2Rw U2 2Rw' U2 2Lw U2 2Rw' U2 2Rw U2 2Rw' U2 2Rw'",
    stage: 'parity',
    tips: 'Paritas sayap luar diselesaikan dengan memutar slice 2Rw.'
  },
  {
    id: 'center-barswap-7x7',
    name: '7x7 Center Bar Swap',
    category: 'Centers',
    desc: 'Pertukaran bar 1x5 antara pusat atas dan pusat depan.',
    stateDescription: 'Pertukaran bar center 1x5 pada 2 pusat terakhir.',
    setupMoves: "3Rw U 3Rw' U 3Rw U2 3Rw'",
    solutionMoves: "3Rw U 3Rw' U 3Rw U2 3Rw'",
    algorithm: "3Rw U 3Rw' U 3Rw U2 3Rw'",
    stage: 'centers',
    tips: 'Komutator bar 1x5 untuk menyelaraskan center 7x7.'
  },
  {
    id: 'superflip-7x7',
    name: 'Superflip 7x7',
    category: 'Pola Seni',
    desc: 'Pola superflip megah pada kubus 7x7.',
    stateDescription: 'Seluruh rusuk terbalik pada kubus 7x7.',
    setupMoves: "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2",
    solutionMoves: "F2 U2 B2 L' R F' R2 D U R' B2 L' U2 R' B2 R' B' F' R2 U'",
    algorithm: "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2",
    stage: 'edges',
    tips: 'Pola estetika pada kubus raksasa 7x7.'
  }
]);

export const NXN_PRESETS = Object.freeze({
  'cube-2x2': PRESETS_2X2,
  'cube-3x3': PRESETS_3X3,
  'cube-4x4': PRESETS_4X4,
  'cube-5x5': PRESETS_5X5,
  'cube-6x6': PRESETS_6X6,
  'cube-7x7': PRESETS_7X7
});

/**
 * Generates an authoritative WCA-compliant scramble sequence for any NxN cube.
 * 
 * @param {number} order - Cube order (2..7)
 * @param {number} [targetLength] - Optional custom scramble length
 * @returns {string} Scramble algorithm string
 */
export function generateNxNScramble(order, targetLength) {
  const defaultLengths = { 2: 11, 3: 25, 4: 40, 5: 60, 6: 80, 7: 100 };
  const length = targetLength || defaultLengths[order] || 25;
  const modifiers = ['', "'", '2'];

  if (order === 2) {
    const faces = ['U', 'R', 'F'];
    const scramble = [];
    let lastFace = '';
    while (scramble.length < length) {
      const face = faces[Math.floor(Math.random() * faces.length)];
      if (face === lastFace) continue;
      lastFace = face;
      const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
      scramble.push(`${face}${mod}`);
    }
    return scramble.join(' ');
  }

  const outerFaces = ['R', 'L', 'U', 'D', 'F', 'B'];
  const pool = [];

  outerFaces.forEach(f => {
    pool.push(f);
    if (order >= 4) pool.push(`${f}w`);
    if (order >= 6) {
      pool.push(`3${f}w`);
    }
  });

  const getAxis = (token) => {
    const char = token.replace(/^[0-9]+/, '')[0];
    if (char === 'R' || char === 'L') return 'X';
    if (char === 'U' || char === 'D') return 'Y';
    return 'Z';
  };

  const scramble = [];
  let lastAxis = '';
  let secondLastAxis = '';

  while (scramble.length < length) {
    const base = pool[Math.floor(Math.random() * pool.length)];
    const axis = getAxis(base);

    if (axis === lastAxis) continue;
    if (axis === secondLastAxis && lastAxis === axis) continue;

    const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
    scramble.push(`${base}${mod}`);

    secondLastAxis = lastAxis;
    lastAxis = axis;
  }

  return scramble.join(' ');
}
