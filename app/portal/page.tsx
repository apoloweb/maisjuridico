import { getPessoaByLogin, listProcessos, listArquivos, listAtendimentos, formatBytes } from '@/lib/data';
import { Card, StatusPill, EmptyState } from '@/components/ui';
import { FileIcon } from 'lucide-react';

// Demo do portal: o cliente é identificado por ?login=. No backend real vem da sessão do portal.
export default async function PortalPage({ searchParams }: { searchParams: { login?: string } }) {
  const login = searchParams.login || 'horizonte';
  const cliente = await getPessoaByLogin(login);

  if (!cliente) {
    return <EmptyState title={`Nenhum cliente com o login "${login}". Tente ?login=horizonte ou ?login=marina.`} />;
  }

  const [processos, arquivos, atendimentos] = await Promise.all([
    // só processos não-privados do próprio cliente
    listProcessos({ clienteNome: cliente.nome, incluirPrivado: false }),
    listArquivos({ compartilhadoCliente: true }),
    listAtendimentos({ clienteNome: cliente.nome }),
  ]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text">Olá, {cliente.nome}</h1>
        <p className="text-sm text-muted">Acompanhe seus processos e documentos.</p>
      </div>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-text">Seus processos</h2>
        {processos.length === 0 ? (
          <EmptyState title="Nenhum processo disponível para visualização." />
        ) : (
          <div className="grid gap-3">
            {processos.map((p) => (
              <Card key={p.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium text-text">{p.numero}</div>
                  <div className="text-sm text-muted">{p.classe} · {p.natureza}</div>
                </div>
                <StatusPill status={p.status} />
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-text">Documentos compartilhados</h2>
        {arquivos.length === 0 ? (
          <EmptyState title="Nenhum documento compartilhado com você ainda." />
        ) : (
          <Card className="divide-y divide-border">
            {arquivos.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-4 text-sm">
                <span className="inline-flex items-center gap-2 text-text"><FileIcon size={15} className="text-muted" />{a.nome}</span>
                <span className="text-muted">{formatBytes(a.tamanhoBytes)}</span>
              </div>
            ))}
          </Card>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-text">Atendimentos</h2>
        {atendimentos.length === 0 ? (
          <EmptyState title="Nenhum atendimento aberto." />
        ) : (
          <Card className="divide-y divide-border">
            {atendimentos.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-4 text-sm">
                <span className="text-text">{a.assunto}</span>
                <StatusPill status={a.status === 'em_dia' ? 'ativo' : a.status === 'finalizado' ? 'pago' : 'suspenso'} />
              </div>
            ))}
          </Card>
        )}
      </section>
    </>
  );
}
