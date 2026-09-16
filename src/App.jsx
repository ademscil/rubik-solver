import React, { useState, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Play } from 'lucide-react';
import RubikViewer from './components/RubikViewer';
import Header from './components/Header';
import PlaybackBar from './components/PlaybackBar';
import GuideSidebar from './components/GuideSidebar';
import CustomLayoutModal from './components/CustomLayoutModal';
import NotationModal from './components/NotationModal';
import PuzzleSelector from './components/PuzzleSelector';
import { puzzleRegistry } from './puzzles/registry.js';
import { parseAlgorithm as defaultParseAlg, getInverseMove as defaultGetInverse } from './cube/rubikNotation';
import { generateScramble as defaultScramble } from './cube/presets';

export default function App() {
  const cubeRef = useRef(null);

  // Active Puzzle State
  const [currentPuzzleId, setCurrentPuzzleId] = useState('cube-3x3');
  const [currentPuzzle, setCurrentPuzzle] = useState(null);

  // Scramble / Auto-Solver State
  const [isScrambled, setIsScrambled] = useState(false);

  // Viewport / Inspection States
  const [isInspectMode, setIsInspectMode] = useState(true);
  const [highlightMode, setHighlightMode] = useState('all');
  const [speed, setSpeed] = useState(1);

  // Timeline / Playback States
  const [activeMoves, setActiveMoves] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Modal States
  const [isPuzzleSelectorOpen, setIsPuzzleSelectorOpen] = useState(false);
  const [isNotationModalOpen, setIsNotationModalOpen] = useState(false);
  const [isCustomLayoutOpen, setIsCustomLayoutOpen] = useState(false);

  // Guide Selection State
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [activeCaseId, setActiveCaseId] = useState(null);

  // Refs for async animation loop synchronization
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentMoveIndexRef = useRef(currentMoveIndex);
  currentMoveIndexRef.current = currentMoveIndex;

  const activeMovesRef = useRef(activeMoves);
  activeMovesRef.current = activeMoves;

  // Handle switching to a different puzzle seamlessly without page reload
  const handleSelectPuzzle = useCallback(async (puzzleId) => {
    setIsPuzzleSelectorOpen(false);
    setIsPlaying(false);
    setActiveMoves([]);
    setCurrentMoveIndex(0);
    setActiveCaseId(null);
    setActiveStageIndex(0);

    try {
      const def = await puzzleRegistry.load(puzzleId);
      setCurrentPuzzleId(def.id || puzzleId);
      setCurrentPuzzle(def);

      // Select first available guide case if present
      if (def.guideStages && def.guideStages.length > 0 && def.guideStages[0].cases && def.guideStages[0].cases[0]) {
        const firstCase = def.guideStages[0].cases[0];
        setActiveCaseId(firstCase.id);
        const parseFn = def.parseAlgorithm || defaultParseAlg;
        const moves = parseFn(firstCase.algorithm || firstCase.moves || '');
        setActiveMoves(moves);
      }
    } catch (err) {
      console.error('Failed to load puzzle definition:', err);
    }
  }, []);

  // Initial load: load default 3x3 Rubik's Cube
  useEffect(() => {
    handleSelectPuzzle('cube-3x3');
  }, [handleSelectPuzzle]);

  // Callback triggered when Three.js animation finishes 1 move
  const handleMoveComplete = useCallback((finishedMove) => {
    if (isPlayingRef.current) {
      const nextIdx = currentMoveIndexRef.current + 1;
      const total = activeMovesRef.current.length;

      if (nextIdx < total) {
        setCurrentMoveIndex(nextIdx);
        // Play next move in sequence
        const nextMove = activeMovesRef.current[nextIdx];
        if (cubeRef.current && nextMove) {
          cubeRef.current.makeMove(nextMove, handleMoveComplete);
        }
      } else {
        // Algorithm completed
        setCurrentMoveIndex(total);
        setIsPlaying(false);
        setIsScrambled(false);
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
  const handlePlayToggle = useCallback(() => {
    if (activeMoves.length === 0) return;

    if (isPlaying) {
      setIsPlaying(false);
    } else {
      let startIdx = currentMoveIndex;
      if (startIdx >= activeMoves.length) {
        startIdx = 0;
        setCurrentMoveIndex(0);
      }
      setIsPlaying(true);

      const move = activeMoves[startIdx];
      if (cubeRef.current && move) {
        cubeRef.current.makeMove(move, handleMoveComplete);
      }
    }
  }, [activeMoves, isPlaying, currentMoveIndex, handleMoveComplete]);

  // Step Next (1 move forward)
  const handleStepNext = useCallback(() => {
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
  }, [currentMoveIndex, activeMoves]);

  // Step Prev (1 move backward using inverse)
  const handleStepPrev = useCallback(() => {
    if (currentMoveIndex <= 0) return;
    if (cubeRef.current?.isBusy()) return;

    const prevMove = activeMoves[currentMoveIndex - 1];
    const inverseFn = currentPuzzle?.getInverseMove || defaultGetInverse;
    const inverse = inverseFn(prevMove);
    if (cubeRef.current && inverse) {
      cubeRef.current.makeMove(inverse, () => {
        setCurrentMoveIndex(currentMoveIndex - 1);
      });
    }
  }, [currentMoveIndex, activeMoves, currentPuzzle]);

  // Reset timeline playback
  const handleResetTimeline = useCallback(() => {
    setIsPlaying(false);
    setCurrentMoveIndex(0);
    if (cubeRef.current) {
      cubeRef.current.resetCube();
    }
  }, []);

  // Apply algorithm from GuideSidebar
  const handleApplyAlgorithm = useCallback((caseItem) => {
    setIsPlaying(false);
    setActiveCaseId(caseItem.id);

    const parseFn = currentPuzzle?.parseAlgorithm || defaultParseAlg;
    const moves = parseFn(caseItem.algorithm || caseItem.moves || '');
    setActiveMoves(moves);
    setCurrentMoveIndex(0);

    if (cubeRef.current) {
      cubeRef.current.resetCube();
    }

    if (caseItem.id?.startsWith('c-')) {
      setHighlightMode('centers');
    } else if (caseItem.id?.startsWith('e-')) {
      setHighlightMode('edges');
    } else if (caseItem.id?.startsWith('p-')) {
      setHighlightMode('parity');
    } else {
      setHighlightMode('all');
    }
  }, [currentPuzzle]);

  // Apply preset case
  const handleApplyPreset = useCallback((preset) => {
    setIsPlaying(false);
    if (cubeRef.current) {
      cubeRef.current.resetCube();
    }

    const parseFn = currentPuzzle?.parseAlgorithm || defaultParseAlg;
    const solutionAlg = preset.solutionMoves || preset.algorithm;
    if (solutionAlg) {
      const moves = parseFn(solutionAlg);
      setActiveMoves(moves);
      setCurrentMoveIndex(0);
    } else {
      setActiveMoves([]);
      setCurrentMoveIndex(0);
    }

    if (preset.setupMoves && cubeRef.current) {
      const setupMoves = parseFn(preset.setupMoves);
      setupMoves.forEach(m => {
        cubeRef.current.makeMove(m);
      });
    }

    if (preset.stage === 'centers') setHighlightMode('centers');
    else if (preset.stage === 'edges') setHighlightMode('edges');
    else if (preset.stage === 'parity') setHighlightMode('parity');
    else setHighlightMode('all');
  }, [currentPuzzle]);

  // Scramble puzzle with automatic step-by-step solution preparation
  const handleScramble = useCallback(() => {
    setIsPlaying(false);
    if (cubeRef.current) {
      cubeRef.current.resetCube();
      const scrambleFn = currentPuzzle?.generateScramble || defaultScramble;
      const parseFn = currentPuzzle?.parseAlgorithm || defaultParseAlg;
      const getInverseFn = currentPuzzle?.getInverseMove || defaultGetInverse;

      const scrambleLength = currentPuzzle?.category === 'shape' ? 12 : 20;
      const scrambleStr = scrambleFn(scrambleLength);
      const scrambleMoves = parseFn(scrambleStr);

      // Compute step-by-step resolution algorithm (inverse sequence)
      const solutionMoves = [...scrambleMoves].reverse().map(m => getInverseFn(m));

      // Apply scramble sequence to 3D cube model
      scrambleMoves.forEach(m => cubeRef.current.makeMove(m));

      // Populate solution into timeline for instant step-by-step solver readiness
      setIsScrambled(true);
      setActiveMoves(solutionMoves);
      setCurrentMoveIndex(0);
      setActiveCaseId('auto-solve-step-by-step');
    }
  }, [currentPuzzle]);

  // Step-by-Step Solver: Plays or steps through resolution
  const handleSolveStepByStep = useCallback(() => {
    if (activeMoves.length === 0) {
      handleScramble();
      return;
    }

    if (!isPlaying) {
      let startIdx = currentMoveIndex;
      if (startIdx >= activeMoves.length) {
        startIdx = 0;
        setCurrentMoveIndex(0);
      }
      setIsPlaying(true);
      const move = activeMoves[startIdx];
      if (cubeRef.current && move) {
        cubeRef.current.makeMove(move, handleMoveComplete);
      }
    } else {
      setIsPlaying(false);
    }
  }, [activeMoves, currentMoveIndex, isPlaying, handleMoveComplete, handleScramble]);

  // Reset puzzle to solved state
  const handleResetCube = useCallback(() => {
    setIsPlaying(false);
    setIsScrambled(false);
    setActiveMoves([]);
    setCurrentMoveIndex(0);
    setActiveCaseId(null);
    setHighlightMode('all');
    if (cubeRef.current) {
      cubeRef.current.resetCube();
      cubeRef.current.resetCamera('isometric');
    }
  }, []);

  // Quick manual move
  const handleQuickMove = useCallback((moveStr) => {
    if (cubeRef.current) {
      cubeRef.current.makeMove(moveStr);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Navigation Header */}
      <Header
        puzzle={currentPuzzle}
        isInspectMode={isInspectMode}
        onToggleInspectMode={() => setIsInspectMode(!isInspectMode)}
        onOpenPuzzleSelector={() => setIsPuzzleSelectorOpen(true)}
        onScramble={handleScramble}
        onSolve={handleSolveStepByStep}
        isScrambled={isScrambled}
        onResetCube={handleResetCube}
        onOpenNotationModal={() => setIsNotationModalOpen(true)}
        onOpenCustomLayout={() => setIsCustomLayoutOpen(true)}
        onQuickMove={handleQuickMove}
      />

      {/* Main Content: 3D Viewport + Guide Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row relative min-h-0 min-w-0 overflow-hidden">
        {/* 3D Viewport Container */}
        <main className="flex-1 relative flex flex-col min-h-0 min-w-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
          {/* Quick Solve Floating Banner when Puzzle is Scrambled */}
          {isScrambled && (
            <div className="absolute top-16 left-4 z-20 flex items-center justify-between gap-3 bg-slate-900/95 border border-emerald-500/50 backdrop-blur-md rounded-2xl px-4 py-2 shadow-xl shadow-emerald-950/40">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Puzzle Diacak</span>
                    <span className="text-[10px] bg-emerald-500/25 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
                      {activeMoves.length} langkah
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Siap diselesaikan langkah demi langkah
                  </div>
                </div>
              </div>
              <button
                onClick={handleSolveStepByStep}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isPlaying ? 'Jeda' : 'Selesaikan'}</span>
              </button>
            </div>
          )}

          <RubikViewer
            ref={cubeRef}
            puzzle={currentPuzzle}
            isInspectMode={isInspectMode}
            animationSpeed={speed}
            highlightMode={highlightMode}
            onMoveComplete={handleMoveComplete}
          />

          {/* Bottom Playback Timeline */}
          <PlaybackBar
            puzzle={currentPuzzle}
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
          puzzle={currentPuzzle}
          activeStageIndex={activeStageIndex}
          onSelectStage={setActiveStageIndex}
          onApplyAlgorithm={handleApplyAlgorithm}
          onLoadPresetCase={handleApplyPreset}
          activeCaseId={activeCaseId}
          highlightMode={highlightMode}
          onHighlightModeChange={setHighlightMode}
        />
      </div>

      {/* Universal Puzzle Selector Modal */}
      <PuzzleSelector
        isOpen={isPuzzleSelectorOpen}
        onClose={() => setIsPuzzleSelectorOpen(false)}
        currentPuzzleId={currentPuzzleId}
        onSelectPuzzle={handleSelectPuzzle}
      />

      {/* Custom Layout & Presets Modal */}
      <CustomLayoutModal
        puzzle={currentPuzzle}
        isOpen={isCustomLayoutOpen}
        onClose={() => setIsCustomLayoutOpen(false)}
        onApplyLayout={(netState) => {
          if (cubeRef.current) {
            cubeRef.current.loadFullLayout(netState);
          }
        }}
        onApplyPreset={handleApplyPreset}
      />

      {/* Notation Modal */}
      <NotationModal
        puzzle={currentPuzzle}
        isOpen={isNotationModalOpen}
        onClose={() => setIsNotationModalOpen(false)}
        onTestMove={handleQuickMove}
      />
    </div>
  );
}
