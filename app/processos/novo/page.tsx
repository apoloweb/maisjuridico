import Link from 'next/link';
import { listPessoas } from '@/lib/data';
import { createProcessoAction } from '@/app/actions';
import { PageHeader, Card, Button, Field, Input, Select, Checkbox } from '@/components/ui';

const POSICOES = ['Autor', 'Réu', 'Requerente', 'Requerido', 'Reclamante', 'Reclamada'];
const CLASSES = ['Ação de cobrança', 'Ação de despejo', 'Ação de indenização', 'Divórcio', 'Execução de alimentos'];
const NATUREZAS = ['Cível', 'Criminal', 'Família', 'Trabalhista'];

export default async function NovoProcessoPage() {
  const clientes = await listPessoas({ tipo: 'cliente' });
  return (
    <>
      <PageHeader title="Adicionar processo" actions={<Link href="/processos"><Button variant="secondary">Voltar</Button></Link>} />
      <Card className="p-6">
        <form action={createProcessoAction} className="grid max-w-2xl gap-4">
          <Field label="Número do processo (CNJ)" htmlFor="numero">
            <Input id="numero" name="numero" placeholder="0000000-00.0000.0.00.0000" />
          </Field>
          <Checkbox name="privado" label="Privado (o cliente não poderá visualizar)" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Status" htmlFor="status">
              <Select id="status" name="status" defaultValue="ativo">
                <option value="ativo">Ativo</option>
                <option value="suspenso">Suspenso</option>
                <option value="baixado">Baixado</option>
              </Select>
            </Field>
            <Field label="Data de abertura" htmlFor="dataAbertura">
              <Input id="dataAbertura" name="dataAbertura" type="date" />
            </Field>
            <Field label="Classe processual" htmlFor="classe">
              <Select id="classe" name="classe" defaultValue="">
                <option value="">Selecione…</option>
                {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Natureza da ação" htmlFor="natureza">
              <Select id="natureza" name="natureza" defaultValue="">
                <option value="">Selecione…</option>
                {NATUREZAS.map((n) => <option key={n} value={n}>{n}</option>)}
              </Select>
            </Field>
            <Field label="Valor da causa (R$)" htmlFor="valorCausa">
              <Input id="valorCausa" name="valorCausa" type="number" step="0.01" min="0" placeholder="0,00" />
            </Field>
          </div>

          <fieldset className="grid gap-4 rounded-md border border-border p-4 sm:grid-cols-2">
            <legend className="px-1 text-sm font-semibold text-muted">Cliente</legend>
            <Field label="Cliente" htmlFor="clienteNome">
              <Select id="clienteNome" name="clienteNome" defaultValue="">
                <option value="">Selecione o cliente…</option>
                {clientes.map((c) => <option key={c.id} value={c.nome}>{c.nome}</option>)}
              </Select>
            </Field>
            <Field label="Posição do cliente" htmlFor="posicaoCliente">
              <Select id="posicaoCliente" name="posicaoCliente" defaultValue="Autor">
                {POSICOES.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </Field>
          </fieldset>

          <div className="flex gap-2">
            <Button type="submit" variant="cta">Salvar</Button>
            <Link href="/processos"><Button type="button" variant="secondary">Cancelar</Button></Link>
          </div>
        </form>
      </Card>
    </>
  );
}
