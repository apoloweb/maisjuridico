import Link from 'next/link';
import { getDashboard, formatBRL } from '@/lib/data';
import { PageHeader, Card } from '@/components/ui';
import { DollarSign, CalendarDays, Scale, Rocket } from 'lucide-react';

export default async function DashboardPage() {
  const d = await getDashboard();
  const max = Math.max(1, ...d.receitas12m.map((m) => m.valorCents));
  const cards = [
    { icon: DollarSign, label: 'Receitas recebidas este mês', value: formatBRL(d.receitasMesCents) },
    { icon: CalendarDays, label: 'Eventos agendados para este mês', value: String(d.eventosMes) },
    { icon: Scale, label: 'Processos adicionados este mês', value: String(d.processosMes) },
    { icon: Rocket, label: 'Publicações recebidas este mês', value: String(d.publicacoesMes) },
  ];
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Visão geral do escritório" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ icon: Icon, label, value }) => (
          <Card key={label} className="p-4">
            <div className="flex items-start gap-3">
              <Icon size={22} className="text-accent" />
              <div>
                <div className="text-xl font-bold text-text">{value}</div>
                <div className="text-sm text-muted">{label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-text">Receitas — últimos 12 meses</h2>
          <div className="flex h-44 gap-1.5" role="img" aria-label="Gráfico de receitas dos últimos 12 meses">
            {d.receitas12m.map((m) => (
              <div key={m.mes} className="flex flex-1 flex-col items-center gap-1" title={`${m.mes}: ${formatBRL(m.valorCents)}`}>
                <div className="flex w-full flex-1 items-end">
                  <div className="w-full rounded-t-sm bg-accent" style={{ height: `${Math.max(2, (m.valorCents / max) * 100)}%` }} />
                </div>
                <span className="text-[10px] text-muted">{m.mes}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text">Compromissos</h2>
            <Link href="/agenda" className="text-xs text-accent hover:underline">Ver todos</Link>
          </div>
          {d.compromissos.length === 0 ? (
            <p className="text-sm text-muted">Nenhum compromisso entre hoje e amanhã.</p>
          ) : (
            <ul className="space-y-2">
              {d.compromissos.map((c) => (
                <li key={c.id} className="text-sm">
                  <div className="font-medium text-text">{c.titulo}</div>
                  <div className="text-muted">
                    {new Date(c.inicioAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    {c.responsavel ? ` · ${c.responsavel}` : ''}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
