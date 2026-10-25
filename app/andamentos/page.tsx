import Link from 'next/link';
import { listAndamentos } from '@/lib/data';
import { PageHeader, Card, Button, EmptyState, StatusPill } from '@/components/ui';

export default async function AndamentosPage() {
  const andamentos = await listAndamentos();
  return (
    <>
      <PageHeader
        title="Andamentos"
        subtitle={`${andamentos.length} andamento(s)`}
        actions={<Link href="/andamentos/novo"><Button variant="cta">Adicionar</Button></Link>}
      />
      <Card className="mb-4 p-4 text-sm text-muted">
        Andamentos manuais. A captura automática por nº CNJ (via API de terceiro) é um add-on do roadmap (M3) — e, como no original, é um serviço best-effort sem garantia de entrega.
      </Card>
      {andamentos.length === 0 ? (
        <EmptyState title="Nenhum andamento cadastrado.">
          <Link href="/andamentos/novo"><Button variant="cta">Cadastrar andamento</Button></Link>
        </EmptyState>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Processo</th>
                <th className="px-4 py-3 font-semibold">Movimentação</th>
                <th className="px-4 py-3 font-semibold">Origem</th>
              </tr>
            </thead>
            <tbody>
              {andamentos.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0 align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{new Date(a.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-text">{a.processoNumero}</td>
                  <td className="px-4 py-3 text-text">{a.texto}</td>
                  <td className="px-4 py-3"><StatusPill status={a.origem === 'automatico' ? 'ativo' : 'pago'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
