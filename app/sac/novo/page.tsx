import Link from 'next/link';
import { listPessoas } from '@/lib/data';
import { createAtendimentoAction } from '@/app/actions';
import { PageHeader, Card, Button, Field, Input, Select } from '@/components/ui';

export default async function NovoAtendimentoPage() {
  const clientes = await listPessoas({ tipo: 'cliente' });
  return (
    <>
      <PageHeader title="Novo atendimento" actions={<Link href="/sac"><Button variant="secondary">Voltar</Button></Link>} />
      <Card className="p-6">
        <form action={createAtendimentoAction} className="grid max-w-xl gap-4">
          <Field label="Cliente" htmlFor="clienteNome">
            <Select id="clienteNome" name="clienteNome" defaultValue="">
              <option value="">Selecione o cliente…</option>
              {clientes.map((c) => <option key={c.id} value={c.nome}>{c.nome}</option>)}
            </Select>
          </Field>
          <Field label="Assunto" htmlFor="assunto"><Input id="assunto" name="assunto" required placeholder="Ex.: Dúvida sobre audiência" /></Field>
          <Field label="Status" htmlFor="status">
            <Select id="status" name="status" defaultValue="aguardando">
              <option value="aguardando">Aguardando</option>
              <option value="em_dia">Em dia</option>
              <option value="expirando">Expirando</option>
              <option value="expirado">Expirado</option>
              <option value="finalizado">Finalizado</option>
            </Select>
          </Field>
          <div className="flex gap-2"><Button type="submit" variant="cta">Salvar</Button><Link href="/sac"><Button type="button" variant="secondary">Cancelar</Button></Link></div>
        </form>
      </Card>
    </>
  );
}
