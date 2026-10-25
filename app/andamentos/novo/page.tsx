import Link from 'next/link';
import { listProcessos } from '@/lib/data';
import { createAndamentoAction } from '@/app/actions';
import { PageHeader, Card, Button, Field, Input, Select } from '@/components/ui';

export default async function NovoAndamentoPage() {
  const processos = await listProcessos();
  return (
    <>
      <PageHeader title="Adicionar andamento" actions={<Link href="/andamentos"><Button variant="secondary">Voltar</Button></Link>} />
      <Card className="p-6">
        <form action={createAndamentoAction} className="grid max-w-xl gap-4">
          <Field label="Processo" htmlFor="processoNumero">
            <Select id="processoNumero" name="processoNumero" defaultValue="" required>
              <option value="">Selecione o processo…</option>
              {processos.map((p) => <option key={p.id} value={p.numero}>{p.numero}</option>)}
            </Select>
          </Field>
          <Field label="Data" htmlFor="data"><Input id="data" name="data" type="date" required /></Field>
          <Field label="Movimentação" htmlFor="texto">
            <textarea
              id="texto" name="texto" rows={4} required
              className="w-full rounded-sm border border-border-input bg-bg p-3 text-sm text-text focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
              placeholder="Descreva a movimentação do processo…"
            />
          </Field>
          <div className="flex gap-2"><Button type="submit" variant="cta">Salvar</Button><Link href="/andamentos"><Button type="button" variant="secondary">Cancelar</Button></Link></div>
        </form>
      </Card>
    </>
  );
}
