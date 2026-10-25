// Dados de exemplo (sintéticos). Em memória; trocados pelo Postgres no /replica-backend.
import type {
  Pessoa, Processo, Compromisso, Lancamento, Prazo, ModeloTexto, Pasta, Arquivo,
  Atendimento, Advogado, Tarefa, Andamento,
} from './types';

export const pessoasSeed: Pessoa[] = [
  { id: 'p1', tipo: 'cliente', nome: 'Construtora Horizonte Ltda', documento: '12.345.678/0001-90', email: 'contato@horizonte.exemplo', cidade: 'Belo Horizonte', uf: 'MG', nascimento: '1998-10-26', portalLogin: 'horizonte', criadoEm: '2026-09-02T12:00:00Z' },
  { id: 'p2', tipo: 'cliente', nome: 'Marina Alves de Souza', documento: '123.456.789-00', email: 'marina.alves@exemplo.com', cidade: 'São Paulo', uf: 'SP', nascimento: '1990-11-02', portalLogin: 'marina', criadoEm: '2026-09-18T12:00:00Z' },
  { id: 'p3', tipo: 'adverso', nome: 'Banco Província S.A.', documento: '98.765.432/0001-10', cidade: 'Rio de Janeiro', uf: 'RJ', criadoEm: '2026-09-20T12:00:00Z' },
];

export const processosSeed: Processo[] = [
  { id: 'proc1', numero: '0012345-67.2026.8.13.0024', privado: false, status: 'ativo', classe: 'Ação de cobrança', natureza: 'Cível', valorCausaCents: 4500000, dataAbertura: '2026-09-05', clienteId: 'p1', clienteNome: 'Construtora Horizonte Ltda', posicaoCliente: 'Autor', criadoEm: '2026-09-05T12:00:00Z' },
  { id: 'proc2', numero: '0098765-43.2026.8.26.0100', privado: true, status: 'suspenso', classe: 'Ação de indenização', natureza: 'Cível', valorCausaCents: 1200000, dataAbertura: '2026-09-22', clienteId: 'p2', clienteNome: 'Marina Alves de Souza', posicaoCliente: 'Requerente', criadoEm: '2026-09-22T12:00:00Z' },
];

export const compromissosSeed: Compromisso[] = [
  { id: 'c1', titulo: 'Audiência de conciliação', inicioAt: '2026-10-28T13:30:00Z', responsavel: 'Dra. Helena', processoNumero: '0012345-67.2026.8.13.0024' },
  { id: 'c2', titulo: 'Reunião com cliente', inicioAt: '2026-10-30T18:00:00Z', responsavel: 'Dr. Paulo' },
];

export const prazosSeed: Prazo[] = [
  { id: 'pz1', descricao: 'Contestação', data: '2026-11-03', processoNumero: '0012345-67.2026.8.13.0024', responsavel: 'Dra. Helena', cumprido: false },
  { id: 'pz2', descricao: 'Juntar documentos', data: '2026-10-27', processoNumero: '0098765-43.2026.8.26.0100', responsavel: 'Dr. Paulo', cumprido: false },
];

export const lancamentosSeed: Lancamento[] = [
  { id: 'l1', tipo: 'receita', descricao: 'Honorários — Horizonte', valorCents: 800000, vencimento: '2026-10-10', situacao: 'pago', conta: 'Conta Principal', categoria: 'Honorários' },
  { id: 'l2', tipo: 'despesa', descricao: 'Custas processuais', valorCents: 35000, vencimento: '2026-10-30', situacao: 'aberto', conta: 'Conta Principal', categoria: 'Custas' },
];

export const modelosSeed: ModeloTexto[] = [
  { id: 'm1', titulo: 'Contrato de honorários', tipo: 'Contrato', conteudo: 'CONTRATO DE HONORÁRIOS\n\nContratante: {{cliente.nome}}, inscrito(a) no documento {{cliente.documento}}...\n\nContratado: [escritório].\n\nObjeto: patrocínio da causa {{processo.numero}}.', atualizadoEm: '2026-09-10T12:00:00Z' },
  { id: 'm2', titulo: 'Procuração ad judicia', tipo: 'Procuração', conteudo: 'Outorgante: {{cliente.nome}}.\nOutorgado: [advogado], OAB...\nPoderes: o foro em geral, para o processo {{processo.numero}}.', atualizadoEm: '2026-09-12T12:00:00Z' },
];

export const pastasSeed: Pasta[] = [
  { id: 'f1', nome: 'Contratos' },
  { id: 'f2', nome: 'Petições' },
];

export const arquivosSeed: Arquivo[] = [
  { id: 'a1', nome: 'contrato-horizonte.pdf', pastaId: 'f1', tamanhoBytes: 184320, mime: 'application/pdf', compartilhadoCliente: true, criadoEm: '2026-09-11T12:00:00Z' },
  { id: 'a2', nome: 'peticao-inicial.docx', pastaId: 'f2', tamanhoBytes: 48230, mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', compartilhadoCliente: false, criadoEm: '2026-09-23T12:00:00Z' },
];

export const atendimentosSeed: Atendimento[] = [
  { id: 'at1', clienteNome: 'Construtora Horizonte Ltda', assunto: 'Dúvida sobre audiência', status: 'em_dia', criadoEm: '2026-10-20T12:00:00Z' },
  { id: 'at2', clienteNome: 'Marina Alves de Souza', assunto: 'Envio de documentos', status: 'aguardando', criadoEm: '2026-10-23T12:00:00Z' },
];

export const advogadosSeed: Advogado[] = [
  { id: 'adv1', nome: 'Dra. Helena Prado', oab: '123456', oabUf: 'MG', email: 'helena@escritorio.exemplo', papel: 'owner', grupo: 'Cível', ativo: true },
  { id: 'adv2', nome: 'Dr. Paulo Nunes', oab: '654321', oabUf: 'SP', email: 'paulo@escritorio.exemplo', papel: 'membro', grupo: 'Cível', ativo: true },
];

export const tarefasSeed: Tarefa[] = [
  { id: 't1', titulo: 'Protocolar contestação', coluna: 'afazer', responsavel: 'Dra. Helena', processoNumero: '0012345-67.2026.8.13.0024', prazo: '2026-11-03' },
  { id: 't2', titulo: 'Reunir documentos do cliente', coluna: 'fazendo', responsavel: 'Dr. Paulo' },
  { id: 't3', titulo: 'Enviar procuração para assinatura', coluna: 'feito', responsavel: 'Dra. Helena' },
];

export const andamentosSeed: Andamento[] = [
  { id: 'an1', processoNumero: '0012345-67.2026.8.13.0024', data: '2026-10-15', texto: 'Juntada de petição inicial.', origem: 'manual' },
  { id: 'an2', processoNumero: '0012345-67.2026.8.13.0024', data: '2026-10-22', texto: 'Designada audiência de conciliação.', origem: 'manual' },
];
