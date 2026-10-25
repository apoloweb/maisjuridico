import { listProcessos, listLancamentos, listPrazos, formatBRL } from '@/lib/data';
import { PageHeader, Card, Select, Button, StatusPill } from '@/components/ui';

const TIPOS = [
  { id: 'processos', nome: 'Processos' },
  { id: 'financeiro', nome: 'Financeiro' },
  { id: 'prazos', nome: 'Prazos' },
];

export default async function RelatoriosPage({ searchParams }: { searchParams: { tipo?: string } }) {
  const tipo = searchParams.tipo || 'processos';

  return (
    <>
      <PageHeader title="Relatórios" subtitle="Extraia relatórios com filtros" />

      <Card className="mb-4 p-4">
        <form className="flex flex-wrap items-end gap-3" role="search">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-muted">Relatório</span>
            <Select name="tipo" defaultValue={tipo}>
              {TIPOS.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </Select>
          </label>
          <Button type="submit" variant="primary">Gerar</Button>
        </form>
      </Card>

      {tipo === 'processos' && <RelProcessos />}
      {tipo === 'financeiro' && <RelFinanceiro />}
      {tipo === 'prazos' && <RelPrazos />}
    </>
  );
}

async function RelProcessos() {
  const processos = await listProcessos();
  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-muted"><tr>
          <th className="px-4 py-3 font-semibold">Número</th><th className="px-4 py-3 font-semibold">Cliente</th>
          <th className="px-4 py-3 font-semibold">Classe</th><th className="px-4 py-3 font-semibold">Status</th>
        </tr></thead>
        <tbody>{processos.map((p) => (
          <tr key={p.id} className="border-b border-border last:border-0">
            <td className="px-4 py-3 text-text">{p.numero}</td><td className="px-4 py-3 text-muted">{p.clienteNome}</td>
            <td className="px-4 py-3 text-muted">{p.classe}</td><td className="px-4 py-3"><StatusPill status={p.status} /></td>
          </tr>))}</tbody>
      </table>
    </Card>
  );
}

async function RelFinanceiro() {
  const lanc = await listLancamentos();
  const totalRec = lanc.filter((l) => l.tipo === 'receita').reduce((s, l) => s + l.valorCents, 0);
  const totalDes = lanc.filter((l) => l.tipo === 'despesa').reduce((s, l) => s + l.valorCents, 0);
  return (
    <>
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Card className="p-4"><div className="text-sm text-muted">Receitas</div><div className="text-lg font-bold text-success">{formatBRL(totalRec)}</div></Card>
        <Card className="p-4"><div className="text-sm text-muted">Despesas</div><div className="text-lg font-bold text-danger">{formatBRL(totalDes)}</div></Card>
        <Card className="p-4"><div className="text-sm text-muted">Resultado</div><div className="text-lg font-bold text-text">{formatBRL(totalRec - totalDes)}</div></Card>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted"><tr>
            <th className="px-4 py-3 font-semibold">Descrição</th><th className="px-4 py-3 font-semibold">Tipo</th><th className="px-4 py-3 font-semibold">Valor</th>
          </tr></thead>
          <tbody>{lanc.map((l) => (
            <tr key={l.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 text-text">{l.descricao}</td><td className="px-4 py-3 capitalize text-muted">{l.tipo}</td>
              <td className={`px-4 py-3 ${l.tipo === 'receita' ? 'text-success' : 'text-danger'}`}>{formatBRL(l.valorCents)}</td>
            </tr>))}</tbody>
        </table>
      </Card>
    </>
  );
}

async function RelPrazos() {
  const prazos = await listPrazos();
  const hoje = new Date().toISOString().slice(0, 10);
  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-muted"><tr>
          <th className="px-4 py-3 font-semibold">Data</th><th className="px-4 py-3 font-semibold">Descrição</th>
          <th className="px-4 py-3 font-semibold">Processo</th><th className="px-4 py-3 font-semibold">Situação</th>
        </tr></thead>
        <tbody>{prazos.map((p) => (
          <tr key={p.id} className="border-b border-border last:border-0">
            <td className="px-4 py-3 text-muted">{new Date(p.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
            <td className="px-4 py-3 text-text">{p.descricao}</td><td className="px-4 py-3 text-muted">{p.processoNumero ?? '—'}</td>
            <td className="px-4 py-3"><StatusPill status={p.cumprido ? 'pago' : p.data < hoje ? 'suspenso' : 'ativo'} /></td>
          </tr>))}</tbody>
      </table>
    </Card>
  );
}
