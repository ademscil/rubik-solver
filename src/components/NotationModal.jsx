import React, { useState } from 'react';
import { X, HelpCircle, Play, Sparkles } from 'lucide-react';
import { NOTATION_DICTIONARY } from '../cube/rubikNotation';

export default function NotationModal({ isOpen, onClose, onTestMove }) {
  const [selectedCategory, setSelectedCategory] = useState('wide'); // 'outer' | 'wide' | 'slice' | 'cube'

  if (!isOpen) return null;

  const categories = {
    outer: {
      name: "Sisi Luar (1 Lapis)",
      desc: "Hanya memutar 1 lapisan terluar (R, L, U, D, F, B)",
      keys: ["R", "R'", "R2", "L", "L'", "L2", "U", "U'", "U2", "D", "D'", "D2", "F", "F'", "F2", "B", "B'", "B2"]
    },
    wide: {
      name: "Lapisan Ganda (Rw, Uw)",
      desc: "Memutar 2 atau 3 lapisan sekaligus (sangat penting untuk 5x5)",
      keys: ["Rw", "Rw'", "Rw2", "Lw", "Lw'", "Uw", "Uw'", "Dw", "Dw'", "Fw", "Fw'", "Bw", "Bw'", "3Rw", "3Uw"]
    },
    slice: {
      name: "Lapisan Dalam (Slice)",
      desc: "Memutar hanya 1 lapisan tertentu di dalam kubus (2R, 2U, M)",
      keys: ["2R", "2R'", "2R2", "2L", "2U", "2U'", "2D", "2F", "M", "M'"]
    },
    cube: {
      name: "Rotasi Kubus (x, y, z)",
      desc: "Memutar orientasi seluruh kubus tanpa mengubah susunan potongan",
      keys: ["x", "x'", "y", "y'", "z", "z'"]
    }
  };

  const currentList = categories[selectedCategory].keys;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Kamus Notasi Rubik 5x5</h3>
              <p className="text-xs text-slate-400">Panduan arti lambang putaran dalam Bahasa Indonesia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-4 border-b border-slate-800 p-2 gap-1 bg-slate-950/40 text-xs font-semibold">
          {Object.entries(categories).map(([catKey, cat]) => (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`py-2 px-1 rounded-xl text-center transition-all ${
                selectedCategory === catKey
                  ? 'bg-sky-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          <p className="text-xs text-slate-400 mb-3 italic">
            {categories[selectedCategory].desc}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentList.map(moveKey => {
              const info = NOTATION_DICTIONARY[moveKey];
              if (!info) return null;
              return (
                <div
                  key={moveKey}
                  className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400 font-mono font-black text-sm flex items-center justify-center shrink-0 shadow-inner">
                      {moveKey}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{info.name}</h4>
                      <p className="text-[11px] text-slate-400 leading-snug">{info.desc}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onTestMove(moveKey)}
                    className="p-2 bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white rounded-xl transition-all shadow-sm shrink-0"
                    title={`Coba putar ${moveKey} di kubus 3D`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

