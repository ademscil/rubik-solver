// Kamus dan parser notasi Rubik 5x5 (Professor's Cube)
// Mendukung notasi standar WCA, wide turns (Rw, Uw), slice turns (2R, 2U), dan rotasi kubus (x, y, z)

export const NOTATION_DICTIONARY = {
  // --- Outer Face Turns ---
  "R": { name: "Right", desc: "Putar 1 lapis sisi kanan searah jarum jam (ke atas)", axis: "x", layers: [2], dir: -1 },
  "R'": { name: "Right Prime", desc: "Putar 1 lapis sisi kanan berlawanan arah jarum jam (ke bawah)", axis: "x", layers: [2], dir: 1 },
  "R2": { name: "Right Double", desc: "Putar 1 lapis sisi kanan 180 derajat", axis: "x", layers: [2], dir: -2 },

  "L": { name: "Left", desc: "Putar 1 lapis sisi kiri searah jarum jam (ke bawah)", axis: "x", layers: [-2], dir: 1 },
  "L'": { name: "Left Prime", desc: "Putar 1 lapis sisi kiri berlawanan arah jarum jam (ke atas)", axis: "x", layers: [-2], dir: -1 },
  "L2": { name: "Left Double", desc: "Putar 1 lapis sisi kiri 180 derajat", axis: "x", layers: [-2], dir: 2 },

  "U": { name: "Up", desc: "Putar 1 lapis sisi atas searah jarum jam (ke kiri)", axis: "y", layers: [2], dir: -1 },
  "U'": { name: "Up Prime", desc: "Putar 1 lapis sisi atas berlawanan arah jarum jam (ke kanan)", axis: "y", layers: [2], dir: 1 },
  "U2": { name: "Up Double", desc: "Putar 1 lapis sisi atas 180 derajat", axis: "y", layers: [2], dir: -2 },

  "D": { name: "Down", desc: "Putar 1 lapis sisi bawah searah jarum jam (ke kanan)", axis: "y", layers: [-2], dir: 1 },
  "D'": { name: "Down Prime", desc: "Putar 1 lapis sisi bawah berlawanan arah jarum jam (ke kiri)", axis: "y", layers: [-2], dir: -1 },
  "D2": { name: "Down Double", desc: "Putar 1 lapis sisi bawah 180 derajat", axis: "y", layers: [-2], dir: 2 },

  "F": { name: "Front", desc: "Putar 1 lapis sisi depan searah jarum jam", axis: "z", layers: [2], dir: -1 },
  "F'": { name: "Front Prime", desc: "Putar 1 lapis sisi depan berlawanan arah jarum jam", axis: "z", layers: [2], dir: 1 },
  "F2": { name: "Front Double", desc: "Putar 1 lapis sisi depan 180 derajat", axis: "z", layers: [2], dir: -2 },

  "B": { name: "Back", desc: "Putar 1 lapis sisi belakang searah jarum jam", axis: "z", layers: [-2], dir: 1 },
  "B'": { name: "Back Prime", desc: "Putar 1 lapis sisi belakang berlawanan arah jarum jam", axis: "z", layers: [-2], dir: -1 },
  "B2": { name: "Back Double", desc: "Putar 1 lapis sisi belakang 180 derajat", axis: "z", layers: [-2], dir: 2 },

  // --- Wide Turns (2 Lapisan) ---
  "Rw": { name: "Right Wide", desc: "Putar 2 lapisan kanan sekaligus ke atas", axis: "x", layers: [1, 2], dir: -1 },
  "Rw'": { name: "Right Wide Prime", desc: "Putar 2 lapisan kanan sekaligus ke bawah", axis: "x", layers: [1, 2], dir: 1 },
  "Rw2": { name: "Right Wide Double", desc: "Putar 2 lapisan kanan 180 derajat", axis: "x", layers: [1, 2], dir: -2 },

  "Lw": { name: "Left Wide", desc: "Putar 2 lapisan kiri sekaligus ke bawah", axis: "x", layers: [-2, -1], dir: 1 },
  "Lw'": { name: "Left Wide Prime", desc: "Putar 2 lapisan kiri sekaligus ke atas", axis: "x", layers: [-2, -1], dir: -1 },
  "Lw2": { name: "Left Wide Double", desc: "Putar 2 lapisan kiri 180 derajat", axis: "x", layers: [-2, -1], dir: 2 },

  "Uw": { name: "Up Wide", desc: "Putar 2 lapisan atas sekaligus ke kiri", axis: "y", layers: [1, 2], dir: -1 },
  "Uw'": { name: "Up Wide Prime", desc: "Putar 2 lapisan atas sekaligus ke kanan", axis: "y", layers: [1, 2], dir: 1 },
  "Uw2": { name: "Up Wide Double", desc: "Putar 2 lapisan atas 180 derajat", axis: "y", layers: [1, 2], dir: -2 },

  "Dw": { name: "Down Wide", desc: "Putar 2 lapisan bawah sekaligus ke kanan", axis: "y", layers: [-2, -1], dir: 1 },
  "Dw'": { name: "Down Wide Prime", desc: "Putar 2 lapisan bawah sekaligus ke kiri", axis: "y", layers: [-2, -1], dir: -1 },
  "Dw2": { name: "Down Wide Double", desc: "Putar 2 lapisan bawah 180 derajat", axis: "y", layers: [-2, -1], dir: 2 },

  "Fw": { name: "Front Wide", desc: "Putar 2 lapisan depan sekaligus searah jarum jam", axis: "z", layers: [1, 2], dir: -1 },
  "Fw'": { name: "Front Wide Prime", desc: "Putar 2 lapisan depan sekaligus berlawanan arah jarum jam", axis: "z", layers: [1, 2], dir: 1 },
  "Fw2": { name: "Front Wide Double", desc: "Putar 2 lapisan depan 180 derajat", axis: "z", layers: [1, 2], dir: -2 },

  "Bw": { name: "Back Wide", desc: "Putar 2 lapisan belakang sekaligus searah jarum jam", axis: "z", layers: [-2, -1], dir: 1 },
  "Bw'": { name: "Back Wide Prime", desc: "Putar 2 lapisan belakang sekaligus berlawanan arah jarum jam", axis: "z", layers: [-2, -1], dir: -1 },
  "Bw2": { name: "Back Wide Double", desc: "Putar 2 lapisan belakang 180 derajat", axis: "z", layers: [-2, -1], dir: 2 },

  // --- 3-Layer Wide Turns (3 Lapisan) ---
  "3Rw": { name: "3-Right Wide", desc: "Putar 3 lapisan kanan sekaligus ke atas", axis: "x", layers: [0, 1, 2], dir: -1 },
  "3Rw'": { name: "3-Right Wide Prime", desc: "Putar 3 lapisan kanan sekaligus ke bawah", axis: "x", layers: [0, 1, 2], dir: 1 },
  "3Rw2": { name: "3-Right Wide Double", desc: "Putar 3 lapisan kanan 180 derajat", axis: "x", layers: [0, 1, 2], dir: -2 },

  "3Lw": { name: "3-Left Wide", desc: "Putar 3 lapisan kiri sekaligus ke bawah", axis: "x", layers: [-2, -1, 0], dir: 1 },
  "3Lw'": { name: "3-Left Wide Prime", desc: "Putar 3 lapisan kiri sekaligus ke atas", axis: "x", layers: [-2, -1, 0], dir: -1 },
  "3Lw2": { name: "3-Left Wide Double", desc: "Putar 3 lapisan kiri 180 derajat", axis: "x", layers: [-2, -1, 0], dir: 2 },

  "3Uw": { name: "3-Up Wide", desc: "Putar 3 lapisan atas sekaligus ke kiri", axis: "y", layers: [0, 1, 2], dir: -1 },
  "3Uw'": { name: "3-Up Wide Prime", desc: "Putar 3 lapisan atas sekaligus ke kanan", axis: "y", layers: [0, 1, 2], dir: 1 },
  "3Uw2": { name: "3-Up Wide Double", desc: "Putar 3 lapisan atas 180 derajat", axis: "y", layers: [0, 1, 2], dir: -2 },

  // --- Slice Turns (1 Lapisan Dalam Spesifik) ---
  "2R": { name: "Inner Right Slice", desc: "Putar hanya lapisan dalam kanan ke atas (sayap)", axis: "x", layers: [1], dir: -1 },
  "2R'": { name: "Inner Right Slice Prime", desc: "Putar hanya lapisan dalam kanan ke bawah", axis: "x", layers: [1], dir: 1 },
  "2R2": { name: "Inner Right Slice Double", desc: "Putar hanya lapisan dalam kanan 180 derajat", axis: "x", layers: [1], dir: -2 },

  "2L": { name: "Inner Left Slice", desc: "Putar hanya lapisan dalam kiri ke bawah", axis: "x", layers: [-1], dir: 1 },
  "2L'": { name: "Inner Left Slice Prime", desc: "Putar hanya lapisan dalam kiri ke atas", axis: "x", layers: [-1], dir: -1 },
  "2L2": { name: "Inner Left Slice Double", desc: "Putar hanya lapisan dalam kiri 180 derajat", axis: "x", layers: [-1], dir: 2 },

  "2U": { name: "Inner Up Slice", desc: "Putar hanya lapisan dalam atas ke kiri", axis: "y", layers: [1], dir: -1 },
  "2U'": { name: "Inner Up Slice Prime", desc: "Putar hanya lapisan dalam atas ke kanan", axis: "y", layers: [1], dir: 1 },
  "2U2": { name: "Inner Up Slice Double", desc: "Putar hanya lapisan dalam atas 180 derajat", axis: "y", layers: [1], dir: -2 },

  "2D": { name: "Inner Down Slice", desc: "Putar hanya lapisan dalam bawah ke kanan", axis: "y", layers: [-1], dir: 1 },
  "2D'": { name: "Inner Down Slice Prime", desc: "Putar hanya lapisan dalam bawah ke kiri", axis: "y", layers: [-1], dir: -1 },
  "2D2": { name: "Inner Down Slice Double", desc: "Putar hanya lapisan dalam bawah 180 derajat", axis: "y", layers: [-1], dir: 2 },

  "2F": { name: "Inner Front Slice", desc: "Putar hanya lapisan dalam depan searah jarum jam", axis: "z", layers: [1], dir: -1 },
  "2F'": { name: "Inner Front Slice Prime", desc: "Putar hanya lapisan dalam depan berlawanan arah jarum jam", axis: "z", layers: [1], dir: 1 },
  "2F2": { name: "Inner Front Slice Double", desc: "Putar hanya lapisan dalam depan 180 derajat", axis: "z", layers: [1], dir: -2 },

  "M": { name: "Middle Slice", desc: "Putar lapisan tengah vertikal searah gerakan L", axis: "x", layers: [0], dir: 1 },
  "M'": { name: "Middle Slice Prime", desc: "Putar lapisan tengah vertikal searah gerakan R", axis: "x", layers: [0], dir: -1 },
  "M2": { name: "Middle Slice Double", desc: "Putar lapisan tengah vertikal 180 derajat", axis: "x", layers: [0], dir: 2 },

  // --- Whole Cube Rotations ---
  "x": { name: "Rotate X", desc: "Putar seluruh kubus mengikuti arah R", axis: "x", layers: [-2, -1, 0, 1, 2], dir: -1 },
  "x'": { name: "Rotate X Prime", desc: "Putar seluruh kubus mengikuti arah R'", axis: "x", layers: [-2, -1, 0, 1, 2], dir: 1 },
  "x2": { name: "Rotate X Double", desc: "Putar seluruh kubus 180 derajat pada sumbu X", axis: "x", layers: [-2, -1, 0, 1, 2], dir: -2 },

  "y": { name: "Rotate Y", desc: "Putar seluruh kubus mengikuti arah U", axis: "y", layers: [-2, -1, 0, 1, 2], dir: -1 },
  "y'": { name: "Rotate Y Prime", desc: "Putar seluruh kubus mengikuti arah U'", axis: "y", layers: [-2, -1, 0, 1, 2], dir: 1 },
  "y2": { name: "Rotate Y Double", desc: "Putar seluruh kubus 180 derajat pada sumbu Y", axis: "y", layers: [-2, -1, 0, 1, 2], dir: -2 },

  "z": { name: "Rotate Z", desc: "Putar seluruh kubus mengikuti arah F", axis: "z", layers: [-2, -1, 0, 1, 2], dir: -1 },
  "z'": { name: "Rotate Z Prime", desc: "Putar seluruh kubus mengikuti arah F'", axis: "z", layers: [-2, -1, 0, 1, 2], dir: 1 },
  "z2": { name: "Rotate Z Double", desc: "Putar seluruh kubus 180 derajat pada sumbu Z", axis: "z", layers: [-2, -1, 0, 1, 2], dir: -2 },
};

// Aliases for alternate notations (e.g. lowercase r -> Rw, 2Rw -> Rw)
export const NOTATION_ALIASES = {
  "r": "Rw", "r'": "Rw'", "r2": "Rw2",
  "l": "Lw", "l'": "Lw'", "l2": "Lw2",
  "u": "Uw", "u'": "Uw'", "u2": "Uw2",
  "d": "Dw", "d'": "Dw'", "d2": "Dw2",
  "f": "Fw", "f'": "Fw'", "f2": "Fw2",
  "b": "Bw", "b'": "Bw'", "b2": "Bw2",
  "2Rw": "Rw", "2Rw'": "Rw'", "2Rw2": "Rw2",
  "2Lw": "Lw", "2Lw'": "Lw'", "2Lw2": "Lw2",
  "2Uw": "Uw", "2Uw'": "Uw'", "2Uw2": "Uw2",
  "2Dw": "Dw", "2Dw'": "Dw'", "2Dw2": "Dw2",
  "2Fw": "Fw", "2Fw'": "Fw'", "2Fw2": "Fw2",
  "2Bw": "Bw", "2Bw'": "Bw'", "2Bw2": "Bw2",
};

/**
 * Normalisasi dan parse string notasi/algoritma menjadi array perintah langkah
 * Contoh: "Rw U2 x Rw U2" -> ["Rw", "U2", "x", "Rw", "U2"]
 */
export function parseAlgorithm(algString) {
  if (!algString || typeof algString !== "string") return [];
  // Hapus tanda kurung () atau [] yang sering dipakai grouping rumus
  const cleaned = algString.replace(/[()[\]]/g, " ");
  const rawTokens = cleaned.trim().split(/\s+/);

  const parsedMoves = [];
  for (let token of rawTokens) {
    if (!token) continue;
    // Cek alias
    const normalized = NOTATION_ALIASES[token] || token;
    if (NOTATION_DICTIONARY[normalized]) {
      parsedMoves.push(normalized);
    } else {
      console.warn(`Notasi '${token}' tidak dikenali, dilewati.`);
    }
  }
  return parsedMoves;
}

/**
 * Dapatkan deskripsi detail bahasa Indonesia dari sebuah notasi
 */
export function getMoveInfo(move) {
  const norm = NOTATION_ALIASES[move] || move;
  return NOTATION_DICTIONARY[norm] || {
    name: move,
    desc: `Gerakan ${move}`,
    axis: "y",
    layers: [2],
    dir: -1
  };
}

/**
 * Dapatkan gerakan kebalikannya (Inverse Move)
 * Contoh: R -> R', U' -> U, Rw2 -> Rw2
 */
export function getInverseMove(move) {
  if (!move) return "";
  if (move.endsWith("2")) return move;
  if (move.endsWith("'")) return move.slice(0, -1);
  return move + "'";
}

