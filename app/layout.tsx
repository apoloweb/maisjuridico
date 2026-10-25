import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/AppShell';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'MaisJurídico (clone)',
  description: 'Software jurídico para escritórios de advocacia.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <html lang="pt-BR">
      <body>
        <AppShell userEmail={user?.email ?? undefined}>{children}</AppShell>
      </body>
    </html>
  );
}
