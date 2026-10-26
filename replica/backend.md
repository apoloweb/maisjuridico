# Backend — clone MaisJurídico

Alvo: **Supabase** (Postgres) do usuário. GitHub + Vercel depois.
Projeto: `https://wkdkwdemlavlajqpmzjy.supabase.co`.

## Estado atual (fase 1 — persistência)

- [x] Cliente Supabase server-only (`lib/supabase.ts`) via service role.
- [x] Migração lean `supabase/migrations/0001_init.sql` (tabelas + seed sintético + RLS on).
- [x] `lib/data.ts` reescrito para consultar o Supabase — **mesmas assinaturas** (nenhuma tela mudou).
- [x] `.env.example` com todas as variáveis; `.env.local` com as chaves (gitignored).
- [x] Migração aplicada no Supabase (SQL Editor) — 12 tabelas + seed criados.
- [x] `@supabase/supabase-js` instalado e app validado no navegador (porta 3005).
- [x] Ciclo leitura + escrita confirmado: processo criado pela UI persistiu no banco.

## Decisões / escopo desta fase

- **Single-tenant** por enquanto: sem `org_id`. O schema normalizado multi-tenant completo está em `replica/schema.sql` e é a próxima fase.
- Acesso só pelo **servidor** (Server Components / Server Actions) com a **service role** — a chave nunca vai pro cliente. RLS está **ligada sem policies**, então anon/authenticated ficam bloqueados (a service role ignora RLS).
- Ao adicionar auth, criar `org_id` em todas as tabelas + policies RLS por org.

## Segurança

- [x] Segredos só em env; `.env*` no `.gitignore`.
- [x] Service role usada apenas no servidor (`lib/supabase.ts` lança erro se faltar env).
- [ ] **Rotacionar a secret key** (foi compartilhada no chat).
- [x] **Autenticação (Supabase Auth)**: login/signup/logout + middleware protegendo todas as rotas do painel; validado (redirect sem sessão, login, logout). Usuário de teste em `replica/dev-credentials.txt`.
- [ ] Validação de entrada no servidor (zod) nas server actions.
- [x] **Multi-tenant por org + RLS** (migração 0002): `org_id` em todas as tabelas, `org_members` liga auth→org, `current_org()`, trigger de signup cria org nova, RLS `org_id = current_org()`. App usa o cliente de sessão (respeita RLS). Portal lê via service role, escopado por org. (validar com 2º usuário)
- [ ] Restringir signup (hoje aberto) — tornar convite/por-org antes do launch.
- [ ] Auth própria do portal do cliente (hoje /portal é aberto por ?login=).
- [ ] Rate limit em auth/signup/envio de e-mail e SMS.

## Próximas fases (ainda não feitas)

- **Auth**: Supabase Auth (escritório) + sessão do portal do cliente; papéis owner/admin/membro.
- **Multi-tenant**: `org_id` + RLS por org (migrar do schema lean para `replica/schema.sql`).
- **Billing**: Stripe (cartão/PIX) + Asaas/Iugu (boleto); webhooks idempotentes; status na base.
- **E-mail**: Resend (domínio verificado) — alertas de prazo, acesso ao cliente.
- **Jobs**: alertas de prazo, recorrência financeira, status do SAC, sync Google Agenda.
- **Storage**: mover upload do GED (hoje só metadados) para Supabase Storage/R2 com limites.
- **M3**: captura de publicações/andamentos via API de terceiro (DataJud/Escavador/Judit).

## Como aplicar a migração (ação do usuário)

1. Abrir o SQL Editor: `https://supabase.com/dashboard/project/wkdkwdemlavlajqpmzjy/sql/new`
2. Colar todo o conteúdo de `supabase/migrations/0001_init.sql` e clicar **Run**.
3. Avisar aqui — então rodamos `npm install` e validamos no navegador.
