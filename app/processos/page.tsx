import Link from 'next/link';
import { listProcessos, formatBRL } from '@/lib/data';
import type { StatusProcesso } from '@/lib/types';
import { PageHeader, Card, Button, EmptyState, StatusPill, Select, Input } from '@/components/ui';

export default async function ProcessosPage({ searchParams }: { searchParams: { status?: string; q?: string } }) {
  const status = (searchParams.status as StatusProcesso | 'todos') || 'todos';
  const q = searchParams.q || '';
  const processos = await listProcessos({ status, q });

  return (
    <>
      <PageHeader
        title="Processos"
        subtitle={`Exibindo ${processos.length} resultado(s)`}
        actions={<Link href="/processos/novo"><Button variant="cta">Adicionar</Button></Link>}
      />

      <Card className="mb-4 p-4">
        <form className="flex flex-wrap items-end gap-3" role="search">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-muted">Status</span>
            <Select name="status" defaultValue={status}>
              <option value="todos">Ver todos os processos</option>
              <option value="ativo">Ativo</option>
              <option value="suspenso">Suspenso</option>
              <option value="baixado">Baixado</option>
            </Select>
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="font-semibold text-muted">Busca</span>
            <Input name="q" defaultValue={q} placeholder="Número ou cliente" />
          </label>
          <Button type="submit" variant="primary">Buscar</Button>
        </form>
      </Card>

      {processos.length === 0 ? (
        <EmptyState title="Nenhum processo encontrado com esses filtros.">
          <Link href="/processos/novo"><Button variant="cta">Cadastrar o primeiro processo</Button></Link>
        </EmptyState>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Número</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Classe</th>
                <th className="px-4 py-3 font-semibold">Valor da causa</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {processos.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-text">{p.numero ?? '—'}</td>
                  <td className="px-4 py-3 text-text">{p.clienteNome ?? '—'}</td>
                  <td className="px-4 py-3 text-muted">{p.classe ?? '—'}</td>
                  <td className="px-4 py-3 text-muted">{p.valorCausaCents ? formatBRL(p.valorCausaCents) : '—'}</td>
                  <td className="px-4 py-3"><StatusPill status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
