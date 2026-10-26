// Camada de dados REAL (Supabase/Postgres). Mantém as MESMAS assinaturas da
// versão fake anterior — por isso nenhuma tela precisou mudar.
// Roda só no servidor (Server Components / Server Actions) via service role.
import { createClient } from './supabase/server';
import type {
  Pessoa, Processo, DashboardResumo, Lancamento, Prazo, Compromisso,
  ModeloTexto, Pasta, Arquivo, Atendimento, Advogado, Tarefa, Andamento, ColunaTarefa,
} from './types';

// Cliente de SESSÃO por request: respeita RLS (org_id = current_org()).
// Proxy adia a criação até o uso (dentro do escopo da request).
const db = new Proxy({} as ReturnType<typeof createClient>, {
  get(_t, prop) {
    const c = createClient();
    const v = (c as unknown as Record<string | symbol, unknown>)[prop];
    return typeof v === 'function' ? (v as (...a: unknown[]) => unknown).bind(c) : v;
  },
});

function must<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(`Supabase: ${res.error.message}`);
  return res.data as T;
}

// ---- mappers snake_case (DB) → camelCase (tipos) ----
const mPessoa = (r: any): Pessoa => ({ id: r.id, tipo: r.tipo, nome: r.nome, documento: r.documento ?? undefined, email: r.email ?? undefined, telefone: r.telefone ?? undefined, cidade: r.cidade ?? undefined, uf: r.uf ?? undefined, nascimento: r.nascimento ?? undefined, portalLogin: r.portal_login ?? undefined, criadoEm: r.criado_em });
const mProcesso = (r: any): Processo => ({ id: r.id, numero: r.numero ?? undefined, privado: r.privado, status: r.status, classe: r.classe ?? undefined, natureza: r.natureza ?? undefined, valorCausaCents: r.valor_causa_cents ?? undefined, dataAbertura: r.data_abertura ?? undefined, clienteId: r.cliente_id ?? undefined, clienteNome: r.cliente_nome ?? undefined, posicaoCliente: r.posicao_cliente ?? undefined, criadoEm: r.criado_em });
const mCompromisso = (r: any): Compromisso => ({ id: r.id, titulo: r.titulo, inicioAt: r.inicio_at, responsavel: r.responsavel ?? undefined, processoNumero: r.processo_numero ?? undefined });
const mPrazo = (r: any): Prazo => ({ id: r.id, descricao: r.descricao, data: r.data, processoNumero: r.processo_numero ?? undefined, responsavel: r.responsavel ?? undefined, cumprido: r.cumprido });
const mLancamento = (r: any): Lancamento => ({ id: r.id, tipo: r.tipo, descricao: r.descricao ?? '', valorCents: r.valor_cents, vencimento: r.vencimento, situacao: r.situacao, conta: r.conta, categoria: r.categoria ?? undefined, recorrencia: r.recorrencia ?? undefined });
const mModelo = (r: any): ModeloTexto => ({ id: r.id, titulo: r.titulo, tipo: r.tipo ?? undefined, conteudo: r.conteudo, atualizadoEm: r.atualizado_em });
const mPasta = (r: any): Pasta => ({ id: r.id, nome: r.nome, parentId: r.parent_id ?? undefined });
const mArquivo = (r: any): Arquivo => ({ id: r.id, nome: r.nome, pastaId: r.pasta_id ?? undefined, tamanhoBytes: r.tamanho_bytes, mime: r.mime ?? undefined, compartilhadoCliente: r.compartilhado_cliente, criadoEm: r.criado_em });
const mAtendimento = (r: any): Atendimento => ({ id: r.id, clienteNome: r.cliente_nome, assunto: r.assunto ?? '', status: r.status, criadoEm: r.criado_em });
const mAdvogado = (r: any): Advogado => ({ id: r.id, nome: r.nome, oab: r.oab ?? undefined, oabUf: r.oab_uf ?? undefined, email: r.email ?? undefined, papel: r.papel, grupo: r.grupo ?? undefined, ativo: r.ativo });
const mTarefa = (r: any): Tarefa => ({ id: r.id, titulo: r.titulo, coluna: r.coluna, responsavel: r.responsavel ?? undefined, processoNumero: r.processo_numero ?? undefined, prazo: r.prazo ?? undefined });
const mAndamento = (r: any): Andamento => ({ id: r.id, processoNumero: r.processo_numero, data: r.data, texto: r.texto, origem: r.origem });

// ---- Pessoas ----
export async function listPessoas(opts?: { tipo?: Pessoa['tipo']; q?: string }): Promise<Pessoa[]> {
  let q = db.from('pessoas').select('*').order('nome');
  if (opts?.tipo) q = q.eq('tipo', opts.tipo);
  if (opts?.q) q = q.or(`nome.ilike.%${opts.q}%,documento.ilike.%${opts.q}%`);
  return must(await q).map(mPessoa);
}
export async function getPessoaByLogin(login: string): Promise<Pessoa | undefined> {
  const { data, error } = await db.from('pessoas').select('*').eq('portal_login', login).maybeSingle();
  if (error) throw new Error(`Supabase: ${error.message}`);
  return data ? mPessoa(data) : undefined;
}
export async function createPessoa(input: Omit<Pessoa, 'id' | 'criadoEm'>): Promise<Pessoa> {
  const row = { tipo: input.tipo, nome: input.nome, documento: input.documento, email: input.email, telefone: input.telefone, cidade: input.cidade, uf: input.uf, nascimento: input.nascimento, portal_login: input.portalLogin };
  return mPessoa(must(await db.from('pessoas').insert(row).select().single()));
}
export async function listAniversariantes(mes: number): Promise<Pessoa[]> {
  const todas = must(await db.from('pessoas').select('*').not('nascimento', 'is', null)).map(mPessoa);
  return todas.filter((p) => p.nascimento && new Date(p.nascimento + 'T00:00:00').getMonth() + 1 === mes);
}

// ---- Processos ----
export async function listProcessos(opts?: { status?: Processo['status'] | 'todos'; q?: string; clienteNome?: string; incluirPrivado?: boolean }): Promise<Processo[]> {
  let q = db.from('processos').select('*').order('criado_em', { ascending: false });
  if (opts?.status && opts.status !== 'todos') q = q.eq('status', opts.status);
  if (opts?.clienteNome) q = q.eq('cliente_nome', opts.clienteNome);
  if (opts?.incluirPrivado === false) q = q.eq('privado', false);
  if (opts?.q) q = q.or(`numero.ilike.%${opts.q}%,cliente_nome.ilike.%${opts.q}%`);
  return must(await q).map(mProcesso);
}
export async function createProcesso(input: Omit<Processo, 'id' | 'criadoEm'>): Promise<Processo> {
  const row = { numero: input.numero, privado: input.privado, status: input.status, classe: input.classe, natureza: input.natureza, valor_causa_cents: input.valorCausaCents, data_abertura: input.dataAbertura || null, cliente_id: input.clienteId, cliente_nome: input.clienteNome, posicao_cliente: input.posicaoCliente };
  return mProcesso(must(await db.from('processos').insert(row).select().single()));
}

// ---- Agenda ----
export async function listCompromissos(): Promise<Compromisso[]> {
  return must(await db.from('compromissos').select('*').order('inicio_at')).map(mCompromisso);
}
export async function createCompromisso(input: Omit<Compromisso, 'id'>): Promise<Compromisso> {
  const row = { titulo: input.titulo, inicio_at: input.inicioAt, responsavel: input.responsavel, processo_numero: input.processoNumero };
  return mCompromisso(must(await db.from('compromissos').insert(row).select().single()));
}
export async function listPrazos(): Promise<Prazo[]> {
  return must(await db.from('prazos').select('*').order('data')).map(mPrazo);
}
export async function createPrazo(input: Omit<Prazo, 'id'>): Promise<Prazo> {
  const row = { descricao: input.descricao, data: input.data, processo_numero: input.processoNumero, responsavel: input.responsavel, cumprido: input.cumprido };
  return mPrazo(must(await db.from('prazos').insert(row).select().single()));
}

// ---- Financeiro ----
export async function listLancamentos(opts?: { tipo?: Lancamento['tipo'] }): Promise<Lancamento[]> {
  let q = db.from('lancamentos').select('*').order('vencimento');
  if (opts?.tipo) q = q.eq('tipo', opts.tipo);
  return must(await q).map(mLancamento);
}
export async function createLancamento(input: Omit<Lancamento, 'id'>): Promise<Lancamento> {
  const row = { tipo: input.tipo, descricao: input.descricao, valor_cents: input.valorCents, vencimento: input.vencimento, situacao: input.situacao, conta: input.conta, categoria: input.categoria, recorrencia: input.recorrencia };
  return mLancamento(must(await db.from('lancamentos').insert(row).select().single()));
}

// ---- Documentos ----
export async function listModelos(): Promise<ModeloTexto[]> {
  return must(await db.from('modelos_texto').select('*').order('titulo')).map(mModelo);
}
export async function createModelo(input: Omit<ModeloTexto, 'id' | 'atualizadoEm'>): Promise<ModeloTexto> {
  const row = { titulo: input.titulo, tipo: input.tipo, conteudo: input.conteudo };
  return mModelo(must(await db.from('modelos_texto').insert(row).select().single()));
}

// ---- Arquivos (GED) ----
export async function listPastas(): Promise<Pasta[]> {
  return must(await db.from('pastas').select('*').order('nome')).map(mPasta);
}
export async function listArquivos(opts?: { pastaId?: string; compartilhadoCliente?: boolean }): Promise<Arquivo[]> {
  let q = db.from('arquivos').select('*').order('nome');
  if (opts?.pastaId !== undefined) q = q.eq('pasta_id', opts.pastaId);
  if (opts?.compartilhadoCliente) q = q.eq('compartilhado_cliente', true);
  return must(await q).map(mArquivo);
}
export async function createArquivo(input: Omit<Arquivo, 'id' | 'criadoEm'>): Promise<Arquivo> {
  const row = { nome: input.nome, pasta_id: input.pastaId, tamanho_bytes: input.tamanhoBytes, mime: input.mime, compartilhado_cliente: input.compartilhadoCliente };
  return mArquivo(must(await db.from('arquivos').insert(row).select().single()));
}
export async function createPasta(nome: string): Promise<Pasta> {
  return mPasta(must(await db.from('pastas').insert({ nome }).select().single()));
}
export async function storageUsadoBytes(): Promise<number> {
  const arqs = must(await db.from('arquivos').select('tamanho_bytes')) as { tamanho_bytes: number }[];
  return arqs.reduce((s, a) => s + a.tamanho_bytes, 0);
}

// ---- SAC ----
export async function listAtendimentos(opts?: { clienteNome?: string; status?: Atendimento['status'] }): Promise<Atendimento[]> {
  let q = db.from('atendimentos').select('*').order('criado_em', { ascending: false });
  if (opts?.clienteNome) q = q.eq('cliente_nome', opts.clienteNome);
  if (opts?.status) q = q.eq('status', opts.status);
  return must(await q).map(mAtendimento);
}
export async function createAtendimento(input: Omit<Atendimento, 'id' | 'criadoEm'>): Promise<Atendimento> {
  const row = { cliente_nome: input.clienteNome, assunto: input.assunto, status: input.status };
  return mAtendimento(must(await db.from('atendimentos').insert(row).select().single()));
}

// ---- Equipe ----
export async function listAdvogados(): Promise<Advogado[]> {
  return must(await db.from('advogados').select('*').order('nome')).map(mAdvogado);
}
export async function createAdvogado(input: Omit<Advogado, 'id'>): Promise<Advogado> {
  const row = { nome: input.nome, oab: input.oab, oab_uf: input.oabUf, email: input.email, papel: input.papel, grupo: input.grupo, ativo: input.ativo };
  return mAdvogado(must(await db.from('advogados').insert(row).select().single()));
}

// ---- Workflow ----
export const COLUNAS: { id: ColunaTarefa; nome: string }[] = [
  { id: 'afazer', nome: 'A fazer' },
  { id: 'fazendo', nome: 'Fazendo' },
  { id: 'feito', nome: 'Feito' },
];
export async function listTarefas(): Promise<Tarefa[]> {
  return must(await db.from('tarefas').select('*')).map(mTarefa);
}
export async function createTarefa(input: Omit<Tarefa, 'id'>): Promise<Tarefa> {
  const row = { titulo: input.titulo, coluna: input.coluna, responsavel: input.responsavel, processo_numero: input.processoNumero, prazo: input.prazo || null };
  return mTarefa(must(await db.from('tarefas').insert(row).select().single()));
}
export async function moverTarefa(id: string, coluna: ColunaTarefa): Promise<void> {
  const { error } = await db.from('tarefas').update({ coluna }).eq('id', id);
  if (error) throw new Error(`Supabase: ${error.message}`);
}

// ---- Andamentos ----
export async function listAndamentos(opts?: { processoNumero?: string }): Promise<Andamento[]> {
  let q = db.from('andamentos').select('*').order('data', { ascending: false });
  if (opts?.processoNumero) q = q.eq('processo_numero', opts.processoNumero);
  return must(await q).map(mAndamento);
}
export async function createAndamento(input: Omit<Andamento, 'id'>): Promise<Andamento> {
  const row = { processo_numero: input.processoNumero, data: input.data, texto: input.texto, origem: input.origem };
  return mAndamento(must(await db.from('andamentos').insert(row).select().single()));
}

// ---- Dashboard ----
export async function getDashboard(): Promise<DashboardResumo> {
  const [lanc, comps, procsCount] = await Promise.all([
    listLancamentos(),
    listCompromissos(),
    db.from('processos').select('id', { count: 'exact', head: true }),
  ]);
  const now = new Date();
  const ym = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
  const mesAtual = ym(now);
  const receitasMesCents = lanc
    .filter((l) => l.tipo === 'receita' && l.vencimento.slice(0, 7) === mesAtual)
    .reduce((s, l) => s + l.valorCents, 0);
  const eventosMes = comps.filter((c) => c.inicioAt.slice(0, 7) === mesAtual).length;
  const meses = Array.from({ length: 12 }, (_, i) => {
    const dt = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return { key: ym(dt), label: `${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getFullYear()).slice(2)}` };
  });
  const receitas12m = meses.map((m) => ({
    mes: m.label,
    valorCents: lanc
      .filter((l) => l.tipo === 'receita' && l.vencimento.slice(0, 7) === m.key)
      .reduce((s, l) => s + l.valorCents, 0),
  }));
  return {
    receitasMesCents,
    eventosMes,
    processosMes: procsCount.count ?? 0,
    publicacoesMes: 0,
    receitas12m,
    compromissos: comps.slice(0, 5),
  };
}

// ---- Estatísticas ----
export async function getEstatisticas() {
  const [procs, lanc, prz, clientesCount] = await Promise.all([
    listProcessos(), listLancamentos(), listPrazos(),
    db.from('pessoas').select('id', { count: 'exact', head: true }).eq('tipo', 'cliente'),
  ]);
  const porStatus = { ativo: 0, suspenso: 0, baixado: 0 } as Record<string, number>;
  procs.forEach((p) => { porStatus[p.status]++; });
  const receitas = lanc.filter((l) => l.tipo === 'receita').reduce((s, l) => s + l.valorCents, 0);
  const despesas = lanc.filter((l) => l.tipo === 'despesa').reduce((s, l) => s + l.valorCents, 0);
  return { porStatus, receitas, despesas, prazosAbertos: prz.filter((p) => !p.cumprido).length, totalProcessos: procs.length, totalClientes: clientesCount.count ?? 0 };
}

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}
