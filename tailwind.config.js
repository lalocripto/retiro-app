/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0a0e1a',
          elevated: '#11172a',
          muted: '#1a2138',
          hover: '#1f2745',
        },
        gold: {
          DEFAULT: '#c9a961',
          soft: '#e0c98a',
          deep: '#a8893f',
        },
        sky: {
          DEFAULT: '#60a5fa',
          deep: '#3b82f6',
        },
        rose: {
          DEFAULT: '#f87171',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px -8px rgba(201, 169, 97, 0.35)',
      },
    },
  },
  plugins: [],
};
