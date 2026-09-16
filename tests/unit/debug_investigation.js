import * as THREE from 'three';
import { buildNxNModel } from '../../src/puzzles/nxn/NxNGeometry.js';
import { animateNxNMove, parseNxNMove } from '../../src/puzzles/nxn/NxNKinematics.js';
import { getInverseMove } from '../../src/solvers/notation/nxnNotation.js';

console.log('=== INVESTIGATION 1: reusablePivot ===');
{
  const model = buildNxNModel(3);
  const reusablePivot = new THREE.Group();
  const c = model.children.find(x => x.name === 'cubie_2_0_0');
  console.log('Initial pos:', c.position);
  console.log('Initial rot:', c.rotation);
  console.log('Initial mat:', c.matrix.elements);

  for (let i = 0; i < 4; i++) {
    animateNxNMove(model, 'R', null, 0, reusablePivot);
    console.log(`After R #${i + 1}: pos=(${c.position.x}, ${c.position.y}, ${c.position.z}), rot=(${c.rotation.x}, ${c.rotation.y}, ${c.rotation.z})`);
    console.log('mat:', c.matrix.elements);
  }
}

console.log('\n=== INVESTIGATION 2: 100 moves on 4x4 ===');
{
  const pool = ['R', "R'", 'R2', 'U', "U'", 'U2', 'F', 'Rw', "Rw'", '2R', 'Uw', '2U', 'Fw', '2F', 'x', 'y'];
  let seed = 42 + 4 * 17;
  const moves = [];
  for (let i = 0; i < 100; i++) {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    const idx = Math.abs(seed) % pool.length;
    moves.push(pool[idx]);
  }
  console.log('Generated 100 moves for 4x4:', moves.slice(0, 10), '...');

  const model = buildNxNModel(4);
  const c0 = model.children[0];
  console.log('Before moves cubie 0 pos:', c0.position);

  // Apply 100 moves
  for (const m of moves) {
    animateNxNMove(model, m, null, 0);
  }

  // Invert 100 moves
  const invMoves = moves.slice().reverse().map(getInverseMove);
  for (const inv of invMoves) {
    animateNxNMove(model, inv, null, 0);
  }

  console.log('After inverse cubie 0 pos:', c0.position);

  let driftedCount = 0;
  model.children.forEach(child => {
    const initX = (child.userData.initialLayerX - 1.5) * 1.0;
    const initY = (child.userData.initialLayerY - 1.5) * 1.0;
    const initZ = (child.userData.initialLayerZ - 1.5) * 1.0;
    const dist = Math.hypot(child.position.x - initX, child.position.y - initY, child.position.z - initZ);
    if (dist > 1e-4) {
      driftedCount++;
      console.log(`DRIFTED: ${child.name} at (${child.position.x}, ${child.position.y}, ${child.position.z}) expected (${initX}, ${initY}, ${initZ}) dist=${dist}`);
    }
  });
  console.log('Total drifted cubies on 4x4:', driftedCount);
}
