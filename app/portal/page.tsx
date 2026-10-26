import { supabaseAdmin } from '@/lib/supabase';
import { formatBytes } from '@/lib/data';
import { Card, StatusPill, EmptyState } from '@/components/ui';
import { FileIcon } from 'lucide-react';

// Portal do cliente: sem login próprio ainda (demo por ?login=). Lê via service role,
// escopado pela org do cliente. Auth própria do portal é a próxima fase.
export default async function PortalPage({ searchParams }: { searchParams: { login?: string } }) {
  const login = searchParams.login || 'horizonte';
  const { data: cliente } = await supabaseAdmin.from('pessoas').select('*').eq('portal_login', login).maybeSingle();

  if (!cliente) {
    return <EmptyState title={`Nenhum cliente com o login "${login}". Tente ?login=horizonte ou ?login=marina.`} />;
  }
  const org = cliente.org_id;

  const [{ data: processos }, { data: arquivos }, { data: atendimentos }] = await Promise.all([
    supabaseAdmin.from('processos').select('*').eq('org_id', org).eq('cliente_nome', cliente.nome).eq('privado', false).order('criado_em', { ascending: false }),
    supabaseAdmin.from('arquivos').select('*').eq('org_id', org).eq('compartilhado_cliente', true).order('nome'),
    supabaseAdmin.from('atendimentos').select('*').eq('org_id', org).eq('cliente_nome', cliente.nome).order('criado_em', { ascending: false }),
  ]);
  const procs = processos ?? [];
  const arqs = arquivos ?? [];
  const atds = atendimentos ?? [];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text">Olá, {cliente.nome}</h1>
        <p className="text-sm text-muted">Acompanhe seus processos e documentos.</p>
      </div>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-text">Seus processos</h2>
        {procs.length === 0 ? (
          <EmptyState title="Nenhum processo disponível para visualização." />
        ) : (
          <div className="grid gap-3">
            {procs.map((p: any) => (
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
        {arqs.length === 0 ? (
          <EmptyState title="Nenhum documento compartilhado com você ainda." />
        ) : (
          <Card className="divide-y divide-border">
            {arqs.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between p-4 text-sm">
                <span className="inline-flex items-center gap-2 text-text"><FileIcon size={15} className="text-muted" />{a.nome}</span>
                <span className="text-muted">{formatBytes(a.tamanho_bytes)}</span>
              </div>
            ))}
          </Card>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-text">Atendimentos</h2>
        {atds.length === 0 ? (
          <EmptyState title="Nenhum atendimento aberto." />
        ) : (
          <Card className="divide-y divide-border">
            {atds.map((a: any) => (
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
