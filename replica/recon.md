# Recon map: MaisJurídico (web)

Scope: núcleo de gestão de escritório de advocacia — processos, pessoas/clientes, agenda/prazos, financeiro, documentos, tarefas (workflow), relatórios e portal do cliente; mais os diferenciais de captura (Diário Oficial e Andamentos automáticos).
For: produto próprio do usuário, para indicar/oferecer aos seus clientes (advogados e escritórios).
Date: 2026-10-25

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | landing / marketing | https://www.maisjuridico.com.br/ | lista de ferramentas, números, depoimentos |
| 2 | planos / pricing | https://www.maisjuridico.com.br/planos.php | 5 planos, gating de features por plano |
| 3 | FAQ | landing (seção FAQ) | assinatura, importação (OAB / lote), pagamento |
| 4 | tela de login | https://www.maisjuridico.com.br/login.php | S01 |
| 5 | conta do usuário (logado) | /cp/*.php, /workflow/, /ged/ | fonte principal das telas internas (conta nova, estados vazios) |
| 6 | portal do cliente | https://areadocliente.maisjuridico.com.br | subdomínio separado (acesso do cliente final) — não explorado logado |

Screenshots de referência: `replica/screens/` (18 imagens; **nunca entram no clone**).

## Core loop

Advogado cadastra processos e clientes, recebe automaticamente publicações dos diários oficiais e andamentos dos tribunais (por nome/OAB e por nº CNJ), organiza compromissos e prazos na agenda, controla o financeiro e gera documentos — tudo numa plataforma só, com portal de acesso para os clientes do escritório acompanharem seus processos.

## Stack inferida (do original)

- **Monólito PHP + MySQL (mysqli)**, server-rendered: uma página `.php` por tela, tudo sob `/cp/` (control panel), módulos à parte em `/workflow/` e `/ged/`.
- Shim `fu_mysql2mysqli.php` (migração do `mysql_` legado) — codebase antigo (plataforma online "desde 2000", antes "Debit").
- Infra citada: AWS + Cloudflare.
- Evidência: erro PHP exibido em tela em `/cp/estatistica_lista.php` (`mysqli_num_rows()... fu_mysql2mysqli.php`).
- **Implicação para o clone:** reconstruir em stack moderno (ex.: Laravel ou Node/NestJS + Postgres + React) — o blueprint é de funcionalidade/UX, não do código.

## Planos e gating (fonte: pricing)

| recurso | Grátis (1 ano) | Individual R$57 | Micro R$117 | Online R$213 | Premium R$499 |
| --- | --- | --- | --- | --- | --- |
| Gestão de clientes / agenda / financeiro / editor / relatórios / suporte / acesso p/ clientes | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cadastro de processos | 50 | 130 | 500 | Ilimitado | Ilimitado |
| Armazenamento de arquivos | 100 MB | 300 MB | 1 GB | 5 GB | 30 GB |
| Publicações Diários Oficiais | — | 1 OAB | 3 OABs | 6 OABs | 21 OABs |
| Usuários adicionais (equipe) | — | — | 2 | 5 | 20 |
| Site + domínio | — | — | — | ✓ | ✓ |
| Caixas de e-mail com domínio | — | — | — | 5 | 15 |
| Importação inicial via OAB (beta) | — | 1 OAB | 1 OAB | 2 OABs | 3 OABs |

Pagamento: cartão (liberação imediata) ou boleto (1 dia útil). Sem fidelização.
**Gating observado:** no plano Grátis, abrir **Diário Oficial** (`/cp/do_lista.php`) **redireciona para `/planos.php`** (estado "recurso bloqueado / faça upgrade"). Andamentos automáticos é **pacote pago avulso** ("Adquirir andamentos").

## Screens

Topo (todas as telas): barra com ícones (novidades/megafone, balança, e-mail, **engrenagem=Configurações**, ajuda), links Atendimento, Planos, e menu do usuário (e-mail). Sidebar esquerda "FERRAMENTAS".

| ID | screen | route | purpose | key components | states |
| --- | --- | --- | --- | --- | --- |
| S01 | Login | /login.php | autenticar | login, senha, esqueci senha, SOU NOVO USUÁRIO | filled |
| S02 | Dashboard | /cp/dashboard.php | visão geral | banner upsell, busca por nº processo, cards (receitas, eventos, processos, publicações), gráfico receitas 12m, cards Compromissos/Tarefas/Prazos | empty |
| S03 | Processos (lista) | /cp/processo_lista.php | listar/filtrar processos | filtros (status ativo/suspenso/baixado, cliente, busca), ações Lixeira, Últimos andamentos, Importar lote, Importar via OAB, Adicionar | empty |
| S03a | Processo (add/edit) | /cp/processo_add10.php | cadastrar processo | ver modelo de dados; partes (cliente+adverso c/ posição), advogados/equipe | form |
| S04 | Clientes | /cp/cliente_lista.php | gestão de clientes | busca, importar lote, adicionar | empty |
| S04a | Cliente (add) | /cp/cliente_add10.php | cadastrar cliente | dados pessoais, múltiplos e-mails/telefones/endereços, anexos, **dados de acesso ao portal** | form |
| S04b | Adversos | /cp/ (submenu Pessoas) | parte contrária | — | — |
| S04c | Advogados Adversos | submenu Pessoas | advogados da outra parte | — | — |
| S04d | Contatos / Partes | submenu Pessoas | contatos genéricos | — | — |
| S05 | Equipe / Advogados | /cp/advogado_lista.php | usuários do escritório | contadores (usuários permitidos/em uso), add; submenu Grupo de advogados | empty |
| S06 | Agenda | /cp/compromisso_aba2.php | calendário | Mês/Semana/Dia, Modo lista, filtro por advogado, Adicionar; submenu Compromissos / Prazos | empty |
| S07 | Financeiro | /cp/fin_values.php | fluxo de caixa | saldo por conta, filtros (mês/conta/situação/cliente), Transferência entre contas, Adicionar; submenu Despesas/Receitas/Transferências/Vencimentos/Gráficos | empty |
| S07a | Lançamento (add) | /cp/mov_cad10.php?referencia=d\|r | despesa/receita | fornecedor/cliente, conta, vencimento, valor, categoria+subcat, situação, juros/multa, **recorrência**, anexos | form |
| S08 | SAC | /cp/atendimento_lista.php | atendimento a clientes | status (em dia/expirando/expirado/finalizado), filtros; submenu Atendimentos / Envio de SMS / Aniversariantes | empty |
| S09 | Relatórios | /cp/relatorio_resumo.php | relatórios filtráveis | filtros (processo, cliente, advogado, partes, datas, classe, natureza); submenu Resumo/Processos/Financeiro/Custas/Honorários/Compromissos/Tarefas/Prazos | empty |
| S10 | Estatísticas | /cp/estatistica_lista.php | indicadores/gráficos | submenu Andamentos atrasados/dos processos/Últimos/Automáticos/Clientes/Processos | empty (c/ erro PHP) |
| S11 | Diário Oficial | /cp/do_lista.php | publicações por nome/OAB | **gated** → redireciona p/ /planos.php no grátis | permission denied |
| S12 | Andamentos automáticos | /cp/andamentos_configuracao.php | captura de movimentações CNJ | aviso de não-garantia, "Adquirir pacote", config de monitoramento por instância | upsell |
| S13 | Arquivos (GED) | /ged/index.php | nuvem de documentos | árvore de pastas, upload, compartilhar, cota (Utilizado %); submenu Meus arquivos/Enviar/Relatórios | empty |
| S14 | Site | /cp/siteadv_config.php | construtor de site do escritório | páginas, Banco de imagens, Ver meu site; aviso de descontinuação (v2) | empty |
| S15 | Editor de texto | /cp/texto_lista.php | modelos de documentos | "Meus textos", Criar texto (contratos/recibos/procurações) | empty |
| S16 | Workflow | /workflow/ | tarefas (kanban) | quadros, colunas, tarefas, filtro por responsável, Modo lista | empty |
| S17 | Configurações | engrenagem (topo) | ajustes do sistema | Jurídico (listas: classes, fases, fóruns, comarcas, varas, natureza, ritos, posições, **campos personalizados**), Financeiro (categorias, contas, exportar excel), SAC (categorias), Outros (Histórico de atividades/acessos, **Google Agenda**) | menu |

## Flows

```
F01 Cadastrar processo (núcleo)
    S03 lista -> "Adicionar" -> S03a form (dados + partes + advogados) -> salvar -> S03 lista
    edge: cliente ainda não cadastrado (criar na hora), adverso + advogado adverso, listas vazias

F02 Cadastrar cliente e dar acesso ao portal
    S04 -> "Adicionar" -> S04a (dados + contatos + endereços) -> "Dados para acesso" (login/senha) -> "Enviar dados por e-mail" -> salvar
    resultado: cliente acessa areadocliente.maisjuridico.com.br

F03 Receber publicação dos diários (diferencial)
    Configurar monitoramento (nome + OAB) -> sistema captura publicações -> aparece em S11 -> vincular ao processo
    gated: indisponível no grátis (-> /planos.php)

F04 Receber andamento automático (diferencial)
    S12 -> adquirir pacote -> editar processo -> "Configuração do monitoramento" (instância) -> captura CNJ nos sites dos tribunais -> novos andamentos no processo
    aviso: sem integração oficial, sem garantia

F05 Lançar financeiro
    S07 -> "Adicionar" -> S07a (conta, categoria, valor, vencimento, situação, recorrência) -> salvar -> saldo atualiza

F06 Criar compromisso / prazo
    S06 -> "Adicionar" -> definir data/hora, advogado responsável, alertas (e-mail/SMS) -> aparece na agenda e no dashboard

F07 Gerar documento a partir de modelo
    S15 -> "Criar texto" -> escolher/preencher modelo (mala-direta c/ dados do processo/cliente) -> salvar/exportar
```

(Contagem de cliques do happy path a confirmar com dados reais na conta.)

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Sidebar FERRAMENTAS | itens simples / com submenu expansível | ativo, hover, expandido | todas |
| Top bar | ícones (novidades, balança, e-mail, config, ajuda) + user menu | — | todas |
| Botão | primário (verde Adicionar), secundário (cinza), link | default, hover, disabled | todas |
| Página de lista | cabeçalho + ações + filtros + tabela/empty | empty ("Você ainda não cadastrou..."), com dados | S03,S04,S05,S08,S15 |
| Barra de filtros | selects + inputs + Buscar | — | listas |
| Formulário add/edit | seções, selects com "Adicionar" inline (lookup), repetíveis (e-mails/telefones/endereços) | vazio, validação | S03a,S04a,S07a |
| Card de métrica | ícone + número + label | zero/empty | S02 |
| Gráfico | barras (receitas 12m), estatísticas | vazio | S02,S07,S10 |
| Calendário | Mês/Semana/Dia + lista | vazio | S06 |
| Kanban | quadro > coluna > tarefa | vazio | S16 |
| Gerenciador de arquivos | árvore + grid/lista + toolbar | pasta vazia | S13 |
| Banner upsell | alerta + CTA assinar/planos | — | S02, gated |
| Mega-menu Configurações | 4 colunas (Jurídico/Financeiro/SAC/Outros) | — | S17 |

## Inferred data model

```
Escritorio/Conta  plano, limites (processos, storage, usuarios, OABs), status
Usuario/Advogado  nome, OAB, estado_oab, email, telefones, login/senha, grupo
                  evidence: S05, cliente form (advogado), config
                  confidence: high
GrupoAdvogados    nome, membros                                   confidence: medium

Cliente/Pessoa    nome, cpf|cnpj, sexo, nascimento, rg, pis, ctps, serie,
                  estado_civil, nacionalidade, profissao, nome_mae, observacao,
                  emails[], telefones[{tipo,ddi,ddd,num,ramal,setor,contato}],
                  enderecos[{cep,rua,num,compl,bairro,cidade,uf}], anexos[],
                  acesso_portal{login, senha}
                  evidence: S04a
                  confidence: high
Adverso           (parte contrária, campos similares a Pessoa)   confidence: high
AdvogadoAdverso   nome, OAB...                                    confidence: medium
Contato/Parte     contato genérico                                confidence: medium

Processo          numero(CNJ), privado(bool), status(ativo|suspenso|baixado),
                  fase*, classe*, natureza*, rito*, data_abertura, valor_causa,
                  pasta, controle, forum*, comarca*, vara*, observacoes
                  (* = lookups customizáveis em Configurações)
                  evidence: S03a, S17
                  confidence: high
ParteDoProcesso   processo, pessoa|adverso, posicao(Autor|Réu|Requerente|...)  confidence: high
Processo_Advogado processo n-n advogado                           confidence: high
Andamento         processo, data, texto, origem(manual|automatico), instancia
                  evidence: S12, estatísticas, dashboard              confidence: high
Publicacao        oab/nome_monitorado, diario, data, texto, processo_vinculado?
                  evidence: S11, pricing                              confidence: medium
Compromisso       data, hora, tipo, advogado, processo?, alertas(email/sms)  confidence: high
Prazo             processo, data, descricao, cumprido              confidence: high
Tarefa(Workflow)  quadro, coluna, titulo, responsavel, prazo       confidence: high
ContaBancaria     nome, saldo                                      confidence: high
Lancamento        tipo(receita|despesa), conta, fornecedor|cliente, categoria*,
                  subcategoria*, vencimento, valor, juros, multa, total,
                  situacao(a pagar/pago), recorrencia{periodo}, anexos[]
                  evidence: S07a                                     confidence: high
Honorario/Custa   (relatórios dedicados) vínculo processo/financeiro  confidence: medium
Atendimento(SAC)  cliente, status(em dia|expirando|expirado|finalizado), texto  confidence: high
Documento(Texto)  modelo, conteudo, variaveis de mala-direta       confidence: medium
Arquivo(GED)      pasta, nome, tamanho, compartilhamento           confidence: high
CampoPersonalizado  entidade-alvo, label, tipo                     confidence: medium
LogAtividade/Acesso usuario, acao, data                            confidence: high
```

Relationships: Escritório 1-n Usuário/Cliente/Processo; Processo n-n Advogado; Processo 1-n Parte, Andamento, Prazo, Compromisso; Conta 1-n Lançamento; Cliente 1-n Atendimento; Pasta 1-n Arquivo; Quadro 1-n Tarefa. Diversas tabelas de lookup customizáveis.

## Feature matrix

See `features.csv`. must: ~15, should: ~9, could: ~5, skip: ~4.

## Out of scope (cannot or should not be cloned)

- **Captura de Diário Oficial e Andamentos automáticos**: dependem de robôs/raspagem dos sites dos tribunais e diários (sem integração oficial — o próprio sistema avisa que não garante). Replicável só construindo/contratando fonte de dados própria (ex.: APIs como Escavador/Judit/Codilo/DataJud-CNJ). Hard part #1.
- **Portal do cliente** (areadocliente) — não é "impossível", mas é um 2º app/perfil de acesso; peso de projeto. Hard part #2.
- Base de +22 mil advogados e histórico (dados que o app possui).
- **Site + domínio + caixas de e-mail**: dependem de registro/hospedagem de domínio e provedor de e-mail (integração de terceiros). Original até está descontinuando.
- Importação via OAB (mesma dependência da fonte dos tribunais).

## Size

Telas: ~17 áreas principais (muitas com submenus → ~40+ telas reais). Entidades: ~22. Fluxos núcleo: 7.
Partes difíceis: (1) captura de publicações/andamentos nos tribunais; (2) portal do cliente; (3) agenda com alertas e-mail/SMS + sync Google Agenda; (4) editor de documentos com mala-direta; (5) financeiro com recorrência.
**Tamanho: L** (um trimestre+) para o núcleo bem feito; **XL** se incluir os diferenciais de captura com fonte de dados própria. Recomendação: MVP = Processos + Pessoas + Agenda/Prazos + Financeiro + Documentos + Portal do cliente; captura de tribunais via API de terceiros numa 2ª fase.

Próximo passo: `/replica-architect`.
