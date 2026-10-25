import Link from 'next/link';
import { createModeloAction } from '@/app/actions';
import { PageHeader, Card, Button, Field, Input, Select } from '@/components/ui';

const TIPOS = ['Contrato', 'Recibo', 'Procuração', 'Petição', 'Outro'];
const VARIAVEIS = ['{{cliente.nome}}', '{{cliente.documento}}', '{{processo.numero}}', '{{data.hoje}}'];

export default function NovoTextoPage() {
  return (
    <>
      <PageHeader title="Criar texto" actions={<Link href="/editor"><Button variant="secondary">Voltar</Button></Link>} />
      <Card className="p-6">
        <form action={createModeloAction} className="grid max-w-3xl gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Título" htmlFor="titulo"><Input id="titulo" name="titulo" required placeholder="Ex.: Contrato de honorários" /></Field>
            <Field label="Tipo" htmlFor="tipo">
              <Select id="tipo" name="tipo" defaultValue="Contrato">
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Conteúdo" htmlFor="conteudo" hint="Use variáveis de mala-direta — elas são preenchidas com os dados do cliente/processo ao gerar o documento.">
            <textarea
              id="conteudo" name="conteudo" rows={12} required
              className="w-full rounded-sm border border-border-input bg-bg p-3 font-mono text-sm text-text focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
              placeholder="CONTRATO…&#10;&#10;Contratante: {{cliente.nome}}…"
            />
          </Field>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-muted">Variáveis:</span>
            {VARIAVEIS.map((v) => <code key={v} className="rounded-sm bg-surface px-1.5 py-0.5 text-muted">{v}</code>)}
          </div>
          <div className="flex gap-2"><Button type="submit" variant="cta">Salvar texto</Button><Link href="/editor"><Button type="button" variant="secondary">Cancelar</Button></Link></div>
        </form>
      </Card>
    </>
  );
}
