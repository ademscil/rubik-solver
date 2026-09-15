# Rubik 5x5 Solver 3D & Panduan Interaktif

Aplikasi web interaktif modern untuk memandu dan memecahkan teka-teki **Rubik 5x5 (Professor's Cube)** dengan visualisasi 3D Three.js 60 FPS, kontrol pemutaran timeline rumus langkah demi langkah beranimasi, editor kustomisasi tata letak (2D Net + Preset Kasus Macet), dan kamus notasi lengkap dalam Bahasa Indonesia.

![Rubik 5x5 Solver 3D Preview](https://raw.githubusercontent.com/ademscil/rubik-solver/main/public/preview.png)

---

## Fitur Utama

- **Visualisator 3D Real-time (Three.js)**: 125 cubies dengan stiker glossy berkualitas tinggi, animasi pemutaran layer mulus, dan kontrol kamera 360°.
- **Metode Reduksi Lengkap**:
  1. Tahap 1: Pusat (Centers) - Teknik Bar 1x3, First 2 Centers, Adjacent Centers, & Last 2 Centers (L2C).
  2. Tahap 2: Rusuk (Edges) - Freeslice Method, Flipping Algorithm `R U R' F R' F' R`, & Last 2 Edges (L2E).
  3. Tahap 3: Tahap 3x3 Biasa (Cross, F2L, OLL, PLL).
  4. Tahap 4: Kasus Parity 5x5 - Lucas OLL Parity & PLL Parity.
- **Timeline Playback**: Play/Pause, Step Maju, Step Mundur, Reset, Pengatur Kecepatan (0.5x - 2.0x), dan terjemahan notasi Bahasa Indonesia.
- **Penyesuaian Tata Letak (Layout Customization)**:
  - **Preset Cepat Kasus Macet**: Langsung memuat kondisi OLL Parity, PLL Parity, L2C Bar Swap, L2C Corner Swap, atau L2E Flipping.
  - **Editor Jaring 2D**: Mewarnai stiker 6 sisi secara bebas agar persis dengan kubus asli Anda.
- **Kamus Notasi Interaktif**: Arti lambang notasi WCA 5x5 dengan tombol uji coba putaran langsung ke kubus 3D.

---

## Teknologi yang Digunakan

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Grafis 3D**: [Three.js](https://threejs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Efek**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)

---

## Cara Menjalankan Secara Lokal

1. **Clone repository**:
   ```bash
   git clone https://github.com/ademscil/rubik-solver.git
   cd rubik-solver
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan development server**:
   ```bash
   npm run dev
   ```
   Buka browser di `http://localhost:5173`.

4. **Build untuk produksi**:
   ```bash
   npm run build
   ```

---

## Deployment (Hosting)

Proyek ini telah dikonfigurasi dan siap di-deploy langsung ke **Vercel** atau **Netlify**:

### 1. Deploy ke Vercel
1. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik **Add New Project** $\rightarrow$ **Import Git Repository**.
3. Pilih repository `rubik-solver`.
4. Vercel akan mendeteksi Vite secara otomatis:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Klik **Deploy**!

### 2. Deploy ke Netlify
1. Buka [netlify.com](https://www.netlify.com) dan login dengan akun GitHub Anda.
2. Klik **Add new site** $\rightarrow$ **Import an existing project**.
3. Hubungkan ke GitHub dan pilih repository `rubik-solver`.
4. Netlify akan membaca konfigurasi dari file `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Klik **Deploy Site**!
