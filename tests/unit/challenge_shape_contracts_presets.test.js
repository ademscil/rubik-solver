/**
 * tests/unit/challenge_shape_contracts_presets.test.js
 * Adversarial Challenger M3-2 Test Suite
 * 
 * Comprehensive Empirical Verification of:
 * 1. Dynamic Registry Loading (puzzleRegistry.load for 'pyraminx', 'skewb', 'megaminx', 'square-1', 'square1')
 * 2. PuzzleDefinition Contract Conformance (validatePuzzleContract & types.js specifications)
 * 3. Execution of all presets and guide algorithms through actual kinematics parsers & animateMove
 * 4. 2D Net layout configuration validity and color scheme bindings
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { puzzleRegistry, normalizePuzzleId } from '../../src/puzzles/registry.js';
import { validatePuzzleContract } from '../helpers/puzzleOracles.js';

// Direct imports of kinematics parsers
import { parsePyraminxMove } from '../../src/puzzles/pyraminx/PyraminxKinematics.js';
import { parseSkewbMove } from '../../src/puzzles/skewb/SkewbKinematics.js';
import { parseMegaminxMove } from '../../src/puzzles/megaminx/MegaminxKinematics.js';
import { parseSquare1Move } from '../../src/puzzles/square1/Square1Kinematics.js';

describe('Adversarial Challenge 1: Dynamic Registry Loading for Shape Puzzles', () => {
  const targetIds = ['pyraminx', 'skewb', 'megaminx', 'square-1', 'square1'];

  for (const id of targetIds) {
    it(`loads '${id}' dynamically via puzzleRegistry.load() without error`, async () => {
      const def = await puzzleRegistry.load(id);
      assert.ok(def, `Definition for '${id}' must be truthy`);
      assert.equal(typeof def, 'object');
      assert.equal(typeof def.buildModel, 'function');
      assert.equal(typeof def.animateMove, 'function');
      assert.equal(typeof def.parseAlgorithm, 'function');
      assert.equal(typeof def.getInverseMove, 'function');
      assert.equal(typeof def.getMoveInfo, 'function');
    });
  }

  it('correctly maps square1 and square-1 through normalization aliases', () => {
    assert.equal(normalizePuzzleId('square1'), 'square-1');
    assert.equal(normalizePuzzleId('square-1'), 'square-1');
    assert.equal(normalizePuzzleId('sq1'), 'square-1');
    assert.equal(normalizePuzzleId('sq-1'), 'square-1');
    assert.equal(normalizePuzzleId('pyra'), 'pyraminx');
    assert.equal(normalizePuzzleId('minx'), 'megaminx');
    assert.equal(normalizePuzzleId('skewb'), 'skewb');
  });

  it('updates metadata loaded flag in catalog when dynamically loaded', async () => {
    await puzzleRegistry.load('pyraminx');
    await puzzleRegistry.load('megaminx');
    await puzzleRegistry.load('skewb');
    await puzzleRegistry.load('square-1');

    assert.equal(puzzleRegistry.isLoaded('pyraminx'), true);
    assert.equal(puzzleRegistry.isLoaded('megaminx'), true);
    assert.equal(puzzleRegistry.isLoaded('skewb'), true);
    assert.equal(puzzleRegistry.isLoaded('square-1'), true);
  });

  it('caches loaded definitions and returns identical references on repeated load', async () => {
    const pyra1 = await puzzleRegistry.load('pyraminx');
    const pyra2 = await puzzleRegistry.load('pyraminx');
    assert.strictEqual(pyra1, pyra2);

    const sq1_a = await puzzleRegistry.load('square-1');
    const sq1_b = await puzzleRegistry.load('square1');
    assert.strictEqual(sq1_a, sq1_b);
  });
});

describe('Adversarial Challenge 2: PuzzleDefinition Interface Contract Validation', () => {
  const shapeIds = ['pyraminx', 'skewb', 'megaminx', 'square-1', 'square1'];

  for (const id of shapeIds) {
    it(`validates loaded definition '${id}' against validatePuzzleContract`, async () => {
      const def = await puzzleRegistry.load(id);
      assert.equal(validatePuzzleContract(def), true);
    });
  }

  it('verifies all comprehensive fields from types.js across all 4 shape puzzles', async () => {
    const puzzles = [
      await puzzleRegistry.load('pyraminx'),
      await puzzleRegistry.load('skewb'),
      await puzzleRegistry.load('megaminx'),
      await puzzleRegistry.load('square-1')
    ];

    const requiredFields = [
      'id', 'wcaId', 'name', 'shortName', 'category', 'difficulty', 'difficultyLabel',
      'faceCount', 'defaultCameraDistance', 'minCameraDistance', 'maxCameraDistance',
      'description', 'hasParity', 'colorScheme', 'buildModel', 'animateMove',
      'parseAlgorithm', 'getInverseMove', 'getMoveInfo', 'generateScramble',
      'notation', 'guideStages', 'presets', 'netLayout'
    ];

    for (const p of puzzles) {
      for (const field of requiredFields) {
        assert.ok(field in p, `Puzzle '${p.id}' missing required field '${field}' from types.js contract`);
      }
      assert.equal(p.category, 'shape');
      assert.ok(['beginner', 'intermediate', 'advanced', 'expert'].includes(p.difficulty));
      assert.ok(p.defaultCameraDistance > 0);
      assert.ok(p.faceCount > 0);
      assert.ok(Array.isArray(p.guideStages) && p.guideStages.length > 0);
      assert.ok(Array.isArray(p.presets) && p.presets.length > 0);
    }
  });

  it('verifies 3D model instantiation and reset for all shape puzzles', async () => {
    const shapePuzzles = ['pyraminx', 'skewb', 'megaminx', 'square-1'];
    for (const id of shapePuzzles) {
      const def = await puzzleRegistry.load(id);
      const model = def.buildModel();
      assert.ok(model, `buildModel() returned falsy value for '${id}'`);
      assert.ok(model.children.length > 0, `model has 0 children for '${id}'`);

      if (typeof def.resetModel === 'function') {
        assert.doesNotThrow(() => def.resetModel(model), `resetModel threw error for '${id}'`);
      }
    }
  });
});

describe('Adversarial Challenge 3: Presets & Algorithms Execution through Kinematics Parsers', () => {
  it('Pyraminx: all presets algorithms execute cleanly through Pyraminx kinematics', async () => {
    const def = await puzzleRegistry.load('pyraminx');
    const model = def.buildModel();
    for (const preset of def.presets) {
      const alg = preset.algorithm || preset.setupMoves || '';
      if (!alg) continue;

      const tokens = def.parseAlgorithm(alg);
      assert.ok(tokens.length > 0, `Preset '${preset.id}' failed to tokenize: '${alg}'`);

      for (const token of tokens) {
        assert.doesNotThrow(() => {
          const parsed = parsePyraminxMove(token);
          assert.ok(parsed.axis, `Move '${token}' parsed without axis`);
        }, `Pyraminx kinematics failed to parse token '${token}' in preset '${preset.id}'`);

        assert.doesNotThrow(() => {
          const inv = def.getInverseMove(token);
          assert.ok(inv, `Inverse move empty for '${token}'`);
        }, `Failed to invert '${token}'`);

        const info = def.getMoveInfo(token);
        assert.ok(info.desc, `Missing Indonesian description for token '${token}'`);

        // Test animation execution
        assert.doesNotThrow(() => {
          def.animateMove(token, model, () => {}, 0);
        });
      }
    }
  });

  it('Square-1: all presets and guide algorithms execute cleanly through Square-1 kinematics', async () => {
    const def = await puzzleRegistry.load('square-1');
    const model = def.buildModel();
    for (const preset of def.presets) {
      const alg = preset.algorithm || preset.setupMoves || '';
      if (!alg) continue;

      const tokens = def.parseAlgorithm(alg);
      assert.ok(tokens.length > 0, `Square-1 preset '${preset.id}' failed to tokenize: '${alg}'`);

      for (const token of tokens) {
        assert.doesNotThrow(() => {
          const parsed = parseSquare1Move(token);
          assert.ok(parsed.type === 'slice' || parsed.type === 'layer_turn');
        }, `Square-1 kinematics failed on token '${token}' in preset '${preset.id}'`);

        assert.doesNotThrow(() => {
          const inv = def.getInverseMove(token);
          assert.ok(inv);
        });

        assert.doesNotThrow(() => {
          def.animateMove(token, model, () => {}, 0);
        });
      }
    }

    // Check guide stage cases
    for (const stage of def.guideStages) {
      for (const c of stage.cases || []) {
        if (!c.algorithm) continue;
        const tokens = def.parseAlgorithm(c.algorithm);
        for (const token of tokens) {
          assert.doesNotThrow(() => {
            parseSquare1Move(token);
          }, `Square-1 guide case '${c.id}' token '${token}' failed parsing in '${c.algorithm}'`);

          assert.doesNotThrow(() => {
            def.animateMove(token, model, () => {}, 0);
          });
        }
      }
    }
  });

  it('Skewb: verifies parseSkewbMove and animateMove accept y2 in center-swap preset and guide', async () => {
    const def = await puzzleRegistry.load('skewb');
    const model = def.buildModel();

    // Sledgehammer executes cleanly
    const sledgehammer = def.presets.find(p => p.id === 'sledgehammer');
    assert.ok(sledgehammer);
    for (const t of def.parseAlgorithm(sledgehammer.algorithm)) {
      assert.doesNotThrow(() => parseSkewbMove(t));
      assert.doesNotThrow(() => def.animateMove(t, model, () => {}, 0));
    }

    // center-swap contains 'y2' which parseSkewbMove now supports
    const centerSwap = def.presets.find(p => p.id === 'center-swap');
    assert.ok(centerSwap);
    const tokens = def.parseAlgorithm(centerSwap.algorithm);
    assert.ok(tokens.includes('y2'), "center-swap algorithm must contain 'y2'");

    assert.doesNotThrow(
      () => parseSkewbMove('y2'),
      "Expected parseSkewbMove('y2') to succeed with whole-cube rotation support"
    );

    assert.doesNotThrow(
      () => def.animateMove('y2', model, () => {}, 0),
      "Expected animateMove('y2') to succeed during playback of center-swap"
    );
  });

  it('Megaminx: verifies parseMegaminxMove and animateMove accept U2 in last layer guide stage', async () => {
    const def = await puzzleRegistry.load('megaminx');
    const model = def.buildModel();

    // Presets white-star and last-layer execute cleanly
    for (const preset of def.presets) {
      const alg = preset.algorithm || preset.setupMoves;
      if (!alg) continue;
      for (const t of def.parseAlgorithm(alg)) {
        assert.doesNotThrow(() => parseMegaminxMove(t));
        assert.doesNotThrow(() => def.animateMove(t, model, () => {}, 0));
      }
    }

    // ll-corner-cycle in last layer stage contains 'U2' which is now supported
    const lastLayerStage = def.guideStages.find(s => s.id === 'megaminx-stage-3');
    assert.ok(lastLayerStage);
    const cornerCycleCase = lastLayerStage.cases.find(c => c.id === 'll-corner-cycle');
    assert.ok(cornerCycleCase);
    const tokens = def.parseAlgorithm(cornerCycleCase.algorithm);
    assert.ok(tokens.includes('U2'), "ll-corner-cycle algorithm must contain 'U2'");

    assert.doesNotThrow(
      () => parseMegaminxMove('U2'),
      "Expected parseMegaminxMove('U2') to succeed with double turn support"
    );

    assert.doesNotThrow(
      () => def.animateMove('U2', model, () => {}, 0),
      "Expected animateMove('U2') to succeed during playback of ll-corner-cycle"
    );
  });
});

describe('Adversarial Challenge 4: 2D Net Layout & Color Scheme Bindings', () => {
  it('Pyraminx 2D net layout is consistent with 4 faces and 36 stickers', async () => {
    const def = await puzzleRegistry.load('pyraminx');
    const net = def.netLayout;
    assert.ok(net);
    assert.equal(net.type, 'tetrahedron_net');
    assert.equal(Object.keys(net.faces).length, 4);

    const faceKeys = ['F', 'R', 'L', 'D'];
    for (const key of faceKeys) {
      assert.ok(key in net.faces, `Face '${key}' missing from netLayout`);
      assert.ok(key in def.colorScheme, `Face '${key}' missing from colorScheme`);
      const color = def.colorScheme[key];
      assert.match(color.hex, /^#[0-9A-Fa-f]{6}$/, `Invalid hex color for '${key}'`);
    }
  });

  it('Skewb 2D net layout is consistent with 6 faces and 30 facets', async () => {
    const def = await puzzleRegistry.load('skewb');
    const net = def.netLayout;
    assert.ok(net);
    assert.equal(net.facetsPerFace, 5);
    assert.equal(net.totalStickers, 30);
    assert.equal(net.faces.length, 6);

    assert.ok(Array.isArray(def.colorScheme) || typeof def.colorScheme === 'object');
    const hexList = Array.isArray(def.colorScheme)
      ? def.colorScheme
      : Object.values(def.colorScheme).map(c => c.hex || c);
    assert.equal(hexList.length, 6);
    for (const hex of hexList) {
      assert.match(hex, /^#[0-9A-Fa-f]{6}$/, `Invalid hex '${hex}' in Skewb colorScheme`);
    }
  });

  it('Megaminx 2D net layout is consistent with 12 faces and 132 stickers', async () => {
    const def = await puzzleRegistry.load('megaminx');
    const net = def.netLayout;
    assert.ok(net);
    assert.equal(net.facesCount, 12);
    assert.equal(net.stickersPerFace, 11);
    assert.equal(net.totalStickers, 132);

    const hexList = Array.isArray(def.colorScheme)
      ? def.colorScheme.map(c => c.hex || c)
      : Object.values(def.colorScheme).map(c => c.hex || c);
    assert.equal(hexList.length, 12);
    for (const hex of hexList) {
      assert.match(hex, /^#[0-9A-Fa-f]{6}$/, `Invalid hex '${hex}' in Megaminx colorScheme`);
    }
  });

  it('Square-1 2D net layout is consistent with 2 discs + equator (18 stickers)', async () => {
    const def = await puzzleRegistry.load('square-1');
    const net = def.netLayout;
    assert.ok(net);
    assert.equal(net.type, 'dual-disc-equator');
    assert.equal(net.totalStickers, 18);
    assert.deepEqual(net.discs, ['top', 'bottom']);

    const hexList = Array.isArray(def.colorScheme)
      ? def.colorScheme.map(c => c.hex || c)
      : Object.values(def.colorScheme).map(c => c.hex || c);
    assert.ok(hexList.length >= 6);
    for (const hex of hexList) {
      assert.match(hex, /^#[0-9A-Fa-f]{6}$/, `Invalid hex '${hex}' in Square-1 colorScheme`);
    }
  });
});
