import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Raisin Black Palette (Primary Dark Base)
        raisin: {
          950: '#101010',
          900: '#161616',
          850: '#1A1A1A',
          800: '#202020', // Exact base from reference #202020
          700: '#282828',
          600: '#323232',
          500: '#424242',
          border: 'rgba(218, 214, 207, 0.12)',
          borderHover: 'rgba(252, 38, 38, 0.35)',
        },
        // Timberwolf Palette (Primary Neutral Tone)
        timberwolf: {
          50: '#FAF9F7',
          100: '#F2EFEB',
          200: '#E6E2DA',
          300: '#DAD6CF', // Exact neutral from reference #DAD6CF
          400: '#BFB9AE',
          500: '#9E9789',
          600: '#736D61',
          700: '#4E4940',
        },
        // Coral Red Palette (Bold Electric Accent)
        coral: {
          300: '#FF7070',
          400: '#FF4747',
          500: '#FC2626', // Exact accent from reference #FC2626
          600: '#D91212',
          700: '#B00707',
          glow: 'rgba(252, 38, 38, 0.25)',
        },
        // Semantic Accents
        income: {
          DEFAULT: '#10B981',
          light: '#34D399',
          glow: 'rgba(16, 185, 129, 0.2)',
        },
        streak: {
          DEFAULT: '#F59E0B',
          glow: 'rgba(245, 158, 11, 0.25)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px rgba(252, 38, 38, 0.9)',
        'brutal-white': '4px 4px 0px 0px #DAD6CF',
        'brutal-dark': '4px 4px 0px 0px #101010',
        'coral-glow': '0 0 25px rgba(252, 38, 38, 0.35)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(218, 214, 207, 0.08)',
        'card-elevated': '0 12px 30px -4px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(218, 214, 207, 0.15)',
      },
      letterSpacing: {
        'technical': '0.15em',
        'badge': '0.08em',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.85' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
