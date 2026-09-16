/**
 * Headless WebGL & Three.js Lifecycle Mocks
 * Tracks allocations and verifies cascading disposal to prevent memory leaks.
 */

export class MockBufferGeometry {
  constructor(name = 'MockGeometry') {
    this.name = name;
    this.isDisposed = false;
    this.disposeCount = 0;
  }

  dispose() {
    this.isDisposed = true;
    this.disposeCount++;
  }
}

export class MockMaterial {
  constructor(name = 'MockMaterial') {
    this.name = name;
    this.isDisposed = false;
    this.disposeCount = 0;
  }

  dispose() {
    this.isDisposed = true;
    this.disposeCount++;
  }
}

export class MockTexture {
  constructor(name = 'MockTexture') {
    this.name = name;
    this.isDisposed = false;
    this.disposeCount = 0;
  }

  dispose() {
    this.isDisposed = true;
    this.disposeCount++;
  }
}

export class MockObject3D {
  constructor(name = 'MockObject3D') {
    this.name = name;
    this.children = [];
    this.parent = null;
    this.geometry = null;
    this.material = null;
  }

  add(child) {
    if (child && child !== this) {
      child.parent = this;
      this.children.push(child);
    }
  }

  remove(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      child.parent = null;
      this.children.splice(idx, 1);
    }
  }
}

/**
 * Cascading disposal pipeline implementation adhering to PROJECT.md § Engine Layer
 */
export function disposeHierarchy(root, stats = { geometries: 0, materials: 0, textures: 0 }) {
  if (!root) return stats;

  for (let i = root.children.length - 1; i >= 0; i--) {
    const child = root.children[i];
    disposeHierarchy(child, stats);

    if (child.geometry && typeof child.geometry.dispose === 'function') {
      child.geometry.dispose();
      stats.geometries++;
      child.geometry = null;
    }

    if (child.material) {
      if (Array.isArray(child.material)) {
        for (const mat of child.material) {
          if (mat && typeof mat.dispose === 'function') {
            if (mat.map && typeof mat.map.dispose === 'function') {
              mat.map.dispose();
              stats.textures++;
              mat.map = null;
            }
            mat.dispose();
            stats.materials++;
          }
        }
      } else if (typeof child.material.dispose === 'function') {
        if (child.material.map && typeof child.material.map.dispose === 'function') {
          child.material.map.dispose();
          stats.textures++;
          child.material.map = null;
        }
        child.material.dispose();
        stats.materials++;
      }
      child.material = null;
    }

    root.remove(child);
  }

  return stats;
}

/**
 * Builds a mock cubie mesh tree representing an NxN cube or shape puzzle.
 */
export function buildMockPuzzleMesh(pieceCount = 26, materialsPerPiece = 6) {
  const root = new MockObject3D('PuzzleRoot');

  for (let p = 0; p < pieceCount; p++) {
    const piece = new MockObject3D(`Piece_${p}`);
    piece.geometry = new MockBufferGeometry(`Geom_${p}`);

    if (materialsPerPiece === 1) {
      const mat = new MockMaterial(`Mat_${p}`);
      mat.map = new MockTexture(`Tex_${p}`);
      piece.material = mat;
    } else {
      piece.material = [];
      for (let m = 0; m < materialsPerPiece; m++) {
        const mat = new MockMaterial(`Mat_${p}_${m}`);
        mat.map = new MockTexture(`Tex_${p}_${m}`);
        piece.material.push(mat);
      }
    }

    root.add(piece);
  }

  return root;
}
