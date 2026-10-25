# MaisJurídico — clone (clean-room)

Software jurídico reconstruído a partir do blueprint em `replica/`.
Stack: Next.js (App Router) + TypeScript + Tailwind. Camada de dados **fake** (seed em memória) até o `/replica-backend` ligar o Postgres.

## Rodar

```bash
npm install
npm run dev
```

Abre em http://localhost:3000 → redireciona para `/dashboard`.

## Estrutura

- `app/` — rotas (uma por tela do recon)
- `components/ui/` — primitivas do design system (Button, Input, Card, …)
- `components/AppShell.tsx` — sidebar + topbar
- `lib/data.ts` — camada de dados (fake; assinaturas iguais às do `architecture.md`)
- `lib/seed.ts` — dados de exemplo
- `replica/` — blueprint (recon, arquitetura, schema, design)

> Clean-room: nada de código/HTML/CSS/imagens do original. Cópias de tela em `replica/screens/` são só referência.
