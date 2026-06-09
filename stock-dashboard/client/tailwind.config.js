/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand purple/indigo used for accents in the new design
        brand: {
          50: '#eef0ff',
          100: '#dfe2ff',
          200: '#c2c6ff',
          300: '#9aa0ff',
          400: '#7c7bff',
          500: '#6c5ce7',
          600: '#5a4ad1',
          700: '#4a3caa',
          800: '#3c3089',
          900: '#262166',
        },
        // Trading green / red
        bull: {
          400: '#22c55e',
          500: '#16c784',
          600: '#0fa869',
        },
        bear: {
          400: '#ef4444',
          500: '#ea3943',
          600: '#cf2730',
        },
        // Glassmorphism dark surface palette
        ink: {
          900: '#0a0e1a',
          800: '#0f1424',
          700: '#161c2f',
          600: '#1d2540',
          500: '#26304f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(8, 12, 28, 0.37)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.04)',
        glow: '0 0 24px rgba(108, 92, 231, 0.35)',
      },
      backgroundImage: {
        'starfield':
          'radial-gradient(ellipse at 20% 30%, rgba(108, 92, 231, 0.18), transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(58, 134, 255, 0.18), transparent 55%)',
        'card-glass':
          'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
        'mesh-glow':
          'radial-gradient(60% 80% at 10% 20%, rgba(108,92,231,0.35) 0%, transparent 60%), radial-gradient(50% 70% at 90% 80%, rgba(72,149,239,0.30) 0%, transparent 60%)',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: 0.2 },
          '50%': { opacity: 1 },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(108,92,231,0.45)' },
          '50%': { boxShadow: '0 0 0 6px rgba(108,92,231,0)' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        twinkle: 'twinkle 3s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.4s ease-in-out infinite',
        floatY: 'floatY 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
