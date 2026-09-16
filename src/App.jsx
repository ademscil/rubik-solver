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
import { parseAlgorithm as defaultParseAlg, getInverseMove as defaultGetInverse } from './cube/rubikNotation.js';
import { generateScramble as defaultScramble } from './cube/presets.js';
import {
  getPedagogicalSolutionForPuzzle,
  partitionMovesIntoStages,
  generatePedagogical5x5Solution
} from './solvers/solverStages.js';
import { getActiveStageInfo } from './solvers/lbl3x3Solver.js';
import { solve3x3FromModel } from './solvers/cube3x3StateSolver.js';

export default function App() {
  const cubeRef = useRef(null);

  // Active Puzzle State
  const [currentPuzzleId, setCurrentPuzzleId] = useState('cube-3x3');
  const [currentPuzzle, setCurrentPuzzle] = useState(null);

  // Scramble / Auto-Solver State
  const [isScrambled, setIsScrambled] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);
  const [scrambleHistory, setScrambleHistory] = useState([]);
  const scrambleHistoryRef = useRef([]);
  scrambleHistoryRef.current = scrambleHistory;

  // Viewport / Inspection States
  const [isInspectMode, setIsInspectMode] = useState(true);
  const [highlightMode, setHighlightMode] = useState('all');
  const [speed, setSpeed] = useState(1);

  // Timeline / Playback States
  const [activeMoves, setActiveMoves] = useState([]);
  const [solutionStages, setSolutionStages] = useState([]);
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
    isPlayingRef.current = false;
    setIsScrambled(false);
    setScrambleHistory([]);
    scrambleHistoryRef.current = [];
    setActiveMoves([]);
    setSolutionStages([]);
    setCurrentMoveIndex(0);
    currentMoveIndexRef.current = 0;
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

      currentMoveIndexRef.current = nextIdx;
      setCurrentMoveIndex(nextIdx);

      if (nextIdx < total) {
        // Play next move in sequence
        const nextMove = activeMovesRef.current[nextIdx];
        if (cubeRef.current && nextMove) {
          cubeRef.current.makeMove(nextMove, handleMoveComplete);
        }
      } else {
        // Algorithm / Solution fully completed!
        currentMoveIndexRef.current = total;
        setCurrentMoveIndex(total);
        setIsPlaying(false);
        isPlayingRef.current = false;
        setIsScrambled(false);
        setScrambleHistory([]);
        scrambleHistoryRef.current = [];
        setHighlightMode('all');
        if (cubeRef.current) {
          cubeRef.current.resetCube();
        }
        if (total > 0 && currentMoveIndexRef.current === total) {
          try {
            confetti({
              particleCount: 85,
              spread: 65,
              origin: { y: 0.7 }
            });
          } catch (e) {
            // ignore
          }
        }
      }
    }
  }, []);

  // Toggle Play / Pause
  const handlePlayToggle = useCallback(() => {
    if (activeMoves.length === 0) return;

    if (isPlaying) {
      setIsPlaying(false);
      isPlayingRef.current = false;
    } else {
      let startIdx = currentMoveIndex;
      if (startIdx >= activeMoves.length) {
        if (cubeRef.current && scrambleHistoryRef.current.length > 0) {
          cubeRef.current.resetCube();
          cubeRef.current.applyMovesInstant(scrambleHistoryRef.current);
        }
        startIdx = 0;
        setCurrentMoveIndex(0);
        currentMoveIndexRef.current = 0;
      }
      setIsPlaying(true);
      isPlayingRef.current = true;

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
        currentMoveIndexRef.current = nextIdx;
        setCurrentMoveIndex(nextIdx);
        if (nextIdx === activeMoves.length) {
          setIsScrambled(false);
          setScrambleHistory([]);
          scrambleHistoryRef.current = [];
          setHighlightMode('all');
          if (cubeRef.current) {
            cubeRef.current.resetCube();
          }
          try {
            confetti({ particleCount: 60, spread: 55, origin: { y: 0.75 } });
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
        const prevIdx = currentMoveIndex - 1;
        currentMoveIndexRef.current = prevIdx;
        setCurrentMoveIndex(prevIdx);
        setIsScrambled(true);
      });
    }
  }, [currentMoveIndex, activeMoves, currentPuzzle]);

  // Reset timeline playback
  const handleResetTimeline = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentMoveIndex(0);
    currentMoveIndexRef.current = 0;
    if (cubeRef.current) {
      cubeRef.current.resetCube();
      if (scrambleHistoryRef.current.length > 0) {
        cubeRef.current.applyMovesInstant(scrambleHistoryRef.current);
      }
    }
  }, []);

  // Jump to specific step in timeline
  const handleSelectMoveIndex = useCallback((targetIdx) => {
    if (cubeRef.current?.isBusy() || isPlaying) return;
    if (targetIdx < 0 || targetIdx > activeMoves.length) return;

    if (scrambleHistoryRef.current.length > 0 && cubeRef.current) {
      cubeRef.current.resetCube();
      cubeRef.current.applyMovesInstant(scrambleHistoryRef.current);
      const movesToApply = activeMoves.slice(0, targetIdx);
      if (movesToApply.length > 0) {
        cubeRef.current.applyMovesInstant(movesToApply);
      }
      setCurrentMoveIndex(targetIdx);
      currentMoveIndexRef.current = targetIdx;
      if (targetIdx === activeMoves.length) {
        setIsScrambled(false);
        setHighlightMode('all');
        if (cubeRef.current) {
          cubeRef.current.resetCube();
        }
      } else {
        setIsScrambled(true);
      }
    } else {
      setCurrentMoveIndex(targetIdx);
      currentMoveIndexRef.current = targetIdx;
      if (targetIdx === activeMoves.length) {
        setIsScrambled(false);
        setHighlightMode('all');
        if (cubeRef.current) {
          cubeRef.current.resetCube();
        }
      }
    }
  }, [isPlaying, activeMoves]);

  // Apply algorithm from GuideSidebar
  const handleApplyAlgorithm = useCallback((caseItem) => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    setIsScrambled(false);
    setScrambleHistory([]);
    scrambleHistoryRef.current = [];
    setActiveCaseId(caseItem.id);

    const parseFn = currentPuzzle?.parseAlgorithm || defaultParseAlg;
    const moves = parseFn(caseItem.algorithm || caseItem.moves || '');
    setActiveMoves(moves);
    setCurrentMoveIndex(0);
    currentMoveIndexRef.current = 0;

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
    isPlayingRef.current = false;
    setScrambleHistory([]);
    scrambleHistoryRef.current = [];
    if (cubeRef.current) {
      cubeRef.current.resetCube();
    }

    const parseFn = currentPuzzle?.parseAlgorithm || defaultParseAlg;
    const solutionAlg = preset.solutionMoves || preset.algorithm;
    let moves = solutionAlg ? parseFn(solutionAlg) : [];

    if (preset.setupMoves && cubeRef.current) {
      const setupMoves = parseFn(preset.setupMoves);
      cubeRef.current.applyMovesInstant(setupMoves);
      setScrambleHistory(setupMoves);
      scrambleHistoryRef.current = setupMoves;
    }

    let stages = [];
    if (currentPuzzleId === 'cube-5x5' && preset.id === 'full-reduction-5x5') {
      const pedagogical = generatePedagogical5x5Solution();
      moves = pedagogical.solutionMoves;
      stages = pedagogical.stages;
      if (cubeRef.current) {
        cubeRef.current.resetCube();
        cubeRef.current.applyMovesInstant(pedagogical.scrambleMoves);
        setScrambleHistory(pedagogical.scrambleMoves);
        scrambleHistoryRef.current = pedagogical.scrambleMoves;
      }
    } else if (moves.length > 0) {
      stages = partitionMovesIntoStages(currentPuzzleId, moves);
    }

    activeMovesRef.current = moves;
    setActiveMoves(moves);
    setSolutionStages(stages);
    setCurrentMoveIndex(0);
    currentMoveIndexRef.current = 0;
    setIsScrambled(moves.length > 0);
    setActiveCaseId(preset.id || 'preset-case');

    if (preset.stage === 'centers') setHighlightMode('centers');
    else if (preset.stage === 'edges') setHighlightMode('edges');
    else if (preset.stage === 'parity') setHighlightMode('parity');
    else setHighlightMode('all');
  }, [currentPuzzle, currentPuzzleId]);

  // Scramble puzzle with animated fast sequence and automatic step-by-step pedagogical solution
  const handleScramble = useCallback(() => {
    if (isScrambling || isPlaying || cubeRef.current?.isBusy()) return;

    setIsPlaying(false);
    isPlayingRef.current = false;
    if (!cubeRef.current) return;

    cubeRef.current.resetCube();

    let scrambleMoves = [];
    let solutionMoves = [];
    let stages = [];

    const pedagogical = getPedagogicalSolutionForPuzzle(currentPuzzleId);
    if (pedagogical) {
      scrambleMoves = pedagogical.scrambleMoves;
      solutionMoves = pedagogical.solutionMoves;
      stages = pedagogical.stages;
    } else {
      const scrambleFn = currentPuzzle?.generateScramble || defaultScramble;
      const parseFn = currentPuzzle?.parseAlgorithm || defaultParseAlg;
      const getInverseFn = currentPuzzle?.getInverseMove || defaultGetInverse;

      const scrambleLength = currentPuzzle?.category === 'shape' ? 12 : 20;
      const scrambleStr = scrambleFn(scrambleLength);
      scrambleMoves = parseFn(scrambleStr);
      solutionMoves = [...scrambleMoves].reverse().map(m => getInverseFn(m));
      stages = partitionMovesIntoStages(currentPuzzleId, solutionMoves);
    }

    // Number of animated moves to show in rapid visual sequence (~1 second)
    const animCount = Math.min(14, scrambleMoves.length);
    const animMoves = scrambleMoves.slice(0, animCount);
    const remainingMoves = scrambleMoves.slice(animCount);

    setIsScrambling(true);
    setIsScrambled(false);
    setActiveMoves([]);
    setCurrentMoveIndex(0);

    // Run rapid visual scramble animation (75ms per move)
    cubeRef.current.animateSequence(animMoves, 75, () => {
      // Apply any remaining scramble moves instantly so the cube is at the exact scrambled state
      if (remainingMoves.length > 0 && cubeRef.current) {
        cubeRef.current.applyMovesInstant(remainingMoves);
      }
      setIsScrambling(false);
      setScrambleHistory(scrambleMoves);
      scrambleHistoryRef.current = scrambleMoves;
      setIsScrambled(true);
      setActiveMoves(solutionMoves);
      setSolutionStages(stages);
      setCurrentMoveIndex(0);
      currentMoveIndexRef.current = 0;
      setActiveCaseId('auto-solve-step-by-step');
    });
  }, [currentPuzzle, currentPuzzleId, isScrambling, isPlaying]);

  // Step-by-Step Solver: Plays or steps through resolution
  const handleSolveStepByStep = useCallback(() => {
    if (!isScrambled || activeMoves.length === 0) {
      if (currentPuzzleId === 'cube-3x3' && cubeRef.current?.getModel) {
        const stateSolution = solve3x3FromModel(cubeRef.current.getModel());
        if (stateSolution && stateSolution.solutionMoves.length > 0) {
          activeMovesRef.current = stateSolution.solutionMoves;
          setActiveMoves(stateSolution.solutionMoves);
          setSolutionStages(stateSolution.stages);
          setCurrentMoveIndex(0);
          currentMoveIndexRef.current = 0;
          setIsScrambled(true);
          setIsPlaying(true);
          isPlayingRef.current = true;
          cubeRef.current.makeMove(stateSolution.solutionMoves[0], handleMoveComplete);
          return;
        }
      }

      // Load full pedagogical solution for 5x5 or other puzzles
      const pedagogical = getPedagogicalSolutionForPuzzle(currentPuzzleId);
      if (pedagogical && pedagogical.solutionMoves?.length > 0) {
        activeMovesRef.current = pedagogical.solutionMoves;
        setActiveMoves(pedagogical.solutionMoves);
        setSolutionStages(pedagogical.stages);
        setCurrentMoveIndex(0);
        currentMoveIndexRef.current = 0;
        setIsScrambled(true);
        setIsPlaying(true);
        isPlayingRef.current = true;
        cubeRef.current.makeMove(pedagogical.solutionMoves[0], handleMoveComplete);
        return;
      }

      handleScramble();
      return;
    }

    if (!isPlaying) {
      let startIdx = currentMoveIndex;
      if (startIdx >= activeMoves.length) {
        if (cubeRef.current && scrambleHistoryRef.current.length > 0) {
          cubeRef.current.resetCube();
          cubeRef.current.applyMovesInstant(scrambleHistoryRef.current);
        }
        startIdx = 0;
        setCurrentMoveIndex(0);
        currentMoveIndexRef.current = 0;
      }
      setIsPlaying(true);
      isPlayingRef.current = true;
      const move = activeMoves[startIdx];
      if (cubeRef.current && move) {
        cubeRef.current.makeMove(move, handleMoveComplete);
      }
    } else {
      setIsPlaying(false);
      isPlayingRef.current = false;
    }
  }, [activeMoves, currentMoveIndex, isPlaying, isScrambled, handleMoveComplete, handleScramble, currentPuzzleId]);

  // Reset puzzle to solved state
  const handleResetCube = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    setIsScrambled(false);
    setScrambleHistory([]);
    scrambleHistoryRef.current = [];
    setActiveMoves([]);
    setSolutionStages([]);
    setCurrentMoveIndex(0);
    currentMoveIndexRef.current = 0;
    setActiveCaseId(null);
    setHighlightMode('all');
    if (cubeRef.current) {
      cubeRef.current.resetCube();
      cubeRef.current.resetCamera('isometric');
    }
  }, []);

  // Quick manual move - automatically tracks move into scramble history and updates solution
  const handleQuickMove = useCallback((moveStr) => {
    if (!cubeRef.current || !moveStr) return;
    setIsPlaying(false);
    isPlayingRef.current = false;

    cubeRef.current.makeMove(moveStr, () => {
      setScrambleHistory((prev) => {
        const next = [...prev, moveStr];
        scrambleHistoryRef.current = next;

        // 1. Try algorithmic state-based CFOP/LBL solver first (for 3x3)
        let solutionMoves = null;
        let stages = null;

        if (currentPuzzleId === 'cube-3x3' && cubeRef.current?.getModel) {
          const stateSolution = solve3x3FromModel(cubeRef.current.getModel());
          if (stateSolution) {
            solutionMoves = stateSolution.solutionMoves;
            stages = stateSolution.stages;
          }
        }

        // 2. Fallback for other puzzles
        if (!solutionMoves) {
          const getInverseFn = currentPuzzle?.getInverseMove || defaultGetInverse;
          solutionMoves = [...next].reverse().map((m) => getInverseFn(m));
          stages = partitionMovesIntoStages(currentPuzzleId, solutionMoves);
        }

        activeMovesRef.current = solutionMoves;
        setActiveMoves(solutionMoves);
        setSolutionStages(stages);
        setCurrentMoveIndex(0);
        currentMoveIndexRef.current = 0;
        setIsScrambled(solutionMoves.length > 0);
        setActiveCaseId('manual-scramble-step-by-step');
        return next;
      });
    });
  }, [currentPuzzle, currentPuzzleId]);

  // Keyboard Shortcuts (Space: Play/Pause, Arrows: Step Prev/Next, R/L/U/D/F/B: Quick moves)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable) {
        return;
      }
      if (isPuzzleSelectorOpen || isNotationModalOpen || isCustomLayoutOpen) {
        if (e.key === 'Escape') {
          setIsPuzzleSelectorOpen(false);
          setIsNotationModalOpen(false);
          setIsCustomLayoutOpen(false);
        }
        return;
      }

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (isScrambled || activeMoves.length > 0) {
          handlePlayToggle();
        } else {
          handleSolveStepByStep();
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleStepNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleStepPrev();
      } else {
        const key = e.key.toUpperCase();
        if (['R', 'L', 'U', 'D', 'F', 'B'].includes(key)) {
          const move = e.shiftKey ? `${key}'` : key;
          handleQuickMove(move);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isScrambled,
    activeMoves.length,
    handlePlayToggle,
    handleSolveStepByStep,
    handleStepNext,
    handleStepPrev,
    handleQuickMove,
    isPuzzleSelectorOpen,
    isNotationModalOpen,
    isCustomLayoutOpen
  ]);

  const currentActiveStage = getActiveStageInfo(solutionStages, currentMoveIndex);

  const orientationHint = currentPuzzleId === 'pyraminx'
    ? 'Pegang: Kuning di dasar, Merah di depan'
    : currentPuzzleId === 'square-1'
    ? 'Pegang: Kuning di atas, Merah di depan'
    : currentPuzzleId === 'windmill'
    ? 'Pegang: Putih di atas, Hijau di depan (Perhatikan kemiringan center)'
    : 'Pegang: Putih/Kuning di atas (U), Hijau di depan (F)';

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Navigation Header */}
      <Header
        puzzle={currentPuzzle}
        currentPuzzleId={currentPuzzleId}
        onSelectPuzzle={handleSelectPuzzle}
        isInspectMode={isInspectMode}
        onToggleInspectMode={() => setIsInspectMode(!isInspectMode)}
        onOpenPuzzleSelector={() => setIsPuzzleSelectorOpen(true)}
        onScramble={handleScramble}
        onSolve={handleSolveStepByStep}
        isScrambled={isScrambled}
        isScrambling={isScrambling}
        onResetCube={handleResetCube}
        onOpenNotationModal={() => setIsNotationModalOpen(true)}
        onOpenCustomLayout={() => setIsCustomLayoutOpen(true)}
        onQuickMove={handleQuickMove}
      />

      {/* Main Content: 3D Viewport + Guide Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row relative min-h-0 min-w-0 overflow-hidden">
        {/* 3D Viewport Container */}
        <main className="flex-1 relative flex flex-col min-h-0 min-w-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
          {/* Pedagogical Stage Progress Card when Puzzle is Scrambled / Solving */}
          {isScrambled && (
            <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 bg-slate-900/95 border border-emerald-500/50 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 shadow-xl shadow-emerald-950/40 max-w-[calc(100%-180px)] sm:max-w-md">
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                      <span>{currentActiveStage ? currentActiveStage.badge : 'Puzzle Diacak'}</span>
                      <span className="text-[10px] bg-emerald-500/25 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold shrink-0">
                        {currentMoveIndex}/{activeMoves.length}
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-300 font-medium truncate">
                      {currentActiveStage ? currentActiveStage.title : 'Siap diselesaikan langkah demi langkah'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSolveStepByStep}
                  className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all active:scale-95 shrink-0 whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{isPlaying ? 'Jeda' : 'Selesaikan'}</span>
                </button>
              </div>

              {currentActiveStage && currentActiveStage.formulaName && (
                <div className="text-[10px] text-slate-300 bg-slate-950/60 rounded-lg px-2 py-0.5 flex items-center gap-1.5 border border-slate-800/80">
                  <span className="text-emerald-400 font-semibold shrink-0">Rumus:</span>
                  <span className="font-mono text-white truncate">{currentActiveStage.formulaName}</span>
                </div>
              )}

              {/* Grubiks-Style Orientation & Tips Guidance */}
              <div className="flex flex-col gap-1 pt-1 border-t border-slate-800/60 text-[10px]">
                <div className="flex items-center gap-1.5 text-slate-300 bg-slate-950/40 rounded-lg px-2 py-0.5 border border-slate-800/40">
                  <span className="text-sky-400 font-semibold shrink-0">🧭 Posisi:</span>
                  <span className="truncate">{orientationHint}</span>
                </div>
                {currentActiveStage && currentActiveStage.tips && (
                  <div className="flex items-center gap-1.5 text-amber-200/90 bg-amber-950/30 rounded-lg px-2 py-0.5 border border-amber-800/40">
                    <span className="text-amber-400 font-semibold shrink-0">💡 Tips:</span>
                    <span className="truncate">{currentActiveStage.tips}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <RubikViewer
            ref={cubeRef}
            puzzle={currentPuzzle}
            isInspectMode={isInspectMode}
            animationSpeed={speed}
            highlightMode={highlightMode}
          />

          {/* Bottom Playback Timeline */}
          <PlaybackBar
            puzzle={currentPuzzle}
            moves={activeMoves}
            stages={solutionStages}
            currentMoveIndex={currentMoveIndex}
            isPlaying={isPlaying}
            speed={speed}
            onPlayToggle={handlePlayToggle}
            onStepNext={handleStepNext}
            onStepPrev={handleStepPrev}
            onReset={handleResetTimeline}
            onSpeedChange={setSpeed}
            onSelectMoveIndex={handleSelectMoveIndex}
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

            // 1. For 3x3: attempt state-based CFOP solver
            if (currentPuzzleId === 'cube-3x3' && cubeRef.current?.getModel) {
              const stateSolution = solve3x3FromModel(cubeRef.current.getModel());
              if (stateSolution && stateSolution.solutionMoves.length > 0) {
                activeMovesRef.current = stateSolution.solutionMoves;
                setActiveMoves(stateSolution.solutionMoves);
                setSolutionStages(stateSolution.stages);
                setCurrentMoveIndex(0);
                setIsScrambled(true);
                setActiveCaseId('custom-layout-solution');
                return;
              }
            }

            // 2. For 5x5 and all other puzzles: generate authentic pedagogical reduction solution
            const pedagogical = getPedagogicalSolutionForPuzzle(currentPuzzleId);
            if (pedagogical && pedagogical.solutionMoves?.length > 0) {
              activeMovesRef.current = pedagogical.solutionMoves;
              setActiveMoves(pedagogical.solutionMoves);
              setSolutionStages(pedagogical.stages);
              setCurrentMoveIndex(0);
              currentMoveIndexRef.current = 0;
              setIsScrambled(true);
              setActiveCaseId('custom-layout-solution');
            }
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
