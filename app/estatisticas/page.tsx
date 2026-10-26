import { getEstatisticas, formatBRL } from '@/lib/data';
import { PageHeader, Card } from '@/components/ui';

function Bar({ label, value, max, tone, valueLabel }: { label: string; value: number; max: number; tone: string; valueLabel?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-sm text-muted">{label}</span>
      <div className="h-5 flex-1 overflow-hidden rounded-sm bg-border">
        <div className={`h-full ${tone}`} style={{ width: `${max ? Math.max(4, (value / max) * 100) : 0}%` }} />
      </div>
      <span className="w-24 shrink-0 text-right text-sm font-medium text-text">{valueLabel ?? value}</span>
    </div>
  );
}

export default async function EstatisticasPage() {
  const e = await getEstatisticas();
  const maxStatus = Math.max(1, e.porStatus.ativo, e.porStatus.suspenso, e.porStatus.baixado);
  const maxFin = Math.max(1, e.receitas, e.despesas);
  return (
    <>
      <PageHeader title="Estatísticas" subtitle="Indicadores do escritório" />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Card className="p-4"><div className="text-sm text-muted">Processos</div><div className="text-xl font-bold text-text">{e.totalProcessos}</div></Card>
        <Card className="p-4"><div className="text-sm text-muted">Clientes</div><div className="text-xl font-bold text-text">{e.totalClientes}</div></Card>
        <Card className="p-4"><div className="text-sm text-muted">Prazos em aberto</div><div className="text-xl font-bold text-text">{e.prazosAbertos}</div></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="mb-4 text-sm font-semibold text-text">Processos por status</h2>
          <div className="space-y-3">
            <Bar label="Ativos" value={e.porStatus.ativo} max={maxStatus} tone="bg-success" />
            <Bar label="Suspensos" value={e.porStatus.suspenso} max={maxStatus} tone="bg-warning" />
            <Bar label="Baixados" value={e.porStatus.baixado} max={maxStatus} tone="bg-muted" />
          </div>
        </Card>
        <Card className="p-4">
          <h2 className="mb-4 text-sm font-semibold text-text">Financeiro (12 meses)</h2>
          <div className="space-y-3">
            <Bar label="Receitas" value={e.receitas} max={maxFin} tone="bg-success" valueLabel={formatBRL(e.receitas)} />
            <Bar label="Despesas" value={e.despesas} max={maxFin} tone="bg-danger" valueLabel={formatBRL(e.despesas)} />
            <Bar label="Resultado" value={Math.max(0, e.receitas - e.despesas)} max={maxFin} tone="bg-accent" valueLabel={formatBRL(e.receitas - e.despesas)} />
          </div>
        </Card>
      </div>
    </>
  );
}
