import React, { useState } from 'react';
import { X, Check, Palette, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { CUBE_COLORS, POPULAR_PRESETS } from '../cube/presets';

const PALETTE = [
  { key: 'U', name: 'Putih', hex: CUBE_COLORS.U.hex, border: 'border-slate-300' },
  { key: 'D', name: 'Kuning', hex: CUBE_COLORS.D.hex, border: 'border-yellow-400' },
  { key: 'F', name: 'Hijau', hex: CUBE_COLORS.F.hex, border: 'border-emerald-500' },
  { key: 'B', name: 'Biru', hex: CUBE_COLORS.B.hex, border: 'border-blue-600' },
  { key: 'L', name: 'Oranye', hex: CUBE_COLORS.L.hex, border: 'border-orange-500' },
  { key: 'R', name: 'Merah', hex: CUBE_COLORS.R.hex, border: 'border-red-600' }
];

export default function CustomLayoutModal({
  isOpen,
  onClose,
  onApplyLayout,
  onApplyPreset
}) {
  const [selectedColorHex, setSelectedColorHex] = useState(CUBE_COLORS.U.hex);
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | '2dnet'

  // State untuk 150 stiker (default solved)
  const [netState, setNetState] = useState(() => {
    const state = {};
    Object.keys(CUBE_COLORS).forEach(face => {
      if (face !== 'INTERNAL') {
        state[face] = Array(25).fill(CUBE_COLORS[face].hex);
      }
    });
    return state;
  });

  if (!isOpen) return null;

  // Handler mewarnai stiker di 2D Net
  const handleStickerClick = (face, index) => {
    // Jangan ubah fixed center (index 12: row 2, col 2) agar orientasi kubus tetap konsisten
    if (index === 12) return;

    setNetState(prev => {
      const updated = { ...prev };
      const faceArr = [...updated[face]];
      faceArr[index] = selectedColorHex;
      updated[face] = faceArr;
      return updated;
    });
  };

  const handleResetToSolved = () => {
    const state = {};
    Object.keys(CUBE_COLORS).forEach(face => {
      if (face !== 'INTERNAL') {
        state[face] = Array(25).fill(CUBE_COLORS[face].hex);
      }
    });
    setNetState(state);
  };

  const handleApply = () => {
    onApplyLayout(netState);
    onClose();
  };

  const renderFaceGrid = (faceKey, title) => {
    const stickers = netState[faceKey] || Array(25).fill('#333');
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="grid grid-cols-5 gap-0.5 p-1 bg-slate-950 rounded-lg border border-slate-800 shadow-inner">
          {stickers.map((hex, idx) => {
            const isCenter = idx === 12;
            return (
              <button
                key={`${faceKey}-${idx}`}
                onClick={() => handleStickerClick(faceKey, idx)}
                style={{ backgroundColor: hex }}
                className={`w-4 h-4 rounded-sm transition-transform hover:scale-110 active:scale-95 border border-black/40 ${
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sesuaikan Susunan Kubus 5x5</h3>
              <p className="text-xs text-slate-400">Pilih kasus macet siap pakai atau sesuaikan warna stiker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
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
            <span>Preset Kasus Macet (Cepat)</span>
          </button>
          <button
            onClick={() => setActiveTab('2dnet')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === '2dnet'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Editor Jaring 2D Stiker</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'presets' ? (
            <div className="space-y-4">
              <div className="bg-sky-950/30 border border-sky-800/40 rounded-2xl p-3.5 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <p className="text-xs text-sky-200/90 leading-relaxed">
                  Pilih kondisi yang mirip dengan kubus fisik Anda saat ini. Sistem akan langsung menata kubus 3D ke kondisi tersebut dan menyiapkan solusinya!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {POPULAR_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onApplyPreset(preset);
                      onClose();
                    }}
                    className="p-4 bg-slate-950/60 border border-slate-800 hover:border-sky-500/60 hover:bg-slate-850 rounded-2xl text-left transition-all group flex flex-col justify-between gap-3 shadow-sm hover:shadow-sky-500/10"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-800/50">
                          {preset.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                        {preset.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                        {preset.desc}
                      </p>
                    </div>

                    {preset.solutionMoves && (
                      <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-[11px] text-amber-300 line-clamp-1">
                        {preset.solutionMoves}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Color Palette Bar */}
              <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 mr-1">Pilih Warna:</span>
                  <div className="flex items-center gap-2">
                    {PALETTE.map(item => (
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
              <div className="flex flex-col items-center gap-3 py-2">
                {/* Up Face */}
                <div className="flex justify-center">
                  {renderFaceGrid('U', 'Atas (U)')}
                </div>

                {/* Middle Row: Left, Front, Right, Back */}
                <div className="flex items-center gap-3">
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
                  <span>Terapkan ke Kubus 3D</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

