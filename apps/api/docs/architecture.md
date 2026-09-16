# API Architecture

## Overview
The API is built with [Hono](https://hono.dev) and runs on the **Cloudflare Workers** edge runtime (via Wrangler). Billing/auth with **Clerk**, PostgreSQL via **Neon**, queries with **Drizzle ORM**, validation with **Zod**. Schemas compartilhados vivem em `@caixa1/shared`.

Runtime pattern: a `Pool` de Neon é criado por requisição (`withDb`) e descartado ao final — **nenhum estado de conexão sobrevive entre requisições**, não guardar estado no módulo.

## Request Lifecycle
1. `requestLogger` — gera `requestId` e loga entrada/saída.
2. `errorHandler` — captura `ZodError` e `HTTPException` e converte no envelope de erro padrão.
3. `cors` — origens permitidas em dev (`localhost:5173/5174/5175`).
4. `withDb` — injeta `c.var.db` (Pool do Neon + Drizzle).
5. Rota — aplica `requireAuth` (JWT Clerk) e delega ao service; o service usa `resolveUserId` para resolver `clerk_id → UUID interno` (cria usuário + categorias padrão no primeiro acesso).

`requireAuth` é **por rota**, não global — o único endpoint público é `GET /health` (liveness, sem DB e sem Clerk).

## Structure

### `src/bindings.ts`
Tipos das env bindings: `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`.

### `src/lib/context.ts`
Tipagem do contexto Hono (`AppContext`): `Bindings` (env) e `Variables` (`db`, `userId`, `requestId`).

### `src/lib/`
- `auth.ts` — `resolveUserId(db, clerkId, clerkEmail?)`: lookup por `clerk_id`; se não existir, cria o usuário + categorias padrão (lazy). Retry para corrida de criação.
- `csv.ts` — serialização CSV com BOM UTF-8, CRLF e escaping de aspas/vírgulas.
- `db.ts` — `createDbFromBindings(env)`: `Pool` do Neon via Drizzle (drizzle-orm/serverless).
- `errors.ts` — fábricas de `HTTPException`: `notFound` (404), `forbidden` (403), `conflict` (409), `badRequest` (400).
- `ownership.ts` — asserts de escopo por usuário (`assertAccountOwnership`, `assertCategoryOwnership`): todo acesso filtra por `userId`.
- `validate.ts` — `parseBody` / `parseQuery` / `parseParams` com Zod (transformam falha em `ZodError`, capturado pelo `errorHandler`).

### `src/middleware/`
- `auth.ts` — `requireAuth`: valida `Authorization: Bearer <jwt>` com `verifyToken` do Clerk; injeta `c.var.userId` = `sub` do token.
- `db.ts` — `withDb`: cria o pool a partir das bindings e injeta em `c.var.db`.
- `error.ts` — `errorHandler`: envelope `{ error: { code, message, details? } }`; `details` apenas em `VALIDATION_ERROR` (flatten do Zod).
- `logger.ts` — `requestLogger`: `requestId` + log de método/caminho/status/duração.

### `src/routes/`
Cada recurso é um router Hono separado; os handlers capturam `db`/`userId` do contexto, fazem parse, chamam o service e respondem JSON.

- `health.ts` — `GET /health` (público).
- `accounts.ts` — CRUD + `/:id/archive` e `/:id/unarchive`. O saldo é a coluna `accounts.balance` (mantida pelo trigger no banco), devolvida nas respostas — não há endpoint dedicado.
- `categories.ts` — CRUD + `/:id/archive` e `/:id/unarchive`.
- `transactions.ts` — `GET /summary`, `POST /`, `GET /`, `GET/PATCH/:id`, `POST /:id/archive`, `POST /:id/unarchive`, `DELETE /:id`.
- `journal.ts` — `GET /export`, `GET /`, `GET /:id` (read-only).

**Regra de ordem obrigatória**: rotas estáticas antes de `/:id` — `/transactions/summary` vem antes de `/transactions/:id`; `/journal/export` antes de `/journal/:id`. O Hono resolve por ordem de registro.

### `src/services/`
Regra de negócio. Sempre recebem `db` + `userId` explícitos (nenhum estado no módulo).

- `accounts.ts` — criação com `initialBalance` via transação "Saldo inicial" (categoria de sistema, lazy); arquivar/desarquivar/excluir (arquivar exige saldo zerado; deletar só arquivada, protegido por FK quando há transações vinculadas).
- `categories.ts` — CRUD; categorias de sistema (`is_system`) protegidas de edição/exclusão; `getSystemCategoryId` resolve/cria a categoria de sistema sob demanda.
- `transactions.ts` — create/list/get/update/archive/unarchive/delete + `getSummary`. Transferências validam contas diferentes, não têm categoria, e as contas da transferência não podem ser alteradas (arquive e recrie). Delete permanent só de transação arquivada.
- `journal.ts` — list/get/export, read-only, com filtros por conta/categoria/tipo/período/busca e paginação.

## Database

Schema Drizzle em `packages/db/src/schema/` (tabelas `users`, `accounts`, `categories`, `transactions`). Migrações em `packages/db/drizzle/migrations/`:

- **0000** — estrutura base (PKs uuid, FKs, índices, CHECKs de `transactions`, unique `user+name+type` de `categories`).
- **0001** — tentativa descartada: funções `calculate_signed_amount(UUID)`/`calculate_running_balance(UUID)`, função de trigger `update_journal_balance_func()` (sem parâmetros — requisito do PostgreSQL para `CREATE TRIGGER`), view `journal` e trigger `update_journal_balance`. Descarte por dois defeitos: o trigger tentava `UPDATE journal` (uma VIEW, com LEFT JOIN → não auto-updatable, falha em runtime) e funções com lógica incorreta de transferência. **Tudo isso é dropado na 0002**.
- **0002** — implementação real da semântica (não é só limpeza):
  - dropa os triggers/funções/view da 0001 (`DROP VIEW IF EXISTS journal CASCADE` antes dos `DROP FUNCTION`);
  - cria `update_account_balance_func()` — trigger com **guarda de transição** `NOT OLD.is_archived` / `NOT NEW.is_archived`, revertendo o efeito do OLD e aplicando o do NEW (arquivar reverte, desarquivar reaplica, edição de valor aplica só o delta);
  - cria o trigger `trg_account_balance` (AFTER INSERT/UPDATE/DELETE);
  - recria a view `journal` por conta: `UNION ALL` de entries (`income`/`expense` direto; transferência como `-out` na origem e `-in` no destino) com `SUM() OVER (PARTITION BY user_id, account_id)` para o saldo acumulado, filtrada por `is_archived = false`;
  - healing: recalcula `accounts.balance` a partir das transações não arquivadas.
- **0003** — `categories.is_system` (drift do schema corrigido).

### Semântica do saldo e do journal (Decisão A)
- A view `journal` consolida as transações com **valor assinado** (`+` receita, `-` despesa; transferência gera **duas entries**: `<txId>-out` na origem e `<txId>-in` no destino) e **saldo acumulado por conta** (`SUM() OVER` por `user_id, account_id`). A view é computada na leitura — sempre reflete o estado atual.
- **Arquivar uma transação reverte o efeito no saldo e a remove do journal**; desarquivar reaplica. A guarda do trigger (`NOT OLD.is_archived` / `NOT NEW.is_archived` em `update_account_balance_func`) garante isso: a transição false→true só reverte o OLD e não aplica o NEW; true→false só aplica o NEW, não reverte o OLD.
- `accounts.balance` é materializado pelo trigger `trg_account_balance`; a fonte de verdade é a tabela `transactions`.

### Cuidados com migrações (Workers + Neon)
- Funções usadas em `CREATE TRIGGER` são resolvidas **por nome com lista de args nula** — nunca `EXECUTE FUNCTION f(col)`; usar `f()` com `NEW` no corpo. Erros típicos: `syntax error at or near "."` (position aponta pro `.` de `NEW.id`) e `function f(text) does not exist` (42883).
- Statements múltiplos exigem `--> statement-breakpoint` (o drizzle-kit executa chunk a chunk dentro de uma transação).
- Driver top-level `neon()` não aceita multi-statement; usar `Pool` para isso.

## Error Envelope

```json
{
  "error": {
    "code": "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "HTTP_ERROR" | "INTERNAL_ERROR",
    "message": "descrição",
    "details": { ... }
  }
}
```

## Autenticação
JWT do Clerk via `Authorization: Bearer <token>`. `sub` → `resolveUserId` → UUID interno. Sem estado de sessão na API; a verificação usa `CLERK_SECRET_KEY` a cada request.

## Tech Stack
- **Framework:** Hono
- **Runtime:** Cloudflare Workers (via Wrangler, compat `nodejs_compat`)
- **Database:** Neon PostgreSQL (via `@caixa1/db`)
- **ORM:** Drizzle ORM
- **Auth:** Clerk (`@clerk/backend`)
- **Validation:** Zod (`@caixa1/shared`)

## Referências
- `apps/api/README.md` — setup, comandos, endpoints.
- `apps/api/test/auth.http` — coleção REST Client de exemplos autenticados.
- `apps/api/docs/dev-log.md` — histórico de decisões e erros comuns (Fase 0 e 1).