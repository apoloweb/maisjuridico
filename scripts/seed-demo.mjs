// Popula o Supabase com dados sintéticos realistas (demo). Uso:
//   set -a; . ./.env.local; set +a; node scripts/seed-demo.mjs
// Limpa as tabelas de demo e insere um conjunto cheio para o app não parecer vazio.
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }
const db = createClient(url, key, { auth: { persistSession: false } });

const ALL = '00000000-0000-0000-0000-000000000000';
const ins = async (t, rows) => { const { error } = await db.from(t).insert(rows); if (error) { console.error(t, error.message); process.exit(1); } console.log(`+ ${rows.length} ${t}`); };
const d = (y, m, day) => `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
const cents = (reais) => Math.round(reais * 100);

const HOJE = new Date();
const Y = HOJE.getFullYear();
const M = HOJE.getMonth() + 1;

// ---- limpar (ordem: filhos primeiro) ----
for (const t of ['andamentos','tarefas','prazos','compromissos','atendimentos','arquivos','lancamentos','modelos_texto','advogados','pastas','processos','pessoas']) {
  const { error } = await db.from(t).delete().neq('id', ALL);
  if (error) console.error('del', t, error.message);
}
console.log('tabelas limpas');

// ---- pessoas ----
const clientesNomes = [
  ['Construtora Horizonte Ltda','12.345.678/0001-90','Belo Horizonte','MG'],
  ['Marina Alves de Souza','123.456.789-00','São Paulo','SP'],
  ['Transportes Aurora S.A.','11.222.333/0001-44','Curitiba','PR'],
  ['João Pedro Marques','222.333.444-55','Fortaleza','CE'],
  ['Padaria Pão Nosso ME','33.444.555/0001-66','Salvador','BA'],
  ['Cláudia Ribeiro Antunes','444.555.666-77','Porto Alegre','RS'],
  ['Clínica Vida Plena Ltda','55.666.777/0001-88','Recife','PE'],
  ['Rafael Teixeira Lima','666.777.888-99','Goiânia','GO'],
  ['Mercado Bom Preço Ltda','77.888.999/0001-11','Manaus','AM'],
  ['Fernanda Costa Pereira','888.999.000-22','Florianópolis','SC'],
  ['AutoPeças Veloz Ltda','99.000.111/0001-33','Campinas','SP'],
  ['Luiz Henrique Barbosa','000.111.222-33','Natal','RN'],
];
const clientes = clientesNomes.map(([nome, documento, cidade, uf], i) => ({
  tipo: 'cliente', nome, documento, cidade, uf,
  email: nome.toLowerCase().replace(/[^a-z]+/g, '.').slice(0, 20) + '@exemplo.com',
  nascimento: i % 2 === 0 ? d(1985 + i, ((i * 3) % 12) + 1, ((i * 5) % 27) + 1) : null,
  portal_login: i < 4 ? nome.split(' ')[0].toLowerCase() : null,
}));
const adversos = [
  { tipo: 'adverso', nome: 'Banco Província S.A.', documento: '98.765.432/0001-10', cidade: 'Rio de Janeiro', uf: 'RJ' },
  { tipo: 'adverso', nome: 'Seguradora Atlântico S.A.', documento: '87.654.321/0001-20', cidade: 'São Paulo', uf: 'SP' },
  { tipo: 'adverso', nome: 'Município de Contagem', documento: '76.543.210/0001-30', cidade: 'Contagem', uf: 'MG' },
];
await ins('pessoas', [...clientes, ...adversos]);

// ---- advogados ----
await ins('advogados', [
  { nome: 'Dra. Helena Prado', oab: '123456', oab_uf: 'MG', email: 'helena@escritorio.exemplo', papel: 'owner', grupo: 'Cível', ativo: true },
  { nome: 'Dr. Paulo Nunes', oab: '654321', oab_uf: 'SP', email: 'paulo@escritorio.exemplo', papel: 'admin', grupo: 'Trabalhista', ativo: true },
  { nome: 'Dra. Camila Rocha', oab: '334455', oab_uf: 'PR', email: 'camila@escritorio.exemplo', papel: 'membro', grupo: 'Cível', ativo: true },
  { nome: 'Dr. André Martins', oab: '556677', oab_uf: 'BA', email: 'andre@escritorio.exemplo', papel: 'membro', grupo: 'Família', ativo: true },
]);
const advs = ['Dra. Helena Prado','Dr. Paulo Nunes','Dra. Camila Rocha','Dr. André Martins'];

// ---- processos ----
const classes = ['Ação de cobrança','Ação de indenização','Ação de despejo','Execução de alimentos','Ação trabalhista','Divórcio','Ação revisional','Mandado de segurança'];
const naturezas = ['Cível','Trabalhista','Família','Criminal'];
const status = ['ativo','ativo','ativo','suspenso','baixado'];
const processos = [];
for (let i = 0; i < 14; i++) {
  const cli = clientesNomes[i % clientesNomes.length][0];
  processos.push({
    numero: `00${String(10000 + i * 137).padStart(5, '0')}-${String(10 + i).padStart(2, '0')}.2026.8.${['13','26','16','05','08'][i % 5]}.0${String(100 + i).padStart(3, '0')}`,
    privado: i % 5 === 0,
    status: status[i % status.length],
    classe: classes[i % classes.length],
    natureza: naturezas[i % naturezas.length],
    valor_causa_cents: cents(5000 + i * 3700 + (i % 3) * 12000),
    data_abertura: d(2026, ((i % 9) + 1), ((i * 2) % 27) + 1),
    cliente_nome: cli,
    posicao_cliente: i % 2 ? 'Autor' : 'Requerente',
  });
}
await ins('processos', processos);
const numeros = processos.map((p) => p.numero);

// ---- lançamentos (12 meses: receitas + despesas) para encher o gráfico ----
const lanc = [];
for (let k = 11; k >= 0; k--) {
  const dt = new Date(Y, (M - 1) - k, 1);
  const yy = dt.getFullYear(), mm = dt.getMonth() + 1;
  lanc.push({ tipo: 'receita', descricao: `Honorários contratuais ${mm}/${yy}`, valor_cents: cents(2500 + ((k * 731) % 6000)), vencimento: d(yy, mm, 10), situacao: k === 0 ? 'aberto' : 'pago', conta: 'Conta Principal', categoria: 'Honorários' });
  if (k % 2 === 0) lanc.push({ tipo: 'receita', descricao: `Honorários de êxito ${mm}/${yy}`, valor_cents: cents(1800 + ((k * 433) % 4000)), vencimento: d(yy, mm, 20), situacao: k === 0 ? 'aberto' : 'pago', conta: 'Conta Principal', categoria: 'Êxito' });
  lanc.push({ tipo: 'despesa', descricao: `Custas e despesas ${mm}/${yy}`, valor_cents: cents(300 + ((k * 211) % 900)), vencimento: d(yy, mm, 28), situacao: k === 0 ? 'aberto' : 'pago', conta: 'Conta Principal', categoria: 'Custas' });
}
await ins('lancamentos', lanc);

// ---- compromissos (próximos dias) ----
const comps = [];
const titulosC = ['Audiência de conciliação','Audiência de instrução','Reunião com cliente','Perícia','Sustentação oral','Reunião de alinhamento','Assinatura de acordo','Reunião com perito'];
for (let i = 0; i < 8; i++) {
  const dt = new Date(Y, M - 1, HOJE.getDate() + i + 1, 9 + (i % 8), 0, 0);
  comps.push({ titulo: titulosC[i], inicio_at: dt.toISOString(), responsavel: advs[i % advs.length], processo_numero: i % 2 ? numeros[i % numeros.length] : null });
}
await ins('compromissos', comps);

// ---- prazos ----
const prazos = [];
const titulosP = ['Contestação','Réplica','Razões finais','Recurso de apelação','Contrarrazões','Embargos de declaração','Cumprimento de sentença','Juntar procuração'];
for (let i = 0; i < 8; i++) {
  const dt = new Date(Y, M - 1, HOJE.getDate() + (i - 2) * 2);
  prazos.push({ descricao: titulosP[i], data: d(dt.getFullYear(), dt.getMonth() + 1, dt.getDate()), processo_numero: numeros[i % numeros.length], responsavel: advs[i % advs.length], cumprido: i < 2 });
}
await ins('prazos', prazos);

// ---- tarefas (kanban) ----
const colunas = ['afazer','afazer','fazendo','fazendo','feito','afazer','fazendo'];
const titulosT = ['Protocolar contestação','Reunir documentos','Elaborar petição inicial','Calcular liquidação','Enviar procuração','Agendar perícia','Revisar contrato'];
await ins('tarefas', titulosT.map((t, i) => ({ titulo: t, coluna: colunas[i], responsavel: advs[i % advs.length], processo_numero: i % 2 ? numeros[i % numeros.length] : null, prazo: i % 3 === 0 ? prazos[i % prazos.length].data : null })));

// ---- andamentos ----
const textosA = ['Juntada de petição inicial.','Designada audiência de conciliação.','Decisão interlocutória proferida.','Juntada de contestação.','Despacho: manifestem-se as partes.','Sentença publicada.','Interposto recurso de apelação.','Conclusos para decisão.','Expedido mandado de citação.','Audiência redesignada.','Juntada de laudo pericial.','Trânsito em julgado.'];
const andamentos = [];
for (let i = 0; i < 12; i++) {
  const dt = new Date(Y, M - 1, HOJE.getDate() - i * 3);
  andamentos.push({ processo_numero: numeros[i % numeros.length], data: d(dt.getFullYear(), dt.getMonth() + 1, dt.getDate()), texto: textosA[i], origem: 'manual' });
}
await ins('andamentos', andamentos);

// ---- atendimentos (SAC) ----
const sts = ['em_dia','aguardando','expirando','em_dia','finalizado','expirado'];
const ass = ['Dúvida sobre audiência','Envio de documentos','Solicitação de cópia','Atualização do processo','Pedido de reunião','Reclamação de prazo'];
await ins('atendimentos', ass.map((a, i) => ({ cliente_nome: clientesNomes[i][0], assunto: a, status: sts[i] })));

// ---- pastas + arquivos ----
await ins('pastas', [{ nome: 'Contratos' }, { nome: 'Petições' }, { nome: 'Procurações' }, { nome: 'Documentos pessoais' }]);
const { data: pastasRows } = await db.from('pastas').select('id,nome');
const pid = (nome) => (pastasRows.find((p) => p.nome === nome) || {}).id;
await ins('arquivos', [
  { nome: 'contrato-horizonte.pdf', pasta_id: pid('Contratos'), tamanho_bytes: 184320, mime: 'application/pdf', compartilhado_cliente: true },
  { nome: 'peticao-inicial.docx', pasta_id: pid('Petições'), tamanho_bytes: 48230, compartilhado_cliente: false },
  { nome: 'procuracao-marina.pdf', pasta_id: pid('Procurações'), tamanho_bytes: 92100, mime: 'application/pdf', compartilhado_cliente: true },
  { nome: 'rg-cpf-joao.pdf', pasta_id: pid('Documentos pessoais'), tamanho_bytes: 150000, mime: 'application/pdf', compartilhado_cliente: false },
  { nome: 'laudo-pericial.pdf', pasta_id: pid('Petições'), tamanho_bytes: 310500, mime: 'application/pdf', compartilhado_cliente: false },
  { nome: 'acordo-aurora.pdf', pasta_id: pid('Contratos'), tamanho_bytes: 210400, mime: 'application/pdf', compartilhado_cliente: true },
]);

// ---- modelos de texto ----
await ins('modelos_texto', [
  { titulo: 'Contrato de honorários', tipo: 'Contrato', conteudo: 'CONTRATO DE HONORÁRIOS\n\nContratante: {{cliente.nome}} ({{cliente.documento}}).\nObjeto: patrocínio da causa {{processo.numero}}.' },
  { titulo: 'Procuração ad judicia', tipo: 'Procuração', conteudo: 'Outorgante: {{cliente.nome}}.\nPoderes: o foro em geral, para o processo {{processo.numero}}.' },
  { titulo: 'Recibo de pagamento', tipo: 'Recibo', conteudo: 'Recebi de {{cliente.nome}} a importância referente a honorários.' },
  { titulo: 'Notificação extrajudicial', tipo: 'Outro', conteudo: 'Prezado(a) {{cliente.nome}}, notificamos para os fins de direito...' },
]);

console.log('\n✓ Banco populado com dados de demonstração.');
