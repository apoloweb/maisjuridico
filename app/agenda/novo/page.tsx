import Link from 'next/link';
import { listProcessos } from '@/lib/data';
import { createCompromissoAction, createPrazoAction } from '@/app/actions';
import { PageHeader, Card, Button, Field, Input, Select } from '@/components/ui';

export default async function NovoAgendaPage({ searchParams }: { searchParams: { tipo?: string } }) {
  const isPrazo = searchParams.tipo === 'prazo';
  const processos = await listProcessos();
  return (
    <>
      <PageHeader title={isPrazo ? 'Novo prazo' : 'Novo compromisso'} actions={<Link href="/agenda"><Button variant="secondary">Voltar</Button></Link>} />
      <Card className="p-6">
        {isPrazo ? (
          <form action={createPrazoAction} className="grid max-w-xl gap-4">
            <Field label="Descrição" htmlFor="descricao"><Input id="descricao" name="descricao" required placeholder="Ex.: Contestação" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Data" htmlFor="data"><Input id="data" name="data" type="date" required /></Field>
              <Field label="Responsável" htmlFor="responsavel"><Input id="responsavel" name="responsavel" /></Field>
            </div>
            <Field label="Processo" htmlFor="processoNumero">
              <Select id="processoNumero" name="processoNumero" defaultValue="">
                <option value="">(nenhum)</option>
                {processos.map((p) => <option key={p.id} value={p.numero}>{p.numero}</option>)}
              </Select>
            </Field>
            <div className="flex gap-2"><Button type="submit" variant="cta">Salvar prazo</Button><Link href="/agenda"><Button type="button" variant="secondary">Cancelar</Button></Link></div>
          </form>
        ) : (
          <form action={createCompromissoAction} className="grid max-w-xl gap-4">
            <Field label="Título" htmlFor="titulo"><Input id="titulo" name="titulo" required placeholder="Ex.: Audiência de conciliação" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Data e hora" htmlFor="inicioAt"><Input id="inicioAt" name="inicioAt" type="datetime-local" required /></Field>
              <Field label="Responsável" htmlFor="responsavel"><Input id="responsavel" name="responsavel" /></Field>
            </div>
            <Field label="Processo" htmlFor="processoNumero">
              <Select id="processoNumero" name="processoNumero" defaultValue="">
                <option value="">(nenhum)</option>
                {processos.map((p) => <option key={p.id} value={p.numero}>{p.numero}</option>)}
              </Select>
            </Field>
            <div className="flex gap-2"><Button type="submit" variant="cta">Salvar compromisso</Button><Link href="/agenda"><Button type="button" variant="secondary">Cancelar</Button></Link></div>
          </form>
        )}
      </Card>
    </>
  );
}
