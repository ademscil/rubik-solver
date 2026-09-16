/**
 * src/solvers/solverStages.js
 * Universal Pedagogical Stage Partitioner for all 10 WCA Puzzles
 * 
 * Provides structured stage metadata, badges, formulas, and progress tracking
 * so learners always understand which stage they are currently executing.
 */

import { generatePedagogicalLBLSolution } from './lbl3x3Solver.js';
import { generatePedagogical5x5Solution } from './reduction5x5Solver.js';

export { generatePedagogicalLBLSolution, generatePedagogical5x5Solution };

/**
 * Universal stage templates for all puzzle types
 */
const PUZZLE_STAGE_TEMPLATES = {
  'cube-5x5': [
    {
      id: 'part-1',
      title: 'Part 1: Membuat 2 Center Pertama (Putih & Kuning)',
      shortTitle: 'Center 1-2',
      badge: 'Part 1: Center 1-2',
      formulaName: "Rw U Rw' / 2Rw U 2Rw'",
      description: 'Menyusun baris tengah 1x3 putih di dasar dan kuning di seberangnya.',
      tips: 'Bentuk baris 1x3 terlebih dahulu, lalu satukan 3 baris menjadi center 3x3.'
    },
    {
      id: 'part-2',
      title: 'Part 2: Membuat 4 Center Samping (Depan, Kanan, Kiri, Belakang)',
      shortTitle: '4 Center',
      badge: 'Part 2: 4 Center',
      formulaName: "3Rw U 3Rw' / 2Rw U' 2Rw'",
      description: 'Menyelesaikan pusat depan, kanan, kiri, dan belakang dengan komutator baris.',
      tips: 'Gunakan komutator baris agar center putih dan kuning yang sudah jadi tidak rusak.'
    },
    {
      id: 'part-3',
      title: 'Part 3: Memasangkan 8 Rusuk Pertama (Freeslice Tredges)',
      shortTitle: '8 Tredges',
      badge: 'Part 3: 8 Tredges',
      formulaName: "Uw' (R U R' F R' F' R) Uw",
      description: 'Menggabungkan rusuk tengah dengan rusuk sayap kiri dan kanan pada lapisan bebas.',
      tips: 'Gunakan lapisan bebas untuk menyandingkan pasangan rusuk tanpa merusak center.'
    },
    {
      id: 'part-4',
      title: 'Part 4: Memasangkan 4 Rusuk Terakhir (Slice-Flip-Slice)',
      shortTitle: '4 Rusuk Akhir',
      badge: 'Part 4: 4 Rusuk',
      formulaName: "Uw' (Trigger) Uw",
      description: 'Menyelesaikan 4 rusuk terakhir dengan teknik Slice-Flip-Slice di slot depan/atas.',
      tips: 'Iris lapisan atas, balik rusuk di slot kanan, lalu kembalikan irisan.'
    },
    {
      id: 'part-5',
      title: 'Part 5: Menyelesaikan Seperti Rubik 3x3',
      shortTitle: 'Tahap 3x3',
      badge: 'Part 5: Tahap 3x3',
      formulaName: 'Cross + F2L + OLL',
      description: 'Selesaikan kubus seperti 3x3 biasa dari palang bawah hingga orientasi kuning.',
      tips: 'Anggap setiap blok 3x3 sebagai center dan setiap tredge sebagai edge biasa.'
    },
    {
      id: 'part-6',
      title: 'Part 6: Paritas Sayap & Selesai (PLL)',
      shortTitle: 'Paritas/Selesai',
      badge: 'Part 6: Paritas Sayap',
      formulaName: 'Rw2 B2 U2 ... (Parity) + T-Perm',
      description: 'Membalikkan sayap rusuk terakhir jika terbalik arah, lalu kunci dengan PLL akhir.',
      tips: 'Eksekusi rumus paritas sayap 5x5 untuk menuntaskan penyelesaian hingga 100% utuh.'
    }
  ],
  'cube-3x3': [
    {
      id: 'stage-1',
      title: 'Tahap 1: Satu Warna Putih & Lapisan Bawah',
      shortTitle: 'Tahap 1 (Lapisan 1)',
      badge: 'Satu Warna',
      formulaName: "Palang Putih & Lift (R U R' U')",
      description: 'Menyelesaikan sisi putih di bawah serta keselarasan warna samping lapisan pertama.',
      tips: "Gunakan Sexy Move (R U R' U') untuk menjemput sudut putih ke posisinya."
    },
    {
      id: 'stage-2',
      title: 'Tahap 2: Lapisan Tengah (Second Layer)',
      shortTitle: 'Tahap 2 (Tengah)',
      badge: 'Lapisan Tengah',
      formulaName: "Belok Kanan & Belok Kiri",
      description: 'Memasukkan 4 rusuk lapisan tengah tanpa mengganggu lapisan pertama.',
      tips: "Gunakan rumus U R U' R' U' F' U F atau simetris kirinya."
    },
    {
      id: 'stage-3',
      title: 'Tahap 3: Warna Kuning Atas (OLL)',
      shortTitle: 'Tahap 3 (Warna Atas)',
      badge: 'Warna Atas',
      formulaName: "Palang Kuning & Sune",
      description: 'Membentuk Palang Kuning lalu menguningkan seluruh muka atas dengan Rumus Ikan Sune.',
      tips: "Gunakan F R U R' U' F' lalu Sune R U R' U R U2 R'."
    },
    {
      id: 'stage-4',
      title: 'Tahap 4: Lapisan Atas & Selesai (PLL)',
      shortTitle: 'Tahap 4 (Selesai)',
      badge: 'Lapisan Atas',
      formulaName: "T-Perm & U-Perm",
      description: 'Menyelaraskan sudut dengan T-Perm dan merapikan rusuk akhir dengan U-Perm.',
      tips: "Cari dua lampu kembar (headlights), taruh di belakang, lalu eksekusi T-Perm."
    }
  ],
  'cube-2x2': [
    {
      id: 'stage-1',
      title: 'Tahap 1: Lapisan Putih Pertama',
      shortTitle: 'Lapisan 1',
      badge: 'Lapisan 1',
      formulaName: "Lift Penumpang (R U R')",
      description: 'Menyelesaikan muka putih pertama dengan warna samping selaras melingkar.',
      tips: "Cari sudut jangkar lalu pasangkan 3 sudut lainnya dengan Sexy Move."
    },
    {
      id: 'stage-2',
      title: 'Tahap 2: Warna Kuning Atas (OLL)',
      shortTitle: 'Kuning Atas',
      badge: 'Warna Atas',
      formulaName: "Rumus Ikan (Sune)",
      description: 'Menguningkan seluruh muka atas dengan rumus legendaris Sune.',
      tips: "Posisikan kepala ikan di kiri-depan sebelum mengeksekusi Sune."
    },
    {
      id: 'stage-3',
      title: 'Tahap 3: Merapikan Sudut (PLL & Selesai)',
      shortTitle: 'Selesai',
      badge: 'Merapikan',
      formulaName: "T-Perm / Y-Perm",
      description: 'Menukar sudut yang belum rapi menggunakan lampu mobil kembar.',
      tips: "Jika ada bar warna sama di samping, taruh di belakang lalu T-Perm."
    }
  ],
  'cube-4x4': [
    {
      id: 'stage-1',
      title: 'Tahap 1: Sentralisasi Pusat (Centers 2x2)',
      shortTitle: 'Centers',
      badge: 'Pusat',
      formulaName: 'Bar 1x2 Commutator',
      description: 'Menyatukan 24 stiker pusat menjadi 6 blok center 2x2 seragam.',
      tips: 'Buat bar 1x2 di sisi samping lalu angkat ke atas.'
    },
    {
      id: 'stage-2',
      title: 'Tahap 2: Penggabungan Rusuk (Edge Pairing)',
      shortTitle: 'Edges',
      badge: 'Rusuk',
      formulaName: 'Slice-Flip-Slice',
      description: 'Menggabungkan setiap 2 potongan sayap menjadi 1 rusuk utuh.',
      tips: 'Gunakan teknik Uw / Dw slice untuk menyandingkan pasangan rusuk.'
    },
    {
      id: 'stage-3',
      title: 'Tahap 3: Penyelesaian 3x3 LBL',
      shortTitle: '3x3 Stage',
      badge: 'Reduksi',
      formulaName: 'CFOP / LBL',
      description: 'Menyelesaikan kubus seperti kubus 3x3 biasa setelah tereduksi.',
      tips: 'Putar hanya lapisan luar (outer layers) agar pusat dan rusuk tidak pecah.'
    },
    {
      id: 'stage-4',
      title: 'Tahap 4: Penanganan Parity & Finishing',
      shortTitle: 'Parity',
      badge: 'Parity Fix',
      formulaName: 'OLL/PLL Parity',
      description: 'Menuntaskan kasus khusus parity flip dan parity swap jika muncul.',
      tips: 'Gunakan algoritma parity spesifik 4x4 untuk menyelesaikan rubik.'
    }
  ],
  'pyraminx': [
    {
      id: 'stage-1',
      title: 'Tahap 1: Ujung & Pusat (Tips & Centers)',
      shortTitle: 'Tips & Centers',
      badge: 'Tahap 1',
      formulaName: 'Rotasi Ujung 120°',
      description: 'Menyelaraskan 4 tip kecil dan 4 blok pusat tetrahedral.',
      tips: 'Putar u, r, l, b terlebih dahulu agar warnanya cocok dengan center terdekat.'
    },
    {
      id: 'stage-2',
      title: 'Tahap 2: Lapisan Pertama (First Layer V)',
      shortTitle: 'Lapisan 1',
      badge: 'Lapisan 1',
      formulaName: "Komutator Sledgehammer (R' L R L')",
      description: 'Memasukkan 3 rusuk bawah untuk menyelesaikan satu muka dasar.',
      tips: 'Gunakan Sledgehammer untuk memasukkan rusuk tanpa merusak center.'
    },
    {
      id: 'stage-3',
      title: 'Tahap 3: Siklus Rusuk Terakhir (Last Layer)',
      shortTitle: 'Selesai',
      badge: 'Selesai',
      formulaName: 'Siklus 3-Rusuk',
      description: 'Menyelesaikan sisa rusuk atas hingga Pyraminx terpecahkan 100%.',
      tips: 'Gunakan variasi Sune Pyraminx untuk memutar siklus rusuk.'
    }
  ],
  'skewb': [
    {
      id: 'stage-1',
      title: 'Tahap 1: Sudut Lapisan Bawah',
      shortTitle: 'Sudut Bawah',
      badge: 'Tahap 1',
      formulaName: 'Orientasi Sudut 120°',
      description: 'Menyelesaikan 4 sudut putih di lapisan bawah dengan samping selaras.',
      tips: 'Satu sudut putih dijadikan patokan, lalu pasangkan 3 sudut lainnya.'
    },
    {
      id: 'stage-2',
      title: 'Tahap 2: Pusat Kuning Atas',
      shortTitle: 'Pusat Atas',
      badge: 'Pusat Atas',
      formulaName: 'Sledgehammer (R\' L R L\')',
      description: 'Memindahkan center kuning ke sisi atas dengan rumus 4 gerakan sakti.',
      tips: 'Hadapkan center kuning ke belakang lalu eksekusi Sledgehammer.'
    },
    {
      id: 'stage-3',
      title: 'Tahap 3: Pusat Samping & Selesai',
      shortTitle: 'Selesai',
      badge: 'Selesai',
      formulaName: 'Sledgehammer + Rotasi y2',
      description: 'Menukar sisa center samping hingga seluruh Skewb utuh.',
      tips: 'Gunakan komutator ganda untuk menyelesaikan seluruh sisi.'
    }
  ],
  'square1': [
    {
      id: 'stage-1',
      title: 'Tahap 1: Mengembalikan Bentuk Kubus (Cubeshape)',
      shortTitle: 'Cubeshape',
      badge: 'Bentuk Kubus',
      formulaName: 'Irisan Belahan /',
      description: 'Mengubah bentuk Square-1 yang tak beraturan kembali menjadi bentuk kubus.',
      tips: 'Kumpulkan semua 8 sudut atau bentuk pola bintang sebelum membelah /.'
    },
    {
      id: 'stage-2',
      title: 'Tahap 2: Orientasi Sudut & Rusuk (CO & EO)',
      shortTitle: 'Orientasi',
      badge: 'Orientasi',
      formulaName: 'Corner & Edge Orientation',
      description: 'Membuat seluruh bagian atas berwarna putih dan bawah berwarna kuning.',
      tips: 'Gunakan irisan / dan putaran kelipatan 30°.'
    },
    {
      id: 'stage-3',
      title: 'Tahap 3: Permutasi Lapisan & Selesai (CP & EP)',
      shortTitle: 'Selesai',
      badge: 'Selesai',
      formulaName: 'Permutasi Sudut & Rusuk',
      description: 'Menyelaraskan posisi potongan hingga Square-1 selesai sempurna.',
      tips: 'Lakukan alignment akhir pada equator tengah.'
    }
  ],
  'megaminx': [
    {
      id: 'stage-1',
      title: 'Tahap 1: Bintang Putih & Lapisan Bawah (White Star)',
      shortTitle: 'Bintang Putih',
      badge: 'Tahap 1',
      formulaName: '5-Point Star & Corners',
      description: 'Membentuk bintang putih 5 titik dan memasukkan 5 sudut bawah.',
      tips: 'Persis seperti White Cross pada 3x3, tetapi memiliki 5 rusuk bintang.'
    },
    {
      id: 'stage-2',
      title: 'Tahap 2: Lapisan Kedua Melingkar (F2L)',
      shortTitle: 'Lapisan 2',
      badge: 'Lapisan 2',
      formulaName: 'Pasangan F2L Megaminx',
      description: 'Menyelesaikan lapisan samping secara berurutan mengelilingi dodecahedron.',
      tips: 'Selesaikan satu warna samping terlebih dahulu sebelum bergeser.'
    },
    {
      id: 'stage-3',
      title: 'Tahap 3: Lapisan Atas Abu-abu (OLL)',
      shortTitle: 'Bintang Abu-abu',
      badge: 'Warna Atas',
      formulaName: 'Megaminx Sune',
      description: 'Membentuk bintang atas dan mengorientasikan semua sudut atas.',
      tips: 'Gunakan adaptasi rumus F R U R\' U\' F\' dan Sune.'
    },
    {
      id: 'stage-4',
      title: 'Tahap 4: Permutasi Akhir & Selesai (PLL)',
      shortTitle: 'Selesai',
      badge: 'Selesai',
      formulaName: 'Komutator Megaminx PLL',
      description: 'Menyelaraskan sudut dan rusuk terakhir hingga Megaminx selesai utuh.',
      tips: 'Selesaikan sudut terlebih dahulu lalu tuntaskan rusuk.'
    }
  ]
};

/**
 * Derives pedagogical stages for ANY puzzle given a list of solution moves
 * @param {string} puzzleId
 * @param {string[]} solutionMoves
 * @returns {Array<any>}
 */
export function partitionMovesIntoStages(puzzleId, solutionMoves = []) {
  if (!solutionMoves || solutionMoves.length === 0) return [];

  // If 3x3 with default 4-stage breakdown
  const id = puzzleId || 'cube-3x3';
  const template = PUZZLE_STAGE_TEMPLATES[id] || (id.startsWith('cube-') && parseInt(id.replace('cube-', ''), 10) >= 4 ? PUZZLE_STAGE_TEMPLATES['cube-4x4'] : PUZZLE_STAGE_TEMPLATES['cube-3x3']);

  const stageCount = template.length;
  const totalMoves = solutionMoves.length;
  const movesPerStage = Math.max(1, Math.floor(totalMoves / stageCount));

  const stages = [];
  let currentOffset = 0;

  for (let i = 0; i < stageCount; i++) {
    const isLast = i === stageCount - 1;
    const endOffset = isLast ? totalMoves : Math.min(totalMoves, currentOffset + movesPerStage);
    const stageMoves = solutionMoves.slice(currentOffset, endOffset);
    const tmpl = template[i];

    stages.push({
      id: tmpl.id || `stage-${i + 1}`,
      title: tmpl.title,
      shortTitle: tmpl.shortTitle,
      badge: tmpl.badge,
      formulaName: tmpl.formulaName,
      description: tmpl.description,
      tips: tmpl.tips,
      moves: stageMoves,
      startIndex: currentOffset,
      endIndex: endOffset
    });

    currentOffset = endOffset;
    if (currentOffset >= totalMoves) break;
  }

  return stages;
}

