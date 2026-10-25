import Link from 'next/link';
import { listAtendimentos, listAniversariantes } from '@/lib/data';
import { PageHeader, Card, Button, EmptyState, StatusPill } from '@/components/ui';
import { Cake } from 'lucide-react';

const STATUS_LABEL: Record<string, string> = {
  aguardando: 'Aguardando', em_dia: 'Em dia', expirando: 'Expirando', expirado: 'Expirado', finalizado: 'Finalizado',
};
function pillFor(s: string) {
  if (s === 'finalizado') return 'pago';
  if (s === 'em_dia') return 'ativo';
  if (s === 'expirado') return 'baixado';
  return 'suspenso';
}

export default async function SacPage() {
  const mes = new Date().getMonth() + 1;
  const [atendimentos, aniversariantes] = await Promise.all([listAtendimentos(), listAniversariantes(mes)]);
  return (
    <>
      <PageHeader
        title="Atendimento aos clientes"
        subtitle={`${atendimentos.length} atendimento(s)`}
        actions={<Link href="/sac/novo"><Button variant="cta">Adicionar</Button></Link>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {atendimentos.length === 0 ? (
            <EmptyState title="Nenhum atendimento encontrado." />
          ) : (
            <Card className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border text-left text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Cliente</th>
                    <th className="px-4 py-3 font-semibold">Assunto</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {atendimentos.map((a) => (
                    <tr key={a.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-text">{a.clienteNome}</td>
                      <td className="px-4 py-3 text-muted">{a.assunto}</td>
                      <td className="px-4 py-3"><StatusPill status={pillFor(a.status)} /> <span className="ml-1 text-xs text-muted">{STATUS_LABEL[a.status]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>

        <Card className="p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text"><Cake size={16} className="text-accent" /> Aniversariantes do mês</h2>
          {aniversariantes.length === 0 ? (
            <p className="text-sm text-muted">Nenhum aniversariante este mês.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {aniversariantes.map((p) => (
                <li key={p.id} className="flex justify-between">
                  <span className="text-text">{p.nome}</span>
                  <span className="text-muted">{new Date(p.nascimento! + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 border-t border-border pt-3 text-xs text-muted">Envio de SMS: disponível no cadastro do atendimento (integração de SMS no backend).</p>
        </Card>
      </div>
    </>
  );
}
