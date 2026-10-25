import Link from 'next/link';
import { listAdvogados } from '@/lib/data';
import { PageHeader, Card, Button, EmptyState, StatusPill } from '@/components/ui';

const LIMITE_PLANO = 2; // usuários adicionais (ex.: plano Micro)

export default async function EquipePage() {
  const advogados = await listAdvogados();
  return (
    <>
      <PageHeader
        title="Advogados / Equipe"
        subtitle={`${advogados.length} usuário(s) · limite do plano: ${LIMITE_PLANO}`}
        actions={<Link href="/equipe/novo"><Button variant="cta">Adicionar</Button></Link>}
      />
      {advogados.length === 0 ? (
        <EmptyState title="Você ainda não cadastrou nenhum advogado." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">OAB</th>
                <th className="px-4 py-3 font-semibold">E-mail</th>
                <th className="px-4 py-3 font-semibold">Grupo</th>
                <th className="px-4 py-3 font-semibold">Papel</th>
              </tr>
            </thead>
            <tbody>
              {advogados.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-text">{a.nome}</td>
                  <td className="px-4 py-3 text-muted">{a.oab ? `${a.oab}/${a.oabUf ?? ''}` : '—'}</td>
                  <td className="px-4 py-3 text-muted">{a.email ?? '—'}</td>
                  <td className="px-4 py-3 text-muted">{a.grupo ?? '—'}</td>
                  <td className="px-4 py-3 capitalize text-muted">{a.papel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
