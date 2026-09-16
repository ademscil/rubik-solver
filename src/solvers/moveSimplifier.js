/**
 * src/solvers/moveSimplifier.js
 * Mathematical Group Reduction and Move Cancellation Engine
 * 
 * Applies Rubik group algebra to cancel redundant moves and combine turns:
 * - Cancels inverse pairs: R + R' -> 0, U2 + U2 -> 0
 * - Merges turns: R + R -> R2, R + R2 -> R', R' + R' -> R2, R' + R2 -> R
 * - Commutes independent opposing faces (e.g. R L R -> R2 L)
 * - Returns clean, minimal mathematical solution sequences
 */

const OPPOSING_PAIRS = {
  R: 'L', L: 'R',
  U: 'D', D: 'U',
  F: 'B', B: 'F',
  Rw: 'Lw', Lw: 'Rw',
  Uw: 'Dw', Dw: 'Uw',
  Fw: 'Bw', Bw: 'Fw',
  '3Rw': '3Lw', '3Lw': '3Rw',
  '3Uw': '3Dw', '3Dw': '3Uw',
  '3Fw': '3Bw', '3Bw': '3Fw'
};

/**
 * Parses a single move token into base face and quarter-turn count (1, 2, 3)
 * @param {string} token
 * @returns {{ base: string, count: number } | null}
 */
export function parseTurn(token) {
  if (!token || typeof token !== 'string') return null;
  const t = token.trim();
  if (!t) return null;

  if (t.endsWith('2')) {
    return { base: t.slice(0, -1), count: 2 };
  } else if (t.endsWith("'")) {
    return { base: t.slice(0, -1), count: 3 }; // 3 quarter turns counter-clockwise = 1 prime
  } else {
    return { base: t, count: 1 };
  }
}

/**
 * Formats base and count into canonical WCA notation
 * @param {string} base
 * @param {number} count (1..3)
 * @returns {string}
 */
export function formatTurn(base, count) {
  const norm = ((count % 4) + 4) % 4;
  if (norm === 0) return '';
  if (norm === 1) return base;
  if (norm === 2) return `${base}2`;
  if (norm === 3) return `${base}'`;
  return '';
}

/**
 * Simplifies a sequence of move strings using group reduction
 * @param {string[]} moves
 * @returns {string[]}
 */
export function simplifyMoves(moves) {
  if (!Array.isArray(moves) || moves.length === 0) return [];

  let current = moves.filter(Boolean);
  let changed = true;
  let passes = 0;

  while (changed && passes < 20 && current.length > 0) {
    changed = false;
    passes++;
    const next = [];

    for (let i = 0; i < current.length; i++) {
      const tok1 = current[i];
      const p1 = parseTurn(tok1);

      if (!p1) {
        next.push(tok1);
        continue;
      }

      // Check if tok1 can merge with next move
      let merged = false;

      // Look ahead up to 2 positions for identical or commuting moves
      for (let j = i + 1; j <= Math.min(i + 2, current.length - 1); j++) {
        const tok2 = current[j];
        const p2 = parseTurn(tok2);

        if (!p2) break;

        if (p1.base === p2.base) {
          // Exactly the same face! Combine them
          const totalCount = (p1.count + p2.count) % 4;
          const combined = formatTurn(p1.base, totalCount);

          // If there was an intermediate move (commuting), preserve it
          if (j > i + 1) {
            next.push(current[i + 1]);
          }

          if (combined) {
            next.push(combined);
          }

          i = j; // skip to j
          merged = true;
          changed = true;
          break;
        }

        // Check if commuting (opposing face)
        const isOpposing = OPPOSING_PAIRS[p1.base] === p2.base;
        if (!isOpposing) {
          // Cannot commute past a non-opposing face
          break;
        }
      }

      if (!merged) {
        next.push(tok1);
      }
    }

    current = next;
  }

  return current;
}
