import React, { useState } from 'react';
import { X, Check, Box, Sparkles, Layers, ShieldAlert, Award, Star, Compass } from 'lucide-react';
import { WCA_PUZZLE_METADATA } from '../puzzles/registry.js';

// 4 Difficulty Tiers with distinct colors and branding
export const DIFFICULTY_CONFIG = {
  beginner: {
    id: 'beginner',
    label: 'Pemula',
    colorText: 'text-emerald-400',
    colorBg: 'bg-emerald-500/10',
    colorBorder: 'border-emerald-500/30',
    colorBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    colorHover: 'hover:border-emerald-500/50 hover:bg-emerald-950/20',
    dotColor: 'bg-emerald-400',
    description: 'Pondasi dasar pemecahan twisty puzzle. Sangat ramah untuk yang baru pertama kali belajar.',
    puzzles: ['cube-2x2', 'cube-3x3', 'pyraminx']
  },
  intermediate: {
    id: 'intermediate',
    label: 'Menengah',
    colorText: 'text-amber-400',
    colorBg: 'bg-amber-500/10',
    colorBorder: 'border-amber-500/30',
    colorBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    colorHover: 'hover:border-amber-500/50 hover:bg-amber-950/20',
    dotColor: 'bg-amber-400',
    description: 'Tantangan baru: center bergerak bebas, pengenalan paritas, dan rotasi sumbu sudut.',
    puzzles: ['cube-4x4', 'skewb']
  },
  advanced: {
    id: 'advanced',
    label: 'Mahir',
    colorText: 'text-orange-400',
    colorBg: 'bg-orange-500/10',
    colorBorder: 'border-orange-500/30',
    colorBadge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    colorHover: 'hover:border-orange-500/50 hover:bg-orange-950/20',
    dotColor: 'bg-orange-400',
    description: 'Tingkat kompleksitas tinggi: 12 sisi dodecahedron dan metode reduksi baris multi-layer.',
    puzzles: ['cube-5x5', 'megaminx']
  },
  expert: {
    id: 'expert',
    label: 'Master',
    colorText: 'text-rose-400',
    colorBg: 'bg-rose-500/10',
    colorBorder: 'border-rose-500/30',
    colorBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    colorHover: 'hover:border-rose-500/50 hover:bg-rose-950/20',
    dotColor: 'bg-rose-400',
    description: 'Puncak twisty puzzles: rubik raksasa berdimensi besar dan tantangan perubahan bentuk shape-shifting.',
    puzzles: ['cube-6x6', 'cube-7x7', 'square-1']
  }
};

export default function PuzzleSelector({
  isOpen,
  onClose,
  currentPuzzleId = 'cube-3x3',
  onSelectPuzzle
}) {
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' | 'beginner' | 'intermediate' | 'advanced' | 'expert'

  if (!isOpen) return null;

  const handleSelect = (puzzleId) => {
    if (onSelectPuzzle) {
      onSelectPuzzle(puzzleId);
    }
    if (onClose) {
      onClose();
    }
  };

  const tiers = Object.values(DIFFICULTY_CONFIG);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="bg-slate-900/95 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-emerald-400 p-0.5 shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Box className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-wide">
                  Pilih Rubik & Twisty Puzzle
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase tracking-wider">
                  10 Varian WCA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Dikelompokkan berdasarkan 4 tingkatan kesulitan pembelajaran
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Tutup Selektor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Badges */}
        <div className="px-5 sm:px-6 py-2.5 border-b border-slate-800/80 bg-slate-950/20 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === 'all'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Semua (10 Puzzle)
          </button>
          {tiers.map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelectedFilter(tier.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                selectedFilter === tier.id
                  ? `${tier.colorBadge} shadow-md`
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${tier.dotColor}`} />
              <span>{tier.label} ({tier.puzzles.length})</span>
            </button>
          ))}
        </div>

        {/* Content Body: Grouped by 4 Tiers */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {tiers
            .filter((tier) => selectedFilter === 'all' || selectedFilter === tier.id)
            .map((tier) => (
              <div key={tier.id} className="space-y-3">
                {/* Tier Title Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${tier.dotColor} ring-4 ring-slate-800`} />
                    <h3 className={`text-sm font-black tracking-wide ${tier.colorText}`}>
                      Level: {tier.label}
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 italic">
                    {tier.description}
                  </span>
                </div>

                {/* Puzzle Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {tier.puzzles.map((pId) => {
                    const meta = WCA_PUZZLE_METADATA[pId];
                    if (!meta) return null;
                    const p = meta;
                    const isActive = p.id === currentPuzzleId || currentPuzzleId === meta.wcaId || (p.id === 'square-1' && currentPuzzleId === 'square1') || (p.id === 'square1' && currentPuzzleId === 'square-1');

                    return (
                      <div
                        key={meta.id}
                        onClick={() => handleSelect(meta.id)}
                        className={`group relative p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between gap-3 ${
                          isActive
                            ? 'bg-slate-850/90 border-sky-400 ring-2 ring-sky-400/40 shadow-lg shadow-sky-500/10'
                            : `bg-slate-950/60 border-slate-800/80 ${tier.colorHover} hover:scale-[1.01] shadow-sm`
                        }`}
                      >
                        {/* Top Row: Name, Badges */}
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                                  {meta.name}
                                </h4>
                              </div>
                              <span className="text-[11px] font-mono text-slate-400">
                                WCA ID: {meta.wcaId || meta.id}
                              </span>
                            </div>

                            {isActive ? (
                              <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500 text-white text-[10px] font-bold shadow-md shadow-sky-500/30">
                                <Check className="w-3 h-3" />
                                <span>Aktif</span>
                              </span>
                            ) : (
                              <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${tier.colorBadge}`}>
                                {meta.shortName}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mt-1">
                            {meta.description}
                          </p>
                        </div>

                        {/* Bottom Row: Specs & Indicators */}
                        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Layers className="w-3 h-3 text-slate-500" />
                              <span>{meta.faceCount} Sisi</span>
                            </span>
                            {meta.hasParity && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-semibold flex items-center gap-0.5">
                                <ShieldAlert className="w-2.5 h-2.5" />
                                <span>Paritas</span>
                              </span>
                            )}
                          </div>

                          <span className="text-sky-400 font-medium group-hover:underline text-[11px]">
                            Pilih Puzzle →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <span>
            💡 Berpindah puzzle berlangsung instan tanpa memuat ulang halaman.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
