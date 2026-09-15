// Data panduan komprehensif penyelesaian Rubik 5x5 (Metode Reduksi)
// Dilengkapi penjelasan taktik Bahasa Indonesia, diagram konsep, rumus, dan tombol interaktif untuk 3D Viewer

export const GUIDE_STAGES = [
  {
    id: "stage-intro",
    title: "1. Pengenalan & Anatomi 5x5",
    shortTitle: "Pengenalan",
    badge: "Konsep Dasar",
    summary: "Memahami struktur 150 stiker kubus 5x5 dan mengapa Metode Reduksi adalah kunci termudah menyelesaikannya.",
    description: `
      Rubik 5x5 (Professor's Cube) memiliki **98 potongan bergerak** di bagian luar yang terdiri dari:
      - **Center Tetap (Fixed Center)**: 6 buah di tengah setiap sisi (menentukan warna sisi tersebut, persis seperti 3x3).
      - **Center X & Plus (Center Pieces)**: Total 8 stiker center tambahan per sisi yang membentuk blok tengah 3x3.
      - **Wing Edges (Sayap Rusuk)**: 2 stiker sayap di setiap rusuk (kiri dan kanan dari rusuk tengah).
      - **Middle Edge (Midge)**: 1 stiker rusuk tepat di tengah.
      - **Corner (Sudut)**: 8 buah sudut (sama persis dengan 3x3).

      ### Apa itu Metode Reduksi?
      Alih-alih pusing memikirkan 98 potongan, kita **mereduksi (mengelompokkan)** kubus 5x5 menjadi bentuk kubus 3x3 biasa:
      1. Gabungkan semua potongan pusat menjadi **blok 3x3 center** seragam.
      2. Gabungkan setiap 3 potongan rusuk menjadi **1 strip rusuk utuh**.
      3. Selesaikan seperti kubus 3x3 biasa!
      4. Tangani kasus **Parity** jika muncul di akhir.
    `,
    cases: [
      {
        id: "intro-overview",
        name: "Skema Warna Standar (BOY/Western)",
        summary: "Putih berlawanan Kuning, Hijau berlawanan Biru, Merah berlawanan Oranye. Jika Putih di atas dan Hijau di depan, Merah ada di sebelah kanan.",
        moves: "y y' x x'",
        algorithm: "y",
        tips: "Selalu hafalkan urutan warna ini agar tidak salah saat menyusun center!"
      }
    ]
  },
  {
    id: "stage-centers",
    title: "2. Menyelesaikan Pusat (Centers)",
    shortTitle: "Centers",
    badge: "Tahap 1",
    summary: "Membangun 6 bidang pusat (masing-masing 3x3) menggunakan teknik Bar 1x3.",
    description: `
      Kunci utama menyelesaikan center 5x5 adalah **membangun Bar 1x3**:
      1. Buat **Bar Tengah (Center Bar)**: 1 fixed center + 2 plus centers.
      2. Buat **Dua Bar Samping (Outer Bars)**: 2 X-centers + 1 plus center.
      3. Pasangkan ketiga bar menjadi satu bidang center 3x3 utuh.
    `,
    cases: [
      {
        id: "c-first-white",
        name: "Center Pertama: Putih (Up/Top)",
        summary: "Buat center putih terlebih dahulu. Karena belum ada sisi lain yang jadi, Anda bebas memutar layer apa pun tanpa takut merusak sisi lain.",
        moves: "Rw U Rw' Uw U' Rw",
        algorithm: "Rw U Rw'",
        tips: "Bentuk bar 1x3 di lapisan samping/bawah, lalu angkat ke sisi atas."
      },
      {
        id: "c-second-yellow",
        name: "Center Kedua: Kuning (Berseberangan)",
        summary: "Letakkan putih di bawah (D). Buat bar kuning di sisi atas (U) menggunakan prinsip 'Push, Turn, Restore' agar putih tidak rusak.",
        moves: "Rw U Rw' U Rw U2 Rw'",
        algorithm: "Rw U Rw' U Rw U2 Rw'",
        tips: "Gerakan Rw memasukkan bar kuning ke atas, U/U2 memutar bar yang sudah jadi ke tempat aman, dan Rw' mengembalikan bar putih kembali utuh."
      },
      {
        id: "c-third-fourth",
        name: "Center ke-3 & ke-4 (Berdampingan)",
        summary: "Posisikan kubus secara horizontal (putih di kiri, kuning di kanan). Selesaikan center hijau, lalu dilanjutkan dengan center oranye.",
        moves: "Fw R Fw' U Fw R' Fw'",
        algorithm: "Fw R Fw'",
        tips: "Gunakan lapisan slice Fw dan Rw untuk mengarahkan bar tanpa mengganggu center putih dan kuning di samping."
      },
      {
        id: "c-l2c-barswap",
        name: "2 Center Terakhir (L2C): Bar Swap",
        summary: "Satu bar 1x3 tertukar antara dua center terakhir (Merah dan Biru). Gunakan komutator bar sederhana.",
        moves: "Rw U Rw' U Rw U2 Rw'",
        algorithm: "Rw U Rw' U Rw U2 Rw'",
        tips: "Sejajarkan bar yang ingin ditukar pada kolom yang sama, lalu eksekusi Rw U Rw' U Rw U2 Rw'."
      },
      {
        id: "c-l2c-cornerswap",
        name: "2 Center Terakhir (L2C): 1 Sudut Tertukar",
        summary: "Hanya satu stiker sudut center (corner piece) yang tertukar antara sisi depan dan atas.",
        moves: "Rw U Rw' U' Rw' F Rw F'",
        algorithm: "Rw U Rw' U' Rw' F Rw F'",
        tips: "Letakkan sudut yang ingin ditukar di kanan-atas sisi depan dan kanan-bawah sisi atas, lalu gunakan rumus komutator ini."
      }
    ]
  },
  {
    id: "stage-edges",
    title: "3. Menggabungkan Rusuk (Edges Pairing)",
    shortTitle: "Edges",
    badge: "Tahap 2",
    summary: "Memasangkan 2 wing edge ke midge (rusuk tengah) hingga menjadi 12 rusuk utuh.",
    description: `
      Pada 5x5, setiap rusuk utuh terdiri dari **3 stiker**:
      \`[Wing Kiri] + [Middle Edge] + [Wing Kanan]\`.

      Teknik yang digunakan:
      1. **Free Slice (8 Edge Pertama)**: Memutar lapisan Uw atau Dw untuk mencari pasangan sayap yang cocok, lalu menggunakan *Flipping Algorithm* untuk membalik orientasi sayap bila terbalik.
      2. **Flipping Algorithm (Rumus Sakti Pembalik Rusuk)**: \`R U R' F R' F' R\`. Rumus ini membalik posisi rusuk kanan tanpa merusak center.
      3. **Last 4 Edges (L4E) & Last 2 Edges (L2E)**: Menyelesaikan rusuk-rusuk terakhir saat ruang kosong sudah habis.
    `,
    cases: [
      {
        id: "e-flipping-alg",
        name: "Rumus Sakti Pembalik Rusuk (Flipping Alg)",
        summary: "Membalik orientasi potongan rusuk di posisi kanan-depan (FR) di tempat tanpa mengacaukan center yang sudah jadi.",
        moves: "R U R' F R' F' R",
        algorithm: "R U R' F R' F' R",
        tips: "Hafalkan pola jari ini: R U R' (bawa ke atas), F (putar depan), R' F' R (kembalikan)."
      },
      {
        id: "e-freeslice-basic",
        name: "Teknik Slice-Flip-Unslice (8 Edge Pertama)",
        summary: "Geser slice atas (Uw') untuk menyatukan sayap dengan rusuk tengah, balik sayap jika terbalik, lalu kembalikan slice (Uw).",
        moves: "Uw' R U R' F R' F' R Uw",
        algorithm: "Uw' R U R' F R' F' R Uw",
        tips: "Jika sayap sudah sehadap tetapi warnanya terbalik, gunakan rumus Flipping di tengah sebelum mengembalikan Uw."
      },
      {
        id: "e-l2e-setup",
        name: "2 Rusuk Terakhir (Last 2 Edges / L2E)",
        summary: "Kondisi di mana tinggal 2 rusuk yang belum jadi. Tempatkan kedua rusuk ini saling berhadapan di depan (UF dan UB atau FR dan FL).",
        moves: "Dw' R U R' F R' F' R Dw",
        algorithm: "Dw' R U R' F R' F' R Dw",
        tips: "Pastikan potongan sayap yang ingin digabungkan berada di posisi saling berlawanan sebelum melakukan slice Dw' atau Uw'."
      }
    ]
  },
  {
    id: "stage-3x3",
    title: "4. Tahap 3x3 Biasa (3x3 Stage)",
    shortTitle: "Tahap 3x3",
    badge: "Tahap 3",
    summary: "Setelah semua center dan 12 rusuk selesai, selesaikan kubus persis seperti kubus 3x3 standar.",
    description: `
      Selamat! Kubus Anda sekarang sudah tereduksi menjadi 3x3:
      - Setiap blok center 3x3 dianggap sebagai **1 center tunggal**.
      - Setiap triplet rusuk 3x1 dianggap sebagai **1 rusuk tunggal**.
      - 8 sudut adalah sudut 3x3 biasa.

      Gunakan metode apa pun yang Anda kuasai (Beginner Layer-by-Layer atau CFOP):
      1. Buat Palang Putih (**White Cross**).
      2. Selesaikan Dua Lapisan Pertama (**F2L** / First 2 Layers).
      3. Orientasikan Lapisan Atas (**OLL**).
      4. Permutasikan Lapisan Atas (**PLL**).
    `,
    cases: [
      {
        id: "3x3-cross",
        name: "White Cross & F2L",
        summary: "Buat tanda tambah putih di bawah, lalu masukkan sudut dan rusuk lapis kedua persis seperti 3x3 biasa.",
        moves: "R U R' U' F' U F",
        algorithm: "R U R' U' F' U F",
        tips: "Ingat: jangan gunakan gerakan wide (seperti Rw atau Uw) di tahap ini! Hanya gunakan gerakan 1 lapis (R, U, L, F, D, B)."
      },
      {
        id: "3x3-oll-pll",
        name: "OLL & PLL Standar (T-Perm)",
        summary: "Algoritma T-Perm untuk menukar rusuk dan sudut lapisan atas.",
        moves: "R U R' U' R' F R2 U' R' U' R U R' F'",
        algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",
        tips: "Jika saat OLL ada 1 sayap yang terbalik sendiri, jangan panik! Itu adalah OLL Parity yang akan kita selesaikan di tahap berikutnya."
      }
    ]
  },
  {
    id: "stage-parity",
    title: "5. Kasus Parity 5x5 (Kasus Khusus)",
    shortTitle: "Parity 5x5",
    badge: "Spesial 5x5",
    summary: "Menyelesaikan kondisi unik yang mustahil terjadi pada 3x3 biasa: OLL Parity dan PLL Parity.",
    description: `
      Pada kubus berdimensi genap (4x4) dan ganjil besar (5x5), struktur mekanis memungkinkan potongan sayap (wing) berada pada orientasi atau permutasi yang ganjil.
      Terdapat **2 jenis Parity utama pada 5x5**:
      
      1. **OLL Parity (Sayap Terbalik)**: 
         Satu buah edge wing terbalik sendirian di sisi atas (kuning). Ini membuat bentuk palang kuning mustahil diselesaikan dengan rumus 3x3 biasa.
      2. **PLL Parity (Dua Sayap Tertukar)**:
         Dua buah sayap tertukar posisi berseberangan pada akhir penyelesaian.
    `,
    cases: [
      {
        id: "p-oll-parity",
        name: "OLL Parity (Satu Sayap Terbalik / Lucas Parity)",
        summary: "Membalik sepasang sayap depan-atas (UF wing) yang terbalik orientasinya. Ini adalah rumus paling dicari di Rubik 5x5!",
        moves: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 3Rw' U2 Rw U2 Rw' U2 Rw'",
        algorithm: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 3Rw' U2 Rw U2 Rw' U2 Rw'",
        tips: "Tips menghafal: Perhatikan gerakan tangan kanan (Rw) yang berirama bersama U2, diselingi rotasi seluruh kubus (x) dan bantuan tangan kiri (Lw)."
      },
      {
        id: "p-pll-parity",
        name: "PLL Parity (Dua Sayap Tertukar)",
        summary: "Menukar posisi dua pasang sayap yang berseberangan di lapisan atas.",
        moves: "2R2 U2 2R2 Uw2 2R2 2U2",
        algorithm: "2R2 U2 2R2 Uw2 2R2 2U2",
        tips: "Rumus ini sangat cepat dan simetris: hanya menggerakkan layer dalam 2R2 diselingi U2, Uw2, dan 2U2!"
      },
      {
        id: "p-adjacent-pll",
        name: "PLL Parity (Sayap Bersebelahan Tertukar)",
        summary: "Jika dua sayap yang tertukar berada berdampingan (depan dan kanan), setup dulu dengan R' U R, lalu jalankan PLL parity.",
        moves: "R' U R 2R2 U2 2R2 Uw2 2R2 2U2 R' U' R",
        algorithm: "R' U R 2R2 U2 2R2 Uw2 2R2 2U2 R' U' R",
        tips: "Setup move R' U R memindahkan rusuk kanan ke belakang sehingga berseberangan dengan depan."
      }
    ]
  }
];

