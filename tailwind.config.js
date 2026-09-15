/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cube: {
          white: '#FFFFFF',
          yellow: '#FFD500',
          green: '#009B48',
          blue: '#0046AD',
          red: '#B71234',
          orange: '#FF5800',
          dark: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
          accent: '#38bdf8',
        }
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

