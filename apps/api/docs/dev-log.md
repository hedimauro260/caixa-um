# API Development Log

## Phase 0 - Monorepo Setup
- Initialized Hono API structure.
- Configured `wrangler.toml` for Cloudflare Workers deployment.
- Added `GET /health` endpoint returning service status.
- Configured CORS middleware.

## Phase 1 - Core Resources (Accounts, Categories, Transactions, Journal)

### Database
- Schema Drizzle em `packages/db/src/schema/`: `users`, `accounts`, `categories`, `transactions` + view `journal`.
- Migrações em `packages/db/drizzle/migrations/`:
  - `0000`: estrutura base (PKs uuid, FKs com cascade/restrict, índices, CHECKs de `transactions`, unique nome+type por usuário em `categories`).
  - `0001`: tentativa descartada — funções `calculate_signed_amount(UUID)`/`calculate_running_balance(UUID)`, função de trigger `update_journal_balance_func()`, view `journal` e trigger `update_journal_balance`. Defeitos: o trigger tentava `UPDATE journal` (uma VIEW com LEFT JOIN → não auto-updatable, falha em runtime) e lógica incorreta de transferência nas funções. **Tudo dropado na 0002**.
  - `0002`: implementação real — drop do que a 0001 criou (`DROP VIEW IF EXISTS journal CASCADE` antes dos drops de função); `update_account_balance_func()` com **guarda de transição** (`NOT OLD.is_archived` reverte, `NOT NEW.is_archived` aplica), trigger `trg_account_balance` (AFTER INSERT/UPDATE/DELETE); view `journal` por conta (UNION ALL das entries `-out`/`-in` + `SUM() OVER (PARTITION BY user_id, account_id)`); healing que recalcula `accounts.balance` a partir das transações não arquivadas.
  - `0003`: `categories.is_system` (drift do schema corrigido após o 0000 estar aplicado).
- Correção crítica (comum a Workers/Neon): função usada em `CREATE TRIGGER` é resolvida **por nome com lista de args NULA** — nunca chamar `EXECUTE FUNCTION calc(NEW.id)`; usar função `f()` com `NEW` interno e, se necessário, `NEW.id` via `TG_ARGV`/coluna. Erro típico: `syntax error at or near "."` / `function f() does not exist` (42883).
- Migrações multi-statement exigem `--> statement-breakpoint` (o drizzle-kit executa chunk a chunk).
- `db:migrate` validado contra Neon dev e o estado do schema conferido via queries manuais (rollback em transação, sem dados residuais).

### API
- Middlewares globais no `src/index.ts` (ordem): `requestLogger` → `errorHandler` (envelope `{error:{code,message,details?}}`) → `cors` → `withDb`. **`requireAuth` é por rota** (único público: `GET /health`).
- Autenticação: `src/middleware/auth.ts` valida Bearer JWT do Clerk; `resolveUserId` mapeia `sub` → UUID interno, criando o usuário + categorias padrão no primeiro acesso.
- Regra de ordenação de rotas: estáticas antes de `/:id` — `/transactions/summary` e `/journal/export` registrados antes dos `:id` correspondentes.
- Services em `src/services/`:
  - `accounts`: criação com `initialBalance` via transação "Saldo inicial" (categoria de sistema), arquivar/desarquivar/excluir, consulta de saldo.
  - `categories`: CRUD, categorias de sistema protegidas de exclusão/edição.
  - `transactions`: create/list/get/update/archive/unarchive/delete + `summary` por período/atividade. Transfer grava a transação (com ambas contas) e a view/trigger reflete nos dois lados.
  - `journal`: list/get/export readonly; export CSV com BOM UTF-8, CRLF e headers `X-Total-Count`, `X-Export-Count`, `X-Truncated`.
- Semântica confirmada no banco: receita `+`, despesa `-`, transfer `-out` na origem e `-in` no destino; saldo acumulado por conta na view; **arquivar transação reverte o efeito no saldo e a remove do journal** (decisão A).

#### Evidência de regressão — fluxo arquivar/desarquivar (Decisão A)
Validação direta no banco (Neon dev, transação com `ROLLBACK`, sem dados residuais) do trigger `trg_account_balance`/`update_account_balance_func` e da view `journal`:

| Passo | Saldo CC | Resultado |
| --- | --- | --- |
| income 100 + expense 40 | 60.00 | PASS |
| arquivar income (false→true) | -40.00 | PASS (reverteu, não anulou) |
| journal esconde a arquivada | entries = 0 | PASS |
| desarquivar income (true→false) | 60.00 | PASS (reaplicou, não reverteu) |
| editar expense 40→30 | 70.00 | PASS (delta -10, sem double-count) |

Confirma matematicamente a guarda de transição `NOT OLD.is_archived` / `NOT NEW.is_archived` (0002) — o trigger não é um "reverter OLD + aplicar NEW" ingênuo; ele detecta a mudança de estado de arquivamento.

### Validação
- `pnpm typecheck`, `pnpm lint` e `pnpm build` passam em todos os pacotes.
- Scripts de verificação temporária removidos (seed com rollback, sem dados residuais no banco).
- Coleção de requisições: `test/auth.http` (REST Client), preenchendo `@token` com JWT do Clerk.

### Erros comuns encontrados
- `function f(text) does not exist` (42883) em CREATE TRIGGER → função de trigger sem parâmetros.
- `cannot insert multiple commands into a prepared statement` no driver top-level `neon()` → usar `Pool` para multi-statement.
- `Set-Content -Encoding UTF8` do PowerShell grava BOM → remover do `.sql` para o drizzle-kit não quebrar no primeiro statement.
