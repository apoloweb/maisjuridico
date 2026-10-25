import Link from 'next/link';
import { createLancamentoAction } from '@/app/actions';
import { PageHeader, Card, Button, Field, Input, Select } from '@/components/ui';

const RECORRENCIAS = ['', 'Mensalmente', 'Semanalmente', 'Quinzenalmente', 'Bimestralmente', 'Trimestralmente', 'Semestralmente', 'Anualmente'];

export default function NovoLancamentoPage({ searchParams }: { searchParams: { tipo?: string } }) {
  const tipo = searchParams.tipo === 'receita' ? 'receita' : 'despesa';
  return (
    <>
      <PageHeader title={`Novo lançamento — ${tipo === 'receita' ? 'Receita' : 'Despesa'}`} actions={<Link href="/financeiro"><Button variant="secondary">Voltar</Button></Link>} />
      <Card className="p-6">
        <form action={createLancamentoAction} className="grid max-w-xl gap-4">
          <Field label="Tipo" htmlFor="tipo">
            <Select id="tipo" name="tipo" defaultValue={tipo}>
              <option value="despesa">Despesa</option>
              <option value="receita">Receita</option>
            </Select>
          </Field>
          <Field label="Descrição" htmlFor="descricao"><Input id="descricao" name="descricao" required placeholder="Ex.: Honorários contratuais" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Valor (R$)" htmlFor="valor"><Input id="valor" name="valor" type="number" step="0.01" min="0" required placeholder="0,00" /></Field>
            <Field label="Vencimento" htmlFor="vencimento"><Input id="vencimento" name="vencimento" type="date" required /></Field>
            <Field label="Conta" htmlFor="conta"><Input id="conta" name="conta" defaultValue="Conta Principal" /></Field>
            <Field label="Categoria" htmlFor="categoria"><Input id="categoria" name="categoria" placeholder="Ex.: Honorários" /></Field>
            <Field label="Situação" htmlFor="situacao">
              <Select id="situacao" name="situacao" defaultValue="aberto">
                <option value="aberto">Em aberto</option>
                <option value="pago">Pago</option>
              </Select>
            </Field>
            <Field label="Recorrência" htmlFor="recorrencia">
              <Select id="recorrencia" name="recorrencia" defaultValue="">
                {RECORRENCIAS.map((r) => <option key={r} value={r}>{r || 'Não repetir'}</option>)}
              </Select>
            </Field>
          </div>
          <div className="flex gap-2"><Button type="submit" variant="cta">Salvar</Button><Link href="/financeiro"><Button type="button" variant="secondary">Cancelar</Button></Link></div>
        </form>
      </Card>
    </>
  );
}
