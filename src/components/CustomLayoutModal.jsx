import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, Palette, Sparkles, AlertCircle, RefreshCw, Box } from 'lucide-react';
import { CUBE_COLORS, POPULAR_PRESETS } from '../cube/presets';

const DEFAULT_PALETTE = [
  { key: 'U', name: 'Putih (U)', hex: '#FFFFFF' },
  { key: 'D', name: 'Kuning (D)', hex: '#FFD500' },
  { key: 'F', name: 'Hijau (F)', hex: '#009B48' },
  { key: 'B', name: 'Biru (B)', hex: '#0046AD' },
  { key: 'L', name: 'Oranye (L)', hex: '#FF5800' },
  { key: 'R', name: 'Merah (R)', hex: '#B71234' }
];

export default function CustomLayoutModal({
  puzzle,
  isOpen,
  onClose,
  onApplyLayout,
  onApplyPreset
}) {
  const order = puzzle?.order || 3;
  const isNxN = !!puzzle?.order;
  const stickersPerFace = order * order;
  const isOdd = order % 2 !== 0;
  const centerIndex = isOdd ? Math.floor(stickersPerFace / 2) : -1;

  const [selectedColorHex, setSelectedColorHex] = useState('#FFFFFF');
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | '2dnet'

  // Presets list for the current active puzzle
  const presets = useMemo(() => {
    if (puzzle?.presets && puzzle.presets.length > 0) {
      return puzzle.presets;
    }
    return POPULAR_PRESETS;
  }, [puzzle]);

  // Color palette derived from puzzle colorScheme or default
  const palette = useMemo(() => {
    if (puzzle?.colorScheme) {
      if (Array.isArray(puzzle.colorScheme)) {
        return puzzle.colorScheme.map((hex, i) => ({
          key: `c${i}`,
          name: `Warna ${i + 1}`,
          hex: typeof hex === 'string' ? hex : hex?.hex || '#FFFFFF'
        }));
      } else if (typeof puzzle.colorScheme === 'object') {
        return Object.entries(puzzle.colorScheme)
          .filter(([k]) => k !== 'INTERNAL')
          .map(([k, val]) => ({
            key: k,
            name: `${val.name || k}`,
            hex: typeof val === 'string' ? val : val.hex || '#FFFFFF'
          }));
      }
    }
    return DEFAULT_PALETTE;
  }, [puzzle]);

  // Initialize net state according to cube order
  const getInitialSolvedState = () => {
    const faceColors = {
      U: '#FFFFFF',
      L: '#FF5800',
      F: '#009B48',
      R: '#B71234',
      B: '#0046AD',
      D: '#FFD500'
    };
    const state = {};
    Object.entries(faceColors).forEach(([face, hex]) => {
      state[face] = Array(stickersPerFace).fill(hex);
    });
    return state;
  };

  const [netState, setNetState] = useState(getInitialSolvedState);

  // Re-initialize state when puzzle changes
  useEffect(() => {
    setNetState(getInitialSolvedState());
  }, [order, puzzle?.id]);

  if (!isOpen) return null;

  const handleStickerClick = (face, index) => {
    // Lock fixed center for odd order cubes to maintain valid BOY orientation
    if (isOdd && index === centerIndex) return;

    setNetState(prev => {
      const updated = { ...prev };
      const faceArr = [...(updated[face] || Array(stickersPerFace).fill('#333'))];
      faceArr[index] = selectedColorHex;
      updated[face] = faceArr;
      return updated;
    });
  };

  const handleResetToSolved = () => {
    setNetState(getInitialSolvedState());
  };

  const handleApply = () => {
    if (onApplyLayout) {
      onApplyLayout(netState);
    }
    onClose();
  };

  const renderFaceGrid = (faceKey, title) => {
    const stickers = netState[faceKey] || Array(stickersPerFace).fill('#333');
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <div
          className="grid gap-0.5 p-1 bg-slate-950 rounded-lg border border-slate-800 shadow-inner"
          style={{ gridTemplateColumns: `repeat(${order}, minmax(0, 1fr))` }}
        >
          {stickers.map((hex, idx) => {
            const isCenter = isOdd && idx === centerIndex;
            return (
              <button
                key={`${faceKey}-${idx}`}
                onClick={() => handleStickerClick(faceKey, idx)}
                style={{ backgroundColor: hex }}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm transition-transform hover:scale-110 active:scale-95 border border-black/40 ${
                  isCenter ? 'ring-1 ring-white/60 cursor-not-allowed' : 'cursor-pointer'
                }`}
                title={isCenter ? 'Center piece (tetap)' : 'Klik untuk mengubah warna'}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Preset & Penyesuaian {puzzle?.shortName || puzzle?.name || 'Twisty Puzzle'}
              </h3>
              <p className="text-xs text-slate-400">
                Pilih kondisi preset siap pakai atau sesuaikan susunan stiker
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

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 px-6 pt-3 gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'presets'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Preset Kasus ({presets.length})</span>
          </button>
          {isNxN && (
            <button
              onClick={() => setActiveTab('2dnet')}
              className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === '2dnet'
                  ? 'border-sky-500 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Editor Jaring 2D ({order}x{order})</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'presets' ? (
            <div className="space-y-4">
              <div className="bg-sky-950/30 border border-sky-800/40 rounded-2xl p-3.5 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <p className="text-xs text-sky-200/90 leading-relaxed">
                  Pilih kondisi yang menyerupai puzzle Anda saat ini. Sistem akan langsung menata model 3D dan menyiapkan langkah solusinya di timeline!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {presets.map((preset) => {
                  const solutionAlg = preset.solutionMoves || preset.algorithm || '';
                  const setupAlg = preset.setupMoves || '';
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        if (onApplyPreset) onApplyPreset(preset);
                        onClose();
                      }}
                      className="p-4 bg-slate-950/60 border border-slate-800 hover:border-sky-500/60 hover:bg-slate-850 rounded-2xl text-left transition-all group flex flex-col justify-between gap-3 shadow-sm hover:shadow-sky-500/10"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-800/50">
                            {preset.category || 'Preset'}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                          {preset.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                          {preset.desc || preset.stateDescription || ''}
                        </p>
                      </div>

                      {(solutionAlg || setupAlg) && (
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-[11px] text-amber-300 line-clamp-1">
                          {solutionAlg || setupAlg}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Color Palette Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 mr-1">Pilih Warna:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {palette.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setSelectedColorHex(item.hex)}
                        style={{ backgroundColor: item.hex }}
                        className={`w-7 h-7 rounded-xl transition-all border-2 ${
                          selectedColorHex === item.hex
                            ? 'ring-2 ring-sky-400 scale-110 border-white shadow-lg'
                            : 'border-black/40 hover:scale-105'
                        }`}
                        title={item.name}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleResetToSolved}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Solved</span>
                </button>
              </div>

              {/* 2D Cross Net Layout */}
              <div className="flex flex-col items-center gap-3 py-2 overflow-x-auto">
                {/* Up Face */}
                <div className="flex justify-center">
                  {renderFaceGrid('U', 'Atas (U)')}
                </div>

                {/* Middle Row: Left, Front, Right, Back */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {renderFaceGrid('L', 'Kiri (L)')}
                  {renderFaceGrid('F', 'Depan (F)')}
                  {renderFaceGrid('R', 'Kanan (R)')}
                  {renderFaceGrid('B', 'Belakang (B)')}
                </div>

                {/* Down Face */}
                <div className="flex justify-center">
                  {renderFaceGrid('D', 'Bawah (D)')}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleApply}
                  className="px-5 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Terapkan ke Model 3D</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
