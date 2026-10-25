# Arquitetura do clone: MaisJurídico

Base: `replica/recon.md`, `replica/features.csv`. Schema: `replica/schema.sql`.
Data: 2026-10-25

> Objetivo: reconstruir a **funcionalidade e UX** do MaisJurídico num stack moderno.
> O original é um monólito PHP/MySQL legado; o clone não precisa da arquitetura dele, precisa das features dele.

## 1. Stack

| camada | escolha | por quê |
| --- | --- | --- |
| web app | **Next.js (App Router) + TypeScript** | SSR + server actions; um só app p/ painel e portal do cliente; ecossistema grande |
| estilo | **Tailwind** + tokens (vêm do `/replica-design`) | rápido, consistente, fácil de manter o visual limpo do original |
| banco | **Postgres** (Supabase ou Neon) | relacional (o domínio é todo relacional); gerenciado e barato a zero usuários |
| ORM | **Drizzle** | SQL-first, migrações versionadas, types do schema |
| auth | **Supabase Auth** (ou Auth.js) | 2 públicos: equipe (users) e cliente (portal) — papéis/claims separados |
| pagamentos | **Stripe** (cartão/PIX) + **Asaas ou Iugu** p/ **boleto** | Stripe não cobre boleto no BR de forma plena; boleto é essencial no público jurídico BR |
| e-mail | **Resend** | alertas de prazo, envio de acesso ao cliente, notificações |
| SMS | **Zenvia ou Twilio** | alertas por SMS (feature do original) |
| jobs | **Inngest** (ou Vercel Cron + Trigger.dev) | alertas agendados, captura de publicações/andamentos, cálculo de recorrência |
| arquivos | **Cloudflare R2** (ou Supabase Storage) | GED: upload, cota por plano, URLs assinadas |
| captura jurídica | **API de terceiro**: DataJud (CNJ), Escavador, Judit ou Codilo | publicações e andamentos — NUNCA raspar os tribunais à mão nem a API privada do original |
| hosting | **Vercel** | deploy do Next; jobs no Inngest/Trigger |

Regras: **um banco**, **sem microserviços**. Tudo multi-tenant por `org_id`.

## 2. Schema

Ver `replica/schema.sql` — **37 tabelas**, Postgres. Decisões:
- `id uuid` + `created_at`/`updated_at` em tudo; **tudo com `org_id`** (tenant = escritório).
- Tempos em `timestamptz` (UTC); dinheiro em **centavos** (`*_cents bigint`) + `moeda`.
- Status com `check` (processos: ativo/suspenso/baixado; lançamentos: aberto/pago; SAC: aguardando/em_dia/expirando/expirado/finalizado).
- FKs com `on delete` decidido (cascade no que é filho; `set null` no que é referência opcional; `restrict` onde apagar perderia dinheiro/parte).
- Índices em toda FK e em colunas de filtro (status, vencimento, data).
- **Lookups customizáveis** (`lookups`) e **campos personalizados** (`campos_personalizados` + `campos_extra jsonb`), como no original.
- **Dedup de captura:** `fonte_ref` + unique index parcial em `andamentos`/`publicacoes` (webhooks/scrapes chegam repetidos).
- **Acesso:** RLS por `org_id`; portal do cliente é papel separado que só vê processos `privado=false`, arquivos `compartilhado_cliente=true` e seus próprios atendimentos.

## 3. API (rotas / server actions)

`método rota | o que faz | quem chama | input | output`

**Auth / conta**
- `POST /api/auth/*` | login/senha, logout, reset | público | credenciais | sessão
- `POST /orgs` | cria escritório no signup | público | nome, plano | org+owner

**Processos** (F01)
- `GET /api/processos` | lista+filtra | equipe | status, cliente, q | lista
- `POST /api/processos` | cria (com partes e advogados) | equipe | payload processo | processo
- `PATCH /api/processos/:id` | edita | equipe | campos | processo
- `DELETE /api/processos/:id` | soft delete (Lixeira) | equipe | — | ok
- `POST /api/processos/import` | importação em lote (planilha) | equipe | arquivo xlsx | job

**Pessoas** (F02)
- `GET/POST/PATCH /api/pessoas` | CRUD cliente/adverso/contato | equipe | payload | pessoa
- `POST /api/pessoas/:id/acesso` | gera login/senha do portal + e-mail | equipe | — | credenciais

**Agenda** (F06)
- `GET /api/compromissos?range=` | eventos do período | equipe | datas | eventos
- `POST/PATCH/DELETE /api/compromissos` | CRUD | equipe | payload | evento
- `GET/POST/PATCH /api/prazos` | CRUD prazos | equipe | payload | prazo

**Financeiro** (F05)
- `GET /api/lancamentos?mes=&conta=&situacao=` | lista | equipe | filtros | lista+saldo
- `POST /api/lancamentos` | cria (c/ recorrência gera parcelas) | equipe | payload | lançamentos
- `POST /api/transferencias` | transfere entre contas | equipe | payload | ok
- `GET/POST /api/contas`, `/api/fin-categorias` | contas e categorias | equipe | | |

**Documentos / GED**
- `GET/POST/PATCH /api/textos` | modelos + mala-direta | equipe | | documento
- `POST /api/arquivos` | upload (URL assinada R2) | equipe | file meta | arquivo
- `GET /api/arquivos`, `PATCH compartilhar` | listar/compartilhar | equipe | | |

**Workflow / SAC / Relatórios**
- `GET/POST/PATCH /api/tarefas`, `/api/quadros` | kanban | equipe | | |
- `GET/POST /api/atendimentos` | SAC | equipe/cliente | | |
- `GET /api/relatorios/:tipo` | relatórios filtráveis | equipe | filtros | dados/export

**Captura jurídica**
- `GET/POST /api/monitoramentos` | cadastra nome/OAB ou processo | equipe (gated) | | |
- `GET /api/publicacoes`, `GET /api/processos/:id/andamentos` | consome capturado | equipe | | |

**Portal do cliente** (`/portal/*`)
- `GET /portal/processos` | só os do cliente, `privado=false` | cliente | — | lista
- `GET /portal/arquivos` | `compartilhado_cliente=true` | cliente | — | lista
- `GET/POST /portal/atendimentos` | abre/responde SAC | cliente | | |

**Webhooks (in)**
- `POST /api/webhooks/stripe` | assinatura paga/cancelada → atualiza `orgs.plano`, `assinaturas`
- `POST /api/webhooks/asaas` | boleto compensado → libera plano
- `POST /api/webhooks/juridico` | callback da API de captura → grava publicações/andamentos (idempotente via `fonte_ref`)

**Jobs (agendados)**
- `alertas-dispatch` (a cada 5 min): envia e-mail/SMS de `alertas` com `disparar_at <= now`
- `captura-publicacoes` (diário): puxa publicações por monitoramento
- `captura-andamentos` (diário): puxa andamentos CNJ dos processos monitorados
- `recorrencia-financeira` (diário): materializa próximas parcelas
- `sac-status` (diário): recalcula status (em_dia/expirando/expirado)
- `google-agenda-sync` (webhook + periódico): two-way sync de compromissos

> Só APIs oficiais/públicas com as **chaves do próprio usuário**. Nunca os endpoints privados do MaisJurídico, mesmo visíveis no browser.

## 4. As partes que mordem

- **Fuso/horário de verão:** guardar tudo em UTC; agenda e alertas renderizam em America/Sao_Paulo; prazos são por **dia** (date), cuidado com virada de dia.
- **Idempotência:** webhooks (Stripe/Asaas) e capturas chegam 2×. `fonte_ref` + unique index; Stripe event id dedup.
- **Captura jurídica é frágil e não-garantida** (o próprio original avisa). Tratar como *best-effort*, mostrar aviso ao usuário, nunca prometer entrega. Preferir API paga confiável (DataJud/Escavador) a scraping.
- **Limites por plano:** checar `orgs.limite_*` antes de criar processo/usuário/upload; bloquear e oferecer upgrade (como o gating `→ /planos.php` do original).
- **Tamanho de arquivo / cota:** validar no upload; somar `tamanho_bytes` por org vs `limite_storage_bytes`.
- **Boleto (BR):** compensação em ~1 dia útil → liberar plano só no webhook de pagamento, não no checkout.
- **Multi-tenancy:** RLS obrigatória; todo query filtra por `org_id`. Portal do cliente num escopo ainda mais restrito.
- **LGPD:** dados sensíveis (CPF, processos). Exclusão sob pedido, export de dados, log de acessos (`audit_log`).
- **Entregabilidade de e-mail:** domínio verificado (SPF/DKIM) no Resend; e-mails de alerta não podem cair em spam.
- **Mala-direta:** sanitizar variáveis `{{...}}` do editor; nunca interpolar HTML não-escapado de usuário.

## 5. Ordem de build

**M0 — Fatia vertical (prova o stack).**
Signup de escritório → cadastrar 1 cliente → cadastrar 1 processo com esse cliente → ver na lista e no dashboard.
Telas S01, S02, S03/S03a, S04/S04a. Tabelas orgs, users, pessoas, processos, processo_partes. Rotas auth, /processos, /pessoas.

**M1 — Must-haves, núcleo do escritório.**
- Agenda + Prazos + alertas e-mail (S06) — compromissos, prazos, alertas, job alertas-dispatch
- Financeiro (S07/S07a) — contas, categorias, lançamentos, transferências, recorrência
- Documentos: editor/modelos (S15) + GED/arquivos (S13)
- Andamentos manuais + lookups/campos personalizados (S17)
- Relatórios básicos (S09) e Estatísticas (S10)
- **Portal do cliente** (processos não-privados + arquivos compartilhados)
- Billing: planos, checkout cartão + boleto, gating por plano

**M2 — Should-haves.**
Equipe/multiusuário + grupos (S05), Workflow kanban (S16), SAC + aniversariantes (S08), alertas SMS, import em lote (planilha), Google Agenda sync, exportar relatórios.

**M3 — Could-haves / diferenciais.**
Captura de **publicações** (por nome/OAB) e **andamentos automáticos** (CNJ) via API de terceiro + monitoramentos. Controle de horas. Histórico de atividades/acessos refinado.

**Fora do MVP (skip):** Site + domínio e caixas de e-mail (integrações de registro/hospedagem; o próprio original está descontinuando). Importação via OAB (depende da fonte dos tribunais).

**M4 — Os ajustes** que o `/replica-entrepreneur` apontar (posicionamento, preço, o que cortar/melhorar).

## Resumo

- **Stack:** Next.js + TS + Postgres (Drizzle) + Supabase Auth + Stripe/Asaas + R2 + Inngest, captura jurídica via API de terceiro.
- **Tabelas:** 37. **Rotas/ações:** ~40 + 3 webhooks + 6 jobs.
- **3 partes mais arriscadas:** (1) captura de publicações/andamentos (frágil, terceirizar); (2) portal do cliente (2º público + RLS restrita); (3) billing boleto + gating por plano.
- **Próximo passo:** `/replica-design`.
