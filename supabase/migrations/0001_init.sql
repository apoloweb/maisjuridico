-- MaisJurídico (clone) — migração inicial (LEAN, single-tenant).
-- Alinhada ao que o app usa hoje (lib/types.ts). O schema normalizado completo
-- (multi-tenant, org_id, RLS) está em replica/schema.sql e é o alvo da próxima fase.
-- Rodar no Supabase: SQL Editor → colar este arquivo → Run. (ou `supabase db push`)

create extension if not exists "pgcrypto";

create table if not exists pessoas (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('cliente','adverso','advogado_adverso','contato')),
  nome text not null,
  documento text,
  email text,
  telefone text,
  cidade text,
  uf text,
  nascimento date,
  portal_login text,
  criado_em timestamptz not null default now()
);
create index if not exists pessoas_tipo_idx on pessoas (tipo);

create table if not exists processos (
  id uuid primary key default gen_random_uuid(),
  numero text,
  privado boolean not null default false,
  status text not null default 'ativo' check (status in ('ativo','suspenso','baixado')),
  classe text,
  natureza text,
  valor_causa_cents bigint,
  data_abertura date,
  cliente_id uuid references pessoas(id) on delete set null,
  cliente_nome text,
  posicao_cliente text,
  criado_em timestamptz not null default now()
);
create index if not exists processos_status_idx on processos (status);

create table if not exists compromissos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  inicio_at timestamptz not null,
  responsavel text,
  processo_numero text
);

create table if not exists prazos (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  data date not null,
  processo_numero text,
  responsavel text,
  cumprido boolean not null default false
);

create table if not exists lancamentos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('receita','despesa')),
  descricao text,
  valor_cents bigint not null,
  vencimento date not null,
  situacao text not null default 'aberto' check (situacao in ('aberto','pago')),
  conta text not null default 'Conta Principal',
  categoria text,
  recorrencia text
);
create index if not exists lancamentos_venc_idx on lancamentos (vencimento);

create table if not exists modelos_texto (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  tipo text,
  conteudo text not null,
  atualizado_em timestamptz not null default now()
);

create table if not exists pastas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  parent_id uuid references pastas(id) on delete cascade
);

create table if not exists arquivos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  pasta_id uuid references pastas(id) on delete set null,
  tamanho_bytes bigint not null,
  mime text,
  compartilhado_cliente boolean not null default false,
  criado_em timestamptz not null default now()
);

create table if not exists atendimentos (
  id uuid primary key default gen_random_uuid(),
  cliente_nome text not null,
  assunto text,
  status text not null default 'aguardando'
    check (status in ('aguardando','em_dia','expirando','expirado','finalizado')),
  criado_em timestamptz not null default now()
);

create table if not exists advogados (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  oab text,
  oab_uf text,
  email text,
  papel text not null default 'membro' check (papel in ('owner','admin','membro')),
  grupo text,
  ativo boolean not null default true
);

create table if not exists tarefas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  coluna text not null default 'afazer' check (coluna in ('afazer','fazendo','feito')),
  responsavel text,
  processo_numero text,
  prazo date
);

create table if not exists andamentos (
  id uuid primary key default gen_random_uuid(),
  processo_numero text not null,
  data date not null,
  texto text not null,
  origem text not null default 'manual' check (origem in ('manual','automatico'))
);

-- ------------------------------------------------------------------
-- Seed (sintético). Remover/ajustar à vontade.
-- ------------------------------------------------------------------
insert into pessoas (tipo, nome, documento, email, cidade, uf, nascimento, portal_login) values
  ('cliente','Construtora Horizonte Ltda','12.345.678/0001-90','contato@horizonte.exemplo','Belo Horizonte','MG','1998-10-26','horizonte'),
  ('cliente','Marina Alves de Souza','123.456.789-00','marina.alves@exemplo.com','São Paulo','SP','1990-11-02','marina'),
  ('adverso','Banco Província S.A.','98.765.432/0001-10',null,'Rio de Janeiro','RJ',null,null)
on conflict do nothing;

insert into processos (numero, privado, status, classe, natureza, valor_causa_cents, data_abertura, cliente_nome, posicao_cliente) values
  ('0012345-67.2026.8.13.0024', false, 'ativo', 'Ação de cobrança', 'Cível', 4500000, '2026-09-05', 'Construtora Horizonte Ltda', 'Autor'),
  ('0098765-43.2026.8.26.0100', true, 'suspenso', 'Ação de indenização', 'Cível', 1200000, '2026-09-22', 'Marina Alves de Souza', 'Requerente')
on conflict do nothing;

insert into compromissos (titulo, inicio_at, responsavel, processo_numero) values
  ('Audiência de conciliação', '2026-10-28T13:30:00Z', 'Dra. Helena', '0012345-67.2026.8.13.0024'),
  ('Reunião com cliente', '2026-10-30T18:00:00Z', 'Dr. Paulo', null);

insert into prazos (descricao, data, processo_numero, responsavel, cumprido) values
  ('Contestação', '2026-11-03', '0012345-67.2026.8.13.0024', 'Dra. Helena', false),
  ('Juntar documentos', '2026-10-27', '0098765-43.2026.8.26.0100', 'Dr. Paulo', false);

insert into lancamentos (tipo, descricao, valor_cents, vencimento, situacao, conta, categoria) values
  ('receita','Honorários — Horizonte',800000,'2026-10-10','pago','Conta Principal','Honorários'),
  ('despesa','Custas processuais',35000,'2026-10-30','aberto','Conta Principal','Custas');

insert into modelos_texto (titulo, tipo, conteudo) values
  ('Contrato de honorários','Contrato','CONTRATO DE HONORÁRIOS\n\nContratante: {{cliente.nome}} ({{cliente.documento}})...\nObjeto: patrocínio da causa {{processo.numero}}.'),
  ('Procuração ad judicia','Procuração','Outorgante: {{cliente.nome}}.\nPoderes: o foro em geral, para o processo {{processo.numero}}.');

insert into pastas (nome) values ('Contratos'), ('Petições');

insert into advogados (nome, oab, oab_uf, email, papel, grupo, ativo) values
  ('Dra. Helena Prado','123456','MG','helena@escritorio.exemplo','owner','Cível',true),
  ('Dr. Paulo Nunes','654321','SP','paulo@escritorio.exemplo','membro','Cível',true);

insert into tarefas (titulo, coluna, responsavel, processo_numero, prazo) values
  ('Protocolar contestação','afazer','Dra. Helena','0012345-67.2026.8.13.0024','2026-11-03'),
  ('Reunir documentos do cliente','fazendo','Dr. Paulo',null,null),
  ('Enviar procuração para assinatura','feito','Dra. Helena',null,null);

insert into andamentos (processo_numero, data, texto, origem) values
  ('0012345-67.2026.8.13.0024','2026-10-15','Juntada de petição inicial.','manual'),
  ('0012345-67.2026.8.13.0024','2026-10-22','Designada audiência de conciliação.','manual');

insert into atendimentos (cliente_nome, assunto, status) values
  ('Construtora Horizonte Ltda','Dúvida sobre audiência','em_dia'),
  ('Marina Alves de Souza','Envio de documentos','aguardando');

-- ------------------------------------------------------------------
-- RLS: nesta fase single-tenant, o app acessa via SERVICE ROLE no servidor
-- (as queries rodam só em Server Components/Server Actions, nunca no cliente).
-- Ao introduzir auth + org_id, habilitar RLS por org em todas as tabelas.
-- Por segurança, mantemos o acesso anônimo BLOQUEADO: RLS on + sem policy.
-- ------------------------------------------------------------------
alter table pessoas enable row level security;
alter table processos enable row level security;
alter table compromissos enable row level security;
alter table prazos enable row level security;
alter table lancamentos enable row level security;
alter table modelos_texto enable row level security;
alter table pastas enable row level security;
alter table arquivos enable row level security;
alter table atendimentos enable row level security;
alter table advogados enable row level security;
alter table tarefas enable row level security;
alter table andamentos enable row level security;
-- (service role ignora RLS; anon/authenticated ficam sem acesso até criarmos as policies.)
