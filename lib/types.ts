// Tipos do domínio (espelham replica/schema.sql, simplificados p/ a camada fake).

export type StatusProcesso = 'ativo' | 'suspenso' | 'baixado';

export interface Pessoa {
  id: string;
  tipo: 'cliente' | 'adverso' | 'advogado_adverso' | 'contato';
  nome: string;
  documento?: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  uf?: string;
  nascimento?: string; // ISO date (p/ aniversariantes)
  portalLogin?: string;
  criadoEm: string;
}

export interface Processo {
  id: string;
  numero?: string;
  privado: boolean;
  status: StatusProcesso;
  classe?: string;
  natureza?: string;
  valorCausaCents?: number;
  dataAbertura?: string;
  clienteId?: string;
  clienteNome?: string;
  posicaoCliente?: string;
  criadoEm: string;
}

export interface Compromisso {
  id: string;
  titulo: string;
  inicioAt: string;
  responsavel?: string;
  processoNumero?: string;
}

export interface Prazo {
  id: string;
  descricao: string;
  data: string;
  processoNumero?: string;
  responsavel?: string;
  cumprido: boolean;
}

export interface Lancamento {
  id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valorCents: number;
  vencimento: string;
  situacao: 'aberto' | 'pago';
  conta: string;
  categoria?: string;
  recorrencia?: string;
}

export interface ModeloTexto {
  id: string;
  titulo: string;
  tipo?: string;
  conteudo: string;
  atualizadoEm: string;
}

export interface Pasta { id: string; nome: string; parentId?: string; }

export interface Arquivo {
  id: string;
  nome: string;
  pastaId?: string;
  tamanhoBytes: number;
  mime?: string;
  compartilhadoCliente: boolean;
  criadoEm: string;
}

export interface Atendimento {
  id: string;
  clienteNome: string;
  assunto: string;
  status: 'aguardando' | 'em_dia' | 'expirando' | 'expirado' | 'finalizado';
  criadoEm: string;
}

export interface Advogado {
  id: string;
  nome: string;
  oab?: string;
  oabUf?: string;
  email?: string;
  papel: 'owner' | 'admin' | 'membro';
  grupo?: string;
  ativo: boolean;
}

export type ColunaTarefa = 'afazer' | 'fazendo' | 'feito';
export interface Tarefa {
  id: string;
  titulo: string;
  coluna: ColunaTarefa;
  responsavel?: string;
  processoNumero?: string;
  prazo?: string;
}

export interface Andamento {
  id: string;
  processoNumero: string;
  data: string; // ISO date
  texto: string;
  origem: 'manual' | 'automatico';
}

export interface DashboardResumo {
  receitasMesCents: number;
  eventosMes: number;
  processosMes: number;
  publicacoesMes: number;
  receitas12m: { mes: string; valorCents: number }[];
  compromissos: Compromisso[];
}
