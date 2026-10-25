import type { Config } from 'tailwindcss';

// Cores apontam para as CSS vars de app/globals.css (tokens do design system).
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        'border-input': 'var(--color-border-input)',
        text: 'var(--color-text)',
        muted: 'var(--color-text-muted)',
        accent: 'var(--color-accent)',
        'on-accent': 'var(--color-on-accent)',
        cta: 'var(--color-cta)',
        'on-cta': 'var(--color-on-cta)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        sidebar: 'var(--color-sidebar)',
        'on-sidebar': 'var(--color-on-sidebar)',
        'sidebar-muted': 'var(--color-sidebar-muted)',
        'sidebar-active': 'var(--color-sidebar-active)',
      },
      fontFamily: { sans: 'var(--font-sans)', mono: 'var(--font-mono)' },
      fontSize: {
        xs: ['12px', '16px'], sm: ['14px', '20px'], base: ['15px', '22px'],
        lg: ['18px', '26px'], xl: ['24px', '30px'], display: ['32px', '38px'],
      },
      borderRadius: { sm: '4px', md: '6px', lg: '10px', pill: '999px' },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.10)',
        pop: '0 12px 32px rgba(16,24,40,.16)',
      },
      maxWidth: { content: '1200px' },
    },
  },
  plugins: [],
};
export default config;
