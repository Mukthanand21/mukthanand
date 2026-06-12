/** @type {import('tailwindcss').Config} */
// Design tokens are the single source of truth (AGENTS.md, LOCKED).
// Never hardcode color/spacing/font values in components; reference these.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds & surfaces
        bg: '#0A0A0A',
        'bg-alt': '#111111',
        surface: '#1A1A1A',
        // Single hero accent (only decorative accent allowed)
        accent: '#22D3EE',
        // Semantic / status colors  FUNCTIONAL USE ONLY, never decoration
        live: '#4ADE80',
        version: '#A855F7',
        warning: '#F59E0B',
        // Text ramp on dark (WCAG AA)
        'fg-strong': '#F5F5F5',
        'fg': '#D4D4D4',
        'fg-muted': '#8A8A8A',
        'fg-faint': '#5A5A5A',
      },
      fontFamily: {
        // General Sans = primary workhorse (body + UI)
        sans: ['"General Sans"', 'system-ui', 'sans-serif'],
        // JetBrains Mono = code / version tags / system texture only
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        // Clash Display = giant section titles ONLY (used sparingly)
        display: ['"Clash Display"', '"General Sans"', 'sans-serif'],
      },
      fontSize: {
        // Calm body
        base: ['1.0625rem', { lineHeight: '1.65' }],
        // Type ramp: huge headings via clamp
        'display-1': ['clamp(3rem, 9vw, 7.5rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display-2': ['clamp(2.25rem, 6vw, 4.5rem)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        'heading': ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      spacing: {
        // 8px base scale (Tailwind defaults already follow 4/8px; these extend it)
        section: 'clamp(5rem, 12vh, 10rem)',
        gutter: 'clamp(1.25rem, 5vw, 6rem)',
      },
      transitionTimingFunction: {
        // ONE shared easing curve, used everywhere
        brand: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      maxWidth: {
        content: '72rem',
      },
    },
  },
  plugins: [],
};
