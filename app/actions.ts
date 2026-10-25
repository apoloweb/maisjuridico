'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  createProcesso, createPessoa, createCompromisso, createPrazo,
  createLancamento, createModelo, createPasta, createArquivo,
  createAdvogado, createTarefa, moverTarefa, createAtendimento, createAndamento,
} from '@/lib/data';
import type { StatusProcesso, ColunaTarefa, Atendimento } from '@/lib/types';

const s = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();

export async function createProcessoAction(formData: FormData) {
  await createProcesso({
    numero: s(formData, 'numero') || undefined,
    privado: formData.get('privado') === 'on',
    status: (s(formData, 'status') || 'ativo') as StatusProcesso,
    classe: s(formData, 'classe') || undefined,
    natureza: s(formData, 'natureza') || undefined,
    clienteNome: s(formData, 'clienteNome') || undefined,
    posicaoCliente: s(formData, 'posicaoCliente') || undefined,
    valorCausaCents: formData.get('valorCausa') ? Math.round(Number(formData.get('valorCausa')) * 100) : undefined,
    dataAbertura: s(formData, 'dataAbertura') || undefined,
  });
  revalidatePath('/processos'); redirect('/processos');
}

export async function createPessoaAction(formData: FormData) {
  await createPessoa({
    tipo: 'cliente', nome: s(formData, 'nome'),
    documento: s(formData, 'documento') || undefined,
    email: s(formData, 'email') || undefined,
    telefone: s(formData, 'telefone') || undefined,
    cidade: s(formData, 'cidade') || undefined,
    uf: s(formData, 'uf') || undefined,
    portalLogin: s(formData, 'portalLogin') || undefined,
  });
  revalidatePath('/pessoas'); redirect('/pessoas');
}

export async function createCompromissoAction(formData: FormData) {
  await createCompromisso({
    titulo: s(formData, 'titulo'),
    inicioAt: new Date(s(formData, 'inicioAt')).toISOString(),
    responsavel: s(formData, 'responsavel') || undefined,
    processoNumero: s(formData, 'processoNumero') || undefined,
  });
  revalidatePath('/agenda'); redirect('/agenda');
}

export async function createPrazoAction(formData: FormData) {
  await createPrazo({
    descricao: s(formData, 'descricao'), data: s(formData, 'data'),
    processoNumero: s(formData, 'processoNumero') || undefined,
    responsavel: s(formData, 'responsavel') || undefined, cumprido: false,
  });
  revalidatePath('/agenda'); redirect('/agenda');
}

export async function createLancamentoAction(formData: FormData) {
  await createLancamento({
    tipo: (s(formData, 'tipo') || 'despesa') as 'receita' | 'despesa',
    descricao: s(formData, 'descricao'),
    valorCents: Math.round(Number(formData.get('valor') || 0) * 100),
    vencimento: s(formData, 'vencimento'),
    situacao: (s(formData, 'situacao') || 'aberto') as 'aberto' | 'pago',
    conta: s(formData, 'conta') || 'Conta Principal',
    categoria: s(formData, 'categoria') || undefined,
    recorrencia: s(formData, 'recorrencia') || undefined,
  });
  revalidatePath('/financeiro'); redirect('/financeiro');
}

export async function createModeloAction(formData: FormData) {
  await createModelo({ titulo: s(formData, 'titulo'), tipo: s(formData, 'tipo') || undefined, conteudo: String(formData.get('conteudo') ?? '') });
  revalidatePath('/editor'); redirect('/editor');
}

export async function createPastaAction(formData: FormData) {
  const nome = s(formData, 'nome'); if (nome) await createPasta(nome);
  revalidatePath('/arquivos'); redirect('/arquivos');
}

export async function uploadArquivoAction(formData: FormData) {
  await createArquivo({
    nome: s(formData, 'nome') || 'novo-arquivo.pdf',
    pastaId: s(formData, 'pastaId') || undefined,
    tamanhoBytes: Math.round(Number(formData.get('tamanhoKb') || 50)) * 1024,
    compartilhadoCliente: formData.get('compartilhar') === 'on',
  });
  revalidatePath('/arquivos'); redirect('/arquivos');
}

export async function createAdvogadoAction(formData: FormData) {
  await createAdvogado({
    nome: s(formData, 'nome'),
    oab: s(formData, 'oab') || undefined,
    oabUf: s(formData, 'oabUf') || undefined,
    email: s(formData, 'email') || undefined,
    papel: (s(formData, 'papel') || 'membro') as 'owner' | 'admin' | 'membro',
    grupo: s(formData, 'grupo') || undefined,
    ativo: true,
  });
  revalidatePath('/equipe'); redirect('/equipe');
}

export async function createTarefaAction(formData: FormData) {
  await createTarefa({
    titulo: s(formData, 'titulo'),
    coluna: (s(formData, 'coluna') || 'afazer') as ColunaTarefa,
    responsavel: s(formData, 'responsavel') || undefined,
    processoNumero: s(formData, 'processoNumero') || undefined,
    prazo: s(formData, 'prazo') || undefined,
  });
  revalidatePath('/workflow'); redirect('/workflow');
}

export async function moverTarefaAction(formData: FormData) {
  await moverTarefa(s(formData, 'id'), s(formData, 'coluna') as ColunaTarefa);
  revalidatePath('/workflow');
}

export async function createAtendimentoAction(formData: FormData) {
  await createAtendimento({
    clienteNome: s(formData, 'clienteNome'),
    assunto: s(formData, 'assunto'),
    status: (s(formData, 'status') || 'aguardando') as Atendimento['status'],
  });
  revalidatePath('/sac'); redirect('/sac');
}

export async function createAndamentoAction(formData: FormData) {
  await createAndamento({
    processoNumero: s(formData, 'processoNumero'),
    data: s(formData, 'data'),
    texto: String(formData.get('texto') ?? ''),
    origem: 'manual',
  });
  revalidatePath('/andamentos'); redirect('/andamentos');
}
