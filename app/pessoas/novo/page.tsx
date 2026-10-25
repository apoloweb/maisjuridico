import Link from 'next/link';
import { createPessoaAction } from '@/app/actions';
import { PageHeader, Card, Button, Field, Input, Select } from '@/components/ui';

const UFS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

export default function NovoClientePage() {
  return (
    <>
      <PageHeader title="Adicionar cliente" actions={<Link href="/pessoas"><Button variant="secondary">Voltar</Button></Link>} />
      <Card className="p-6">
        <form action={createPessoaAction} className="grid max-w-2xl gap-4">
          <Field label="Nome" htmlFor="nome">
            <Input id="nome" name="nome" required placeholder="Nome completo ou razão social" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Documento (CPF/CNPJ)" htmlFor="documento">
              <Input id="documento" name="documento" placeholder="000.000.000-00" />
            </Field>
            <Field label="E-mail" htmlFor="email">
              <Input id="email" name="email" type="email" placeholder="email@exemplo.com" />
            </Field>
            <Field label="Telefone" htmlFor="telefone">
              <Input id="telefone" name="telefone" placeholder="(00) 00000-0000" />
            </Field>
            <Field label="Cidade" htmlFor="cidade">
              <Input id="cidade" name="cidade" />
            </Field>
            <Field label="Estado" htmlFor="uf">
              <Select id="uf" name="uf" defaultValue="">
                <option value="">UF</option>
                {UFS.map((u) => <option key={u} value={u}>{u}</option>)}
              </Select>
            </Field>
          </div>

          <fieldset className="grid gap-4 rounded-md border border-border p-4 sm:grid-cols-2">
            <legend className="px-1 text-sm font-semibold text-muted">Acesso ao portal do cliente</legend>
            <Field label="Login" htmlFor="portalLogin" hint="O cliente acessa sua área com este login.">
              <Input id="portalLogin" name="portalLogin" placeholder="ex.: nome-cliente" />
            </Field>
          </fieldset>

          <div className="flex gap-2">
            <Button type="submit" variant="cta">Salvar</Button>
            <Link href="/pessoas"><Button type="button" variant="secondary">Cancelar</Button></Link>
          </div>
        </form>
      </Card>
    </>
  );
}
