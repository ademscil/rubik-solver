import React, { useState, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
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

  // Scramble puzzle
  const handleScramble = useCallback(() => {
    setIsPlaying(false);
    if (cubeRef.current) {
      cubeRef.current.resetCube();
      const scrambleFn = currentPuzzle?.generateScramble || defaultScramble;
      const parseFn = currentPuzzle?.parseAlgorithm || defaultParseAlg;
      const scrambleStr = scrambleFn(25);
      const moves = parseFn(scrambleStr);
      moves.forEach(m => cubeRef.current.makeMove(m));
      setActiveMoves([]);
      setCurrentMoveIndex(0);
    }
  }, [currentPuzzle]);

  // Reset puzzle to solved state
  const handleResetCube = useCallback(() => {
    setIsPlaying(false);
    setActiveMoves([]);
    setCurrentMoveIndex(0);
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
