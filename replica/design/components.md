# Componentes: clone MaisJurídico

Base: `replica/recon.md` (lista de componentes) + telas em `replica/screens/`.
Tokens: `tokens.json` / `tokens.css` / `tailwind.config.js`.
Regra: todo estado que o recon viu + os que deveria ter (focus, disabled, loading, error, empty).
Base acessível sugerida: **shadcn/ui + Radix** (ou React Aria). Construir em `/design` (ou Storybook) antes de qualquer tela.

---

## AppShell (layout)
```
estrutura  Sidebar (240px, fixa) + Header (56px) + <main> (max 1200px)
tokens     sidebar bg sidebar, header bg bg + border-b border
responsivo sidebar vira off-canvas < 1024px (botão hambúrguer no header)
a11y       landmarks <nav><header><main>; skip-link "pular para conteúdo"
usado em   todas as telas logadas
```

## Sidebar / Nav
```
itens      simples ou com submenu expansível (Pessoas, Equipe, Agenda, Financeiro, SAC, Relatórios, Estatísticas, Diário Oficial, Andamentos, Arquivos, Site, Editor)
variants   item, item-com-submenu, subitem
states     default, hover (bg sidebar-active/10), active (bg sidebar-active, text on-accent, barra 3px à esquerda), expanded, focus-visible (ring accent)
tokens     text on-sidebar, muted sidebar-muted, ícones Lucide 18px
a11y       <nav aria-label="Ferramentas">; submenu com aria-expanded; aria-current="page" no ativo; navegável por teclado
usado em   todas
```

## TopBar
```
conteúdo   ícones (novidades, módulos, e-mail, configurações, ajuda) + links Atendimento/Planos + menu do usuário (e-mail + dropdown)
states     ícone default/hover/focus; dropdown aberto/fechado
a11y       botões reais; menu com roving tabindex; ícones com aria-label
usado em   todas
```

## Button
```
variants   primary (bg accent), cta (bg cta — verde, ação de criar "Adicionar"), secondary (bg surface, border), ghost, danger (bg danger)
sizes      sm 32px, md 40px, lg 48px
states     default, hover (escurece 8%), active, focus-visible (ring 2px accent, offset 2px), disabled (opacity 50%, sem pointer), loading (spinner + mantém label p/ leitor de tela)
tokens     radius md, font sm/600
a11y       <button> real; loading → aria-busy; ícone-só → aria-label
usado em   todas (Adicionar=cta; Buscar=primary; Cancelar=secondary; excluir=danger)
```

## Input / Select / Textarea / DatePicker / MoneyInput
```
variants   text, select, textarea, date (dd/mm/aaaa), money (R$ centavos), checkbox, radio, multiselect (advogados/partes)
states     default (border border-input), hover, focus (border accent + ring), filled, error (border danger + mensagem), disabled, readonly
tokens     radius sm, altura 40px, label sm/600 muted, help/error xs
a11y       <label for>; aria-invalid + aria-describedby no erro; date com entrada por teclado; money sem perder máscara p/ leitor
usado em   S03a, S04a, S07a, filtros
padrão especial  "Select com Adicionar inline" (cria lookup sem sair do form) e "campos repetíveis" (e-mails/telefones/endereços: linha + botão adicionar/remover)
```

## Page header + Toolbar de ações
```
conteúdo   título + subtítulo ("Exibindo N resultado(s)") + ações à direita (Adicionar, Importar, etc.)
states     —
usado em   todas as listas (S03,S04,S05,S07,S08,S15)
```

## FilterBar
```
conteúdo   selects + inputs + botão Buscar; link "Filtros personalizados"
states     colapsado/expandido; filtro aplicado (chip removível)
a11y       <form role="search">; cada filtro rotulado
usado em   S03,S04,S07,S08,S09
```

## DataTable / List
```
conteúdo   cabeçalho ordenável + linhas + ações por linha + paginação
states     loading (skeleton), empty (ver EmptyState), erro, com dados, seleção múltipla
a11y       <table> semântico; sort com aria-sort; ações por linha acessíveis por teclado
usado em   S03,S04,S05,S07,S08,S15
```

## EmptyState
```
conteúdo   texto curto + CTA ("Você ainda não cadastrou..." → reescrever fresco) + link p/ ajuda
variants   lista vazia, pasta vazia, sem resultados de filtro
usado em   todas as listas, GED, agenda
```

## MetricCard (dashboard)
```
conteúdo   ícone + número + label
states     zero/empty, com valor, loading (skeleton)
tokens     surface, shadow card, radius md
usado em   S02
```

## Chart
```
tipos      barras (receitas 12m), linhas, pizza (estatísticas)
lib        Recharts (ou Visx)
states     vazio ("sem dados no período"), loading, com dados
a11y       título + tabela alternativa p/ leitor; não depender só de cor
usado em   S02, S07(Gráficos), S10
```

## Calendar (Agenda)
```
views      Mês / Semana / Dia + Modo lista
conteúdo   grade horária, "dia inteiro", eventos coloridos por tipo, filtro por advogado
states     vazio, com eventos, criar (click no slot)
a11y       navegação por teclado entre dias; eventos como botões; não só cor p/ tipo
usado em   S06
```

## KanbanBoard (Workflow)
```
estrutura  quadro > colunas > cards (tarefas); + Quadro, + Coluna, + Tarefa
interação  drag-and-drop (dnd-kit) + alternativa por teclado (mover p/ coluna via menu)
states     vazio, com cards, arrastando, loading
a11y       dnd acessível (anúncios aria-live); cada card é foco
usado em   S16
```

## Modal / Drawer / ConfirmDialog
```
variants   modal (form), drawer lateral (detalhe), confirm (excluir)
states     aberto/fechado, loading no submit
a11y       foco preso (focus trap), Esc fecha, retorna foco ao gatilho, role=dialog aria-modal
usado em   excluir, ações rápidas, detalhes
```

## Toast / Alert / Banner
```
variants   success, danger, warning, info; banner de upsell (plano) com CTA
states     auto-dismiss, persistente, com ação
a11y       aria-live=polite (toast) / assertive (erro)
usado em   feedback de salvar, gating de plano (S02, Diário Oficial)
```

## FileManager (GED)
```
conteúdo   árvore de pastas + grid/lista + toolbar (nova pasta, upload, compartilhar, excluir, info) + barra de uso (cota)
states     pasta vazia, enviando (progresso), erro de tamanho/cota, compartilhado
a11y       árvore com role=tree; upload com input acessível
usado em   S13
```

## Tabs / Badge / StatusPill
```
badge/pill cores por status: processo (ativo/suspenso/baixado), SAC (em dia/expirando/expirado/finalizado), financeiro (aberto/pago)
regra      nunca só cor — texto + cor; usar success/warning/danger/muted
usado em   listas, detalhes
```

---

## Checklist de acessibilidade (todas)
- Foco visível em tudo (ring 2px accent, offset 2px) — já no `tokens.css`.
- Alvos de toque ≥ 40px.
- Contraste AA garantido (ver relatório `contrast.py` — 0 falhas).
- Nada depende só de cor (status sempre com rótulo/ícone).
- Teclado completo; leitores de tela com rótulos e estados (aria-*).
- Respeitar `prefers-reduced-motion` nas transições.

## Próximo passo de design
Construir as primitivas (Button, Input, Select, Card, Table, Modal, Sidebar, TopBar) numa rota `/design`, tirar screenshot e comparar com `replica/screens/`. Depois: **`/replica-build`**.
