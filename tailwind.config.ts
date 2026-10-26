import type { Config } from 'tailwindcss';

// Cores via CSS vars em RGB-channels: rgb(var(--x) / <alpha-value>) habilita
// os modificadores de opacidade do Tailwind (ex.: bg-accent/80, text-muted/60).
const c = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: c('--color-bg'),
        surface: c('--color-surface'),
        border: c('--color-border'),
        'border-input': c('--color-border-input'),
        text: c('--color-text'),
        muted: c('--color-text-muted'),
        accent: c('--color-accent'),
        'on-accent': c('--color-on-accent'),
        cta: c('--color-cta'),
        'on-cta': c('--color-on-cta'),
        danger: c('--color-danger'),
        success: c('--color-success'),
        warning: c('--color-warning'),
        sidebar: c('--color-sidebar'),
        'on-sidebar': c('--color-on-sidebar'),
        'sidebar-muted': c('--color-sidebar-muted'),
        'sidebar-active': c('--color-sidebar-active'),
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
