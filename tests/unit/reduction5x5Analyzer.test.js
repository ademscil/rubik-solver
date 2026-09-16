/**
 * tests/unit/reduction5x5Analyzer.test.js
 * Unit test suite for 5x5 Reduction State Analyzer & Curriculum Navigator
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isFaceCenterSolved5x5,
  analyzeCenters5x5,
  analyzeEdges5x5,
  analyze5x5ReductionState,
  CENTER_INDICES_5X5,
  FIXED_CENTER_INDEX_5X5
} from '../../src/solvers/reduction5x5Analyzer.js';

function getSolved5x5Net() {
  const faceColors = {
    U: '#FFFFFF',
    D: '#FFD500',
    F: '#009B48',
    B: '#0046AD',
    L: '#FF5800',
    R: '#B71234'
  };
  const net = {};
  for (const [f, hex] of Object.entries(faceColors)) {
    net[f] = Array(25).fill(hex);
  }
  return net;
}

describe('5x5 Reduction State Analyzer', () => {
  it('identifies fixed center and center indices', () => {
    assert.equal(FIXED_CENTER_INDEX_5X5, 12);
    assert.equal(CENTER_INDICES_5X5.length, 9);
    assert.deepEqual(CENTER_INDICES_5X5, [6, 7, 8, 11, 12, 13, 16, 17, 18]);
  });

  it('detects solved face centers correctly', () => {
    const face = Array(25).fill('#FFFFFF');
    assert.equal(isFaceCenterSolved5x5(face), true);

    // Corrupt one center sticker
    face[6] = '#009B48';
    assert.equal(isFaceCenterSolved5x5(face), false);

    // Non-center sticker doesn't affect center check
    face[6] = '#FFFFFF';
    face[0] = '#009B48'; // corner of face
    assert.equal(isFaceCenterSolved5x5(face), true);
  });

  it('analyzes all 6 centers on a solved net', () => {
    const net = getSolved5x5Net();
    const result = analyzeCenters5x5(net);
    assert.equal(result.allCentersSolved, true);
    assert.equal(result.uDComplete, true);
    assert.equal(result.sideCentersComplete, true);
  });

  it('detects incomplete U/D centers as Stage 1', () => {
    const net = getSolved5x5Net();
    net.U[6] = '#FFD500'; // corrupt top center

    const analysis = analyze5x5ReductionState(net);
    assert.equal(analysis.stageIndex, 0);
    assert.equal(analysis.stageId, '5x5-stage-centers');
    assert.ok(analysis.stageTitle.includes('2 Pusat Pertama'));
    assert.equal(analysis.highlightMode, 'centers');
  });

  it('detects incomplete side centers as Stage 2', () => {
    const net = getSolved5x5Net();
    net.F[6] = '#0046AD'; // corrupt front center, while U and D are solved

    const analysis = analyze5x5ReductionState(net);
    assert.equal(analysis.stageIndex, 0);
    assert.equal(analysis.stageId, '5x5-stage-centers');
    assert.ok(analysis.stageTitle.includes('4 Pusat Samping'));
    assert.equal(analysis.highlightMode, 'centers');
  });

  it('detects scrambled edges with solved centers as Stage 3 (First 8 Edges)', () => {
    const net = getSolved5x5Net();
    // Corrupt edges so pairedCount < 8
    // UF edge: U [21, 22, 23] and F [1, 2, 3]
    net.U[21] = '#0046AD';
    net.U[1] = '#FF5800';
    net.U[5] = '#FFD500';
    net.U[9] = '#FFD500';
    net.D[1] = '#009B48';
    net.D[21] = '#FF5800';

    const edges = analyzeEdges5x5(net);
    assert.ok(edges.pairedCount < 8);

    const analysis = analyze5x5ReductionState(net);
    assert.equal(analysis.stageIndex, 1);
    assert.equal(analysis.stageId, '5x5-stage-edges-first8');
    assert.ok(analysis.stageTitle.includes('8 Rusuk Pertama'));
    assert.equal(analysis.highlightMode, 'edges');
  });

  it('detects 8 to 11 paired edges as Stage 4 (Last 4 Edges / L4E)', () => {
    const net = getSolved5x5Net();
    // Corrupt only 2 edges (10 paired)
    net.U[21] = '#FF5800';
    net.U[1] = '#0046AD';

    const edges = analyzeEdges5x5(net);
    assert.equal(edges.pairedCount, 10);

    const analysis = analyze5x5ReductionState(net);
    assert.equal(analysis.stageIndex, 2);
    assert.equal(analysis.stageId, '5x5-stage-edges-last4');
    assert.ok(analysis.stageTitle.includes('4 Rusuk Terakhir'));
    assert.equal(analysis.highlightMode, 'edges');
  });

  it('detects fully reduced 5x5 as Stage 5 (3x3 Phase / Parity)', () => {
    const net = getSolved5x5Net();
    const analysis = analyze5x5ReductionState(net);
    assert.equal(analysis.stageIndex, 3);
    assert.equal(analysis.stageId, '5x5-stage-3x3');
    assert.ok(analysis.stageTitle.includes('Kubus 3x3'));
    assert.equal(analysis.highlightMode, 'all');
  });
});
