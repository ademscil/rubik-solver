// Presets untuk kasus-kasus umum Rubik 5x5
// Setiap preset mendefinisikan nama, deskripsi, algoritma pembentuk kasus, dan algoritma solusinya.

export const CUBE_COLORS = {
  U: { name: "Putih (Atas)", hex: "#FFFFFF", code: "W" },
  D: { name: "Kuning (Bawah)", hex: "#FFD500", code: "Y" },
  F: { name: "Hijau (Depan)", hex: "#009B48", code: "G" },
  B: { name: "Biru (Belakang)", hex: "#0046AD", code: "B" },
  L: { name: "Oranye (Kiri)", hex: "#FF5800", code: "O" },
  R: { name: "Merah (Kanan)", hex: "#B71234", code: "R" },
  INTERNAL: { name: "Body", hex: "#18181b", code: "K" }
};

export const POPULAR_PRESETS = [
  {
    id: "solved",
    name: "Kubus Selesai (Solved)",
    category: "Dasar",
    desc: "Kondisi awal kubus 5x5 yang sudah rapi terpecahkan.",
    setupMoves: "",
    solutionMoves: "",
    stage: "solved",
    tips: "Gunakan tombol acak jika ingin mulai mengacak dari kondisi ini."
  },
  {
    id: "oll-parity",
    name: "Kasus OLL Parity (Sayap Terbalik)",
    category: "Parity",
    desc: "Satu rusuk (edge wing) di lapisan atas terbalik orientasinya saat tahap OLL 3x3. Kasus ini hanya ada pada kubus big cubes (4x4, 5x5, dst).",
    // Setup moves: jalankan rumus OLL parity dari posisi solved akan menghasilkan kondisi OLL parity!
    setupMoves: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 3Rw' U2 Rw U2 Rw' U2 Rw'",
    solutionMoves: "Rw U2 x Rw U2 Rw U2 Rw' U2 Lw U2 3Rw' U2 Rw U2 Rw' U2 Rw'",
    stage: "parity",
    tips: "Perhatikan sayap edge depan-atas (UF wing) yang terbalik. Rumus ini menukar dan membalik orientasi sepasang sayap edge tersebut tanpa merusak potongan lainnya."
  },
  {
    id: "pll-parity",
    name: "Kasus PLL Parity (Dua Sayap Tertukar)",
    category: "Parity",
    desc: "Dua edge sayap saling tertukar posisi berseberangan (atau berdampingan) pada tahap akhir PLL.",
    setupMoves: "2R2 U2 2R2 Uw2 2R2 2U2",
    solutionMoves: "2R2 U2 2R2 Uw2 2R2 2U2",
    stage: "parity",
    tips: "Rumus 2R2 U2 2R2 Uw2 2R2 2U2 menukar posisi dua sayap edge tanpa mempengaruhi center maupun corner."
  },
  {
    id: "l2c-barswap",
    name: "2 Center Terakhir: Bar Swap (L2C)",
    category: "Centers",
    desc: "Kondisi saat menyelesaikan 2 center terakhir (Merah & Biru). Satu bar 1x3 tertukar antara dua sisi center.",
    setupMoves: "Rw U Rw' U Rw U2 Rw'",
    solutionMoves: "Rw U Rw' U Rw U2 Rw'",
    stage: "centers",
    tips: "Teknik 'Komutator Bar': Dorong bar masuk ke center target (Rw), putar sisi atas untuk mengamankan (U), lalu kembalikan (Rw')."
  },
  {
    id: "l2c-cornerswap",
    name: "2 Center Terakhir: Satu Sudut Tertukar",
    category: "Centers",
    desc: "Hanya satu stiker sudut center (outer-center piece) yang tertukar antara dua pusat terakhir.",
    setupMoves: "Rw U Rw' U' Rw' F Rw F'",
    solutionMoves: "Rw U Rw' U' Rw' F Rw F'",
    stage: "centers",
    tips: "Gunakan komutator 3-siklus untuk menukar stiker sudut center tanpa merusak bar yang sudah jadi."
  },
  {
    id: "l2e-flipping",
    name: "2 Rusuk Terakhir: Rumus Flipping (L2E)",
    category: "Edges",
    desc: "Saat tinggal 2 rusuk (Last Two Edges) yang belum terpasang, salah satu rusuk harus dibalik orientasinya dengan Rumus Sakti Pembalik Rusuk.",
    setupMoves: "Uw' R U R' F R' F' R Uw",
    solutionMoves: "Uw' R U R' F R' F' R Uw",
    stage: "edges",
    tips: "Algoritma inti: (Slice) Uw' -> (Flipping Alg) R U R' F R' F' R -> (Unslice) Uw."
  }
];

/**
 * Generate acakan acak (scramble) standar WCA untuk Rubik 5x5
 * Panjang biasanya 35-45 gerakan untuk memastikan kondisi acak sempurna
 */
export function generateScramble(length = 36) {
  const outerMoves = ["R", "L", "U", "D", "F", "B"];
  const wideMoves = ["Rw", "Lw", "Uw", "Dw", "Fw", "Bw"];
  const allBases = [...outerMoves, ...wideMoves];
  const modifiers = ["", "'", "2"];

  const scramble = [];
  let lastAxis = "";

  const getAxis = (m) => {
    const base = m[0];
    if (base === "R" || base === "L") return "X";
    if (base === "U" || base === "D") return "Y";
    return "Z";
  };

  while (scramble.length < length) {
    const base = allBases[Math.floor(Math.random() * allBases.length)];
    const axis = getAxis(base);
    if (axis === lastAxis) continue;

    const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
    scramble.push(base + mod);
    lastAxis = axis;
  }

  return scramble.join(" ");
}

