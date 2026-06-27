/** @type {import('tailwindcss').Config} */
// Design tokens mirror specs-v2/000-overview.md.
// All colors reference CSS custom properties defined in tokens.css.
// Never hardcode color/spacing/font values in components.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // v2 color system (specs-v2/000-overview.md §2)
        bg: 'var(--color-bg)',
        'bg-elevated': 'var(--color-bg-elevated)',
        'bg-subtle': 'var(--color-bg-subtle)',
        accent: 'var(--color-accent)',
        'accent-dim': 'var(--color-accent-dim)',
        fg: 'var(--color-text-primary)',
        'fg-strong': 'var(--color-text-primary)',
        'fg-secondary': 'var(--color-text-secondary)',
        'fg-muted': 'var(--color-text-muted)',
        'fg-faint': '#6B4D6B',
        success: 'var(--color-success)',
        border: 'var(--color-border)',
      },
      fontFamily: {
        // Syncopate = editorial display (hero)
        display: ['"Syncopate"', 'sans-serif'],
        // Geist Sans = primary sans (body text, UI, headers)
        sans: ['Geist', 'sans-serif'],
        // Geist Mono = mono (method badges, status indicators, uptime, versions)
        mono: ['"Geist Mono"', 'monospace'],
      },
      fontSize: {
        // v2 type scale (specs-v2/000-overview.md §3)
        'text-hero': ['var(--text-hero)', { lineHeight: '1.0', letterSpacing: '-0.03em' }],
        'text-xl': ['var(--text-xl)', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        'text-lg': ['var(--text-lg)', { lineHeight: '1.6' }],
        'text-md': ['var(--text-md)', { lineHeight: '1.4' }],
        'text-sm': ['var(--text-sm)', { lineHeight: '1.6' }],
        'text-xs': ['var(--text-xs)', { lineHeight: '1.4', letterSpacing: '0.08em' }],
      },
      spacing: {
        // 8px base scale
        section: '80px',
        gutter: 'clamp(20px, 5vw, 48px)',
      },
      maxWidth: {
        content: '1100px',
      },
      transitionTimingFunction: {
        brand: 'var(--ease-spring)',
        // Keep existing for backward compat during migration
      },
      borderWidth: {
        thin: '0.5px',
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
};
