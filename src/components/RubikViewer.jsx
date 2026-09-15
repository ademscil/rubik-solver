import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { getMoveInfo, getInverseMove } from '../cube/rubikNotation';
import { CUBE_COLORS } from '../cube/presets';

// Dimensi dan ukuran
const CUBIE_SIZE = 0.94;
const SPACING = 1.0;
const HALF_SIZE = 2; // Koord: -2, -1, 0, 1, 2

// Warna standar
const FACE_COLORS = {
  R: CUBE_COLORS.R.hex, // +X (Merah)
  L: CUBE_COLORS.L.hex, // -X (Oranye)
  U: CUBE_COLORS.U.hex, // +Y (Putih)
  D: CUBE_COLORS.D.hex, // -Y (Kuning)
  F: CUBE_COLORS.F.hex, // +Z (Hijau)
  B: CUBE_COLORS.B.hex, // -Z (Biru)
  INTERNAL: CUBE_COLORS.INTERNAL.hex // Body plastik gelap
};

/**
 * Buat tekstur stiker berstempel glossy dengan sudut rounded halus
 */
function createStickerTexture(hexColor, isHighlighted = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Background plastik hitam tepi
  ctx.fillStyle = '#121215';
  ctx.fillRect(0, 0, 128, 128);

  // Stiker rounded di tengah
  const pad = 7;
  const rad = 14;
  const w = 128 - pad * 2;
  const h = 128 - pad * 2;

  ctx.beginPath();
  ctx.roundRect(pad, pad, w, h, rad);
  ctx.fillStyle = hexColor;
  ctx.fill();

  // Efek kilauan / gloss subtle
  const grad = ctx.createLinearGradient(pad, pad, pad + w, pad + h);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
  grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.08)');
  grad.addColorStop(0.65, 'rgba(0, 0, 0, 0.02)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.22)');
  ctx.fillStyle = grad;
  ctx.fill();

  if (isHighlighted) {
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#38bdf8'; // Glowing cyan
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const RubikViewer = forwardRef(function RubikViewer({
  isInspectMode = true,
  animationSpeed = 1,
  highlightMode = 'all',
  onMoveComplete,
  editorActive = false,
  selectedPaintColor = '#FFFFFF',
  onStickerClick
}, ref) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const cubiesRef = useRef([]);
  const isAnimatingRef = useRef(false);
  const moveQueueRef = useRef([]);
  const pivotRef = useRef(new THREE.Group());

  // Inisialisasi Scene Three.js
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#090d16');
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(7.5, 6.5, 9.5);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
    controls.minDistance = 5;
    controls.maxDistance = 25;
    controls.enablePan = false;
    controlsRef.current = controls;

    // Tambah pivot group ke scene
    scene.add(pivotRef.current);

    // 6. Buat 125 Cubies (5x5x5)
    buildCube();

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
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update enable/disable controls berdasarkan mode amati
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = isInspectMode;
    }
  }, [isInspectMode]);

  // Fungsi membangun kubus 5x5
  const buildCube = useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Bersihkan cubies lama jika ada
    cubiesRef.current.forEach(c => scene.remove(c));
    cubiesRef.current = [];

    const geom = new THREE.BoxGeometry(CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE);

    for (let x = -HALF_SIZE; x <= HALF_SIZE; x++) {
      for (let y = -HALF_SIZE; y <= HALF_SIZE; y++) {
        for (let z = -HALF_SIZE; z <= HALF_SIZE; z++) {
          // Lewati cubie bagian dalam murni yang tidak terlihat sama sekali (|x|<2 && |y|<2 && |z|<2)
          const isInternal = Math.abs(x) < 2 && Math.abs(y) < 2 && Math.abs(z) < 2;
          if (isInternal) continue;

          // 6 material untuk 6 sisi box: [+X (R), -X (L), +Y (U), -Y (D), +Z (F), -Z (B)]
          const materials = [
            // +X: Right
            new THREE.MeshStandardMaterial({
              map: x === HALF_SIZE ? createStickerTexture(FACE_COLORS.R) : null,
              color: x === HALF_SIZE ? 0xffffff : FACE_COLORS.INTERNAL,
              roughness: 0.3,
              metalness: 0.1
            }),
            // -X: Left
            new THREE.MeshStandardMaterial({
              map: x === -HALF_SIZE ? createStickerTexture(FACE_COLORS.L) : null,
              color: x === -HALF_SIZE ? 0xffffff : FACE_COLORS.INTERNAL,
              roughness: 0.3,
              metalness: 0.1
            }),
            // +Y: Up
            new THREE.MeshStandardMaterial({
              map: y === HALF_SIZE ? createStickerTexture(FACE_COLORS.U) : null,
              color: y === HALF_SIZE ? 0xffffff : FACE_COLORS.INTERNAL,
              roughness: 0.3,
              metalness: 0.1
            }),
            // -Y: Down
            new THREE.MeshStandardMaterial({
              map: y === -HALF_SIZE ? createStickerTexture(FACE_COLORS.D) : null,
              color: y === -HALF_SIZE ? 0xffffff : FACE_COLORS.INTERNAL,
              roughness: 0.3,
              metalness: 0.1
            }),
            // +Z: Front
            new THREE.MeshStandardMaterial({
              map: z === HALF_SIZE ? createStickerTexture(FACE_COLORS.F) : null,
              color: z === HALF_SIZE ? 0xffffff : FACE_COLORS.INTERNAL,
              roughness: 0.3,
              metalness: 0.1
            }),
            // -Z: Back
            new THREE.MeshStandardMaterial({
              map: z === -HALF_SIZE ? createStickerTexture(FACE_COLORS.B) : null,
              color: z === -HALF_SIZE ? 0xffffff : FACE_COLORS.INTERNAL,
              roughness: 0.3,
              metalness: 0.1
            })
          ];

          const mesh = new THREE.Mesh(geom, materials);
          mesh.position.set(x * SPACING, y * SPACING, z * SPACING);
          mesh.userData = {
            gridX: x,
            gridY: y,
            gridZ: z,
            initialX: x,
            initialY: y,
            initialZ: z
          };

          scene.add(mesh);
          cubiesRef.current.push(mesh);
        }
      }
    }
  }, []);

  // Animasi Pemutaran Layer
  const executeMove = useCallback((moveStr, onComplete) => {
    if (isAnimatingRef.current) {
      moveQueueRef.current.push({ moveStr, onComplete });
      return;
    }

    const moveInfo = getMoveInfo(moveStr);
    const { axis, layers, dir } = moveInfo;
    const scene = sceneRef.current;
    const pivot = pivotRef.current;
    if (!scene || !pivot) return;

    isAnimatingRef.current = true;

    // Reset pivot
    pivot.rotation.set(0, 0, 0);
    pivot.position.set(0, 0, 0);

    // Cari cubie yang berada di layer yang bersangkutan
    const activeCubies = [];
    cubiesRef.current.forEach(cubie => {
      let val = 0;
      if (axis === 'x') val = cubie.userData.gridX;
      else if (axis === 'y') val = cubie.userData.gridY;
      else if (axis === 'z') val = cubie.userData.gridZ;

      if (layers.includes(val)) {
        activeCubies.push(cubie);
      }
    });

    // Lampirkan cubie ke pivot
    activeCubies.forEach(cubie => {
      pivot.attach(cubie);
    });

    // Target sudut rotasi
    // dir: -1 atau 1 (90 deg), -2 atau 2 (180 deg)
    const targetAngle = (Math.PI / 2) * dir;
    const duration = Math.max(120, 320 / animationSpeed); // ms
    const startTime = performance.now();

    const animateRotation = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easing (cubic in/out)
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      pivot.rotation[axis] = targetAngle * ease;

      if (progress < 1) {
        requestAnimationFrame(animateRotation);
      } else {
        // Rotasi selesai: bake rotasi ke cubies
        pivot.rotation[axis] = targetAngle;
        pivot.updateMatrixWorld();

        activeCubies.forEach(cubie => {
          scene.attach(cubie);
          // Update koordinat grid logis
          cubie.userData.gridX = Math.round(cubie.position.x / SPACING);
          cubie.userData.gridY = Math.round(cubie.position.y / SPACING);
          cubie.userData.gridZ = Math.round(cubie.position.z / SPACING);
        });

        pivot.rotation.set(0, 0, 0);
        isAnimatingRef.current = false;

        if (onComplete) onComplete(moveStr);
        if (onMoveComplete) onMoveComplete(moveStr);

        // Jika ada antrian berikutnya, jalankan
        if (moveQueueRef.current.length > 0) {
          const next = moveQueueRef.current.shift();
          executeMove(next.moveStr, next.onComplete);
        }
      }
    };

    requestAnimationFrame(animateRotation);
  }, [animationSpeed, onMoveComplete]);


  // Raycaster untuk klik stiker (mode editor & mode putar)
  const handlePointerDown = (event) => {
    if (!editorActive && isInspectMode) return; // Pada inspect mode murni, biarkan OrbitControls bekerja

    const rect = mountRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    const intersects = raycaster.intersectObjects(cubiesRef.current);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const cubie = hit.object;
      const faceIndex = Math.floor(hit.faceIndex / 2); // 6 faces -> 12 triangles

      if (editorActive && onStickerClick) {
        // Ganti warna stiker yang diklik
        const newTexture = createStickerTexture(selectedPaintColor);
        cubie.material[faceIndex].map = newTexture;
        cubie.material[faceIndex].needsUpdate = true;
        onStickerClick({
          gridX: cubie.userData.gridX,
          gridY: cubie.userData.gridY,
          gridZ: cubie.userData.gridZ,
          faceIndex,
          color: selectedPaintColor
        });
      }
    }
  };

  // Highlight mode effect
  useEffect(() => {
    cubiesRef.current.forEach(cubie => {
      const { gridX, gridY, gridZ } = cubie.userData;
      let shouldHighlight = true;

      if (highlightMode === 'centers') {
        // Center pieces on any face (at least one coord is +/-2 and the other two are in {-1, 0, 1})
        const isCenter =
          (Math.abs(gridX) === 2 && Math.abs(gridY) <= 1 && Math.abs(gridZ) <= 1) ||
          (Math.abs(gridY) === 2 && Math.abs(gridX) <= 1 && Math.abs(gridZ) <= 1) ||
          (Math.abs(gridZ) === 2 && Math.abs(gridX) <= 1 && Math.abs(gridY) <= 1);
        shouldHighlight = isCenter;
      } else if (highlightMode === 'edges') {
        // Edge pieces (two coords are non-zero, one is +/-2, the other is +/-2 or +/-1, exactly one is 0 or inner)
        const nonZeros = [gridX, gridY, gridZ].filter(v => Math.abs(v) === 2).length;
        shouldHighlight = nonZeros === 2;
      } else if (highlightMode === 'parity') {
        // Parity target: Top-Front or Top-Back edges
        const isUF = gridY === 2 && gridZ === 2;
        const isUB = gridY === 2 && gridZ === -2;
        shouldHighlight = isUF || isUB;
      }

      // Atur opacity/brightness
      cubie.traverse(child => {
        if (child.isMesh && Array.isArray(child.material)) {
          child.material.forEach(mat => {
            if (mat) {
              mat.opacity = shouldHighlight ? 1.0 : 0.28;
              mat.transparent = !shouldHighlight;
            }
          });
        }
      });
    });
  }, [highlightMode]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    makeMove: (moveStr, onComplete) => {
      executeMove(moveStr, onComplete);
    },
    resetCube: () => {
      buildCube();
    },
    resetCamera: (view) => {
      resetCamera(view);
    },
    isBusy: () => isAnimatingRef.current || moveQueueRef.current.length > 0,
    loadFullLayout: (facesData) => {
      // facesData = { U: [...25 hex], D: [...25 hex], F: [...25 hex], B: [...25 hex], L: [...25 hex], R: [...25 hex] }
      if (!facesData) return;
      const getCoord = (face, r, c) => {
        if (face === 'U') return { x: c - 2, y: 2, z: r - 2, matIdx: 2 };
        if (face === 'D') return { x: c - 2, y: -2, z: 2 - r, matIdx: 3 };
        if (face === 'F') return { x: c - 2, y: 2 - r, z: 2, matIdx: 4 };
        if (face === 'B') return { x: 2 - c, y: 2 - r, z: -2, matIdx: 5 };
        if (face === 'L') return { x: -2, y: 2 - r, z: c - 2, matIdx: 1 };
        if (face === 'R') return { x: 2, y: 2 - r, z: 2 - c, matIdx: 0 };
      };

      Object.entries(facesData).forEach(([faceKey, colors]) => {
        if (!Array.isArray(colors)) return;
        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < 5; c++) {
            const idx = r * 5 + c;
            const colorHex = colors[idx];
            if (!colorHex) continue;

            const { x, y, z, matIdx } = getCoord(faceKey, r, c);
            const cubie = cubiesRef.current.find(
              cb => cb.userData.gridX === x && cb.userData.gridY === y && cb.userData.gridZ === z
            );
            if (cubie && cubie.material[matIdx]) {
              cubie.material[matIdx].map = createStickerTexture(colorHex);
              cubie.material[matIdx].needsUpdate = true;
            }
          }
        }
      });
    }
  }));

  return (
    <div className="relative w-full h-full select-none overflow-hidden" ref={mountRef} onPointerDown={handlePointerDown}>
      {/* Overlay Tombol Kamera Cepat & Helper */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl p-1 flex items-center shadow-lg">
          <span className="text-xs font-semibold px-2 text-slate-400">Sudut:</span>
          <button
            onClick={() => resetCamera('isometric')}
            className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            3D Iso
          </button>
          <button
            onClick={() => resetCamera('front')}
            className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Depan
          </button>
          <button
            onClick={() => resetCamera('top')}
            className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Atas
          </button>
          <button
            onClick={() => resetCamera('right')}
            className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Kanan
          </button>
        </div>

        {/* Indikator Status Mode */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg">
          <div className={`w-2 h-2 rounded-full ${isInspectMode ? 'bg-sky-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-xs font-medium text-slate-300">
            {isInspectMode ? 'Mode Amati (Orbit 360°)' : 'Mode Putar Layer'}
          </span>
        </div>
      </div>

      {/* Watermark Logo 5x5 Minimalis di Sudut Bawah */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none opacity-40 hover:opacity-100 transition-opacity">
        <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">5x5 Professor's Cube 3D</span>
      </div>
    </div>
  );
});

export default RubikViewer;

