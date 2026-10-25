/** Tailwind mapping para os tokens do clone MaisJurídico.
 *  Componentes usam `bg-surface text-muted`, nunca hex cru.
 *  As cores apontam para as CSS vars de tokens.css (um só lugar p/ o brand trocar). */
/** @type {import('tailwindcss').Config} */
module.exports = {
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
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['14px', '20px'],
        base: ['15px', '22px'],
        lg: ['18px', '26px'],
        xl: ['24px', '30px'],
        display: ['32px', '38px'],
      },
      spacing: {
        0: '0px', 1: '4px', 2: '8px', 3: '12px',
        4: '16px', 6: '24px', 8: '32px', 12: '48px', 16: '64px',
      },
      borderRadius: { sm: '4px', md: '6px', lg: '10px', pill: '999px' },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.10)',
        pop: '0 12px 32px rgba(16,24,40,.16)',
      },
      transitionTimingFunction: { ease: 'cubic-bezier(.2,.8,.2,1)' },
      transitionDuration: { fast: '120ms', base: '200ms' },
      maxWidth: { content: '1200px' },
      width: { sidebar: '240px' },
      height: { header: '56px' },
    },
  },
  plugins: [],
};
