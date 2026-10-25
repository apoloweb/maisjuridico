import Link from 'next/link';
import { listPessoas } from '@/lib/data';
import { PageHeader, Card, Button, EmptyState, Input } from '@/components/ui';
import { CheckCircle2 } from 'lucide-react';

export default async function PessoasPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q || '';
  const clientes = await listPessoas({ tipo: 'cliente', q });
  return (
    <>
      <PageHeader
        title="Clientes"
        subtitle={`Exibindo ${clientes.length} resultado(s)`}
        actions={<Link href="/pessoas/novo"><Button variant="cta">Adicionar</Button></Link>}
      />
      <Card className="mb-4 p-4">
        <form className="flex items-end gap-3" role="search">
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="font-semibold text-muted">Busca</span>
            <Input name="q" defaultValue={q} placeholder="Nome ou documento" />
          </label>
          <Button type="submit" variant="primary">Buscar</Button>
        </form>
      </Card>

      {clientes.length === 0 ? (
        <EmptyState title="Você ainda não cadastrou nenhum cliente.">
          <Link href="/pessoas/novo"><Button variant="cta">Cadastrar cliente</Button></Link>
        </EmptyState>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Documento</th>
                <th className="px-4 py-3 font-semibold">Cidade/UF</th>
                <th className="px-4 py-3 font-semibold">Portal</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-text">{c.nome}</td>
                  <td className="px-4 py-3 text-muted">{c.documento ?? '—'}</td>
                  <td className="px-4 py-3 text-muted">{[c.cidade, c.uf].filter(Boolean).join('/') || '—'}</td>
                  <td className="px-4 py-3">
                    {c.portalLogin
                      ? <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 size={14} /> ativo</span>
                      : <span className="text-muted">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
