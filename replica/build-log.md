# Build log — clone MaisJurídico

Clean-room. Stack: Next.js (App Router) + TS + Tailwind. Camada de dados fake (`lib/data.ts`) até o `/replica-backend`.

## M0 — fatia vertical + shell (2026-10-25)
Scaffold Next/TS/Tailwind + tokens; camada de dados fake + seed; primitivas; AppShell (15 módulos, responsivo); Dashboard; Processos (lista+novo); Clientes (lista+novo); Financeiro (lista); Diário Oficial (gated); demais stubs. Fatia vertical cliente→processo→lista→dashboard validada.

## M1 — screen-by-screen (2026-10-25)
Agenda (compromissos+prazos+forms, lista); Financeiro completo (resumo + form com recorrência); Editor de textos (modelos + mala-direta); Arquivos/GED (pastas, cota, upload demo, compartilhamento); Portal do cliente (`/portal`, layout próprio, privacidade respeitada). Validado no navegador.

## M2 — screen-by-screen (2026-10-25)

| item | status | observação |
| --- | --- | --- |
| S16 Workflow (kanban) | feito | 3 colunas (A fazer/Fazendo/Feito) + criar tarefa + mover por botões (server actions). Drag-and-drop pendente |
| S05 Equipe | feito | lista de advogados (OAB/papel/grupo) + form (`/equipe/novo`) + contagem vs limite do plano |
| S08 SAC | feito | atendimentos com status + form (`/sac/novo`) + **aniversariantes do mês** + nota de SMS |
| S09 Relatórios | feito | seletor de relatório (Processos/Financeiro/Prazos) + resultados e totais |
| S10 Estatísticas | feito | KPIs + barras (processos por status, receitas vs despesas) |
| Andamentos (manuais) | feito | lista + form por processo (`/andamentos/novo`); nota sobre captura automática (M3) |
| Camada de dados | estendida | +advogados, tarefas, andamentos, atendimentos, aniversariantes, `getEstatisticas` |

### Validado no navegador (localhost:3000)
Workflow, Estatísticas, SAC, Relatórios e Andamentos renderizam sem erro. Movimentação de tarefa por botão funciona (server action). Screenshots em `replica/clone-screens/`.

### Issues conhecidos / honestos
- **Andamentos:** o selo de origem reaproveita o StatusPill e exibe "Pago" para andamento manual — rótulo cosmético a ajustar (criar um pill próprio de origem).
- **Workflow:** mover é por botões; falta drag-and-drop (dnd-kit).
- Dados seguem **fake/memória**; sem auth/multi-tenant; estados de loading/erro não cobrem todas as telas.

### O que ainda falta
- **Persistência real** → `/replica-backend` (Postgres do `schema.sql`).
- **Auth** (escritório + login do portal) e **multi-tenant** (RLS por org).
- Telas restantes: adversos/advogados adversos/contatos, lookups/campos personalizados (Configurações), grade de calendário na Agenda, CRUD de contas/grupos.
- **Billing/planos** e gating efetivo por limite.
- **M3 — diferenciais:** captura de publicações (nome/OAB) e andamentos automáticos (CNJ) via API de terceiro.

### Próximo passo
`/replica-backend` (ligar o Postgres) — recomendado, pra consolidar a base — ou `/replica-test` / `/replica-diff` para fechar o ciclo das telas atuais.
