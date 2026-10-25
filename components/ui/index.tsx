// Primitivas do design system (tokens via classes Tailwind; sem hex cru).
import * as React from 'react';

// ---- Button ----
type BtnVariant = 'primary' | 'cta' | 'secondary' | 'ghost' | 'danger';
type BtnSize = 'sm' | 'md' | 'lg';
const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
const btnVariants: Record<BtnVariant, string> = {
  primary: 'bg-accent text-on-accent hover:brightness-95',
  cta: 'bg-cta text-on-cta hover:brightness-95',
  secondary: 'bg-surface text-text border border-border hover:bg-border/40',
  ghost: 'bg-transparent text-text hover:bg-surface',
  danger: 'bg-danger text-white hover:brightness-95',
};
const btnSizes: Record<BtnSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};
export function Button({
  variant = 'primary', size = 'md', loading, className = '', children, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: BtnSize; loading?: boolean }) {
  return (
    <button className={`${btnBase} ${btnVariants[variant]} ${btnSizes[size]} ${className}`} aria-busy={loading || undefined} {...rest}>
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
      {children}
    </button>
  );
}

// ---- Field / Input / Select ----
export function Field({ label, htmlFor, hint, error, children }: { label: string; htmlFor?: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-muted">{label}</label>
      {children}
      {hint && !error && <span className="text-xs text-muted">{hint}</span>}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
const inputCls =
  'h-10 w-full rounded-sm border border-border-input bg-bg px-3 text-text placeholder:text-muted focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40';
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = '', ...rest }, ref) {
    return <input ref={ref} className={`${inputCls} ${className}`} {...rest} />;
  },
);
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className = '', children, ...rest }, ref) {
    return <select ref={ref} className={`${inputCls} ${className}`} {...rest}>{children}</select>;
  },
);
export function Checkbox({ label, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-text">
      <input type="checkbox" className="h-4 w-4 rounded-sm border-border-input accent-accent" {...rest} />
      {label}
    </label>
  );
}

// ---- Card ----
export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-md border border-border bg-surface shadow-card ${className}`}>{children}</div>;
}

// ---- PageHeader ----
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-text">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

// ---- EmptyState ----
export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <Card className="p-8 text-center">
      <p className="text-sm text-muted">{title}</p>
      {children && <div className="mt-4 flex justify-center">{children}</div>}
    </Card>
  );
}

// ---- StatusPill ----
const pillTone: Record<string, string> = {
  ativo: 'bg-success/15 text-success',
  suspenso: 'bg-warning/15 text-warning',
  baixado: 'bg-muted/15 text-muted',
  aberto: 'bg-warning/15 text-warning',
  pago: 'bg-success/15 text-success',
};
export function StatusPill({ status }: { status: string }) {
  const tone = pillTone[status] ?? 'bg-muted/15 text-muted';
  return <span className={`inline-flex items-center rounded-pill px-2 py-0.5 text-xs font-semibold capitalize ${tone}`}>{status}</span>;
}
