import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, FastForward, Info } from 'lucide-react';
import { getMoveInfo } from '../cube/rubikNotation';

export default function PlaybackBar({
  moves = [],
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
  const currentMove = moves[currentMoveIndex] || null;
  const currentInfo = currentMove ? getMoveInfo(currentMove) : null;
  const progressPercent = moves.length > 0 ? ((currentMoveIndex) / moves.length) * 100 : 0;

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border-t border-slate-800/80 px-4 py-3 text-white shadow-2xl flex flex-col gap-2.5 w-full min-w-0 overflow-hidden">
      {/* Move Timeline Scroller */}
      {moves.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap pl-1">
            Langkah:
          </span>
          <div className="flex items-center gap-1.5 flex-1">
            {moves.map((m, idx) => {
              const isCurrent = idx === currentMoveIndex;
              const isPast = idx < currentMoveIndex;
              return (
                <button
                  key={`${m}-${idx}`}
                  onClick={() => onSelectMoveIndex && onSelectMoveIndex(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all duration-200 whitespace-nowrap ${
                    isCurrent
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/40 ring-2 ring-sky-300 scale-105'
                      : isPast
                      ? 'bg-slate-800/90 text-slate-400 hover:bg-slate-700'
                      : 'bg-slate-800/40 text-slate-500 hover:bg-slate-700/60'
                  }`}
                  title={getMoveInfo(m).desc}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Detail Notasi Aktif */}
        <div className="flex items-center gap-3 min-w-[240px]">
          {currentMove ? (
            <div className="flex items-center gap-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5 shadow-inner">
              <span className="bg-sky-500 text-white text-xs font-mono font-black px-2 py-0.5 rounded-md shadow-sm">
                {currentMove}
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-200">
                  {currentInfo?.name || currentMove}
                </span>
                <span className="text-[11px] text-slate-400 line-clamp-1">
                  {currentInfo?.desc || ''}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic px-2">
              <Info className="w-3.5 h-3.5" />
              <span>{moves.length > 0 ? 'Algoritma selesai atau belum dimulai' : 'Pilih rumus dari panduan di samping'}</span>
            </div>
          )}
        </div>

        {/* Action Buttons: Prev, Play/Pause, Next, Reset */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 rounded-2xl p-1 shadow-inner">
          <button
            onClick={onReset}
            disabled={currentMoveIndex === 0}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent rounded-xl transition-colors"
            title="Ulangi dari Langkah Pertama"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onStepPrev}
            disabled={currentMoveIndex === 0 || isPlaying}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent rounded-xl transition-colors"
            title="Langkah Sebelumnya (Mundur)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onPlayToggle}
            disabled={moves.length === 0}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-500/25 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Jeda</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>{currentMoveIndex >= moves.length ? 'Ulangi' : 'Putar'}</span>
              </>
            )}
          </button>

          <button
            onClick={onStepNext}
            disabled={currentMoveIndex >= moves.length || isPlaying}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent rounded-xl transition-colors"
            title="Langkah Berikutnya (Maju)"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Slider & Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/50 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <FastForward className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[11px] text-slate-400">Kecepatan:</span>
            <select
              value={speed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="bg-transparent text-xs font-semibold text-sky-400 focus:outline-none cursor-pointer"
            >
              <option value="0.5" className="bg-slate-900 text-white">0.5x (Lambat)</option>
              <option value="1" className="bg-slate-900 text-white">1.0x (Normal)</option>
              <option value="1.5" className="bg-slate-900 text-white">1.5x (Cepat)</option>
              <option value="2" className="bg-slate-900 text-white">2.0x (Kilat)</option>
            </select>
          </div>

          <div className="text-right text-xs font-mono font-bold text-slate-400 min-w-[50px]">
            {moves.length > 0 ? `${currentMoveIndex}/${moves.length}` : '0/0'}
          </div>
        </div>
      </div>
    </div>
  );
}
