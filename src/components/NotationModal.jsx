import React, { useState, useMemo } from 'react';
import { X, HelpCircle, Play } from 'lucide-react';
import { NOTATION_DICTIONARY as DEFAULT_NXN_DICTIONARY } from '../cube/rubikNotation';

export default function NotationModal({
  puzzle,
  isOpen,
  onClose,
  onTestMove
}) {
  // Build categories and dictionary dynamically based on active puzzle
  const { categories, dictionary } = useMemo(() => {
    const pId = puzzle?.id || 'cube-3x3';
    const dict = {};

    // 1. Pyraminx
    if (pId === 'pyraminx') {
      const pNotation = puzzle?.notation || {};
      Object.assign(dict, pNotation);
      const mainKeys = ['U', "U'", 'R', "R'", 'L', "L'", 'B', "B'"].filter(k => dict[k]);
      const tipKeys = ['u', "u'", 'r', "r'", 'l', "l'", 'b', "b'"].filter(k => dict[k]);
      return {
        categories: {
          main: {
            name: 'Sisi Utama (120°)',
            desc: 'Memutar 3/4 bagian dari satu sudut tetrahedron',
            keys: mainKeys
          },
          tips: {
            name: 'Ujung / Tips',
            desc: 'Memutar hanya 1 potongan ujung tetrahedron secara independen',
            keys: tipKeys
          }
        },
        dictionary: dict
      };
    }

    // 2. Skewb
    if (pId === 'skewb') {
      const sNotation = puzzle?.notation || {};
      Object.assign(dict, sNotation);
      const cornerKeys = Object.keys(dict).filter(k => typeof dict[k] === 'object' && dict[k]?.name);
      return {
        categories: {
          corners: {
            name: 'Sudut Diagonal (120°)',
            desc: 'Putaran sudut deep-cut membelah separuh badan Skewb',
            keys: cornerKeys
          }
        },
        dictionary: dict
      };
    }

    // 3. Megaminx
    if (pId === 'megaminx') {
      const mNotation = puzzle?.notation || {};
      Object.assign(dict, mNotation);
      const faceKeys = ['U', "U'", 'F', "F'", 'R', "R'", 'L', "L'", 'D', "D'", 'B', "B'"].filter(k => dict[k]);
      const pochKeys = ['R++', 'R--', 'D++', 'D--'].filter(k => dict[k]);
      return {
        categories: {
          faces: {
            name: 'Putaran Sisi (72°)',
            desc: 'Putaran satu sisi pentagonal 72 derajat',
            keys: faceKeys
          },
          pochmann: {
            name: 'Pochmann Scramble',
            desc: 'Putaran dua lapis ganda 144 derajat (R++, R--, D++, D--)',
            keys: pochKeys
          }
        },
        dictionary: dict
      };
    }

    // 4. Square-1
    if (pId.startsWith('square')) {
      const sqNotation = puzzle?.notation || {};
      Object.assign(dict, sqNotation);
      const sliceKeys = ['/'].filter(k => dict[k]);
      const tupleKeys = Object.keys(dict).filter(k => k !== '/' && typeof dict[k] === 'object' && dict[k]?.name);
      return {
        categories: {
          slice: {
            name: 'Irisan Slice (/)',
            desc: 'Memutar irisan tengah belahan vertikal 180 derajat',
            keys: sliceKeys
          },
          tuples: {
            name: 'Putaran Lapisan (x, y)',
            desc: 'Putaran sudut atas (x) dan bawah (y) dalam kelipatan 30 derajat',
            keys: tupleKeys
          }
        },
        dictionary: dict
      };
    }

    // 5. Default NxN (2x2 to 7x7)
    Object.assign(dict, DEFAULT_NXN_DICTIONARY);
    if (puzzle?.notation) {
      Object.assign(dict, puzzle.notation);
    }

    const order = puzzle?.order || 3;
    const cats = {
      outer: {
        name: 'Sisi Luar',
        desc: 'Hanya memutar 1 lapisan terluar (R, L, U, D, F, B)',
        keys: ['R', "R'", 'R2', 'L', "L'", 'L2', 'U', "U'", 'U2', 'D', "D'", 'D2', 'F', "F'", 'F2', 'B', "B'", 'B2'].filter(k => dict[k])
      }
    };

    if (order >= 4) {
      cats.wide = {
        name: 'Lapisan Ganda (Rw, Uw)',
        desc: 'Memutar 2 atau lebih lapisan luar sekaligus',
        keys: ['Rw', "Rw'", 'Rw2', 'Lw', "Lw'", 'Uw', "Uw'", 'Dw', "Dw'", 'Fw', "Fw'", 'Bw', "Bw'", '3Rw', '3Uw'].filter(k => dict[k])
      };
      cats.slice = {
        name: 'Lapisan Dalam (Slice)',
        desc: 'Memutar hanya lapisan tertentu di dalam kubus',
        keys: ['2R', "2R'", '2R2', '2L', '2U', "2U'", '2D', '2F', 'M', "M'"].filter(k => dict[k])
      };
    } else if (order >= 3) {
      cats.slice = {
        name: 'Irisan Tengah (M)',
        desc: 'Memutar irisan tengah vertikal antara R dan L',
        keys: ['M', "M'", 'M2'].filter(k => dict[k])
      };
    }

    cats.cube = {
      name: 'Rotasi Kubus (x, y, z)',
      desc: 'Memutar orientasi seluruh kubus tanpa mengubah susunan potongan',
      keys: ['x', "x'", 'y', "y'", 'z', "z'"].filter(k => dict[k])
    };

    return {
      categories: cats,
      dictionary: dict
    };
  }, [puzzle]);

  const catKeys = Object.keys(categories);
  const [selectedCategory, setSelectedCategory] = useState(catKeys[0] || 'outer');

  if (!isOpen) return null;

  const activeCategoryKey = categories[selectedCategory] ? selectedCategory : catKeys[0];
  const activeCategory = categories[activeCategoryKey] || { name: '', desc: '', keys: [] };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Kamus Notasi {puzzle?.shortName || puzzle?.name || 'Twisty Puzzle'}
              </h3>
              <p className="text-xs text-slate-400">
                Panduan arti lambang putaran resmi WCA dalam Bahasa Indonesia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-slate-800 p-2 gap-1 bg-slate-950/40 text-xs font-semibold overflow-x-auto scrollbar-thin">
          {Object.entries(categories).map(([catKey, cat]) => (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`py-2 px-3 rounded-xl whitespace-nowrap text-center transition-all ${
                activeCategoryKey === catKey
                  ? 'bg-sky-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat.name} ({cat.keys.length})
            </button>
          ))}
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          <p className="text-xs text-slate-400 mb-3 italic">
            {activeCategory.desc}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeCategory.keys.map((moveKey) => {
              const info = dictionary[moveKey] || { name: `Gerakan ${moveKey}`, desc: `Putaran notasi ${moveKey}` };
              return (
                <div
                  key={moveKey}
                  className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-11 h-11 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 font-mono font-black text-sm flex items-center justify-center shrink-0 shadow-inner px-1 text-center">
                      {moveKey}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{info.name || moveKey}</h4>
                      <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{info.desc || ''}</p>
                    </div>
                  </div>

                  {onTestMove && (
                    <button
                      onClick={() => onTestMove(moveKey)}
                      className="p-2 bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white rounded-xl transition-all shadow-sm shrink-0"
                      title={`Coba putar ${moveKey} di viewer 3D`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
