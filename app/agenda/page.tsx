import Link from 'next/link';
import { listCompromissos, listPrazos } from '@/lib/data';
import { PageHeader, Card, Button, EmptyState, StatusPill } from '@/components/ui';

function fmtDataHora(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
function fmtData(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR');
}

export default async function AgendaPage() {
  const [compromissos, prazos] = await Promise.all([listCompromissos(), listPrazos()]);
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader
        title="Agenda"
        subtitle="Compromissos e prazos"
        actions={
          <div className="flex gap-2">
            <Link href="/agenda/novo?tipo=prazo"><Button variant="secondary">Novo prazo</Button></Link>
            <Link href="/agenda/novo"><Button variant="cta">Novo compromisso</Button></Link>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-text">Próximos compromissos</h2>
          {compromissos.length === 0 ? (
            <p className="text-sm text-muted">Nenhum compromisso cadastrado.</p>
          ) : (
            <ul className="divide-y divide-border">
              {compromissos.map((c) => (
                <li key={c.id} className="py-3">
                  <div className="font-medium text-text">{c.titulo}</div>
                  <div className="text-sm text-muted">
                    {fmtDataHora(c.inicioAt)}{c.responsavel ? ` · ${c.responsavel}` : ''}
                    {c.processoNumero ? ` · ${c.processoNumero}` : ''}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-text">Prazos</h2>
          {prazos.length === 0 ? (
            <p className="text-sm text-muted">Nenhum prazo cadastrado.</p>
          ) : (
            <ul className="divide-y divide-border">
              {prazos.map((p) => {
                const atrasado = !p.cumprido && p.data < hoje;
                return (
                  <li key={p.id} className="flex items-start justify-between gap-2 py-3">
                    <div>
                      <div className="font-medium text-text">{p.descricao}</div>
                      <div className="text-sm text-muted">
                        {fmtData(p.data)}{p.responsavel ? ` · ${p.responsavel}` : ''}
                        {p.processoNumero ? ` · ${p.processoNumero}` : ''}
                      </div>
                    </div>
                    <StatusPill status={p.cumprido ? 'pago' : atrasado ? 'suspenso' : 'ativo'} />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <p className="mt-4 text-xs text-muted">
        Visão em lista. A grade de calendário (mês/semana/dia) entra na sequência deste módulo.
      </p>
    </>
  );
}
