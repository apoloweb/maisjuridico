import Link from 'next/link';

// Shell próprio do PORTAL DO CLIENTE (sem a navegação do escritório).
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <header className="flex h-14 items-center justify-between border-b border-border bg-bg px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-accent">MaisJurídico</span>
          <span className="rounded-pill bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">Área do cliente</span>
        </div>
        <Link href="/dashboard" className="text-sm text-muted hover:text-text">Sair</Link>
      </header>
      <main className="mx-auto max-w-4xl p-4 sm:p-6">{children}</main>
    </div>
  );
}
