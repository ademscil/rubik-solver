import React, { useState, useMemo } from 'react';
import { BookOpen, Zap, ChevronRight, ChevronDown, Play, Compass, Search, Lightbulb } from 'lucide-react';

export default function GuideSidebar({
  puzzle,
  guideStages: customGuideStages,
  activeStageIndex = 0,
  onSelectStage,
  onApplyAlgorithm,
  activeCaseId = null,
  highlightMode = 'all',
  onHighlightModeChange
}) {
  const [activeTab, setActiveTab] = useState('wizard'); // 'wizard' | 'algopedia'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStage, setExpandedStage] = useState(activeStageIndex);
  const [prevProps, setPrevProps] = useState({ stage: activeStageIndex, puzzleId: puzzle?.id });

  // Sync expanded stage when activeStageIndex changes or puzzle changes
  if (prevProps.stage !== activeStageIndex || prevProps.puzzleId !== puzzle?.id) {
    setPrevProps({ stage: activeStageIndex, puzzleId: puzzle?.id });
    setExpandedStage(activeStageIndex);
  }

  // Stages derived from puzzle definition or explicit props
  const stages = useMemo(() => {
    return customGuideStages || puzzle?.guideStages || [];
  }, [customGuideStages, puzzle]);

  // Extract all cases across all stages for Algopedia / Search
  const allCases = useMemo(() => {
    return stages.flatMap(s =>
      (s.cases || []).map(c => ({
        ...c,
        stageTitle: s.title || s.shortTitle || 'Tahap',
        stageId: s.id
      }))
    );
  }, [stages]);

  const filteredCases = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allCases;
    return allCases.filter(c =>
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.summary && c.summary.toLowerCase().includes(q)) ||
      (c.algorithm && c.algorithm.toLowerCase().includes(q)) ||
      (c.tips && c.tips.toLowerCase().includes(q))
    );
  }, [allCases, searchQuery]);

  // Check if puzzle is large NxN cube with centers/parity
  const isLargeNxN = puzzle?.order && puzzle.order >= 4;

  return (
    <aside className="w-80 lg:w-96 shrink-0 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800/80 flex flex-col h-full text-slate-200 z-20 shadow-2xl">
      {/* Sidebar Header & Tab Navigation */}
      <div className="p-4 border-b border-slate-800/80 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Panduan {puzzle?.shortName || puzzle?.name || 'Puzzle'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {puzzle?.beginnerMethod || (puzzle?.difficulty === 'beginner' ? 'Metode Pemula Lengkap' : 'Panduan Langkah demi Langkah')}
              </p>
            </div>
          </div>

          {/* Quick Highlight Filter for NxN */}
          {isLargeNxN && onHighlightModeChange && (
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg text-[10px] font-semibold">
              <button
                onClick={() => onHighlightModeChange('all')}
                className={`px-1.5 py-0.5 rounded ${highlightMode === 'all' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Semua potongan normal"
              >
                Semua
              </button>
              <button
                onClick={() => onHighlightModeChange('centers')}
                className={`px-1.5 py-0.5 rounded ${highlightMode === 'centers' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Sorot hanya blok pusat (centers)"
              >
                Pusat
              </button>
              <button
                onClick={() => onHighlightModeChange('edges')}
                className={`px-1.5 py-0.5 rounded ${highlightMode === 'edges' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Sorot hanya rusuk (edges)"
              >
                Rusuk
              </button>
              <button
                onClick={() => onHighlightModeChange('parity')}
                className={`px-1.5 py-0.5 rounded ${highlightMode === 'parity' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Sorot posisi sayap parity"
              >
                Parity
              </button>
            </div>
          )}
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'wizard'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Alur Belajar ({stages.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('algopedia')}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'algopedia'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Algopedia ({allCases.length})</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4 scrollbar-thin">
        {activeTab === 'wizard' ? (
          /* Mode 1: Step-by-Step Wizard */
          <div className="space-y-3">
            {stages.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Memuat panduan kurikulum untuk puzzle...
              </div>
            ) : (
              stages.map((stage, sIdx) => {
                const isExpanded = expandedStage === sIdx;
                const isCurrentActive = activeStageIndex === sIdx;

                return (
                  <div
                    key={stage.id || `stage-${sIdx}`}
                    className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                      isCurrentActive
                        ? 'border-sky-500/50 bg-sky-950/10 shadow-lg shadow-sky-500/5'
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                    }`}
                  >
                    {/* Stage Header Button */}
                    <button
                      onClick={() => {
                        setExpandedStage(isExpanded ? null : sIdx);
                        if (onSelectStage) onSelectStage(sIdx);
                      }}
                      className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-sky-400 border border-slate-700 flex items-center justify-center text-xs font-bold group-hover:border-sky-400 transition-colors shrink-0">
                          {sIdx + 1}
                        </span>
                        <div>
                          <h3 className="text-xs font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                            {stage.title}
                          </h3>
                          <span className="text-[10px] text-slate-400 line-clamp-1">
                            {stage.summary || stage.desc}
                          </span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {/* Stage Body Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 space-y-3">
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                          {stage.description || stage.desc || stage.summary}
                        </p>

                        {/* List of cases in this stage */}
                        <div className="space-y-2.5 pt-2">
                          <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
                            Kasus & Rumus Praktik:
                          </span>
                          {(stage.cases || []).map(cs => (
                            <div
                              key={cs.id}
                              className={`p-3 rounded-xl border transition-all ${
                                activeCaseId === cs.id
                                  ? 'bg-slate-800/90 border-sky-400 ring-1 ring-sky-400/50'
                                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <h4 className="text-xs font-bold text-slate-100">{cs.name}</h4>
                              </div>
                              <p className="text-[11px] text-slate-400 mb-2 leading-normal">
                                {cs.summary || cs.description}
                              </p>

                              {/* Algorithm Monospace Box */}
                              {cs.algorithm && (
                                <div className="bg-slate-900 border border-slate-700/80 rounded-lg p-2 font-mono text-xs font-bold text-amber-300 flex items-center justify-between gap-2 mb-2 overflow-x-auto scrollbar-thin">
                                  <span className="tracking-wide whitespace-nowrap">{cs.algorithm}</span>
                                </div>
                              )}

                              {cs.tips && (
                                <div className="flex items-start gap-1.5 text-[10px] text-emerald-400 mb-2.5 bg-emerald-950/20 p-1.5 rounded-lg border border-emerald-900/30">
                                  <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                  <span>{cs.tips}</span>
                                </div>
                              )}

                              {/* Action Button */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onApplyAlgorithm && onApplyAlgorithm(cs)}
                                  className="flex-1 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all"
                                >
                                  <Play className="w-3.5 h-3.5 fill-white" />
                                  <span>Terapkan ke 3D</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Mode 2: Algopedia / Kamus Cepat */
          <div className="space-y-3">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="algopedia-search"
                name="algopedia-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari rumus, kasus, istilah..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Quick Case List */}
            <div className="space-y-2.5">
              {filteredCases.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  Tidak ada rumus yang cocok dengan "{searchQuery}"
                </div>
              ) : (
                filteredCases.map(cs => (
                  <div
                    key={cs.id}
                    className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded-full border border-sky-800/40">
                        {cs.stageTitle.split('.')[1] || cs.stageTitle}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{cs.name}</h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      {cs.summary || cs.description}
                    </p>
                    
                    {cs.algorithm && (
                      <div className="bg-slate-900 border border-slate-700/80 rounded-lg p-2 font-mono text-xs font-bold text-amber-300 overflow-x-auto scrollbar-thin">
                        <span className="whitespace-nowrap">{cs.algorithm}</span>
                      </div>
                    )}

                    <button
                      onClick={() => onApplyAlgorithm && onApplyAlgorithm(cs)}
                      className="w-full py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Terapkan ke 3D</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
