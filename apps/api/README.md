# caixa-um API

API HTTP do **caixa-um** (controle financeiro pessoal).

Stack: [Hono](https://hono.dev) + [Cloudflare Workers](https://developers.cloudflare.com/workers/) (edge runtime) + [Neon](https://neon.tech) (PostgreSQL) + [Drizzle ORM](https://orm.drizzle.team) + [Clerk](https://clerk.com) (autenticação).

## Pré-requisitos

- Node.js >= 20
- pnpm 9
- Conta Neon (banco PostgreSQL) e aplicação Clerk (JWT)

## Setup

1. Instale as dependências na raiz do monorepo:

   ```sh
   pnpm install
   ```

2. Configure o Cloudflare Secrets/bindings. Em desenvolvimento, crie o arquivo local `apps/api/.dev.vars` (não versionado):

   ```sh
   DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
   CLERK_SECRET_KEY="sk_test_..."
   CLERK_PUBLISHABLE_KEY="pk_test_..."
   ```

   Em produção, use `pnpm --filter @caixa1/api deploy -- --secret DATABASE_URL ...` ou o painel da Cloudflare.

3. Aplique as migrações no banco (a partir de `packages/db`):

   ```sh
   cd packages/db
   # leia DATABASE_URL do .env e exporte no ambiente antes de rodar
   pnpm db:migrate
   cd ../..
   ```

## Comandos

| Comando | Descrição |
| --- | --- |
| `pnpm --filter @caixa1/api dev` | Sobe `wrangler dev` na porta **8787** (lê `.dev.vars`) |
| `pnpm --filter @caixa1/api deploy` | Faz deploy do Worker |
| `pnpm typecheck` | TypeScript em todos os pacotes |
| `pnpm lint` | ESLint em todos os pacotes |

> O `apps/api` não possui script `build` próprio — o código é compilado on-the-fly pelo runtime da Workers (compatibility `nodejs_compat`).

## Arquitetura

```
src/
  bindings.ts        # tipos das env bindings (DATABASE_URL, CLERK_*)
  index.ts           # bootstrap do Hono: middlewares globais + mount dos routers
  lib/
    context.ts       # tipagem do Hono (Bindings + Variables: db, userId, requestId)
    auth.ts          # resolveUserId: mapeia clerk_id → user internal (cria on first run + categorias padrão)
    csv.ts           # serialização CSV (BOM UTF-8, CRLF, aspas escapadas)
    db.ts            # createDbFromBindings: Pool do Neon via Drizzle
    errors.ts        # fábricas de HTTPException (404/403/409/400)
    ownership.ts     # escopo de queries por user
    validate.ts      # parseBody / parseQuery / parseParams com zod
  middleware/
    auth.ts          # requireAuth: valida Bearer JWT do Clerk (POR ROTA)
    db.ts            # withDb: injeta c.var.db (GLOBAL)
    error.ts         # errorHandler: envelope JSON padronizado (GLOBAL)
    logger.ts        # requestLogger: requestId + logs (GLOBAL)
  routes/            # routers Hono (health, accounts, categories, transactions, journal)
  services/          # regra de negócio (accounts, categories, transactions, journal)
```

Princípios:

- **`withDb` global**, `requireAuth` por rota — `/health` é público e não precisa de Clerk.
- Nenhum estado de conexão no módulo; o pool é criado e descartado por requisição.
- **Regra de rota estática antes de `/:id`**: `/transactions/summary` vem antes de `/transactions/:id`; `/journal/export` antes de `/journal/:id`.
- Erros sempre no envelope `{ "error": { code, message, details? } }`.

## Autenticação

Envie o JWT do Clerk em toda requisição autenticada:

```
Authorization: Bearer <jawt-do-clerk>
```

O `userId` da aplicação (UUID interno) é resolvido a partir do `sub` do token. No primeiro acesso, o usuário é criado automaticamente com as categorias padrão.

## Endpoints

Base local: `http://localhost:8787`

### `GET /health` — público

```json
{ "ok": true, "service": "caixa1-api", "timestamp": "..." }
```

### Accounts

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/accounts` | Lista contas (filtro por arquivadas) |
| POST | `/accounts` | Cria conta |
| GET | `/accounts/:id` | Busca conta por ID |
| PATCH | `/accounts/:id` | Atualiza conta |
| POST | `/accounts/:id/archive` | Arquivar conta |
| POST | `/accounts/:id/unarchive` | Desarquivar conta |
| DELETE | `/accounts/:id` | Exclui conta (hard delete) |

> O saldo de uma conta é a coluna `accounts.balance`, mantida pelo trigger `trg_account_balance` a cada mutação de transação. Não há endpoint dedicado de saldo — ele vem junto nas respostas de account.

### Categories

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/categories` | Lista categorias |
| POST | `/categories` | Cria categoria |
| PATCH | `/categories/:id` | Atualiza categoria |
| DELETE | `/categories/:id` | Exclui categoria |

### Transactions

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/transactions/summary` | Resumo por período (receitas/despesas/líquido por conta) |
| POST | `/transactions` | Cria transação (income/expense/transfer) |
| GET | `/transactions` | Lista transações (filtros paginados) |
| GET | `/transactions/:id` | Busca transação por ID |
| PATCH | `/transactions/:id` | Atualiza transação |
| POST | `/transactions/:id/archive` | Arquivar (reverte o efeito no saldo) |
| POST | `/transactions/:id/unarchive` | Desarquivar (reaplica o efeito no saldo) |
| DELETE | `/transactions/:id` | Exclui transação |

### Journal

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/journal/export` | CSV do journal (antes de `/:id`) |
| GET | `/journal` | Lista entries do journal (view consolidada) |
| GET | `/journal/:id` | Entry por ID |

O journal é **read-only** (view). A fonte de verdade é a tabela `transactions`; o saldo acumulado por conta é mantido pelo trigger `trg_account_balance` no banco.

### Envelope de erro

```json
{
  "error": {
    "code": "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "HTTP_ERROR" | "INTERNAL_ERROR",
    "message": "descrição",
    "details": { ... } // apenas em VALIDATION_ERROR
  }
}
```

## Testando a API

- `test/auth.http` — coleção de requisições para a extensão *REST Client* do VS Code (ou use `curl`/`httpie`). Preencha `@token` com um JWT de sessão do Clerk.
- Para validar as migrações e a semântica do banco diretamente, veja `docs/dev-log.md` (fase 1).

## Banco

- Migrações/ddl: `packages/db/drizzle/migrations/` (drizzle-kit). A 0001 foi uma tentativa descartada (trigger fazia `UPDATE` numa view); a **0002 implementa de fato** o trigger de saldo (`trg_account_balance` + `update_account_balance_func`) e a view `journal` por conta com saldo acumulado — arquivar reverte o efeito no saldo e remove do journal (Decisão A). A 0003 adiciona `categories.is_system`.
- `packages/db/.env` guarda a `DATABASE_URL` local usada pelo `pnpm db:migrate` — **não versionar**.