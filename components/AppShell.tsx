'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Scale, KanbanSquare, Users, UserCog, Calendar, DollarSign,
  Headphones, FileBarChart, BarChart3, Newspaper, Search, FolderOpen, Globe,
  FileText, Menu, Bell, Settings, HelpCircle, LogOut,
  type LucideIcon,
} from 'lucide-react';
import { logoutAction } from '@/app/auth/actions';

type NavItem = { href: string; label: string; icon: LucideIcon };
const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/processos', label: 'Processos', icon: Scale },
  { href: '/workflow', label: 'Workflow', icon: KanbanSquare },
  { href: '/pessoas', label: 'Pessoas', icon: Users },
  { href: '/equipe', label: 'Equipe', icon: UserCog },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/sac', label: 'SAC', icon: Headphones },
  { href: '/relatorios', label: 'Relatórios', icon: FileBarChart },
  { href: '/estatisticas', label: 'Estatísticas', icon: BarChart3 },
  { href: '/diario-oficial', label: 'Diário Oficial', icon: Newspaper },
  { href: '/andamentos', label: 'Andamentos', icon: Search },
  { href: '/arquivos', label: 'Arquivos', icon: FolderOpen },
  { href: '/site', label: 'Site', icon: Globe },
  { href: '/editor', label: 'Editor de texto', icon: FileText },
];

export function AppShell({ children, userEmail }: { children: React.ReactNode; userEmail?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  // Páginas com layout próprio (sem o chrome do escritório).
  if (pathname.startsWith('/portal') || pathname === '/login' || pathname === '/signup') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-bg">
      <nav
        aria-label="Ferramentas"
        className={`fixed inset-y-0 left-0 z-30 w-[240px] overflow-y-auto bg-sidebar px-2 py-3 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="px-3 py-2 text-lg font-bold text-on-sidebar">MaisJurídico</div>
        <p className="px-3 pb-2 text-xs uppercase tracking-wide text-sidebar-muted">Ferramentas</p>
        <ul className="space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                    active ? 'bg-sidebar-active font-semibold text-on-accent' : 'text-on-sidebar/90 hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {open && <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}

      <div className="lg:pl-[240px]">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-bg px-4">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu size={20} />
          </button>
          <div className="ml-auto flex items-center gap-4 text-muted">
            <button aria-label="Novidades" className="hover:text-text"><Bell size={18} /></button>
            <button aria-label="Configurações" className="hover:text-text"><Settings size={18} /></button>
            <button aria-label="Ajuda" className="hover:text-text"><HelpCircle size={18} /></button>
            {userEmail && <span className="hidden text-sm text-text sm:inline">{userEmail}</span>}
            <form action={logoutAction}>
              <button type="submit" className="inline-flex items-center gap-1 text-sm hover:text-text" aria-label="Sair">
                <LogOut size={16} /> Sair
              </button>
            </form>
          </div>
        </header>
        <main className="mx-auto max-w-content p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
