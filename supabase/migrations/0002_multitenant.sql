-- MaisJurídico (clone) — multi-tenant por org_id + RLS.
-- Rodar no Supabase SQL Editor DEPOIS da 0001. Idempotente onde possível.

-- ============================================================
-- Orgs e membership
-- ============================================================
create table if not exists orgs (
  id uuid primary key default gen_random_uuid(),
  nome text not null default 'Meu escritório',
  plano text not null default 'gratis',
  created_at timestamptz not null default now()
);

create table if not exists org_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references orgs(id) on delete cascade,
  papel text not null default 'owner',
  created_at timestamptz not null default now()
);

-- org do usuário logado (security definer: lê org_members ignorando RLS)
create or replace function current_org() returns uuid
  language sql stable security definer set search_path = public as $$
  select org_id from org_members where user_id = auth.uid()
$$;

-- preenche org_id no insert quando vier nulo (app não precisa informar)
create or replace function set_org_id() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if new.org_id is null then new.org_id := current_org(); end if;
  return new;
end $$;

-- RLS de orgs e org_members
alter table orgs enable row level security;
drop policy if exists own_org on orgs;
create policy own_org on orgs for select using (id = current_org());

alter table org_members enable row level security;
drop policy if exists own_membership on org_members;
create policy own_membership on org_members for select using (user_id = auth.uid());

-- ============================================================
-- org_id + backfill + triggers + RLS em todas as tabelas de dados
-- ============================================================
do $$
declare
  def uuid;
  t text;
  tabelas text[] := array['pessoas','processos','compromissos','prazos','lancamentos',
    'modelos_texto','pastas','arquivos','atendimentos','advogados','tarefas','andamentos'];
begin
  -- org padrão (recebe os dados já existentes)
  select id into def from orgs order by created_at limit 1;
  if def is null then
    insert into orgs(nome) values ('Escritório Demo') returning id into def;
  end if;

  foreach t in array tabelas loop
    execute format('alter table %I add column if not exists org_id uuid references orgs(id) on delete cascade', t);
    execute format('update %I set org_id = %L where org_id is null', t, def);
    execute format('alter table %I alter column org_id set not null', t);
    execute format('create index if not exists %I on %I (org_id)', t || '_org_idx', t);

    execute format('drop trigger if exists trg_org_id on %I', t);
    execute format('create trigger trg_org_id before insert on %I for each row execute function set_org_id()', t);

    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists org_isolation on %I', t);
    execute format('create policy org_isolation on %I for all using (org_id = current_org()) with check (org_id = current_org())', t);
  end loop;

  -- usuários já existentes entram na org padrão
  insert into org_members(user_id, org_id, papel)
    select id, def, 'owner' from auth.users
    on conflict (user_id) do nothing;
end $$;

-- ============================================================
-- Novo cadastro cria uma org nova (escritório isolado)
-- ============================================================
create or replace function handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
declare new_org uuid;
begin
  insert into orgs(nome) values ('Meu escritório') returning id into new_org;
  insert into org_members(user_id, org_id, papel) values (new.id, new_org, 'owner');
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();
