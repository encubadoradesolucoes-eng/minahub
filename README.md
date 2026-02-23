# MineHub

Sistema de gestão de mineração e finanças: projetos, extração, equipamentos, contas a pagar/receber, financiamentos e fluxo de caixa. **Funciona como SaaS:** empresas ou exploradores precisam se cadastrar e o uso é mediante **licença** (trial, básico, profissional, empresarial).

## Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, RLS)

## Modelo SaaS

- **Cadastro:** cada empresa ou explorador individual cria sua conta (empresa) no primeiro acesso; o usuário é vinculado à empresa.
- **Licença:** cada empresa tem uma licença (trial, básico, profissional, empresarial, custom). Sem licença ativa, o acesso ao dashboard é bloqueado.
- **Trial:** ao completar o cadastro (criar empresa), é atribuída automaticamente uma licença **trial** (ex.: 30 dias). Após isso, é necessário renovar ou contratar um plano.
- **Multi-tenant:** dados (projetos, extração, etc.) são filtrados por empresa; o usuário só vê o que pertence às empresas em que está vinculado.

## Setup

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No SQL Editor, execute as migrations em ordem (pasta `supabase/migrations/`):
   - `20250222000000_mining_finance_schema.sql`
   - `20250222000001_mining_finance_rls.sql`
   - `20250222000002_mining_finance_views.sql`
   - `20250222000003_mining_finance_depreciacao.sql`
   - `20250222000004_mining_finance_alerta_caixa.sql`
   - `20250222000005_rls_projetos_null_empresa.sql`
   - `20250222100000_planejamento_missao.sql` (planejamento de missão)
   - `20250222110000_saas_licencas.sql` (licenças SaaS)
   - `20250222120000_projetos_obrigatorio_empresa.sql` (projetos sempre com empresa)
3. Em **Authentication → URL Configuration**, adicione a URL do app (ex: `http://localhost:3000`) em **Redirect URLs**.

### 2. App

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com as credenciais do Supabase:

- `NEXT_PUBLIC_SUPABASE_URL` = URL do projeto
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = chave anon (public)

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). Crie uma conta em **Cadastrar**, faça login e **complete o cadastro** (criar empresa ou perfil de explorador); uma licença trial será ativada automaticamente.

### 3. Multi-tenancy e licenças

- O cadastro inicial cria uma **empresa** (ou perfil explorador) e uma **licença trial**; o usuário fica vinculado em `user_empresas`.
- Para restringir projetos por empresa, defina `empresa_id` nos projetos.
- Para renovar ou criar licenças (além do trial), insira em `mining_finance.licencas` (empresa_id, plano, data_fim, ativo). Uma empresa pode ter apenas uma licença ativa por vez.
- Defina o role do usuário em **Authentication → Users → User Metadata**: `{"role": "gerente_financeiro"}` ou `"operador"` / `"gerente_producao"` conforme as políticas RLS.

## Estrutura

- `app/` – rotas e páginas (login, signup, dashboard, projetos, extração, equipamentos, contas, financiamentos)
- `lib/supabase/` – cliente Supabase (browser, server, middleware)
- `types/database.ts` – tipos TypeScript do schema
- `supabase/migrations/` – schema, RLS, views e funções

## Scripts

- `npm run dev` – desenvolvimento
- `npm run build` – build de produção
- `npm run start` – servidor de produção
- `npm run lint` – ESLint
