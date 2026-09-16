/**
 * src/solvers/guides/nxnGuides.js
 * Two-Tier Progressive Learning Curriculum for All 6 NxN Cubes (2x2 to 7x7)
 * 
 * UX Mandate:
 * Tier 1: Metode Pemula (Beginner Intuitive & Layer-by-Layer) with friendly Indonesian visual analogies.
 * Tier 2: Metode Mahir (Speedcubing CFOP, Ortega, Reduction & Parity algorithms).
 */

export const GUIDE_STAGES_2X2 = Object.freeze([
  {
    id: '2x2-stage-intro',
    title: '1. Pengenalan & Anatomi 2x2 (Metode Pemula)',
    desc: 'Memahami struktur 8 sudut Rubik 2x2 (Pocket Cube). Puzzle ini tidak memiliki pusat (center) dan tidak memiliki rusuk (edge). Pemula cukup belajar 1 trigger sakti (Lift Penumpang / Sexy Move) dan 1 rumus penutup (Rumus Ikan Sune).',
    cases: [
      {
        id: '2x2-anchor',
        name: 'Menentukan Sudut Patokan (Jangkar)',
        algorithm: 'y',
        description: 'Pilih sudut yang memiliki stiker putih (misal Putih-Merah-Hijau). Posisikan di kiri-bawah-depan sebagai jangkar penentu warna seluruh muka.',
        tips: 'Karena 2x2 tidak memiliki center, sudut pertama yang kamu selesaikan adalah penentu warna sisi lainnya!'
      }
    ]
  },
  {
    id: '2x2-stage-layer1',
    title: '2. Metode Pemula: Lapisan Pertama (First Layer)',
    desc: 'Menyelesaikan sisi putih di bagian bawah dengan warna samping yang cocok melingkar menggunakan Lift Penumpang (Sexy Move R U R\' U\').',
    cases: [
      {
        id: '2x2-l1-right',
        name: 'Putih Menghadap Kanan (Lift 1 Langkah)',
        algorithm: "R U R'",
        description: 'Stiker putih berada di lapisan atas dan menghadap ke samping kanan. Cukup jemput dengan lift kanan dan bawa pulang.',
        tips: 'Gerakan ringkas: Lift naik (R), penumpang masuk (U), lift turun (R\').'
      },
      {
        id: '2x2-l1-front',
        name: 'Putih Menghadap Depan',
        algorithm: "U R U' R'",
        description: 'Stiker putih berada di lapisan atas menghadap ke depan. Jauhkan ke kiri, jemput dengan lift kanan, lalu masukkan.',
        tips: 'Putar U dulu agar penumpang bersiap di halte yang tepat.'
      },
      {
        id: '2x2-l1-top',
        name: 'Putih Menghadap ke Langit (3x Sexy Move)',
        algorithm: "R U R' U' R U R' U' R U R' U'",
        description: 'Stiker putih menghadap langsung ke atas. Jalankan Sexy Move sebanyak 3 kali berturut-turut untuk memposisikannya ke bawah.',
        tips: 'Ulangi siklus (R U R\' U\') secara konsisten tanpa memutar orientasi kubus.'
      }
    ]
  },
  {
    id: '2x2-stage-oll-pemula',
    title: '3. Metode Pemula: Menguningkan Sisi Atas (OLL Pemula)',
    desc: 'Membuat seluruh sisi atas berwarna kuning hanya dengan satu rumus legendaris: Rumus Ikan (Sune).',
    cases: [
      {
        id: '2x2-sune',
        name: 'Rumus Ikan (Sune)',
        algorithm: "R U R' U R U2 R'",
        description: 'Jika ada tepat 1 stiker kuning di atas, posisikan di pojok kiri-depan (UFL) sebagai kepala ikan, lalu eksekusi Sune.',
        tips: 'Ikan melompat (R), berenang (U), menyelam (R\'), berenang lagi (U), lalu menyelam dalam dua putaran (U2 R\').'
      }
    ]
  },
  {
    id: '2x2-stage-pll-pemula',
    title: '4. Metode Pemula: Merapikan Lapisan Akhir (PLL Pemula)',
    desc: 'Menukar sudut yang belum rapi menggunakan teknik Lampu Mobil Kembar (Headlights).',
    cases: [
      {
        id: '2x2-t-perm',
        name: 'Ada Lampu Mobil Kembar (T-Perm 2x2)',
        algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",
        description: 'Cari dua sudut bersebelahan dengan warna samping yang sama (lampu kembar). Letakkan di sisi Belakang (Back), lalu jalankan rumus T-Perm.',
        tips: 'Setelah algoritma selesai, putar lapisan atas U untuk menyelaraskan dengan lapisan bawah. Kubus selesai!'
      },
      {
        id: '2x2-y-perm',
        name: 'Tidak Ada Lampu Kembar (Tukar Sudut Diagonal)',
        algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
        description: 'Jika tidak ada warna samping yang sama di sisi mana pun, dua sudut diagonal saling tertukar. Eksekusi Y-Perm dari sudut mana saja.',
        tips: 'Dapat juga diselesaikan dengan menjalankan T-Perm dua kali berturut-turut.'
      }
    ]
  },
  {
    id: '2x2-stage-ortega',
    title: '5. Metode Mahir: Ortega / Varasano (Speedcubing)',
    desc: 'Metode tingkat lanjut yang memisahkan pembentukan muka putih pertama tanpa mencocokkan samping, OLL 1-Look (7 variasi), dan PBL (Permute Both Layers).',
    cases: [
      {
        id: '2x2-ortega-h',
        name: 'OLL H-Permutation (Double Headlights)',
        algorithm: 'R2 U2 R U2 R2',
        description: 'Dua stiker kuning di depan dan dua di belakang.',
        tips: 'Putar cepat dengan flick ganda R2.'
      },
      {
        id: '2x2-ortega-pbl-both-bars',
        name: 'PBL: Bar Atas & Bar Bawah (Sejajar Belakang)',
        algorithm: "R2 U' B2 U2 R2 U' R2",
        description: 'Kedua lapisan memiliki bar lampu kembar. Sejajarkan kedua bar di sisi Belakang lalu eksekusi.',
        tips: 'Rumus cepat untuk menyelesaikan kedua lapisan sekaligus.'
      },
      {
        id: '2x2-ortega-pbl-diag-diag',
        name: 'PBL: Diagonal Atas & Diagonal Bawah',
        algorithm: 'R2 F2 R2',
        description: 'Kedua lapisan tidak memiliki lampu kembar (keduanya diagonal swap).',
        tips: 'Hanya 3 langkah ringkas: R2 F2 R2!'
      }
    ]
  }
]);

export const GUIDE_STAGES_3X3 = Object.freeze([
  {
    id: '3x3-stage-daisy',
    title: '1. Metode Pemula: Bunga Daisy & Palang Putih (White Cross)',
    desc: 'Langkah pertama yang paling intuitif dan ramah pemula: kumpulkan 4 kelopak putih mengelilingi center kuning membentuk Taman Bunga Daisy, lalu tenggelamkan 180° ke dasar laut.',
    cases: [
      {
        id: '3x3-daisy-flower',
        name: 'Membentuk Bunga Daisy (Kelopak Putih di Pusat Kuning)',
        algorithm: "F R U' R' F'",
        description: 'Kumpulkan 4 rusuk berstiker putih mengelilingi center kuning di sisi atas (U). Langkah ini sangat intuitif tanpa perlu rumus panjang!',
        tips: 'Lihat sisi samping kubus: jika ada rusuk putih, putar layer samping hingga stiker putih naik ke atas.'
      },
      {
        id: '3x3-cross-dive',
        name: 'Penyelaman 180° (Membentuk Palang Putih Sempurna)',
        algorithm: 'F2',
        description: 'Cocokkan warna samping kelopak putih dengan center sampingnya, lalu putar muka tersebut dua kali (F2/R2/B2/L2) agar menyelam ke dasar kubus.',
        tips: 'Ulangi untuk keempat kelopak. Hasilnya: Palang Putih sempurna di bawah dengan sisi-sisi samping yang selaras!'
      }
    ]
  },
  {
    id: '3x3-stage-l1-corners',
    title: '2. Metode Pemula: Sudut Lapisan Pertama via Lift Penumpang (Sexy Move)',
    desc: 'Menyelesaikan lapisan pertama secara sempurna menggunakan prinsip Lift Penumpang: R (Lift naik), U (Penumpang masuk), R\' (Lift turun), U\' (Lorong dirapikan).',
    cases: [
      {
        id: '3x3-sexy-move',
        name: 'Trigger 4 Langkah: Sexy Move',
        algorithm: "R U R' U'",
        description: 'Posisikan sudut putih di lapisan atas tepat di atas slot rumahnya di kanan-depan (UFR). Jalankan rumus 1, 3, atau 5 kali hingga stiker putih masuk sempurna di bawah.',
        tips: 'Pastikan warna samping sudut cocok dengan center samping di sekitarnya.'
      }
    ]
  },
  {
    id: '3x3-stage-l2-edges',
    title: '3. Metode Pemula: Rusuk Lapisan Kedua (Menjauh dari Musuh & Dijemput Teman)',
    desc: 'Memasukkan 4 rusuk lapisan tengah (F2L Pemula) tanpa merusak lapisan pertama yang sudah jadi di dasar kubus.',
    cases: [
      {
        id: '3x3-edge-right',
        name: 'Memasukkan Rusuk ke Kanan',
        algorithm: "U R U' R' U' F' U F",
        description: 'Rusuk menjauh ke kiri (U), lift kanan menjemput (R), rusuk masuk ke lift (U\'), lift turun (R\'), lalu putar badan dan masukkan dengan pasangan depan.',
        tips: 'Rumus gabungan: (U R U\' R\') dilanjutkan (U\' F\' U F).'
      },
      {
        id: '3x3-edge-left',
        name: 'Memasukkan Rusuk ke Kiri',
        algorithm: "U' L' U L U F U' F'",
        description: 'Gerakan simetris untuk memasukkan rusuk ke slot kiri.',
        tips: 'Rusuk menjauh ke kanan (U\'), lift kiri menjemput (L\'), lalu bawa pulang.'
      }
    ]
  },
  {
    id: '3x3-stage-yellow-cross',
    title: '4. Metode Pemula: Palang Kuning Atas via Buka Tirai Jendela',
    desc: 'Membentuk tanda palang (+) kuning di lapisan atas menggunakan teknik Buka Tirai Jendela: F (Buka tirai), R U R\' U\' (Sexy Move di dalam kamar), F\' (Tutup tirai jendela).',
    cases: [
      {
        id: '3x3-yellow-cross-bar',
        name: 'Pola Garis Horizontal (Line to Cross)',
        algorithm: "F R U R' U' F'",
        description: 'Posisikan garis kuning mendatar secara horizontal, lalu jalankan Buka Tirai + Sexy Move + Tutup Tirai.',
        tips: 'Jika pola berbentuk huruf L kecil (jam 9 dan jam 12), gunakan putaran dua lapis: Fw R U R\' U\' Fw\'.'
      }
    ]
  },
  {
    id: '3x3-stage-align-edges',
    title: '5. Metode Pemula: Menyelaraskan Rusuk Kuning via Rumus Ikan Sune',
    desc: 'Menukar rusuk-rusuk samping pada palang kuning agar selaras dengan warna center samping masing-masing.',
    cases: [
      {
        id: '3x3-sune-align',
        name: 'Rumus Ikan Sune Penyelaras Rusuk',
        algorithm: "R U R' U R U2 R' U",
        description: 'Posisikan dua rusuk yang sudah cocok di sisi Belakang dan Kanan, lalu eksekusi Sune. Keempat rusuk samping kini selaras!',
        tips: 'Putar U di akhir rumus untuk mengunci warna center samping.'
      }
    ]
  },
  {
    id: '3x3-stage-niklas',
    title: '6. Metode Pemula: Menempatkan Sudut ke Rumah yang Tepat (Komutator Niklas)',
    desc: 'Memindahkan 4 sudut lapisan atas ke posisi yang benar di antara 3 center yang sesuai tanpa memedulikan orientasi stikernya.',
    cases: [
      {
        id: '3x3-niklas',
        name: 'Komutator Niklas',
        algorithm: "U R U' L' U R' U' L",
        description: 'Cari 1 sudut yang sudah berada di rumah yang tepat (meskipun posisinya masih terputar). Posisikan di kanan-depan (UFR), lalu jalankan Niklas.',
        tips: 'Ulangi 1-2 kali hingga semua 4 sudut berada di rumahnya masing-masing.'
      }
    ]
  },
  {
    id: '3x3-stage-finish',
    title: '7. Metode Pemula: Memutar Sudut Terakhir & Selesai! (Jangan Panik)',
    desc: 'Langkah pamungkas menyelesaikan seluruh kubus 3x3 menggunakan komutator R\' D\' R D. ATURAN EMAS: Lapisan bawah akan terlihat berantakan sementara. JANGAN PANIK DAN JANGAN PUTAR SELURUH KUBUS!',
    cases: [
      {
        id: '3x3-final-twist',
        name: 'Memutar Sudut Kuning (R\' D\' R D)',
        algorithm: "R' D' R D R' D' R D",
        description: 'Pegang kubus dengan sudut target di kanan-depan-atas (UFR). Ulangi R\' D\' R D (2 atau 4 kali) sampai stiker kuning menghadap ke atas. Putar HANYA lapisan U untuk memindahkan sudut berikutnya yang belum jadi!',
        tips: 'Begitu sudut terakhir selesai, seluruh lapisan bawah otomatis pulih 100% sempurna!'
      }
    ]
  },
  {
    id: '3x3-stage-cfop',
    title: '8. Metode Mahir: CFOP / Fridrich (Speedcubing)',
    desc: 'Metode standar dunia speedcubing: Cross efisien <= 8 gerakan, F2L 41 variasi, OLL 57 algoritma, dan PLL 21 algoritma.',
    cases: [
      {
        id: '3x3-cfop-t-perm',
        name: 'PLL: T-Permutation',
        algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",
        description: 'Menukar 2 sudut kanan dan 2 rusuk samping secara serempak.',
        tips: 'Algoritma PLL paling populer untuk penyelesaian sub-15 detik.'
      },
      {
        id: '3x3-cfop-y-perm',
        name: 'PLL: Y-Permutation',
        algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
        description: 'Menukar 2 sudut diagonal dan 2 rusuk samping.',
        tips: 'Pegang bar yang cocok di sisi kiri.'
      },
      {
        id: '3x3-cfop-ua-perm',
        name: 'PLL: Ua-Permutation (Siklus 3 Rusuk Searah Jarum Jam)',
        algorithm: "R U' R U R U R U' R' U' R2",
        description: 'Ketiga rusuk berpindah searah jarum jam dengan bar belakang sudah rapi.',
        tips: 'Alternatif fingertrick M-slice: M2 U M U2 M\' U M2.'
      },
      {
        id: '3x3-cfop-h-perm',
        name: 'PLL: H-Permutation (Pertukaran Rusuk Saling Menyilang)',
        algorithm: "M2 U M2 U2 M2 U M2",
        description: 'Dua pasang rusuk berlawanan saling bertukar posisi.',
        tips: 'Sangat cepat dieksekusi dengan double-flick ring-middle finger.'
      }
    ]
  }
]);

export const GUIDE_STAGES_4X4 = Object.freeze([
  {
    id: '4x4-stage-centers',
    title: '1. Metode Reduksi Pemula: Membangun 6 Blok Pusat 2x2 (Centers)',
    desc: 'Kubus 4x4 tidak memiliki center tetap! Gunakan analogi Batang Korek Api (Bar 1x2) dan teknik Dorong-Amankan-Tarik (Push-Turn-Restore: Rw U2 Rw\') untuk membangun 6 pusat 2x2 tanpa merusak sisi yang sudah selesai.',
    cases: [
      {
        id: '4x4-first-center',
        name: 'Center Putih & Kuning (Push-Turn-Restore)',
        algorithm: "Rw U2 Rw'",
        description: 'Bentuk bar 1x2 pertama, lalu dorong bar kedua ke muka atas dengan Rw, amankan dengan U2, dan tarik kembali dengan Rw\'.',
        tips: 'Ingat skema BOY standar: jika Putih di atas, sisi samping berurutan Hijau -> Merah -> Biru -> Oranye searah jarum jam.'
      }
    ]
  },
  {
    id: '4x4-stage-edges',
    title: '2. Metode Reduksi Pemula: Memasangkan 12 Rusuk (Rel Kereta & Pembalik Gerbong)',
    desc: 'Memasangkan 24 sayap rusuk menjadi 12 rusuk komposit menggunakan teknik Slice-Flip-Unslice: geser rel kereta (Uw\'), balik gerbong terbalik dengan Flipping Algorithm (R U R\' F R\' F\' R), lalu kembalikan rel kereta (Uw).',
    cases: [
      {
        id: '4x4-edge-pairing',
        name: 'Flipping Algorithm & Slice-Flip-Unslice',
        algorithm: "Uw' R U R' F R' F' R Uw",
        description: 'Sejajarkan dua sayap dengan warna sama pada rel FL dan FR pada ketinggian berbeda, geser Uw\', balik dengan rumus flipping, lalu kembalikan rel dengan Uw.',
        tips: 'Rumus flipping R U R\' F R\' F\' R membalik sayap kanan tanpa merusak potongan di lapisan lain.'
      }
    ]
  },
  {
    id: '4x4-stage-3x3',
    title: '3. Tahap 3x3 Biasa (Outer Turns Only)',
    desc: 'Setelah seluruh 6 center dan 12 rusuk selesai direduksi, selesaikan kubus persis seperti Rubik 3x3 standar menggunakan hanya putaran 1 lapis luar (R, U, L, F, D, B). Dilarang memutar irisan dalam pada tahap ini!',
    cases: [
      {
        id: '4x4-solve-3x3',
        name: 'Penyelesaian Sesuai Metode 3x3',
        algorithm: "R U R' U'",
        description: 'Gunakan seluruh pengetahuan metode 3x3 pemula (Cross -> Corners -> Edges -> OLL -> PLL).',
        tips: 'Jika kamu menemukan kondisi yang tidak mungkin di 3x3 biasa, kamu sedang menghadapi Kasus Paritas 4x4!'
      }
    ]
  },
  {
    id: '4x4-stage-oll-parity',
    title: '4. Panduan Paritas 4x4: Lucas OLL Parity (Satu Sayap Terbalik)',
    desc: 'Kasus paritas di mana tepat 1 rusuk komposit memiliki sayap yang terbalik orientasinya saat membentuk palang kuning. Hal ini terjadi karena permutasi ganjil pada orbit sayap 4x4.',
    cases: [
      {
        id: '4x4-lucas-oll',
        name: 'Algoritma Standar WCA: Lucas OLL Parity',
        algorithm: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 Rw' U2 Rw U2 Rw' U2 Rw'",
        description: 'Pegang kubus dengan rusuk yang terbalik di sisi Depan-Atas (UF), lalu eksekusi urutan gerakan di atas.',
        tips: 'Hafalkan ritme: Bawa naik (Rw U2), putar kubus (x), tiga kali naik-turun, angkat kiri (Lw U2), lalu tutup dengan penurunan kanan.'
      }
    ]
  },
  {
    id: '4x4-stage-pll-parity',
    title: '5. Panduan Paritas 4x4: PLL Parity (Dua Rusuk Tertukar Sendirian)',
    desc: 'Kasus paritas di mana tepat dua pasang rusuk komposit tertukar posisinya sementara seluruh bagian kubus lainnya sudah terpecahkan sempurna.',
    cases: [
      {
        id: '4x4-pll-opposite',
        name: 'PLL Parity: Dua Rusuk Berhadapan (Opposite Edges)',
        algorithm: '2R2 U2 2R2 Uw2 2R2 2U2',
        description: 'Pegang kedua rusuk tertukar di sisi Depan dan Belakang. Putar irisan dalam kanan 2R2 dan lapisan atas U2 / Uw2 / 2U2 secara bergantian.',
        tips: 'Gerakan hanya melibatkan 2R2 dan lapisan horizontal (U2, Uw2, 2U2).'
      },
      {
        id: '4x4-pll-adjacent',
        name: 'PLL Parity: Dua Rusuk Bersebelahan (Adjacent Edges)',
        algorithm: "R' U R 2R2 U2 2R2 Uw2 2R2 2U2 R' U' R",
        description: 'Setup move R\' U R memposisikan rusuk bersebelahan ke posisi berhadapan, lalu jalankan formula PLL Parity dan kembalikan setup.',
        tips: 'Pegang kedua rusuk yang tertukar di sisi Depan dan Kanan.'
      }
    ]
  }
]);

export const GUIDE_STAGES_5X5 = Object.freeze([
  {
    id: '5x5-stage-centers',
    title: '1. Metode Reduksi Pemula: Membangun 6 Pusat 3x3 (Balok 3 Lapis)',
    desc: 'Membangun 6 pusat 3x3 pada kubus 5x5. Setiap muka terdiri dari 1 fixed center sejati, 4 plus centers (+), dan 4 corner centers (x). Dibangun dari bar tengah 1x3 dan dua bar samping 1x3.',
    cases: [
      {
        id: '5x5-l2c-barswap',
        name: 'L2C: Pertukaran Bar 1x3 pada Dua Pusat Terakhir',
        algorithm: "Rw U Rw' U Rw U2 Rw'",
        description: 'Menukar satu bar 1x3 antara center atas dan depan tanpa merusak 4 center samping lainnya.',
        tips: 'Gunakan komutator push-turn-restore untuk menyelaraskan bar center.'
      },
      {
        id: '5x5-l2c-corner',
        name: 'L2C: Pertukaran Stiker Sudut Center',
        algorithm: "Rw U Rw' U' Rw' F Rw F'",
        description: 'Menukar satu stiker sudut center yang tersisa.',
        tips: 'Komutator presisi untuk menyelesaikan pusat 5x5 100% sempurna.'
      }
    ]
  },
  {
    id: '5x5-stage-edges',
    title: '2. Metode Reduksi Pemula: Memasangkan 12 Rusuk Triplet (Free Slice & L4E)',
    desc: 'Setiap rusuk 5x5 terdiri dari 3 potongan: Sayap Kiri + Midge Tengah + Sayap Kanan. Gunakan metode Free Slice untuk menyelesaikan 8 rusuk pertama, lalu gunakan metode Slice-Flip-Slice untuk 4 rusuk terakhir (L4E) sesuai panduan Feliks Zemdegs.',
    cases: [
      {
        id: '5x5-edge-insert-preserve',
        name: 'Memasukkan Rusuk UF ke FR (Menjaga Orientasi)',
        algorithm: "R U' R'",
        description: 'Memasukkan rusuk dari posisi atas-depan (UF) ke kanan-depan (FR) dengan mempertahankan orientasi warnanya.',
        tips: 'Gunakan jika stiker sudah cocok tanpa perlu dibalik.'
      },
      {
        id: '5x5-edge-insert-flip',
        name: 'Memasukkan Rusuk UF ke FR (Mengubah Orientasi)',
        algorithm: "F R' F' R",
        description: 'Memasukkan rusuk dari posisi atas-depan (UF) ke kanan-depan (FR) sekaligus membalik orientasi warnanya.',
        tips: 'Gunakan jika orientasi rusuk perlu dibalik saat dimasukkan.'
      },
      {
        id: '5x5-edge-flip',
        name: 'Flipping Algorithm Rusuk FR (CubeSkills)',
        algorithm: "R U R' F R' F' R",
        description: 'Membalik orientasi sayap rusuk di posisi kanan-depan (FR). Merupakan inti dari teknik pemasangan rusuk 5x5.',
        tips: 'Kombinasi 3 langkah Sexy Move (R U R\') dilanjutkan 4 langkah Sledgehammer (F R\' F\' R).'
      },
      {
        id: '5x5-free-slice-uw',
        name: 'Slice-Flip-Slice Lapisan Atas (Uw\')',
        algorithm: "Uw' R U R' F R' F' R Uw",
        description: 'Mengiris lapisan atas (Uw\'), membalik rusuk dengan trigger Flipping Algorithm di FR, lalu mengembalikan irisan (Uw).',
        tips: 'Teknik wajib pada 4 rusuk terakhir untuk menjaga center tetap utuh.'
      },
      {
        id: '5x5-free-slice-dw',
        name: 'Slice-Flip-Slice Lapisan Bawah (Dw\')',
        algorithm: "Dw' y' R U R' F R' F' R Dw",
        description: 'Variasi irisan lapisan bawah (Dw\'), rotasi y\', membalik rusuk di FR, lalu mengembalikan irisan (Dw).',
        tips: 'Dipakai saat pasangan rusuk berada di lapisan bawah.'
      }
    ]
  },
  {
    id: '5x5-stage-3x3',
    title: '3. Tahap 3x3 Biasa (Outer Turns Only)',
    desc: 'Setelah seluruh center dan rusuk triplet selesai direduksi, selesaikan kubus menggunakan metode 3x3 standar.',
    cases: [
      {
        id: '5x5-3x3-phase',
        name: 'Penyelesaian Sesuai Metode 3x3',
        algorithm: "R U R' U'",
        description: 'Kubus 5x5 kini berperilaku identik dengan 3x3 standar.',
        tips: 'Karena 5x5 memiliki fixed center sejati, PLL Parity 4x4 TIDAK PERNAH BISA TERJADI!'
      }
    ]
  },
  {
    id: '5x5-stage-parity',
    title: '4. Panduan Paritas 5x5: Wing Flip Parity (Lucas Wing Parity 5x5)',
    desc: 'Satu-satunya kasus paritas pada 5x5: sepasang sayap luar terbalik orientasinya relatif terhadap midge tengah pada rusuk depan-atas (UF).',
    cases: [
      {
        id: '5x5-lucas-wing',
        name: 'Algoritma Wing Flip Parity 5x5',
        algorithm: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 3Rw' U2 Rw U2 Rw' U2 Rw'",
        description: 'Perhatikan langkah 3Rw\' di tengah formula! Gerakan 3 lapis ini mempertahankan midge tengah tetap di tempatnya sementara hanya sepasang sayap luar yang dibalik.',
        tips: 'Eksekusi dari posisi muka rusuk yang terbalik berada di Depan-Atas (UF).'
      }
    ]
  }
]);

export const GUIDE_STAGES_6X6 = Object.freeze([
  {
    id: '6x6-stage-centers',
    title: '1. Metode Reduksi Multi-Slice Pemula: Pusat 4x4 (Centers)',
    desc: 'Kubus 6x6 tidak memiliki center tetap. Setiap muka pusat berukuran 4x4 (16 stiker) yang dibangun dari 4 buah bar 1x4 per sisi menggunakan irisan dalam 2R, 3R, 2L, 3L.',
    cases: [
      {
        id: '6x6-center-bar',
        name: 'Membangun Bar 1x4 & Komutator L2C',
        algorithm: "3Rw U 3Rw' U 3Rw U2 3Rw'",
        description: 'Selesaikan 2 bar tengah dalam terlebih dahulu, lalu tambahkan 2 bar tepi luar.',
        tips: 'Gunakan irisan 3Rw untuk menukar bar pada 2 pusat terakhir.'
      }
    ]
  },
  {
    id: '6x6-stage-edges',
    title: '2. Metode Reduksi Multi-Slice Pemula: Memasangkan Rusuk Kuadruplet',
    desc: 'Setiap rusuk 6x6 terdiri dari 4 buah sayap (2 inner wings + 2 outer wings). Pasangkan kedua sayap dalam terlebih dahulu, lalu apit dengan kedua sayap luar menggunakan multi-slice 2Uw dan 3Uw.',
    cases: [
      {
        id: '6x6-edge-pairing',
        name: 'Multi-Slice Edge Pairing',
        algorithm: "3Uw' R U R' F R' F' R 3Uw",
        description: 'Geser irisan 3Uw\', balik pasangan sayap yang terbalik dengan flipping algorithm, lalu kembalikan irisan.',
        tips: 'Gunakan 2Uw untuk sayap luar dan 3Uw untuk sayap dalam.'
      }
    ]
  },
  {
    id: '6x6-stage-3x3',
    title: '3. Tahap 3x3 Biasa (Outer Turns Only)',
    desc: 'Selesaikan sisa puzzle menggunakan gerakan 1 lapis luar dengan metode 3x3 standar.',
    cases: [
      {
        id: '6x6-3x3-step',
        name: 'Eksekusi Tahap 3x3',
        algorithm: "R U R' U'",
        description: 'Putar hanya lapisan luar 1 lapis.',
        tips: 'Waspadai kemungkinan paritas OLL dan PLL pada kubus genap 6x6.'
      }
    ]
  },
  {
    id: '6x6-stage-parity-oll',
    title: '4. Kasus Paritas 6x6: OLL Parity (Inner & Outer Wings)',
    desc: 'Kasus paritas sayap terbalik pada 6x6 dapat terjadi pada sayap dalam (inner wings) atau sayap luar (outer wings).',
    cases: [
      {
        id: '6x6-inner-oll',
        name: '6x6 Inner-Slice OLL Parity (Hanya Sayap Dalam Terbalik)',
        algorithm: "3Rw U2 x 3Rw U2 3Rw U2 3Rw' U2 3Lw U2 3Rw' U2 3Rw U2 3Rw' U2 3Rw'",
        description: 'Eksekusi formula paritas dengan menggerakkan 3 lapisan kanan (3Rw).',
        tips: 'Membalik tepat sepasang sayap dalam tanpa mengubah sayap luar.'
      },
      {
        id: '6x6-outer-oll',
        name: '6x6 Outer-Slice OLL Parity (Hanya Sayap Luar Terbalik)',
        algorithm: "2Rw U2 x 2Rw U2 2Rw U2 2Rw' U2 2Lw U2 2Rw' U2 2Rw U2 2Rw' U2 2Rw'",
        description: 'Eksekusi formula paritas dengan menggerakkan 2 lapisan kanan (2Rw).',
        tips: 'Membalik tepat sepasang sayap luar.'
      }
    ]
  },
  {
    id: '6x6-stage-parity-pll',
    title: '5. Kasus Paritas 6x6: Composite PLL Parity',
    desc: 'Dua pasang rusuk komposit penuh tertukar posisinya secara berseberangan.',
    cases: [
      {
        id: '6x6-pll-parity',
        name: '6x6 Composite PLL Parity (Opposite Edges)',
        algorithm: '2Rw2 U2 2Rw2 Uw2 2Rw2 2Uw2',
        description: 'Menggerakkan irisan dalam secara serentak untuk menukar kedua rusuk komposit.',
        tips: 'Dapat juga dieksekusi dengan memutar 3Rw2.'
      }
    ]
  }
]);

export const GUIDE_STAGES_7X7 = Object.freeze([
  {
    id: '7x7-stage-centers',
    title: '1. Metode Reduksi Multi-Slice Pemula: Pusat 5x5 (Centers)',
    desc: 'Membangun 6 muka pusat 5x5 (masing-masing 25 stiker) pada kubus 7x7. Menggunakan bar 1x5: 1 bar pusat utama (Fixed Center), 2 bar samping dalam, dan 2 bar samping luar.',
    cases: [
      {
        id: '7x7-center-bar',
        name: 'Komutator Bar 1x5 Pusat Terakhir (L2C)',
        algorithm: "3Rw U 3Rw' U 3Rw U2 3Rw'",
        description: 'Menukar bar 1x5 antara pusat atas dan depan menggunakan komutator multi-slice.',
        tips: 'Bentuk bar secara berurutan dari tengah ke tepi.'
      }
    ]
  },
  {
    id: '7x7-stage-edges',
    title: '2. Metode Reduksi Multi-Slice Pemula: Memasangkan Rusuk Kuintuplet',
    desc: 'Setiap rusuk komposit 7x7 terdiri dari 5 potongan: Midge tengah + 2 Inner Wings + 2 Outer Wings. Gunakan multi-layer slices 2Uw dan 3Uw untuk menggabungkan kelima potongan.',
    cases: [
      {
        id: '7x7-edge-pairing',
        name: 'Pengelompokan 5 Potongan Rusuk',
        algorithm: "3Uw' R U R' F R' F' R 3Uw",
        description: 'Pasangkan midge dengan 2 sayap dalam terlebih dahulu, lalu kunci dengan 2 sayap luar.',
        tips: 'Pastikan midge tengah menjadi patokan orientasi warna yang benar.'
      }
    ]
  },
  {
    id: '7x7-stage-3x3',
    title: '3. Tahap 3x3 Biasa (Outer Turns Only)',
    desc: 'Setelah seluruh reduksi center dan rusuk selesai, selesaikan kubus menggunakan metode 3x3 standar.',
    cases: [
      {
        id: '7x7-3x3-step',
        name: 'Penyelesaian Sesuai Metode 3x3',
        algorithm: "R U R' U'",
        description: 'Kubus 7x7 bebas dari PLL Parity klasik karena memiliki fixed center sejati.',
        tips: 'Hanya kasus OLL Wing Parity yang mungkin terjadi pada tahap akhir.'
      }
    ]
  },
  {
    id: '7x7-stage-parity-inner',
    title: '4. Kasus Paritas 7x7: Inner Wing Parity (Slice 3)',
    desc: 'Sepasang sayap dalam pada kubus 7x7 terbalik orientasinya relatif terhadap midge tengah.',
    cases: [
      {
        id: '7x7-inner-parity',
        name: '7x7 Inner Wing Parity (Slice 3)',
        algorithm: "3Rw U2 x 3Rw U2 3Rw U2 3Rw' U2 3Lw U2 3Rw' U2 3Rw U2 3Rw' U2 3Rw'",
        description: 'Gerakkan 3 lapisan kanan untuk membalik pasangan sayap dalam.',
        tips: 'Eksekusi dengan rusuk target di posisi Depan-Atas (UF).'
      }
    ]
  },
  {
    id: '7x7-stage-parity-outer',
    title: '5. Kasus Paritas 7x7: Outer Wing Parity (Slice 2)',
    desc: 'Sepasang sayap luar pada kubus 7x7 terbalik orientasinya relatif terhadap midge tengah.',
    cases: [
      {
        id: '7x7-outer-parity',
        name: '7x7 Outer Wing Parity (Slice 2)',
        algorithm: "2Rw U2 x 2Rw U2 2Rw U2 2Rw' U2 2Lw U2 2Rw' U2 2Rw U2 2Rw' U2 2Rw'",
        description: 'Gerakkan 2 lapisan kanan untuk membalik pasangan sayap luar.',
        tips: 'Jika kedua pasang sayap dalam dan luar terbalik, jalankan rumus slice 3 lalu dilanjutkan rumus slice 2.'
      }
    ]
  }
]);

export const NXN_GUIDE_STAGES = Object.freeze({
  'cube-2x2': GUIDE_STAGES_2X2,
  'cube-3x3': GUIDE_STAGES_3X3,
  'cube-4x4': GUIDE_STAGES_4X4,
  'cube-5x5': GUIDE_STAGES_5X5,
  'cube-6x6': GUIDE_STAGES_6X6,
  'cube-7x7': GUIDE_STAGES_7X7
});
