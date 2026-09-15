import React, { useState } from 'react';
import { Eye, RotateCw, Shuffle, RotateCcw, HelpCircle, Palette, Box, ChevronDown } from 'lucide-react';

export default function Header({
  isInspectMode,
  onToggleInspectMode,
  onScramble,
  onResetCube,
  onOpenNotationModal,
  onOpenCustomLayout,
  onQuickMove
}) {
  const [showQuickMoves, setShowQuickMoves] = useState(false);

  const quickMoveButtons = [
    { label: "R", title: "Right" },
    { label: "R'", title: "Right Prime" },
    { label: "Rw", title: "Right Wide (2 Lapis)" },
    { label: "Rw'", title: "Right Wide Prime" },
    { label: "L", title: "Left" },
    { label: "L'", title: "Left Prime" },
    { label: "Lw", title: "Left Wide (2 Lapis)" },
    { label: "U", title: "Up" },
    { label: "U'", title: "Up Prime" },
    { label: "Uw", title: "Up Wide (2 Lapis)" },
    { label: "Uw'", title: "Up Wide Prime" },
    { label: "F", title: "Front" },
    { label: "F'", title: "Front Prime" },
    { label: "Fw", title: "Front Wide" },
    { label: "D", title: "Down" },
    { label: "B", title: "Back" },
    { label: "M", title: "Middle Slice" },
    { label: "x", title: "Rotate Cube X" },
    { label: "y", title: "Rotate Cube Y" }
  ];

  return (
    <header className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-2.5 flex flex-col gap-2 z-30 shadow-md">
      <div className="flex items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-emerald-400 p-0.5 shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Box className="w-5 h-5 text-sky-400 animate-pulse-subtle" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-wide bg-gradient-to-r from-white via-slate-100 to-sky-300 bg-clip-text text-transparent">
                Rubik 5x5 Solver 3D
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 uppercase tracking-wider">
                Professor's Cube
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Panduan Interaktif Metode Reduksi & Kasus Parity
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Mode Toggle (Amati vs Putar) */}
          <button
            onClick={onToggleInspectMode}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isInspectMode
                ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
            }`}
            title={isInspectMode ? 'Klik untuk berpindah ke Mode Putar Layer' : 'Klik untuk berpindah ke Mode Amati 360°'}
          >
            {isInspectMode ? (
              <>
                <Eye className="w-4 h-4" />
                <span className="hidden md:inline">Mode: Amati (Orbit)</span>
              </>
            ) : (
              <>
                <RotateCw className="w-4 h-4" />
                <span className="hidden md:inline">Mode: Putar Layer</span>
              </>
            )}
          </button>

          {/* Quick Moves Toggle */}
          <button
            onClick={() => setShowQuickMoves(!showQuickMoves)}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-all ${
              showQuickMoves
                ? 'bg-slate-800 text-sky-400 border-slate-700'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
            title="Tampilkan Tombol Putar Cepat"
          >
            <RotateCw className="w-4 h-4" />
            <span className="hidden sm:inline">Putar Manual</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showQuickMoves ? 'rotate-180' : ''}`} />
          </button>

          {/* Scramble Button */}
          <button
            onClick={onScramble}
            className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Acak Kubus 5x5 (Scramble WCA)"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Acak</span>
          </button>

          {/* Reset Cube Button */}
          <button
            onClick={onResetCube}
            className="p-2 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-xl transition-colors shadow-sm"
            title="Kembalikan ke Kondisi Selesai (Solved)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Custom Layout Button */}
          <button
            onClick={onOpenCustomLayout}
            className="px-3 py-1.5 bg-gradient-to-r from-sky-500/20 to-blue-600/20 hover:from-sky-500/30 hover:to-blue-600/30 text-sky-300 border border-sky-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Sesuaikan susunan warna atau pilih kasus macet"
          >
            <Palette className="w-4 h-4 text-sky-400" />
            <span className="hidden lg:inline">Sesuaikan Layout</span>
          </button>

          {/* Notation Help */}
          <button
            onClick={onOpenNotationModal}
            className="p-2 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-xl transition-colors shadow-sm"
            title="Buka Kamus Notasi Rubik"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collapsible Quick Moves Toolbar */}
      {showQuickMoves && (
        <div className="pt-2 pb-1 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap mr-1">
            Putar Cepat:
          </span>
          {quickMoveButtons.map(btn => (
            <button
              key={btn.label}
              onClick={() => onQuickMove(btn.label)}
              className="px-2.5 py-1 bg-slate-800/90 hover:bg-sky-600 text-slate-200 hover:text-white font-mono font-bold text-xs rounded-lg border border-slate-700/60 shadow-sm transition-all active:scale-95 whitespace-nowrap"
              title={btn.title}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

