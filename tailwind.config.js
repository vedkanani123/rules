/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // PipsGuard pure dark
        pips: {
          bg: '#080A10',
          surface: '#111318',
          card: '#16181E',
          border: '#1F2228',
          muted: '#2A2D35',
        },
        brand: {
          50: '#eff6ff',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        slate: {
          850: '#1a1d23',
          900: '#111318',
          950: '#080A10',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
