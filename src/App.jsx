import React, { useState, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import RubikViewer from './components/RubikViewer';
import Header from './components/Header';
import PlaybackBar from './components/PlaybackBar';
import GuideSidebar from './components/GuideSidebar';
import CustomLayoutModal from './components/CustomLayoutModal';
import NotationModal from './components/NotationModal';
import { parseAlgorithm, getInverseMove } from './cube/rubikNotation';
import { generateScramble, POPULAR_PRESETS } from './cube/presets';
import { GUIDE_STAGES } from './data/guideStages';

export default function App() {
  const cubeRef = useRef(null);

  // States
  const [isInspectMode, setIsInspectMode] = useState(true);
  const [highlightMode, setHighlightMode] = useState('all');
  const [speed, setSpeed] = useState(1);

  // Timeline / Playback States
  const [activeMoves, setActiveMoves] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Modal States
  const [isNotationModalOpen, setIsNotationModalOpen] = useState(false);
  const [isCustomLayoutOpen, setIsCustomLayoutOpen] = useState(false);

  // Guide Selection State
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [activeCaseId, setActiveCaseId] = useState(null);

  // Refs untuk sinkronisasi async playback
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentMoveIndexRef = useRef(currentMoveIndex);
  currentMoveIndexRef.current = currentMoveIndex;

  const activeMovesRef = useRef(activeMoves);
  activeMovesRef.current = activeMoves;

  // Inisialisasi: muat kasus OLL Parity sebagai contoh awal yang menarik
  useEffect(() => {
    const defaultCase = GUIDE_STAGES[4].cases[0]; // OLL Parity
    if (defaultCase) {
      handleApplyAlgorithm(defaultCase);
    }
  }, []);

  // Callback saat 1 move Three.js selesai
  const handleMoveComplete = useCallback((finishedMove) => {
    if (isPlayingRef.current) {
      const nextIdx = currentMoveIndexRef.current + 1;
      const total = activeMovesRef.current.length;

      if (nextIdx < total) {
        setCurrentMoveIndex(nextIdx);
        // Putar langkah berikutnya
        const nextMove = activeMovesRef.current[nextIdx];
        if (cubeRef.current && nextMove) {
          cubeRef.current.makeMove(nextMove, handleMoveComplete);
        }
      } else {
        // Semua gerakan selesai!
        setCurrentMoveIndex(total);
        setIsPlaying(false);
        try {
          confetti({
            particleCount: 75,
            spread: 60,
            origin: { y: 0.7 }
          });
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  // Toggle Play / Pause
  const handlePlayToggle = () => {
    if (activeMoves.length === 0) return;

    if (isPlaying) {
      setIsPlaying(false);
    } else {
      let startIdx = currentMoveIndex;
      if (startIdx >= activeMoves.length) {
        // Jika sudah di akhir, ulangi dari awal
        startIdx = 0;
        setCurrentMoveIndex(0);
      }
      setIsPlaying(true);

      const move = activeMoves[startIdx];
      if (cubeRef.current && move) {
        cubeRef.current.makeMove(move, handleMoveComplete);
      }
    }
  };

  // Step Next (Maju 1 langkah)
  const handleStepNext = () => {
    if (currentMoveIndex >= activeMoves.length) return;
    if (cubeRef.current?.isBusy()) return;

    const move = activeMoves[currentMoveIndex];
    if (cubeRef.current && move) {
      cubeRef.current.makeMove(move, () => {
        const nextIdx = currentMoveIndex + 1;
        setCurrentMoveIndex(nextIdx);
        if (nextIdx === activeMoves.length) {
          try {
            confetti({ particleCount: 50, spread: 50, origin: { y: 0.8 } });
          } catch (e) {}
        }
      });
    }
  };

  // Step Prev (Mundur 1 langkah)
  const handleStepPrev = () => {
    if (currentMoveIndex <= 0) return;
    if (cubeRef.current?.isBusy()) return;

    const prevMove = activeMoves[currentMoveIndex - 1];
    const inverse = getInverseMove(prevMove);
    if (cubeRef.current && inverse) {
      cubeRef.current.makeMove(inverse, () => {
        setCurrentMoveIndex(currentMoveIndex - 1);
      });
    }
  };

  // Reset Algoritma
  const handleResetTimeline = () => {
    setIsPlaying(false);
    setCurrentMoveIndex(0);
    if (cubeRef.current) {
      cubeRef.current.resetCube();
    }
  };

  // Terapkan Rumus dari Panduan
  const handleApplyAlgorithm = (caseItem) => {
    setIsPlaying(false);
    setActiveCaseId(caseItem.id);

    const moves = parseAlgorithm(caseItem.algorithm || caseItem.moves);
    setActiveMoves(moves);
    setCurrentMoveIndex(0);

    // Otomatis ubah mode highlight sesuai tahap
    if (caseItem.id.startsWith('c-')) {
      setHighlightMode('centers');
    } else if (caseItem.id.startsWith('e-')) {
      setHighlightMode('edges');
    } else if (caseItem.id.startsWith('p-')) {
      setHighlightMode('parity');
    } else {
      setHighlightMode('all');
    }
  };

  // Terapkan Preset Kasus Macet
  const handleApplyPreset = (preset) => {
    setIsPlaying(false);
    if (cubeRef.current) {
      cubeRef.current.resetCube();
    }

    if (preset.solutionMoves) {
      const moves = parseAlgorithm(preset.solutionMoves);
      setActiveMoves(moves);
      setCurrentMoveIndex(0);
    }

    // Jalankan setup moves jika ada
    if (preset.setupMoves && cubeRef.current) {
      const setupMoves = parseAlgorithm(preset.setupMoves);
      setupMoves.forEach(m => {
        cubeRef.current.makeMove(m);
      });
    }

    if (preset.stage === 'centers') setHighlightMode('centers');
    else if (preset.stage === 'edges') setHighlightMode('edges');
    else if (preset.stage === 'parity') setHighlightMode('parity');
    else setHighlightMode('all');
  };

  // Acak Kubus (Scramble)
  const handleScramble = () => {
    setIsPlaying(false);
    if (cubeRef.current) {
      cubeRef.current.resetCube();
      const scramble = generateScramble(30);
      const moves = parseAlgorithm(scramble);
      // Eksekusi scramble
      moves.forEach(m => cubeRef.current.makeMove(m));
      setActiveMoves([]);
      setCurrentMoveIndex(0);
    }
  };

  // Reset Kubus ke Solved
  const handleResetCube = () => {
    setIsPlaying(false);
    setActiveMoves([]);
    setCurrentMoveIndex(0);
    setHighlightMode('all');
    if (cubeRef.current) {
      cubeRef.current.resetCube();
      cubeRef.current.resetCamera('isometric');
    }
  };

  // Putar Manual via Tombol
  const handleQuickMove = (moveStr) => {
    if (cubeRef.current) {
      cubeRef.current.makeMove(moveStr);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Navigation Header */}
      <Header
        isInspectMode={isInspectMode}
        onToggleInspectMode={() => setIsInspectMode(!isInspectMode)}
        onScramble={handleScramble}
        onResetCube={handleResetCube}
        onOpenNotationModal={() => setIsNotationModalOpen(true)}
        onOpenCustomLayout={() => setIsCustomLayoutOpen(true)}
        onQuickMove={handleQuickMove}
      />

      {/* Main Content: 3D Viewport + Guide Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        {/* 3D Viewport Container */}
        <main className="flex-1 relative flex flex-col min-h-0 min-w-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          <RubikViewer
            ref={cubeRef}
            isInspectMode={isInspectMode}
            animationSpeed={speed}
            highlightMode={highlightMode}
            onMoveComplete={handleMoveComplete}
          />

          {/* Bottom Playback Timeline */}
          <PlaybackBar
            moves={activeMoves}
            currentMoveIndex={currentMoveIndex}
            isPlaying={isPlaying}
            speed={speed}
            onPlayToggle={handlePlayToggle}
            onStepNext={handleStepNext}
            onStepPrev={handleStepPrev}
            onReset={handleResetTimeline}
            onSpeedChange={setSpeed}
            onSelectMoveIndex={(idx) => setCurrentMoveIndex(idx)}
          />
        </main>

        {/* Right Guide Sidebar */}
        <GuideSidebar
          activeStageIndex={activeStageIndex}
          onSelectStage={setActiveStageIndex}
          onApplyAlgorithm={handleApplyAlgorithm}
          onLoadPresetCase={handleApplyPreset}
          activeCaseId={activeCaseId}
          highlightMode={highlightMode}
          onHighlightModeChange={setHighlightMode}
        />
      </div>

      {/* Modals */}
      <CustomLayoutModal
        isOpen={isCustomLayoutOpen}
        onClose={() => setIsCustomLayoutOpen(false)}
        onApplyLayout={(netState) => {
          if (cubeRef.current) {
            cubeRef.current.loadFullLayout(netState);
          }
        }}
        onApplyPreset={handleApplyPreset}
      />

      <NotationModal
        isOpen={isNotationModalOpen}
        onClose={() => setIsNotationModalOpen(false)}
        onTestMove={handleQuickMove}
      />
    </div>
  );
}
