import Link from 'next/link';
import { listModelos } from '@/lib/data';
import { PageHeader, Card, Button, EmptyState } from '@/components/ui';
import { FileText } from 'lucide-react';

export default async function EditorPage() {
  const modelos = await listModelos();
  return (
    <>
      <PageHeader
        title="Meus textos"
        subtitle={`Exibindo ${modelos.length} resultado(s)`}
        actions={<Link href="/editor/novo"><Button variant="cta">Criar texto</Button></Link>}
      />
      {modelos.length === 0 ? (
        <EmptyState title="Você ainda não cadastrou nenhum texto.">
          <Link href="/editor/novo"><Button variant="cta">Criar o primeiro modelo</Button></Link>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modelos.map((m) => (
            <Card key={m.id} className="p-4">
              <div className="mb-2 flex items-center gap-2 text-accent"><FileText size={18} /><span className="text-xs font-semibold uppercase text-muted">{m.tipo ?? 'Texto'}</span></div>
              <div className="font-medium text-text">{m.titulo}</div>
              <p className="mt-2 line-clamp-3 text-sm text-muted">{m.conteudo.replace(/\n/g, ' ')}</p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
