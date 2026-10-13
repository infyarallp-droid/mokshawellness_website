import type { Config } from 'tailwindcss';

// Colours are CSS variables (see globals.css) so the palette can be re-tuned to
// the final logo in one place.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: 'rgb(var(--cream) / <alpha-value>)',
        sand: 'rgb(var(--sand) / <alpha-value>)',
        sage: 'rgb(var(--sage) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        forest: 'rgb(var(--forest) / <alpha-value>)',
        brand: 'rgb(var(--brand) / <alpha-value>)',
        clay: 'rgb(var(--clay) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      maxWidth: { content: '72rem' },
      keyframes: {
        breathe: { '0%, 100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.06)' } },
        drift: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      animation: { breathe: 'breathe 9s ease-in-out infinite', drift: 'drift 12s ease-in-out infinite' },
    },
  },
  plugins: [],
};

export default config;
