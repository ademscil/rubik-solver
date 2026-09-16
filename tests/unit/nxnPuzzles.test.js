/**
 * Automated Unit & Integration Tests: NxN Puzzles Suite (Milestone 2)
 * File: tests/unit/nxnPuzzles.test.js
 * Runner: node --test
 * 
 * Verifies all 6 official WCA NxN Cubes (2x2 to 7x7):
 * - Geometry, exact piece culling, shared buffers, material sharing
 * - Kinematics, WCA notation parsing, layer slicing, 4-quarter-turn cycle invariance
 * - Two-Tier Progressive learning curriculum (Pemula & Mahir)
 * - Presets catalog (Solved, Parities, Checkerboard, Superflip)
 * - 2D Cross Net descriptors & fixed center locking
 * - Registry integration across all 4 difficulty tiers
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildNxNModel,
  validateOrder,
  getLayerOffset,
  getLayerIndexFromPos,
  isInternalCubie,
  classifyCubie,
  CUBIE_PITCH
} from '../../src/puzzles/nxn/NxNGeometry.js';

import {
  parseNxNMove,
  getActiveCubies,
  animateNxNMove
} from '../../src/puzzles/nxn/NxNKinematics.js';

import { createCubicNetLayout, applyNetStateToNxN, extractNetStateFromNxN } from '../../src/puzzles/nxn/netLayout.js';
import { createNxNDefinition } from '../../src/puzzles/nxn/NxNFactory.js';
import { cube2x2Definition } from '../../src/puzzles/nxn/cube2x2.js';
import { cube3x3Definition } from '../../src/puzzles/nxn/cube3x3.js';
import { cube4x4Definition } from '../../src/puzzles/nxn/cube4x4.js';
import { cube5x5Definition } from '../../src/puzzles/nxn/cube5x5.js';
import { cube6x6Definition } from '../../src/puzzles/nxn/cube6x6.js';
import { cube7x7Definition } from '../../src/puzzles/nxn/cube7x7.js';

import {
  NXN_NOTATION_DICTIONARY,
  getInverseMove,
  invertAlgorithm,
  parseAlgorithm,
  getMoveInfo
} from '../../src/solvers/notation/nxnNotation.js';

import {
  NXN_PRESETS,
  generateNxNScramble,
  CUBE_COLORS
} from '../../src/solvers/presets/nxnPresets.js';

import {
  NXN_GUIDE_STAGES,
  GUIDE_STAGES_2X2,
  GUIDE_STAGES_3X3,
  GUIDE_STAGES_4X4,
  GUIDE_STAGES_5X5,
  GUIDE_STAGES_6X6,
  GUIDE_STAGES_7X7
} from '../../src/solvers/guides/nxnGuides.js';

import {
  puzzleRegistry,
  loadPuzzle,
  getPuzzlesByDifficulty
} from '../../src/puzzles/registry.js';

describe('NxN Suite: 1. Mathematical Geometry & Piece Culling (2x2 to 7x7)', () => {
  const ORDERS = [2, 3, 4, 5, 6, 7];

  it('validates order boundary and rejects invalid orders', () => {
    assert.throws(() => validateOrder(1), RangeError);
    assert.throws(() => validateOrder(8), RangeError);
    assert.throws(() => validateOrder(3.5), RangeError);
    assert.throws(() => validateOrder('3'), RangeError);
    ORDERS.forEach(order => {
      assert.doesNotThrow(() => validateOrder(order));
    });
  });

  it('renders exact piece count N^3 - (N - 2)^3 visible cubies', () => {
    const expected = {
      2: 8,    // 8 - 0
      3: 26,   // 27 - 1
      4: 56,   // 64 - 8
      5: 98,   // 125 - 27
      6: 152,  // 216 - 64
      7: 218   // 343 - 125
    };

    ORDERS.forEach(order => {
      const model = buildNxNModel(order);
      assert.equal(model.children.length, expected[order], `Order ${order} must have ${expected[order]} meshes`);
      assert.equal(model.userData.cubies.length, expected[order]);
    });
  });

  it('verifies exact piece classification (corners, edges/wings, centers, internal)', () => {
    ORDERS.forEach(order => {
      let corners = 0;
      let edges = 0;
      let centers = 0;
      let internal = 0;

      for (let i = 0; i < order; i++) {
        for (let j = 0; j < order; j++) {
          for (let k = 0; k < order; k++) {
            const type = classifyCubie(i, j, k, order);
            if (type === 'corner') corners++;
            else if (type === 'edge') edges++;
            else if (type === 'center') centers++;
            else if (type === 'internal') internal++;
          }
        }
      }

      // Invariants:
      assert.equal(corners, 8, `Order ${order} must have exactly 8 corners`);
      assert.equal(edges, 12 * (order - 2), `Order ${order} edge count mismatch`);
      assert.equal(centers, 6 * (order - 2) * (order - 2), `Order ${order} center count mismatch`);
      assert.equal(internal, (order - 2) * (order - 2) * (order - 2), `Order ${order} internal count mismatch`);
      assert.equal(corners + edges + centers + internal, order * order * order);
    });
  });

  it('correctly detects internal pieces via isInternalCubie', () => {
    assert.equal(isInternalCubie(0, 0, 0, 3), false);
    assert.equal(isInternalCubie(1, 1, 1, 3), true);
    assert.equal(isInternalCubie(1, 1, 1, 4), true);
    assert.equal(isInternalCubie(0, 1, 1, 4), false);
  });

  it('correctly recovers discrete layer indices from continuous positions on even and odd cubes', () => {
    ORDERS.forEach(order => {
      for (let layer = 0; layer < order; layer++) {
        const offset = getLayerOffset(layer, order, CUBIE_PITCH);
        const recovered = getLayerIndexFromPos(offset, order, CUBIE_PITCH);
        assert.equal(recovered, layer, `Layer ${layer} on order ${order} must be accurately recovered`);
      }
    });
  });

  it('uses a single shared BoxGeometry buffer per model to prevent GPU memory bloat', () => {
    ORDERS.forEach(order => {
      const model = buildNxNModel(order);
      const firstGeom = model.children[0].geometry;
      assert.ok(firstGeom);
      model.children.forEach(child => {
        assert.equal(child.geometry, firstGeom, 'All cubies must share the identical geometry buffer instance');
      });
    });
  });

  it('shares vinyl sticker materials with userData.isShared = true', () => {
    const model = buildNxNModel(3);
    const firstCubie = model.children[0];
    assert.equal(firstCubie.material.length, 6);
    firstCubie.material.forEach(mat => {
      assert.equal(mat.userData.isShared, true);
    });
  });
});

describe('NxN Suite: 2. Kinematics, Move Parsing & 4-Turn Cycle Invariance', () => {
  it('parses standard outer face turns for all 6 faces across orders', () => {
    const faces = ['R', 'L', 'U', 'D', 'F', 'B'];
    faces.forEach(f => {
      const cw = parseNxNMove(f, 3);
      assert.equal(cw.token, f);
      assert.equal(cw.isWide, false);
      assert.equal(cw.isSlice, false);
      assert.equal(cw.isRotation, false);

      const prime = parseNxNMove(`${f}'`, 3);
      assert.equal(prime.angle, -cw.angle);

      const dbl = parseNxNMove(`${f}2`, 3);
      assert.equal(Math.abs(dbl.angle), Math.PI);
    });
  });

  it('parses wide turns (Rw, Lw, Uw, Dw, Fw, Bw) and lowercase notations', () => {
    const moveRw = parseNxNMove('Rw', 4);
    assert.equal(moveRw.isWide, true);
    assert.deepEqual(moveRw.layers, [2, 3]);

    const moveRCase = parseNxNMove('r', 4);
    assert.equal(moveRCase.isWide, true);
    assert.deepEqual(moveRCase.layers, [2, 3]);

    const moveLw = parseNxNMove('Lw', 4);
    assert.equal(moveLw.isWide, true);
    assert.deepEqual(moveLw.layers, [0, 1]);
  });

  it('parses multi-layer wide turns up to order limit (3Rw, 3Uw)', () => {
    const move3Rw7 = parseNxNMove('3Rw', 7);
    assert.equal(move3Rw7.isWide, true);
    assert.deepEqual(move3Rw7.layers, [4, 5, 6]);

    const move3Lw7 = parseNxNMove('3Lw', 7);
    assert.equal(move3Lw7.isWide, true);
    assert.deepEqual(move3Lw7.layers, [0, 1, 2]);

    assert.throws(() => parseNxNMove('5Rw', 4), /exceeds cube order/);
  });

  it('parses single inner slice moves (2R, 2U, 3R)', () => {
    const move2R4 = parseNxNMove('2R', 4);
    assert.equal(move2R4.isSlice, true);
    assert.deepEqual(move2R4.layers, [2]);

    const move2L4 = parseNxNMove('2L', 4);
    assert.equal(move2L4.isSlice, true);
    assert.deepEqual(move2L4.layers, [1]);

    const move3R7 = parseNxNMove('3R', 7);
    assert.equal(move3R7.isSlice, true);
    assert.deepEqual(move3R7.layers, [4]);
  });

  it('parses middle slices (M, E, S) on odd cubes and rejects on 2x2', () => {
    assert.throws(() => parseNxNMove('M', 2), /invalid on order 2/);

    const moveM3 = parseNxNMove('M', 3);
    assert.equal(moveM3.axis, 'x');
    assert.deepEqual(moveM3.layers, [1]);
    assert.equal(moveM3.dir, 1);

    const moveE3 = parseNxNMove('E', 3);
    assert.equal(moveE3.axis, 'y');
    assert.deepEqual(moveE3.layers, [1]);

    const moveS3 = parseNxNMove('S', 3);
    assert.equal(moveS3.axis, 'z');
    assert.deepEqual(moveS3.layers, [1]);
  });

  it('parses whole-cube rotations (x, y, z)', () => {
    const rotX = parseNxNMove('x', 3);
    assert.equal(rotX.isRotation, true);
    assert.deepEqual(rotX.layers, [0, 1, 2]);

    const rotY = parseNxNMove("y'", 3);
    assert.equal(rotY.isRotation, true);

    const rotZ = parseNxNMove('z2', 3);
    assert.equal(rotZ.isRotation, true);
  });

  it('getActiveCubies accurately retrieves target layer meshes', () => {
    const model = buildNxNModel(3);
    const rightCubies = getActiveCubies(model, 'x', [2], 3);
    assert.equal(rightCubies.length, 9);
    const midCubies = getActiveCubies(model, 'x', [1], 3);
    assert.equal(midCubies.length, 8); // 3x3 middle layer has 8 visible pieces
  });

  it('executes 4 quarter-turns and returns to 360° identity with zero coordinate drift', () => {
    const model = buildNxNModel(3);
    const initialPositions = model.children.map(c => ({ x: c.position.x, y: c.position.y, z: c.position.z }));

    // Execute 4x R turns
    for (let i = 0; i < 4; i++) {
      animateNxNMove(model, 'R', null, 0);
    }

    model.children.forEach((c, idx) => {
      const orig = initialPositions[idx];
      assert.ok(Math.abs(c.position.x - orig.x) < 1e-5, `Cubie ${idx} X position drifted`);
      assert.ok(Math.abs(c.position.y - orig.y) < 1e-5, `Cubie ${idx} Y position drifted`);
      assert.ok(Math.abs(c.position.z - orig.z) < 1e-5, `Cubie ${idx} Z position drifted`);
      assert.equal(c.rotation.x % (Math.PI * 2), 0);
      assert.equal(c.rotation.y % (Math.PI * 2), 0);
      assert.equal(c.rotation.z % (Math.PI * 2), 0);
    });
  });

  it('executes wide move 4 times returning to identity (4x 3Rw on 5x5)', () => {
    const model = buildNxNModel(5);
    const initialPositions = model.children.map(c => ({ x: c.position.x, y: c.position.y, z: c.position.z }));

    for (let i = 0; i < 4; i++) {
      animateNxNMove(model, '3Rw', null, 0);
    }

    model.children.forEach((c, idx) => {
      const orig = initialPositions[idx];
      assert.ok(Math.abs(c.position.x - orig.x) < 1e-5);
      assert.ok(Math.abs(c.position.y - orig.y) < 1e-5);
      assert.ok(Math.abs(c.position.z - orig.z) < 1e-5);
    });
  });
});

describe('NxN Suite: 3. WCA Indonesian Notation Dictionary & Inverter', () => {
  it('provides Indonesian names and directional descriptions for moves', () => {
    assert.ok(NXN_NOTATION_DICTIONARY['R']);
    assert.equal(NXN_NOTATION_DICTIONARY['R'].name, 'Right');
    assert.ok(NXN_NOTATION_DICTIONARY['R'].desc.includes('searah jarum jam'));

    assert.ok(NXN_NOTATION_DICTIONARY['Rw']);
    assert.equal(NXN_NOTATION_DICTIONARY['Rw'].name, 'Right Wide');

    assert.ok(NXN_NOTATION_DICTIONARY['3Rw']);
    assert.equal(NXN_NOTATION_DICTIONARY['3Rw'].name, '3-Right Wide');

    assert.ok(NXN_NOTATION_DICTIONARY['M']);
    assert.equal(NXN_NOTATION_DICTIONARY['M'].name, 'Middle Slice');
  });

  it('inverts single moves correctly', () => {
    assert.equal(getInverseMove('R'), "R'");
    assert.equal(getInverseMove("R'"), 'R');
    assert.equal(getInverseMove('R2'), 'R2');
    assert.equal(getInverseMove('3Rw'), "3Rw'");
    assert.equal(getInverseMove("3Rw'"), '3Rw');
    assert.equal(getInverseMove('3Rw2'), '3Rw2');
    assert.equal(getInverseMove('M'), "M'");
    assert.equal(getInverseMove("M'"), 'M');
    assert.equal(getInverseMove('x'), "x'");
  });

  it('inverts algorithm sequence in reverse order and with inverted tokens', () => {
    // "R U R' U'" inverted is "U R U' R'"
    assert.equal(invertAlgorithm("R U R' U'"), "U R U' R'");
    // "F (R U R' U') F'" inverted is "F (U R U' R') F'"
    assert.equal(invertAlgorithm("F R U R' U' F'"), "F U R U' R' F'");
  });

  it('parses algorithm strings cleanly stripping parentheses and comments', () => {
    const alg = "(R U R' U') // Sexy move trigger\n(R' F R F') [hammer]";
    const tokens = parseAlgorithm(alg);
    assert.deepEqual(tokens, ['R', 'U', "R'", "U'", "R'", 'F', 'R', "F'"]);
  });

  it('getMoveInfo retrieves structured movement data and fallbacks', () => {
    const infoR = getMoveInfo('R', 3);
    assert.equal(infoR.name, 'Right');
    assert.equal(infoR.axis, 'x');
    const infoUnknown = getMoveInfo('UnknownCustom', 3);
    assert.equal(infoUnknown.name, 'UnknownCustom');
  });
});

describe('NxN Suite: 4. Two-Tier Progressive Learning Guides (Pemula & Mahir)', () => {
  it('NXN_GUIDE_STAGES indexes guide stages for all 6 cubes', () => {
    assert.ok(NXN_GUIDE_STAGES['cube-2x2']);
    assert.ok(NXN_GUIDE_STAGES['cube-3x3']);
    assert.ok(NXN_GUIDE_STAGES['cube-4x4']);
    assert.ok(NXN_GUIDE_STAGES['cube-5x5']);
    assert.ok(NXN_GUIDE_STAGES['cube-6x6']);
    assert.ok(NXN_GUIDE_STAGES['cube-7x7']);
  });
  const CUBES = [
    { id: 'cube-2x2', stages: GUIDE_STAGES_2X2 },
    { id: 'cube-3x3', stages: GUIDE_STAGES_3X3 },
    { id: 'cube-4x4', stages: GUIDE_STAGES_4X4 },
    { id: 'cube-5x5', stages: GUIDE_STAGES_5X5 },
    { id: 'cube-6x6', stages: GUIDE_STAGES_6X6 },
    { id: 'cube-7x7', stages: GUIDE_STAGES_7X7 }
  ];

  it('provides dedicated Beginner Method (Metode Pemula) with visual analogies for all 6 cubes', () => {
    CUBES.forEach(({ id, stages }) => {
      assert.ok(stages.length >= 4, `${id} must have at least 4 learning stages`);

      const hasPemula = stages.some(s =>
        s.title.toLowerCase().includes('pemula') || s.desc.toLowerCase().includes('pemula')
      );
      assert.equal(hasPemula, true, `${id} must contain a dedicated Metode Pemula stage`);
    });
  });

  it('contains iconic visual analogies across beginner guides', () => {
    // 2x2 has Sexy Move & Sune
    const guide2x2Text = JSON.stringify(GUIDE_STAGES_2X2);
    assert.ok(guide2x2Text.includes('Lift Penumpang') || guide2x2Text.includes('Sexy Move'));
    assert.ok(guide2x2Text.includes('Sune') || guide2x2Text.includes('Ikan'));

    // 3x3 has Bunga Daisy, Penumpang Masuk, Buka Tirai, and Ikan Sune
    const guide3x3Text = JSON.stringify(GUIDE_STAGES_3X3);
    assert.ok(guide3x3Text.includes('Daisy'));
    assert.ok(guide3x3Text.includes('Penyelaman 180°') || guide3x3Text.includes('Lift Penumpang'));
    assert.ok(guide3x3Text.includes('Buka Tirai'));
    assert.ok(guide3x3Text.includes('Jangan Panik') || guide3x3Text.includes('JANGAN PANIK'));

    // 4x4 has Batang Korek Api, Push-Turn-Restore, and Rel Kereta
    const guide4x4Text = JSON.stringify(GUIDE_STAGES_4X4);
    assert.ok(guide4x4Text.includes('Korek Api') || guide4x4Text.includes('Push-Turn-Restore'));
    assert.ok(guide4x4Text.includes('Rel Kereta') || guide4x4Text.includes('Slice-Flip-Unslice'));

    // Big cubes (4x4, 5x5, 6x6, 7x7) have detailed Parity explanations
    assert.ok(JSON.stringify(GUIDE_STAGES_4X4).includes('Lucas OLL Parity'));
    assert.ok(JSON.stringify(GUIDE_STAGES_4X4).includes('PLL Parity'));
    assert.ok(JSON.stringify(GUIDE_STAGES_5X5).includes('Wing Flip Parity'));
    assert.ok(JSON.stringify(GUIDE_STAGES_6X6).includes('Inner-Slice OLL Parity'));
    assert.ok(JSON.stringify(GUIDE_STAGES_7X7).includes('Inner Wing Parity'));
  });
});

describe('NxN Suite: 5. Presets Catalog & WCA Scrambler', () => {
  const CUBES = ['cube-2x2', 'cube-3x3', 'cube-4x4', 'cube-5x5', 'cube-6x6', 'cube-7x7'];

  it('every NxN cube has a solved baseline preset with empty algorithm', () => {
    CUBES.forEach(id => {
      const presets = NXN_PRESETS[id];
      assert.ok(presets, `Missing presets for ${id}`);
      const solved = presets.find(p => p.id === 'solved');
      assert.ok(solved, `Missing solved preset for ${id}`);
      assert.equal(solved.algorithm, '');
      assert.equal(solved.setupMoves, '');
    });
  });

  it('includes iconic artistic presets (Checkerboard, Superflip)', () => {
    const p2 = NXN_PRESETS['cube-2x2'].map(p => p.id);
    assert.ok(p2.includes('checkerboard'));

    const p3 = NXN_PRESETS['cube-3x3'].map(p => p.id);
    assert.ok(p3.includes('checkerboard'));
    assert.ok(p3.includes('superflip'));

    const p4 = NXN_PRESETS['cube-4x4'].map(p => p.id);
    assert.ok(p4.includes('checkerboard-4x4'));
    assert.ok(p4.includes('oll-parity'));
    assert.ok(p4.includes('pll-parity'));

    const p5 = NXN_PRESETS['cube-5x5'].map(p => p.id);
    assert.ok(p5.includes('wing-parity'));
    assert.ok(p5.includes('l2c-barswap'));

    const p6 = NXN_PRESETS['cube-6x6'].map(p => p.id);
    assert.ok(p6.includes('inner-oll-parity'));
    assert.ok(p6.includes('pll-parity'));

    const p7 = NXN_PRESETS['cube-7x7'].map(p => p.id);
    assert.ok(p7.includes('inner-wing-parity'));
    assert.ok(p7.includes('center-barswap-7x7'));
  });

  it('generates valid non-empty WCA scrambles with appropriate lengths', () => {
    for (const order of [2, 3, 4, 5, 6, 7]) {
      const scramble = generateNxNScramble(order);
      assert.ok(typeof scramble === 'string');
      const tokens = scramble.split(/\s+/);
      assert.ok(tokens.length >= 10, `Order ${order} scramble should have sufficient moves`);
      // All tokens must parse cleanly
      tokens.forEach(t => {
        assert.doesNotThrow(() => parseNxNMove(t, order), `Scramble token '${t}' must be valid for order ${order}`);
      });
    }
  });
});

describe('NxN Suite: 6. 2D Cross Net Layout & State Synchronization', () => {
  it('creates standard cubic-cross net layout for N=2..7 with correct sticker counts', () => {
    const expectedCounts = { 2: 4, 3: 9, 4: 16, 5: 25, 6: 36, 7: 49 };
    [2, 3, 4, 5, 6, 7].forEach(order => {
      const net = createCubicNetLayout(order);
      assert.equal(net.type, 'cubic-cross');
      assert.equal(net.gridDimension, order);
      assert.equal(net.stickersPerFace, expectedCounts[order]);
      assert.equal(net.gridWidth, 4);
      assert.equal(net.gridHeight, 3);
      assert.ok(net.faces.U && net.faces.D && net.faces.F && net.faces.B && net.faces.L && net.faces.R);
    });
  });

  it('locks fixed centers on odd orders (3x3, 5x5, 7x7) and unlocks on even orders', () => {
    // 2x2: no fixed center
    const net2 = createCubicNetLayout(2);
    assert.equal(net2.hasFixedCenter, false);
    assert.equal(net2.centerIndex, null);

    // 3x3: center index 4
    const net3 = createCubicNetLayout(3);
    assert.equal(net3.hasFixedCenter, true);
    assert.equal(net3.centerIndex, 4);

    // 4x4: no fixed center
    const net4 = createCubicNetLayout(4);
    assert.equal(net4.hasFixedCenter, false);
    assert.equal(net4.centerIndex, null);

    // 5x5: center index 12
    const net5 = createCubicNetLayout(5);
    assert.equal(net5.hasFixedCenter, true);
    assert.equal(net5.centerIndex, 12);

    // 6x6: no fixed center
    const net6 = createCubicNetLayout(6);
    assert.equal(net6.hasFixedCenter, false);
    assert.equal(net6.centerIndex, null);

    // 7x7: center index 24
    const net7 = createCubicNetLayout(7);
    assert.equal(net7.hasFixedCenter, true);
    assert.equal(net7.centerIndex, 24);
  });

  it('bidirectional state synchronization: extracts net state and applies back', () => {
    const model = buildNxNModel(3);
    const extracted = extractNetStateFromNxN(model, 3, CUBE_COLORS);
    assert.ok(extracted.U && extracted.U.length === 9);
    assert.ok(extracted.F && extracted.F.length === 9);

    // Apply custom state
    const modifiedState = { ...extracted };
    modifiedState.U = Array(9).fill('#38BDF8'); // Cyan
    applyNetStateToNxN(model, modifiedState, 3);

    const reExtracted = extractNetStateFromNxN(model, 3, CUBE_COLORS);
    assert.equal(reExtracted.U[0], '#38BDF8');
  });
});

describe('NxN Suite: 7. Central Registry Integration & 4 Difficulty Tiers', () => {
  it('registers all 6 NxN cubes in puzzleRegistry', () => {
    const expectedIds = ['cube-2x2', 'cube-3x3', 'cube-4x4', 'cube-5x5', 'cube-6x6', 'cube-7x7'];
    expectedIds.forEach(id => {
      assert.equal(puzzleRegistry.has(id), true, `Puzzle '${id}' must be registered`);
    });
  });

  it('loads all 6 NxN definitions via loadPuzzle asynchronous resolver', async () => {
    const orders = [2, 3, 4, 5, 6, 7];
    for (const order of orders) {
      const id = `cube-${order}x${order}`;
      const def = await loadPuzzle(id);
      assert.ok(def, `Definition for ${id} must resolve`);
      assert.equal(def.id, id);
      assert.equal(def.order, order);
      assert.equal(def.category, 'nxn');
      assert.equal(typeof def.buildModel, 'function');
      assert.equal(typeof def.animateMove, 'function');
      assert.equal(typeof def.getInverseMove, 'function');
      assert.ok(Array.isArray(def.presets));
      assert.ok(Array.isArray(def.guideStages));
      assert.ok(def.netLayout);
    }
  });

  it('accurately groups NxN cubes into the 4 UX difficulty tiers', () => {
    // 1. Pemula: 2x2, 3x3 (+ pyraminx)
    const beginner = getPuzzlesByDifficulty('beginner');
    const beginnerIds = beginner.map(p => p.id);
    assert.ok(beginnerIds.includes('cube-2x2'));
    assert.ok(beginnerIds.includes('cube-3x3'));

    // 2. Menengah: 4x4 (+ skewb)
    const intermediate = getPuzzlesByDifficulty('intermediate');
    const intermediateIds = intermediate.map(p => p.id);
    assert.ok(intermediateIds.includes('cube-4x4'));

    // 3. Mahir: 5x5 (+ megaminx)
    const advanced = getPuzzlesByDifficulty('advanced');
    const advancedIds = advanced.map(p => p.id);
    assert.ok(advancedIds.includes('cube-5x5'));

    // 4. Master: 6x6, 7x7 (+ square-1)
    const expert = getPuzzlesByDifficulty('expert');
    const expertIds = expert.map(p => p.id);
    assert.ok(expertIds.includes('cube-6x6'));
    assert.ok(expertIds.includes('cube-7x7'));
  });

  it('exports valid individual cube definitions (2x2 to 7x7)', () => {
    assert.equal(cube2x2Definition.order, 2);
    assert.equal(cube3x3Definition.order, 3);
    assert.equal(cube4x4Definition.order, 4);
    assert.equal(cube5x5Definition.order, 5);
    assert.equal(cube6x6Definition.order, 6);
    assert.equal(cube7x7Definition.order, 7);
    const customDef = createNxNDefinition(3, { id: 'custom-3x3' });
    assert.equal(customDef.id, 'custom-3x3');
  });
});
