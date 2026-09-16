import React, { useState, useMemo } from 'react';
import { Eye, RotateCw, Shuffle, RotateCcw, HelpCircle, Palette, Box, ChevronDown, Layers, Sparkles } from 'lucide-react';

export default function Header({
  puzzle,
  isInspectMode,
  onToggleInspectMode,
  onOpenPuzzleSelector,
  onScramble,
  onSolve,
  isScrambled = false,
  onResetCube,
  onOpenNotationModal,
  onOpenCustomLayout,
  onQuickMove
}) {
  const [showQuickMoves, setShowQuickMoves] = useState(false);

  // Difficulty badge styling
  const difficultyConfig = {
    beginner: { label: 'Pemula', badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
    intermediate: { label: 'Menengah', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
    advanced: { label: 'Mahir', badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/30', dot: 'bg-orange-400' },
    expert: { label: 'Master', badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30', dot: 'bg-rose-400' }
  };

  const diff = difficultyConfig[puzzle?.difficulty] || difficultyConfig.beginner;

  // Dynamic quick-move buttons from active puzzle notation
  const quickMoveButtons = useMemo(() => {
    if (puzzle?.notation) {
      const keys = Object.keys(puzzle.notation).filter(
        k => typeof puzzle.notation[k] === 'object' && puzzle.notation[k]?.name
      );
      if (keys.length > 0) {
        return keys.slice(0, 18).map(k => ({
          label: k,
          title: puzzle.notation[k].name || k
        }));
      }
    }
    // Default fallback moves
    return [
      { label: "R", title: "Right" },
      { label: "R'", title: "Right Prime" },
      { label: "L", title: "Left" },
      { label: "L'", title: "Left Prime" },
      { label: "U", title: "Up" },
      { label: "U'", title: "Up Prime" },
      { label: "F", title: "Front" },
      { label: "F'", title: "Front Prime" },
      { label: "D", title: "Down" },
      { label: "B", title: "Back" },
      { label: "M", title: "Middle Slice" },
      { label: "x", title: "Rotate Cube X" },
      { label: "y", title: "Rotate Cube Y" }
    ];
  }, [puzzle]);

  return (
    <header className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/80 px-4 py-2.5 flex flex-col gap-2 z-30 shadow-md">
      <div className="flex items-center justify-between gap-3">
        {/* Brand, Active Puzzle Title, & Ganti Puzzle Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenPuzzleSelector}
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-emerald-400 p-0.5 shadow-lg shadow-sky-500/20 hover:scale-105 transition-transform"
            title="Klik untuk memilih dari 10 varian Twisty Puzzle WCA"
          >
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Box className="w-5 h-5 text-sky-400" />
            </div>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1
                onClick={onOpenPuzzleSelector}
                className="text-base font-black tracking-wide bg-gradient-to-r from-white via-slate-100 to-sky-300 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
                title="Klik untuk mengganti puzzle"
              >
                {puzzle?.name || "Rubik's Twisty Puzzle 3D"}
              </h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1 ${diff.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
                <span>{puzzle?.difficultyLabel || diff.label}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {puzzle?.description || "Platform Pembelajaran Visual 3D Universal untuk Seluruh Varian WCA"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Prominent Ganti Puzzle Button */}
          <button
            onClick={onOpenPuzzleSelector}
            className="px-3 py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-all active:scale-95"
            title="Buka Selektor 10 Puzzle WCA"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ganti Puzzle</span>
          </button>

          {/* Mode Toggle (Amati vs Putar) */}
          <button
            onClick={onToggleInspectMode}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isInspectMode
                ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
            }`}
            title={isInspectMode ? 'Klik untuk berpindah ke Mode Putar Layer' : 'Klik untuk berpindah ke Mode Amati Orbit 360°'}
          >
            {isInspectMode ? (
              <>
                <Eye className="w-4 h-4" />
                <span className="hidden md:inline">Mode: Amati</span>
              </>
            ) : (
              <>
                <RotateCw className="w-4 h-4" />
                <span className="hidden md:inline">Mode: Putar</span>
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
            title="Acak Puzzle (Scramble WCA)"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Acak</span>
          </button>

          {/* Selesaikan Step-by-Step Button */}
          <button
            onClick={onSolve}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all shadow-md active:scale-95 ${
              isScrambled
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white border-emerald-400/50 shadow-emerald-500/25 animate-pulse'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}
            title="Selesaikan Puzzle secara otomatis langkah demi langkah"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden sm:inline">Selesaikan</span>
          </button>

          {/* Reset Cube Button */}
          <button
            onClick={onResetCube}
            className="p-2 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-xl transition-colors shadow-sm"
            title="Kembalikan ke Kondisi Selesai (Solved)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Custom Layout / Presets Button */}
          <button
            onClick={onOpenCustomLayout}
            className="px-3 py-1.5 bg-gradient-to-r from-sky-500/20 to-blue-600/20 hover:from-sky-500/30 hover:to-blue-600/30 text-sky-300 border border-sky-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Sesuaikan susunan warna atau pilih preset kasus macet"
          >
            <Palette className="w-4 h-4 text-sky-400" />
            <span className="hidden lg:inline">Layout & Preset</span>
          </button>

          {/* Notation Help */}
          <button
            onClick={onOpenNotationModal}
            className="p-2 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-xl transition-colors shadow-sm"
            title="Buka Kamus Notasi Puzzle"
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
