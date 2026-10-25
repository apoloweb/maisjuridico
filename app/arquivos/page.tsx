import { listPastas, listArquivos, formatBytes } from '@/lib/data';
import { createPastaAction, uploadArquivoAction } from '@/app/actions';
import { PageHeader, Card, Button, Field, Input, Select, Checkbox, EmptyState } from '@/components/ui';
import { Folder, FileIcon, Share2 } from 'lucide-react';

const COTA_BYTES = 100 * 1024 * 1024; // 100 MB (plano grátis)

export default async function ArquivosPage() {
  const [pastas, arquivos] = await Promise.all([listPastas(), listArquivos()]);
  const usado = arquivos.reduce((s, a) => s + a.tamanhoBytes, 0);
  const pct = Math.min(100, (usado / COTA_BYTES) * 100);

  return (
    <>
      <PageHeader title="Meus arquivos" subtitle={`${formatBytes(usado)} de ${formatBytes(COTA_BYTES)} usados`} />

      <Card className="mb-4 p-4">
        <div className="mb-1 flex justify-between text-xs text-muted"><span>Armazenamento</span><span>{pct.toFixed(1)}%</span></div>
        <div className="h-2 w-full overflow-hidden rounded-pill bg-border">
          <div className="h-full bg-accent" style={{ width: `${Math.max(2, pct)}%` }} />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Pastas + ações */}
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-text">Pastas</h2>
          <ul className="mb-4 space-y-1">
            {pastas.map((f) => (
              <li key={f.id} className="flex items-center gap-2 text-sm text-text"><Folder size={16} className="text-accent" />{f.nome}</li>
            ))}
          </ul>
          <form action={createPastaAction} className="flex items-end gap-2">
            <Field label="Nova pasta" htmlFor="nome"><Input id="nome" name="nome" placeholder="Nome da pasta" /></Field>
            <Button type="submit" variant="secondary" size="sm">Criar</Button>
          </form>

          <form action={uploadArquivoAction} className="mt-6 grid gap-3 border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-text">Enviar arquivo</h3>
            <Field label="Nome do arquivo" htmlFor="anome"><Input id="anome" name="nome" placeholder="documento.pdf" required /></Field>
            <Field label="Pasta" htmlFor="pastaId">
              <Select id="pastaId" name="pastaId" defaultValue="">
                <option value="">(raiz)</option>
                {pastas.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </Select>
            </Field>
            <Field label="Tamanho (KB)" htmlFor="tamanhoKb"><Input id="tamanhoKb" name="tamanhoKb" type="number" defaultValue={50} min={1} /></Field>
            <Checkbox name="compartilhar" label="Compartilhar com o cliente" />
            <Button type="submit" variant="cta" size="sm">Enviar</Button>
            <p className="text-xs text-muted">Upload de demonstração (registra só metadados). No backend real vai para o storage.</p>
          </form>
        </Card>

        {/* Lista de arquivos */}
        <div className="lg:col-span-2">
          {arquivos.length === 0 ? (
            <EmptyState title="Esta pasta está vazia." />
          ) : (
            <Card className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border text-left text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Nome</th>
                    <th className="px-4 py-3 font-semibold">Tamanho</th>
                    <th className="px-4 py-3 font-semibold">Compartilhado</th>
                  </tr>
                </thead>
                <tbody>
                  {arquivos.map((a) => (
                    <tr key={a.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-text"><span className="inline-flex items-center gap-2"><FileIcon size={15} className="text-muted" />{a.nome}</span></td>
                      <td className="px-4 py-3 text-muted">{formatBytes(a.tamanhoBytes)}</td>
                      <td className="px-4 py-3">{a.compartilhadoCliente ? <span className="inline-flex items-center gap-1 text-success"><Share2 size={14} /> sim</span> : <span className="text-muted">não</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
