import { listTarefas, COLUNAS } from '@/lib/data';
import { createTarefaAction, moverTarefaAction } from '@/app/actions';
import { PageHeader, Card, Button, Input, Select } from '@/components/ui';

export default async function WorkflowPage() {
  const tarefas = await listTarefas();
  return (
    <>
      <PageHeader title="Workflow" subtitle="Quadro de tarefas" />

      <Card className="mb-4 p-4">
        <form action={createTarefaAction} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="font-semibold text-muted">Nova tarefa</span>
            <Input name="titulo" required placeholder="Descreva a tarefa" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-muted">Responsável</span>
            <Input name="responsavel" placeholder="Opcional" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-muted">Coluna</span>
            <Select name="coluna" defaultValue="afazer">
              {COLUNAS.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
          </label>
          <Button type="submit" variant="cta">Adicionar</Button>
        </form>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {COLUNAS.map((col) => {
          const doColuna = tarefas.filter((t) => t.coluna === col.id);
          return (
            <div key={col.id} className="rounded-md bg-surface p-3">
              <h2 className="mb-3 flex items-center justify-between text-sm font-semibold text-text">
                {col.nome}<span className="rounded-pill bg-border px-2 text-xs text-muted">{doColuna.length}</span>
              </h2>
              <ul className="space-y-2">
                {doColuna.map((t) => (
                  <li key={t.id}>
                    <Card className="p-3">
                      <div className="text-sm font-medium text-text">{t.titulo}</div>
                      <div className="mt-1 text-xs text-muted">
                        {t.responsavel ?? 'Sem responsável'}{t.processoNumero ? ` · ${t.processoNumero}` : ''}
                      </div>
                      <div className="mt-2 flex gap-1">
                        {COLUNAS.filter((c) => c.id !== t.coluna).map((c) => (
                          <form key={c.id} action={moverTarefaAction}>
                            <input type="hidden" name="id" value={t.id} />
                            <input type="hidden" name="coluna" value={c.id} />
                            <button type="submit" className="rounded-sm border border-border px-2 py-0.5 text-xs text-muted hover:bg-border/40">→ {c.nome}</button>
                          </form>
                        ))}
                      </div>
                    </Card>
                  </li>
                ))}
                {doColuna.length === 0 && <li className="py-6 text-center text-xs text-muted">Sem tarefas</li>}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-muted">Mover por botões; o arrastar-e-soltar entra numa próxima iteração.</p>
    </>
  );
}
