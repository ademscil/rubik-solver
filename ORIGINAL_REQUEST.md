# Original User Request

## 2026-09-15T06:25:20Z

# Teamwork Project Prompt

> Requested team: Gunakan seluruh peran software development (Software Architect, Frontend/3D Graphics Engineer, UI/UX Designer, QA Automation Engineer, Performance & Security Auditor)

Membangun platform universal Rubik & Twisty Puzzle Solver 3D yang mencakup seluruh varian resmi WCA (Kubus 2x2, 3x3, 4x4, 5x5, 6x6, 7x7, Pyraminx, Megaminx, Skewb, dan Square-1) dengan visualisasi 3D interaktif, panduan penyelesaian langkah demi langkah, serta audit menyeluruh pada seluruh siklus rekayasa perangkat lunak.

Working directory: D:\aplikasi\rubik solver
Integrity mode: development
Live deployment URL: https://rubikguide.netlify.app/
GitHub repository: https://github.com/ademscil/rubik-solver

## Requirements

### R1. Universal 3D Twisty Puzzle Rendering Engine
Sistem harus menyediakan visualisasi 3D interaktif berbasis Three.js dengan arsitektur modular yang mampu merender dan menganimasikan seluruh varian resmi WCA:
- Kubus NxN: 2x2 (Pocket), 3x3 (Standard), 4x4 (Revenge), 5x5 (Professor's), 6x6, dan 7x7.
- Shape/Non-Cube Puzzles: Pyraminx (Tetrahedron), Megaminx (Dodecahedron), Skewb (Corner-turning), dan Square-1 (Shape-shifting).
Setiap puzzle harus mendukung manipulasi layer yang mulus, kontrol kamera orbit 360°, dan pencahayaan studio yang konsisten.

### R2. Algorithmic Solvers & Interactive Learning Guides
Setiap varian puzzle harus dilengkapi dengan materi panduan terstruktur langkah demi langkah (misal: CFOP/Layer-by-Layer untuk 3x3, Ortega/LBL untuk 2x2, Reduction & Parity untuk 4x4-7x7, LBL/Top-First untuk Pyraminx/Megaminx) serta playback timeline interaktif (Play, Pause, Step Next/Prev, Speed slider, dan terjemahan notasi Bahasa Indonesia).

### R3. Universal Puzzle Selector & State Customization
Aplikasi harus menyediakan antarmuka terpadu untuk berganti puzzle dengan mulus tanpa reload halaman, serta mendukung penyesuaian susunan stiker/warna (2D net atau preset kasus macet populer) untuk setiap jenis puzzle.

### R4. Full Software Development Lifecycle Audit & Quality Engineering
Tim pengembangan harus melaksanakan audit menyeluruh lintas peran:
- **Software Architect**: Memastikan arsitektur state management dan geometri puzzle modular, decoupled, dan mudah diekspansi.
- **Frontend & 3D Engineer**: Mengoptimalkan performa rendering WebGL agar tetap stabil pada 60 FPS bahkan untuk puzzle bermesh kompleks (6x6, 7x7, Megaminx).
- **UI/UX Designer**: Menjamin tata letak navigasi antar-puzzle, bilah kontrol playback, dan sidebar panduan responsif di desktop maupun mobile.
- **QA Automation Engineer**: Membangun unit test otomatis untuk parsing notasi, eksekusi gerakan matematis puzzle, dan validasi build.
- **Performance & Security Auditor**: Memastikan zero memory leaks, pembersihan WebGL buffers saat berganti puzzle, dan kesiapan deployment ke Vercel/Netlify.

## Acceptance Criteria

### Puzzle Coverage & 3D Rendering
- [ ] Tersedia selektor untuk berpindah secara mulus ke seluruh 10 puzzle resmi WCA (2x2, 3x3, 4x4, 5x5, 6x6, 7x7, Pyraminx, Megaminx, Skewb, Square-1).
- [ ] Setiap puzzle menampilkan geometri 3D yang akurat dan layer-layer yang dapat berputar sesuai notasi resmi masing-masing.
- [ ] Performa animasi 3D berjalan mulus tanpa context loss atau lag saat berganti puzzle.

### Solver & Interactive Guide
- [ ] Setiap puzzle memiliki modul panduan terstruktur dengan algoritma valid dan penjelasan Bahasa Indonesia.
- [ ] Timeline playback berfungsi penuh (Play/Pause, Step Forward/Backward, Slider Kecepatan) pada setiap jenis puzzle.
- [ ] Kasus khusus (Parity pada 4x4, 5x5, 6x6, 7x7, Square-1) memiliki panduan dan preset khusus.

### Engineering & Quality Audit
- [ ] Perintah `npm run build` sukses 100% tanpa error kompilasi atau peringatan kritis.
- [ ] Semua konfigurasi hosting (Vercel dan Netlify) tetap valid dan terverifikasi siap deploy.
- [ ] Kode sumber tertata rapi, terdokumentasi, dan bebas dari duplikasi berlebih.

## 2026-09-15T06:33:09Z

[PENTING - PRIORITAS UTAMA DARI PENGGUNA]:
Pengguna memberikan instruksi eksplisit terkait User Experience (UX):
"Rancangan yang Anda buat harus memudahkan dalam sisi user experience, web tidak boleh sulit digunakan karena untuk pembelajaran rubik dari awal sampai mahir."

Implementasikan prinsip-prinsip UX berikut di seluruh modul:
1. Kategorisasi Level Kesulitan Puzzle yang Jelas:
   - Pemula (Beginner): 2x2, 3x3, Pyraminx
   - Menengah (Intermediate): 4x4, Skewb
   - Mahir (Advanced): 5x5, Megaminx
   - Master (Expert): 6x6, 7x7, Square-1
2. Metode Belajar Bertingkat (Progressive Learning):
   - Sediakan panduan Metode Pemula (Beginner Layer-by-Layer / intuitive) yang sangat ramah orang awam sebelum menyajikan metode mahir (CFOP / Reduction / Advanced Parity).
   - Penjelasan bahasa Indonesia yang membumi dan mudah dipahami dengan analogi visual (bukan sekadar deretan rumus notasi mentah).
3. Bantuan Visual Interaktif:
   - Visual cue / highlight potongan yang harus diperhatikan di kubus 3D.
   - Penanda langkah aktif yang sangat jelas dan kontrol kecepatan animasi yang mudah dijangkau.
4. Tidak boleh ada antarmuka yang membingungkan atau membuat pengguna awam merasa terintimidasi. Pastikan navigasi bersih, intuitif, dan responsif di layar HP maupun laptop.

## 2026-09-15T07:00:50Z

Server telah kembali online dan kuota model Gemini sudah tersedia kembali secara penuh.
Silakan lanjutkan kembali eksekusi tugas yang sempat tertahan:
1. Selesaikan evaluasi/perbaikan Milestone 1 Iterasi 2.
2. Lanjutkan orkestrator suksesi generasi ke Milestone berikutnya.
3. Tuntaskan implementasi seluruh 10 puzzle resmi WCA (NxN 2x2-7x7 dan non-kubus: Pyraminx, Megaminx, Skewb, Square-1).
4. Pastikan prinsip UX yang ramah pengguna dari pemula (Beginner LBL) sampai mahir tetap terpenuhi dengan baik.
5. Jalankan suite pengujian dan pastikan build siap di-deploy ke Netlify (https://rubikguide.netlify.app/).

## 2026-09-15T07:42:41Z

[PENTING - KEBIJAKAN MODEL & PENGHEMATAN USAGE DARI PENGGUNA]:
Pengguna secara eksplisit menginstruksikan:
"Untuk sub agent yang bekerja pakai model yang hemat usage saja, orchestratornya saja pakai gemini 3.8 flash high"

Instruksi untuk Orchestrator Gen 2 dan seluruh sistem:
1. Hanya Orchestrator yang menggunakan model tingkat tinggi (Gemini 3.8 Flash High / inherit).
2. Setiap kali Orchestrator melakukan spawn sub-agen pekerja (baik worker, explorer, tester, reviewer, maupun challenger), WAJIB menetapkan parameter `Model: 'flash_lite'` (atau `'flash'`) agar sangat hemat usage kuota Gemini.
3. Terapkan efisiensi konteks (context efficiency) pada setiap prompt sub-agen agar tidak memakan token berlebih.

## 2026-09-16T01:47:49Z

# Teamwork Project Prompt — Continuation (Phase 2)

> Status: Launched — Resuming after session limit reset
> Requested team: Gunakan seluruh peran software development (Software Architect, Frontend/3D Graphics Engineer, UI/UX Designer, QA Automation Engineer, Performance & Security Auditor)
> Model Allocation Policy: Orchestrator Gemini 3.8 Flash; seluruh sub-agen pekerja (workers, testers, reviewers, challengers) WAJIB menggunakan model hemat usage ('flash_lite' / 'flash') untuk efisiensi kuota.

Menyelesaikan implementasi platform universal Rubik & Twisty Puzzle Solver 3D untuk seluruh 10 varian resmi WCA, melanjutkan progres yang telah menyelesaikan Milestone 1 (Foundation) & Milestone 2 (NxN 2x2–7x7) serta sebagian Milestone 3 (Pyraminx & Skewb dasar).

Working directory: D:\aplikasi\rubik solver
Integrity mode: development
Live deployment URL: https://rubikguide.netlify.app/
GitHub repository: https://github.com/ademscil/rubik-solver

## Progres Yang Sudah Selesai (JANGAN DIULANG):
1. **Milestone 1**: CameraManager, TextureCache, DisposalPipeline, types.js, registry.js (577 unit test PASS).
2. **Milestone 2**: NxN cubes 2x2 sampai 7x7 lengkap (Geometry, Kinematics, Guides LBL/CFOP/Reduksi, Presets, Parity, 0-drift matrix snapping).
3. **Milestone 3 (Parsial)**:
   - `src/puzzles/pyraminx/PyraminxGeometry.js` (SELESAI)
   - `src/puzzles/pyraminx/PyraminxKinematics.js` (SELESAI)
   - `src/puzzles/pyraminx/pyraminx.js` (SELESAI)
   - `src/puzzles/skewb/SkewbGeometry.js` (SELESAI)
   - `src/puzzles/skewb/SkewbKinematics.js` (SELESAI)

---

## Requirements Sisa Yang Wajib Diselesaikan:

### R1. Penyelesaian Shape Puzzles (Milestone 3)
Lengkapi seluruh file yang belum ada untuk shape puzzles:
1. **Skewb**:
   - `src/puzzles/skewb/skewb.js`: PuzzleDefinition lengkap (guides, presets, netLayout, colorScheme, export `skewbDefinition`).
2. **Megaminx (Dodecahedron 12 sisi)**:
   - `src/puzzles/megaminx/MegaminxGeometry.js`: Geometri 3D Three.js 12 sisi pentagonal dengan warna resmi WCA.
   - `src/puzzles/megaminx/MegaminxKinematics.js`: Parser notasi WCA (R++, R--, D++, D--, U, U'), kalkulasi rotasi 72°, scramble generator, deskripsi Bahasa Indonesia.
   - `src/puzzles/megaminx/megaminx.js`: PuzzleDefinition lengkap (guides tahap bintang, F2L/f2l-minx, LL, presets, netLayout).
3. **Square-1 (Shape-Shifting)**:
   - `src/puzzles/square1/Square1Geometry.js`: Geometri 3D lapisan atas/tengah/bawah dengan potongan 30° kite & 60° triangular edge.
   - `src/puzzles/square1/Square1Kinematics.js`: Parser notasi WCA `(x, y) /` (misal `(1, 0) / (-3, 0) /`), rotasi slice 180°, deskripsi Bahasa Indonesia.
   - `src/puzzles/square1/square1.js`: PuzzleDefinition lengkap (guides tahap Cube Shape, Corner Orientation, Parity, presets, netLayout).
4. **Registry Integration**:
   - Daftarkan lazy loader untuk `pyraminx`, `megaminx`, `skewb`, dan `square-1` di `src/puzzles/registry.js`.

### R2. Universal UI Integration & User Experience (Milestone 4)
Perbarui UI agar mendukung seluruh 10 puzzle secara seamless dan sangat mudah digunakan (UX beginner-friendly):
1. **PuzzleSelector Component (`src/components/PuzzleSelector.jsx`)**:
   - Menampilkan 10 puzzle dikelompokkan berdasarkan 4 tingkat kesulitan:
     - 🟢 **Pemula**: 2x2, 3x3, Pyraminx
     - 🟡 **Menengah**: 4x4, Skewb
     - 🟠 **Mahir**: 5x5, Megaminx
     - 🔴 **Master**: 6x6, 7x7, Square-1
   - Desain kartu interaktif, badge status, transisi halus tanpa reload halaman.
2. **Universal RubikViewer (`src/components/RubikViewer.jsx`)**:
   - Menggunakan puzzle definition aktif dari `registry.load(puzzleId)`.
   - Mengintegrasikan `CameraManager` untuk auto-fit kamera sesuai `defaultCameraDistance` puzzle.
   - Mengintegrasikan `DisposalPipeline` saat berganti puzzle untuk mencegah memory leak WebGL.
   - Mendukung manipulasi animasi `animateMove()` sesuai kinematics puzzle aktif.
3. **Dynamic GuideSidebar (`src/components/GuideSidebar.jsx`)**:
   - Menampilkan tahapan panduan (`guideStages`) sesuai puzzle yang sedang dipilih.
   - Search/Kamus rumus cepat Bahasa Indonesia.
4. **Universal PlaybackBar (`src/components/PlaybackBar.jsx`)**:
   - Parsing algoritma & info gerakan dinamis sesuai puzzle aktif.
   - Kontrol playback (Play, Pause, Step Next/Prev, Speed Slider).
5. **Universal Modals**:
   - `NotationModal`: Menampilkan kamus notasi interaktif untuk puzzle aktif.
   - `CustomLayoutModal`: Menampilkan 2D Net editor & presets sesuai puzzle aktif.
6. **Header (`src/components/Header.jsx`)**:
   - Nama puzzle aktif, tombol buka Puzzle Selector, Scramble, Reset.

### R3. Quality Assurance, Build & Deployment Verification
1. Jalankan `npm run build` dan pastikan 100% lulus tanpa warning kompilasi.
2. Jalankan test suite dan pastikan semua lulus.
3. Git Commit & Push sesuai aturan user:
   - Tidak boleh ada atribusi AI di commit message.
   - Switch akun ke `ademscil` sebelum push (`git config user.name "ademscil"`, `git config user.email "adamjuliansyahcv@gmail.com"`, `gh auth switch --user ademscil`).
   - Push ke branch `main` GitHub (auto-deploy ke Netlify https://rubikguide.netlify.app/).
   - Setelah push, kembalikan auth ke `AOP-B2B-DEV` (`gh auth switch --user AOP-B2B-DEV`).

---

## Acceptance Criteria:
- [ ] Seluruh 10 puzzle resmi WCA (2x2, 3x3, 4x4, 5x5, 6x6, 7x7, Pyraminx, Megaminx, Skewb, Square-1) dapat dibuka dan dimainkan di 3D viewer.
- [ ] Ganti puzzle via PuzzleSelector berjalan mulus tanpa reload halaman dan tanpa WebGL memory leak.
- [ ] Panduan interaktif Bahasa Indonesia tersedia untuk ke-10 puzzle dengan algoritma yang dapat diputar di playback bar.
- [ ] Notasi dan scrambler akurat untuk masing-masing puzzle.
- [ ] `npm run build` sukses 100% di production.
- [ ] Commit dan push berhasil ke GitHub `ademscil` tanpa atribusi AI.
