-- MaisJurídico (clone) — schema inicial / primeira migração
-- Postgres (Supabase/Neon). Times em UTC (timestamptz). Dinheiro em centavos (integer) + currency.
-- Multi-tenant: tudo pertence a uma org (escritório). RLS por org_id (ver notas no fim).

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ============================================================
-- Tenancy, usuários e equipe
-- ============================================================

create table orgs ( -- escritório / conta
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  plano text not null default 'gratis'
    check (plano in ('gratis','individual','micro','online','premium')),
  status text not null default 'ativo'
    check (status in ('ativo','suspenso','cancelado')),
  -- limites efetivos do plano (desnormalizados p/ checagem rápida)
  limite_processos int,            -- null = ilimitado
  limite_storage_bytes bigint not null default 104857600, -- 100 MB
  limite_usuarios int not null default 1,
  limite_oabs int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table users ( -- login do sistema (advogado/equipe). Auth real via provedor (Auth.js/Supabase)
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  nome text not null,
  email text not null,
  oab text,
  oab_uf text check (oab_uf is null or char_length(oab_uf) = 2),
  papel text not null default 'membro' check (papel in ('owner','admin','membro')),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, email)
);
create index on users (org_id);

create table advogado_grupos (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  nome text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on advogado_grupos (org_id);

create table advogado_grupo_membros (
  grupo_id uuid not null references advogado_grupos(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  primary key (grupo_id, user_id)
);

-- ============================================================
-- Pessoas (clientes, adversos, advogados adversos, contatos)
-- ============================================================

create table pessoas (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  tipo text not null check (tipo in ('cliente','adverso','advogado_adverso','contato')),
  nome text not null,
  pessoa_tipo text check (pessoa_tipo in ('fisica','juridica')),
  documento text,                 -- CPF ou CNPJ (normalizado)
  sexo text check (sexo in ('M','F')),
  nascimento date,
  rg text, pis text, ctps text, ctps_serie text,
  estado_civil text,
  nacionalidade text,
  profissao text,
  nome_mae text,
  observacao text,
  -- advogado adverso
  oab text, oab_uf text check (oab_uf is null or char_length(oab_uf) = 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on pessoas (org_id, tipo);
create index on pessoas (org_id, nome);
create index on pessoas (org_id, documento);

-- contatos repetíveis
create table pessoa_emails (
  id uuid primary key default gen_random_uuid(),
  pessoa_id uuid not null references pessoas(id) on delete cascade,
  email text not null,
  principal boolean not null default false
);
create index on pessoa_emails (pessoa_id);

create table pessoa_telefones (
  id uuid primary key default gen_random_uuid(),
  pessoa_id uuid not null references pessoas(id) on delete cascade,
  tipo text,                      -- Celular/Residencial/Comercial/...
  ddi text, ddd text, numero text, ramal text, setor text, contato text
);
create index on pessoa_telefones (pessoa_id);

create table pessoa_enderecos (
  id uuid primary key default gen_random_uuid(),
  pessoa_id uuid not null references pessoas(id) on delete cascade,
  cep text, logradouro text, numero text, complemento text,
  bairro text, cidade text, uf text check (uf is null or char_length(uf) = 2)
);
create index on pessoa_enderecos (pessoa_id);

-- acesso ao portal do cliente (um por pessoa cliente)
create table cliente_acessos (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  pessoa_id uuid not null references pessoas(id) on delete cascade,
  login text not null,
  senha_hash text not null,
  ativo boolean not null default true,
  ultimo_acesso_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, login)
);
create index on cliente_acessos (pessoa_id);

-- ============================================================
-- Lookups customizáveis (por org) — classe, natureza, rito, fase, fórum, comarca, vara
-- ============================================================

create table lookups (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  tipo text not null check (tipo in
    ('classe','natureza','rito','fase','forum','comarca','vara','posicao_parte')),
  valor text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  unique (org_id, tipo, valor)
);
create index on lookups (org_id, tipo);

-- campos personalizados (metadados) + valores
create table campos_personalizados (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  entidade text not null check (entidade in ('processo','pessoa')),
  label text not null,
  tipo text not null default 'texto' check (tipo in ('texto','numero','data','select','bool')),
  opcoes jsonb,                   -- p/ select
  ordem int not null default 0,
  created_at timestamptz not null default now()
);
create index on campos_personalizados (org_id, entidade);

-- ============================================================
-- Processos
-- ============================================================

create table processos (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  numero text,                    -- CNJ (pode ser null em cadastro inicial)
  privado boolean not null default false, -- cliente não visualiza
  status text not null default 'ativo' check (status in ('ativo','suspenso','baixado')),
  fase_id uuid references lookups(id) on delete set null,
  classe_id uuid references lookups(id) on delete set null,
  natureza_id uuid references lookups(id) on delete set null,
  rito_id uuid references lookups(id) on delete set null,
  forum_id uuid references lookups(id) on delete set null,
  comarca_id uuid references lookups(id) on delete set null,
  vara_id uuid references lookups(id) on delete set null,
  data_abertura date,
  valor_causa_cents bigint,
  moeda text not null default 'BRL',
  pasta text,
  controle text,
  observacoes text,
  campos_extra jsonb not null default '{}', -- valores dos campos personalizados
  deleted_at timestamptz,         -- soft delete (Lixeira)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on processos (org_id, status) where deleted_at is null;
create index on processos (org_id, numero);
create unique index on processos (org_id, numero) where numero is not null and deleted_at is null;

-- partes do processo (cliente/adverso com posição)
create table processo_partes (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null references processos(id) on delete cascade,
  pessoa_id uuid not null references pessoas(id) on delete restrict,
  papel text not null check (papel in ('cliente','adverso')),
  posicao text,                   -- Autor/Réu/Requerente/... (lookup posicao_parte)
  created_at timestamptz not null default now()
);
create index on processo_partes (processo_id);
create index on processo_partes (pessoa_id);

-- advogados/equipe responsáveis (n-n)
create table processo_advogados (
  processo_id uuid not null references processos(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  primary key (processo_id, user_id)
);

-- ============================================================
-- Andamentos / Publicações
-- ============================================================

create table andamentos (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  processo_id uuid not null references processos(id) on delete cascade,
  data date not null,
  texto text not null,
  origem text not null default 'manual' check (origem in ('manual','automatico')),
  instancia text,
  fonte_ref text,                 -- id externo da fonte (dedup de captura)
  created_at timestamptz not null default now()
);
create index on andamentos (processo_id, data desc);
create unique index on andamentos (org_id, processo_id, fonte_ref) where fonte_ref is not null;

create table monitoramentos (     -- o que a org monitora (nome/OAB p/ publicações)
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  tipo text not null check (tipo in ('publicacao_oab','andamento_processo')),
  nome text,                      -- nome monitorado (publicações)
  oab text, oab_uf text,
  processo_id uuid references processos(id) on delete cascade, -- p/ andamento
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
create index on monitoramentos (org_id, tipo);

create table publicacoes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  monitoramento_id uuid references monitoramentos(id) on delete set null,
  diario text,
  data date not null,
  texto text not null,
  processo_id uuid references processos(id) on delete set null, -- vínculo manual
  lida boolean not null default false,
  fonte_ref text,
  created_at timestamptz not null default now()
);
create index on publicacoes (org_id, data desc);
create unique index on publicacoes (org_id, fonte_ref) where fonte_ref is not null;

-- ============================================================
-- Agenda: compromissos e prazos
-- ============================================================

create table compromissos (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  titulo text not null,
  descricao text,
  inicio_at timestamptz not null,
  fim_at timestamptz,
  dia_inteiro boolean not null default false,
  responsavel_id uuid references users(id) on delete set null,
  processo_id uuid references processos(id) on delete set null,
  google_event_id text,           -- sync Google Agenda
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fim_depois_inicio check (fim_at is null or fim_at > inicio_at)
);
create index on compromissos (org_id, inicio_at);
create index on compromissos (responsavel_id, inicio_at);

create table prazos (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  processo_id uuid references processos(id) on delete set null,
  descricao text not null,
  data date not null,
  responsavel_id uuid references users(id) on delete set null,
  cumprido boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on prazos (org_id, data) where cumprido = false;

create table alertas (            -- lembretes por e-mail/SMS de compromissos/prazos
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  ref_tipo text not null check (ref_tipo in ('compromisso','prazo')),
  ref_id uuid not null,
  canal text not null check (canal in ('email','sms')),
  disparar_at timestamptz not null,
  enviado_at timestamptz,
  created_at timestamptz not null default now()
);
create index on alertas (disparar_at) where enviado_at is null;

-- ============================================================
-- Financeiro
-- ============================================================

create table contas_bancarias (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  nome text not null,
  saldo_inicial_cents bigint not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
create index on contas_bancarias (org_id);

create table fin_categorias (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  tipo text not null check (tipo in ('receita','despesa')),
  nome text not null,
  parent_id uuid references fin_categorias(id) on delete cascade, -- subcategoria
  created_at timestamptz not null default now()
);
create index on fin_categorias (org_id, tipo);

create table lancamentos (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  tipo text not null check (tipo in ('receita','despesa')),
  conta_id uuid not null references contas_bancarias(id) on delete restrict,
  categoria_id uuid references fin_categorias(id) on delete set null,
  pessoa_id uuid references pessoas(id) on delete set null, -- cliente/fornecedor
  processo_id uuid references processos(id) on delete set null, -- honorário/custa
  descricao text,
  vencimento date not null,
  valor_cents bigint not null,
  juros_cents bigint not null default 0,
  multa_cents bigint not null default 0,
  moeda text not null default 'BRL',
  situacao text not null default 'aberto' check (situacao in ('aberto','pago')),
  pago_at date,
  recorrencia_id uuid,            -- agrupa parcelas repetidas
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on lancamentos (org_id, vencimento);
create index on lancamentos (conta_id);
create index on lancamentos (org_id, situacao, vencimento);

create table transferencias (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  origem_id uuid not null references contas_bancarias(id) on delete restrict,
  destino_id uuid not null references contas_bancarias(id) on delete restrict,
  valor_cents bigint not null,
  data date not null,
  created_at timestamptz not null default now(),
  constraint contas_diferentes check (origem_id <> destino_id)
);
create index on transferencias (org_id, data);

-- ============================================================
-- Documentos (editor de textos) e Arquivos (GED)
-- ============================================================

create table modelos_texto (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  titulo text not null,
  tipo text,                      -- contrato/recibo/procuração/...
  conteudo text not null,         -- HTML com variáveis de mala-direta {{cliente.nome}}
  is_modelo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on modelos_texto (org_id);

create table pastas (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  parent_id uuid references pastas(id) on delete cascade,
  nome text not null,
  created_at timestamptz not null default now()
);
create index on pastas (org_id, parent_id);

create table arquivos (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  pasta_id uuid references pastas(id) on delete set null,
  processo_id uuid references processos(id) on delete set null,
  pessoa_id uuid references pessoas(id) on delete set null,
  nome text not null,
  storage_key text not null,      -- chave no bucket (R2/Supabase Storage)
  tamanho_bytes bigint not null,
  mime text,
  compartilhado_cliente boolean not null default false,
  created_at timestamptz not null default now()
);
create index on arquivos (org_id, pasta_id);
create index on arquivos (processo_id);

-- ============================================================
-- SAC (atendimento) e Tarefas (workflow)
-- ============================================================

create table atendimentos (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  pessoa_id uuid references pessoas(id) on delete set null,
  assunto text,
  status text not null default 'aguardando'
    check (status in ('aguardando','em_dia','expirando','expirado','finalizado')),
  prazo_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on atendimentos (org_id, status);

create table atendimento_mensagens (
  id uuid primary key default gen_random_uuid(),
  atendimento_id uuid not null references atendimentos(id) on delete cascade,
  autor text not null check (autor in ('escritorio','cliente')),
  texto text not null,
  created_at timestamptz not null default now()
);
create index on atendimento_mensagens (atendimento_id, created_at);

create table workflow_quadros (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  nome text not null,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);
create index on workflow_quadros (org_id);

create table workflow_colunas (
  id uuid primary key default gen_random_uuid(),
  quadro_id uuid not null references workflow_quadros(id) on delete cascade,
  nome text not null,
  ordem int not null default 0
);
create index on workflow_colunas (quadro_id, ordem);

create table tarefas (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  coluna_id uuid references workflow_colunas(id) on delete set null,
  titulo text not null,
  descricao text,
  responsavel_id uuid references users(id) on delete set null,
  processo_id uuid references processos(id) on delete set null,
  prazo date,
  ordem int not null default 0,
  concluida boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on tarefas (org_id, coluna_id, ordem);
create index on tarefas (responsavel_id) where concluida = false;

-- ============================================================
-- Billing (assinatura) e Auditoria
-- ============================================================

create table assinaturas (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  provedor text not null default 'stripe', -- stripe | asaas | iugu (boleto BR)
  provedor_ref text,              -- subscription id
  plano text not null,
  ciclo text not null check (ciclo in ('mensal','anual')),
  status text not null,           -- active/past_due/canceled/trialing
  metodo text check (metodo in ('cartao','boleto','pix')),
  trial_ate date,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on assinaturas (org_id);
create unique index on assinaturas (provedor, provedor_ref) where provedor_ref is not null;

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  acao text not null,             -- login, create_processo, ...
  entidade text, entidade_id uuid,
  ip text,
  created_at timestamptz not null default now()
);
create index on audit_log (org_id, created_at desc);

-- ============================================================
-- Acesso / RLS (Supabase)
-- ============================================================
-- Ativar RLS em TODAS as tabelas com org_id e criar política:
--   using (org_id = (select org_id from users where id = auth.uid()))
-- O portal do cliente usa um papel/claim separado que só enxerga:
--   processos (privado=false) e arquivos (compartilhado_cliente=true) + atendimentos da própria pessoa.
-- Se não usar Supabase: uma checagem de autorização por query na camada de dados
-- (todo SELECT/UPDATE filtra por org_id derivado da sessão; portal filtra por pessoa_id).
