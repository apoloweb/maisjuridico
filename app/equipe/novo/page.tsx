import Link from 'next/link';
import { createAdvogadoAction } from '@/app/actions';
import { PageHeader, Card, Button, Field, Input, Select } from '@/components/ui';

const UFS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

export default function NovoAdvogadoPage() {
  return (
    <>
      <PageHeader title="Adicionar advogado" actions={<Link href="/equipe"><Button variant="secondary">Voltar</Button></Link>} />
      <Card className="p-6">
        <form action={createAdvogadoAction} className="grid max-w-xl gap-4">
          <Field label="Nome" htmlFor="nome"><Input id="nome" name="nome" required placeholder="Nome do advogado" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="OAB" htmlFor="oab"><Input id="oab" name="oab" placeholder="Número" /></Field>
            <Field label="Estado da OAB" htmlFor="oabUf">
              <Select id="oabUf" name="oabUf" defaultValue="">
                <option value="">UF</option>
                {UFS.map((u) => <option key={u} value={u}>{u}</option>)}
              </Select>
            </Field>
            <Field label="E-mail" htmlFor="email"><Input id="email" name="email" type="email" placeholder="email@escritorio.com" /></Field>
            <Field label="Grupo" htmlFor="grupo"><Input id="grupo" name="grupo" placeholder="Ex.: Cível" /></Field>
            <Field label="Papel" htmlFor="papel">
              <Select id="papel" name="papel" defaultValue="membro">
                <option value="membro">Membro</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </Select>
            </Field>
          </div>
          <div className="flex gap-2"><Button type="submit" variant="cta">Salvar</Button><Link href="/equipe"><Button type="button" variant="secondary">Cancelar</Button></Link></div>
        </form>
      </Card>
    </>
  );
}
