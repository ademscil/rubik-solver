import React, { useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, FastForward, Info, CheckCircle2 } from 'lucide-react';
import { getMoveInfo as defaultGetMoveInfo } from '../cube/rubikNotation.js';

export default function PlaybackBar({
  puzzle,
  moves = [],
  stages = [],
  currentMoveIndex = 0,
  isPlaying = false,
  speed = 1,
  onPlayToggle,
  onStepNext,
  onStepPrev,
  onReset,
  onSpeedChange,
  onSelectMoveIndex
}) {
  // Helper to dynamically resolve Indonesian move title and description for active puzzle
  const resolveMoveInfo = useCallback((token) => {
    if (!token) return { name: '', desc: '' };
    if (puzzle && typeof puzzle.getMoveInfo === 'function') {
      try {
        const info = puzzle.getMoveInfo(token);
        if (info) return info;
      } catch {
        // fallback
      }
    }
    return defaultGetMoveInfo(token) || { name: token, desc: `Putaran ${token}` };
  }, [puzzle]);

  const currentMove = moves[currentMoveIndex] || null;
  const currentInfo = currentMove ? resolveMoveInfo(currentMove) : null;

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-3 sm:px-4 py-2.5 sm:py-3 text-white shadow-2xl flex flex-col gap-2 w-full min-w-0 shrink-0 z-20">
      {/* Pedagogical Stages Progress Bar (Bila Tersedia) */}
      {stages && stages.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap pl-1 mr-1">
            Tahap:
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {stages.map((stg, sIdx) => {
              const isActive = currentMoveIndex >= stg.startIndex && currentMoveIndex < stg.endIndex;
              const isCompleted = currentMoveIndex >= stg.endIndex;

              return (
                <button
                  key={stg.id || sIdx}
                  onClick={() => onSelectMoveIndex && onSelectMoveIndex(stg.startIndex)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-300 font-bold scale-[1.02]'
                      : isCompleted
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900/50'
                      : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 border border-slate-700/40'
                  }`}
                  title={`${stg.title}: ${stg.description || ''}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-white animate-pulse' : 'bg-slate-500'}`} />
                  )}
                  <span>{stg.shortTitle || stg.title}</span>
                  <span className="text-[10px] opacity-75 font-mono">({stg.moves?.length || (stg.endIndex - stg.startIndex)})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Move Timeline Scroller */}
      {moves.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap pl-1">
            Langkah:
          </span>
          <div className="flex items-center gap-1 flex-1">
            {moves.map((m, idx) => {
              const isCurrent = idx === currentMoveIndex;
              const isPast = idx < currentMoveIndex;
              const info = resolveMoveInfo(m);

              return (
                <button
                  key={`${m}-${idx}`}
                  onClick={() => onSelectMoveIndex && onSelectMoveIndex(idx)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition-all duration-150 whitespace-nowrap ${
                    isCurrent
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/40 ring-2 ring-sky-300 scale-105'
                      : isPast
                      ? 'bg-slate-800/90 text-slate-400 hover:bg-slate-700'
                      : 'bg-slate-800/40 text-slate-500 hover:bg-slate-700/60'
                  }`}
                  title={`${m}: ${info.name || ''} - ${info.desc || ''}`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Controls Row - Fully responsive with zero overlap */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 pt-1">
        {/* Detail Notasi Aktif */}
        <div className="flex items-center gap-2 flex-1 min-w-[160px] max-w-sm">
          {currentMove ? (
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-2.5 py-1 shadow-inner w-full overflow-hidden">
              <span className="bg-sky-500 text-white text-xs font-mono font-black px-1.5 py-0.5 rounded-md shadow-sm shrink-0">
                {currentMove}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {currentInfo?.name || currentMove}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {currentInfo?.desc || ''}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 italic px-1 truncate">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{moves.length > 0 ? 'Selesai / Tekan Putar' : 'Pilih rumus atau acak puzzle'}</span>
            </div>
          )}
        </div>

        {/* Action Buttons: Prev, Play/Pause, Next, Reset */}
        <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-800 rounded-2xl p-1 shadow-inner shrink-0">
          <button
            onClick={onReset}
            disabled={currentMoveIndex === 0}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent rounded-xl transition-colors"
            title="Ulangi dari Langkah Pertama"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            onClick={onStepPrev}
            disabled={currentMoveIndex === 0 || isPlaying}
            className="p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent rounded-xl transition-colors"
            title="Langkah Sebelumnya (Mundur)"
          >
            <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            onClick={onPlayToggle}
            disabled={moves.length === 0}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-500/25 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
                <span>Jeda</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
                <span>{currentMoveIndex >= moves.length ? 'Ulangi' : 'Putar'}</span>
              </>
            )}
          </button>

          <button
            onClick={onStepNext}
            disabled={currentMoveIndex >= moves.length || isPlaying}
            className="p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent rounded-xl transition-colors"
            title="Langkah Berikutnya (Maju)"
          >
            <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Speed Selector & Move Counter */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/50 rounded-xl px-2 py-1 text-xs text-slate-300">
            <FastForward className="w-3 h-3 text-sky-400 shrink-0" />
            <span className="text-[10px] text-slate-400 hidden md:inline">Speed:</span>
            <select
              id="playback-speed"
              name="playback-speed"
              aria-label="Kecepatan putaran"
              value={speed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="bg-transparent text-xs font-semibold text-sky-400 focus:outline-none cursor-pointer"
            >
              <option value="0.5" className="bg-slate-900 text-white">0.5x</option>
              <option value="1" className="bg-slate-900 text-white">1.0x</option>
              <option value="1.5" className="bg-slate-900 text-white">1.5x</option>
              <option value="2" className="bg-slate-900 text-white">2.0x</option>
            </select>
          </div>

          <div className="text-right text-xs font-mono font-bold text-slate-400 min-w-[42px]">
            {moves.length > 0 ? `${currentMoveIndex}/${moves.length}` : '0/0'}
          </div>
        </div>
      </div>
    </div>
  );
}
