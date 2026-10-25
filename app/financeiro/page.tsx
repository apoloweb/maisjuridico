import Link from 'next/link';
import { listLancamentos, formatBRL } from '@/lib/data';
import { PageHeader, Card, Button, EmptyState, StatusPill } from '@/components/ui';

export default async function FinanceiroPage() {
  const lancamentos = await listLancamentos();
  const saldo = lancamentos.reduce((s, l) => s + (l.situacao === 'pago' ? (l.tipo === 'receita' ? l.valorCents : -l.valorCents) : 0), 0);
  const aReceber = lancamentos.filter((l) => l.tipo === 'receita' && l.situacao === 'aberto').reduce((s, l) => s + l.valorCents, 0);
  const aPagar = lancamentos.filter((l) => l.tipo === 'despesa' && l.situacao === 'aberto').reduce((s, l) => s + l.valorCents, 0);

  return (
    <>
      <PageHeader
        title="Financeiro"
        subtitle={`Exibindo ${lancamentos.length} lançamento(s)`}
        actions={<Link href="/financeiro/novo"><Button variant="cta">Adicionar</Button></Link>}
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Card className="p-4"><div className="text-sm text-muted">Saldo (pago)</div><div className="text-lg font-bold text-text">{formatBRL(saldo)}</div></Card>
        <Card className="p-4"><div className="text-sm text-muted">A receber</div><div className="text-lg font-bold text-success">{formatBRL(aReceber)}</div></Card>
        <Card className="p-4"><div className="text-sm text-muted">A pagar</div><div className="text-lg font-bold text-danger">{formatBRL(aPagar)}</div></Card>
      </div>

      {lancamentos.length === 0 ? (
        <EmptyState title="Você ainda não cadastrou nenhum lançamento.">
          <Link href="/financeiro/novo"><Button variant="cta">Cadastrar lançamento</Button></Link>
        </EmptyState>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Descrição</th>
                <th className="px-4 py-3 font-semibold">Categoria</th>
                <th className="px-4 py-3 font-semibold">Vencimento</th>
                <th className="px-4 py-3 font-semibold">Valor</th>
                <th className="px-4 py-3 font-semibold">Situação</th>
              </tr>
            </thead>
            <tbody>
              {lancamentos.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-text">{l.descricao}</td>
                  <td className="px-4 py-3 text-muted">{l.categoria ?? '—'}</td>
                  <td className="px-4 py-3 text-muted">{new Date(l.vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className={`px-4 py-3 font-medium ${l.tipo === 'receita' ? 'text-success' : 'text-danger'}`}>
                    {l.tipo === 'despesa' ? '- ' : ''}{formatBRL(l.valorCents)}
                  </td>
                  <td className="px-4 py-3"><StatusPill status={l.situacao} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
