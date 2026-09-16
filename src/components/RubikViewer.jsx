import React, { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CameraManager } from '../engine/CameraManager';
import { disposeHierarchy, teardownViewer } from '../engine/DisposalPipeline';
import { applyNetStateToNxN } from '../puzzles/nxn/netLayout.js';

const RubikViewer = forwardRef(function RubikViewer({
  isInspectMode = true,
  animationSpeed = 1,
  highlightMode = 'all',
  onMoveComplete,
  _editorActive = false,
  _selectedPaintColor = '#FFFFFF',
  _onStickerClick,
  puzzle
}, ref) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraManagerRef = useRef(null);
  const activeModelRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const moveQueueRef = useRef([]);
  const pivotRef = useRef(new THREE.Group());
  const executeMoveRef = useRef(null);

  // Build active puzzle model
  const buildModel = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene || !puzzle || typeof puzzle.buildModel !== 'function') return;

    // Clear any remaining children in pivotRef before disposing active model
    if (pivotRef.current && pivotRef.current.children.length > 0) {
      while (pivotRef.current.children.length > 0) {
        const child = pivotRef.current.children[0];
        pivotRef.current.remove(child);
        disposeHierarchy(child, { disposeSharedTextures: false });
      }
    }

    // 1. Dispose existing model to ensure zero WebGL memory leaks
    if (activeModelRef.current) {
      disposeHierarchy(activeModelRef.current, { disposeSharedTextures: false });
      scene.remove(activeModelRef.current);
      activeModelRef.current = null;
    }

    // 2. Build new 3D model for the active puzzle
    const model = puzzle.buildModel();
    activeModelRef.current = model;
    scene.add(model);

    // 3. Auto-fit camera using puzzle's default distance
    if (cameraManagerRef.current && puzzle.defaultCameraDistance) {
      cameraManagerRef.current.setDistance(puzzle.defaultCameraDistance);
      cameraManagerRef.current.resetCamera('isometric');
    }
  }, [puzzle]);

  // Initialize Three.js Scene
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 800;
    const height = currentMount.clientHeight || 600;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#090d16');
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    const initialDistance = 8.0;
    camera.position.set(initialDistance * 0.7, initialDistance * 0.6, initialDistance * 0.9);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight1.position.set(10, 15, 12);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x38bdf8, 0.8, 25);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    // 5. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 4.0;
    controls.maxDistance = 30.0;
    controls.enablePan = false;
    controlsRef.current = controls;

    // Camera preset controller
    const cameraManager = new CameraManager(camera, controls, initialDistance);
    cameraManagerRef.current = cameraManager;

    // Pivot group for intermediate rotations
    scene.add(pivotRef.current);

    // 7. Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cameraManagerRef.current?.dispose();
      teardownViewer({
        scene: sceneRef.current,
        renderer: rendererRef.current,
        controls: controlsRef.current,
        animId,
        resizeHandler: handleResize,
        options: { disposeSharedTextures: false, removeDomElement: true }
      });
    };
  }, []); // Run once on mount

  // When puzzle changes, rebuild the model and reconfigure camera
  useEffect(() => {
    if (sceneRef.current && puzzle) {
      buildModel();
      if (controlsRef.current && puzzle.minCameraDistance && puzzle.maxCameraDistance) {
        controlsRef.current.minDistance = puzzle.minCameraDistance;
        controlsRef.current.maxDistance = puzzle.maxCameraDistance;
      }
    }
  }, [puzzle, buildModel]);

  // Update OrbitControls enabled state
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = isInspectMode;
    }
  }, [isInspectMode]);

  // Reset Camera Callback
  const resetCamera = useCallback((view, options) => {
    if (cameraManagerRef.current) {
      cameraManagerRef.current.resetCamera(view, options);
    }
  }, []);

  // Animate Move Execution
  const executeMove = useCallback((moveStr, onComplete) => {
    if (!moveStr || !activeModelRef.current || !puzzle) {
      if (onComplete) {
        onComplete(moveStr);
      } else if (onMoveComplete) {
        onMoveComplete(moveStr);
      }
      return;
    }

    if (isAnimatingRef.current) {
      moveQueueRef.current.push({ moveStr, onComplete });
      return;
    }

    isAnimatingRef.current = true;
    const duration = Math.max(80, Math.round(240 / animationSpeed));

    const handleDone = () => {
      isAnimatingRef.current = false;
      if (onComplete) {
        onComplete(moveStr);
      } else if (onMoveComplete) {
        onMoveComplete(moveStr);
      }

      // Process next queued move if any
      if (moveQueueRef.current.length > 0) {
        const next = moveQueueRef.current.shift();
        executeMoveRef.current?.(next.moveStr, next.onComplete);
      }
    };

    if (typeof puzzle.animateMove === 'function') {
      try {
        puzzle.animateMove(moveStr, activeModelRef.current, handleDone, duration, pivotRef.current);
      } catch (err) {
        console.warn(`[RubikViewer] Error executing move '${moveStr}':`, err);
        isAnimatingRef.current = false;
        if (onComplete) {
          onComplete(moveStr);
        } else if (onMoveComplete) {
          onMoveComplete(moveStr);
        }
        if (moveQueueRef.current.length > 0) {
          const next = moveQueueRef.current.shift();
          executeMoveRef.current?.(next.moveStr, next.onComplete);
        }
      }
    } else {
      handleDone();
    }
  }, [puzzle, animationSpeed, onMoveComplete]);

  useEffect(() => {
    executeMoveRef.current = executeMove;
  }, [executeMove]);

  // Highlight Mode effect for puzzle pieces
  useEffect(() => {
    if (!activeModelRef.current) return;
    const isNxN = !!puzzle?.order;

    activeModelRef.current.traverse((child) => {
      if (child.isMesh && child.userData) {
        let shouldHighlight = true;
        if (isNxN && highlightMode !== 'all') {
          const half = (puzzle.order - 1) / 2;
          const pos = child.userData.gridPos || child.position;
          const gx = Math.round(pos.x);
          const gy = Math.round(pos.y);
          const gz = Math.round(pos.z);

          const isCenter = (Math.abs(gx) < half && Math.abs(gy) < half) ||
                           (Math.abs(gx) < half && Math.abs(gz) < half) ||
                           (Math.abs(gy) < half && Math.abs(gz) < half);
          const isEdge = !isCenter && (
            (Math.abs(gx) === half && Math.abs(gy) === half && Math.abs(gz) < half) ||
            (Math.abs(gx) === half && Math.abs(gz) === half && Math.abs(gy) < half) ||
            (Math.abs(gy) === half && Math.abs(gz) === half && Math.abs(gx) < half)
          );
          const isCorner = Math.abs(gx) === half && Math.abs(gy) === half && Math.abs(gz) === half;

          if (highlightMode === 'centers') shouldHighlight = isCenter;
          else if (highlightMode === 'edges') shouldHighlight = isEdge;
          else if (highlightMode === 'parity') shouldHighlight = isEdge || isCorner;
        }

        if (child.material) {
          const mat = Array.isArray(child.material) ? child.material : [child.material];
          mat.forEach(m => {
            if (m.opacity !== undefined) {
              m.transparent = !shouldHighlight;
              m.opacity = shouldHighlight ? 1.0 : 0.25;
            }
          });
        }
      }
    });
  }, [highlightMode, puzzle]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    makeMove: (moveStr, onComplete) => {
      executeMove(moveStr, onComplete);
    },
    resetCube: () => {
      moveQueueRef.current = [];
      isAnimatingRef.current = false;
      if (pivotRef.current && pivotRef.current.children.length > 0) {
        while (pivotRef.current.children.length > 0) {
          const child = pivotRef.current.children[0];
          pivotRef.current.remove(child);
          disposeHierarchy(child, { disposeSharedTextures: false });
        }
      }
      buildModel();
      if (puzzle && activeModelRef.current && typeof puzzle.resetModel === 'function') {
        puzzle.resetModel(activeModelRef.current);
      }
    },
    resetCamera: (view, options) => {
      resetCamera(view, options);
    },
    isBusy: () => isAnimatingRef.current || moveQueueRef.current.length > 0,
    loadFullLayout: (facesData) => {
      if (puzzle?.order && activeModelRef.current) {
        applyNetStateToNxN(activeModelRef.current, facesData, puzzle.order);
      }
    },
    applyMovesInstant: (moves) => {
      moveQueueRef.current = [];
      isAnimatingRef.current = false;
      if (!activeModelRef.current || !puzzle) return;
      const moveList = Array.isArray(moves) ? moves : (puzzle.parseAlgorithm ? puzzle.parseAlgorithm(moves || '') : []);
      moveList.forEach(m => {
        if (typeof puzzle.animateMove === 'function') {
          try {
            puzzle.animateMove(m, activeModelRef.current, null, 0, pivotRef.current);
          } catch (err) {
            console.warn(`[RubikViewer] Error executing instant move '${m}':`, err);
          }
        }
      });
    },
    animateSequence: (moves, customDuration = 100, onComplete = null) => {
      moveQueueRef.current = [];
      isAnimatingRef.current = false;
      if (!activeModelRef.current || !puzzle) {
        onComplete?.();
        return;
      }
      const moveList = Array.isArray(moves) ? moves : (puzzle.parseAlgorithm ? puzzle.parseAlgorithm(moves || '') : []);
      if (moveList.length === 0) {
        onComplete?.();
        return;
      }

      let idx = 0;
      isAnimatingRef.current = true;

      const step = () => {
        if (idx >= moveList.length) {
          isAnimatingRef.current = false;
          onComplete?.();
          return;
        }
        const m = moveList[idx++];
        if (typeof puzzle.animateMove === 'function' && activeModelRef.current) {
          try {
            puzzle.animateMove(m, activeModelRef.current, step, customDuration, pivotRef.current);
          } catch (err) {
            console.warn(`[RubikViewer] Error executing sequence move '${m}':`, err);
            step();
          }
        } else {
          step();
        }
      };

      step();
    },
    getModel: () => activeModelRef.current
  }));

  return (
    <div className="flex-1 w-full min-h-0 relative select-none overflow-hidden" ref={mountRef}>
      {/* Overlay Tombol Kamera Cepat & Helper (Diposisikan di Pojok Kanan Atas agar Tidak Overlap) */}
      <div className="absolute top-3 right-3 z-10 flex flex-wrap items-center justify-end gap-2 pointer-events-auto">
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-1 flex items-center shadow-lg">
          <span className="text-xs font-semibold px-2 text-slate-400">Sudut:</span>
          <button
            onClick={() => resetCamera('isometric')}
            className="px-2 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            3D Iso
          </button>
          <button
            onClick={() => resetCamera('front')}
            className="px-2 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Depan
          </button>
          <button
            onClick={() => resetCamera('top')}
            className="px-2 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Atas
          </button>
          <button
            onClick={() => resetCamera('right')}
            className="px-2 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Kanan
          </button>
        </div>

        {/* Indikator Status Mode */}
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shadow-lg">
          <div className={`w-2 h-2 rounded-full ${isInspectMode ? 'bg-sky-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-xs font-medium text-slate-300 hidden sm:inline">
            {isInspectMode ? 'Orbit 360°' : 'Putar Layer'}
          </span>
        </div>
      </div>
    </div>
  );
});

export default RubikViewer;
