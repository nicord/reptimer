import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        warmup: '#FDE68A',
        work: '#86EFAC',
        rest: '#BAE6FD',
        finisher: '#FDA4AF',
        cooldown: '#DDD6FE',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce 1s ease-in-out infinite',
      },
      fontFamily: {
        mono: ['Monaco', 'Menlo', 'Ubuntu Mono', 'monospace'],
      },
      fontSize: {
        '8xl': '6rem',
        '9xl': '8rem',
      },
    },
  },
  plugins: [],
} satisfies Config
